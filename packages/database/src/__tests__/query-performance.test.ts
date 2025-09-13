import { describe, it, expect, beforeAll } from '@jest/globals';
import { prisma, cleanDatabase } from '../index';

describe('Database Query Performance', () => {
  let db: any;

  beforeAll(async () => {
    db = prisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should perform workspace queries efficiently', async () => {
    const uniqueEmail = `perf-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: 'Performance User',
        provider: 'email',
      },
    });

    const workspace = await db.workspace.create({
      data: {
        name: 'Performance Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    // Create workspace member
    await db.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'owner',
      },
    });

    // Create test pages and documents sequentially to handle foreign key constraints
    for (let i = 0; i < 50; i++) {
      const documentId = `perf-doc-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await db.page.create({
        data: {
          workspaceId: workspace.id,
          title: `Performance Page ${i}`,
          documentId,
          position: i,
          permissions: {},
        },
      });

      await db.document.create({
        data: {
          id: documentId,
          state: Buffer.from([]),
          version: 0,
          sizeBytes: 0,
        },
      });
    }

    const startTime = Date.now();

    const result = await db.workspace.findUnique({
      where: { id: workspace.id },
      include: {
        pages: {
          take: 10,
          orderBy: { position: 'asc' },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    expect(result.pages).toHaveLength(10);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle complex queries with joins efficiently', async () => {
    // Create test data first
    const uniqueEmail = `complex-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: 'Complex Query User',
        provider: 'email',
      },
    });

    await db.workspace.create({
      data: {
        name: 'Complex Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    const startTime = Date.now();

    const workspaces = await db.workspace.findMany({
      include: {
        owner: true,
        pages: {
          include: {
            document: true,
          },
          take: 5,
        },
        _count: {
          select: {
            pages: true,
            members: true,
          },
        },
      },
      take: 10,
    });

    const duration = Date.now() - startTime;

    expect(Array.isArray(workspaces)).toBe(true);
    expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
  });

  it('should handle pagination efficiently', async () => {
    // Create test data for pagination
    const uniqueEmail = `pagination-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: 'Pagination User',
        provider: 'email',
      },
    });

    const workspace = await db.workspace.create({
      data: {
        name: 'Pagination Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    // Create a few pages for pagination test
    for (let i = 0; i < 5; i++) {
      const documentId = `pagination-doc-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await db.page.create({
        data: {
          workspaceId: workspace.id,
          title: `Pagination Page ${i}`,
          documentId,
          position: i,
          permissions: {},
        },
      });

      await db.document.create({
        data: {
          id: documentId,
          state: Buffer.from([]),
          version: 0,
          sizeBytes: 0,
        },
      });
    }

    const pageSize = 10;
    const startTime = Date.now();

    const pages = await db.page.findMany({
      take: pageSize,
      skip: 0,
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const duration = Date.now() - startTime;

    expect(Array.isArray(pages)).toBe(true);
    expect(pages.length).toBeLessThanOrEqual(pageSize);
    expect(pages.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(500); // Should complete within 500ms
  });
});
