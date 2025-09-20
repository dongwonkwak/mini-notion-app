/**
 * 미니 노션 디자인 토큰 정의
 * 
 * CSS 변수와 동기화된 디자인 토큰을 TypeScript에서 사용할 수 있도록 제공합니다.
 * 컴포넌트에서 일관된 디자인 시스템을 적용할 때 사용합니다.
 * 
 * @example
 * ```tsx
 * import { designTokens } from '@/lib/design-tokens'
 * 
 * // 색상 사용
 * <div style={{ backgroundColor: designTokens.colors.primary }}>
 * 
 * // 간격 사용
 * <div style={{ padding: designTokens.spacing.md }}>
 * ```
 */

export const designTokens = {
  colors: {
    // 기본 색상
    primary: 'rgb(59 130 246)',
    primaryForeground: 'rgb(255 255 255)',
    secondary: 'rgb(241 245 249)',
    secondaryForeground: 'rgb(15 23 42)',
    background: 'rgb(255 255 255)',
    foreground: 'rgb(15 23 42)',
    muted: 'rgb(248 250 252)',
    mutedForeground: 'rgb(100 116 139)',
    border: 'rgb(226 232 240)',
    
    // 미니 노션 특화 색상
    editor: {
      background: 'rgb(255 255 255)',
      foreground: 'rgb(15 23 42)',
    },
    block: {
      hover: 'rgb(248 250 252)',
      selected: 'rgb(219 234 254)',
      border: 'rgb(229 231 235)',
    },
    toolbar: {
      background: 'rgb(255 255 255)',
      border: 'rgb(229 231 235)',
    },
    sidebar: {
      background: 'rgb(249 250 251)',
      hover: 'rgb(243 244 246)',
    },
    
    // 협업 사용자 색상
    collaboration: {
      user1: 'rgb(239 68 68)',
      user2: 'rgb(249 115 22)',
      user3: 'rgb(234 179 8)',
      user4: 'rgb(34 197 94)',
      user5: 'rgb(6 182 212)',
      user6: 'rgb(59 130 246)',
      user7: 'rgb(139 92 246)',
      user8: 'rgb(236 72 153)',
    },
    
    // 상태 색상
    success: 'rgb(34 197 94)',
    successForeground: 'rgb(255 255 255)',
    warning: 'rgb(245 158 11)',
    warningForeground: 'rgb(255 255 255)',
    info: 'rgb(59 130 246)',
    infoForeground: 'rgb(255 255 255)',
    destructive: 'rgb(239 68 68)',
    destructiveForeground: 'rgb(255 255 255)',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "'JetBrains Mono', Monaco, 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace",
  },
  
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const

/**
 * 협업 사용자 색상을 순환적으로 가져오는 함수
 * 
 * @param userIndex - 사용자 인덱스 (0부터 시작)
 * @returns 해당 사용자의 색상
 * 
 * @example
 * ```tsx
 * const userColor = getCollaborationColor(0) // user1 색상
 * const nextUserColor = getCollaborationColor(8) // user1 색상 (순환)
 * ```
 */
export function getCollaborationColor(userIndex: number): string {
  const colors = Object.values(designTokens.colors.collaboration)
  const index = userIndex % colors.length
  return colors[index] ?? colors[0] ?? 'rgb(59 130 246)'
}

/**
 * 다크 테마 여부를 확인하는 함수
 * 
 * @returns 다크 테마 여부
 * 
 * @example
 * ```tsx
 * if (isDarkTheme()) {
 *   console.log('현재 다크 테마입니다')
 * }
 * ```
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/**
 * 테마를 토글하는 함수
 * 
 * @example
 * ```tsx
 * // 버튼 클릭 시 테마 전환
 * <button onClick={toggleTheme}>테마 전환</button>
 * ```
 */
export function toggleTheme(): void {
  if (typeof window === 'undefined') return
  
  document.documentElement.classList.toggle('dark')
}

/**
 * 특정 테마로 설정하는 함수
 * 
 * @param theme - 설정할 테마 ('light' | 'dark' | 'system')
 * 
 * @example
 * ```tsx
 * // 사용자 설정에 따라 테마 설정
 * setTheme('dark')
 * setTheme('system') // 시스템 설정 따름
 * ```
 */
export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  if (theme === 'system') {
    root.classList.remove('dark')
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      root.classList.add('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}