# API 인증 가이드

## 📋 개요

실시간 협업 에디터의 API는 JWT 기반 Bearer 토큰 인증을 사용합니다. 모든 보호된 엔드포인트는 유효한 JWT 토큰이 필요하며, 권한 기반 접근 제어(RBAC)를 통해 세부 권한을 관리합니다.

## 🔐 인증 방법

### Bearer Token 인증
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**특징:**
- JWT 형식의 액세스 토큰 사용
- HTTP Authorization 헤더에 포함
- 모든 API 요청에 필요 (공개 엔드포인트 제외)

### 토큰 획득 방법

#### 1. 로그인을 통한 토큰 획득
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**응답 (MFA 비활성화):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "사용자 이름"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 (MFA 활성화):**
```json
{
  "requiresMFA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. MFA 인증 후 토큰 획득
```http
POST /api/auth/mfa/verify
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

**응답:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "사용자 이름"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔄 토큰 갱신

### 자동 토큰 갱신
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 클라이언트 자동 갱신 구현
```typescript
// Axios 인터셉터를 사용한 자동 토큰 갱신
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });
        
        const { token } = response.data;
        localStorage.setItem('accessToken', token);
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/signin';
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🛡️ API 엔드포인트 보안 레벨

### 공개 엔드포인트 (인증 불필요)
```http
GET /api/health                    # 서버 상태 확인
POST /api/auth/signin              # 로그인
POST /api/auth/signup              # 회원가입
POST /api/auth/forgot-password     # 비밀번호 재설정 요청
GET /api/pages/public/:id          # 공개 페이지 조회
```

### 인증 필요 엔드포인트
```http
GET /api/user/profile              # 사용자 프로필 조회
PUT /api/user/profile              # 사용자 프로필 수정
POST /api/auth/mfa/setup           # MFA 설정
POST /api/auth/logout              # 로그아웃
```

### 권한 기반 엔드포인트
```http
# 워크스페이스 관리 (Admin 이상)
POST /api/workspaces/:id/members   # 멤버 초대
DELETE /api/workspaces/:id/members/:userId # 멤버 제거
PUT /api/workspaces/:id/members/:userId    # 멤버 권한 변경

# 페이지 관리 (Editor 이상)
POST /api/pages                    # 페이지 생성
PUT /api/pages/:id                 # 페이지 수정
DELETE /api/pages/:id              # 페이지 삭제 (소유자만)

# 파일 업로드 (Editor 이상)
POST /api/files/upload             # 파일 업로드
DELETE /api/files/:id              # 파일 삭제 (소유자만)
```

## 🔍 권한 확인 미들웨어

### 기본 인증 미들웨어
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function requireAuth(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return session;
}
```

### 권한 기반 미들웨어
```typescript
import { PermissionService } from '@editor/auth';

export async function requirePermission(
  userId: string,
  workspaceId: string,
  resource: string,
  action: string
) {
  const permissionService = new PermissionService();
  
  const hasPermission = await permissionService.checkPermission(
    userId,
    workspaceId,
    resource,
    action
  );
  
  if (!hasPermission) {
    return new Response('Forbidden', { status: 403 });
  }
  
  return true;
}
```

### API 라우트 보호 예시
```typescript
// app/api/pages/route.ts
import { requireAuth, requirePermission } from '@/lib/auth-middleware';

export async function POST(request: Request) {
  // 1. 기본 인증 확인
  const session = await requireAuth(request);
  if (session instanceof Response) return session;
  
  const body = await request.json();
  const { workspaceId } = body;
  
  // 2. 권한 확인
  const hasPermission = await requirePermission(
    session.user.id,
    workspaceId,
    'page',
    'create'
  );
  if (hasPermission instanceof Response) return hasPermission;
  
  // 3. 비즈니스 로직 실행
  // ...
}
```

## 📡 WebSocket 인증

### 실시간 협업 인증
```typescript
// Hocuspocus 서버 인증 설정
import { Server } from '@hocuspocus/server';

const server = Server.configure({
  async onAuthenticate({ token, documentName }) {
    try {
      // JWT 토큰 검증
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      // 문서 접근 권한 확인
      const hasAccess = await permissionService.checkDocumentPermission(
        payload.sub,
        documentName,
        'read'
      );
      
      if (!hasAccess) {
        throw new Error('Access denied');
      }
      
      return {
        user: {
          id: payload.sub,
          name: payload.name,
          email: payload.email
        }
      };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }
});
```

### 클라이언트 WebSocket 연결
```typescript
import { HocuspocusProvider } from '@hocuspocus/provider';

const provider = new HocuspocusProvider({
  url: 'ws://localhost:1234',
  name: 'document-123',
  token: localStorage.getItem('accessToken'), // JWT 토큰
  
  onAuthenticationFailed: () => {
    // 인증 실패 시 처리
    console.error('WebSocket authentication failed');
    // 토큰 갱신 시도 또는 로그인 페이지로 리다이렉트
  }
});
```

## 🚨 에러 처리

### 인증 에러 응답
```typescript
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}

// 403 Forbidden
{
  "error": "Forbidden", 
  "message": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredPermission": {
    "resource": "page",
    "action": "delete"
  }
}

// 422 Unprocessable Entity (MFA 필요)
{
  "error": "MFA Required",
  "message": "Multi-factor authentication required",
  "code": "MFA_REQUIRED",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 클라이언트 에러 처리
```typescript
// API 호출 시 에러 처리
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // 토큰 갱신 시도
      const refreshed = await refreshToken();
      if (refreshed) {
        // 원래 요청 재시도
        return apiCall(endpoint, options);
      } else {
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth/signin';
        return;
      }
    }
    
    if (response.status === 403) {
      // 권한 부족 알림
      showErrorMessage('권한이 부족합니다.');
      return;
    }
    
    if (response.status === 422) {
      const data = await response.json();
      if (data.code === 'MFA_REQUIRED') {
        // MFA 인증 페이지로 이동
        window.location.href = `/auth/mfa?token=${data.tempToken}`;
        return;
      }
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## 🧪 API 인증 테스트

### 단위 테스트
```typescript
describe('API Authentication', () => {
  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/user/profile');
      
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });
  
  it('should accept requests with valid token', async () => {
    const token = generateTestToken({ userId: 'user_123' });
    
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
  });
  
  it('should reject expired tokens', async () => {
    const expiredToken = generateTestToken({ 
      userId: 'user_123',
      exp: Math.floor(Date.now() / 1000) - 3600 // 1시간 전 만료
    });
    
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
      
    expect(response.status).toBe(401);
  });
});
```

### 통합 테스트
```typescript
describe('Permission-based API Access', () => {
  it('should allow editor to create pages', async () => {
    const editorToken = await getTokenForRole('editor');
    
    const response = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        title: 'Test Page',
        workspaceId: 'workspace_123'
      });
      
    expect(response.status).toBe(201);
  });
  
  it('should deny viewer from creating pages', async () => {
    const viewerToken = await getTokenForRole('viewer');
    
    const response = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        title: 'Test Page',
        workspaceId: 'workspace_123'
      });
      
    expect(response.status).toBe(403);
  });
});
```

## 📚 SDK 및 클라이언트 라이브러리

### JavaScript/TypeScript SDK
```typescript
class MiniNotionAPI {
  private accessToken: string;
  private refreshToken: string;
  
  constructor(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
  
  async request(endpoint: string, options: RequestInit = {}) {
    return fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
  
  async createPage(data: CreatePageRequest) {
    return this.request('/api/pages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // 기타 API 메서드들...
}
```

### React Hook
```typescript
import { useSession } from 'next-auth/react';

export function useAuthenticatedAPI() {
  const { data: session } = useSession();
  
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!session?.accessToken) {
      throw new Error('Not authenticated');
    }
    
    return fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }, [session]);
  
  return { apiCall, isAuthenticated: !!session };
}
```

---

**참고**: API 인증은 보안의 핵심이므로 토큰 관리와 권한 확인을 정확히 구현해야 합니다.