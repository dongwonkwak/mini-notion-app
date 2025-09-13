/**
 * 인증 관련 유틸리티 패키지
 * NextAuth.js 기반 다중 프로바이더 인증 및 RBAC 시스템
 */

export { AuthService } from './AuthService';
export { PermissionService } from './PermissionService';
export { TokenService } from './TokenService';
export { MFAService } from './MFAService';
export { SessionCacheService } from './SessionCacheService';
export { AuthEventLogger } from './AuthEventLogger';

// 타입 재내보내기
export type {
  User,
  CreateUserData,
  LoginCredentials,
  AuthResult,
  JWTPayload,
  StrictJWTPayload,
  MFASetup,
  Session,
  UserRole,
} from '@editor/types';

export type { AuthEvent, AuthEventFilter } from './AuthEventLogger';

export { AuthErrorCode, AuthError } from '@editor/types';
