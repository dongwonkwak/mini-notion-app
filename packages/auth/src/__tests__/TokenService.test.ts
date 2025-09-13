/**
 * TokenService 단위 테스트
 * JWT 토큰 생성, 검증, 관리 테스트
 */

import { TokenService } from '../TokenService';
import jwt from 'jsonwebtoken';
import { AuthError } from '@editor/types';

// 모킹
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('TokenService', () => {
  let tokenService: TokenService;
  const mockSecret = 'test-secret';

  beforeEach(() => {
    tokenService = new TokenService(mockSecret);
    jest.clearAllMocks();
  });

  describe('generateJWT', () => {
    it('should generate valid JWT token', async () => {
      // Arrange
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
        workspaceId: 'workspace-1',
      };

      mockJwt.sign.mockReturnValue('mock-jwt-token' as never);

      // Act
      const token = await tokenService.generateJWT(payload);

      // Assert
      expect(token).toBe('mock-jwt-token');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          workspaceId: payload.workspaceId,
        },
        mockSecret,
        {
          expiresIn: '30d',
          issuer: 'collaborative-editor',
          audience: 'collaborative-editor-users',
        }
      );
    });

    it('should throw AuthError on JWT generation failure', async () => {
      // Arrange
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
      };

      mockJwt.sign.mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      // Act & Assert
      await expect(tokenService.generateJWT(payload)).rejects.toThrow(
        AuthError
      );
    });
  });

  describe('verifyJWT', () => {
    it('should verify valid JWT token', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      // Act
      const result = await tokenService.verifyJWT('valid-token');

      // Assert
      expect(result).toEqual(mockPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', mockSecret, {
        issuer: 'collaborative-editor',
        audience: 'collaborative-editor-users',
      });
    });

    it('should throw AuthError for expired token', async () => {
      // Arrange
      const expiredError = new jwt.TokenExpiredError(
        'Token expired',
        new Date()
      );
      mockJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      await expect(tokenService.verifyJWT('expired-token')).rejects.toThrow(
        AuthError
      );
      await expect(tokenService.verifyJWT('expired-token')).rejects.toThrow(
        'JWT 토큰이 만료되었습니다.'
      );
    });

    it('should throw AuthError for invalid token', async () => {
      // Arrange
      const invalidError = new jwt.JsonWebTokenError('Invalid token');
      mockJwt.verify.mockImplementation(() => {
        throw invalidError;
      });

      // Act & Assert
      await expect(tokenService.verifyJWT('invalid-token')).rejects.toThrow(
        AuthError
      );
      await expect(tokenService.verifyJWT('invalid-token')).rejects.toThrow(
        '유효하지 않은 JWT 토큰입니다.'
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', async () => {
      // Arrange
      const userId = 'user-1';
      mockJwt.sign.mockReturnValue('refresh-token' as never);

      // Act
      const token = await tokenService.generateRefreshToken(userId);

      // Assert
      expect(token).toBe('refresh-token');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId,
          type: 'refresh',
          iat: expect.any(Number),
        },
        mockSecret,
        {
          expiresIn: '90d',
        }
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      // Act
      const result = await tokenService.verifyRefreshToken(
        'valid-refresh-token'
      );

      // Assert
      expect(result).toEqual({
        userId: 'user-1',
        type: 'refresh',
      });
    });

    it('should throw AuthError for invalid refresh token type', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        type: 'access', // Wrong type
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      // Act & Assert
      await expect(
        tokenService.verifyRefreshToken('invalid-type-token')
      ).rejects.toThrow(AuthError);
      await expect(
        tokenService.verifyRefreshToken('invalid-type-token')
      ).rejects.toThrow('유효하지 않은 리프레시 토큰입니다.');
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate password reset token', async () => {
      // Arrange
      const userId = 'user-1';
      const email = 'test@example.com';
      mockJwt.sign.mockReturnValue('reset-token' as never);

      // Act
      const token = await tokenService.generatePasswordResetToken(
        userId,
        email
      );

      // Assert
      expect(token).toBe('reset-token');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId,
          email,
          type: 'password-reset',
        },
        mockSecret,
        {
          expiresIn: '1h',
        }
      );
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should verify valid password reset token', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        type: 'password-reset',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      // Act
      const result =
        await tokenService.verifyPasswordResetToken('valid-reset-token');

      // Assert
      expect(result).toEqual({
        userId: 'user-1',
        email: 'test@example.com',
      });
    });

    it('should throw AuthError for invalid token type', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        type: 'access', // Wrong type
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      // Act & Assert
      await expect(
        tokenService.verifyPasswordResetToken('invalid-type-token')
      ).rejects.toThrow(AuthError);
      await expect(
        tokenService.verifyPasswordResetToken('invalid-type-token')
      ).rejects.toThrow('유효하지 않은 재설정 토큰입니다.');
    });
  });

  describe('utility methods', () => {
    describe('decodeJWT', () => {
      it('should decode JWT without verification', () => {
        // Arrange
        const mockPayload = {
          userId: 'user-1',
          email: 'test@example.com',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        };

        mockJwt.decode.mockReturnValue(mockPayload as never);

        // Act
        const result = tokenService.decodeJWT('token');

        // Assert
        expect(result).toEqual(mockPayload);
      });

      it('should return null for invalid token', () => {
        // Arrange
        mockJwt.decode.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        // Act
        const result = tokenService.decodeJWT('invalid-token');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('isTokenExpired', () => {
      it('should return true for expired token', () => {
        // Arrange
        const expiredPayload = {
          exp: Math.floor(Date.now() / 1000) - 1000, // Expired 1000 seconds ago
        };

        mockJwt.decode.mockReturnValue(expiredPayload as never);

        // Act
        const result = tokenService.isTokenExpired('expired-token');

        // Assert
        expect(result).toBe(true);
      });

      it('should return false for valid token', () => {
        // Arrange
        const validPayload = {
          exp: Math.floor(Date.now() / 1000) + 1000, // Valid for 1000 more seconds
        };

        mockJwt.decode.mockReturnValue(validPayload as never);

        // Act
        const result = tokenService.isTokenExpired('valid-token');

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('getTokenTimeRemaining', () => {
      it('should return remaining time for valid token', () => {
        // Arrange
        const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const payload = { exp: futureTime };

        mockJwt.decode.mockReturnValue(payload as never);

        // Act
        const result = tokenService.getTokenTimeRemaining('token');

        // Assert
        expect(result).toBeGreaterThan(3500); // Should be close to 3600
        expect(result).toBeLessThanOrEqual(3600);
      });

      it('should return 0 for expired token', () => {
        // Arrange
        const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
        const payload = { exp: pastTime };

        mockJwt.decode.mockReturnValue(payload as never);

        // Act
        const result = tokenService.getTokenTimeRemaining('expired-token');

        // Assert
        expect(result).toBe(0);
      });
    });
  });
});
