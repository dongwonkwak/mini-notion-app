/**
 * 실시간 협업 관련 타입 정의
 * 
 * Y.js 기반 실시간 협업 시스템과 관련된 모든 타입을 정의합니다.
 * 사용자 인식(Awareness), 커서 위치, 동기화 상태 등을 포함합니다.
 * 
 * @since 1.0.0
 * @yjs Y.js CRDT 기반 실시간 동기화
 * @collaboration 다중 사용자 실시간 편집
 */

import type { ID, Timestamp } from '../common/base.types'

/**
 * 협업 세션 상태
 * 
 * 실시간 협업 세션의 현재 상태를 나타냅니다.
 * WebSocket 연결과 Y.js 동기화 상태를 추적합니다.
 */
export type CollaborationSessionStatus = 
  | 'connecting'    // 연결 중
  | 'connected'     // 연결됨
  | 'disconnected'  // 연결 끊김
  | 'reconnecting'  // 재연결 중
  | 'error'         // 오류 상태

/**
 * 사용자 활동 상태
 * 
 * 협업 중인 사용자의 현재 활동 상태를 나타냅니다.
 * 타이핑, 선택, 비활성 등의 상태를 구분합니다.
 */
export type UserActivityStatus = 
  | 'active'    // 활발히 편집 중
  | 'typing'    // 타이핑 중
  | 'idle'      // 비활성 상태
  | 'away'      // 자리 비움

/**
 * Y.js 업데이트 타입
 * 
 * Y.js에서 발생하는 다양한 업데이트 유형을 정의합니다.
 * 각 타입에 따라 다른 처리 로직이 적용됩니다.
 */
export type YjsUpdateType = 
  | 'content'     // 문서 내용 변경
  | 'awareness'   // 사용자 인식 정보 변경
  | 'structure'   // 문서 구조 변경
  | 'metadata'    // 메타데이터 변경

/**
 * 커서 위치 정보
 * 
 * 에디터 내에서 사용자의 커서 위치를 나타냅니다.
 * 실시간으로 다른 사용자들에게 표시됩니다.
 * 
 * @example
 * ```typescript
 * const cursorPosition: CursorPosition = {
 *   userId: 'user-123',
 *   position: 150,
 *   blockId: 'block-456',
 *   visible: true,
 *   color: '#3b82f6'
 * }
 * ```
 * 
 * @collaboration 실시간 커서 위치 공유
 */
export interface CursorPosition {
  /** 커서 소유자 사용자 ID */
  userId: ID
  
  /** 문서 내 절대 위치 (문자 단위) */
  position: number
  
  /** 커서가 위치한 블록 ID (선택적) */
  blockId?: ID
  
  /** 커서 표시 여부 */
  visible: boolean
  
  /** 커서 색상 (CSS 색상 값) */
  color: string
  
  /** 커서 레이블 (사용자 이름 등) */
  label?: string
}

/**
 * 선택 영역 정보
 * 
 * 사용자가 선택한 텍스트 영역을 나타냅니다.
 * 시작점과 끝점으로 범위를 정의합니다.
 * 
 * @example
 * ```typescript
 * const selection: SelectionRange = {
 *   userId: 'user-123',
 *   from: 100,
 *   to: 150,
 *   color: '#3b82f6',
 *   opacity: 0.3
 * }
 * ```
 * 
 * @collaboration 실시간 선택 영역 공유
 */
export interface SelectionRange {
  /** 선택 영역 소유자 사용자 ID */
  userId: ID
  
  /** 선택 시작 위치 */
  from: number
  
  /** 선택 끝 위치 */
  to: number
  
  /** 선택 영역 색상 */
  color: string
  
  /** 선택 영역 투명도 (0-1) */
  opacity: number
}

/**
 * 협업 사용자 정보
 * 
 * 현재 문서에서 협업 중인 사용자의 정보를 정의합니다.
 * 사용자 식별 정보와 실시간 상태를 포함합니다.
 * 
 * @example
 * ```typescript
 * const collaborationUser: CollaborationUser = {
 *   id: 'user-123',
 *   name: 'John Doe',
 *   avatar: 'https://example.com/avatar.jpg',
 *   color: '#3b82f6',
 *   status: 'typing',
 *   lastSeen: Date.now(),
 *   cursor: {
 *     userId: 'user-123',
 *     position: 150,
 *     visible: true,
 *     color: '#3b82f6'
 *   }
 * }
 * ```
 * 
 * @collaboration 실시간 사용자 상태 표시
 */
export interface CollaborationUser {
  /** 사용자 ID */
  id: ID
  
  /** 사용자 표시 이름 */
  name: string
  
  /** 사용자 아바타 URL (선택적) */
  avatar?: string
  
  /** 사용자 식별 색상 */
  color: string
  
  /** 현재 활동 상태 */
  status: UserActivityStatus
  
  /** 마지막 활동 시간 */
  lastSeen: Timestamp
  
  /** 현재 커서 위치 (선택적) */
  cursor?: CursorPosition
  
  /** 현재 선택 영역 (선택적) */
  selection?: SelectionRange
}

/**
 * 협업 세션 정보
 * 
 * 특정 문서의 실시간 협업 세션 상태를 나타냅니다.
 * 참여자, 연결 상태, 동기화 정보 등을 포함합니다.
 * 
 * @example
 * ```typescript
 * const session: CollaborationSession = {
 *   documentId: 'doc-123',
 *   sessionId: 'session-456',
 *   status: 'connected',
 *   users: [user1, user2, user3],
 *   startedAt: Date.now() - 3600000, // 1시간 전
 *   lastSyncAt: Date.now(),
 *   version: 25,
 *   conflictCount: 0
 * }
 * ```
 * 
 * @yjs Y.js 문서 세션 관리
 */
export interface CollaborationSession {
  /** 문서 ID */
  documentId: ID
  
  /** 세션 ID */
  sessionId: ID
  
  /** 세션 상태 */
  status: CollaborationSessionStatus
  
  /** 현재 참여 중인 사용자들 */
  users: CollaborationUser[]
  
  /** 세션 시작 시간 */
  startedAt: Timestamp
  
  /** 마지막 동기화 시간 */
  lastSyncAt: Timestamp
  
  /** 현재 문서 버전 */
  version: number
  
  /** 충돌 발생 횟수 */
  conflictCount: number
}

/**
 * Y.js 업데이트 정보
 * 
 * Y.js에서 발생하는 문서 변경사항을 나타냅니다.
 * 바이너리 데이터와 메타데이터를 포함합니다.
 * 
 * @example
 * ```typescript
 * const update: YjsUpdate = {
 *   documentId: 'doc-123',
 *   type: 'content',
 *   data: new Uint8Array([1, 2, 3, ...]),
 *   userId: 'user-456',
 *   timestamp: Date.now(),
 *   version: 26,
 *   size: 1024
 * }
 * ```
 * 
 * @yjs Y.js 바이너리 업데이트 처리
 */
export interface YjsUpdate {
  /** 문서 ID */
  documentId: ID
  
  /** 업데이트 타입 */
  type: YjsUpdateType
  
  /** Y.js 바이너리 업데이트 데이터 */
  data: Uint8Array
  
  /** 변경 수행자 사용자 ID */
  userId: ID
  
  /** 업데이트 발생 시간 */
  timestamp: Timestamp
  
  /** 업데이트 후 문서 버전 */
  version: number
  
  /** 업데이트 데이터 크기 (바이트) */
  size: number
  
  /** 업데이트 설명 (선택적) */
  description?: string
}

/**
 * 협업 이벤트 타입
 * 
 * 실시간 협업에서 발생하는 다양한 이벤트 유형을 정의합니다.
 * WebSocket을 통해 전송되는 이벤트들을 분류합니다.
 */
export type CollaborationEventType = 
  | 'user:join'           // 사용자 참여
  | 'user:leave'          // 사용자 퇴장
  | 'user:cursor'         // 커서 위치 변경
  | 'user:selection'      // 선택 영역 변경
  | 'user:typing'         // 타이핑 시작
  | 'user:idle'           // 비활성 상태
  | 'document:update'     // 문서 내용 변경
  | 'document:sync'       // 문서 동기화
  | 'session:start'       // 세션 시작
  | 'session:end'         // 세션 종료
  | 'conflict:detected'   // 충돌 감지
  | 'conflict:resolved'   // 충돌 해결

/**
 * 협업 이벤트
 * 
 * 실시간 협업에서 발생하는 이벤트의 공통 구조입니다.
 * 모든 협업 관련 이벤트는 이 인터페이스를 따릅니다.
 * 
 * @template T 이벤트 페이로드의 타입
 * 
 * @example
 * ```typescript
 * // 사용자 참여 이벤트
 * const joinEvent: CollaborationEvent<CollaborationUser> = {
 *   type: 'user:join',
 *   documentId: 'doc-123',
 *   userId: 'user-456',
 *   timestamp: Date.now(),
 *   payload: {
 *     id: 'user-456',
 *     name: 'John Doe',
 *     color: '#3b82f6',
 *     status: 'active',
 *     lastSeen: Date.now()
 *   }
 * }
 * ```
 * 
 * @collaboration WebSocket 이벤트 전송
 */
export interface CollaborationEvent<T = unknown> {
  /** 이벤트 타입 */
  type: CollaborationEventType
  
  /** 관련 문서 ID */
  documentId: ID
  
  /** 이벤트 발생자 사용자 ID */
  userId: ID
  
  /** 이벤트 발생 시간 */
  timestamp: Timestamp
  
  /** 이벤트 페이로드 */
  payload: T
  
  /** 이벤트 ID (중복 방지용, 선택적) */
  eventId?: string
}

/**
 * 충돌 정보
 * 
 * Y.js 동기화 과정에서 발생하는 충돌의 상세 정보입니다.
 * 충돌 해결과 사용자 알림에 사용됩니다.
 * 
 * @example
 * ```typescript
 * const conflict: ConflictInfo = {
 *   id: 'conflict-123',
 *   documentId: 'doc-456',
 *   type: 'concurrent_edit',
 *   users: ['user-789', 'user-012'],
 *   blockId: 'block-345',
 *   detectedAt: Date.now(),
 *   resolvedAt: Date.now() + 1000,
 *   resolution: 'auto_merge'
 * }
 * ```
 * 
 * @yjs Y.js 충돌 감지 및 해결
 */
export interface ConflictInfo {
  /** 충돌 ID */
  id: ID
  
  /** 관련 문서 ID */
  documentId: ID
  
  /** 충돌 타입 */
  type: 'concurrent_edit' | 'structure_change' | 'permission_conflict'
  
  /** 충돌에 관련된 사용자 ID들 */
  users: ID[]
  
  /** 충돌이 발생한 블록 ID (선택적) */
  blockId?: ID
  
  /** 충돌 감지 시간 */
  detectedAt: Timestamp
  
  /** 충돌 해결 시간 (선택적) */
  resolvedAt?: Timestamp
  
  /** 충돌 해결 방식 (선택적) */
  resolution?: 'auto_merge' | 'manual_resolve' | 'user_choice'
  
  /** 충돌 상세 정보 (선택적) */
  details?: Record<string, unknown>
}

/**
 * 협업 통계 정보
 * 
 * 문서의 협업 활동에 대한 통계 데이터입니다.
 * 대시보드나 분석 용도로 사용됩니다.
 * 
 * @example
 * ```typescript
 * const stats: CollaborationStats = {
 *   documentId: 'doc-123',
 *   totalUsers: 15,
 *   activeUsers: 3,
 *   totalEdits: 247,
 *   totalSessions: 42,
 *   averageSessionDuration: 1800000, // 30분
 *   lastActivity: Date.now(),
 *   peakConcurrentUsers: 8
 * }
 * ```
 */
export interface CollaborationStats {
  /** 문서 ID */
  documentId: ID
  
  /** 총 협업 참여자 수 */
  totalUsers: number
  
  /** 현재 활성 사용자 수 */
  activeUsers: number
  
  /** 총 편집 횟수 */
  totalEdits: number
  
  /** 총 세션 수 */
  totalSessions: number
  
  /** 평균 세션 지속 시간 (밀리초) */
  averageSessionDuration: number
  
  /** 마지막 활동 시간 */
  lastActivity: Timestamp
  
  /** 최대 동시 접속자 수 */
  peakConcurrentUsers: number
  
  /** 충돌 발생 횟수 */
  conflictCount: number
}

/**
 * 오프라인 동기화 정보
 * 
 * 네트워크 연결이 끊어진 상태에서의 로컬 변경사항을 관리합니다.
 * 재연결 시 서버와 동기화하는 데 사용됩니다.
 * 
 * @example
 * ```typescript
 * const offlineSync: OfflineSyncInfo = {
 *   documentId: 'doc-123',
 *   userId: 'user-456',
 *   localChanges: [update1, update2, update3],
 *   lastSyncVersion: 20,
 *   disconnectedAt: Date.now() - 300000, // 5분 전
 *   pendingSync: true
 * }
 * ```
 * 
 * @offline 오프라인 편집 지원
 */
export interface OfflineSyncInfo {
  /** 문서 ID */
  documentId: ID
  
  /** 사용자 ID */
  userId: ID
  
  /** 로컬에서 발생한 변경사항들 */
  localChanges: YjsUpdate[]
  
  /** 마지막 동기화된 버전 */
  lastSyncVersion: number
  
  /** 연결 끊어진 시간 */
  disconnectedAt: Timestamp
  
  /** 동기화 대기 중 여부 */
  pendingSync: boolean
  
  /** 충돌 가능성 여부 */
  hasConflicts: boolean
}