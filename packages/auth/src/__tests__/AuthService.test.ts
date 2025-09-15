/**
 * AuthService 단위 테스트
 * 인증 로직 및 JWT 토큰 관리 테스트
 */
import bcrypt from 'bcryptjs';

import { AuthEventLogger } from '../AuthEventLogger';
import { AuthService } from '../AuthService';
import { MFAService } from '../MFAService';
import { SessionCacheService } from '../SessionCacheService';
import { TokenService } from '../TokenService';

// 모킹
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@editor/database', () => ({
  getPrisma: jest.fn(() => mockPrismaClient),
  getRedisClient: jest.fn(() => ({
    setex: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    ping: jest.fn(),
  })),
  Prisma: {
    JsonNull: Symbol('JsonNull'),
  },
}));

jest.mock('../TokenService');
jest.mock('../MFAService');
jest.mock('../SessionCacheService');
jest.mock('../AuthEventLogger');
jest.mock('bcryptjs');

const mockPrisma = mockPrismaClient;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const MockTokenService = TokenService as jest.MockedClass<typeof TokenService>;
const MockMFAService = MFAService as jest.MockedClass<typeof MFAService>;
const MockSessionCacheService = SessionCacheService as jest.MockedClass<
  typeof SessionCacheService
>;
const MockAuthEventLogger = AuthEventLogger as jest.MockedClass<
  typeof AuthEventLogger
>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockMFAService: jest.Mocked<MFAService>;
  let mockCacheService: jest.Mocked<SessionCacheService>;
  let mockEventLogger: jest.Mocked<AuthEventLogger>;

  beforeEach(() => {
    // Mock 인스턴스 생성
    mockTokenService = {
      generateJWT: jest.fn(),
      verifyJWT: jest.fn(),
      generateRefreshToken: jest.fn(),
      generatePasswordResetToken: jest.fn(),
      verifyPasswordResetToken: jest.fn(),
    } as any;

    mockMFAService = {
      setupMFA: jest.fn(),
      enableMFA: jest.fn(),
      disableMFA: jest.fn(),
      verifyMFA: jest.fn(),
      getMFAStatus: jest.fn(),
    } as any;

    mockCacheService = {
      cacheSession: jest.fn(),
      getCachedSession: jest.fn(),
      cacheUser: jest.fn(),
      getCachedUser: jest.fn(),
      getCachedUserByEmail: jest.fn(),
      invalidateUser: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockEventLogger = {
      logEvent: jest.fn(),
      logLogin: jest.fn(),
      logLogout: jest.fn(),
      logMfaSetup: jest.fn(),
      logPasswordReset: jest.fn(),
      logAccountLocked: jest.fn(),
      logSuspiciousActivity: jest.fn(),
      getEvents: jest.fn(),
      getRecentLogins: jest.fn(),
      detectSuspiciousActivity: jest.fn().mockResolvedValue(false),
      getSecurityStats: jest.fn(),
      cleanupOldLogs: jest.fn(),
    } as any;

    // Mock 클래스가 인스턴스를 반환하도록 설정
    MockTokenService.mockImplementation(() => mockTokenService);
    MockMFAService.mockImplementation(() => mockMFAService);
    MockSessionCacheService.mockImplementation(() => mockCacheService);
    MockAuthEventLogger.mockImplementation(() => mockEventLogger);

    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('authenticateCredentials', () => {
    it.skip('should authenticate user with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        mfaEnabled: false,
        provider: 'email',
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      // 캐시에서 사용자를 찾지 못하므로 DB에서 조회
      mockCacheService.getCachedUser.mockResolvedValue(null);
      mockCacheService.getCachedUserByEmail.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      // updateUserLastActive에서 호출되는 user.update 모킹
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockTokenService.generateJWT.mockResolvedValue('jwt-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockCacheService.cacheSession.mockResolvedValue(undefined);
      mockCacheService.cacheUser.mockResolvedValue(undefined);
      mockEventLogger.logLogin.mockResolvedValue(undefined);
      mockEventLogger.logSuspiciousActivity.mockResolvedValue(undefined);

      // Act & Assert
      try {
        const result = await authService.authenticateCredentials({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result.user).toBeDefined();
        expect(result.token).toBe('jwt-token');
        expect(result.refreshToken).toBe('refresh-token');
        expect(mockCacheService.cacheUser).toHaveBeenCalled();
        expect(mockCacheService.cacheSession).toHaveBeenCalled();
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });

    it('should fail authentication with invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        mfaEnabled: false,
      };

      mockCacheService.getCachedUser.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        authService.authenticateCredentials({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });

    it('should require MFA token when MFA is enabled', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        mfaEnabled: true,
        mfaSecret: 'secret',
      };

      mockCacheService.getCachedUser.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(
        authService.authenticateCredentials({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should fail authentication for non-existent user', async () => {
      // Arrange
      mockCacheService.getCachedUser.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.authenticateCredentials({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('should create new user with hashed password', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        provider: 'email' as const,
      };

      const mockCreatedUser = {
        id: 'user-2',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedPassword',
        provider: 'email',
        providerId: null,
        avatarUrl: null,
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
        emailVerified: null,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.createUser(userData);

      // Assert
      expect(result.email).toBe('newuser@example.com');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          name: 'New User',
          password: 'hashedPassword',
          provider: 'email',
          providerId: undefined,
          avatarUrl: undefined,
          mfaEnabled: false,
          emailVerified: null,
        },
      });
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
        provider: 'email' as const,
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      });

      // Act & Assert
      await expect(authService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('generateJWT', () => {
    it('should delegate to TokenService', async () => {
      // Arrange
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
        workspaceId: 'workspace-1',
      };

      mockTokenService.generateJWT.mockResolvedValue('mock-jwt-token');

      // Act
      const token = await authService.generateJWT(payload);

      // Assert
      expect(token).toBe('mock-jwt-token');
      expect(mockTokenService.generateJWT).toHaveBeenCalledWith(payload);
    });
  });

  describe('verifyJWT', () => {
    it('should delegate to TokenService', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      mockTokenService.verifyJWT.mockResolvedValue(mockPayload);

      // Act
      const result = await authService.verifyJWT('valid-token');

      // Assert
      expect(result).toEqual(mockPayload);
      expect(mockTokenService.verifyJWT).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('createOAuthUser', () => {
    it('should create new OAuth user', async () => {
      // Arrange
      const userData = {
        email: 'oauth@example.com',
        name: 'OAuth User',
        provider: 'google' as const,
        providerId: 'google-123',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockCreatedUser = {
        id: 'user-3',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
        provider: 'google',
        providerId: 'google-123',
        avatarUrl: 'https://example.com/avatar.jpg',
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.createOAuthUser(userData);

      // Assert
      expect(result.email).toBe('oauth@example.com');
      expect(result.provider).toBe('google');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'oauth@example.com',
          name: 'OAuth User',
          provider: 'google',
          providerId: 'google-123',
          avatarUrl: 'https://example.com/avatar.jpg',
          mfaEnabled: false,
          emailVerified: expect.any(Date),
        },
      });
    });

    it('should update existing OAuth user', async () => {
      // Arrange
      const userData = {
        email: 'existing-oauth@example.com',
        name: 'Updated OAuth User',
        provider: 'google' as const,
        providerId: 'google-123',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      const existingUser = {
        id: 'existing-user',
        email: 'existing-oauth@example.com',
        name: 'Old Name',
        password: null,
        provider: 'google',
        providerId: 'google-123',
        avatarUrl: 'https://example.com/old-avatar.jpg',
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        name: 'Updated OAuth User',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        lastActiveAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await authService.createOAuthUser(userData);

      // Assert
      expect(result.name).toBe('Updated OAuth User');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'existing-user' },
        data: {
          name: 'Updated OAuth User',
          avatarUrl: 'https://example.com/new-avatar.jpg',
          lastActiveAt: expect.any(Date),
          emailVerified: expect.any(Date),
        },
      });
    });
  });

  describe('resetPassword', () => {
    it.skip('should reset password with valid token', async () => {
      // Arrange
      mockTokenService.verifyPasswordResetToken.mockResolvedValue({
        userId: 'user-1',
        email: 'test@example.com',
      });
      mockBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      mockPrisma.user.update.mockResolvedValue({} as any);

      // Act
      const result = await authService.resetPassword(
        'valid-reset-token',
        'newPassword123'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockTokenService.verifyPasswordResetToken).toHaveBeenCalledWith(
        'valid-reset-token'
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'newHashedPassword' },
      });
      expect(mockCacheService.invalidateUser).toHaveBeenCalledWith('user-1');
    });
  });
});
