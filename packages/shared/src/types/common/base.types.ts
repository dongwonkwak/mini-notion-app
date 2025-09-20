/**
 * 기본 타입 정의
 * 
 * 미니 노션 프로젝트 전반에서 사용되는 기본적인 타입들을 정의합니다.
 * 모든 엔티티와 데이터 구조의 기반이 되는 타입들입니다.
 * 
 * @since 1.0.0
 */

/**
 * 고유 식별자 타입
 * 
 * 시스템 내 모든 엔티티의 고유 식별자로 사용됩니다.
 * UUID v4 형식의 문자열을 사용합니다.
 * 
 * @example
 * ```typescript
 * const userId: ID = 'user-123e4567-e89b-12d3-a456-426614174000'
 * const documentId: ID = 'doc-987fcdeb-51a2-43d1-9f12-345678901234'
 * ```
 */
export type ID = string

/**
 * UUID 타입
 * 
 * 표준 UUID 형식의 식별자입니다.
 * 주로 외부 시스템과의 연동이나 고유성이 중요한 경우 사용됩니다.
 */
export type UUID = string

/**
 * 타임스탬프 타입
 * 
 * Unix 타임스탬프 (밀리초 단위)를 나타냅니다.
 * Date.now() 또는 new Date().getTime()의 반환값과 호환됩니다.
 * 
 * @example
 * ```typescript
 * const createdAt: Timestamp = Date.now()
 * const updatedAt: Timestamp = new Date('2024-01-01').getTime()
 * ```
 */
export type Timestamp = number

/**
 * 기본 엔티티 인터페이스
 * 
 * 모든 데이터베이스 엔티티가 공통으로 가져야 하는 필드들을 정의합니다.
 * 생성 시간과 수정 시간을 자동으로 관리하여 데이터 추적성을 보장합니다.
 * 
 * @example
 * ```typescript
 * interface User extends BaseEntity {
 *   email: string
 *   name: string
 * }
 * 
 * const user: User = {
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * }
 * ```
 */
export interface BaseEntity {
  /** 엔티티 고유 식별자 */
  id: ID
  
  /** 생성 시간 (Unix 타임스탬프) */
  createdAt: Timestamp
  
  /** 최종 수정 시간 (Unix 타임스탬프) */
  updatedAt: Timestamp
}

/**
 * 소프트 삭제 지원 엔티티
 * 
 * 물리적 삭제 대신 논리적 삭제를 지원하는 엔티티입니다.
 * 삭제된 데이터의 복구와 감사 추적이 가능합니다.
 * 
 * @example
 * ```typescript
 * interface Document extends SoftDeletableEntity {
 *   title: string
 *   content: string
 * }
 * 
 * // 삭제된 문서
 * const deletedDoc: Document = {
 *   id: 'doc-123',
 *   title: 'Deleted Document',
 *   content: '...',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 *   deletedAt: Date.now() // 삭제 시간 기록
 * }
 * ```
 */
export interface SoftDeletableEntity extends BaseEntity {
  /** 삭제 시간 (삭제되지 않은 경우 undefined) */
  deletedAt?: Timestamp
}

/**
 * 페이지네이션 매개변수
 * 
 * 목록 조회 API에서 사용하는 페이지네이션 설정입니다.
 * 일관된 페이지네이션 인터페이스를 제공합니다.
 * 
 * @example
 * ```typescript
 * const params: PaginationParams = {
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * }
 * ```
 */
export interface PaginationParams {
  /** 페이지 번호 (1부터 시작) */
  page: number
  
  /** 페이지당 항목 수 */
  limit: number
  
  /** 정렬 기준 필드명 (선택적) */
  sortBy?: string
  
  /** 정렬 순서 (선택적) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 페이지네이션 응답
 * 
 * 페이지네이션이 적용된 목록 조회 결과를 나타냅니다.
 * 데이터와 함께 페이지네이션 메타데이터를 포함합니다.
 * 
 * @template T 목록 항목의 타입
 * 
 * @example
 * ```typescript
 * const response: PaginatedResponse<User> = {
 *   data: [user1, user2, user3],
 *   pagination: {
 *     page: 1,
 *     limit: 20,
 *     total: 150,
 *     totalPages: 8
 *   }
 * }
 * ```
 */
export interface PaginatedResponse<T> {
  /** 현재 페이지의 데이터 목록 */
  data: T[]
  
  /** 페이지네이션 메타데이터 */
  pagination: {
    /** 현재 페이지 번호 */
    page: number
    
    /** 페이지당 항목 수 */
    limit: number
    
    /** 전체 항목 수 */
    total: number
    
    /** 전체 페이지 수 */
    totalPages: number
  }
}

/**
 * 검색 매개변수
 * 
 * 텍스트 기반 검색 기능에서 사용하는 매개변수입니다.
 * 페이지네이션과 함께 사용하여 검색 결과를 효율적으로 관리합니다.
 * 
 * @example
 * ```typescript
 * const searchParams: SearchParams = {
 *   query: '미니 노션',
 *   filters: {
 *     category: 'document',
 *     status: 'published'
 *   },
 *   page: 1,
 *   limit: 10
 * }
 * ```
 */
export interface SearchParams extends PaginationParams {
  /** 검색 쿼리 문자열 */
  query: string
  
  /** 추가 필터 조건 (선택적) */
  filters?: Record<string, unknown>
}

/**
 * 오류 정보
 * 
 * 시스템에서 발생하는 오류의 상세 정보를 담는 인터페이스입니다.
 * 일관된 오류 처리와 사용자 피드백을 위해 사용됩니다.
 * 
 * @example
 * ```typescript
 * const error: ErrorInfo = {
 *   code: 'VALIDATION_ERROR',
 *   message: '입력값이 올바르지 않습니다',
 *   details: {
 *     field: 'email',
 *     reason: 'invalid_format'
 *   }
 * }
 * ```
 */
export interface ErrorInfo {
  /** 오류 코드 (시스템 내부 식별용) */
  code: string
  
  /** 사용자에게 표시할 오류 메시지 */
  message: string
  
  /** 오류 상세 정보 (선택적) */
  details?: Record<string, unknown>
}