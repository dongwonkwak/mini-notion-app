# API 문서화 가이드라인

## 개요

실시간 협업 에디터 프로젝트의 모든 API 엔드포인트에 자동으로 JSDoc 주석을 추가하여, 나중에 OpenAPI/Swagger 문서를 자동 생성할 수 있도록 하는 가이드라인입니다.

## 🎯 목적

1. **일관된 API 문서화**: 모든 엔드포인트에 표준화된 JSDoc 주석 적용
2. **자동 문서 생성**: JSDoc → OpenAPI/Swagger 스펙 자동 변환
3. **개발자 경험 향상**: 명확한 API 스펙으로 프론트엔드-백엔드 협업 개선
4. **유지보수성**: 코드 변경 시 문서 자동 업데이트

## 📝 JSDoc 주석 표준 템플릿

### REST API 엔드포인트

```typescript
/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: 새 워크스페이스 생성
 *     description: 사용자가 새로운 워크스페이스를 생성합니다. 생성자는 자동으로 소유자 권한을 가집니다.
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 워크스페이스 이름
 *                 example: "내 프로젝트"
 *               description:
 *                 type: string
 *                 description: 워크스페이스 설명
 *                 example: "팀 협업을 위한 워크스페이스"
 *     responses:
 *       201:
 *         description: 워크스페이스 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *       409:
 *         description: 워크스페이스 이름 중복
 *     examples:
 *       success:
 *         summary: 성공적인 워크스페이스 생성
 *         value:
 *           id: "ws_123456789"
 *           name: "내 프로젝트"
 *           ownerId: "user_123"
 *           createdAt: "2024-01-15T10:30:00Z"
 */
export async function createWorkspace(req: Request, res: Response) {
  // 구현 코드
}
```

### 함수/메서드 문서화

```typescript
/**
 * 사용자 권한을 검증합니다.
 * 
 * @param {string} userId - 검증할 사용자 ID
 * @param {string} workspaceId - 워크스페이스 ID
 * @param {('read'|'write'|'admin')} permission - 필요한 권한 레벨
 * @returns {Promise<boolean>} 권한이 있으면 true, 없으면 false
 * @throws {AuthenticationError} 사용자가 인증되지 않은 경우
 * @throws {ValidationError} 잘못된 매개변수가 전달된 경우
 * 
 * @example
 * ```typescript
 * const hasPermission = await validateUserPermission(
 *   'user_123', 
 *   'ws_456', 
 *   'write'
 * );
 * if (!hasPermission) {
 *   throw new ForbiddenError('쓰기 권한이 없습니다');
 * }
 * ```
 */
async function validateUserPermission(
  userId: string, 
  workspaceId: string, 
  permission: 'read' | 'write' | 'admin'
): Promise<boolean> {
  // 구현 코드
}
```

## 🏗️ 자동 생성 도구 구현

### 1. JSDoc 데코레이터

```typescript
/**
 * API 엔드포인트 자동 문서화 데코레이터
 */
export function ApiEndpoint(config: {
  summary: string;
  description: string;
  tags: string[];
  auth?: boolean;
  deprecated?: boolean;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 메타데이터 수집 및 JSDoc 주석 자동 생성
    const existingJSDoc = getExistingJSDoc(target, propertyKey);
    if (!existingJSDoc) {
      generateJSDocComment(target, propertyKey, config);
    }
  };
}

// 사용 예시
@ApiEndpoint({
  summary: '문서 생성',
  description: '새로운 문서를 생성하고 Y.js 상태를 초기화합니다',
  tags: ['Documents'],
  auth: true
})
export async function createDocument(req: Request, res: Response) {
  // 구현 코드
}
```

### 2. 스키마 자동 생성

```typescript
/**
 * TypeScript 인터페이스에서 OpenAPI 스키마 자동 생성
 */
interface WorkspaceCreateRequest {
  /** 워크스페이스 이름 (3-50자) */
  name: string;
  /** 워크스페이스 설명 (선택사항) */
  description?: string;
  /** 초기 멤버 이메일 목록 */
  initialMembers?: string[];
}

// 자동 생성된 OpenAPI 스키마
const workspaceCreateSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      description: '워크스페이스 이름 (3-50자)'
    },
    description: {
      type: 'string',
      description: '워크스페이스 설명 (선택사항)'
    },
    initialMembers: {
      type: 'array',
      items: { type: 'string', format: 'email' },
      description: '초기 멤버 이메일 목록'
    }
  }
};
```

## 📋 필수 문서화 항목

### API 엔드포인트별 필수 항목

#### 1. **인증 관련 API**
```typescript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다
 *     tags: [Authentication]
 *     security: []  # 인증 불필요
 */
```

#### 2. **워크스페이스 관리 API**
```typescript
/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   post:
 *     summary: 워크스페이스 멤버 초대
 *     parameters:
 *       - name: workspaceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 워크스페이스 ID
 */
```

#### 3. **문서 관리 API**
```typescript
/**
 * @swagger
 * /api/documents/{documentId}/collaborate:
 *   ws:
 *     summary: 실시간 협업 WebSocket 연결
 *     description: Y.js 기반 실시간 문서 편집을 위한 WebSocket 연결
 *     tags: [Collaboration]
 */
```

#### 4. **파일 업로드 API**
```typescript
/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: 파일 업로드
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
```

## 🔧 자동화 도구 설정

### 1. 빌드 시 문서 생성

```json
// package.json
{
  "scripts": {
    "docs:generate": "swagger-jsdoc -d swaggerDef.js -o docs/api.json src/**/*.ts",
    "docs:serve": "swagger-ui-serve docs/api.json",
    "build": "tsc && npm run docs:generate"
  }
}
```

### 2. Git Hook 연동

```bash
#!/bin/sh
# .git/hooks/pre-commit

# API 문서 자동 업데이트
npm run docs:generate

# 변경된 문서 파일 스테이징
git add docs/api.json docs/api.yaml
```

### 3. CI/CD 파이프라인 통합

```yaml
# .github/workflows/docs.yml
name: API Documentation
on:
  push:
    branches: [main, develop]
    paths: ['src/api/**', 'apps/api/**']

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate API docs
        run: |
          npm install
          npm run docs:generate
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 📊 품질 검증

### 1. JSDoc 완성도 검사

```typescript
/**
 * JSDoc 주석 완성도를 검사하는 린터 규칙
 */
const jsdocLintRules = {
  'jsdoc/require-description': 'error',
  'jsdoc/require-param': 'error',
  'jsdoc/require-param-description': 'error',
  'jsdoc/require-returns': 'error',
  'jsdoc/require-returns-description': 'error',
  'jsdoc/require-throws': 'error',
  'jsdoc/require-example': 'warn'
};
```

### 2. OpenAPI 스펙 검증

```bash
# OpenAPI 스펙 유효성 검사
npx swagger-parser validate docs/api.yaml

# API 응답 스키마 검증
npx openapi-response-validator docs/api.yaml
```

## 🎯 구현 우선순위

### Phase 1: 핵심 API (필수)
- [ ] 인증 API (로그인, 회원가입, 토큰 갱신)
- [ ] 워크스페이스 CRUD API
- [ ] 문서 CRUD API
- [ ] 실시간 협업 WebSocket API

### Phase 2: 확장 API (중요)
- [ ] 파일 업로드/다운로드 API
- [ ] 댓글 시스템 API
- [ ] 알림 API
- [ ] 검색 API

### Phase 3: 고급 API (선택)
- [ ] 문서 버전 관리 API
- [ ] 공유 및 권한 API
- [ ] 분석 및 모니터링 API

## 📚 참고 자료

- [JSDoc 공식 문서](https://jsdoc.app/)
- [OpenAPI 3.0 스펙](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [TypeScript JSDoc 지원](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

## 🔄 지속적 개선

### 자동화 개선 사항
- [ ] AI 기반 JSDoc 주석 자동 생성
- [ ] API 변경 감지 및 문서 자동 업데이트
- [ ] 다국어 API 문서 지원
- [ ] 인터랙티브 API 테스트 환경

---

**중요**: 모든 API 엔드포인트는 구현과 동시에 JSDoc 주석을 작성해야 하며, PR 리뷰 시 문서화 완성도를 필수로 확인합니다.