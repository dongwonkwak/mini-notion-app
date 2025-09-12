// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
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