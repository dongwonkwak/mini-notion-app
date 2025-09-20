/**
 * 공통 검증 유틸리티 함수들
 * 
 * 프론트엔드와 백엔드에서 공통으로 사용하는 데이터 검증 함수들을 제공합니다.
 * 사용자 입력, API 요청/응답, 폼 데이터 등의 유효성 검사에 사용됩니다.
 * 
 * @since 1.0.0
 * @security 입력 데이터 검증으로 보안 강화
 */

/**
 * 이메일 주소 형식 검증
 * 
 * RFC 5322 표준에 따른 이메일 주소 형식을 검증합니다.
 * 사용자 회원가입, 로그인, 프로필 수정 시 사용됩니다.
 * 
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일 형식인 경우 true
 * 
 * @example
 * ```typescript
 * // 유효한 이메일
 * console.log(isValidEmail('user@example.com')) // true
 * console.log(isValidEmail('test.email+tag@domain.co.kr')) // true
 * 
 * // 유효하지 않은 이메일
 * console.log(isValidEmail('invalid-email')) // false
 * console.log(isValidEmail('user@')) // false
 * console.log(isValidEmail('@domain.com')) // false
 * ```
 * 
 * @security 이메일 형식 검증으로 잘못된 입력 방지
 * @since 1.0.0
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검증
 * 
 * 비밀번호가 보안 요구사항을 만족하는지 검증합니다.
 * 최소 8자 이상, 대소문자, 숫자, 특수문자 포함 여부를 확인합니다.
 * 
 * @param password - 검증할 비밀번호
 * @returns 비밀번호 강도 검증 결과
 * - isValid: 전체 검증 통과 여부
 * - score: 강도 점수 (0-4)
 * - feedback: 개선 사항 피드백 배열
 * 
 * @example
 * ```typescript
 * // 강한 비밀번호
 * const strong = validatePasswordStrength('MySecure123!')
 * console.log(strong.isValid) // true
 * console.log(strong.score) // 4
 * 
 * // 약한 비밀번호
 * const weak = validatePasswordStrength('123456')
 * console.log(weak.isValid) // false
 * console.log(weak.feedback) // ['최소 8자 이상 입력하세요', '대문자를 포함하세요', ...]
 * ```
 * 
 * @security 강력한 비밀번호 정책 적용
 * @since 1.0.0
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // 길이 검사 (최소 8자)
  if (password.length < 8) {
    feedback.push('최소 8자 이상 입력하세요')
  } else {
    score++
  }

  // 대문자 포함 검사
  if (!/[A-Z]/.test(password)) {
    feedback.push('대문자를 포함하세요')
  } else {
    score++
  }

  // 소문자 포함 검사
  if (!/[a-z]/.test(password)) {
    feedback.push('소문자를 포함하세요')
  } else {
    score++
  }

  // 숫자 포함 검사
  if (!/\d/.test(password)) {
    feedback.push('숫자를 포함하세요')
  } else {
    score++
  }

  // 특수문자 포함 검사
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push('특수문자를 포함하세요')
  } else {
    score++
  }

  return {
    isValid: score >= 4 && password.length >= 8,
    score,
    feedback
  }
}

/**
 * URL 형식 검증
 * 
 * HTTP/HTTPS URL의 유효성을 정규표현식으로 검증합니다.
 * 사용자 프로필의 웹사이트 URL, 이미지 URL 등에 사용됩니다.
 * 
 * @param url - 검증할 URL 문자열
 * @param options - 검증 옵션
 * @param options.allowHttp - HTTP 프로토콜 허용 여부 (기본값: false)
 * @param options.requireProtocol - 프로토콜 필수 여부 (기본값: true)
 * @returns 유효한 URL 형식인 경우 true
 * 
 * @example
 * ```typescript
 * // HTTPS URL (권장)
 * console.log(isValidUrl('https://example.com')) // true
 * 
 * // HTTP URL (옵션으로 허용)
 * console.log(isValidUrl('http://example.com', { allowHttp: true })) // true
 * 
 * // 프로토콜 없는 URL
 * console.log(isValidUrl('example.com', { requireProtocol: false })) // true
 * 
 * // 유효하지 않은 URL
 * console.log(isValidUrl('not-a-url')) // false
 * ```
 * 
 * @security HTTPS 사용 권장으로 보안 강화
 * @since 1.0.0
 */
export function isValidUrl(
  url: string, 
  options: {
    allowHttp?: boolean
    requireProtocol?: boolean
  } = {}
): boolean {
  const { allowHttp = false, requireProtocol = true } = options

  // 기본 URL 패턴 (프로토콜 포함)
  const httpsPattern = /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*([/?#].*)?$/
  const httpPattern = /^http:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*([/?#].*)?$/
  
  // 프로토콜 없는 도메인 패턴
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+([/?#].*)?$/

  // 프로토콜이 필수인 경우
  if (requireProtocol) {
    if (allowHttp) {
      return httpsPattern.test(url) || httpPattern.test(url)
    } else {
      return httpsPattern.test(url)
    }
  }

  // 프로토콜이 선택적인 경우
  if (url.includes('://')) {
    // 프로토콜이 있는 경우 위와 동일한 검증
    if (allowHttp) {
      return httpsPattern.test(url) || httpPattern.test(url)
    } else {
      return httpsPattern.test(url)
    }
  } else {
    // 프로토콜이 없는 경우 도메인 패턴으로 검증
    return domainPattern.test(url)
  }
}

/**
 * 문자열 길이 검증 (유니코드 안전)
 * 
 * 유니코드 문자를 올바르게 처리하여 문자열 길이를 검증합니다.
 * 이모지, 한글, 특수문자 등이 포함된 텍스트도 정확히 계산합니다.
 * 
 * @param text - 검증할 텍스트
 * @param minLength - 최소 길이
 * @param maxLength - 최대 길이
 * @returns 길이 검증 결과
 * - isValid: 길이 검증 통과 여부
 * - actualLength: 실제 문자 길이
 * - message: 검증 실패 시 메시지
 * 
 * @example
 * ```typescript
 * // 한글 텍스트 검증
 * const result1 = validateTextLength('안녕하세요', 1, 10)
 * console.log(result1.isValid) // true
 * console.log(result1.actualLength) // 5
 * 
 * // 이모지 포함 텍스트 검증
 * const result2 = validateTextLength('Hello 👋🌍', 1, 5)
 * console.log(result2.isValid) // false (실제 길이: 8)
 * console.log(result2.message) // '최대 5자까지 입력 가능합니다'
 * ```
 * 
 * @performance 유니코드 정규화로 정확한 길이 계산
 * @since 1.0.0
 */
export function validateTextLength(
  text: string,
  minLength: number,
  maxLength: number
): {
  isValid: boolean
  actualLength: number
  message?: string
} {
  // 유니코드 정규화 후 길이 계산 (이모지, 결합 문자 고려)
  const normalizedText = text.normalize('NFC')
  const actualLength = [...normalizedText].length

  if (actualLength < minLength) {
    return {
      isValid: false,
      actualLength,
      message: `최소 ${minLength}자 이상 입력하세요`
    }
  }

  if (actualLength > maxLength) {
    return {
      isValid: false,
      actualLength,
      message: `최대 ${maxLength}자까지 입력 가능합니다`
    }
  }

  return {
    isValid: true,
    actualLength
  }
}

/**
 * 파일 확장자 검증
 * 
 * 업로드된 파일의 확장자가 허용된 목록에 포함되는지 검증합니다.
 * 이미지, 문서, 미디어 파일 업로드 시 보안 검증에 사용됩니다.
 * 
 * @param filename - 검증할 파일명
 * @param allowedExtensions - 허용된 확장자 목록
 * @returns 허용된 확장자인 경우 true
 * 
 * @example
 * ```typescript
 * // 이미지 파일 검증
 * const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
 * console.log(isValidFileExtension('profile.jpg', imageExtensions)) // true
 * console.log(isValidFileExtension('document.pdf', imageExtensions)) // false
 * 
 * // 문서 파일 검증
 * const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'md']
 * console.log(isValidFileExtension('readme.md', docExtensions)) // true
 * ```
 * 
 * @security 파일 업로드 보안 검증
 * @since 1.0.0
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.toLowerCase().split('.').pop()
  
  if (!extension) {
    return false
  }

  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension)
}

/**
 * 디바운스 함수 생성
 * 
 * 지정된 지연 시간 동안 함수 호출을 지연시키고,
 * 연속된 호출이 있을 경우 이전 호출을 취소합니다.
 * 검색, 자동저장 등 성능 최적화에 사용됩니다.
 * 
 * @template T 디바운스할 함수의 타입
 * @param func - 디바운스할 함수
 * @param delay - 지연 시간 (밀리초)
 * @param options - 디바운스 옵션
 * @param options.leading - 첫 번째 호출을 즉시 실행할지 여부
 * @param options.trailing - 마지막 호출을 지연 후 실행할지 여부
 * @returns 디바운스된 함수와 제어 메서드
 * - debouncedFn: 디바운스된 함수
 * - cancel: 대기 중인 호출 취소
 * - flush: 대기 중인 호출 즉시 실행
 * 
 * @example
 * ```typescript
 * // 검색 함수 디바운스
 * const { debouncedFn, cancel } = debounce(
 *   (query: string) => searchDocuments(query),
 *   300,
 *   { leading: false, trailing: true }
 * )
 * 
 * // 사용자 입력 시
 * debouncedFn('검색어')
 * 
 * // 컴포넌트 언마운트 시
 * cancel()
 * ```
 * 
 * @performance 검색, 자동저장 등 성능 최적화에 사용
 * @since 1.0.0
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options: {
    leading?: boolean
    trailing?: boolean
  } = {}
): {
  debouncedFn: (...args: Parameters<T>) => void
  cancel: () => void
  flush: () => void
} {
  const { leading = false, trailing = true } = options
  
  let timeoutId: number | null = null
  let lastArgs: Parameters<T> | null = null
  let lastCallTime: number | null = null

  const cancel = (): void => {
    if (timeoutId) {
      // 환경에 따라 적절한 clear 함수 사용
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeoutId)
      } else if (typeof global !== 'undefined' && global.clearTimeout) {
        global.clearTimeout(timeoutId)
      }
      timeoutId = null
    }
    lastArgs = null
    lastCallTime = null
  }

  const flush = (): void => {
    if (timeoutId && lastArgs) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeoutId)
      } else if (typeof global !== 'undefined' && global.clearTimeout) {
        global.clearTimeout(timeoutId)
      }
      func(...lastArgs)
      cancel()
    }
  }

  const debouncedFn = (...args: Parameters<T>): void => {
    const now = Date.now()
    lastArgs = args
    
    // Leading edge 실행
    if (leading && (!lastCallTime || now - lastCallTime >= delay)) {
      func(...args)
      lastCallTime = now
      return
    }

    // 기존 타이머 취소
    if (timeoutId) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeoutId)
      } else if (typeof global !== 'undefined' && global.clearTimeout) {
        global.clearTimeout(timeoutId)
      }
    }

    // Trailing edge 실행
    if (trailing) {
      // 환경에 따라 적절한 setTimeout 사용
      if (typeof window !== 'undefined') {
        timeoutId = window.setTimeout(() => {
          func(...args)
          cancel()
        }, delay)
      } else if (typeof global !== 'undefined' && global.setTimeout) {
        timeoutId = global.setTimeout(() => {
          func(...args)
          cancel()
        }, delay) as unknown as number
      }
    }

    lastCallTime = now
  }

  return {
    debouncedFn,
    cancel,
    flush
  }
}