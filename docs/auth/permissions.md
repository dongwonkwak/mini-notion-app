# 권한 시스템 가이드

## 📋 개요

실시간 협업 에디터는 **5단계 RBAC (Role-Based Access Control)** 권한 시스템을 사용합니다. 각 사용자는 워크스페이스별로 서로 다른 권한을 가질 수 있으며, 권한은 계층적으로 상속됩니다.

## 🏆 권한 레벨 (높은 순서)

### 1. Owner (소유자) - 최고 권한
```typescript
role: 'owner'
hierarchy: 0 (최고)
```

**권한 범위:**
- ✅ **모든 권한** (`*:*`)
- ✅ 워크스페이스 삭제
- ✅ 소유권 이전
- ✅ 결제 및 구독 관리
- ✅ 모든 멤버 관리 (추가, 제거, 역할 변경)
- ✅ 워크스페이스 설정 변경

**제한사항:**
- 워크스페이스당 1명만 가능
- 자신의 소유자 권한은 다른 사람에게 이전해야만 포기 가능

### 2. Admin (관리자) - 관리 권한
```typescript
role: 'admin'
hierarchy: 1
inherits: ['editor'] // Editor 권한 상속
```

**권한 범위:**
- ✅ 워크스페이스 읽기/수정
- ✅ 멤버 관리 (초대, 제거, 역할 변경)
- ✅ 워크스페이스 설정 관리
- ✅ 모든 페이지/문서 관리
- ✅ 모든 댓글 관리
- ✅ 파일 업로드/삭제

**제한사항:**
- ❌ 워크스페이스 삭제 불가
- ❌ 소유자 권한 부여 불가
- ❌ 소유권 이전 불가

### 3. Editor (편집자) - 편집 권한
```typescript
role: 'editor'
hierarchy: 2
inherits: ['viewer'] // Viewer 권한 상속
```

**권한 범위:**
- ✅ 워크스페이스 읽기
- ✅ 페이지 생성/읽기/수정
- ✅ 자신이 만든 페이지 삭제
- ✅ 문서 생성/읽기/수정
- ✅ 자신이 만든 문서 삭제
- ✅ 댓글 생성/읽기
- ✅ 자신의 댓글 수정/삭제
- ✅ 파일 업로드/읽기
- ✅ 자신이 업로드한 파일 삭제

**제한사항:**
- ❌ 다른 사용자가 만든 페이지/문서 삭제 불가
- ❌ 다른 사용자의 댓글 수정/삭제 불가
- ❌ 멤버 관리 불가

### 4. Viewer (뷰어) - 읽기 권한
```typescript
role: 'viewer'
hierarchy: 3
inherits: ['guest'] // Guest 권한 상속
```

**권한 범위:**
- ✅ 워크스페이스 읽기
- ✅ 모든 페이지 읽기
- ✅ 모든 문서 읽기
- ✅ 모든 댓글 읽기
- ✅ 모든 파일 읽기/다운로드

**제한사항:**
- ❌ 생성/수정/삭제 불가
- ❌ 댓글 작성 불가
- ❌ 파일 업로드 불가

### 5. Guest (게스트) - 제한된 읽기 권한
```typescript
role: 'guest'
hierarchy: 4 (최하위)
```

**권한 범위:**
- ✅ 공개 페이지 읽기 (`isPublic: true`)
- ✅ 공개 문서 읽기 (`isPublic: true`)

**제한사항:**
- ❌ 비공개 콘텐츠 접근 불가
- ❌ 모든 생성/수정/삭제 불가
- ❌ 댓글 작성 불가

## 🔐 권한 확인 시스템

### 기본 권한 확인
```typescript
// 사용자의 워크스페이스 권한 확인
const hasPermission = await permissionService.checkPermission(
  userId,
  workspaceId,
  'page',      // 리소스
  'create'     // 액션
);
```

### 페이지별 권한 확인
```typescript
// 특정 페이지에 대한 권한 확인
const canEditPage = await permissionService.checkPagePermission(
  userId,
  pageId,
  'update'
);
```

### 문서별 권한 확인
```typescript
// 특정 문서에 대한 권한 확인
const canEditDocument = await permissionService.checkDocumentPermission(
  userId,
  documentId,
  'update'
);
```

## 📊 권한 매트릭스

| 리소스/액션 | Owner | Admin | Editor | Viewer | Guest |
|------------|-------|-------|--------|--------|-------|
| **워크스페이스** |
| 읽기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 수정 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 삭제 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 멤버 관리 | ✅ | ✅ | ❌ | ❌ | ❌ |
| **페이지** |
| 생성 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 읽기 | ✅ | ✅ | ✅ | ✅ | 공개만 |
| 수정 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (본인) | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (타인) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **문서** |
| 생성 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 읽기 | ✅ | ✅ | ✅ | ✅ | 공개만 |
| 수정 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (본인) | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (타인) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **댓글** |
| 생성 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 읽기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 수정 (본인) | ✅ | ✅ | ✅ | ❌ | ❌ |
| 수정 (타인) | ✅ | ✅ | ❌ | ❌ | ❌ |
| 삭제 (본인) | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (타인) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **파일** |
| 업로드 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 읽기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 삭제 (본인) | ✅ | ✅ | ✅ | ❌ | ❌ |
| 삭제 (타인) | ✅ | ✅ | ❌ | ❌ | ❌ |

## 🔄 권한 관리 작업

### 멤버 초대
```typescript
// 워크스페이스에 새 멤버 초대
await permissionService.inviteUserToWorkspace(
  inviterId,      // 초대하는 사용자 ID
  workspaceId,    // 워크스페이스 ID
  'user@example.com', // 초대할 사용자 이메일
  'editor'        // 부여할 역할
);
```

**초대 권한 요구사항:**
- Admin 이상의 권한 필요
- 초대할 역할이 자신의 권한보다 낮아야 함

### 역할 변경
```typescript
// 멤버의 역할 변경
await permissionService.updateMemberRole(
  updaterId,      // 변경하는 사용자 ID
  workspaceId,    // 워크스페이스 ID
  targetUserId,   // 대상 사용자 ID
  'admin'         // 새로운 역할
);
```

**역할 변경 규칙:**
- Admin 이상의 권한 필요
- 자신의 역할은 변경 불가 (Owner 제외)
- Owner 역할은 Owner만 부여 가능

### 멤버 제거
```typescript
// 워크스페이스에서 멤버 제거
await permissionService.removeMemberFromWorkspace(
  removerId,      // 제거하는 사용자 ID
  workspaceId,    // 워크스페이스 ID
  targetUserId    // 제거할 사용자 ID
);
```

**제거 권한 요구사항:**
- Admin 이상의 권한 필요
- Owner는 제거 불가

## 🛡️ 보안 고려사항

### 권한 상승 방지
- 사용자는 자신보다 높은 권한을 부여할 수 없음
- 권한 변경 시 현재 권한 레벨 검증
- API 호출마다 권한 재검증

### 컨텍스트 기반 권한
```typescript
// 조건부 권한 확인
const permission = {
  resource: 'page',
  action: 'delete',
  conditions: { isOwner: true } // 본인이 만든 페이지만 삭제 가능
};
```

### 권한 캐싱
- 사용자 권한은 Redis에 캐시 (TTL: 15분)
- 권한 변경 시 캐시 무효화
- 중요한 작업은 실시간 권한 확인

## 🔍 권한 디버깅

### 권한 확인 로그
```typescript
// 개발 환경에서 권한 확인 과정 로깅
console.log('Permission check:', {
  userId,
  workspaceId,
  resource,
  action,
  userRole,
  hasPermission,
  context
});
```

### 권한 테스트 도구
```bash
# 권한 시스템 테스트 실행
pnpm test packages/auth/src/__tests__/PermissionService.test.ts

# 특정 시나리오 테스트
pnpm test --testNamePattern="권한 확인"
```

## 📈 권한 시스템 확장

### 커스텀 권한 추가
```typescript
// 새로운 리소스/액션 추가
const customPermission = {
  resource: 'template',
  action: 'create',
  conditions: { hasProPlan: true }
};
```

### 페이지별 세부 권한
- 페이지별 개별 권한 설정 지원
- 상속 권한과 개별 권한의 조합
- 권한 충돌 시 더 제한적인 권한 적용

---

**참고**: 권한 시스템은 보안의 핵심이므로 변경 시 충분한 테스트와 검토가 필요합니다.