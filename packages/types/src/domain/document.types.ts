/**
 * 문서 관련 타입 정의
 */

import { BaseEntity, ID, Timestamp } from '../common/base.types'

/**
 * 문서 인터페이스
 */
export interface Document extends BaseEntity {
  /** 문서 제목 */
  title: string
  /** 문서 내용 */
  content: DocumentContent
  /** 소속 워크스페이스 ID */
  workspaceId: ID
  /** 작성자 ID */
  authorId: ID
  /** 협업자 목록 */
  collaborators: DocumentCollaborator[]
  /** 문서 권한 설정 */
  permissions: DocumentPermissions
  /** 문서 버전 */
  version: number
  /** 문서 상태 */
  status: DocumentStatus
  /** 마지막 편집 시간 */
  lastEditedAt: Timestamp
  /** 마지막 편집자 ID */
  lastEditedBy: ID
}

/**
 * 문서 상태
 */
export type DocumentStatus = 'draft' | 'published' | 'archived'

/**
 * 문서 내용
 */
export interface DocumentContent {
  /** 블록 목록 */
  blocks: Block[]
  /** 콘텐츠 버전 */
  version: number
  /** 체크섬 (무결성 검증용) */
  checksum: string
}

/**
 * 블록 인터페이스
 */
export interface Block {
  /** 블록 고유 ID */
  id: ID
  /** 블록 타입 */
  type: BlockType
  /** 블록 내용 */
  content: Record<string, unknown>
  /** 자식 블록들 */
  children?: Block[]
  /** 블록 메타데이터 */
  metadata?: BlockMetadata
}

/**
 * 블록 타입
 */
export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'codeBlock'
  | 'blockquote'
  | 'image'
  | 'table'
  | 'embed'
  | 'divider'
  | 'callout'
  | 'toggle'

/**
 * 블록 메타데이터
 */
export interface BlockMetadata {
  /** 생성 시간 */
  createdAt: Timestamp
  /** 수정 시간 */
  updatedAt: Timestamp
  /** 작성자 ID */
  authorId: ID
  /** 블록별 설정 */
  settings?: Record<string, unknown>
}

/**
 * 문서 협업자
 */
export interface DocumentCollaborator {
  /** 사용자 ID */
  userId: ID
  /** 협업자 역할 */
  role: CollaboratorRole
  /** 참여 시간 */
  joinedAt: Timestamp
  /** 마지막 접근 시간 */
  lastAccessedAt?: Timestamp
}

/**
 * 협업자 역할
 */
export type CollaboratorRole = 'editor' | 'commenter' | 'viewer'

/**
 * 문서 권한 설정
 */
export interface DocumentPermissions {
  /** 공개 문서 여부 */
  public: boolean
  /** 댓글 허용 여부 */
  allowComments: boolean
  /** 복사 허용 여부 */
  allowCopy: boolean
  /** 다운로드 허용 여부 */
  allowDownload: boolean
  /** 공유 설정 */
  shareSettings: ShareSettings
}

/**
 * 공유 설정
 */
export interface ShareSettings {
  /** 링크 공유 활성화 */
  linkSharing: boolean
  /** 링크 권한 */
  linkPermission: CollaboratorRole
  /** 만료 시간 */
  expiresAt?: Timestamp
  /** 비밀번호 보호 */
  password?: string
}

/**
 * 문서 생성 DTO
 */
export interface CreateDocumentDto {
  title: string
  workspaceId: ID
  content?: Partial<DocumentContent>
  permissions?: Partial<DocumentPermissions>
}

/**
 * 문서 업데이트 DTO
 */
export interface UpdateDocumentDto {
  title?: string
  content?: DocumentContent
  permissions?: Partial<DocumentPermissions>
  status?: DocumentStatus
}

/**
 * 문서 목록 아이템 (간소화된 정보)
 */
export interface DocumentListItem {
  id: ID
  title: string
  authorId: ID
  workspaceId: ID
  status: DocumentStatus
  lastEditedAt: Timestamp
  lastEditedBy: ID
  collaboratorCount: number
}