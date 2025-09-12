// Jest setup for database package
import { afterAll, beforeAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient;

beforeAll(async () => {
  // 테스트용 데이터베이스 URL 설정
  process.env.DATABASE_URL = 'file:./test.db';
  
  // 테스트 데이터베이스 초기화
  execSync('pnpm prisma db push --force-reset', { stdio: 'inherit' });
  
  prisma = new PrismaClient();
});

beforeEach(async () => {
  // 각 테스트 전에 데이터베이스 정리
  const tablenames = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
  `;

  for (const { name } of tablenames) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});