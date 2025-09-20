/**
 * Formatting utilities using date-fns and other helper functions
 * 
 * Provides consistent formatting for dates, file sizes, and other
 * common data types used throughout the application.
 * 
 * @example
 * ```typescript
 * // Date formatting
 * formatDate(new Date()) // → '2024년 1월 15일'
 * formatRelativeTime(new Date(Date.now() - 3600000)) // → '1시간 전'
 * 
 * // File size formatting
 * formatFileSize(1024) // → '1 KB'
 * formatFileSize(1048576) // → '1 MB'
 * 
 * // Number formatting
 * formatNumber(1234567) // → '1,234,567'
 * ```
 * 
 * @since 1.0.0
 */

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * Format a date to Korean locale string
 * 
 * @param date - Date to format
 * @param pattern - Date format pattern (default: 'yyyy년 M월 d일')
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date()) // → '2024년 1월 15일'
 * formatDate(new Date(), 'yyyy-MM-dd') // → '2024-01-15'
 * ```
 */
export function formatDate(date: Date, pattern: string = 'yyyy년 M월 d일'): string {
  return format(date, pattern, { locale: ko })
}

/**
 * Format relative time (e.g., "2시간 전", "방금 전")
 * 
 * @param date - Date to format
 * @returns Relative time string
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 3600000)) // → '1시간 전'
 * formatRelativeTime(new Date(Date.now() - 86400000)) // → '어제'
 * ```
 */
export function formatRelativeTime(date: Date): string {
  if (isToday(date)) {
    const distance = formatDistanceToNow(date, { locale: ko })
    return `${distance} 전`
  }
  
  if (isYesterday(date)) {
    return '어제'
  }
  
  return formatDate(date)
}

/**
 * Format file size in human readable format
 * 
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted file size string
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // → '1 KB'
 * formatFileSize(1048576) // → '1 MB'
 * formatFileSize(0) // → '0 Bytes'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format number with thousand separators
 * 
 * @param num - Number to format
 * @returns Formatted number string
 * 
 * @example
 * ```typescript
 * formatNumber(1234567) // → '1,234,567'
 * formatNumber(1000) // → '1,000'
 * ```
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncateText('Hello World', 5) // → 'Hello...'
 * truncateText('Short', 10) // → 'Short'
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}