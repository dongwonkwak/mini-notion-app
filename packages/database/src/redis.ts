/**
 * Redis connection and caching utilities for session management and document caching
 */

import { Redis } from 'ioredis';

// Redis connection instance
let redis: Redis | null = null;

/**
 * Initialize Redis connection
 */
export function initRedis(): Redis {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });

  redis.on('ready', () => {
    console.log('🚀 Redis is ready to accept commands');
  });

  return redis;
}

/**
 * Get Redis instance (initialize if not exists)
 */
export function getRedis(): Redis {
  if (!redis) {
    return initRedis();
  }
  return redis;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('🔌 Redis connection closed');
  }
}

/**
 * Document cache utilities
 */
export class DocumentCache {
  private redis: Redis;

  constructor() {
    this.redis = getRedis();
  }

  /**
   * Cache document state
   */
  async setDocument(documentId: string, state: Buffer, version: number): Promise<void> {
    const key = `doc:${documentId}`;
    const data = {
      state: state.toString('base64'),
      version,
      lastModified: new Date().toISOString(),
      activeUsers: [],
    };

    await this.redis.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
  }

  /**
   * Get cached document state
   */
  async getDocument(documentId: string): Promise<{ state: Buffer; version: number; lastModified: Date } | null> {
    const key = `doc:${documentId}`;
    const cached = await this.redis.get(key);

    if (!cached) {
      return null;
    }

    try {
      const data = JSON.parse(cached);
      return {
        state: Buffer.from(data.state, 'base64'),
        version: data.version,
        lastModified: new Date(data.lastModified),
      };
    } catch (error) {
      console.error('Error parsing cached document:', error);
      return null;
    }
  }

  /**
   * Remove document from cache
   */
  async removeDocument(documentId: string): Promise<void> {
    const key = `doc:${documentId}`;
    await this.redis.del(key);
  }

  /**
   * Add active user to document
   */
  async addActiveUser(documentId: string, userId: string): Promise<void> {
    const key = `doc:${documentId}:users`;
    await this.redis.sadd(key, userId);
    await this.redis.expire(key, 300); // 5 minutes TTL
  }

  /**
   * Remove active user from document
   */
  async removeActiveUser(documentId: string, userId: string): Promise<void> {
    const key = `doc:${documentId}:users`;
    await this.redis.srem(key, userId);
  }

  /**
   * Get active users for document
   */
  async getActiveUsers(documentId: string): Promise<string[]> {
    const key = `doc:${documentId}:users`;
    return await this.redis.smembers(key);
  }
}

/**
 * Session cache utilities
 */
export class SessionCache {
  private redis: Redis;

  constructor() {
    this.redis = getRedis();
  }

  /**
   * Cache user session
   */
  async setSession(userId: string, sessionData: any): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.setex(key, 86400, JSON.stringify(sessionData)); // 24 hours TTL
  }

  /**
   * Get cached session
   */
  async getSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    const cached = await this.redis.get(key);

    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached session:', error);
      return null;
    }
  }

  /**
   * Remove session from cache
   */
  async removeSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Update user activity
   */
  async updateActivity(userId: string): Promise<void> {
    const key = `activity:${userId}`;
    await this.redis.setex(key, 300, new Date().toISOString()); // 5 minutes TTL
  }

  /**
   * Check if user is active
   */
  async isUserActive(userId: string): Promise<boolean> {
    const key = `activity:${userId}`;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = getRedis();
  }

  /**
   * Check rate limit for user action
   */
  async checkLimit(userId: string, action: string, maxRequests: number = 100, windowMs: number = 60000): Promise<boolean> {
    const key = `rate:${userId}:${action}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.pexpire(key, windowMs);
    }

    return current <= maxRequests;
  }

  /**
   * Get current request count
   */
  async getCurrentCount(userId: string, action: string): Promise<number> {
    const key = `rate:${userId}:${action}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }
}

// Export instances for convenience
export const documentCache = new DocumentCache();
export const sessionCache = new SessionCache();
export const rateLimiter = new RateLimiter();