/**
 * MFAService 단위 테스트
 * 다중 인증(MFA) 관련 기능 테스트
 */
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

import { Prisma } from '@editor/database';
import { AuthError } from '@editor/types';

import { MFAService } from '../MFAService';

// 모킹
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@editor/database', () => ({
  getPrisma: jest.fn(() => mockPrismaClient),
  Prisma: {
    JsonNull: Symbol('JsonNull'),
  },
}));

jest.mock('speakeasy');
jest.mock('qrcode');

const mockPrisma = mockPrismaClient;
const mockSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy> & {
  totp: {
    verify: jest.MockedFunction<typeof speakeasy.totp.verify>;
  };
};
const _mockQRCode = QRCode as jest.Mocked<typeof QRCode>;

describe('MFAService', () => {
  let mfaService: MFAService;

  beforeEach(() => {
    mfaService = new MFAService();
    jest.clearAllMocks();
  });

  describe('setupMFA', () => {
    it('should setup MFA for user', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url:
          'otpauth://totp/Collaborative%20Editor%20(test@example.com)?secret=JBSWY3DPEHPK3PXP&issuer=Collaborative%20Editor',
      };

      const mockQRCode = 'data:image/png;base64,mock-qr-code';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockSpeakeasy.generateSecret.mockReturnValue(mockSecret as never);
      (
        _mockQRCode as unknown as { toDataURL: jest.Mock }
      ).toDataURL.mockResolvedValue(mockQRCode);
      mockPrisma.user.update.mockResolvedValue({} as never);

      // Act
      const result = await mfaService.setupMFA(userId);

      // Assert
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.qrCode).toBe(mockQRCode);
      expect(result.backupCodes).toHaveLength(8);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          mfaSecret: 'JBSWY3DPEHPK3PXP',
          mfaBackupCodes: expect.any(Array),
        },
      });
    });

    it('should throw AuthError for non-existent user', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(mfaService.setupMFA(userId)).rejects.toThrow(AuthError);
      await expect(mfaService.setupMFA(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.'
      );
    });
  });

  describe('enableMFA', () => {
    it('should enable MFA with valid token', async () => {
      // Arrange
      const userId = 'user-1';
      const token = '123456';
      const mockUser = {
        id: userId,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      mockPrisma.user.update.mockResolvedValue({} as never);

      // Act
      const result = await mfaService.enableMFA(userId, token);

      // Assert
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'JBSWY3DPEHPK3PXP',
        encoding: 'base32',
        token,
        window: 2,
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { mfaEnabled: true },
      });
    });

    it('should throw AuthError for user without MFA secret', async () => {
      // Arrange
      const userId = 'user-1';
      const token = '123456';
      const mockUser = {
        id: userId,
        mfaSecret: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(mfaService.enableMFA(userId, token)).rejects.toThrow(
        AuthError
      );
      await expect(mfaService.enableMFA(userId, token)).rejects.toThrow(
        'MFA 설정이 완료되지 않았습니다.'
      );
    });

    it('should throw AuthError for invalid token', async () => {
      // Arrange
      const userId = 'user-1';
      const token = 'invalid';
      const mockUser = {
        id: userId,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockSpeakeasy.totp.verify.mockReturnValue(false);

      // Act & Assert
      await expect(mfaService.enableMFA(userId, token)).rejects.toThrow(
        AuthError
      );
      await expect(mfaService.enableMFA(userId, token)).rejects.toThrow(
        'MFA 토큰이 올바르지 않습니다.'
      );
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA for user', async () => {
      // Arrange
      const userId = 'user-1';
      mockPrisma.user.update.mockResolvedValue({} as never);

      // Act
      const result = await mfaService.disableMFA(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaBackupCodes: Prisma.JsonNull,
        },
      });
    });

    it('should handle disableMFA error', async () => {
      // Arrange
      const userId = 'user-1';
      const testError = new Error('Database connection failed');
      mockPrisma.user.update.mockRejectedValue(testError);

      // Act & Assert
      await expect(mfaService.disableMFA(userId)).rejects.toThrow(AuthError);
      await expect(mfaService.disableMFA(userId)).rejects.toThrow(
        'MFA 비활성화에 실패했습니다.'
      );
    });
  });

  describe('verifyMFA', () => {
    it('should verify valid MFA token', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = '123456';
      mockSpeakeasy.totp.verify.mockReturnValue(true);

      // Act
      const result = mfaService.verifyMFA(secret, token);

      // Assert
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });
    });

    it('should return false for invalid MFA token', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = 'invalid';
      mockSpeakeasy.totp.verify.mockReturnValue(false);

      // Act
      const result = mfaService.verifyMFA(secret, token);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false on verification error', () => {
      // Arrange
      const secret = 'invalid-secret';
      const token = '123456';
      mockSpeakeasy.totp.verify.mockImplementation(() => {
        throw new Error('Invalid secret');
      });

      // Act
      const result = mfaService.verifyMFA(secret, token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify valid backup code', async () => {
      // Arrange
      const userId = 'user-1';
      const backupCode = 'ABC12345';
      const mockUser = {
        mfaBackupCodes: ['ABC12345', 'DEF67890', 'GHI11111'],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({} as never);

      // Act
      const result = await mfaService.verifyBackupCode(userId, backupCode);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { mfaBackupCodes: ['DEF67890', 'GHI11111'] },
      });
    });

    it('should return false for invalid backup code', async () => {
      // Arrange
      const userId = 'user-1';
      const backupCode = 'INVALID';
      const mockUser = {
        mfaBackupCodes: ['ABC12345', 'DEF67890', 'GHI11111'],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await mfaService.verifyBackupCode(userId, backupCode);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for user without backup codes', async () => {
      // Arrange
      const userId = 'user-1';
      const backupCode = 'ABC12345';
      const mockUser = {
        mfaBackupCodes: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await mfaService.verifyBackupCode(userId, backupCode);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes for MFA-enabled user', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        mfaEnabled: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({} as never);

      // Act
      const result = await mfaService.regenerateBackupCodes(userId);

      // Assert
      expect(result).toHaveLength(8);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { mfaBackupCodes: expect.any(Array) },
      });
    });

    it('should throw AuthError for non-MFA-enabled user', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        mfaEnabled: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(mfaService.regenerateBackupCodes(userId)).rejects.toThrow(
        AuthError
      );
      await expect(mfaService.regenerateBackupCodes(userId)).rejects.toThrow(
        'MFA가 활성화되지 않았습니다.'
      );
    });
  });

  describe('getMFAStatus', () => {
    it('should return MFA status for user', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        mfaEnabled: true,
        mfaBackupCodes: ['ABC12345', 'DEF67890'],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await mfaService.getMFAStatus(userId);

      // Assert
      expect(result).toEqual({
        enabled: true,
        hasBackupCodes: true,
        backupCodesCount: 2,
      });
    });

    it('should throw AuthError for non-existent user', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(mfaService.getMFAStatus(userId)).rejects.toThrow(AuthError);
      await expect(mfaService.getMFAStatus(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.'
      );
    });
  });

  describe('generateTestToken', () => {
    it('should generate test token for secret', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP';
      const mockToken = '123456';
      mockSpeakeasy.totp.mockReturnValue(mockToken);

      // Act
      const result = mfaService.generateTestToken(secret);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockSpeakeasy.totp).toHaveBeenCalledWith({
        secret,
        encoding: 'base32',
      });
    });
  });
});
