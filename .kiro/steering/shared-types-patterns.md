# 공통 타입 패키지 설계 패턴

모노레포에서 타입 안전성과 일관성을 보장하기 위한 공통 타입 패키지 설계 가이드라인입니다.

## 패키지 구조 전략

### 1. 타입 전용 패키지 vs 통합 패키지

**권장: 기능별 분리**
```
packages/
├── types/          # 순수 타입 정의만
├── shared/         # 공통 유틸리티 + 타입
└── contracts/      # API 계약 + 생성된 타입
```

**대안: 통합 관리**
```
packages/
├── shared/
│   ├── types/      # 타입 정의
│   ├── utils/      # 유틸리티 함수
│   └── constants/  # 상수 정의
└── contracts/      # API 계약
```

## packages/types 패키지 설계

### 디렉토리 구조
```
packages/types/
├── package.json
├── src/
│   ├── index.ts                    # 모든 타입 re-export
│   ├── common/                     # 공통 기본 타입
│   │   ├── index.ts
│   │   ├── base.types.ts          # 기본 타입 (ID, Timestamp 등)
│   │   ├── api.types.ts           # API 공통 타입
│   │   └── utility.types.ts       # 유틸리티 타입
│   ├── domain/                     # 도메인별 타입
│   │   ├── index.ts
│   │   ├── user.types.ts          # 사용자 관련 타입
│   │   ├── document.types.ts      # 문서 관련 타입
│   │   ├── workspace.types.ts     # 워크스페이스 관련 타입
│   │   └── collaboration.types.ts # 협업 관련 타입
│   ├── editor/                     # 에디터 특화 타입
│   │   ├── index.ts
│   │   ├── blocks.types.ts        # 블록 타입
│   │   ├── commands.types.ts      # 커맨드 타입
│   │   └── extensions.types.ts    # 확장 타입
│   └── events/                     # 이벤트 타입
│       ├── index.ts
│       ├── websocket.types.ts     # WebSocket 이벤트
│       └── yjs.types.ts           # Y.js 이벤트
└── tests/                          # 타입 테스트
    └── type-tests.ts
```

### package.json 설정
```json
{
  "name": "@mini-notion/types",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "tsc --noEmit && node tests/type-tests.js"
  },
  "devDependencies": {
    "@mini-notion/config": "workspace:*",
    "typescript": "^5.6.0"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./common": {
      "types": "./dist/common/index.d.ts",
      "default": "./dist/common/index.js"
    },
    "./domain": {
      "types": "./dist/domain/index.d.ts",
      "default": "./dist/domain/index.js"
    },
    "./editor": {
      "types": "./dist/editor/index.d.ts",
      "default": "./dist/editor/index.js"
    },
    "./events": {
      "types": "./dist/events/index.d.ts",
      "default": "./dist/events/index.js"
    }
  }
}
```

## 타입 정의 패턴

### 1. 기본 타입 정의

**src/common/base.types.ts**
```typescript
// 기본 식별자 타입
export type ID = string
export type UUID = string
export type Timestamp = number

// 기본 엔티티 인터페이스
export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

// 소프트 삭제 지원 엔티티
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Timestamp
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 2. API 응답 타입

**src/common/api.types.ts**
```typescript
// 표준 API 응답 형식
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// HTTP 상태 코드 타입
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500

// API 엔드포인트 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
```

### 3. 도메인 타입 정의

**src/domain/user.types.ts**
```typescript
import { BaseEntity } from '../common/base.types'

export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  mentions: boolean
  comments: boolean
}

// 사용자 생성/업데이트 DTO
export interface CreateUserDto {
  email: string
  name: string
  password: string
}

export interface UpdateUserDto {
  name?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}
```

**src/domain/document.types.ts**
```typescript
import { BaseEntity, ID } from '../common/base.types'

export interface Document extends BaseEntity {
  title: string
  content: DocumentContent
  workspaceId: ID
  authorId: ID
  collaborators: DocumentCollaborator[]
  permissions: DocumentPermissions
  version: number
}

export interface DocumentContent {
  blocks: Block[]
  version: number
  checksum: string
}

export interface Block {
  id: ID
  type: BlockType
  content: Record<string, unknown>
  children?: Block[]
  metadata?: BlockMetadata
}

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'code'
  | 'image'
  | 'table'
  | 'embed'

export interface BlockMetadata {
  createdAt: Timestamp
  updatedAt: Timestamp
  authorId: ID
}

export interface DocumentCollaborator {
  userId: ID
  role: 'editor' | 'viewer'
  joinedAt: Timestamp
}

export interface DocumentPermissions {
  public: boolean
  allowComments: boolean
  allowCopy: boolean
  shareSettings: ShareSettings
}

export interface ShareSettings {
  linkSharing: boolean
  linkPermission: 'viewer' | 'editor'
  expiresAt?: Timestamp
}
```

### 4. 에디터 특화 타입

**src/editor/blocks.types.ts**
```typescript
// Tiptap 에디터 블록 타입
export interface EditorBlock {
  id: string
  type: EditorBlockType
  attrs: Record<string, unknown>
  content?: EditorBlock[]
}

export type EditorBlockType =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'codeBlock'
  | 'blockquote'
  | 'horizontalRule'

// 슬래시 커맨드 타입
export interface SlashCommand {
  id: string
  title: string
  description: string
  icon: string
  category: CommandCategory
  action: () => void
  keywords: string[]
}

export type CommandCategory = 
  | 'basic'
  | 'formatting'
  | 'media'
  | 'advanced'
```

### 5. 실시간 협업 타입

**src/events/websocket.types.ts**
```typescript
// WebSocket 이벤트 타입
export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType
  payload: T
  timestamp: Timestamp
  userId: ID
  documentId?: ID
}

export type WebSocketEventType =
  | 'document:join'
  | 'document:leave'
  | 'document:update'
  | 'cursor:update'
  | 'selection:update'
  | 'user:typing'
  | 'user:idle'

// Y.js 협업 타입
export interface CollaborationState {
  users: CollaborationUser[]
  cursors: CursorPosition[]
  selections: SelectionRange[]
}

export interface CollaborationUser {
  id: ID
  name: string
  avatar?: string
  color: string
  isTyping: boolean
  lastSeen: Timestamp
}

export interface CursorPosition {
  userId: ID
  position: number
  visible: boolean
}

export interface SelectionRange {
  userId: ID
  from: number
  to: number
}
```

## 타입 사용 패턴

### 1. 선택적 Import
```typescript
// 특정 도메인 타입만 import
import type { User, UserRole } from '@mini-notion/types/domain'

// 공통 타입만 import
import type { ApiResponse, PaginatedResponse } from '@mini-notion/types/common'

// 전체 타입 import (권장하지 않음)
import type * as Types from '@mini-notion/types'
```

### 2. 타입 확장 패턴
```typescript
// 기본 타입 확장
import type { BaseEntity } from '@mini-notion/types/common'

interface CustomEntity extends BaseEntity {
  customField: string
}

// 유니온 타입 확장
import type { BlockType } from '@mini-notion/types/editor'

type ExtendedBlockType = BlockType | 'customBlock'
```

### 3. 제네릭 활용
```typescript
import type { ApiResponse, PaginatedResponse } from '@mini-notion/types/common'
import type { User } from '@mini-notion/types/domain'

// API 응답에 타입 적용
const getUsersResponse: ApiResponse<PaginatedResponse<User>> = await api.getUsers()
```

## 타입 테스트 패턴

### 1. 컴파일 타임 테스트
```typescript
// tests/type-tests.ts
import type { User, CreateUserDto } from '../src/domain/user.types'

// 타입 호환성 테스트
const testUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'editor',
  preferences: {
    theme: 'light',
    language: 'ko',
    notifications: {
      email: true,
      push: false,
      mentions: true,
      comments: true
    }
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
}

// DTO 타입 테스트
const createUserDto: CreateUserDto = {
  email: 'new@example.com',
  name: 'New User',
  password: 'password123'
}

// 타입 가드 테스트
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'email' in obj
}
```

### 2. 런타임 검증과 JSDoc 연동
```typescript
import { z } from 'zod'
import type { User } from '@mini-notion/types/domain'

/**
 * 사용자 데이터 런타임 검증 스키마
 * 
 * TypeScript 타입과 일치하는 Zod 스키마로 런타임에서 데이터 유효성을 검증합니다.
 * API 요청/응답, 폼 데이터 검증 등에 사용됩니다.
 * 
 * @example
 * ```typescript
 * // API 응답 검증
 * const userData = await api.getUser(userId)
 * const validUser = UserSchema.parse(userData)
 * 
 * // 폼 데이터 검증
 * const formResult = UserSchema.safeParse(formData)
 * if (formResult.success) {
 *   console.log('Valid user:', formResult.data)
 * }
 * ```
 * 
 * @security 입력 데이터 검증으로 보안 강화
 * @see {@link User} 대응하는 TypeScript 타입
 */
const UserSchema = z.object({
  id: z.string().min(1, '사용자 ID는 필수입니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().min(1, '이름은 필수입니다').max(50, '이름은 50자를 초과할 수 없습니다'),
  avatar: z.string().url('올바른 URL 형식이 아닙니다').optional(),
  role: z.enum(['owner', 'admin', 'editor', 'viewer'], {
    errorMap: () => ({ message: '올바른 사용자 역할이 아닙니다' })
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string().min(2).max(5),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(), 
      mentions: z.boolean(),
      comments: z.boolean()
    })
  }),
  createdAt: z.number().positive('생성 시간은 양수여야 합니다'),
  updatedAt: z.number().positive('수정 시간은 양수여야 합니다')
}) satisfies z.ZodType<User>
```

## 버전 관리 및 호환성

### 1. 타입 변경 시 고려사항
```typescript
// ❌ Breaking Change - 기존 필드 제거
interface User {
  // email: string  // 제거하면 안됨
  name: string
}

// ✅ Non-breaking Change - 선택적 필드 추가
interface User {
  email: string
  name: string
  nickname?: string  // 새 선택적 필드
}

// ✅ Non-breaking Change - 유니온 타입 확장
type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest'  // 'guest' 추가
```

### 2. 타입 마이그레이션 패턴
```typescript
// 이전 버전 타입 유지
export interface UserV1 {
  id: string
  email: string
  name: string
}

// 새 버전 타입
export interface User extends UserV1 {
  role: UserRole
  preferences: UserPreferences
}

// 마이그레이션 함수
export function migrateUserV1ToV2(userV1: UserV1): User {
  return {
    ...userV1,
    role: 'viewer',
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        mentions: true,
        comments: true
      }
    }
  }
}
```

## 모범 사례

### 1. 명명 규칙
- **인터페이스**: PascalCase (`User`, `DocumentContent`)
- **타입 별칭**: PascalCase (`UserRole`, `BlockType`)
- **제네릭**: 단일 대문자 (`T`, `K`, `V`) 또는 의미있는 이름 (`TData`, `TResponse`)

### 2. 파일 구조
- 도메인별로 파일 분리
- 관련 타입들을 함께 그룹화
- index.ts에서 명시적 re-export

### 3. JSDoc 문서화 패턴
```typescript
/**
 * 사용자 정보를 나타내는 인터페이스
 * 
 * 미니 노션에서 사용자 계정과 관련된 모든 정보를 포함합니다.
 * 실시간 협업 시 사용자 식별과 권한 관리에 사용됩니다.
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   role: 'editor',
 *   preferences: {
 *     theme: 'dark',
 *     language: 'ko',
 *     notifications: { email: true, push: false, mentions: true, comments: true }
 *   },
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * }
 * ```
 * 
 * @since 1.0.0
 * @collaboration 실시간 협업에서 사용자 식별에 사용
 * @see {@link UserRole} 사용자 역할 타입
 * @see {@link UserPreferences} 사용자 설정 타입
 */
export interface User extends BaseEntity {
  /** 
   * 사용자 이메일 주소 (고유 식별자)
   * 
   * 로그인 시 사용되며, 시스템 내에서 고유해야 합니다.
   * 이메일 형식 검증이 필요합니다.
   */
  email: string
  
  /** 
   * 사용자 표시 이름
   * 
   * UI에서 표시되는 이름으로, 실시간 협업 시 다른 사용자에게 보여집니다.
   * 1-50자 제한이 있습니다.
   */
  name: string
  
  /** 
   * 사용자 프로필 이미지 URL (선택적)
   * 
   * 협업 시 사용자 아바타로 표시됩니다.
   * 지원 형식: JPG, PNG, WebP
   */
  avatar?: string
  
  /** 
   * 사용자 역할
   * 
   * 워크스페이스 내에서의 권한 수준을 결정합니다.
   * @see {@link UserRole} 가능한 역할 목록
   */
  role: UserRole
  
  /** 
   * 사용자 개인 설정
   * 
   * 테마, 언어, 알림 등 개인화 설정을 포함합니다.
   * @see {@link UserPreferences} 설정 상세 정보
   */
  preferences: UserPreferences
}

/**
 * 사용자 역할 타입
 * 
 * 워크스페이스 내에서 사용자의 권한 수준을 정의합니다.
 * 역할에 따라 문서 편집, 사용자 관리 등의 권한이 결정됩니다.
 * 
 * @example
 * ```typescript
 * // 소유자 - 모든 권한
 * const ownerRole: UserRole = 'owner'
 * 
 * // 편집자 - 문서 편집 가능
 * const editorRole: UserRole = 'editor'
 * 
 * // 뷰어 - 읽기 전용
 * const viewerRole: UserRole = 'viewer'
 * ```
 */
export type UserRole = 
  | 'owner'    // 워크스페이스 소유자 - 모든 권한
  | 'admin'    // 관리자 - 사용자 관리 및 설정 변경 가능
  | 'editor'   // 편집자 - 문서 생성, 편집, 삭제 가능
  | 'viewer'   // 뷰어 - 문서 읽기 전용

/**
 * 문서 블록 타입
 * 
 * Tiptap 에디터에서 지원하는 모든 블록 타입을 정의합니다.
 * 각 타입은 고유한 렌더링과 편집 동작을 가집니다.
 * 
 * @example
 * ```typescript
 * // 기본 텍스트 블록
 * const paragraphBlock: Block = {
 *   id: 'block-1',
 *   type: 'paragraph',
 *   content: { text: 'Hello World' }
 * }
 * 
 * // 코드 블록 (문법 하이라이팅 지원)
 * const codeBlock: Block = {
 *   id: 'block-2', 
 *   type: 'codeBlock',
 *   content: { language: 'typescript', code: 'const x = 1' }
 * }
 * ```
 * 
 * @editor Tiptap 에디터 블록 시스템
 * @collaboration 실시간 협업에서 블록 단위 동기화
 */
export type BlockType = 
  | 'paragraph'     // 일반 텍스트 단락
  | 'heading'       // 제목 (h1-h6, level 속성으로 구분)
  | 'bulletList'    // 불릿 리스트 (•)
  | 'orderedList'   // 번호 리스트 (1, 2, 3...)
  | 'codeBlock'     // 코드 블록 (문법 하이라이팅 지원)
  | 'blockquote'    // 인용문 (> 표시)
  | 'table'         // 테이블 (행/열 동적 추가/삭제)
  | 'image'         // 이미지 (드래그 앤 드롭 업로드)
  | 'divider'       // 구분선 (--- 표시)
  | 'todoList'      // 할 일 목록 (체크박스 포함)
  | 'callout'       // 강조 박스 (정보, 경고, 에러 등)
  | 'embed'         // 외부 콘텐츠 임베드 (YouTube, 트위터 등)
```

이 패턴을 따르면 타입 안전성을 보장하면서도 확장 가능한 타입 시스템을 구축할 수 있습니다.