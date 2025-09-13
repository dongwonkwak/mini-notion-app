import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  WorkspaceService,
  DocumentService,
  UserService,
  cleanDatabase,
  prisma,
} from '../index';

describe('Database Utilities', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('UserService', () => {
    it('should find or create user', async () => {
      const userService = new UserService();
      const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const userData = {
        email: uniqueEmail,
        name: 'Test User',
        provider: 'email',
      };

      // First call should create user
      const user1 = await userService.findOrCreateUser(userData);
      expect(user1.email).toBe(userData.email);
      expect(user1.name).toBe(userData.name);

      // Second call should return existing user
      const user2 = await userService.findOrCreateUser(userData);
      expect(user2.id).toBe(user1.id);
    });

    it('should update user last activity', async () => {
      const userService = new UserService();
      const uniqueEmail = `activity-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Activity User',
          provider: 'email',
        },
      });

      const originalActivity = user.lastActiveAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await userService.updateLastActivity(user.id);

      const updatedUser = await prisma().user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.lastActiveAt.getTime()).toBeGreaterThan(
        originalActivity.getTime()
      );
    });

    it('should get user workspaces', async () => {
      const userService = new UserService();
      const uniqueEmail = `workspace-user-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Workspace User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Test Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      const workspaces = await userService.getUserWorkspaces(user.id);

      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].id).toBe(workspace.id);
      expect(workspaces[0].name).toBe('Test Workspace');
    });
  });

  describe('WorkspaceService', () => {
    it('should check workspace access', async () => {
      const workspaceService = new WorkspaceService();
      const uniqueEmail = `access-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Access User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Access Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      await prisma().workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'editor',
        },
      });

      const hasAccess = await workspaceService.hasAccess(user.id, workspace.id);
      expect(hasAccess).toBe(true);

      const noAccess = await workspaceService.hasAccess(
        'non-existent-user',
        workspace.id
      );
      expect(noAccess).toBe(false);
    });

    it('should get user role in workspace', async () => {
      const workspaceService = new WorkspaceService();
      const uniqueEmail = `role-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Role User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Role Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      await prisma().workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'admin',
        },
      });

      const role = await workspaceService.getUserRole(user.id, workspace.id);
      expect(role).toBe('admin');

      const noRole = await workspaceService.getUserRole(
        'non-existent-user',
        workspace.id
      );
      expect(noRole).toBeNull();
    });

    it('should check action permissions', async () => {
      const workspaceService = new WorkspaceService();
      const uniqueEmail = `permission-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Permission User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Permission Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      await prisma().workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'editor',
        },
      });

      const canRead = await workspaceService.canPerformAction(
        user.id,
        workspace.id,
        'read'
      );
      expect(canRead).toBe(true);

      const canWrite = await workspaceService.canPerformAction(
        user.id,
        workspace.id,
        'write'
      );
      expect(canWrite).toBe(true);

      const canAdmin = await workspaceService.canPerformAction(
        user.id,
        workspace.id,
        'admin'
      );
      expect(canAdmin).toBe(false);
    });
  });

  describe('DocumentService', () => {
    it('should get document with page information', async () => {
      const documentService = new DocumentService();
      const uniqueEmail = `doc-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Doc User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Doc Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const page = await prisma().page.create({
        data: {
          workspaceId: workspace.id,
          title: 'Doc Page',
          documentId,
          permissions: {},
        },
      });

      const document = await prisma().document.create({
        data: {
          id: page.documentId,
          state: Buffer.from('test state'),
          version: 1,
          sizeBytes: 10,
        },
      });

      const docWithPage = await documentService.getDocumentWithPage(
        document.id
      );

      expect(docWithPage).toBeDefined();
      expect(docWithPage?.id).toBe(document.id);
      expect(docWithPage?.page.title).toBe('Doc Page');
      expect(docWithPage?.page.workspace.name).toBe('Doc Workspace');
    });

    it('should update document state', async () => {
      const documentService = new DocumentService();
      // Create required dependencies first
      const uniqueEmail = `update-doc-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'Update Doc User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'Update Doc Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      const page = await prisma().page.create({
        data: {
          workspaceId: workspace.id,
          title: 'Update Doc Page',
          documentId: 'update-doc-123',
          permissions: {},
        },
      });

      const document = await prisma().document.create({
        data: {
          id: page.documentId,
          state: Buffer.from('old state'),
          version: 1,
          sizeBytes: 9,
        },
      });

      const newState = Buffer.from('new state');
      const newVersion = 2;

      await documentService.updateDocumentState(
        document.id,
        newState,
        newVersion
      );

      const updatedDoc = await prisma().document.findUnique({
        where: { id: document.id },
      });

      expect(Buffer.from(updatedDoc?.state || [])).toEqual(newState);
      expect(updatedDoc?.version).toBe(newVersion);
      expect(updatedDoc?.sizeBytes).toBe(newState.length);
    });

    it('should create history entry', async () => {
      const documentService = new DocumentService();
      const uniqueEmail = `history-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const user = await prisma().user.create({
        data: {
          email: uniqueEmail,
          name: 'History User',
          provider: 'email',
        },
      });

      const workspace = await prisma().workspace.create({
        data: {
          name: 'History Workspace',
          ownerId: user.id,
          settings: {},
        },
      });

      const documentId = `history-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const page = await prisma().page.create({
        data: {
          workspaceId: workspace.id,
          title: 'History Page',
          documentId,
          permissions: {},
        },
      });

      const document = await prisma().document.create({
        data: {
          id: page.documentId,
          state: Buffer.from('current state'),
          version: 1,
          sizeBytes: 13,
        },
      });

      const historyState = Buffer.from('history state');
      const historyVersion = 1;

      await documentService.createHistoryEntry(
        document.id,
        historyState,
        historyVersion,
        user.id
      );

      const history = await prisma().documentHistory.findFirst({
        where: { documentId: document.id },
      });

      expect(history).toBeDefined();
      expect(Buffer.from(history?.state || [])).toEqual(historyState);
      expect(history?.version).toBe(historyVersion);
      expect(history?.createdBy).toBe(user.id);
    });
  });
});
