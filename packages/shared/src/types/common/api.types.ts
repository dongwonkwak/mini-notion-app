/**
 * API 관련 공통 타입 정의
 * 
 * REST API 통신에서 사용되는 표준 응답 형식과 HTTP 관련 타입들을 정의합니다.
 * 프론트엔드와 백엔드 간의 일관된 API 계약을 보장합니다.
 * 
 * @since 1.0.0
 */

import type { ErrorInfo } from './base.types'

/**
 * 표준 API 응답 형식
 * 
 * 모든 API 엔드포인트에서 사용하는 통일된 응답 구조입니다.
 * 성공/실패 여부와 데이터, 오류 정보를 명확히 구분합니다.
 * 
 * @template T 응답 데이터의 타입
 * 
 * @example
 * ```typescript
 * // 성공 응답
 * const successResponse: ApiResponse<User> = {
 *   success: true,
 *   data: {
 *     id: 'user-123',
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   }
 * }
 * 
 * // 실패 응답
 * const errorResponse: ApiResponse = {
 *   success: false,
 *   error: {
 *     code: 'USER_NOT_FOUND',
 *     message: '사용자를 찾을 수 없습니다'
 *   }
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** 요청 성공 여부 */
  success: boolean
  
  /** 응답 데이터 (성공 시에만 존재) */
  data?: T
  
  /** 오류 정보 (실패 시에만 존재) */
  error?: ErrorInfo
  
  /** 추가 메타데이터 (선택적) */
  meta?: Record<string, unknown>
}

/**
 * HTTP 상태 코드 타입
 * 
 * API에서 사용하는 주요 HTTP 상태 코드들을 타입으로 정의합니다.
 * 타입 안전성을 보장하고 잘못된 상태 코드 사용을 방지합니다.
 * 
 * @example
 * ```typescript
 * const statusCode: HttpStatusCode = 200 // ✅ 올바른 상태 코드
 * const invalidCode: HttpStatusCode = 999 // ❌ 타입 오류
 * ```
 */
export type HttpStatusCode = 
  | 200  // OK
  | 201  // Created
  | 204  // No Content
  | 400  // Bad Request
  | 401  // Unauthorized
  | 403  // Forbidden
  | 404  // Not Found
  | 409  // Conflict
  | 422  // Unprocessable Entity
  | 429  // Too Many Requests
  | 500  // Internal Server Error
  | 502  // Bad Gateway
  | 503  // Service Unavailable

/**
 * HTTP 메서드 타입
 * 
 * REST API에서 사용하는 HTTP 메서드들을 정의합니다.
 * API 클라이언트와 서버에서 일관된 메서드 사용을 보장합니다.
 * 
 * @example
 * ```typescript
 * const method: HttpMethod = 'GET'
 * 
 * // API 요청 설정
 * const requestConfig = {
 *   method: 'POST' as HttpMethod,
 *   url: '/api/users',
 *   data: userData
 * }
 * ```
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API 엔드포인트 정보
 * 
 * API 엔드포인트의 메타데이터를 정의합니다.
 * API 문서 생성이나 클라이언트 코드 생성에 활용됩니다.
 * 
 * @example
 * ```typescript
 * const endpoint: ApiEndpoint = {
 *   path: '/api/users/{id}',
 *   method: 'GET',
 *   description: '사용자 정보 조회',
 *   parameters: ['id'],
 *   authenticated: true
 * }
 * ```
 */
export interface ApiEndpoint {
  /** API 경로 (경로 매개변수 포함) */
  path: string
  
  /** HTTP 메서드 */
  method: HttpMethod
  
  /** 엔드포인트 설명 */
  description: string
  
  /** 경로 매개변수 목록 (선택적) */
  parameters?: string[]
  
  /** 인증 필요 여부 */
  authenticated: boolean
  
  /** 요청 본문 스키마 (선택적) */
  requestSchema?: string
  
  /** 응답 스키마 (선택적) */
  responseSchema?: string
}

/**
 * API 요청 헤더
 * 
 * HTTP 요청에서 사용하는 공통 헤더들을 정의합니다.
 * 인증, 콘텐츠 타입, 캐싱 등의 표준 헤더를 포함합니다.
 * 
 * @example
 * ```typescript
 * const headers: ApiHeaders = {
 *   'Content-Type': 'application/json',
 *   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
 *   'X-Request-ID': 'req-123456'
 * }
 * ```
 */
export interface ApiHeaders {
  /** 콘텐츠 타입 */
  'Content-Type'?: string
  
  /** 인증 토큰 */
  'Authorization'?: string
  
  /** 요청 ID (추적용) */
  'X-Request-ID'?: string
  
  /** 사용자 에이전트 */
  'User-Agent'?: string
  
  /** 캐시 제어 */
  'Cache-Control'?: string
  
  /** 기타 커스텀 헤더 */
  [key: string]: string | undefined
}

/**
 * API 요청 설정
 * 
 * HTTP 요청을 보낼 때 사용하는 설정 옵션들을 정의합니다.
 * axios나 fetch 등의 HTTP 클라이언트와 호환됩니다.
 * 
 * @template T 요청 본문 데이터의 타입
 * 
 * @example
 * ```typescript
 * const config: ApiRequestConfig<CreateUserDto> = {
 *   method: 'POST',
 *   url: '/api/users',
 *   data: {
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   },
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   timeout: 5000
 * }
 * ```
 */
export interface ApiRequestConfig<T = unknown> {
  /** HTTP 메서드 */
  method: HttpMethod
  
  /** 요청 URL */
  url: string
  
  /** 요청 본문 데이터 (선택적) */
  data?: T
  
  /** 요청 헤더 (선택적) */
  headers?: ApiHeaders
  
  /** 쿼리 매개변수 (선택적) */
  params?: Record<string, string | number | boolean>
  
  /** 요청 타임아웃 (밀리초) */
  timeout?: number
  
  /** 재시도 횟수 (선택적) */
  retries?: number
}

/**
 * WebSocket 메시지 타입
 * 
 * 실시간 통신에서 사용하는 WebSocket 메시지의 기본 구조입니다.
 * 타입별로 메시지를 구분하고 페이로드를 안전하게 전달합니다.
 * 
 * @template T 메시지 페이로드의 타입
 * 
 * @example
 * ```typescript
 * // 문서 업데이트 메시지
 * const message: WebSocketMessage<DocumentUpdate> = {
 *   type: 'document:update',
 *   payload: {
 *     documentId: 'doc-123',
 *     changes: [...]
 *   },
 *   timestamp: Date.now(),
 *   userId: 'user-456'
 * }
 * ```
 * 
 * @collaboration 실시간 협업에서 사용자 간 메시지 전달
 */
export interface WebSocketMessage<T = unknown> {
  /** 메시지 타입 */
  type: string
  
  /** 메시지 페이로드 */
  payload: T
  
  /** 메시지 전송 시간 */
  timestamp: number
  
  /** 발신자 사용자 ID (선택적) */
  userId?: string
  
  /** 메시지 ID (중복 방지용, 선택적) */
  messageId?: string
}