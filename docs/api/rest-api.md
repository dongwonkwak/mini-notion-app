# REST API 문서

## 📋 개요

실시간 협업 에디터의 REST API는 RESTful 원칙을 따르며, JSON 형식의 요청/응답을 사용합니다. 모든 보호된 엔드포인트는 JWT Bearer 토큰 인증이 필요합니다.

## 🌐 Base URL

- **개발**: `http://localhost:3001/api`
- **스테이징**: `https://api-staging.mini-notion.com/api`
- **프로덕션**: `https://api.mini-notion.com/api`

## 🔐 인증

모든 보호된 엔드포인트는 Authorization 헤더에 Bearer 토큰이 필요합니다:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다.",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🔐 인증 API

### 회원가입

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "사용자 이름"
}
```

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "사용자 이름",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 로그인

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**응답 (200 OK) - MFA 비활성화:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "사용자 이름"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**응답 (200 OK) - MFA 활성화:**

```json
{
  "success": true,
  "data": {
    "requiresMFA": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### MFA 설정

```http
POST /auth/mfa/setup
Authorization: Bearer {token}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "backupCodes": ["ABCD-EFGH-IJKL", "MNOP-QRST-UVWX"]
  }
}
```

## 👤 사용자 API

### 프로필 조회

```http
GET /user/profile
Authorization: Bearer {token}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "사용자 이름",
      "avatarUrl": "https://example.com/avatar.jpg",
      "mfaEnabled": true,
      "lastActiveAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 프로필 수정

```http
PUT /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 이름",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

## 🏢 워크스페이스 API

### 워크스페이스 목록 조회

```http
GET /workspaces
Authorization: Bearer {token}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "workspaces": [
      {
        "id": "ws_123",
        "name": "내 워크스페이스",
        "role": "owner",
        "memberCount": 5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 워크스페이스 생성

```http
POST /workspaces
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새 워크스페이스",
  "description": "워크스페이스 설명"
}
```

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "workspace": {
      "id": "ws_456",
      "name": "새 워크스페이스",
      "ownerId": "user_123",
      "settings": {},
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 워크스페이스 상세 조회

```http
GET /workspaces/{workspaceId}
Authorization: Bearer {token}
```

### 멤버 초대

```http
POST /workspaces/{workspaceId}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "editor"
}
```

**권한 요구사항**: Admin 이상

### 멤버 목록 조회

```http
GET /workspaces/{workspaceId}/members
Authorization: Bearer {token}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "member_123",
        "user": {
          "id": "user_123",
          "name": "사용자 이름",
          "email": "user@example.com",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "role": "owner",
        "joinedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## 📄 페이지 API

### 페이지 목록 조회

```http
GET /workspaces/{workspaceId}/pages
Authorization: Bearer {token}
```

**쿼리 파라미터:**

- `parent`: 부모 페이지 ID (선택적)
- `limit`: 결과 수 제한 (기본값: 50)
- `offset`: 페이지네이션 오프셋 (기본값: 0)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "page_123",
        "title": "페이지 제목",
        "parentId": null,
        "documentId": "doc_123",
        "position": 0,
        "isPublic": false,
        "createdBy": "user_123",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 페이지 생성

```http
POST /workspaces/{workspaceId}/pages
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "새 페이지",
  "parentId": "page_456",
  "position": 0,
  "isPublic": false
}
```

**권한 요구사항**: Editor 이상

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "page": {
      "id": "page_789",
      "title": "새 페이지",
      "parentId": "page_456",
      "documentId": "doc_789",
      "position": 0,
      "isPublic": false,
      "createdBy": "user_123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 페이지 상세 조회

```http
GET /pages/{pageId}
Authorization: Bearer {token}
```

### 페이지 수정

```http
PUT /pages/{pageId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "position": 1,
  "isPublic": true
}
```

**권한 요구사항**: Editor 이상

### 페이지 삭제

```http
DELETE /pages/{pageId}
Authorization: Bearer {token}
```

**권한 요구사항**:

- Admin 이상 (모든 페이지)
- Editor (본인이 생성한 페이지만)

## 📝 문서 API

### 문서 내용 조회

```http
GET /documents/{documentId}
Authorization: Bearer {token}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc_123",
      "state": "base64_encoded_yjs_state",
      "version": 42,
      "lastModified": "2024-01-15T10:30:00Z",
      "sizeBytes": 1024
    }
  }
}
```

### 문서 내용 업데이트

```http
PUT /documents/{documentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "state": "base64_encoded_yjs_state",
  "version": 43
}
```

**권한 요구사항**: Editor 이상

## 💬 댓글 API

### 댓글 목록 조회

```http
GET /documents/{documentId}/comments
Authorization: Bearer {token}
```

**쿼리 파라미터:**

- `resolved`: 해결된 댓글 포함 여부 (기본값: false)
- `limit`: 결과 수 제한 (기본값: 50)

### 댓글 생성

```http
POST /documents/{documentId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "댓글 내용",
  "positionStart": 100,
  "positionEnd": 150,
  "parentId": null
}
```

**권한 요구사항**: Editor 이상

### 댓글 수정

```http
PUT /comments/{commentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "수정된 댓글 내용"
}
```

**권한 요구사항**:

- Admin 이상 (모든 댓글)
- Editor (본인 댓글만)

### 댓글 해결/재열기

```http
PATCH /comments/{commentId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolved": true
}
```

## 📁 파일 API

### 파일 업로드

```http
POST /files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
workspaceId: ws_123
```

**권한 요구사항**: Editor 이상

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_123",
      "name": "document.pdf",
      "size": 1048576,
      "type": "application/pdf",
      "url": "https://storage.example.com/files/file_123.pdf",
      "uploadedBy": "user_123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 파일 목록 조회

```http
GET /workspaces/{workspaceId}/files
Authorization: Bearer {token}
```

### 파일 삭제

```http
DELETE /files/{fileId}
Authorization: Bearer {token}
```

**권한 요구사항**:

- Admin 이상 (모든 파일)
- Editor (본인이 업로드한 파일만)

## 🔍 검색 API

### 전체 검색

```http
GET /search
Authorization: Bearer {token}
```

**쿼리 파라미터:**

- `q`: 검색어 (필수)
- `workspace`: 워크스페이스 ID (선택적)
- `type`: 검색 타입 (page, comment, file)
- `limit`: 결과 수 제한 (기본값: 20)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "page",
        "id": "page_123",
        "title": "검색 결과 페이지",
        "snippet": "검색어가 포함된 내용...",
        "workspaceId": "ws_123",
        "score": 0.95
      }
    ],
    "total": 15,
    "took": 23
  }
}
```

## 📊 HTTP 상태 코드

| 코드 | 의미                  | 설명                 |
| ---- | --------------------- | -------------------- |
| 200  | OK                    | 요청 성공            |
| 201  | Created               | 리소스 생성 성공     |
| 204  | No Content            | 성공, 응답 본문 없음 |
| 400  | Bad Request           | 잘못된 요청          |
| 401  | Unauthorized          | 인증 필요            |
| 403  | Forbidden             | 권한 부족            |
| 404  | Not Found             | 리소스 없음          |
| 409  | Conflict              | 리소스 충돌          |
| 422  | Unprocessable Entity  | 검증 실패            |
| 429  | Too Many Requests     | 요청 한도 초과       |
| 500  | Internal Server Error | 서버 오류            |

## 🚦 Rate Limiting

### 제한 정책

- **인증 API**: 15분당 5회
- **일반 API**: 1분당 100회
- **파일 업로드**: 1분당 10회
- **검색 API**: 1분당 30회

### 헤더 정보

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 🧪 API 테스트

### cURL 예시

```bash
# 로그인
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 페이지 생성
curl -X POST http://localhost:3001/api/workspaces/ws_123/pages \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"title":"새 페이지","isPublic":false}'
```

### Postman Collection

프로젝트 루트의 `postman/` 폴더에서 Postman 컬렉션을 확인할 수 있습니다.

---

**참고**: API는 지속적으로 발전하며, 주요 변경사항은 버전 관리를 통해 관리됩니다.
