/**
 * Mini Notion 타입 패키지
 * 
 * Mini Notion 프로젝트의 공통 TypeScript 타입 정의를 제공합니다.
 * `@mini-notion/types` 패키지의 메인 진입점입니다.
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
 * 
 * @since 1.0.0
 */

// 공통 타입
export * from './common'

// 도메인 타입
export * from './domain'