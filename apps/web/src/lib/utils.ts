import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * TailwindCSS 클래스명을 조건부로 결합하고 중복을 제거합니다
 * 
 * clsx와 tailwind-merge를 결합하여 조건부 클래스명 적용과
 * TailwindCSS 클래스 충돌 해결을 동시에 처리합니다.
 * 
 * @param inputs - 결합할 클래스명들 (문자열, 객체, 배열 등)
 * @returns 정리된 클래스명 문자열
 * 
 * @example
 * ```typescript
 * // 기본 사용법
 * cn('px-2 py-1', 'bg-blue-500')
 * // 결과: 'px-2 py-1 bg-blue-500'
 * 
 * // 조건부 클래스
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 * 
 * // TailwindCSS 충돌 해결
 * cn('px-2 px-4', 'py-1 py-2')
 * // 결과: 'px-4 py-2' (마지막 값이 우선)
 * ```
 * 
 * @see {@link https://github.com/lukeed/clsx} clsx 라이브러리
 * @see {@link https://github.com/dcastil/tailwind-merge} tailwind-merge 라이브러리
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
