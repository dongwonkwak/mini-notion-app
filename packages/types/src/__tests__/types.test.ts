import { describe, expect, it } from '@jest/globals';

import type {
  ApiResponse,
  AwarenessState,
  Block,
  BlockType,
  Comment,
  User,
  UserPermission,
  Workspace,
} from '../index';

describe('Type Definitions', () => {
  it('should define User interface correctly', () => {
    const user: User = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      provider: 'email',
      mfaEnabled: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    expect(user.id).toBe('user-123');
    expect(user.email).toBe('test@example.com');
    expect(user.provider).toBe('email');
    expect(user.mfaEnabled).toBe(false);
  });

  it('should define Workspace interface correctly', () => {
    const workspace: Workspace = {
      id: 'workspace-123',
      name: 'Test Workspace',
      ownerId: 'user-123',
      members: [
        {
          userId: 'user-123',
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      settings: {
        isPublic: false,
        allowInvites: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(workspace.members[0]?.role).toBe('owner');
    expect(workspace.settings.isPublic).toBe(false);
  });

  it('should define Block interface with all block types', () => {
    const blockTypes: BlockType[] = [
      'paragraph',
      'heading',
      'list',
      'code',
      'image',
      'table',
      'quote',
      'divider',
      'file',
    ];

    blockTypes.forEach(type => {
      const block: Block = {
        id: `block-${type}`,
        type: type,
        content: {},
        position: 0,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-123',
          version: 1,
        },
      };

      expect(block.type).toBe(type);
      expect(block.metadata.version).toBe(1);
    });
  });

  it('should define AwarenessState interface correctly', () => {
    const awarenessState: AwarenessState = {
      user: {
        id: 'user-123',
        name: 'Test User',
        color: '#ff0000',
      },
      cursor: {
        anchor: 0,
        head: 10,
      },
      selection: {
        from: 0,
        to: 10,
      },
      lastActivity: Date.now(),
    };

    expect(awarenessState.user.color).toBe('#ff0000');
    expect(awarenessState.cursor?.anchor).toBe(0);
    expect(awarenessState.selection?.from).toBe(0);
  });

  it('should define ApiResponse interface correctly', () => {
    const successResponse: ApiResponse<User> = {
      success: true,
      data: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'email',
        mfaEnabled: false,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      },
    };

    const errorResponse: ApiResponse = {
      success: false,
      error: 'User not found',
      message: 'The requested user does not exist',
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data?.id).toBe('user-123');
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('User not found');
  });

  it('should define UserPermission type correctly', () => {
    const permissions: UserPermission[] = ['read', 'write', 'admin'];

    permissions.forEach(permission => {
      expect(['read', 'write', 'admin']).toContain(permission);
    });
  });

  it('should define Comment interface with thread support', () => {
    const parentComment: Comment = {
      id: 'comment-1',
      documentId: 'doc-123',
      authorId: 'user-123',
      content: 'This is a parent comment',
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const replyComment: Comment = {
      id: 'comment-2',
      documentId: 'doc-123',
      parentId: 'comment-1',
      authorId: 'user-456',
      content: 'This is a reply',
      positionStart: 10,
      positionEnd: 20,
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(parentComment.parentId).toBeUndefined();
    expect(replyComment.parentId).toBe('comment-1');
    expect(replyComment.positionStart).toBe(10);
  });
});
