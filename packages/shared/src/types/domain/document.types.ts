/**
 * 문서 관련 타입 정의
 * 
 * 미니 노션의 문서 시스템과 관련된 모든 타입을 정의합니다.
 * 블록 기반 에디터 구조와 실시간 협업을 지원하는 문서 모델을 포함합니다.
 * 
 * @since 1.0.0
 * @editor 블록 기반 에디터 시스템
 * @collaboration 실시간 문서 협업
 */

import type { BaseEntity, ID, Timestamp } from '../common/base.types'

/**
 * 문서 상태 타입
 * 
 * 문서의 현재 상태를 나타냅니다.
 * 문서 생명주기와 접근 권한 관리에 사용됩니다.
 */
export type DocumentStatus = 
  | 'draft'      // 초안 상태
  | 'published'  // 게시됨
  | 'archived'   // 보관됨
  | 'deleted'    // 삭제됨

/**
 * 문서 가시성 타입
 * 
 * 문서의 공개 범위를 정의합니다.
 * 워크스페이스 내부, 공개, 비공개 등의 접근 제어에 사용됩니다.
 */
export type DocumentVisibility = 
  | 'private'    // 비공개 (작성자만 접근)
  | 'workspace'  // 워크스페이스 내 공개
  | 'public'     // 전체 공개
  | 'link'       // 링크를 아는 사람만 접근

/**
 * 문서 권한 타입
 * 
 * 사용자가 특정 문서에 대해 가지는 권한을 정의합니다.
 * 읽기, 편집, 댓글, 관리 등의 세분화된 권한을 제공합니다.
 */
export type DocumentPermission = 
  | 'read'     // 읽기 전용
  | 'comment'  // 읽기 + 댓글
  | 'edit'     // 읽기 + 편집
  | 'admin'    // 모든 권한 (삭제, 권한 관리 포함)

/**
 * 블록 타입
 * 
 * 문서를 구성하는 블록의 종류를 정의합니다.
 * 각 블록 타입은 고유한 렌더링과 편집 동작을 가집니다.
 * 
 * @example
 * ```typescript
 * // 기본 텍스트 블록
 * const paragraphBlock: Block = {
 *   id: 'block-1',
 *   type: 'paragraph',
 *   content: { text: 'Hello World' },
 *   properties: {}
 * }
 * 
 * // 코드 블록 (문법 하이라이팅 지원)
 * const codeBlock: Block = {
 *   id: 'block-2', 
 *   type: 'code',
 *   content: { 
 *     language: 'typescript', 
 *     code: 'const x = 1' 
 *   },
 *   properties: {}
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
  | 'listItem'      // 리스트 항목
  | 'code'          // 코드 블록 (문법 하이라이팅 지원)
  | 'blockquote'    // 인용문 (> 표시)
  | 'table'         // 테이블 (행/열 동적 추가/삭제)
  | 'tableRow'      // 테이블 행
  | 'tableCell'     // 테이블 셀
  | 'image'         // 이미지 (드래그 앤 드롭 업로드)
  | 'divider'       // 구분선 (--- 표시)
  | 'todo'          // 할 일 목록 (체크박스 포함)
  | 'callout'       // 강조 박스 (정보, 경고, 에러 등)
  | 'embed'         // 외부 콘텐츠 임베드 (YouTube, 트위터 등)

/**
 * 블록 속성
 * 
 * 블록의 스타일링과 동작을 제어하는 속성들을 정의합니다.
 * 블록 타입에 따라 다른 속성들이 사용됩니다.
 * 
 * @example
 * ```typescript
 * // 제목 블록 속성
 * const headingProperties: BlockProperties = {
 *   level: 2,
 *   color: 'blue',
 *   backgroundColor: 'gray'
 * }
 * 
 * // 코드 블록 속성
 * const codeProperties: BlockProperties = {
 *   language: 'typescript',
 *   showLineNumbers: true
 * }
 * ```
 */
export interface BlockProperties {
  /** 제목 레벨 (heading 블록용) */
  level?: number
  
  /** 텍스트 색상 */
  color?: string
  
  /** 배경 색상 */
  backgroundColor?: string
  
  /** 정렬 방식 */
  align?: 'left' | 'center' | 'right' | 'justify'
  
  /** 코드 언어 (code 블록용) */
  language?: string
  
  /** 줄 번호 표시 여부 (code 블록용) */
  showLineNumbers?: boolean
  
  /** 체크 상태 (todo 블록용) */
  checked?: boolean
  
  /** 콜아웃 타입 (callout 블록용) */
  calloutType?: 'info' | 'warning' | 'error' | 'success'
  
  /** 이미지 URL (image 블록용) */
  src?: string
  
  /** 이미지 대체 텍스트 (image 블록용) */
  alt?: string
  
  /** 임베드 URL (embed 블록용) */
  url?: string
}

/**
 * 블록 메타데이터
 * 
 * 블록의 생성, 수정 이력과 협업 정보를 담는 메타데이터입니다.
 * 실시간 협업에서 변경 추적과 충돌 해결에 사용됩니다.
 * 
 * @collaboration 실시간 협업에서 변경 추적
 */
export interface BlockMetadata {
  /** 블록 생성 시간 */
  createdAt: Timestamp
  
  /** 블록 최종 수정 시간 */
  updatedAt: Timestamp
  
  /** 블록 생성자 ID */
  createdBy: ID
  
  /** 블록 최종 수정자 ID */
  updatedBy: ID
  
  /** 블록 버전 (충돌 해결용) */
  version: number
}

/**
 * 문서 블록
 * 
 * 문서를 구성하는 기본 단위인 블록을 정의합니다.
 * 각 블록은 고유한 ID와 타입, 콘텐츠를 가지며 중첩 구조를 지원합니다.
 * 
 * @example
 * ```typescript
 * const block: Block = {
 *   id: 'block-123',
 *   type: 'paragraph',
 *   content: {
 *     text: '안녕하세요, 미니 노션입니다!'
 *   },
 *   properties: {
 *     color: 'black',
 *     align: 'left'
 *   },
 *   children: [],
 *   metadata: {
 *     createdAt: Date.now(),
 *     updatedAt: Date.now(),
 *     createdBy: 'user-456',
 *     updatedBy: 'user-456',
 *     version: 1
 *   }
 * }
 * ```
 * 
 * @editor 블록 기반 에디터의 핵심 구조
 * @collaboration Y.js를 통한 실시간 동기화 단위
 */
export interface Block {
  /** 블록 고유 식별자 */
  id: ID
  
  /** 블록 타입 */
  type: BlockType
  
  /** 블록 콘텐츠 (타입에 따라 구조가 다름) */
  content: Record<string, unknown>
  
  /** 블록 속성 (스타일링, 동작 제어) */
  properties: BlockProperties
  
  /** 자식 블록들 (중첩 구조 지원) */
  children?: Block[]
  
  /** 블록 메타데이터 */
  metadata: BlockMetadata
}

/**
 * 문서 콘텐츠
 * 
 * 문서의 실제 내용을 담는 구조입니다.
 * 블록들의 배열과 문서 전체의 메타데이터를 포함합니다.
 * 
 * @example
 * ```typescript
 * const content: DocumentContent = {
 *   blocks: [
 *     {
 *       id: 'title-block',
 *       type: 'heading',
 *       content: { text: '문서 제목' },
 *       properties: { level: 1 },
 *       children: [],
 *       metadata: { ... }
 *     },
 *     {
 *       id: 'content-block',
 *       type: 'paragraph',
 *       content: { text: '문서 내용입니다.' },
 *       properties: {},
 *       children: [],
 *       metadata: { ... }
 *     }
 *   ],
 *   version: 5,
 *   checksum: 'abc123def456'
 * }
 * ```
 * 
 * @yjs Y.js 문서 상태와 동기화
 */
export interface DocumentContent {
  /** 문서를 구성하는 블록들 */
  blocks: Block[]
  
  /** 문서 버전 (Y.js 동기화용) */
  version: number
  
  /** 콘텐츠 체크섬 (무결성 검증용) */
  checksum: string
}

/**
 * 문서 협업자
 * 
 * 문서에 접근 권한을 가진 사용자의 정보를 정의합니다.
 * 권한 수준과 참여 시간 등의 협업 관련 정보를 포함합니다.
 * 
 * @collaboration 문서별 권한 관리
 */
export interface DocumentCollaborator {
  /** 사용자 ID */
  userId: ID
  
  /** 문서에 대한 권한 */
  permission: DocumentPermission
  
  /** 협업 시작 시간 */
  joinedAt: Timestamp
  
  /** 권한 부여자 ID */
  invitedBy: ID
  
  /** 마지막 접근 시간 (선택적) */
  lastAccessedAt?: Timestamp
}

/**
 * 문서 공유 설정
 * 
 * 문서의 공유 방식과 접근 제어 설정을 정의합니다.
 * 링크 공유, 만료 시간, 비밀번호 보호 등의 기능을 지원합니다.
 * 
 * @example
 * ```typescript
 * const shareSettings: DocumentShareSettings = {
 *   linkSharing: true,
 *   linkPermission: 'read',
 *   requirePassword: false,
 *   expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7일 후
 *   allowDownload: true,
 *   allowCopy: false
 * }
 * ```
 */
export interface DocumentShareSettings {
  /** 링크 공유 활성화 여부 */
  linkSharing: boolean
  
  /** 링크를 통한 접근 권한 */
  linkPermission: DocumentPermission
  
  /** 비밀번호 보호 여부 */
  requirePassword: boolean
  
  /** 공유 링크 만료 시간 (선택적) */
  expiresAt?: Timestamp
  
  /** 다운로드 허용 여부 */
  allowDownload: boolean
  
  /** 복사 허용 여부 */
  allowCopy: boolean
}

/**
 * 문서 권한 설정
 * 
 * 문서의 전체적인 권한과 접근 제어 정책을 정의합니다.
 * 공개 범위, 댓글 허용, 공유 설정 등을 포함합니다.
 */
export interface DocumentPermissions {
  /** 문서 가시성 */
  visibility: DocumentVisibility
  
  /** 댓글 허용 여부 */
  allowComments: boolean
  
  /** 공유 설정 */
  shareSettings: DocumentShareSettings
}

/**
 * 문서 정보
 * 
 * 미니 노션의 문서 엔티티를 정의합니다.
 * 제목, 내용, 권한, 협업자 등 문서와 관련된 모든 정보를 포함합니다.
 * 
 * @example
 * ```typescript
 * const document: Document = {
 *   id: 'doc-123',
 *   title: '프로젝트 기획서',
 *   content: {
 *     blocks: [...],
 *     version: 10,
 *     checksum: 'abc123'
 *   },
 *   workspaceId: 'workspace-456',
 *   authorId: 'user-789',
 *   status: 'published',
 *   collaborators: [
 *     {
 *       userId: 'user-789',
 *       permission: 'admin',
 *       joinedAt: Date.now(),
 *       invitedBy: 'user-789'
 *     }
 *   ],
 *   permissions: {
 *     visibility: 'workspace',
 *     allowComments: true,
 *     shareSettings: { ... }
 *   },
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * }
 * ```
 * 
 * @editor 블록 기반 에디터의 문서 모델
 * @collaboration 실시간 협업 지원
 */
export interface Document extends BaseEntity {
  /** 문서 제목 */
  title: string
  
  /** 문서 내용 */
  content: DocumentContent
  
  /** 소속 워크스페이스 ID */
  workspaceId: ID
  
  /** 문서 작성자 ID */
  authorId: ID
  
  /** 문서 상태 */
  status: DocumentStatus
  
  /** 협업자 목록 */
  collaborators: DocumentCollaborator[]
  
  /** 권한 설정 */
  permissions: DocumentPermissions
  
  /** 상위 문서 ID (중첩 문서 지원, 선택적) */
  parentId?: ID
  
  /** 문서 아이콘 (이모지, 선택적) */
  icon?: string
  
  /** 문서 커버 이미지 URL (선택적) */
  coverImage?: string
  
  /** 마지막 편집자 ID (선택적) */
  lastEditedBy?: ID
  
  /** 즐겨찾기 여부 */
  isFavorite: boolean
  
  /** 템플릿 여부 */
  isTemplate: boolean
}

/**
 * 문서 생성 DTO
 * 
 * 새로운 문서를 생성할 때 필요한 정보를 정의합니다.
 * 
 * @example
 * ```typescript
 * const createDocumentDto: CreateDocumentDto = {
 *   title: '새 문서',
 *   workspaceId: 'workspace-123',
 *   parentId: 'doc-parent-456',
 *   templateId: 'template-789'
 * }
 * ```
 */
export interface CreateDocumentDto {
  /** 문서 제목 */
  title: string
  
  /** 소속 워크스페이스 ID */
  workspaceId: ID
  
  /** 상위 문서 ID (선택적) */
  parentId?: ID
  
  /** 템플릿 ID (선택적) */
  templateId?: ID
  
  /** 초기 가시성 설정 (선택적, 기본값: 'private') */
  visibility?: DocumentVisibility
}

/**
 * 문서 업데이트 DTO
 * 
 * 기존 문서 정보를 수정할 때 사용하는 데이터 구조입니다.
 * 
 * @example
 * ```typescript
 * const updateDocumentDto: UpdateDocumentDto = {
 *   title: '수정된 제목',
 *   status: 'published',
 *   icon: '📝',
 *   permissions: {
 *     visibility: 'workspace',
 *     allowComments: true,
 *     shareSettings: { ... }
 *   }
 * }
 * ```
 */
export interface UpdateDocumentDto {
  /** 문서 제목 (선택적) */
  title?: string
  
  /** 문서 상태 (선택적) */
  status?: DocumentStatus
  
  /** 문서 아이콘 (선택적) */
  icon?: string
  
  /** 커버 이미지 URL (선택적) */
  coverImage?: string
  
  /** 권한 설정 (선택적) */
  permissions?: Partial<DocumentPermissions>
  
  /** 즐겨찾기 여부 (선택적) */
  isFavorite?: boolean
}

/**
 * 문서 검색 결과
 * 
 * 문서 검색 API의 응답 형식을 정의합니다.
 * 검색 성능을 위해 필요한 정보만 포함합니다.
 * 
 * @example
 * ```typescript
 * const searchResult: DocumentSearchResult = {
 *   id: 'doc-123',
 *   title: '프로젝트 기획서',
 *   excerpt: '이 문서는 새로운 프로젝트의 기획서입니다...',
 *   authorId: 'user-456',
 *   workspaceId: 'workspace-789',
 *   status: 'published',
 *   updatedAt: Date.now(),
 *   relevanceScore: 0.95
 * }
 * ```
 */
export interface DocumentSearchResult {
  /** 문서 ID */
  id: ID
  
  /** 문서 제목 */
  title: string
  
  /** 문서 요약 (검색 결과 미리보기용) */
  excerpt: string
  
  /** 작성자 ID */
  authorId: ID
  
  /** 워크스페이스 ID */
  workspaceId: ID
  
  /** 문서 상태 */
  status: DocumentStatus
  
  /** 최종 수정 시간 */
  updatedAt: Timestamp
  
  /** 검색 관련성 점수 (0-1) */
  relevanceScore: number
  
  /** 문서 아이콘 (선택적) */
  icon?: string
}