/**
 * PermissionService 단위 테스트
 * RBAC 권한 시스템 테스트
 */

import { PermissionService } from '../PermissionService';

// 모킹
jest.mock('@editor/database', () => {
  const mockPrismaClient = {
    workspaceMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    page: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    getPrisma: jest.fn(() => mockPrismaClient),
  };
});

// getPrisma 모킹된 함수에서 반환되는 객체 가져오기
const { getPrisma } = require('@editor/database');
const mockPrisma = getPrisma();

describe('PermissionService', () => {
  let permissionService: PermissionService;

  beforeEach(() => {
    permissionService = new PermissionService();
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should allow owner to perform any action', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        workspaceId: 'workspace-1',
        role: 'owner',
        joinedAt: new Date(),
      });

      // Act
      const result = await permissionService.checkPermission(
        'user-1',
        'workspace-1',
        'workspace',
        'delete'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should deny viewer from editing documents', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-2',
        userId: 'user-2',
        workspaceId: 'workspace-1',
        role: 'viewer',
        joinedAt: new Date(),
      });

      // Act
      const result = await permissionService.checkPermission(
        'user-2',
        'workspace-1',
        'document',
        'update'
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should allow editor to read and update documents', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-3',
        userId: 'user-3',
        workspaceId: 'workspace-1',
        role: 'editor',
        joinedAt: new Date(),
      });

      // Act
      const readResult = await permissionService.checkPermission(
        'user-3',
        'workspace-1',
        'document',
        'read'
      );

      const updateResult = await permissionService.checkPermission(
        'user-3',
        'workspace-1',
        'document',
        'update'
      );

      // Assert
      expect(readResult).toBe(true);
      expect(updateResult).toBe(true);
    });

    it('should allow admin to manage members', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-4',
        userId: 'user-4',
        workspaceId: 'workspace-1',
        role: 'admin',
        joinedAt: new Date(),
      });

      // Act
      const result = await permissionService.checkPermission(
        'user-4',
        'workspace-1',
        'workspace',
        'manage-members'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should use guest permissions for non-members', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue(null);

      // Act
      const result = await permissionService.checkPermission(
        'user-5',
        'workspace-1',
        'page',
        'read',
        { isPublic: true }
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('checkPagePermission', () => {
    it('should allow page owner to delete their page', async () => {
      // Arrange
      const mockPage = {
        id: 'page-1',
        createdBy: 'user-1',
        isPublic: false,
        workspace: {
          members: [
            {
              userId: 'user-1',
              role: 'editor',
            },
          ],
        },
      };

      mockPrisma.page.findUnique.mockResolvedValue(mockPage as any);

      // Act
      const result = await permissionService.checkPagePermission(
        'user-1',
        'page-1',
        'delete'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should deny non-owner from deleting page', async () => {
      // Arrange
      const mockPage = {
        id: 'page-1',
        createdBy: 'user-1',
        isPublic: false,
        workspace: {
          members: [
            {
              userId: 'user-2',
              role: 'editor',
            },
          ],
        },
      };

      mockPrisma.page.findUnique.mockResolvedValue(mockPage as any);

      // Act
      const result = await permissionService.checkPagePermission(
        'user-2',
        'page-1',
        'delete'
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should allow reading public pages for guests', async () => {
      // Arrange
      const mockPage = {
        id: 'page-1',
        createdBy: 'user-1',
        isPublic: true,
        workspace: {
          members: [],
        },
      };

      mockPrisma.page.findUnique.mockResolvedValue(mockPage as any);

      // Act
      const result = await permissionService.checkPagePermission(
        'guest-user',
        'page-1',
        'read'
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('inviteUserToWorkspace', () => {
    it('should allow admin to invite new members', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst
        .mockResolvedValueOnce({
          id: 'member-1',
          userId: 'admin-user',
          workspaceId: 'workspace-1',
          role: 'admin',
          joinedAt: new Date(),
        })
        .mockResolvedValueOnce(null); // No existing membership for invitee

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'new-user',
        email: 'newuser@example.com',
        name: 'New User',
      });

      mockPrisma.workspaceMember.create.mockResolvedValue({
        id: 'new-member',
        userId: 'new-user',
        workspaceId: 'workspace-1',
        role: 'editor',
        joinedAt: new Date(),
      });

      // Act
      const result = await permissionService.inviteUserToWorkspace(
        'admin-user',
        'workspace-1',
        'newuser@example.com',
        'editor'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.workspaceMember.create).toHaveBeenCalledWith({
        data: {
          userId: 'new-user',
          workspaceId: 'workspace-1',
          role: 'editor',
        },
      });
    });

    it('should deny viewer from inviting members', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-1',
        userId: 'viewer-user',
        workspaceId: 'workspace-1',
        role: 'viewer',
        joinedAt: new Date(),
      });

      // Act & Assert
      await expect(
        permissionService.inviteUserToWorkspace(
          'viewer-user',
          'workspace-1',
          'newuser@example.com',
          'editor'
        )
      ).rejects.toThrow('멤버 초대 권한이 없습니다.');
    });

    it('should prevent inviting already existing members', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst
        .mockResolvedValueOnce({
          id: 'member-1',
          userId: 'admin-user',
          workspaceId: 'workspace-1',
          role: 'admin',
          joinedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'existing-member',
          userId: 'existing-user',
          workspaceId: 'workspace-1',
          role: 'editor',
          joinedAt: new Date(),
        });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
        name: 'Existing User',
      });

      // Act & Assert
      await expect(
        permissionService.inviteUserToWorkspace(
          'admin-user',
          'workspace-1',
          'existing@example.com',
          'editor'
        )
      ).rejects.toThrow('이미 워크스페이스 멤버입니다.');
    });
  });

  describe('updateMemberRole', () => {
    it('should allow admin to update member roles', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-1',
        userId: 'admin-user',
        workspaceId: 'workspace-1',
        role: 'admin',
        joinedAt: new Date(),
      });

      mockPrisma.workspaceMember.update.mockResolvedValue({
        id: 'member-2',
        userId: 'target-user',
        workspaceId: 'workspace-1',
        role: 'editor',
        joinedAt: new Date(),
      });

      // Act
      const result = await permissionService.updateMemberRole(
        'admin-user',
        'workspace-1',
        'target-user',
        'editor'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.workspaceMember.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'target-user',
          workspaceId: 'workspace-1',
        },
        data: { role: 'editor' },
      });
    });

    it('should prevent non-owners from assigning owner role', async () => {
      // Arrange
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        id: 'member-1',
        userId: 'admin-user',
        workspaceId: 'workspace-1',
        role: 'admin', // Not owner
        joinedAt: new Date(),
      });

      // Act & Assert
      await expect(
        permissionService.updateMemberRole(
          'admin-user',
          'workspace-1',
          'target-user',
          'owner'
        )
      ).rejects.toThrow('소유자 권한은 소유자만 부여할 수 있습니다.');
    });
  });

  describe('isHigherRole', () => {
    it('should correctly compare role hierarchy', () => {
      // Act & Assert
      expect(permissionService.isHigherRole('owner', 'admin')).toBe(true);
      expect(permissionService.isHigherRole('admin', 'editor')).toBe(true);
      expect(permissionService.isHigherRole('editor', 'viewer')).toBe(true);
      expect(permissionService.isHigherRole('viewer', 'guest')).toBe(true);

      expect(permissionService.isHigherRole('guest', 'owner')).toBe(false);
      expect(permissionService.isHigherRole('editor', 'admin')).toBe(false);
    });
  });

  describe('hasMinimumRole', () => {
    it('should check minimum role requirements', () => {
      // Act & Assert
      expect(permissionService.hasMinimumRole('owner', 'admin')).toBe(true);
      expect(permissionService.hasMinimumRole('admin', 'admin')).toBe(true);
      expect(permissionService.hasMinimumRole('editor', 'admin')).toBe(false);

      expect(permissionService.hasMinimumRole('editor', 'viewer')).toBe(true);
      expect(permissionService.hasMinimumRole('viewer', 'editor')).toBe(false);
    });
  });
});
