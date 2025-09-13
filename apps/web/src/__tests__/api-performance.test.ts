/**
 * API 성능 및 부하 테스트
 * API 엔드포인트의 성능과 동시성 처리를 테스트합니다.
 */

import { AuthService } from '@editor/auth';
import { NextRequest } from 'next/server';

import { POST as mfaSetupHandler } from '../app/api/auth/mfa/setup/route';
import { POST as signupHandler } from '../app/api/auth/signup/route';

// 모킹
jest.mock('@editor/auth');
jest.mock('next-auth');

const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('API Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple signup requests concurrently', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      mockAuthService.prototype.createUser.mockResolvedValue(mockUser);

      const requests = Array.from({ length: 10 }, (_, i) => {
        return new NextRequest('http://localhost:3000/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            password: 'password123',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Act
      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => signupHandler(request))
      );
      const endTime = Date.now();

      // Assert
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Performance assertion - should complete within reasonable time
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent MFA setup requests', async () => {
      // Arrange
      const mockMfaSetup = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        backupCodes: ['ABC12345', 'DEF67890'],
      };

      mockAuthService.prototype.setupMFA.mockResolvedValue(mockMfaSetup);

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      });

      const requests = Array.from({ length: 5 }, () => {
        return new NextRequest('http://localhost:3000/api/auth/mfa/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Act
      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => mfaSetupHandler(request))
      );
      const endTime = Date.now();

      // Assert
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(3000); // 3 seconds max
    });
  });

  describe('Response Time Tests', () => {
    it('should respond to signup requests within acceptable time', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      mockAuthService.prototype.createUser.mockResolvedValue(mockUser);

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
      const startTime = Date.now();
      const response = await signupHandler(request);
      const endTime = Date.now();

      // Assert
      expect(response.status).toBe(201);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // 1 second max
    });

    it('should respond to validation errors quickly', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          name: 'Test User',
          password: '123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const startTime = Date.now();
      const response = await signupHandler(request);
      const endTime = Date.now();

      // Assert
      expect(response.status).toBe(400);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // 100ms max for validation
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory with repeated requests', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      mockAuthService.prototype.createUser.mockResolvedValue(mockUser);

      const initialMemory = process.memoryUsage();

      // Act - Make many requests
      for (let i = 0; i < 100; i++) {
        const request = new NextRequest(
          'http://localhost:3000/api/auth/signup',
          {
            method: 'POST',
            body: JSON.stringify({
              email: `test${i}@example.com`,
              name: `Test User ${i}`,
              password: 'password123',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const response = await signupHandler(request);
        expect(response.status).toBe(201);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Assert - Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover from temporary service failures', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      // First call fails, second succeeds
      mockAuthService.prototype.createUser
        .mockRejectedValueOnce(new Error('Temporary database error'))
        .mockResolvedValueOnce(mockUser);

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

      // Act - First request fails
      const firstResponse = await signupHandler(request);
      expect(firstResponse.status).toBe(500);

      // Second request succeeds
      const secondResponse = await signupHandler(request);
      expect(secondResponse.status).toBe(201);
    });

    it('should handle rate limiting gracefully', async () => {
      // This test would be implemented with actual rate limiting middleware
      // For now, we'll test that the API can handle rapid requests

      const requests = Array.from({ length: 100 }, (_, i) => {
        return new NextRequest('http://localhost:3000/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            password: 'password123',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Act
      const responses = await Promise.allSettled(
        requests.map(request => signupHandler(request))
      );

      // Assert - All requests should be handled (either success or rate limited)
      expect(responses).toHaveLength(100);
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency under concurrent load', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      mockAuthService.prototype.createUser.mockResolvedValue(mockUser);

      // Create multiple requests with the same email (should fail for duplicates)
      const requests = Array.from({ length: 5 }, () => {
        return new NextRequest('http://localhost:3000/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: 'duplicate@example.com',
            name: 'Test User',
            password: 'password123',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Mock the service to fail on duplicate emails after first success
      let callCount = 0;
      mockAuthService.prototype.createUser.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(mockUser);
        } else {
          return Promise.reject(new Error('이미 존재하는 이메일입니다.'));
        }
      });

      // Act
      const responses = await Promise.all(
        requests.map(request => signupHandler(request))
      );

      // Assert
      const successCount = responses.filter(r => r.status === 201).length;
      const errorCount = responses.filter(r => r.status === 409).length;

      expect(successCount).toBe(1); // Only one should succeed
      expect(errorCount).toBe(4); // Rest should fail with duplicate error
    });
  });

  describe('Timeout Handling', () => {
    it('should handle slow database operations gracefully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      };

      // Simulate slow database operation
      mockAuthService.prototype.createUser.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockUser), 2000); // 2 second delay
        });
      });

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
      const startTime = Date.now();
      const response = await signupHandler(request);
      const endTime = Date.now();

      // Assert
      expect(response.status).toBe(201);
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(2000); // Should take at least 2 seconds
      expect(duration).toBeLessThan(5000); // But not too much longer
    });
  });
});
