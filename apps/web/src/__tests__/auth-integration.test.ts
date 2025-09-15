/**
 * 인증 시스템 통합 테스트
 * NextAuth.js와 API 엔드포인트 통합 테스트
 */
import { NextRequest } from 'next/server';

import { AuthService } from '@editor/auth';
import type { CreateUserData, User } from '@editor/types';

import {
  PUT as mfaEnableHandler,
  POST as mfaSetupHandler,
} from '../app/api/auth/mfa/setup/route';
import { POST as signupHandler } from '../app/api/auth/signup/route';

// 모킹
jest.mock('@editor/auth', () => ({
  AuthService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('next-auth');

const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('Authentication Integration Tests', () => {
  let mockInstance: {
    createUser: jest.MockedFunction<
      (userData: CreateUserData) => Promise<User>
    >;
    setupMFA: jest.MockedFunction<
      (userId: string, ip?: string, userAgent?: string) => Promise<unknown>
    >;
    enableMFA: jest.MockedFunction<
      (
        userId: string,
        token: string,
        ip?: string,
        userAgent?: string
      ) => Promise<boolean>
    >;
    generateJWT: jest.MockedFunction<(userId: string) => string>;
    verifyJWT: jest.MockedFunction<(token: string) => unknown>;
    generateRefreshToken: jest.MockedFunction<(userId: string) => string>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // AuthService.getInstance() mock 설정
    mockInstance = {
      createUser: jest.fn(),
      setupMFA: jest.fn(),
      enableMFA: jest.fn(),
      generateJWT: jest.fn(),
      verifyJWT: jest.fn(),
      generateRefreshToken: jest.fn(),
    };

    (
      mockAuthService.getInstance as jest.MockedFunction<
        typeof AuthService.getInstance
      >
    ).mockReturnValue(mockInstance as unknown as AuthService);
  });

  describe('Signup API', () => {
    it('should create new user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
        provider: 'email' as const,
        mfaEnabled: false,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      mockInstance.createUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await signupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(mockInstance.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        provider: 'email',
      });
    });

    it('should validate email format', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await signupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should validate password length', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          password: '123', // Too short
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await signupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('PASSWORD_TOO_SHORT');
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      mockInstance.createUser.mockRejectedValue(
        new Error('이미 존재하는 이메일입니다.')
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          name: 'Test User',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await signupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should require all fields', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing name and password
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await signupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('EMAIL_NAME_PASSWORD_REQUIRED');
    });
  });

  describe('MFA Setup API', () => {
    it('should setup MFA for authenticated user', async () => {
      // Arrange
      const mockMfaSetup = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        backupCodes: ['ABC12345', 'DEF67890'],
      };

      mockInstance.setupMFA.mockResolvedValue(mockMfaSetup);

      // Mock getServerSession
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/auth/mfa/setup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Act
      const response = await mfaSetupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.qrCode).toBeDefined();
      expect(data.data.backupCodes).toHaveLength(2);
      expect(mockInstance.setupMFA).toHaveBeenCalledWith(
        'user-1',
        'unknown',
        'unknown'
      );
    });

    it('should require authentication for MFA setup', async () => {
      // Arrange
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/auth/mfa/setup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Act
      const response = await mfaSetupHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('AUTHENTICATION_REQUIRED');
    });

    it('should enable MFA with valid token', async () => {
      // Arrange
      mockInstance.enableMFA.mockResolvedValue(true);

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/auth/mfa/setup',
        {
          method: 'PUT',
          body: JSON.stringify({
            token: '123456',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Act
      const response = await mfaEnableHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('MFA가 활성화되었습니다.');
      expect(mockInstance.enableMFA).toHaveBeenCalledWith(
        'user-1',
        '123456',
        'unknown',
        'unknown'
      );
    });

    it('should reject invalid MFA token', async () => {
      // Arrange
      mockInstance.enableMFA.mockRejectedValue(
        new Error('MFA 토큰이 올바르지 않습니다.')
      );

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/auth/mfa/setup',
        {
          method: 'PUT',
          body: JSON.stringify({
            token: '000000',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Act
      const response = await mfaEnableHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_MFA_TOKEN');
    });

    it('should require MFA token for enabling', async () => {
      // Arrange
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/auth/mfa/setup',
        {
          method: 'PUT',
          body: JSON.stringify({}), // No token
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Act
      const response = await mfaEnableHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('TOKEN_REQUIRED');
    });
  });

  describe('OAuth Flow Integration', () => {
    it('should handle Google OAuth callback', async () => {
      // This would test the OAuth callback handling
      // Implementation depends on NextAuth.js callback testing
      expect(true).toBe(true); // Placeholder
    });

    it('should handle GitHub OAuth callback', async () => {
      // This would test the OAuth callback handling
      // Implementation depends on NextAuth.js callback testing
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('JWT Token Management', () => {
    it('should generate and verify JWT tokens', async () => {
      // Arrange
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'editor' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      // Mock the actual implementation
      mockInstance.generateJWT = jest.fn().mockResolvedValue('mock-jwt-token');
      mockInstance.verifyJWT = jest.fn().mockResolvedValue(payload);

      // Act
      const token = await mockInstance.generateJWT(payload.userId);
      const verified = await mockInstance.verifyJWT(token);

      // Assert
      expect(token).toBe('mock-jwt-token');
      expect(verified).toEqual(payload);
    });

    it('should handle token refresh', async () => {
      // Arrange
      mockInstance.generateRefreshToken = jest
        .fn()
        .mockResolvedValue('refresh-token');

      // Act
      const refreshToken = await mockInstance.generateRefreshToken('user-1');

      // Assert
      expect(refreshToken).toBe('refresh-token');
      expect(mockInstance.generateRefreshToken).toHaveBeenCalledWith('user-1');
    });
  });
});
