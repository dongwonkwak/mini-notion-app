/**
 * @mini-notion/types
 * 
 * Mini Notion 프로젝트의 공통 TypeScript 타입 정의
 * 
 * @example
 * ```typescript
 * // 전체 import
 * import type * as Types from '@mini-notion/types'
 * 
 * // 선택적 import (권장)
 * import type { User, Document } from '@mini-notion/types/domain'
 * import type { ApiResponse } from '@mini-notion/types/common'
 * ```
 */

// 공통 타입
export * from './common'

// 도메인 타입
export * from './domain'