import { beforeEach, describe, expect, it, afterEach } from '@jest/globals';
import { prisma, checkDatabaseHealth, cleanDatabase } from '../index';

describe('Prisma Database Connection', () => {
  // Clean up before and after each test to ensure isolation
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should connect to database successfully', async () => {
    const isHealthy = await checkDatabaseHealth();
    expect(isHealthy).toBe(true);
  });

  it('should create and retrieve a user', async () => {
    const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const userData = {
      email: uniqueEmail,
      name: 'Test User',
      provider: 'email',
    };

    const user = await prisma().user.create({
      data: userData,
    });

    expect(user.email).toBe(userData.email);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();

    const retrievedUser = await prisma().user.findUnique({
      where: { id: user.id },
    });

    expect(retrievedUser).toBeTruthy();
    expect(retrievedUser?.email).toBe(userData.email);
  });

  it('should enforce unique email constraint', async () => {
    const uniqueEmail = `duplicate-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const userData = {
      email: uniqueEmail,
      name: 'Test User',
      provider: 'email',
    };

    await prisma().user.create({ data: userData });

    await expect(prisma().user.create({ data: userData })).rejects.toThrow();
  });
});

describe('Workspace and Page Relations', () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const uniqueEmail = `workspace-test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const user = await prisma().user.create({
      data: {
        email: uniqueEmail,
        name: 'Workspace Test User',
        provider: 'email',
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create workspace with owner relationship', async () => {
    const workspace = await prisma().workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        settings: {},
      },
      include: {
        owner: true,
      },
    });

    // Create workspace member separately
    const member = await prisma().workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: userId,
        role: 'owner',
      },
    });

    expect(workspace.name).toBe('Test Workspace');
    expect(workspace.ownerId).toBe(userId);
    expect(workspace.owner.id).toBe(userId);
    expect(member.role).toBe('owner');
  });

  it('should create page with document relationship', async () => {
    const workspace = await prisma().workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        settings: {},
      },
    });

    const documentId = `test-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const page = await prisma().page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Test Page',
        documentId,
        permissions: {
          read: ['*'],
          write: ['owner', 'editor'],
        },
      },
    });

    const document = await prisma().document.create({
      data: {
        id: page.documentId,
        state: Buffer.from([]),
        version: 0,
        sizeBytes: 0,
      },
    });

    expect(page.title).toBe('Test Page');
    expect(page.documentId).toBe(documentId);
    expect(document.id).toBe(page.documentId);
    expect(document.version).toBe(0);
  });

  it('should support page hierarchy', async () => {
    const workspace = await prisma().workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: userId,
        settings: {},
      },
    });

    const parentDocId = `parent-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const childDocId = `child-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const parentPage = await prisma().page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Parent Page',
        documentId: parentDocId,
        permissions: {},
      },
    });

    await prisma().document.create({
      data: {
        id: parentPage.documentId,
        state: Buffer.from([]),
        version: 0,
        sizeBytes: 0,
      },
    });

    const childPage = await prisma().page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Child Page',
        documentId: childDocId,
        parentId: parentPage.id,
        permissions: {},
      },
    });

    await prisma().document.create({
      data: {
        id: childPage.documentId,
        state: Buffer.from([]),
        version: 0,
        sizeBytes: 0,
      },
    });

    const pageWithChildren = await prisma().page.findUnique({
      where: { id: parentPage.id },
      include: { children: true },
    });

    expect(pageWithChildren).toBeTruthy();
    expect(pageWithChildren?.children).toHaveLength(1);
    expect(pageWithChildren?.children[0].title).toBe('Child Page');
    expect(childPage.parentId).toBe(parentPage.id);
  });
});
