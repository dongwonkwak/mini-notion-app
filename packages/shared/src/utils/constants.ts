/**
 * 공통 상수 정의
 * 
 * 미니 노션 프로젝트 전반에서 사용되는 상수값들을 정의합니다.
 * 설정값, 제한값, 기본값 등을 중앙에서 관리합니다.
 * 
 * @since 1.0.0
 */

/**
 * 사용자 관련 상수
 * 
 * 사용자 계정, 프로필, 인증과 관련된 제한값과 기본값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 사용자명 길이 검증
 * if (username.length > USER_CONSTANTS.MAX_USERNAME_LENGTH) {
 *   throw new Error('사용자명이 너무 깁니다')
 * }
 * 
 * // 기본 아바타 사용
 * const avatar = user.avatar || USER_CONSTANTS.DEFAULT_AVATAR_URL
 * ```
 */
export const USER_CONSTANTS = {
  /** 사용자명 최소 길이 */
  MIN_USERNAME_LENGTH: 2,
  
  /** 사용자명 최대 길이 */
  MAX_USERNAME_LENGTH: 50,
  
  /** 비밀번호 최소 길이 */
  MIN_PASSWORD_LENGTH: 8,
  
  /** 비밀번호 최대 길이 */
  MAX_PASSWORD_LENGTH: 128,
  
  /** 자기소개 최대 길이 */
  MAX_BIO_LENGTH: 500,
  
  /** 기본 아바타 URL */
  DEFAULT_AVATAR_URL: '/images/default-avatar.png',
  
  /** 기본 테마 설정 */
  DEFAULT_THEME: 'system' as const,
  
  /** 기본 언어 설정 */
  DEFAULT_LANGUAGE: 'ko' as const,
  
  /** 기본 시간대 */
  DEFAULT_TIMEZONE: 'Asia/Seoul' as const
} as const

/**
 * 문서 관련 상수
 * 
 * 문서 생성, 편집, 저장과 관련된 제한값과 기본값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 문서 제목 길이 검증
 * if (title.length > DOCUMENT_CONSTANTS.MAX_TITLE_LENGTH) {
 *   throw new Error('제목이 너무 깁니다')
 * }
 * 
 * // 자동 저장 간격 설정
 * setInterval(autoSave, DOCUMENT_CONSTANTS.AUTO_SAVE_INTERVAL)
 * ```
 * 
 * @editor 문서 편집 시스템 제한값
 */
export const DOCUMENT_CONSTANTS = {
  /** 문서 제목 최소 길이 */
  MIN_TITLE_LENGTH: 1,
  
  /** 문서 제목 최대 길이 */
  MAX_TITLE_LENGTH: 200,
  
  /** 문서 내용 최대 크기 (바이트) */
  MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB
  
  /** 자동 저장 간격 (밀리초) */
  AUTO_SAVE_INTERVAL: 5000, // 5초
  
  /** 문서 히스토리 최대 보관 개수 */
  MAX_HISTORY_COUNT: 100,
  
  /** 기본 문서 제목 */
  DEFAULT_TITLE: '제목 없음',
  
  /** 빈 문서 내용 */
  EMPTY_CONTENT: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: []
      }
    ]
  }
} as const

/**
 * 협업 관련 상수
 * 
 * 실시간 협업, WebSocket 연결, Y.js 동기화와 관련된 설정값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // WebSocket 재연결 설정
 * const maxRetries = COLLABORATION_CONSTANTS.MAX_RECONNECT_ATTEMPTS
 * const retryDelay = COLLABORATION_CONSTANTS.RECONNECT_DELAY
 * 
 * // 사용자 색상 할당
 * const userColor = COLLABORATION_CONSTANTS.USER_COLORS[userId % colors.length]
 * ```
 * 
 * @collaboration 실시간 협업 시스템 설정
 * @yjs Y.js 동기화 관련 설정
 */
export const COLLABORATION_CONSTANTS = {
  /** WebSocket 최대 재연결 시도 횟수 */
  MAX_RECONNECT_ATTEMPTS: 5,
  
  /** WebSocket 재연결 지연 시간 (밀리초) */
  RECONNECT_DELAY: 1000,
  
  /** 사용자 비활성 타임아웃 (밀리초) */
  USER_INACTIVE_TIMEOUT: 30000, // 30초
  
  /** 커서 위치 업데이트 간격 (밀리초) */
  CURSOR_UPDATE_INTERVAL: 100,
  
  /** Y.js 문서 동기화 간격 (밀리초) */
  SYNC_INTERVAL: 1000,
  
  /** 최대 동시 접속 사용자 수 */
  MAX_CONCURRENT_USERS: 50,
  
  /** 협업 사용자 색상 팔레트 */
  USER_COLORS: [
    '#FF6B6B', // 빨강
    '#4ECDC4', // 청록
    '#45B7D1', // 파랑
    '#96CEB4', // 초록
    '#FFEAA7', // 노랑
    '#DDA0DD', // 보라
    '#98D8C8', // 민트
    '#F7DC6F', // 금색
    '#BB8FCE', // 라벤더
    '#85C1E9'  // 하늘색
  ],
  
  /** 기본 사용자 색상 */
  DEFAULT_USER_COLOR: '#6C757D'
} as const

/**
 * 파일 업로드 관련 상수
 * 
 * 파일 업로드, 이미지 처리, 첨부파일과 관련된 제한값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 파일 크기 검증
 * if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
 *   throw new Error('파일 크기가 너무 큽니다')
 * }
 * 
 * // 이미지 파일 검증
 * const isImage = FILE_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type)
 * ```
 * 
 * @security 파일 업로드 보안 제한
 */
export const FILE_CONSTANTS = {
  /** 최대 파일 크기 (바이트) */
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  /** 최대 이미지 크기 (바이트) */
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  
  /** 허용된 이미지 MIME 타입 */
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  
  /** 허용된 문서 MIME 타입 */
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  
  /** 이미지 썸네일 크기 */
  THUMBNAIL_SIZES: {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 }
  },
  
  /** 기본 파일 아이콘 */
  DEFAULT_FILE_ICON: '/icons/file-default.svg'
} as const

/**
 * API 관련 상수
 * 
 * API 요청, 응답, 페이지네이션과 관련된 설정값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 페이지네이션 설정
 * const params = {
 *   page: 1,
 *   limit: API_CONSTANTS.DEFAULT_PAGE_SIZE
 * }
 * 
 * // 요청 타임아웃 설정
 * const timeout = API_CONSTANTS.REQUEST_TIMEOUT
 * ```
 */
export const API_CONSTANTS = {
  /** 기본 페이지 크기 */
  DEFAULT_PAGE_SIZE: 20,
  
  /** 최대 페이지 크기 */
  MAX_PAGE_SIZE: 100,
  
  /** API 요청 타임아웃 (밀리초) */
  REQUEST_TIMEOUT: 30000, // 30초
  
  /** 재시도 최대 횟수 */
  MAX_RETRY_ATTEMPTS: 3,
  
  /** 재시도 지연 시간 (밀리초) */
  RETRY_DELAY: 1000,
  
  /** JWT 토큰 만료 시간 (초) */
  JWT_EXPIRES_IN: 24 * 60 * 60, // 24시간
  
  /** 리프레시 토큰 만료 시간 (초) */
  REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60, // 7일
  
  /** API 버전 */
  API_VERSION: 'v1'
} as const

/**
 * 에디터 관련 상수
 * 
 * Tiptap 에디터, 블록 시스템, 키보드 단축키와 관련된 설정값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 에디터 설정
 * const editorConfig = {
 *   maxContentLength: EDITOR_CONSTANTS.MAX_CONTENT_LENGTH,
 *   autoSaveDelay: EDITOR_CONSTANTS.AUTO_SAVE_DELAY
 * }
 * 
 * // 키보드 단축키 확인
 * if (event.key === EDITOR_CONSTANTS.SHORTCUTS.BOLD) {
 *   toggleBold()
 * }
 * ```
 * 
 * @editor Tiptap 에디터 설정
 */
export const EDITOR_CONSTANTS = {
  /** 에디터 내용 최대 길이 */
  MAX_CONTENT_LENGTH: 1000000, // 100만 자
  
  /** 자동 저장 지연 시간 (밀리초) */
  AUTO_SAVE_DELAY: 2000, // 2초
  
  /** 실행 취소 히스토리 최대 개수 */
  MAX_UNDO_HISTORY: 50,
  
  /** 기본 폰트 크기 */
  DEFAULT_FONT_SIZE: 16,
  
  /** 기본 줄 높이 */
  DEFAULT_LINE_HEIGHT: 1.6,
  
  /** 키보드 단축키 */
  SHORTCUTS: {
    BOLD: 'b',
    ITALIC: 'i',
    UNDERLINE: 'u',
    STRIKE: 's',
    CODE: 'e',
    LINK: 'k',
    UNDO: 'z',
    REDO: 'y',
    SAVE: 's'
  },
  
  /** 블록 타입별 기본 속성 */
  DEFAULT_BLOCK_ATTRS: {
    heading: { level: 1 },
    codeBlock: { language: 'text' },
    image: { alt: '', title: '' },
    table: { rows: 3, cols: 3 }
  }
} as const

/**
 * 환경별 설정 상수
 * 
 * 개발, 테스트, 프로덕션 환경별로 다른 설정값을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 환경별 로그 레벨 설정
 * const logLevel = ENV_CONSTANTS.LOG_LEVELS[process.env.NODE_ENV] || 'info'
 * 
 * // 환경별 캐시 TTL 설정
 * const cacheTTL = ENV_CONSTANTS.CACHE_TTL[process.env.NODE_ENV] || 3600
 * ```
 */
export const ENV_CONSTANTS = {
  /** 환경별 로그 레벨 */
  LOG_LEVELS: {
    development: 'debug',
    test: 'warn',
    production: 'error'
  },
  
  /** 환경별 캐시 TTL (초) */
  CACHE_TTL: {
    development: 60, // 1분
    test: 30, // 30초
    production: 3600 // 1시간
  },
  
  /** 환경별 데이터베이스 풀 크기 */
  DB_POOL_SIZE: {
    development: 5,
    test: 2,
    production: 20
  }
} as const

/**
 * 정규표현식 패턴 상수
 * 
 * 자주 사용되는 정규표현식 패턴들을 정의합니다.
 * 검증, 파싱, 포맷팅에 사용됩니다.
 * 
 * @example
 * ```typescript
 * // 이메일 검증
 * const isValidEmail = REGEX_PATTERNS.EMAIL.test(email)
 * 
 * // URL 추출
 * const urls = text.match(REGEX_PATTERNS.URL)
 * ```
 */
export const REGEX_PATTERNS = {
  /** 이메일 주소 패턴 */
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  /** URL 패턴 */
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
  
  /** 전화번호 패턴 (한국) */
  PHONE_KR: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/,
  
  /** 비밀번호 강도 패턴 */
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  /** 한글 패턴 */
  KOREAN: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/,
  
  /** 영문 패턴 */
  ENGLISH: /^[a-zA-Z\s]+$/,
  
  /** 숫자만 패턴 */
  NUMBERS_ONLY: /^\d+$/,
  
  /** 영문+숫자 패턴 */
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  
  /** HTML 태그 제거 패턴 */
  HTML_TAGS: /<[^>]*>/g,
  
  /** 공백 정규화 패턴 */
  NORMALIZE_SPACES: /\s+/g
} as const