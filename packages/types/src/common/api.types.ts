/**
 * API 관련 공통 타입 정의
 */

/**
 * 표준 API 응답 형식
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}

/**
 * API 에러 정보
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: number
}

/**
 * HTTP 상태 코드 타입
 */
export type HttpStatusCode = 
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 500 // Internal Server Error

/**
 * HTTP 메서드 타입
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API 엔드포인트 정의
 */
export interface ApiEndpoint {
  method: HttpMethod
  path: string
  description?: string
}