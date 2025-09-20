/**
 * 사용자 관련 타입 정의
 */

import { BaseEntity, ID } from '../common/base.types'

/**
 * 사용자 역할 타입
 */
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

/**
 * 사용자 인터페이스
 */
export interface User extends BaseEntity {
  /** 사용자 이메일 주소 (고유) */
  email: string
  /** 사용자 표시 이름 */
  name: string
  /** 프로필 이미지 URL */
  avatar?: string
  /** 사용자 역할 */
  role: UserRole
  /** 사용자 설정 */
  preferences: UserPreferences
  /** 이메일 인증 여부 */
  emailVerified: boolean
  /** 마지막 로그인 시간 */
  lastLoginAt?: number
}

/**
 * 사용자 설정
 */
export interface UserPreferences {
  /** 테마 설정 */
  theme: 'light' | 'dark' | 'system'
  /** 언어 설정 */
  language: string
  /** 알림 설정 */
  notifications: NotificationSettings
  /** 에디터 설정 */
  editor: EditorPreferences
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  /** 이메일 알림 */
  email: boolean
  /** 푸시 알림 */
  push: boolean
  /** 멘션 알림 */
  mentions: boolean
  /** 댓글 알림 */
  comments: boolean
  /** 문서 공유 알림 */
  sharing: boolean
}

/**
 * 에디터 설정
 */
export interface EditorPreferences {
  /** 자동 저장 간격 (초) */
  autoSaveInterval: number
  /** 스펠 체크 활성화 */
  spellCheck: boolean
  /** 포커스 모드 */
  focusMode: boolean
  /** 라인 넘버 표시 */
  showLineNumbers: boolean
}

/**
 * 사용자 생성 DTO
 */
export interface CreateUserDto {
  email: string
  name: string
  password: string
}

/**
 * 사용자 업데이트 DTO
 */
export interface UpdateUserDto {
  name?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

/**
 * 사용자 프로필 DTO (공개 정보만)
 */
export interface UserProfile {
  id: ID
  name: string
  avatar?: string
  role: UserRole
  joinedAt: number
}