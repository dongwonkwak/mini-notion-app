/**
 * 권한 관리 서비스 (RBAC - Role-Based Access Control)
 * 5단계 권한 레벨을 지원합니다: Guest, Viewer, Editor, Admin, Owner
 */

import { getPrisma } from '@editor/database';

const prisma = getPrisma();
import type { UserRole } from '@editor/types';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherits?: UserRole[];
}

export class PermissionService {
  // 권한 계층 구조 (낮은 숫자가 높은 권한)
  private readonly ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 0,
    admin: 1,
    editor: 2,
    viewer: 3,
    guest: 4
  };

  // 역할별 권한 정의
  private readonly ROLE_PERMISSIONS: RolePermissions[] = [
    {
      role: 'owner',
      permissions: [
        { resource: '*', action: '*' }, // 모든 권한
        { resource: 'workspace', action: 'delete' },
        { resource: 'workspace', action: 'transfer-ownership' },
        { resource: 'workspace', action: 'manage-billing' }
      ]
    },
    {
      role: 'admin',
      permissions: [
        { resource: 'workspace', action: 'read' },
        { resource: 'workspace', action: 'update' },
        { resource: 'workspace', action: 'manage-members' },
        { resource: 'workspace', action: 'manage-settings' },
        { resource: 'page', action: '*' },
        { resource: 'document', action: '*' },
        { resource: 'comment', action: '*' },
        { resource: 'file', action: '*' }
      ],
      inherits: ['editor']
    },
    {
      role: 'editor',
      permissions: [
        { resource: 'workspace', action: 'read' },
        { resource: 'page', action: 'create' },
        { resource: 'page', action: 'read' },
        { resource: 'page', action: 'update' },
        { resource: 'page', action: 'delete', conditions: { isOwner: true } },
        { resource: 'document', action: 'create' },
        { resource: 'document', action: 'read' },
        { resource: 'document', action: 'update' },
        { resource: 'document', action: 'delete', conditions: { isOwner: true } },
        { resource: 'comment', action: 'create' },
        { resource: 'comment', action: 'read' },
        { resource: 'comment', action: 'update', conditions: { isOwner: true } },
        { resource: 'comment', action: 'delete', conditions: { isOwner: true } },
        { resource: 'file', action: 'upload' },
        { resource: 'file', action: 'read' },
        { resource: 'file', action: 'delete', conditions: { isOwner: true } }
      ],
      inherits: ['viewer']
    },
    {
      role: 'viewer',
      permissions: [
        { resource: 'workspace', action: 'read' },
        { resource: 'page', action: 'read' },
        { resource: 'document', action: 'read' },
        { resource: 'comment', action: 'read' },
        { resource: 'file', action: 'read' }
      ],
      inherits: ['guest']
    },
    {
      role: 'guest',
      permissions: [
        { resource: 'page', action: 'read', conditions: { isPublic: true } },
        { resource: 'document', action: 'read', conditions: { isPublic: true } }
      ]
    }
  ];

  /**
   * 사용자의 워크스페이스 내 권한 확인
   */
  async checkPermission(
    userId: string,
    workspaceId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // 사용자의 워크스페이스 멤버십 확인
      const membership = await this.getUserWorkspaceMembership(userId, workspaceId);
      if (!membership) {
        // 게스트 권한으로 확인
        return this.hasPermission('guest', resource, action, context);
      }

      return this.hasPermission(membership.role as UserRole, resource, action, context);
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * 페이지별 세부 권한 확인
   */
  async checkPagePermission(
    userId: string,
    pageId: string,
    action: string
  ): Promise<boolean> {
    try {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
          workspace: {
            include: {
              members: {
                where: { userId }
              }
            }
          }
        }
      });

      if (!page) return false;

      const membership = page.workspace.members[0];
      if (!membership) {
        // 페이지가 공개인지 확인
        return this.hasPermission('guest', 'page', action, { isPublic: page.isPublic });
      }

      // 페이지 소유자인지 확인
      const isPageOwner = page.createdBy === userId;
      
      return this.hasPermission(membership.role as UserRole, 'page', action, { 
        isOwner: isPageOwner,
        isPublic: page.isPublic 
      });
    } catch (error) {
      console.error('Page permission check error:', error);
      return false;
    }
  }

  /**
   * 문서 편집 권한 확인
   */
  async checkDocumentPermission(
    userId: string,
    documentId: string,
    action: string
  ): Promise<boolean> {
    try {
      const page = await prisma.page.findFirst({
        where: { documentId },
        include: {
          workspace: {
            include: {
              members: {
                where: { userId }
              }
            }
          }
        }
      });

      if (!page) return false;

      const membership = page.workspace.members[0];
      if (!membership) {
        return this.hasPermission('guest', 'document', action, { isPublic: page.isPublic });
      }

      const isDocumentOwner = page.createdBy === userId;
      
      return this.hasPermission(membership.role as UserRole, 'document', action, { 
        isOwner: isDocumentOwner,
        isPublic: page.isPublic 
      });
    } catch (error) {
      console.error('Document permission check error:', error);
      return false;
    }
  }

  /**
   * 역할 기반 권한 확인
   */
  private hasPermission(
    role: UserRole,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    const rolePermissions = this.getRolePermissions(role);
    
    for (const permission of rolePermissions) {
      // 와일드카드 권한 확인
      if (permission.resource === '*' && permission.action === '*') {
        return true;
      }

      // 리소스별 와일드카드 권한 확인
      if (permission.resource === resource && permission.action === '*') {
        return this.checkConditions(permission.conditions, context);
      }

      // 정확한 권한 매치 확인
      if (permission.resource === resource && permission.action === action) {
        return this.checkConditions(permission.conditions, context);
      }
    }

    return false;
  }

  /**
   * 역할의 모든 권한 가져오기 (상속 포함)
   */
  private getRolePermissions(role: UserRole): Permission[] {
    const roleConfig = this.ROLE_PERMISSIONS.find(r => r.role === role);
    if (!roleConfig) return [];

    let permissions = [...roleConfig.permissions];

    // 상속된 권한 추가
    if (roleConfig.inherits) {
      for (const inheritedRole of roleConfig.inherits) {
        permissions = permissions.concat(this.getRolePermissions(inheritedRole));
      }
    }

    return permissions;
  }

  /**
   * 권한 조건 확인
   */
  private checkConditions(
    conditions?: Record<string, any>,
    context?: Record<string, any>
  ): boolean {
    if (!conditions) return true;
    if (!context) return false;

    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * 사용자의 워크스페이스 멤버십 정보 가져오기
   */
  private async getUserWorkspaceMembership(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId
      }
    });
  }

  /**
   * 워크스페이스에 사용자 초대
   */
  async inviteUserToWorkspace(
    inviterId: string,
    workspaceId: string,
    email: string,
    role: UserRole
  ): Promise<boolean> {
    try {
      // 초대자의 권한 확인
      const canInvite = await this.checkPermission(
        inviterId,
        workspaceId,
        'workspace',
        'manage-members'
      );

      if (!canInvite) {
        throw new Error('멤버 초대 권한이 없습니다.');
      }

      // 초대할 사용자 찾기
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 이미 멤버인지 확인
      const existingMember = await this.getUserWorkspaceMembership(user.id, workspaceId);
      if (existingMember) {
        throw new Error('이미 워크스페이스 멤버입니다.');
      }

      // 멤버 추가
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId,
          role
        }
      });

      return true;
    } catch (error) {
      console.error('User invitation error:', error);
      throw error;
    }
  }

  /**
   * 멤버 역할 변경
   */
  async updateMemberRole(
    updaterId: string,
    workspaceId: string,
    targetUserId: string,
    newRole: UserRole
  ): Promise<boolean> {
    try {
      // 업데이터의 권한 확인
      const canManageMembers = await this.checkPermission(
        updaterId,
        workspaceId,
        'workspace',
        'manage-members'
      );

      if (!canManageMembers) {
        throw new Error('멤버 관리 권한이 없습니다.');
      }

      // 자신의 역할은 변경할 수 없음 (소유자 제외)
      if (updaterId === targetUserId) {
        const updaterMembership = await this.getUserWorkspaceMembership(updaterId, workspaceId);
        if (updaterMembership?.role !== 'owner') {
          throw new Error('자신의 역할은 변경할 수 없습니다.');
        }
      }

      // 소유자 역할은 소유자만 부여 가능
      if (newRole === 'owner') {
        const updaterMembership = await this.getUserWorkspaceMembership(updaterId, workspaceId);
        if (updaterMembership?.role !== 'owner') {
          throw new Error('소유자 권한은 소유자만 부여할 수 있습니다.');
        }
      }

      // 역할 업데이트
      await prisma.workspaceMember.updateMany({
        where: {
          userId: targetUserId,
          workspaceId
        },
        data: { role: newRole }
      });

      return true;
    } catch (error) {
      console.error('Member role update error:', error);
      throw error;
    }
  }

  /**
   * 워크스페이스에서 멤버 제거
   */
  async removeMemberFromWorkspace(
    removerId: string,
    workspaceId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      // 제거자의 권한 확인
      const canManageMembers = await this.checkPermission(
        removerId,
        workspaceId,
        'workspace',
        'manage-members'
      );

      if (!canManageMembers) {
        throw new Error('멤버 관리 권한이 없습니다.');
      }

      // 소유자는 제거할 수 없음
      const targetMembership = await this.getUserWorkspaceMembership(targetUserId, workspaceId);
      if (targetMembership?.role === 'owner') {
        throw new Error('소유자는 제거할 수 없습니다.');
      }

      // 멤버 제거
      await prisma.workspaceMember.deleteMany({
        where: {
          userId: targetUserId,
          workspaceId
        }
      });

      return true;
    } catch (error) {
      console.error('Member removal error:', error);
      throw error;
    }
  }

  /**
   * 사용자의 모든 워크스페이스 권한 가져오기
   */
  async getUserWorkspacePermissions(userId: string): Promise<Array<{
    workspaceId: string;
    workspaceName: string;
    role: UserRole;
    permissions: Permission[];
  }>> {
    try {
      const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        include: {
          workspace: true
        }
      });

      return memberships.map(membership => ({
        workspaceId: membership.workspaceId,
        workspaceName: membership.workspace.name,
        role: membership.role as UserRole,
        permissions: this.getRolePermissions(membership.role as UserRole)
      }));
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  /**
   * 권한 레벨 비교 (높은 권한인지 확인)
   */
  isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return this.ROLE_HIERARCHY[role1] < this.ROLE_HIERARCHY[role2];
  }

  /**
   * 최소 필요 권한 확인
   */
  hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.ROLE_HIERARCHY[userRole] <= this.ROLE_HIERARCHY[requiredRole];
  }
}