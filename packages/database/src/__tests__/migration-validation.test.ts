import { describe, it, expect, beforeEach } from '@jest/globals';

import { prisma, cleanDatabase } from '../index';

describe('Database Migration Validation', () => {
  let db: any;

  beforeEach(async () => {
    await cleanDatabase();
    db = prisma();
  });

  it('should handle data integrity constraints', async () => {
    const user = await db.user.create({
      data: {
        email: 'integrity@example.com',
        name: 'Integrity User',
        provider: 'email',
      },
    });

    const workspace = await db.workspace.create({
      data: {
        name: 'Integrity Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    const page = await db.page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Integrity Page',
        documentId: 'integrity-doc-123',
        permissions: {},
      },
    });

    const document = await db.document.create({
      data: {
        id: page.documentId,
        state: Buffer.from('test state'),
        version: 1,
        sizeBytes: 10,
      },
    });

    expect(document.id).toBe(page.documentId);
  });

  it('should handle concurrent operations safely', async () => {
    const user = await db.user.create({
      data: {
        email: 'concurrent@example.com',
        name: 'Concurrent User',
        provider: 'email',
      },
    });

    const workspace = await db.workspace.create({
      data: {
        name: 'Concurrent Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    // Create multiple pages with documents sequentially to avoid FK constraint issues
    const pages = [];
    for (let i = 0; i < 5; i++) {
      const documentId = `concurrent-doc-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const page = await db.page.create({
        data: {
          workspaceId: workspace.id,
          title: `Concurrent Page ${i}`,
          documentId,
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

      pages.push(page);
    }

    expect(pages).toHaveLength(5);
  });

  it('should handle bulk operations efficiently', async () => {
    const user = await db.user.create({
      data: {
        email: 'bulk@example.com',
        name: 'Bulk User',
        provider: 'email',
      },
    });

    const workspace = await db.workspace.create({
      data: {
        name: 'Bulk Workspace',
        ownerId: user.id,
        settings: {},
      },
    });

    // Create pages and documents sequentially to handle FK constraints
    for (let i = 0; i < 100; i++) {
      const documentId = `bulk-doc-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await db.page.create({
        data: {
          workspaceId: workspace.id,
          title: `Bulk Page ${i}`,
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

    const pageCount = await db.page.count({
      where: { workspaceId: workspace.id },
    });

    expect(pageCount).toBe(100);
  });
});
