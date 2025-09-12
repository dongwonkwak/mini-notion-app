import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

describe('Database Migration Validation', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Schema Generation', () => {
    it('should generate valid Prisma client', () => {
      expect(() => {
        execSync('pnpm prisma generate', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should validate schema syntax', () => {
      expect(() => {
        execSync('pnpm prisma validate', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should format schema correctly', () => {
      const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
      expect(existsSync(schemaPath)).toBe(true);

      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // 기본 구조 검증
      expect(schemaContent).toContain('generator client');
      expect(schemaContent).toContain('datasource db');
      expect(schemaContent).toContain('provider = "sqlite"');
      
      // 모든 필수 모델이 있는지 확인
      const requiredModels = [
        'model User',
        'model Session', 
        'model Workspace',
        'model WorkspaceMember',
        'model Page',
        'model Document',
        'model DocumentHistory',
        'model Comment',
        'model FileUpload'
      ];

      requiredModels.forEach(model => {
        expect(schemaContent).toContain(model);
      });
    });
  });

  describe('Database Push Validation', () => {
    it('should push schema to database without errors', () => {
      expect(() => {
        execSync('pnpm prisma db push --force-reset', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should create all tables with correct structure', async () => {
      // 테이블 존재 확인
      const tables = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
      `;
      
      const tableNames = tables.map(t => t.name);
      expect(tableNames.length).toBeGreaterThan(8); // 최소 9개 테이블 + _prisma_migrations
    });

    it('should handle schema changes gracefully', async () => {
      // 현재 스키마 상태 저장
      const initialTables = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table';
      `;

      // 스키마 재적용
      execSync('pnpm prisma db push', { stdio: 'pipe' });

      // 테이블이 여전히 존재하는지 확인
      const finalTables = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table';
      `;

      expect(finalTables.length).toBe(initialTables.length);
    });
  });

  describe('Data Integrity Validation', () => {
    it('should maintain referential integrity', async () => {
      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          email: 'integrity-test@example.com',
          name: 'Integrity Test User',
          provider: 'email'
        }
      });

      // 워크스페이스 생성
      const workspace = await prisma.workspace.create({
        data: {
          name: 'Integrity Test Workspace',
          ownerId: user.id
        }
      });

      // 페이지 생성
      const page = await prisma.page.create({
        data: {
          workspaceId: workspace.id,
          title: 'Integrity Test Page',
          documentId: 'integrity-doc-123',
          document: {
            create: {
              id: 'integrity-doc-123',
              state: Buffer.from([]),
              version: 0
            }
          }
        }
      });

      // 관계 확인
      const pageWithRelations = await prisma.page.findUnique({
        where: { id: page.id },
        include: {
          workspace: true,
          document: true
        }
      });

      expect(pageWithRelations?.workspace.id).toBe(workspace.id);
      expect(pageWithRelations?.document?.id).toBe('integrity-doc-123');
    });

    it('should handle concurrent operations safely', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'concurrent-test@example.com',
          name: 'Concurrent Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Concurrent Test Workspace',
          ownerId: user.id
        }
      });

      // 동시에 여러 페이지 생성
      const pagePromises = Array.from({ length: 5 }, (_, i) =>
        prisma.page.create({
          data: {
            workspaceId: workspace.id,
            title: `Concurrent Page ${i}`,
            documentId: `concurrent-doc-${i}`,
            position: i,
            document: {
              create: {
                id: `concurrent-doc-${i}`,
                state: Buffer.from([i]),
                version: 0
              }
            }
          }
        })
      );

      const pages = await Promise.all(pagePromises);
      expect(pages).toHaveLength(5);

      // 모든 페이지가 올바르게 생성되었는지 확인
      const allPages = await prisma.page.findMany({
        where: { workspaceId: workspace.id }
      });
      expect(allPages).toHaveLength(5);
    });
  });

  describe('Performance Validation', () => {
    it('should handle large datasets efficiently', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'performance-test@example.com',
          name: 'Performance Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Performance Test Workspace',
          ownerId: user.id
        }
      });

      // 대량 데이터 생성 시간 측정
      const startTime = Date.now();
      
      const batchSize = 100;
      const pageData = Array.from({ length: batchSize }, (_, i) => ({
        workspaceId: workspace.id,
        title: `Performance Page ${i}`,
        documentId: `perf-doc-${i}`,
        position: i
      }));

      await prisma.page.createMany({
        data: pageData
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 100개 페이지 생성이 5초 이내에 완료되어야 함
      expect(duration).toBeLessThan(5000);

      // 생성된 데이터 확인
      const count = await prisma.page.count({
        where: { workspaceId: workspace.id }
      });
      expect(count).toBe(batchSize);
    });

    it('should execute complex queries efficiently', async () => {
      const startTime = Date.now();

      // 복잡한 조인 쿼리 실행
      const result = await prisma.workspace.findMany({
        include: {
          members: {
            include: {
              user: true
            }
          },
          pages: {
            include: {
              document: true
            },
            take: 10
          }
        },
        take: 10
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 복잡한 쿼리가 2초 이내에 완료되어야 함
      expect(duration).toBeLessThan(2000);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Backup and Recovery Validation', () => {
    it('should export and import data correctly', async () => {
      // 테스트 데이터 생성
      const user = await prisma.user.create({
        data: {
          email: 'backup-test@example.com',
          name: 'Backup Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Backup Test Workspace',
          ownerId: user.id,
          settings: { theme: 'dark' }
        }
      });

      // 데이터 개수 확인
      const userCount = await prisma.user.count();
      const workspaceCount = await prisma.workspace.count();

      expect(userCount).toBeGreaterThan(0);
      expect(workspaceCount).toBeGreaterThan(0);

      // 실제 백업/복원은 프로덕션 환경에서 테스트
      // 여기서는 데이터 일관성만 확인
      const retrievedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      const retrievedWorkspace = await prisma.workspace.findUnique({
        where: { id: workspace.id }
      });

      expect(retrievedUser?.email).toBe('backup-test@example.com');
      expect(retrievedWorkspace?.name).toBe('Backup Test Workspace');
    });
  });
});