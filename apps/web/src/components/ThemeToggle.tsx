import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { isDarkTheme, toggleTheme } from '@/lib/design-tokens'

/**
 * 테마 토글 컴포넌트
 * 
 * 라이트/다크 테마를 전환할 수 있는 버튼 컴포넌트입니다.
 * 현재 테마 상태를 표시하고 클릭으로 테마를 변경할 수 있습니다.
 * 
 * @returns 테마 토글 버튼 JSX 엘리먼트
 * 
 * @example
 * ```tsx
 * // 헤더나 사이드바에 배치
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 초기 테마 상태 설정
    setIsDark(isDarkTheme())
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (!document.documentElement.classList.contains('dark') && 
          !document.documentElement.classList.contains('light')) {
        setIsDark(mediaQuery.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleToggle = () => {
    toggleTheme()
    setIsDark(!isDark)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isDark ? '라이트 테마로 전환' : '다크 테마로 전환'}
    >
      {isDark ? (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </Button>
  )
}