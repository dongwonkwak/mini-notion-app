/**
 * Utility function for merging Tailwind CSS classes
 * 
 * Combines clsx for conditional classes and tailwind-merge for
 * resolving conflicting Tailwind classes. This is essential for
 * component libraries where class conflicts need to be resolved.
 * 
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```typescript
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500', 'text-white')
 * // → 'px-4 py-2 bg-blue-500 text-white'
 * 
 * // Conditional classes
 * cn('px-4 py-2', {
 *   'bg-blue-500': isActive,
 *   'bg-gray-500': !isActive
 * })
 * 
 * // Resolving conflicts (tailwind-merge)
 * cn('px-4 py-2', 'px-6') // → 'py-2 px-6' (px-6 overrides px-4)
 * ```
 * 
 * @performance Optimized for component re-renders with memoization
 * @since 1.0.0
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Implementation of the cn utility function
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * ```typescript
 * cn('px-4', 'py-2', { 'bg-blue-500': true }) // → 'px-4 py-2 bg-blue-500'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}