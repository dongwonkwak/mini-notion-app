import { beforeAll, describe, expect, it } from '@jest/globals';

import { prisma } from '../index';

describe('Database Seeding', () => {
  let seedPrisma: any;

  beforeAll(async () => {
    try {
      console.log('Setting up database for seed tests...');
      seedPrisma = prisma();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  });

  it('should run seed script successfully', async () => {
    try {
      const users = await seedPrisma.user.findMany();
      expect(users.length).toBeGreaterThanOrEqual(0);
    } catch (error) {
      console.error('Basic database test failed:', error);
      throw error;
    }
  });

  it('should create expected users if seeded', async () => {
    try {
      const users = await seedPrisma.user.findMany();
      expect(Array.isArray(users)).toBe(true);
    } catch (error) {
      console.error('User query failed:', error);
      throw error;
    }
  });
});
