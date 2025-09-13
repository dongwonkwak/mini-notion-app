import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DocumentCache, SessionCache, RateLimiter, initRedis, closeRedis } from '../redis';

// Mock Redis for testing
jest.mock('ioredis', () => {
  const mockRedis = {
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    expire: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    pexpire: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
    Redis: jest.fn(() => mockRedis),
  };
});

describe('Redis Connection', () => {
  beforeAll(() => {
    // Initialize Redis with mocked implementation
    initRedis();
  });

  afterAll(async () => {
    await closeRedis();
  });

  it('should initialize Redis connection', () => {
    const redis = initRedis();
    expect(redis).toBeDefined();
  });
});

describe('DocumentCache', () => {
  let documentCache: DocumentCache;

  beforeAll(() => {
    documentCache = new DocumentCache();
  });

  it('should cache and retrieve document state', async () => {
    const documentId = 'test-doc-123';
    const state = Buffer.from('test document state');
    const version = 1;

    await documentCache.setDocument(documentId, state, version);
    
    // Mock the get method to return our test data
    const mockGet = require('ioredis').Redis().get;
    mockGet.mockResolvedValueOnce(JSON.stringify({
      state: state.toString('base64'),
      version,
      lastModified: new Date().toISOString(),
      activeUsers: []
    }));

    const cached = await documentCache.getDocument(documentId);
    
    expect(cached).toBeDefined();
    expect(cached?.version).toBe(version);
    expect(cached?.state).toEqual(state);
  });

  it('should handle cache miss gracefully', async () => {
    const documentId = 'non-existent-doc';
    
    const cached = await documentCache.getDocument(documentId);
    expect(cached).toBeNull();
  });

  it('should manage active users', async () => {
    const documentId = 'test-doc-123';
    const userId = 'user-123';

    await documentCache.addActiveUser(documentId, userId);
    await documentCache.removeActiveUser(documentId, userId);
    
    const activeUsers = await documentCache.getActiveUsers(documentId);
    expect(Array.isArray(activeUsers)).toBe(true);
  });
});

describe('SessionCache', () => {
  let sessionCache: SessionCache;

  beforeAll(() => {
    sessionCache = new SessionCache();
  });

  it('should cache and retrieve session data', async () => {
    const userId = 'user-123';
    const expiresDate = new Date();
    const sessionData = {
      id: 'session-123',
      userId,
      expires: expiresDate,
    };

    await sessionCache.setSession(userId, sessionData);
    
    // Mock the get method to return our test data with ISO string for date
    const mockGet = require('ioredis').Redis().get;
    const serializedData = {
      ...sessionData,
      expires: expiresDate.toISOString(), // Date는 JSON에서 문자열로 직렬화됨
    };
    mockGet.mockResolvedValueOnce(JSON.stringify(serializedData));

    const cached = await sessionCache.getSession(userId);
    
    // Date 필드는 문자열로 반환되므로 이를 고려한 검증
    expect(cached).toBeDefined();
    expect(cached?.id).toBe(sessionData.id);
    expect(cached?.userId).toBe(sessionData.userId);
    expect(cached?.expires).toBe(expiresDate.toISOString());
  });

  it('should handle session cache miss', async () => {
    const userId = 'non-existent-user';
    
    const cached = await sessionCache.getSession(userId);
    expect(cached).toBeNull();
  });

  it('should manage user activity', async () => {
    const userId = 'user-123';

    await sessionCache.updateActivity(userId);
    
    const isActive = await sessionCache.isUserActive(userId);
    expect(typeof isActive).toBe('boolean');
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeAll(() => {
    rateLimiter = new RateLimiter();
  });

  it('should check rate limits', async () => {
    const userId = 'user-123';
    const action = 'edit_document';

    const isAllowed = await rateLimiter.checkLimit(userId, action, 10, 60000);
    expect(typeof isAllowed).toBe('boolean');
  });

  it('should get current request count', async () => {
    const userId = 'user-123';
    const action = 'edit_document';

    const count = await rateLimiter.getCurrentCount(userId, action);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });
});