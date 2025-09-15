/**
 * 세션 캐시 서비스
 * Redis를 활용한 사용자 세션 및 JWT 토큰 캐싱을 담당합니다.
 */
import { getRedis } from '@editor/database';
import { Prisma } from '@editor/database';
import type { User } from '@editor/types';

// Password 필드를 포함한 User 타입 (Prisma 타입 사용)
type UserWithPassword = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    avatarUrl: true;
    password: true;
    provider: true;
    providerId: true;
    emailVerified: true;
    mfaEnabled: true;
    mfaSecret: true;
    mfaBackupCodes: true;
    createdAt: true;
    updatedAt: true;
    lastActiveAt: true;
  };
}>;

interface CachedSession {
  user: User;
  expires: Date;
  lastActive: Date;
}

interface CachedJWT {
  payload: Record<string, unknown>;
  expires: Date;
}

export class SessionCacheService {
  private readonly redis = getRedis();
  private readonly SESSION_PREFIX = 'session:';
  private readonly JWT_PREFIX = 'jwt:';
  private readonly USER_PREFIX = 'user:';
  private readonly USER_EMAIL_PREFIX = 'user_email:';
  private readonly SESSION_TTL = 30 * 24 * 60 * 60; // 30일 (초)
  private readonly JWT_TTL = 60 * 60; // 1시간 (초)
  private readonly USER_TTL = 15 * 60; // 15분 (초)

  /**
   * 사용자 세션 캐시 저장
   */
  async cacheSession(userId: string, user: User, ttl?: number): Promise<void> {
    try {
      const sessionData: CachedSession = {
        user,
        expires: new Date(Date.now() + (ttl || this.SESSION_TTL) * 1000),
        lastActive: new Date(),
      };

      await this.redis.setex(
        `${this.SESSION_PREFIX}${userId}`,
        ttl || this.SESSION_TTL,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error('Session cache error:', error);
      // 캐시 오류는 치명적이지 않으므로 예외를 던지지 않음
    }
  }

  /**
   * 사용자 세션 캐시 조회
   */
  async getCachedSession(userId: string): Promise<User | null> {
    try {
      const cached = await this.redis.get(`${this.SESSION_PREFIX}${userId}`);
      if (!cached) return null;

      const sessionData: CachedSession = JSON.parse(cached);

      // 만료 확인
      if (new Date() > sessionData.expires) {
        await this.invalidateSession(userId);
        return null;
      }

      // 마지막 활동 시간 업데이트
      sessionData.lastActive = new Date();
      await this.redis.setex(
        `${this.SESSION_PREFIX}${userId}`,
        this.SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return sessionData.user;
    } catch (error) {
      console.error('Session cache retrieval error:', error);
      return null;
    }
  }

  /**
   * JWT 토큰 캐시 저장
   */
  async cacheJWT(
    token: string,
    payload: Record<string, unknown>,
    ttl?: number
  ): Promise<void> {
    try {
      const jwtData: CachedJWT = {
        payload,
        expires: new Date(Date.now() + (ttl || this.JWT_TTL) * 1000),
      };

      await this.redis.setex(
        `${this.JWT_PREFIX}${this.hashToken(token)}`,
        ttl || this.JWT_TTL,
        JSON.stringify(jwtData)
      );
    } catch (error) {
      console.error('JWT cache error:', error);
    }
  }

  /**
   * JWT 토큰 캐시 조회
   */
  async getCachedJWT(token: string): Promise<Record<string, unknown> | null> {
    try {
      const cached = await this.redis.get(
        `${this.JWT_PREFIX}${this.hashToken(token)}`
      );
      if (!cached) return null;

      const jwtData: CachedJWT = JSON.parse(cached);

      // 만료 확인
      if (new Date() > jwtData.expires) {
        await this.invalidateJWT(token);
        return null;
      }

      return jwtData.payload;
    } catch (error) {
      console.error('JWT cache retrieval error:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 캐시 저장
   */
  async cacheUser(userId: string, user: User, ttl?: number): Promise<void> {
    try {
      await this.redis.setex(
        `${this.USER_PREFIX}${userId}`,
        ttl || this.USER_TTL,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error('User cache error:', error);
    }
  }

  /**
   * 사용자 정보 캐시 조회
   */
  async getCachedUser(userId: string): Promise<User | null> {
    try {
      const cached = await this.redis.get(`${this.USER_PREFIX}${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('User cache retrieval error:', error);
      return null;
    }
  }

  /**
   * 이메일로 사용자 정보 캐시 저장 (password 포함)
   */
  async cacheUserByEmail(
    email: string,
    user: UserWithPassword,
    ttl?: number
  ): Promise<void> {
    try {
      await this.redis.setex(
        `${this.USER_EMAIL_PREFIX}${email}`,
        ttl || this.USER_TTL,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error('User email cache error:', error);
    }
  }

  /**
   * 이메일로 사용자 정보 캐시 조회 (password 포함)
   */
  async getCachedUserByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const cached = await this.redis.get(`${this.USER_EMAIL_PREFIX}${email}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('User email cache retrieval error:', error);
      return null;
    }
  }

  /**
   * 세션 무효화
   */
  async invalidateSession(userId: string): Promise<void> {
    try {
      await this.redis.del(`${this.SESSION_PREFIX}${userId}`);
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  /**
   * JWT 토큰 무효화
   */
  async invalidateJWT(token: string): Promise<void> {
    try {
      await this.redis.del(`${this.JWT_PREFIX}${this.hashToken(token)}`);
    } catch (error) {
      console.error('JWT invalidation error:', error);
    }
  }

  /**
   * 사용자 정보 캐시 무효화
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
      await this.redis.del(`${this.USER_PREFIX}${userId}`);
    } catch (error) {
      console.error('User cache invalidation error:', error);
    }
  }

  /**
   * 이메일로 사용자 정보 캐시 무효화
   */
  async invalidateUserByEmail(email: string): Promise<void> {
    try {
      await this.redis.del(`${this.USER_EMAIL_PREFIX}${email}`);
    } catch (error) {
      console.error('User email cache invalidation error:', error);
    }
  }

  /**
   * 사용자 관련 모든 캐시 무효화
   */
  async invalidateUserCache(userId: string, email?: string): Promise<void> {
    try {
      const promises = [
        this.invalidateSession(userId),
        this.invalidateUser(userId),
      ];

      if (email) {
        promises.push(this.invalidateUserByEmail(email));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('User cache invalidation error:', error);
    }
  }

  /**
   * 만료된 세션 정리
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
      let cleanedCount = 0;

      for (const key of sessionKeys) {
        const cached = await this.redis.get(key);
        if (!cached) continue;

        try {
          const sessionData: CachedSession = JSON.parse(cached);
          if (new Date() > sessionData.expires) {
            await this.redis.del(key);
            cleanedCount++;
          }
        } catch {
          // 잘못된 데이터는 삭제
          await this.redis.del(key);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }

  /**
   * 캐시 통계 조회
   */
  async getCacheStats(): Promise<{
    sessionCount: number;
    jwtCount: number;
    userCount: number;
    userEmailCount: number;
  }> {
    try {
      const [sessionKeys, jwtKeys, userKeys, userEmailKeys] = await Promise.all(
        [
          this.redis.keys(`${this.SESSION_PREFIX}*`),
          this.redis.keys(`${this.JWT_PREFIX}*`),
          this.redis.keys(`${this.USER_PREFIX}*`),
          this.redis.keys(`${this.USER_EMAIL_PREFIX}*`),
        ]
      );

      return {
        sessionCount: sessionKeys.length,
        jwtCount: jwtKeys.length,
        userCount: userKeys.length,
        userEmailCount: userEmailKeys.length,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        sessionCount: 0,
        jwtCount: 0,
        userCount: 0,
        userEmailCount: 0,
      };
    }
  }

  /**
   * 토큰 해시 생성 (보안을 위해 원본 토큰을 저장하지 않음)
   */
  private hashToken(token: string): string {
    // 간단한 해시 함수 (실제로는 crypto.createHash 사용 권장)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 캐시 연결 상태 확인
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
