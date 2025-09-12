import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

describe('Query Performance Tests', () => {
  let prisma: PrismaClient;
  let testWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    
    // 성능 테스트용 데이터 준비
    const user = await prisma.user.create({
      data: {
        email: 'perf-test@example.com',
        name: 'Performance Test User',
        provider: 'email'
      }
    });
    testUserId = user.id;

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Performance Test Workspace',
        ownerId: user.id
      }
    });
    testWorkspaceId = workspace.id;

    // 대량 테스트 데이터 생성
    await createTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createTestData() {
    // 100개의 페이지 생성
    const pages = Array.from({ length: 100 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      title: `Performance Test Page ${i}`,
      documentId: `perf-doc-${i}`,
      position: i
    }));

    await prisma.page.createMany({ data: pages });

    // 각 페이지에 대한 문서 생성
    const documents = Array.from({ length: 100 }, (_, i) => ({
      id: `perf-doc-${i}`,
      state: Buffer.from(`Test content for document ${i}`),
      version: Math.floor(Math.random() * 10),
      sizeBytes: 100 + i
    }));

    await prisma.document.createMany({ data: documents });

    // 500개의 댓글 생성
    const comments = Array.from({ length: 500 }, (_, i) => ({
      documentId: `perf-doc-${i % 100}`,
      authorId: testUserId,
      content: `Performance test comment ${i}`,
      positionStart: i * 10,
      positionEnd: i * 10 + 50
    }));

    await prisma.comment.createMany({ data: comments });
  }

  function measureQueryTime<T>(queryFn: () => Promise<T>) {
    return async (): Promise<{ result: T; duration: number }> => {
      const startTime = Date.now();
      const result = await queryFn();
      const endTime = Date.now();
      return { result, duration: endTime - startTime };
    };
  }

  describe('Basic Query Performance', () => {
    it('should find user by email quickly', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.user.findUnique({
          where: { email: 'perf-test@example.com' }
        })
      )();

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // 100ms 이내
    });

    it('should find workspace with members quickly', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.workspace.findUnique({
          where: { id: testWorkspaceId },
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        })
      )();

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(200); // 200ms 이내
    });

    it('should paginate pages efficiently', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.page.findMany({
          where: { workspaceId: testWorkspaceId },
          take: 20,
          skip: 0,
          orderBy: { position: 'asc' }
        })
      )();

      expect(result).toHaveLength(20);
      expect(duration).toBeLessThan(150); // 150ms 이내
    });
  });

  describe('Complex Query Performance', () => {
    it('should handle workspace overview query efficiently', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.workspace.findUnique({
          where: { id: testWorkspaceId },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                  }
                }
              }
            },
            pages: {
              take: 10,
              orderBy: { updatedAt: 'desc' },
              include: {
                document: {
                  select: {
                    version: true,
                    lastModified: true,
                    sizeBytes: true
                  }
                }
              }
            }
          }
        })
      )();

      expect(result).toBeDefined();
      expect(result?.pages).toHaveLength(10);
      expect(duration).toBeLessThan(300); // 300ms 이내
    });

    it('should search pages by title efficiently', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.page.findMany({
          where: {
            workspaceId: testWorkspaceId,
            title: {
              contains: 'Performance'
            }
          },
          take: 10
        })
      )();

      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // 200ms 이내
    });

    it('should get document with comments efficiently', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.document.findUnique({
          where: { id: 'perf-doc-0' },
          include: {
            page: {
              select: {
                id: true,
                title: true,
                workspaceId: true
              }
            },
            history: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        })
      )();

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(250); // 250ms 이내
    });
  });

  describe('Aggregation Query Performance', () => {
    it('should count workspace statistics quickly', async () => {
      const { result, duration } = await measureQueryTime(async () => {
        const [pageCount, memberCount, commentCount] = await Promise.all([
          prisma.page.count({ where: { workspaceId: testWorkspaceId } }),
          prisma.workspaceMember.count({ where: { workspaceId: testWorkspaceId } }),
          prisma.comment.count({
            where: {
              documentId: {
                in: await prisma.page.findMany({
                  where: { workspaceId: testWorkspaceId },
                  select: { documentId: true }
                }).then(pages => pages.map(p => p.documentId))
              }
            }
          })
        ]);

        return { pageCount, memberCount, commentCount };
      })();

      expect(result.pageCount).toBe(100);
      expect(result.memberCount).toBeGreaterThanOrEqual(0);
      expect(result.commentCount).toBeGreaterThan(0);
      expect(duration).toBeLessThan(400); // 400ms 이내
    });

    it('should calculate document sizes efficiently', async () => {
      const { result, duration } = await measureQueryTime(() =>
        prisma.document.aggregate({
          where: {
            page: {
              workspaceId: testWorkspaceId
            }
          },
          _sum: {
            sizeBytes: true
          },
          _avg: {
            sizeBytes: true
          },
          _count: {
            id: true
          }
        })
      )();

      expect(result._count.id).toBe(100);
      expect(result._sum.sizeBytes).toBeGreaterThan(0);
      expect(result._avg.sizeBytes).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // 200ms 이내
    });
  });

  describe('Concurrent Query Performance', () => {
    it('should handle multiple simultaneous queries', async () => {
      const startTime = Date.now();

      const queries = Array.from({ length: 10 }, (_, i) =>
        prisma.page.findMany({
          where: { workspaceId: testWorkspaceId },
          take: 10,
          skip: i * 10
        })
      );

      const results = await Promise.all(queries);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.length).toBeGreaterThan(0);
      });
      expect(duration).toBeLessThan(1000); // 1초 이내
    });

    it('should handle read-write concurrency', async () => {
      const startTime = Date.now();

      const readQueries = Array.from({ length: 5 }, () =>
        prisma.page.findMany({
          where: { workspaceId: testWorkspaceId },
          take: 5
        })
      );

      const writeQueries = Array.from({ length: 3 }, (_, i) =>
        prisma.comment.create({
          data: {
            documentId: 'perf-doc-0',
            authorId: testUserId,
            content: `Concurrent test comment ${Date.now()}-${i}`
          }
        })
      );

      const [readResults, writeResults] = await Promise.all([
        Promise.all(readQueries),
        Promise.all(writeQueries)
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(readResults).toHaveLength(5);
      expect(writeResults).toHaveLength(3);
      expect(duration).toBeLessThan(800); // 800ms 이내
    });
  });

  describe('Memory Usage Validation', () => {
    it('should not cause memory leaks with large result sets', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 대량 데이터 조회
      for (let i = 0; i < 10; i++) {
        const pages = await prisma.page.findMany({
          where: { workspaceId: testWorkspaceId },
          include: {
            document: true
          }
        });
        expect(pages.length).toBe(100);
      }

      // 가비지 컬렉션 강제 실행
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // 메모리 증가가 50MB 이내여야 함
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});