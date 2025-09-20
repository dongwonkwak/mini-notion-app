/**
 * 타입 정의 테스트
 * 
 * 공통 타입들의 구조와 호환성을 검증하는 테스트입니다.
 * 컴파일 타임과 런타임에서 타입 안전성을 보장합니다.
 * 
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest'
import type {
  // 공통 타입들
  ID,
  Timestamp,
  BaseEntity,
  PaginatedResponse,
  ApiResponse,
  
  // 사용자 타입들
  User,
  UserRole,
  CreateUserDto,
  
  // 문서 타입들
  Block,
  BlockType,
  DocumentContent,
  
  // 협업 타입들
  CollaborationUser,
  CursorPosition,
  YjsUpdate,
  
  // 에디터 타입들
  EditorBlock,
  SlashCommand,
  CommandAction
} from '../src/types'

describe('Common Types', () => {
  it('should have correct base entity structure', () => {
    const entity: BaseEntity = {
      id: 'test-id',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    expect(typeof entity.id).toBe('string')
    expect(typeof entity.createdAt).toBe('number')
    expect(typeof entity.updatedAt).toBe('number')
  })
  
  it('should support paginated response structure', () => {
    const response: PaginatedResponse<{ name: string }> = {
      data: [{ name: 'test' }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    }
    
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.pagination.page).toBe(1)
  })
  
  it('should support API response structure', () => {
    const successResponse: ApiResponse<string> = {
      success: true,
      data: 'test data'
    }
    
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Test error message'
      }
    }
    
    expect(successResponse.success).toBe(true)
    expect(successResponse.data).toBe('test data')
    expect(errorResponse.success).toBe(false)
    expect(errorResponse.error?.code).toBe('TEST_ERROR')
  })
})

describe('User Types', () => {
  it('should have correct user structure', () => {
    const user: User = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'editor',
      status: 'active',
      profile: {
        displayName: 'Test User'
      },
      preferences: {
        theme: 'light',
        language: 'ko',
        timezone: 'Asia/Seoul',
        notifications: {
          email: true,
          push: false,
          mentions: true,
          comments: true,
          documentShares: false
        },
        editor: {
          fontSize: 14,
          lineHeight: 1.6,
          showLineNumbers: false
        }
      },
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    expect(user.role).toBe('editor')
    expect(user.profile.displayName).toBe('Test User')
    expect(user.preferences.theme).toBe('light')
  })
  
  it('should support user role types', () => {
    const roles: UserRole[] = ['owner', 'admin', 'editor', 'viewer']
    
    roles.forEach(role => {
      expect(['owner', 'admin', 'editor', 'viewer']).toContain(role)
    })
  })
  
  it('should support create user DTO', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'securePassword123',
      displayName: 'New User',
      language: 'ko'
    }
    
    expect(createUserDto.email).toBe('newuser@example.com')
    expect(createUserDto.displayName).toBe('New User')
  })
})

describe('Document Types', () => {
  it('should have correct block structure', () => {
    const block: Block = {
      id: 'block-123',
      type: 'paragraph',
      content: {
        text: 'Hello, World!'
      },
      properties: {
        align: 'left'
      },
      children: [],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-456',
        updatedBy: 'user-456',
        version: 1
      }
    }
    
    expect(block.type).toBe('paragraph')
    expect(block.content.text).toBe('Hello, World!')
    expect(block.metadata.version).toBe(1)
  })
  
  it('should support block types', () => {
    const blockTypes: BlockType[] = [
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'code',
      'blockquote',
      'table',
      'image',
      'divider',
      'todo',
      'callout',
      'embed'
    ]
    
    blockTypes.forEach(type => {
      expect(typeof type).toBe('string')
    })
  })
  
  it('should have correct document content structure', () => {
    const content: DocumentContent = {
      blocks: [],
      version: 1,
      checksum: 'abc123'
    }
    
    expect(Array.isArray(content.blocks)).toBe(true)
    expect(content.version).toBe(1)
    expect(content.checksum).toBe('abc123')
  })
})

describe('Collaboration Types', () => {
  it('should have correct collaboration user structure', () => {
    const collaborationUser: CollaborationUser = {
      id: 'user-123',
      name: 'John Doe',
      color: '#3b82f6',
      status: 'active',
      lastSeen: Date.now()
    }
    
    expect(collaborationUser.id).toBe('user-123')
    expect(collaborationUser.status).toBe('active')
    expect(collaborationUser.color).toBe('#3b82f6')
  })
  
  it('should have correct cursor position structure', () => {
    const cursor: CursorPosition = {
      userId: 'user-123',
      position: 150,
      visible: true,
      color: '#3b82f6'
    }
    
    expect(cursor.userId).toBe('user-123')
    expect(cursor.position).toBe(150)
    expect(cursor.visible).toBe(true)
  })
  
  it('should have correct Y.js update structure', () => {
    const update: YjsUpdate = {
      documentId: 'doc-123',
      type: 'content',
      data: new Uint8Array([1, 2, 3]),
      userId: 'user-456',
      timestamp: Date.now(),
      version: 26,
      size: 3
    }
    
    expect(update.documentId).toBe('doc-123')
    expect(update.type).toBe('content')
    expect(update.data instanceof Uint8Array).toBe(true)
    expect(update.size).toBe(3)
  })
})

describe('Editor Types', () => {
  it('should have correct editor block structure', () => {
    const editorBlock: EditorBlock = {
      type: 'paragraph',
      attrs: {
        textAlign: 'left'
      },
      content: [
        {
          type: 'text',
          text: 'Hello, World!',
          marks: []
        }
      ]
    }
    
    expect(editorBlock.type).toBe('paragraph')
    expect(editorBlock.attrs?.textAlign).toBe('left')
    expect(Array.isArray(editorBlock.content)).toBe(true)
  })
  
  it('should have correct slash command structure', () => {
    const command: SlashCommand = {
      id: 'heading-1',
      title: '제목 1',
      description: '큰 제목을 추가합니다',
      icon: 'H1',
      category: 'heading',
      keywords: ['제목', '헤딩', 'h1'],
      action: () => ({
        type: 'setBlockType',
        blockType: 'heading',
        attrs: { level: 1 }
      })
    }
    
    expect(command.id).toBe('heading-1')
    expect(command.category).toBe('heading')
    expect(Array.isArray(command.keywords)).toBe(true)
    expect(typeof command.action).toBe('function')
  })
  
  it('should have correct command action structure', () => {
    const action: CommandAction = {
      type: 'setBlockType',
      blockType: 'heading',
      attrs: { level: 1 }
    }
    
    expect(action.type).toBe('setBlockType')
    expect(action.blockType).toBe('heading')
    expect(action.attrs?.level).toBe(1)
  })
})

describe('Type Compatibility', () => {
  it('should allow ID to be used as string', () => {
    const id: ID = 'test-id-123'
    const stringId: string = id
    
    expect(stringId).toBe('test-id-123')
  })
  
  it('should allow Timestamp to be used as number', () => {
    const timestamp: Timestamp = Date.now()
    const numberTimestamp: number = timestamp
    
    expect(typeof numberTimestamp).toBe('number')
  })
  
  it('should support extending base entity', () => {
    interface CustomEntity extends BaseEntity {
      customField: string
    }
    
    const entity: CustomEntity = {
      id: 'custom-123',
      customField: 'custom value',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    expect(entity.customField).toBe('custom value')
    expect(typeof entity.id).toBe('string')
  })
})