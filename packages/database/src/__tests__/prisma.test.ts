import { beforeEach, describe, expect, it } from '@jest/globals';
import { prisma } from '../index';

describe('Prisma Database Connection', () => {
  it('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should create and retrieve a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      provider: 'email'
    };

    const user = await prisma.user.create({
      data: userData
    });

    expect(user).toMatchObject(userData);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();

    const retrievedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    expect(retrievedUser).toMatchObject(userData);
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'duplicate@example.com',
      name: 'Test User',
      provider: 'email'
    };

    await prisma.user.create({ data: userData });

    await expect(
      prisma.user.create({ data: userData })
    ).rejects.toThrow();
  });
});

describe('Workspace and Page Relations', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'workspace-test@example.com',
        name: 'Workspace Test User',
        provider: 'email'
      }
    });
    userId = user.id;
  });

  it('should create workspace with owner relationship', async () => {
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      },
      include: {
        members: true
      }
    });

    expect(workspace.name).toBe('Test Workspace');
    expect(workspace.ownerId).toBe(userId);
    expect(workspace.members).toHaveLength(1);
    expect(workspace.members[0].role).toBe('owner');
  });

  it('should create page with document relationship', async () => {
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      }
    });

    const page = await prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Test Page',
        documentId: 'test-doc-123',
        document: {
          create: {
            id: 'test-doc-123',
            state: Buffer.from([]),
            version: 0
          }
        }
      },
      include: {
        document: true
      }
    });

    expect(page.title).toBe('Test Page');
    expect(page.documentId).toBe('test-doc-123');
    expect(page.document).toBeDefined();
    expect(page.document?.version).toBe(0);
  });

  it('should support page hierarchy', async () => {
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      }
    });

    const parentPage = await prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Parent Page',
        documentId: 'parent-doc',
        document: {
          create: {
            id: 'parent-doc',
            state: Buffer.from([]),
            version: 0
          }
        }
      }
    });

    const childPage = await prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Child Page',
        documentId: 'child-doc',
        parentId: parentPage.id,
        document: {
          create: {
            id: 'child-doc',
            state: Buffer.from([]),
            version: 0
          }
        }
      }
    });

    const pageWithChildren = await prisma.page.findUnique({
      where: { id: parentPage.id },
      include: { children: true }
    });

    expect(pageWithChildren?.children).toHaveLength(1);
    expect(pageWithChildren?.children[0].title).toBe('Child Page');
    expect(childPage.parentId).toBe(parentPage.id);
  });
});