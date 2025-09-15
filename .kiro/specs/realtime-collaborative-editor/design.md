# Design Document

## Overview

실시간 협업 에디터는 Y.js의 CRDT(Conflict-free Replicated Data Type) 기술을 기반으로 하여 동시 편집 시 발생하는 충돌을 자동으로 해결하고, Tiptap 에디터를 통해 풍부한 블록 기반 편집 경험을 제공하며, Hocuspocus 서버를 통해 실시간 동기화를 구현하는 시스템입니다.

### 핵심 기술 스택

- **Monorepo**: Turbo + pnpm workspace
- **Frontend**: React/Next.js, Tiptap, Y.js, TailwindCSS
- **Backend**: Node.js, Hocuspocus, Express.js
- **Database**: PostgreSQL (메타데이터), Redis (캐싱)
- **Storage**: AWS S3 (파일 저장)
- **Authentication**: NextAuth.js (OAuth + JWT)

## Architecture

### Monorepo Structure

```
mini-notion-app/
├── apps/
│   ├── web/                    # Next.js 클라이언트 앱
│   ├── server/                 # Hocuspocus 서버
│   └── api/                    # REST API 서버
├── packages/
│   ├── ui/                     # 공통 UI 컴포넌트
│   ├── editor/                 # Tiptap 에디터 로직
│   ├── collaboration/          # Y.js 협업 로직
│   ├── auth/                   # 인증 관련 유틸리티
│   ├── database/               # DB 스키마 & 쿼리
│   ├── types/                  # TypeScript 타입 정의
│   └── config/                 # 공통 설정 (ESLint, Tailwind 등)
├── turbo.json                  # Turbo 빌드 설정
├── package.json                # 루트 패키지 설정
└── pnpm-workspace.yaml         # pnpm workspace 설정
```

### Turbo Configuration

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### Package Dependencies

```json
// apps/web/package.json
{
  "dependencies": {
    "@editor/ui": "workspace:*",
    "@editor/editor": "workspace:*",
    "@editor/collaboration": "workspace:*",
    "@editor/auth": "workspace:*",
    "@editor/types": "workspace:*"
  }
}

// apps/server/package.json
{
  "dependencies": {
    "@editor/collaboration": "workspace:*",
    "@editor/database": "workspace:*",
    "@editor/auth": "workspace:*",
    "@editor/types": "workspace:*"
  }
}
```

### 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Client Layer"
        A[React App] --> B[Tiptap Editor]
        A --> C[Y.js Client]
        A --> D[WebSocket Client]
    end

    subgraph "Load Balancer"
        E[Nginx/ALB]
    end

    subgraph "Application Layer"
        F[Hocuspocus Server 1]
        G[Hocuspocus Server 2]
        H[API Server]
    end

    subgraph "Data Layer"
        I[PostgreSQL]
        J[Redis Cache]
        K[S3 Storage]
    end

    A --> E
    E --> F
    E --> G
    E --> H

    F --> I
    F --> J
    G --> I
    G --> J
    H --> I
    H --> J
    H --> K
```

### 데이터 흐름

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant HC as Hocuspocus
    participant YJS as Y.js Document
    participant DB as Database
    participant Cache as Redis

    U1->>HC: Connect to document
    HC->>Cache: Check document cache
    Cache-->>HC: Return cached state
    HC->>YJS: Initialize Y.js document
    HC-->>U1: Send current state

    U2->>HC: Connect to same document
    HC-->>U2: Send current state

    U1->>YJS: Edit content
    YJS->>HC: Send Y.js update
    HC->>U2: Broadcast update
    HC->>Cache: Update cache
    HC->>DB: Persist changes (batched)
```

## Components and Interfaces

### 1. Frontend Components

#### Editor Component

```typescript
interface EditorProps {
  documentId: string;
  userId: string;
  permissions: UserPermission;
  onCollaboratorChange: (collaborators: Collaborator[]) => void;
}

interface EditorState {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  editor: Editor;
  collaborators: Collaborator[];
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}
```

#### Block System

```typescript
interface Block {
  id: string;
  type: BlockType;
  content: any;
  position: number;
  parentId?: string;
  metadata: BlockMetadata;
}

type BlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'code'
  | 'image'
  | 'table'
  | 'quote'
  | 'divider';

interface BlockMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

#### Workspace & Page Structure

```typescript
interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  owner: User;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface Page {
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

interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user: User;
  workspace: Workspace;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
}

interface WorkspaceSettings {
  defaultPermissions: 'read' | 'write' | 'admin';
  allowGuestAccess: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface PagePermissions {
  read: string[];
  write: string[];
  admin: string[];
  inherit: boolean;
}
```

### 2. Backend Services

#### Hocuspocus Server Configuration

```typescript
interface HocuspocusConfig {
  port: number;
  extensions: Extension[];
  onAuthenticate: (data: AuthData) => Promise<boolean>;
  onConnect: (data: ConnectionData) => void;
  onDisconnect: (data: ConnectionData) => void;
  onStoreDocument: (data: StoreDocumentData) => Promise<void>;
  onLoadDocument: (documentName: string) => Promise<Uint8Array>;
}

class DocumentPersistence {
  async storeDocument(documentId: string, state: Uint8Array): Promise<void>;
  async loadDocument(documentId: string): Promise<Uint8Array>;
  async getDocumentHistory(documentId: string): Promise<DocumentVersion[]>;
}
```

#### Authentication Service

```typescript
interface AuthService {
  validateJWT(token: string): Promise<User>;
  createUser(userData: CreateUserData): Promise<User>;
  authenticateOAuth(provider: OAuthProvider, code: string): Promise<AuthResult>;
  resetPassword(email: string): Promise<void>;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: Date;
  lastActiveAt: Date;
}
```

#### API Documentation System

```typescript
/**
 * JSDoc 주석 자동 생성을 위한 데코레이터 및 유틸리티
 */
interface ApiDocumentationConfig {
  autoGenerateJSDoc: boolean;
  includeExamples: boolean;
  generateOpenAPI: boolean;
  outputPath: string;
}

/**
 * API 엔드포인트 자동 문서화 데코레이터
 */
function ApiEndpoint(config: {
  summary: string;
  description: string;
  tags: string[];
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // JSDoc 주석 자동 생성 로직
  };
}

/**
 * 표준화된 JSDoc 템플릿
 */
interface JSDocTemplate {
  description: string;
  params: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  returns: {
    type: string;
    description: string;
  };
  throws: Array<{
    type: string;
    description: string;
  }>;
  example: string;
}
```

### 3. Real-time Collaboration

#### Awareness System

```typescript
interface AwarenessState {
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

class CollaborationManager {
  private awareness: Awareness;
  private provider: HocuspocusProvider;

  updateCursor(position: number): void;
  updateSelection(from: number, to: number): void;
  getActiveUsers(): AwarenessState[];
  broadcastUserActivity(activity: UserActivity): void;
}
```

## Data Models

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workspaces Table

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workspace Members Table

```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(workspace_id, user_id)
);
```

#### Pages Table

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES pages(id),
  document_id VARCHAR(255) UNIQUE NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Documents Table (Y.js State Storage)

```sql
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY,
  state BYTEA NOT NULL,
  version INTEGER DEFAULT 0,
  last_modified TIMESTAMP DEFAULT NOW(),
  size_bytes INTEGER DEFAULT 0
);

CREATE TABLE document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(255) REFERENCES documents(id),
  state BYTEA NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

#### Comments System

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES comments(id),
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Cache Structure

#### Document Cache

```typescript
interface DocumentCache {
  [`doc:${documentId}`]: {
    state: Buffer;
    version: number;
    lastModified: Date;
    activeUsers: string[];
  };
}

interface UserSession {
  [`session:${userId}`]: {
    activeDocuments: string[];
    lastActivity: Date;
    connectionId: string;
  };
}
```

## Error Handling

### Client-Side Error Recovery

```typescript
class ErrorRecoveryManager {
  private retryAttempts = 0;
  private maxRetries = 3;

  async handleConnectionError(error: ConnectionError): Promise<void> {
    if (this.retryAttempts < this.maxRetries) {
      await this.exponentialBackoff();
      await this.reconnect();
    } else {
      this.switchToOfflineMode();
    }
  }

  async handleSyncError(error: SyncError): Promise<void> {
    // Y.js 상태 복구 로직
    const localState = this.getLocalState();
    const serverState = await this.fetchServerState();
    const mergedState = Y.mergeUpdates([localState, serverState]);
    this.applyState(mergedState);
  }

  private switchToOfflineMode(): void {
    // 오프라인 모드 전환
    this.enableLocalPersistence();
    this.showOfflineIndicator();
    this.queuePendingChanges();
  }
}
```

### Server-Side Error Handling

```typescript
class ServerErrorHandler {
  async handleDocumentLoadError(documentId: string): Promise<void> {
    try {
      // 캐시에서 복구 시도
      const cachedState = await this.redis.get(`doc:${documentId}`);
      if (cachedState) return cachedState;

      // 백업에서 복구 시도
      const backupState = await this.loadFromBackup(documentId);
      if (backupState) return backupState;

      // 새 문서 생성
      return this.createEmptyDocument(documentId);
    } catch (error) {
      this.logger.error('Document recovery failed', { documentId, error });
      throw new DocumentRecoveryError(documentId);
    }
  }
}
```

## Testing Strategy

### Unit Testing

- **Y.js Integration**: CRDT 동작 및 충돌 해결 테스트
- **Tiptap Extensions**: 커스텀 블록 타입 및 명령어 테스트
- **Authentication**: JWT 토큰 검증 및 OAuth 플로우 테스트

### Integration Testing

- **Real-time Sync**: 다중 클라이언트 동기화 테스트
- **Offline/Online**: 네트워크 단절 및 복구 시나리오 테스트
- **Performance**: 대용량 문서 및 다수 사용자 부하 테스트

### End-to-End Testing

```typescript
describe('Collaborative Editing', () => {
  test('Multiple users can edit simultaneously', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const doc1 = await user1.openDocument('test-doc');
    const doc2 = await user2.openDocument('test-doc');

    await user1.type('Hello ');
    await user2.type('World!');

    await waitForSync();

    expect(doc1.getContent()).toBe('Hello World!');
    expect(doc2.getContent()).toBe('Hello World!');
  });
});
```

### Performance Testing

- **Latency**: 편집 동작의 응답 시간 측정
- **Throughput**: 동시 사용자 수 확장성 테스트
- **Memory**: Y.js 문서 크기에 따른 메모리 사용량 분석
- **Network**: 대역폭 사용량 및 압축 효율성 테스트#

# Offline-First Architecture

### Local Storage Strategy

```typescript
class OfflineManager {
  private indexedDB: IDBDatabase;
  private syncQueue: SyncOperation[];

  async storeDocumentLocally(
    documentId: string,
    state: Uint8Array
  ): Promise<void> {
    const transaction = this.indexedDB.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    await store.put({
      id: documentId,
      state: state,
      lastModified: Date.now(),
      pendingSync: true,
    });
  }

  async syncPendingChanges(): Promise<void> {
    const pendingDocs = await this.getPendingDocuments();

    for (const doc of pendingDocs) {
      try {
        await this.uploadDocumentState(doc.id, doc.state);
        await this.markAsSynced(doc.id);
      } catch (error) {
        this.handleSyncError(doc.id, error);
      }
    }
  }
}
```

### Conflict Resolution

```typescript
class ConflictResolver {
  resolveConflicts(
    localState: Uint8Array,
    serverState: Uint8Array
  ): Uint8Array {
    // Y.js의 자동 병합 기능 활용
    const localDoc = new Y.Doc();
    const serverDoc = new Y.Doc();

    Y.applyUpdate(localDoc, localState);
    Y.applyUpdate(serverDoc, serverState);

    // 두 상태를 병합
    const mergedUpdate = Y.encodeStateAsUpdate(localDoc);
    Y.applyUpdate(serverDoc, mergedUpdate);

    return Y.encodeStateAsUpdate(serverDoc);
  }
}
```

## Performance Optimization

### Document Virtualization

```typescript
class DocumentVirtualizer {
  private visibleRange: { start: number; end: number };
  private blockHeight = 50; // 평균 블록 높이
  private viewportHeight: number;

  calculateVisibleBlocks(): Block[] {
    const startIndex = Math.floor(this.visibleRange.start / this.blockHeight);
    const endIndex = Math.ceil(this.visibleRange.end / this.blockHeight);

    return this.document.blocks.slice(startIndex, endIndex + 5); // 버퍼 추가
  }

  onScroll(scrollTop: number): void {
    this.visibleRange = {
      start: scrollTop,
      end: scrollTop + this.viewportHeight,
    };

    this.renderVisibleBlocks();
  }
}
```

### Caching Strategy

```typescript
class CacheManager {
  private redis: Redis;
  private localCache: Map<string, CacheEntry>;

  async getDocument(documentId: string): Promise<DocumentState> {
    // L1: 메모리 캐시
    const memoryCache = this.localCache.get(documentId);
    if (memoryCache && !this.isExpired(memoryCache)) {
      return memoryCache.data;
    }

    // L2: Redis 캐시
    const redisCache = await this.redis.get(`doc:${documentId}`);
    if (redisCache) {
      const data = JSON.parse(redisCache);
      this.localCache.set(documentId, { data, timestamp: Date.now() });
      return data;
    }

    // L3: 데이터베이스
    const dbData = await this.loadFromDatabase(documentId);
    await this.redis.setex(`doc:${documentId}`, 3600, JSON.stringify(dbData));
    this.localCache.set(documentId, { data: dbData, timestamp: Date.now() });

    return dbData;
  }
}
```

## Security Considerations

### Authentication & Authorization

```typescript
class SecurityManager {
  async validateDocumentAccess(
    userId: string,
    documentId: string,
    action: 'read' | 'write' | 'admin'
  ): Promise<boolean> {
    const page = await this.getPageByDocumentId(documentId);
    const workspace = await this.getWorkspace(page.workspaceId);
    const member = workspace.members.find(m => m.userId === userId);

    if (!member) return false;

    const permissions = this.getPermissions(member.role);
    return permissions.includes(action);
  }

  sanitizeContent(content: any): any {
    // XSS 방지를 위한 콘텐츠 정화
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p',
        'h1',
        'h2',
        'h3',
        'strong',
        'em',
        'ul',
        'ol',
        'li',
        'code',
        'pre',
      ],
      ALLOWED_ATTR: ['class', 'id', 'data-*'],
    });
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private limits = new Map<string, RateLimit>();

  async checkLimit(userId: string, action: string): Promise<boolean> {
    const key = `${userId}:${action}`;
    const limit = this.limits.get(key) || {
      count: 0,
      resetTime: Date.now() + 60000,
    };

    if (Date.now() > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = Date.now() + 60000;
    }

    const maxRequests = this.getMaxRequests(action);
    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    this.limits.set(key, limit);
    return true;
  }
}
```

## Monitoring and Analytics

### Performance Metrics

```typescript
class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();

  recordLatency(operation: string, duration: number): void {
    const metric = {
      name: operation,
      value: duration,
      timestamp: Date.now(),
      type: 'latency',
    };

    this.addMetric('latency', metric);
  }

  recordUserActivity(userId: string, action: string): void {
    const metric = {
      name: 'user_activity',
      value: 1,
      timestamp: Date.now(),
      tags: { userId, action },
    };

    this.addMetric('activity', metric);
  }

  async exportMetrics(): Promise<void> {
    // Prometheus, DataDog 등으로 메트릭 전송
    const allMetrics = Array.from(this.metrics.values()).flat();
    await this.metricsExporter.send(allMetrics);
  }
}
```

### Error Tracking

```typescript
class ErrorTracker {
  captureError(error: Error, context: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userId: context.userId,
      documentId: context.documentId,
      userAgent: context.userAgent,
      url: context.url,
    };

    // Sentry, Bugsnag 등으로 전송
    this.errorReporter.capture(errorData);
  }
}
```

## Deployment Architecture

### Container Configuration

```dockerfile
# Hocuspocus Server
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 1234

CMD ["node", "server.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hocuspocus-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hocuspocus-server
  template:
    metadata:
      labels:
        app: hocuspocus-server
    spec:
      containers:
        - name: hocuspocus
          image: collaborative-editor/hocuspocus:latest
          ports:
            - containerPort: 1234
          env:
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: url
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: url
---
apiVersion: v1
kind: Service
metadata:
  name: hocuspocus-service
spec:
  selector:
    app: hocuspocus-server
  ports:
    - port: 1234
      targetPort: 1234
  type: LoadBalancer
```

## Mobile Responsiveness

### Touch Interaction Design

```typescript
class TouchManager {
  private touchStartTime: number;
  private touchStartPosition: { x: number; y: number };

  handleTouchStart(event: TouchEvent): void {
    this.touchStartTime = Date.now();
    this.touchStartPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  handleTouchEnd(event: TouchEvent): void {
    const duration = Date.now() - this.touchStartTime;
    const distance = this.calculateDistance(event.changedTouches[0]);

    if (duration < 200 && distance < 10) {
      this.handleTap(event);
    } else if (duration > 500 && distance < 10) {
      this.handleLongPress(event);
    } else if (distance > 50) {
      this.handleSwipe(event);
    }
  }

  private handleLongPress(event: TouchEvent): void {
    // 블록 선택 및 컨텍스트 메뉴 표시
    this.showContextMenu(event.changedTouches[0]);
  }
}
```

### Responsive Layout

```typescript
class ResponsiveLayoutManager {
  private breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  };

  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;

    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }

  adaptUIForDevice(): void {
    const device = this.getCurrentBreakpoint();

    switch (device) {
      case 'mobile':
        this.enableMobileMode();
        break;
      case 'tablet':
        this.enableTabletMode();
        break;
      case 'desktop':
        this.enableDesktopMode();
        break;
    }
  }

  private enableMobileMode(): void {
    // 사이드바 숨김, 터치 친화적 버튼 크기 조정
    this.hideSidebar();
    this.increaseTouchTargets();
    this.enableSwipeNavigation();
  }
}
```

이제 포괄적인 설계 문서가 완성되었습니다. Y.js, Tiptap, Hocuspocus를 활용한 실시간 협업 에디터의 모든 핵심 구성 요소와 아키텍처가 상세히 설계되었어요!

#

# Monorepo Development Workflow

### Package Structure Details

#### `packages/editor` - Tiptap Editor Core

```typescript
// packages/editor/src/index.ts
export { CollaborativeEditor } from './CollaborativeEditor';
export { BlockExtensions } from './extensions';
export { EditorCommands } from './commands';
export type { EditorConfig, BlockType } from './types';
```

#### `packages/collaboration` - Y.js Integration

```typescript
// packages/collaboration/src/index.ts
export { YjsProvider } from './YjsProvider';
export { AwarenessManager } from './AwarenessManager';
export { OfflineManager } from './OfflineManager';
export type { CollaborationConfig, AwarenessState } from './types';
```

#### `packages/ui` - Shared Components

```typescript
// packages/ui/src/index.ts
export { Button, Input, Modal } from './components';
export { useTheme, ThemeProvider } from './theme';
export { cn } from './utils';
```

### Build & Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  }
}
```

### Environment Configuration

```typescript
// packages/config/src/env.ts
export const env = {
  // 공통 환경 변수
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 데이터베이스
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,

  // 인증
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,

  // 파일 저장
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET!,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,

  // Hocuspocus
  HOCUSPOCUS_PORT: parseInt(process.env.HOCUSPOCUS_PORT || '1234'),
  HOCUSPOCUS_SECRET: process.env.HOCUSPOCUS_SECRET!,
};
```

### Shared TypeScript Configuration

```json
// packages/config/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@editor/ui": ["../../packages/ui/src"],
      "@editor/editor": ["../../packages/editor/src"],
      "@editor/collaboration": ["../../packages/collaboration/src"],
      "@editor/auth": ["../../packages/auth/src"],
      "@editor/database": ["../../packages/database/src"],
      "@editor/types": ["../../packages/types/src"],
      "@editor/config": ["../../packages/config/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Docker Configuration for Monorepo

```dockerfile
# Dockerfile.web
FROM node:18-alpine AS base
RUN npm install -g pnpm turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=web --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=web

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### CI/CD Pipeline for Monorepo

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm turbo type-check

      - name: Lint
        run: pnpm turbo lint

      - name: Test
        run: pnpm turbo test

      - name: Build
        run: pnpm turbo build

      - name: Build Docker images
        run: |
          docker build -f Dockerfile.web -t collaborative-editor/web .
          docker build -f Dockerfile.server -t collaborative-editor/server .
```

이제 Turbo 모노레포 구조가 완전히 설계에 반영되었습니다!

**모노레포의 장점**:

- 📦 **코드 공유**: 공통 로직을 패키지로 분리하여 재사용
- 🚀 **빠른 빌드**: Turbo의 캐싱으로 변경된 부분만 빌드
- 🔄 **의존성 관리**: pnpm workspace로 효율적인 패키지 관리
- 🧪 **통합 테스트**: 전체 시스템을 하나의 저장소에서 테스트
- 🚢 **배포 최적화**: Docker multi-stage build로 최적화된 이미지 생성## Cod
  e Quality & Testing Framework

### Static Code Analysis

#### ESLint Configuration

```json
// packages/config/eslint/base.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always"
    }],
    "unused-imports/no-unused-imports": "error"
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      extends: ["plugin:testing-library/react"]
    }
  ]
};
```

#### Prettier Configuration

```json
// packages/config/prettier/index.js
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  arrowParens: "avoid"
};
```

#### SonarQube Integration

```yaml
# sonar-project.properties
sonar.projectKey=collaborative-editor
sonar.organization=your-org
sonar.sources=apps,packages
sonar.exclusions=**/*.test.ts,**/*.test.tsx,**/node_modules/**
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Testing Framework Architecture

#### Jest Configuration

```typescript
// packages/config/jest/base.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@editor/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Testing Libraries

```json
// 테스트 의존성
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "playwright": "^1.28.0",
    "vitest": "^0.24.0",
    "msw": "^0.47.0"
  }
}
```

#### Unit Test Examples

```typescript
// packages/editor/src/__tests__/CollaborativeEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CollaborativeEditor } from '../CollaborativeEditor';
import { mockYjsProvider } from '../__mocks__/YjsProvider';

jest.mock('../YjsProvider', () => mockYjsProvider);

describe('CollaborativeEditor', () => {
  it('should render editor with initial content', () => {
    render(
      <CollaborativeEditor
        documentId="test-doc"
        userId="user-1"
        initialContent="Hello World"
      />
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle collaborative editing', async () => {
    const onUpdate = jest.fn();
    render(
      <CollaborativeEditor
        documentId="test-doc"
        userId="user-1"
        onUpdate={onUpdate}
      />
    );

    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { textContent: 'New content' } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'New content'
      })
    );
  });
});
```

#### Integration Tests

```typescript
// packages/collaboration/src/__tests__/YjsIntegration.test.ts
import * as Y from 'yjs';

import { YjsProvider } from '../YjsProvider';

describe('Y.js Integration', () => {
  it('should sync changes between multiple clients', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const provider1 = new YjsProvider(doc1, 'test-room');
    const provider2 = new YjsProvider(doc2, 'test-room');

    await Promise.all([provider1.connect(), provider2.connect()]);

    const text1 = doc1.getText('content');
    const text2 = doc2.getText('content');

    text1.insert(0, 'Hello ');
    await new Promise(resolve => setTimeout(resolve, 100));

    text2.insert(6, 'World!');
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(text1.toString()).toBe('Hello World!');
    expect(text2.toString()).toBe('Hello World!');
  });
});
```

#### E2E Tests with Playwright

```typescript
// apps/web/e2e/collaboration.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Collaborative Editing', () => {
  test('multiple users can edit simultaneously', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/document/test-doc');
    await page2.goto('/document/test-doc');

    // User 1 types
    await page1.locator('[data-testid="editor"]').fill('Hello ');

    // User 2 types
    await page2.locator('[data-testid="editor"]').fill('World!');

    // Both should see the merged content
    await expect(page1.locator('[data-testid="editor"]')).toContainText(
      'Hello World!'
    );
    await expect(page2.locator('[data-testid="editor"]')).toContainText(
      'Hello World!'
    );
  });
});
```

## Monitoring & Observability

### Application Performance Monitoring (APM)

#### Sentry Integration

```typescript
// packages/config/src/sentry.ts
import * as Sentry from '@sentry/nextjs';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 민감한 정보 필터링
      if (event.user) {
        delete event.user.email;
      }
      return event;
    },
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
    ],
  });
};
```

#### Custom Metrics Collection

```typescript
// packages/monitoring/src/MetricsCollector.ts
export class MetricsCollector {
  private prometheus = require('prom-client');

  private counters = {
    documentEdits: new this.prometheus.Counter({
      name: 'document_edits_total',
      help: 'Total number of document edits',
      labelNames: ['documentId', 'userId'],
    }),

    collaborativeConnections: new this.prometheus.Gauge({
      name: 'collaborative_connections_active',
      help: 'Number of active collaborative connections',
      labelNames: ['documentId'],
    }),

    syncLatency: new this.prometheus.Histogram({
      name: 'sync_latency_seconds',
      help: 'Latency of document synchronization',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    }),
  };

  recordEdit(documentId: string, userId: string): void {
    this.counters.documentEdits.inc({ documentId, userId });
  }

  recordConnection(documentId: string, delta: number): void {
    this.counters.collaborativeConnections.inc({ documentId }, delta);
  }

  recordSyncLatency(duration: number): void {
    this.counters.syncLatency.observe(duration);
  }
}
```

#### Health Checks

```typescript
// apps/server/src/health.ts
export class HealthChecker {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkS3(),
      this.checkHocuspocus(),
    ]);

    const results = checks.map((check, index) => ({
      service: ['database', 'redis', 's3', 'hocuspocus'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      error: check.status === 'rejected' ? check.reason.message : null,
    }));

    return {
      status: results.every(r => r.status === 'healthy')
        ? 'healthy'
        : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: results,
    };
  }
}
```

### Logging Strategy

#### Structured Logging

```typescript
// packages/config/src/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'collaborative-editor',
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// 협업 관련 특별 로거
export const collaborationLogger = logger.child({
  component: 'collaboration',
});
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Collaborative Editor Metrics",
    "panels": [
      {
        "title": "Active Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "collaborative_connections_active",
            "legendFormat": "{{documentId}}"
          }
        ]
      },
      {
        "title": "Edit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(document_edits_total[5m])",
            "legendFormat": "Edits per second"
          }
        ]
      },
      {
        "title": "Sync Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sync_latency_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

### Alerting Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: collaborative-editor
    rules:
      - alert: HighSyncLatency
        expr: histogram_quantile(0.95, sync_latency_seconds_bucket) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High synchronization latency detected'

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Database connection failed'

      - alert: TooManyErrors
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: 'High error rate detected'
```

이제 완전한 품질 관리 및 모니터링 시스템이 설계에 포함되었습니다!

**품질 관리 특징**:

- 🔍 **정적 분석**: ESLint + Prettier + SonarQube
- 🧪 **테스트**: Jest + Testing Library + Playwright
- 📊 **모니터링**: Prometheus + Grafana + Sentry
- 🚨 **알림**: 성능 임계값 기반 자동 알림## Ad
  vanced Testing Strategy

### Playwright BDD Testing

#### Cucumber Integration

```typescript
// e2e/features/collaboration.feature
Feature: Real-time Collaboration
  As a user
  I want to collaborate with others in real-time
  So that we can work together efficiently

  Background:
    Given I am logged in as "user1@example.com"
    And I have access to workspace "test-workspace"

  Scenario: Multiple users editing simultaneously
    Given I open document "shared-document"
    And "user2@example.com" also opens the same document
    When I type "Hello " at position 0
    And "user2@example.com" types "World!" at position 6
    Then both users should see "Hello World!"
    And the changes should be synchronized within 100ms

  Scenario: Offline editing and sync
    Given I am editing document "offline-test"
    When my internet connection is lost
    And I continue typing "offline content"
    And my connection is restored
    Then my changes should be synchronized automatically
    And no data should be lost
```

#### Step Definitions

```typescript
// e2e/steps/collaboration.steps.ts
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am logged in as {string}', async function (email: string) {
  await this.page.goto('/login');
  await this.page.fill('[data-testid="email"]', email);
  await this.page.fill('[data-testid="password"]', 'password123');
  await this.page.click('[data-testid="login-button"]');
  await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
});

Given(
  '{string} also opens the same document',
  async function (userEmail: string) {
    this.secondUserContext = await this.browser.newContext();
    this.secondUserPage = await this.secondUserContext.newPage();

    // Login as second user
    await this.secondUserPage.goto('/login');
    await this.secondUserPage.fill('[data-testid="email"]', userEmail);
    await this.secondUserPage.fill('[data-testid="password"]', 'password123');
    await this.secondUserPage.click('[data-testid="login-button"]');

    // Open same document
    await this.secondUserPage.goto(this.currentDocumentUrl);
  }
);

When(
  'I type {string} at position {int}',
  async function (text: string, position: number) {
    const editor = this.page.locator('[data-testid="editor"]');
    await editor.click();

    // Set cursor position and type
    await this.page.evaluate(
      ({ pos, txt }) => {
        const editorElement = document.querySelector('[data-testid="editor"]');
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(editorElement.firstChild, pos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      },
      { pos: position, txt: text }
    );

    await this.page.keyboard.type(text);
  }
);

Then('both users should see {string}', async function (expectedText: string) {
  await expect(this.page.locator('[data-testid="editor"]')).toContainText(
    expectedText
  );
  await expect(
    this.secondUserPage.locator('[data-testid="editor"]')
  ).toContainText(expectedText);
});
```

### OpenAPI Contract Testing

#### API Specification

```yaml
# packages/api/openapi.yaml
openapi: 3.0.3
info:
  title: Collaborative Editor API
  version: 1.0.0
  description: API for real-time collaborative editing

paths:
  /api/workspaces:
    get:
      summary: List user workspaces
      tags: [Workspaces]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of workspaces
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Workspace'
    post:
      summary: Create new workspace
      tags: [Workspaces]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWorkspaceRequest'
      responses:
        '201':
          description: Workspace created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Workspace'

  /api/documents/{documentId}:
    get:
      summary: Get document content
      tags: [Documents]
      parameters:
        - name: documentId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Document content
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'

components:
  schemas:
    Workspace:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        ownerId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
      required: [id, name, ownerId, createdAt]

    Document:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: object
        lastModified:
          type: string
          format: date-time
      required: [id, title, content, lastModified]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

#### Contract Testing with Pact

```typescript
// packages/api/src/__tests__/contract/workspace.contract.test.ts
import { Pact } from '@pact-foundation/pact';

import { WorkspaceService } from '../services/WorkspaceService';

describe('Workspace API Contract', () => {
  const provider = new Pact({
    consumer: 'collaborative-editor-web',
    provider: 'collaborative-editor-api',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO',
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /api/workspaces', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user has workspaces',
        uponReceiving: 'a request for workspaces',
        withRequest: {
          method: 'GET',
          path: '/api/workspaces',
          headers: {
            Authorization: 'Bearer valid-jwt-token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'My Workspace',
              ownerId: '123e4567-e89b-12d3-a456-426614174001',
              createdAt: '2023-01-01T00:00:00Z',
            },
          ],
        },
      });
    });

    it('should return user workspaces', async () => {
      const workspaceService = new WorkspaceService('http://localhost:1234');
      const workspaces =
        await workspaceService.getUserWorkspaces('valid-jwt-token');

      expect(workspaces).toHaveLength(1);
      expect(workspaces[0]).toMatchObject({
        id: expect.any(String),
        name: 'My Workspace',
        ownerId: expect.any(String),
      });
    });
  });
});
```

### Prism Mock Server Integration

#### Mock Server Configuration

```json
// packages/api/prism.config.json
{
  "mock": {
    "dynamic": true,
    "errors": true
  },
  "validate": {
    "request": true,
    "response": true
  },
  "checkSecurity": true,
  "cors": true
}
```

#### Development Scripts

```json
// package.json
{
  "scripts": {
    "api:mock": "prism mock packages/api/openapi.yaml --port 4010",
    "api:validate": "prism validate packages/api/openapi.yaml",
    "test:contract": "jest --config packages/api/jest.contract.config.js",
    "test:e2e:bdd": "cucumber-js e2e/features --require e2e/steps/**/*.ts"
  }
}
```

#### Mock Data Generation

```typescript
// packages/api/src/mocks/generators.ts
import { faker } from '@faker-js/faker';

export const generateWorkspace = () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  ownerId: faker.string.uuid(),
  createdAt: faker.date.past().toISOString(),
  members: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    () => ({
      userId: faker.string.uuid(),
      role: faker.helpers.arrayElement(['owner', 'admin', 'editor', 'viewer']),
      joinedAt: faker.date.past().toISOString(),
    })
  ),
});

export const generateDocument = () => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: faker.lorem.paragraphs(3),
          },
        ],
      },
    ],
  },
  lastModified: faker.date.recent().toISOString(),
});
```

### Property-Based Testing

```typescript
// packages/collaboration/src/__tests__/property/yjs.property.test.ts
import * as Y from 'yjs';
import fc from 'fast-check';

describe('Y.js Property-Based Tests', () => {
  it('should maintain consistency across random operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({
              type: fc.constant('insert'),
              position: fc.nat(1000),
              text: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            fc.record({
              type: fc.constant('delete'),
              position: fc.nat(1000),
              length: fc.nat(50),
            })
          ),
          { minLength: 1, maxLength: 100 }
        ),
        operations => {
          const doc1 = new Y.Doc();
          const doc2 = new Y.Doc();

          const text1 = doc1.getText('content');
          const text2 = doc2.getText('content');

          // Apply operations to both documents
          operations.forEach(op => {
            if (op.type === 'insert') {
              const pos = Math.min(op.position, text1.length);
              text1.insert(pos, op.text);
              text2.insert(pos, op.text);
            } else if (op.type === 'delete') {
              const pos = Math.min(op.position, text1.length);
              const len = Math.min(op.length, text1.length - pos);
              if (len > 0) {
                text1.delete(pos, len);
                text2.delete(pos, len);
              }
            }
          });

          // Both documents should have identical content
          expect(text1.toString()).toBe(text2.toString());
        }
      )
    );
  });
});
```

### Visual Regression Testing

```typescript
// e2e/visual/editor.visual.test.ts
import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('editor appearance should be consistent', async ({ page }) => {
    await page.goto('/document/sample-doc');
    await page.waitForLoadState('networkidle');

    // Hide dynamic elements
    await page.addStyleTag({
      content: `
        [data-testid="user-cursor"],
        [data-testid="timestamp"] {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('editor-default-state.png');
  });

  test('block menu should render correctly', async ({ page }) => {
    await page.goto('/document/sample-doc');
    await page.locator('[data-testid="editor"]').click();
    await page.keyboard.type('/');

    await expect(page.locator('[data-testid="block-menu"]')).toHaveScreenshot(
      'block-menu.png'
    );
  });
});
```

이제 정말 완전한 테스트 전략이 완성되었어요!

**추가된 고급 테스트 기능**:

- 🥒 **BDD Testing**: Cucumber + Playwright로 비즈니스 시나리오 테스트
- 📋 **Contract Testing**: OpenAPI + Pact로 API 계약 검증
- 🎭 **Mock Server**: Prism으로 개발 중 API 모킹
- 🎲 **Property Testing**: fast-check로 랜덤 입력 테스트
- 👁️ **Visual Testing**: 스크린샷 기반 UI 회귀 테스트

더 좋은 아이디어로는:

- **Mutation Testing**: Stryker로 테스트 품질 검증
- **Performance Testing**: Artillery로 부하 테스트
- **Accessibility Testing**: axe-core로 접근성 자동 검사## Auth
  entication & Authorization Strategy

### Multi-Provider Authentication

#### NextAuth.js Configuration

```typescript
// packages/auth/src/config.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.provider = account?.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Check if user exists, create if not
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              avatar: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            },
          });
        }
      }
      return true;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
};
```

### JWT Token Management

#### Custom JWT Service

```typescript
// packages/auth/src/jwt.ts
import jwt from 'jsonwebtoken';

import { User } from '@editor/types';

export interface JWTPayload {
  userId: string;
  email: string;
  workspaces: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export class JWTService {
  private readonly secret = process.env.JWT_SECRET!;
  private readonly issuer = 'collaborative-editor';

  generateToken(user: User, workspaces: string[]): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      workspaces,
      permissions: this.getUserPermissions(user, workspaces),
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: '24h',
      issuer: this.issuer,
      audience: 'collaborative-editor-client',
    });
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret, {
        issuer: this.issuer,
        audience: 'collaborative-editor-client',
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  refreshToken(token: string): string {
    const payload = this.verifyToken(token);

    // Check if token is close to expiry (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp - now > 3600) {
      return token; // Token still valid for more than 1 hour
    }

    // Generate new token
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        workspaces: payload.workspaces,
        permissions: payload.permissions,
      },
      this.secret,
      { expiresIn: '24h', issuer: this.issuer }
    );
  }
}
```

### Role-Based Access Control (RBAC)

#### Permission System

```typescript
// packages/auth/src/permissions.ts
export enum Permission {
  // Workspace permissions
  WORKSPACE_READ = 'workspace:read',
  WORKSPACE_WRITE = 'workspace:write',
  WORKSPACE_ADMIN = 'workspace:admin',
  WORKSPACE_DELETE = 'workspace:delete',

  // Document permissions
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_COMMENT = 'document:comment',
  DOCUMENT_SHARE = 'document:share',
  DOCUMENT_DELETE = 'document:delete',

  // User management
  USER_INVITE = 'user:invite',
  USER_REMOVE = 'user:remove',
  USER_ROLE_CHANGE = 'user:role_change',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  COMMENTER = 'commenter',
  VIEWER = 'viewer',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.WORKSPACE_READ,
    Permission.WORKSPACE_WRITE,
    Permission.WORKSPACE_ADMIN,
    Permission.WORKSPACE_DELETE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_COMMENT,
    Permission.DOCUMENT_SHARE,
    Permission.DOCUMENT_DELETE,
    Permission.USER_INVITE,
    Permission.USER_REMOVE,
    Permission.USER_ROLE_CHANGE,
  ],

  [Role.ADMIN]: [
    Permission.WORKSPACE_READ,
    Permission.WORKSPACE_WRITE,
    Permission.WORKSPACE_ADMIN,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_COMMENT,
    Permission.DOCUMENT_SHARE,
    Permission.USER_INVITE,
    Permission.USER_ROLE_CHANGE,
  ],

  [Role.EDITOR]: [
    Permission.WORKSPACE_READ,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_COMMENT,
    Permission.DOCUMENT_SHARE,
  ],

  [Role.COMMENTER]: [
    Permission.WORKSPACE_READ,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_COMMENT,
  ],

  [Role.VIEWER]: [Permission.WORKSPACE_READ, Permission.DOCUMENT_READ],
};

export class PermissionChecker {
  hasPermission(userRole: Role, requiredPermission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(requiredPermission);
  }

  canAccessDocument(
    userRole: Role,
    action: 'read' | 'write' | 'comment' | 'share' | 'delete'
  ): boolean {
    const permissionMap = {
      read: Permission.DOCUMENT_READ,
      write: Permission.DOCUMENT_WRITE,
      comment: Permission.DOCUMENT_COMMENT,
      share: Permission.DOCUMENT_SHARE,
      delete: Permission.DOCUMENT_DELETE,
    };

    return this.hasPermission(userRole, permissionMap[action]);
  }
}
```

### Hocuspocus Authentication

#### WebSocket Authentication

```typescript
// apps/server/src/auth/hocuspocus-auth.ts
import { onAuthenticatePayload } from '@hocuspocus/server';

import { JWTService } from '@editor/auth';

export class HocuspocusAuthenticator {
  private jwtService = new JWTService();

  async authenticate({
    token,
    documentName,
  }: onAuthenticatePayload): Promise<boolean> {
    try {
      // Verify JWT token
      const payload = this.jwtService.verifyToken(token);

      // Extract document ID from document name
      const documentId = this.extractDocumentId(documentName);

      // Check if user has access to this document
      const hasAccess = await this.checkDocumentAccess(
        payload.userId,
        documentId
      );

      if (!hasAccess) {
        throw new Error('Insufficient permissions');
      }

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  private async checkDocumentAccess(
    userId: string,
    documentId: string
  ): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        page: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!document) return false;

    const member = document.page.workspace.members[0];
    if (!member) return false;

    const permissionChecker = new PermissionChecker();
    return permissionChecker.canAccessDocument(member.role as Role, 'read');
  }
}
```

### Multi-Factor Authentication (MFA)

#### TOTP Implementation

```typescript
// packages/auth/src/mfa.ts
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

export class MFAService {
  generateSecret(userEmail: string): { secret: string; qrCode: string } {
    const secret = speakeasy.generateSecret({
      name: `Collaborative Editor (${userEmail})`,
      issuer: 'Collaborative Editor',
      length: 32,
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url!,
    };
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps of variance
    });
  }

  async enableMFA(
    userId: string,
    secret: string,
    token: string
  ): Promise<boolean> {
    if (!this.verifyToken(secret, token)) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    return true;
  }
}
```

### Session Management

#### Redis Session Store

```typescript
// packages/auth/src/session.ts
import Redis from 'ioredis';

export class SessionManager {
  private redis = new Redis(process.env.REDIS_URL!);

  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId,
      deviceInfo,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    await this.redis.setex(
      `session:${sessionId}`,
      86400 * 30, // 30 days
      JSON.stringify(sessionData)
    );

    // Track active sessions for user
    await this.redis.sadd(`user:${userId}:sessions`, sessionId);

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.redis.get(`session:${sessionId}`);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);

    // Update last activity
    session.lastActivity = Date.now();
    await this.redis.setex(
      `session:${sessionId}`,
      86400 * 30,
      JSON.stringify(session)
    );

    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const sessionData = await this.redis.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await this.redis.srem(`user:${session.userId}:sessions`, sessionId);
    }

    await this.redis.del(`session:${sessionId}`);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.redis.smembers(`user:${userId}:sessions`);

    if (sessions.length > 0) {
      const pipeline = this.redis.pipeline();
      sessions.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(`user:${userId}:sessions`);
      await pipeline.exec();
    }
  }
}
```

### Security Middleware

#### Rate Limiting & Security Headers

```typescript
// packages/auth/src/middleware.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'https:'],
      },
    },
  }),

  // CSRF Protection
  (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;

    if (req.method !== 'GET' && token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  },
];
```

이제 완전한 인증 전략이 설계에 포함되었습니다!

**인증 전략 특징**:

- 🔐 **다중 인증**: 이메일/비밀번호 + OAuth (Google, GitHub)
- 🎫 **JWT 토큰**: 상태 없는 인증 + 자동 갱신
- 👥 **RBAC**: 역할 기반 세밀한 권한 제어
- 🔒 **MFA**: TOTP 기반 2단계 인증
- 📱 **세션 관리**: Redis 기반 다중 디바이스 세션
- 🛡️ **보안**: Rate limiting + CSRF + Security headers## A
  I-Powered Document Generation

### Auto-Generation Features

#### AI Content Generator

```typescript
// packages/ai/src/DocumentGenerator.ts
import OpenAI from 'openai';

export interface GenerationRequest {
  type: 'outline' | 'content' | 'summary' | 'expansion';
  prompt: string;
  context?: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  length?: 'short' | 'medium' | 'long';
}

export class DocumentGenerator {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async generateContent(request: GenerationRequest): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt },
      ],
      temperature: 0.7,
      max_tokens: this.getMaxTokens(request.length),
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateOutline(
    topic: string,
    sections: number = 5
  ): Promise<string[]> {
    const prompt = `Create a detailed outline for "${topic}" with ${sections} main sections. Return as a JSON array of section titles.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert content strategist. Generate clear, logical outlines.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    try {
      return JSON.parse(completion.choices[0]?.message?.content || '[]');
    } catch {
      return [];
    }
  }

  async improveContent(content: string, instruction: string): Promise<string> {
    const prompt = `Improve the following content based on this instruction: "${instruction}"\n\nContent:\n${content}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert editor. Improve content while maintaining the original meaning and structure.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || content;
  }

  private buildSystemPrompt(request: GenerationRequest): string {
    const basePrompt = 'You are an expert content writer.';
    const toneMap = {
      professional: 'Write in a professional, business-appropriate tone.',
      casual: 'Write in a casual, conversational tone.',
      academic: 'Write in an academic, scholarly tone with proper citations.',
      creative: 'Write in a creative, engaging tone.',
    };

    return `${basePrompt} ${toneMap[request.tone || 'professional']} Format the output as structured content suitable for a document editor.`;
  }
}
```

#### Smart Templates

```typescript
// packages/ai/src/TemplateGenerator.ts
export interface TemplateConfig {
  type: 'meeting-notes' | 'project-plan' | 'blog-post' | 'report' | 'proposal';
  title: string;
  participants?: string[];
  deadline?: Date;
  customFields?: Record<string, any>;
}

export class TemplateGenerator {
  private templates = {
    'meeting-notes': {
      structure: [
        { type: 'heading', level: 1, content: '{{title}}' },
        { type: 'paragraph', content: '**Date:** {{date}}' },
        { type: 'paragraph', content: '**Participants:** {{participants}}' },
        { type: 'heading', level: 2, content: 'Agenda' },
        { type: 'bulletList', items: ['Item 1', 'Item 2', 'Item 3'] },
        { type: 'heading', level: 2, content: 'Discussion Points' },
        { type: 'paragraph', content: '' },
        { type: 'heading', level: 2, content: 'Action Items' },
        {
          type: 'taskList',
          items: [
            { content: 'Action item 1', completed: false },
            { content: 'Action item 2', completed: false },
          ],
        },
        { type: 'heading', level: 2, content: 'Next Steps' },
        { type: 'paragraph', content: '' },
      ],
    },

    'project-plan': {
      structure: [
        { type: 'heading', level: 1, content: '{{title}}' },
        { type: 'heading', level: 2, content: 'Project Overview' },
        { type: 'paragraph', content: '' },
        { type: 'heading', level: 2, content: 'Objectives' },
        {
          type: 'orderedList',
          items: ['Objective 1', 'Objective 2', 'Objective 3'],
        },
        { type: 'heading', level: 2, content: 'Timeline' },
        {
          type: 'table',
          headers: ['Phase', 'Duration', 'Deliverables'],
          rows: [],
        },
        { type: 'heading', level: 2, content: 'Resources' },
        { type: 'paragraph', content: '' },
        { type: 'heading', level: 2, content: 'Risk Assessment' },
        { type: 'paragraph', content: '' },
      ],
    },
  };

  generateTemplate(config: TemplateConfig): any {
    const template = this.templates[config.type];
    if (!template) throw new Error(`Template ${config.type} not found`);

    return {
      type: 'doc',
      content: template.structure.map(block =>
        this.processTemplateBlock(block, config)
      ),
    };
  }

  private processTemplateBlock(block: any, config: TemplateConfig): any {
    let content = block.content;

    // Replace template variables
    if (typeof content === 'string') {
      content = content
        .replace('{{title}}', config.title)
        .replace('{{date}}', new Date().toLocaleDateString())
        .replace('{{participants}}', config.participants?.join(', ') || '');
    }

    return { ...block, content };
  }
}
```

#### AI Writing Assistant

```typescript
// packages/ai/src/WritingAssistant.ts
export class WritingAssistant {
  private documentGenerator = new DocumentGenerator();

  async suggestContinuation(
    currentContent: string,
    cursorPosition: number
  ): Promise<string[]> {
    const contextBefore = currentContent.slice(
      Math.max(0, cursorPosition - 500),
      cursorPosition
    );
    const contextAfter = currentContent.slice(
      cursorPosition,
      cursorPosition + 100
    );

    const prompt = `Given this context, suggest 3 different ways to continue writing:
    
Before cursor: "${contextBefore}"
After cursor: "${contextAfter}"

Provide natural continuations that flow well with the existing content.`;

    const completion = await this.documentGenerator[
      'openai'
    ].chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a writing assistant. Provide helpful, contextual suggestions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || '';
    return this.parseSuggestions(response);
  }

  async fixGrammar(text: string): Promise<string> {
    const prompt = `Fix any grammar, spelling, or punctuation errors in this text while preserving the original meaning and style:\n\n${text}`;

    return this.documentGenerator.generateContent({
      type: 'content',
      prompt,
      tone: 'professional',
    });
  }

  async summarizeContent(
    content: string,
    maxLength: number = 200
  ): Promise<string> {
    const prompt = `Summarize the following content in approximately ${maxLength} characters:\n\n${content}`;

    return this.documentGenerator.generateContent({
      type: 'summary',
      prompt,
      length: 'short',
    });
  }

  async translateContent(
    content: string,
    targetLanguage: string
  ): Promise<string> {
    const prompt = `Translate the following content to ${targetLanguage}, maintaining the original formatting and structure:\n\n${content}`;

    return this.documentGenerator.generateContent({
      type: 'content',
      prompt,
      tone: 'professional',
    });
  }

  private parseSuggestions(response: string): string[] {
    // Parse AI response to extract suggestions
    const lines = response.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).map(line => line.replace(/^\d+\.\s*/, '').trim());
  }
}
```

#### AI Integration in Editor

```typescript
// packages/editor/src/extensions/AIAssistant.ts
import { Extension } from '@tiptap/core';

import { WritingAssistant } from '@editor/ai';

export const AIAssistant = Extension.create({
  name: 'aiAssistant',

  addCommands() {
    return {
      generateContent:
        (prompt: string) =>
        ({ commands }) => {
          const assistant = new WritingAssistant();

          assistant.suggestContinuation(prompt, 0).then(suggestions => {
            // Show suggestions in UI
            this.options.onSuggestions?.(suggestions);
          });

          return true;
        },

      improveSelection:
        () =>
        ({ editor, commands }) => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);

          if (!selectedText) return false;

          const assistant = new WritingAssistant();

          assistant.fixGrammar(selectedText).then(improvedText => {
            commands.insertContentAt({ from, to }, improvedText);
          });

          return true;
        },

      insertTemplate:
        (templateType: string, config: any) =>
        ({ commands }) => {
          const generator = new TemplateGenerator();
          const template = generator.generateTemplate({
            type: templateType as any,
            ...config,
          });

          commands.insertContent(template);
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-g': () => this.editor.commands.generateContent(''),
      'Mod-Shift-i': () => this.editor.commands.improveSelection(),
    };
  },
});
```

#### AI Features UI Components

```typescript
// packages/ui/src/components/AIAssistant.tsx
import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface AIAssistantProps {
  onGenerate: (prompt: string, type: string) => void;
  onImprove: (instruction: string) => void;
  isLoading?: boolean;
}

export function AIAssistant({ onGenerate, onImprove, isLoading }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'template'>('generate');
  const [prompt, setPrompt] = useState('');

  const templates = [
    { id: 'meeting-notes', name: 'Meeting Notes', icon: '📝' },
    { id: 'project-plan', name: 'Project Plan', icon: '📋' },
    { id: 'blog-post', name: 'Blog Post', icon: '✍️' },
    { id: 'report', name: 'Report', icon: '📊' }
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        ✨ AI Assistant
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="AI Assistant">
        <div className="flex border-b mb-4">
          {['generate', 'improve', 'template'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 capitalize ${
                activeTab === tab ? 'border-b-2 border-blue-500' : ''
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'generate' && (
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to write about..."
              className="w-full h-32 p-3 border rounded-lg"
            />
            <Button
              onClick={() => onGenerate(prompt, 'content')}
              disabled={!prompt.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </Button>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => onGenerate('', template.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <div className="font-medium">{template.name}</div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
```

이제 AI 기반 문서 자동 생성 기능이 완전히 설계에 포함되었습니다!

**AI 문서 생성 기능**:

- 🤖 **콘텐츠 생성**: OpenAI GPT-4 기반 자동 작성
- 📋 **스마트 템플릿**: 회의록, 프로젝트 계획서 등 자동 생성
- ✍️ **작성 도우미**: 문법 교정, 요약, 번역, 이어쓰기 제안
- ⌨️ **키보드 단축키**: Cmd+Shift+G (생성), Cmd+Shift+I (개선)
- 🎨 **UI 통합**: 에디터 내 AI 어시스턴트 패널#

# Performance Testing Strategy

### Load Testing with Artillery

#### Artillery Configuration

```yaml
# performance/artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up load'
    - duration: 300
      arrivalRate: 100
      name: 'Sustained load'
  processor: './performance/custom-functions.js'

scenarios:
  - name: 'Collaborative editing simulation'
    weight: 70
    flow:
      - post:
          url: '/api/auth/signin'
          json:
            email: '{{ $randomEmail() }}'
            password: 'testpassword'
          capture:
            - json: '$.token'
              as: 'authToken'
      - ws:
          url: 'ws://localhost:1234'
          headers:
            Authorization: 'Bearer {{ authToken }}'
          subprotocols: ['hocuspocus']
      - send:
          payload: |
            {
              "type": "awareness",
              "documentId": "test-doc-{{ $randomInt(1, 10) }}",
              "user": {
                "id": "{{ $uuid() }}",
                "name": "Test User"
              }
            }
      - think: 2
      - loop:
          - send:
              payload: |
                {
                  "type": "update",
                  "documentId": "test-doc-{{ $randomInt(1, 10) }}",
                  "changes": "{{ $randomText() }}"
                }
          - think: '{{ $randomInt(1, 5) }}'
        count: 20

  - name: 'API stress test'
    weight: 30
    flow:
      - get:
          url: '/api/workspaces'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - post:
          url: '/api/documents'
          json:
            title: 'Performance Test Doc {{ $randomInt(1, 1000) }}'
            content: '{{ $randomText(500) }}'
```

#### Custom Performance Functions

```javascript
// performance/custom-functions.js
const { faker } = require('@faker-js/faker');

module.exports = {
  $randomEmail: () => faker.internet.email(),
  $randomText: (length = 100) => faker.lorem.words(length),
  $randomInt: (min, max) => faker.number.int({ min, max }),
  $uuid: () => faker.string.uuid(),
};
```

### WebSocket Performance Testing

#### Hocuspocus Load Testing

```typescript
// performance/websocket-load-test.ts
import * as Y from 'yjs';
import WebSocket from 'ws';

interface LoadTestConfig {
  concurrentUsers: number;
  documentCount: number;
  operationsPerUser: number;
  testDuration: number;
}

export class WebSocketLoadTester {
  private connections: WebSocket[] = [];
  private metrics = {
    connectionsEstablished: 0,
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
    latencies: [] as number[],
  };

  async runLoadTest(config: LoadTestConfig): Promise<void> {
    console.log(`Starting load test with ${config.concurrentUsers} users`);

    const promises = Array.from({ length: config.concurrentUsers }, (_, i) =>
      this.simulateUser(i, config)
    );

    await Promise.all(promises);
    this.reportMetrics();
  }

  private async simulateUser(
    userId: number,
    config: LoadTestConfig
  ): Promise<void> {
    const ws = new WebSocket('ws://localhost:1234');
    const doc = new Y.Doc();
    const text = doc.getText('content');

    ws.on('open', () => {
      this.metrics.connectionsEstablished++;
      console.log(`User ${userId} connected`);
    });

    ws.on('message', data => {
      this.metrics.messagesReceived++;
      const message = JSON.parse(data.toString());

      if (message.type === 'sync') {
        Y.applyUpdate(doc, new Uint8Array(message.update));
      }
    });

    ws.on('error', error => {
      this.metrics.errors++;
      console.error(`User ${userId} error:`, error);
    });

    // Simulate editing operations
    for (let i = 0; i < config.operationsPerUser; i++) {
      await this.sleep(Math.random() * 1000);

      const startTime = Date.now();
      const operation = this.generateRandomOperation();

      text.insert(Math.floor(Math.random() * text.length), operation);

      const update = Y.encodeStateAsUpdate(doc);
      ws.send(
        JSON.stringify({
          type: 'update',
          update: Array.from(update),
        })
      );

      this.metrics.messagesSent++;
      this.metrics.latencies.push(Date.now() - startTime);
    }

    ws.close();
  }

  private generateRandomOperation(): string {
    const operations = [
      'Hello world! ',
      'This is a test. ',
      'Performance testing in progress. ',
      '\n',
      'New paragraph. ',
    ];
    return operations[Math.floor(Math.random() * operations.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private reportMetrics(): void {
    const avgLatency =
      this.metrics.latencies.reduce((a, b) => a + b, 0) /
      this.metrics.latencies.length;
    const p95Latency =
      this.metrics.latencies.sort()[
        Math.floor(this.metrics.latencies.length * 0.95)
      ];

    console.log('Performance Test Results:');
    console.log(`Connections: ${this.metrics.connectionsEstablished}`);
    console.log(`Messages Sent: ${this.metrics.messagesSent}`);
    console.log(`Messages Received: ${this.metrics.messagesReceived}`);
    console.log(`Errors: ${this.metrics.errors}`);
    console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`95th Percentile Latency: ${p95Latency}ms`);
  }
}
```

## Development Environment Configuration

### Multi-Environment Database Setup

#### Database Configuration

```typescript
// packages/database/src/config.ts
export const databaseConfig = {
  development: {
    provider: 'sqlite',
    url: 'file:./dev.db',
    migrations: {
      dir: './prisma/migrations',
    },
  },

  test: {
    provider: 'sqlite',
    url: 'file:./test.db',
    migrations: {
      dir: './prisma/migrations',
    },
  },

  staging: {
    provider: 'postgresql',
    url: process.env.STAGING_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },

  production: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
```

#### Prisma Schema with Multi-Provider Support

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("DATABASE_PROVIDER") // "sqlite" | "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // SQLite doesn't support some PostgreSQL features
  workspaces WorkspaceMember[]
  documents  Document[]
  comments   Comment[]

  @@map("users")
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members WorkspaceMember[]
  pages   Page[]

  @@map("workspaces")
}
```

### Development Tools Configuration

#### Docker Compose for Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Redis for development (optional, can use in-memory for simple dev)
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # PostgreSQL for staging-like testing
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mini_notion_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Mailhog for email testing
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # Web UI

  # MinIO for S3-compatible storage
  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  redis_data:
  postgres_data:
  minio_data:
```

#### Development Environment Variables

```bash
# .env.development
# Database
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="dev-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (use test credentials)
GOOGLE_CLIENT_ID="dev-google-client-id"
GOOGLE_CLIENT_SECRET="dev-google-client-secret"
GITHUB_CLIENT_ID="dev-github-client-id"
GITHUB_CLIENT_SECRET="dev-github-client-secret"

# File Storage (MinIO)
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_S3_BUCKET="mini-notion-dev"
AWS_S3_ENDPOINT="http://localhost:9000"

# Email (Mailhog)
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""

# AI (use test key or mock)
OPENAI_API_KEY="sk-test-key"

# Hocuspocus
HOCUSPOCUS_PORT=1234
HOCUSPOCUS_SECRET="dev-hocuspocus-secret"

# Monitoring (disabled in dev)
SENTRY_DSN=""
PROMETHEUS_ENABLED=false
```

#### Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:full": "docker-compose -f docker-compose.dev.yml up -d && turbo run dev",
    "dev:db": "pnpm --filter database db:push && pnpm --filter database db:seed",
    "dev:reset": "pnpm --filter database db:reset && pnpm run dev:db",
    "test:dev": "NODE_ENV=test turbo run test",
    "test:e2e:dev": "NODE_ENV=test playwright test --ui",
    "perf:test": "artillery run performance/artillery.yml",
    "perf:ws": "tsx performance/websocket-load-test.ts"
  }
}
```

### Development Database Seeding

#### Seed Script

```typescript
// packages/database/src/seed.ts
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development database...');

  // Create test users
  const users = await Promise.all(
    Array.from({ length: 5 }, async (_, i) => {
      return prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
          hashedPassword: '$2b$10$example.hash', // bcrypt hash for 'password123'
        },
      });
    })
  );

  // Create test workspaces
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Development Workspace',
      ownerId: users[0].id,
      members: {
        create: users.map((user, index) => ({
          userId: user.id,
          role: index === 0 ? 'owner' : 'editor',
        })),
      },
    },
  });

  // Create test pages
  const pages = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      return prisma.page.create({
        data: {
          title: `Test Page ${i + 1}`,
          workspaceId: workspace.id,
          documentId: `doc-${i + 1}`,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: faker.lorem.paragraphs(3),
                  },
                ],
              },
            ],
          },
        },
      });
    })
  );

  console.log('✅ Development database seeded successfully!');
  console.log(
    `Created ${users.length} users, 1 workspace, and ${pages.length} pages`
  );
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Hot Reload & Development Experience

#### Turbo Dev Configuration

```json
// turbo.json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "dev:web": {
      "cache": false,
      "persistent": true
    },
    "dev:server": {
      "cache": false,
      "persistent": true,
      "env": ["DATABASE_URL", "REDIS_URL"]
    }
  }
}
```

#### VSCode Development Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

이제 완전한 성능 테스트 전략과 개발 환경 최적화가 설계에 포함되었습니다!

**성능 테스트 특징**:

- 🚀 **Artillery**: HTTP/WebSocket 부하 테스트
- 📊 **메트릭 수집**: 지연시간, 처리량, 오류율
- 🔄 **실시간 협업 시뮬레이션**: 다중 사용자 편집 테스트

**개발 환경 최적화**:

- 💾 **SQLite**: 개발용 경량 데이터베이스
- 🐳 **Docker Compose**: Redis, PostgreSQL, MinIO, Mailhog
- 🌱 **자동 시딩**: 테스트 데이터 자동 생성
- ⚡ **Hot Reload**: Turbo 기반 빠른 개발 경험#

# Git Hooks & CI/CD Enhancement

### Pre-commit Hooks Configuration

#### Husky Setup

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0"
  }
}
```

#### Pre-commit Hook

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type checking
pnpm turbo type-check

# Run tests for changed files
pnpm turbo test --filter="...[HEAD~1]"
```

#### Lint-staged Configuration

```json
// .lintstagedrc.json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{md,json,yaml,yml}": ["prettier --write"],
  "packages/database/prisma/schema.prisma": ["prisma format"]
}
```

#### Commit Message Linting

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 변경
        'style', // 코드 스타일 변경
        'refactor', // 리팩토링
        'perf', // 성능 개선
        'test', // 테스트 추가/수정
        'chore', // 빌드 프로세스 또는 보조 도구 변경
        'ci', // CI 설정 변경
        'build', // 빌드 시스템 변경
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'web', // 웹 앱
        'server', // Hocuspocus 서버
        'api', // API 서버
        'editor', // 에디터 패키지
        'collaboration', // 협업 패키지
        'auth', // 인증 패키지
        'ui', // UI 패키지
        'database', // 데이터베이스 패키지
        'ai', // AI 패키지
        'config', // 설정 패키지
        'types', // 타입 패키지
      ],
    ],
  },
};
```

### Enhanced GitHub Actions

#### Main CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 코드 품질 검사
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm turbo lint

      - name: Type check
        run: pnpm turbo type-check

      - name: Format check
        run: pnpm prettier --check .

      - name: Commit lint
        uses: wagoid/commitlint-github-action@v5

  # 테스트 실행
  test:
    runs-on: ubuntu-latest
    needs: quality-check
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup test database
        run: |
          pnpm --filter database db:push
          pnpm --filter database db:seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run unit tests
        run: pnpm turbo test --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
          flags: unittests

  # E2E 테스트
  e2e-test:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build applications
        run: pnpm turbo build

      - name: Run E2E tests
        run: pnpm turbo test:e2e

      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  # 보안 스캔
  security-scan:
    runs-on: ubuntu-latest
    needs: quality-check
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Docker 이미지 빌드 및 푸시
  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, e2e-test]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        app: [web, server, api]

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.app }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.${{ matrix.app }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  # 배포 (Staging)
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # kubectl apply -f k8s/staging/
          # 또는 다른 배포 도구 사용

  # 배포 (Production)
  deploy-production:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # kubectl apply -f k8s/production/
          # 또는 다른 배포 도구 사용
```

## Real-time Notification System

### Notification Architecture

```typescript
// packages/notifications/src/NotificationService.ts
export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'page_update' | 'workspace_invite';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private io: Server;
  private redis: Redis;

  constructor(io: Server, redis: Redis) {
    this.io = io;
    this.redis = redis;
  }

  async sendNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
    };

    // 데이터베이스에 저장
    await this.saveNotification(fullNotification);

    // 실시간 전송 (WebSocket)
    this.io
      .to(`user:${notification.userId}`)
      .emit('notification', fullNotification);

    // 푸시 알림 전송
    await this.sendPushNotification(fullNotification);

    // 이메일 알림 (설정에 따라)
    const userSettings = await this.getUserNotificationSettings(
      notification.userId
    );
    if (userSettings.emailEnabled && this.shouldSendEmail(notification.type)) {
      await this.sendEmailNotification(fullNotification);
    }
  }

  async sendMentionNotification(
    mentionedUserId: string,
    mentionerName: string,
    documentTitle: string,
    documentId: string
  ): Promise<void> {
    await this.sendNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionerName} mentioned you in "${documentTitle}"`,
      data: { documentId, mentionerName },
      read: false,
    });
  }

  private async sendPushNotification(
    notification: Notification
  ): Promise<void> {
    const userTokens = await this.getUserPushTokens(notification.userId);

    for (const token of userTokens) {
      await this.pushService.send({
        token,
        title: notification.title,
        body: notification.message,
        data: notification.data,
      });
    }
  }
}
```

### WebSocket Notification Handler

```typescript
// apps/server/src/notifications/WebSocketHandler.ts
export class NotificationWebSocketHandler {
  private io: Server;
  private notificationService: NotificationService;

  constructor(io: Server, notificationService: NotificationService) {
    this.io = io;
    this.notificationService = notificationService;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', socket => {
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      socket.on('mark-notification-read', async (notificationId: string) => {
        await this.notificationService.markAsRead(notificationId);
        socket.emit('notification-read', { notificationId });
      });

      socket.on('get-unread-count', async (userId: string) => {
        const count = await this.notificationService.getUnreadCount(userId);
        socket.emit('unread-count', { count });
      });
    });
  }
}
```

## Advanced Search System

### Search Architecture with Elasticsearch

```typescript
// packages/search/src/SearchService.ts
import { Client } from '@elastic/elasticsearch';

export interface SearchResult {
  id: string;
  type: 'page' | 'comment';
  title: string;
  content: string;
  highlights: string[];
  score: number;
  workspaceId: string;
  createdAt: Date;
}

export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
  }

  async indexDocument(document: {
    id: string;
    title: string;
    content: string;
    workspaceId: string;
    authorId: string;
  }): Promise<void> {
    await this.client.index({
      index: 'documents',
      id: document.id,
      body: {
        title: document.title,
        content: this.extractTextContent(document.content),
        workspaceId: document.workspaceId,
        authorId: document.authorId,
        indexedAt: new Date(),
      },
    });
  }

  async search(
    query: string,
    workspaceId: string,
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: 'page' | 'comment';
    } = {}
  ): Promise<{ results: SearchResult[]; total: number }> {
    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['title^2', 'content'],
                type: 'best_fields',
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [
            { term: { workspaceId } },
            // 권한 필터링 로직 추가
            await this.buildPermissionFilter(userId, workspaceId),
          ],
        },
      },
      highlight: {
        fields: {
          title: {},
          content: {
            fragment_size: 150,
            number_of_fragments: 3,
          },
        },
      },
      size: options.limit || 20,
      from: options.offset || 0,
    };

    const response = await this.client.search({
      index: 'documents',
      body: searchBody,
    });

    return {
      results: response.body.hits.hits.map(this.mapSearchHit),
      total: response.body.hits.total.value,
    };
  }

  private extractTextContent(content: any): string {
    // Tiptap JSON을 텍스트로 변환
    if (typeof content === 'string') return content;

    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || '';
      if (node.content) {
        return node.content.map(extractText).join(' ');
      }
      return '';
    };

    return extractText(content);
  }
}
```

### Search UI Components

```typescript
// packages/ui/src/components/SearchModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function SearchModal({ isOpen, onClose, workspaceId }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&workspace=${workspaceId}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightedResults = useMemo(() => {
    return results.map(result => ({
      ...result,
      highlightedTitle: highlightText(result.title, query),
      highlightedContent: result.highlights.join('...') || result.content.slice(0, 200)
    }));
  }, [results, query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages, comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {highlightedResults.map((result) => (
            <SearchResultItem
              key={result.id}
              result={result}
              onClick={() => {
                // Navigate to result
                onClose();
              }}
            />
          ))}

          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
```

이제 Git hooks, 강화된 CI/CD, 실시간 알림 시스템, 고급 검색 기능까지 모든 주요 구성 요소가 설계에 포함되었습니다!
