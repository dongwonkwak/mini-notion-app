/**
 * 기본 타입 정의
 * 모든 엔티티와 공통 타입들의 기반이 되는 타입들을 정의합니다.
 */

// 기본 식별자 타입
export type ID = string
export type UUID = string
export type Timestamp = number

/**
 * 모든 엔티티의 기본 인터페이스
 */
export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 소프트 삭제를 지원하는 엔티티
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Timestamp
}

/**
 * 페이지네이션 매개변수
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}