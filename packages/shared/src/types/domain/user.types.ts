/**
 * 사용자 관련 타입 정의
 * 
 * 미니 노션의 사용자 계정, 인증, 권한 관리와 관련된 모든 타입을 정의합니다.
 * 실시간 협업에서 사용자 식별과 권한 제어에 핵심적인 역할을 합니다.
 * 
 * @since 1.0.0
 * @collaboration 실시간 협업에서 사용자 식별 및 권한 관리
 */

import type { BaseEntity, ID, Timestamp } from '../common/base.types'

/**
 * 사용자 역할 타입
 * 
 * 워크스페이스 내에서 사용자의 권한 수준을 정의합니다.
 * 역할에 따라 문서 편집, 사용자 관리 등의 권한이 결정됩니다.
 * 
 * @example
 * ```typescript
 * // 소유자 - 모든 권한
 * const ownerRole: UserRole = 'owner'
 * 
 * // 편집자 - 문서 편집 가능
 * const editorRole: UserRole = 'editor'
 * 
 * // 뷰어 - 읽기 전용
 * const viewerRole: UserRole = 'viewer'
 * ```
 */
export type UserRole = 
  | 'owner'    // 워크스페이스 소유자 - 모든 권한
  | 'admin'    // 관리자 - 사용자 관리 및 설정 변경 가능
  | 'editor'   // 편집자 - 문서 생성, 편집, 삭제 가능
  | 'viewer'   // 뷰어 - 문서 읽기 전용

/**
 * 사용자 상태 타입
 * 
 * 사용자 계정의 현재 상태를 나타냅니다.
 * 계정 활성화, 비활성화, 정지 등의 상태 관리에 사용됩니다.
 */
export type UserStatus = 
  | 'active'     // 활성 상태
  | 'inactive'   // 비활성 상태
  | 'suspended'  // 정지 상태
  | 'pending'    // 승인 대기 상태

/**
 * 알림 설정
 * 
 * 사용자의 알림 수신 설정을 정의합니다.
 * 이메일, 푸시, 멘션 등 다양한 알림 채널별로 설정할 수 있습니다.
 * 
 * @example
 * ```typescript
 * const notifications: NotificationSettings = {
 *   email: true,
 *   push: false,
 *   mentions: true,
 *   comments: true,
 *   documentShares: false
 * }
 * ```
 */
export interface NotificationSettings {
  /** 이메일 알림 수신 여부 */
  email: boolean
  
  /** 푸시 알림 수신 여부 */
  push: boolean
  
  /** 멘션 알림 수신 여부 */
  mentions: boolean
  
  /** 댓글 알림 수신 여부 */
  comments: boolean
  
  /** 문서 공유 알림 수신 여부 */
  documentShares: boolean
}

/**
 * 사용자 개인 설정
 * 
 * 사용자의 개인화 설정을 정의합니다.
 * 테마, 언어, 알림 등 사용자 경험을 개선하는 설정들을 포함합니다.
 * 
 * @example
 * ```typescript
 * const preferences: UserPreferences = {
 *   theme: 'dark',
 *   language: 'ko',
 *   timezone: 'Asia/Seoul',
 *   notifications: {
 *     email: true,
 *     push: false,
 *     mentions: true,
 *     comments: true,
 *     documentShares: false
 *   },
 *   editor: {
 *     fontSize: 14,
 *     lineHeight: 1.6,
 *     showLineNumbers: false
 *   }
 * }
 * ```
 */
export interface UserPreferences {
  /** 테마 설정 */
  theme: 'light' | 'dark' | 'system'
  
  /** 언어 설정 (ISO 639-1 코드) */
  language: string
  
  /** 시간대 설정 (IANA 시간대 식별자) */
  timezone: string
  
  /** 알림 설정 */
  notifications: NotificationSettings
  
  /** 에디터 설정 */
  editor: {
    /** 폰트 크기 (픽셀) */
    fontSize: number
    
    /** 줄 높이 */
    lineHeight: number
    
    /** 줄 번호 표시 여부 */
    showLineNumbers: boolean
  }
}

/**
 * 사용자 프로필 정보
 * 
 * 사용자의 공개 프로필 정보를 정의합니다.
 * 다른 사용자에게 표시되는 정보들을 포함합니다.
 * 
 * @example
 * ```typescript
 * const profile: UserProfile = {
 *   displayName: 'John Doe',
 *   bio: '프론트엔드 개발자입니다.',
 *   avatar: 'https://example.com/avatar.jpg',
 *   website: 'https://johndoe.dev',
 *   location: 'Seoul, Korea'
 * }
 * ```
 */
export interface UserProfile {
  /** 표시 이름 */
  displayName: string
  
  /** 자기소개 (선택적) */
  bio?: string
  
  /** 프로필 이미지 URL (선택적) */
  avatar?: string
  
  /** 웹사이트 URL (선택적) */
  website?: string
  
  /** 위치 정보 (선택적) */
  location?: string
}

/**
 * 사용자 정보 인터페이스
 * 
 * 미니 노션에서 사용자 계정과 관련된 모든 정보를 포함합니다.
 * 실시간 협업 시 사용자 식별과 권한 관리에 사용됩니다.
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   role: 'editor',
 *   status: 'active',
 *   profile: {
 *     displayName: 'John Doe',
 *     avatar: 'https://example.com/avatar.jpg'
 *   },
 *   preferences: {
 *     theme: 'dark',
 *     language: 'ko',
 *     timezone: 'Asia/Seoul',
 *     notifications: { ... },
 *     editor: { ... }
 *   },
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * }
 * ```
 * 
 * @collaboration 실시간 협업에서 사용자 식별에 사용
 * @see {@link UserRole} 사용자 역할 타입
 * @see {@link UserPreferences} 사용자 설정 타입
 */
export interface User extends BaseEntity {
  /** 
   * 사용자 이메일 주소 (고유 식별자)
   * 
   * 로그인 시 사용되며, 시스템 내에서 고유해야 합니다.
   * 이메일 형식 검증이 필요합니다.
   */
  email: string
  
  /** 
   * 사용자 역할
   * 
   * 워크스페이스 내에서의 권한 수준을 결정합니다.
   * @see {@link UserRole} 가능한 역할 목록
   */
  role: UserRole
  
  /** 
   * 사용자 계정 상태
   * 
   * 계정의 활성화 여부와 상태를 나타냅니다.
   */
  status: UserStatus
  
  /** 
   * 사용자 프로필 정보
   * 
   * 다른 사용자에게 표시되는 공개 정보입니다.
   */
  profile: UserProfile
  
  /** 
   * 사용자 개인 설정
   * 
   * 테마, 언어, 알림 등 개인화 설정을 포함합니다.
   * @see {@link UserPreferences} 설정 상세 정보
   */
  preferences: UserPreferences
  
  /** 마지막 로그인 시간 (선택적) */
  lastLoginAt?: Timestamp
  
  /** 이메일 인증 여부 */
  emailVerified: boolean
  
  /** 이메일 인증 시간 (선택적) */
  emailVerifiedAt?: Timestamp
}

/**
 * 사용자 생성 DTO
 * 
 * 새로운 사용자 계정을 생성할 때 필요한 정보를 정의합니다.
 * 회원가입 API에서 사용됩니다.
 * 
 * @example
 * ```typescript
 * const createUserDto: CreateUserDto = {
 *   email: 'newuser@example.com',
 *   password: 'securePassword123',
 *   displayName: 'New User',
 *   language: 'ko'
 * }
 * ```
 */
export interface CreateUserDto {
  /** 이메일 주소 */
  email: string
  
  /** 비밀번호 */
  password: string
  
  /** 표시 이름 */
  displayName: string
  
  /** 언어 설정 (선택적, 기본값: 'en') */
  language?: string
  
  /** 초대 토큰 (선택적) */
  inviteToken?: string
}

/**
 * 사용자 업데이트 DTO
 * 
 * 기존 사용자 정보를 수정할 때 사용하는 데이터 구조입니다.
 * 모든 필드가 선택적이며, 제공된 필드만 업데이트됩니다.
 * 
 * @example
 * ```typescript
 * const updateUserDto: UpdateUserDto = {
 *   profile: {
 *     displayName: 'Updated Name',
 *     bio: 'Updated bio'
 *   },
 *   preferences: {
 *     theme: 'light'
 *   }
 * }
 * ```
 */
export interface UpdateUserDto {
  /** 프로필 정보 업데이트 (선택적) */
  profile?: Partial<UserProfile>
  
  /** 개인 설정 업데이트 (선택적) */
  preferences?: Partial<UserPreferences>
  
  /** 역할 변경 (관리자만 가능, 선택적) */
  role?: UserRole
  
  /** 상태 변경 (관리자만 가능, 선택적) */
  status?: UserStatus
}

/**
 * 사용자 로그인 DTO
 * 
 * 사용자 인증에 필요한 정보를 정의합니다.
 * 로그인 API에서 사용됩니다.
 * 
 * @example
 * ```typescript
 * const loginDto: LoginUserDto = {
 *   email: 'user@example.com',
 *   password: 'userPassword123',
 *   rememberMe: true
 * }
 * ```
 */
export interface LoginUserDto {
  /** 이메일 주소 */
  email: string
  
  /** 비밀번호 */
  password: string
  
  /** 로그인 상태 유지 여부 (선택적) */
  rememberMe?: boolean
}

/**
 * 비밀번호 변경 DTO
 * 
 * 사용자 비밀번호 변경에 필요한 정보를 정의합니다.
 * 
 * @example
 * ```typescript
 * const changePasswordDto: ChangePasswordDto = {
 *   currentPassword: 'oldPassword123',
 *   newPassword: 'newSecurePassword456'
 * }
 * ```
 */
export interface ChangePasswordDto {
  /** 현재 비밀번호 */
  currentPassword: string
  
  /** 새 비밀번호 */
  newPassword: string
}

/**
 * 사용자 검색 결과
 * 
 * 사용자 검색 API의 응답 형식을 정의합니다.
 * 민감한 정보는 제외하고 공개 정보만 포함합니다.
 * 
 * @example
 * ```typescript
 * const searchResult: UserSearchResult = {
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   profile: {
 *     displayName: 'John Doe',
 *     avatar: 'https://example.com/avatar.jpg'
 *   },
 *   role: 'editor',
 *   status: 'active'
 * }
 * ```
 */
export interface UserSearchResult {
  /** 사용자 ID */
  id: ID
  
  /** 이메일 주소 */
  email: string
  
  /** 프로필 정보 */
  profile: UserProfile
  
  /** 역할 */
  role: UserRole
  
  /** 상태 */
  status: UserStatus
}