// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  emailVerified?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  provider: 'email' | 'google' | 'github';
  providerId?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface OAuthProvider {
  id: 'google' | 'github';
  name: string;
  clientId: string;
  clientSecret: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  workspaceId?: string;
  iat: number;
  exp: number;
}

// 더 엄격한 JWT 페이로드 타입
export interface StrictJWTPayload {
  readonly userId: string;
  readonly email: string;
  readonly role: UserRole;
  readonly workspaceId?: string;
  readonly iat: number;
  readonly exp: number;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export type UserRole = 'guest' | 'viewer' | 'editor' | 'admin' | 'owner';

// 구체적인 에러 코드 정의
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  MFA_REQUIRED = 'MFA_REQUIRED',
  INVALID_MFA_TOKEN = 'INVALID_MFA_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_JWT = 'INVALID_JWT',
  EXPIRED_JWT = 'EXPIRED_JWT',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  MFA_SETUP_FAILED = 'MFA_SETUP_FAILED',
  MFA_ENABLE_FAILED = 'MFA_ENABLE_FAILED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED'
}

// 더 구체적인 AuthError 클래스
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Workspace and Page Types
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowInvites: boolean;
  theme?: string;
}

export interface Page {
  id: string;
  workspaceId: string;
  title: string;
  parentId?: string;
  children: string[];
  documentId: string;
  permissions: PagePermissions;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PagePermissions {
  read: string[];
  write: string[];
  admin: string[];
}

// Block and Editor Types
export interface Block {
  id: string;
  type: BlockType;
  content: any;
  position: number;
  parentId?: string;
  metadata: BlockMetadata;
}

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'code' 
  | 'image' 
  | 'table' 
  | 'quote'
  | 'divider'
  | 'file';

export interface BlockMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

// Collaboration Types
export interface AwarenessState {
  user: {
    id: string;
    name: string;
    color: string;
    avatar?: string;
  };
  cursor?: {
    anchor: number;
    head: number;
  };
  selection?: {
    from: number;
    to: number;
  };
  lastActivity: number;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
}

// Comment Types
export interface Comment {
  id: string;
  documentId: string;
  parentId?: string;
  authorId: string;
  content: string;
  positionStart?: number;
  positionEnd?: number;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// File Upload Types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration Types
export interface EditorConfig {
  documentId: string;
  userId: string;
  permissions: UserPermission;
  theme?: 'light' | 'dark' | 'system';
}

export interface CollaborationConfig {
  serverUrl: string;
  documentId: string;
  token: string;
}

export type UserPermission = 'read' | 'write' | 'admin';

// Event Types
export interface UserActivity {
  type: 'edit' | 'cursor' | 'selection' | 'join' | 'leave';
  userId: string;
  timestamp: Date;
  data?: any;
}