---
inclusion: always
---

# 테스트 전략 및 품질 보증

## 개요

실시간 협업 에디터 프로젝트의 품질을 보장하기 위한 포괄적인 테스트 전략입니다. 각 태스크 완료 시 반드시 해당하는 테스트를 작성하고 통과시켜야 합니다.

## 🧪 테스트 피라미드

```
        E2E Tests (적음)
      ─────────────────
     Integration Tests (보통)
   ─────────────────────────
  Unit Tests (많음) + Contract Tests
 ─────────────────────────────────────
```

## 📋 테스트 유형별 가이드라인

### 1. Unit Tests (단위 테스트) - 필수
**목적**: 개별 함수, 컴포넌트, 클래스의 정확성 검증
**도구**: Jest + Testing Library
**커버리지 목표**: 70% 이상

#### 적용 범위
- 모든 비즈니스 로직 함수
- React 컴포넌트 (UI 패키지)
- 유틸리티 함수
- 데이터 변환 로직
- API 서비스 클래스

#### 작성 기준
```typescript
// ✅ 좋은 단위 테스트 예시
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const result = await userService.createUser(userData);
    
    expect(result.success).toBe(true);
    expect(result.data.email).toBe(userData.email);
  });
});
```

### 2. Integration Tests (통합 테스트) - 핵심 기능 필수
**목적**: 여러 모듈 간 상호작용 및 외부 시스템 연동 검증
**도구**: Jest + Supertest (API), Testing Library (React)

#### 적용 범위
- API 엔드포인트 (요청/응답)
- 데이터베이스 연동 (Prisma)
- Y.js 실시간 동기화
- 파일 업로드/다운로드
- 인증 플로우

#### 작성 기준
```typescript
// ✅ 좋은 통합 테스트 예시
describe('Document API Integration', () => {
  it('should create document and sync with Y.js', async () => {
    const response = await request(app)
      .post('/api/documents')
      .send({ title: 'Test Doc', workspaceId: 'ws-123' })
      .expect(201);
    
    // Y.js 동기화 확인
    const yjsDoc = await yjsProvider.getDocument(response.body.documentId);
    expect(yjsDoc).toBeDefined();
  });
});
```

### 3. Contract Tests (계약 테스트) - API 관련 태스크 필수
**목적**: API 스펙 준수 및 클라이언트-서버 간 호환성 검증
**도구**: OpenAPI Schema Validation + Pact (선택적)

#### 적용 범위
- REST API 엔드포인트
- WebSocket 메시지 스키마
- GraphQL 스키마 (사용 시)
- 외부 API 연동

#### 작성 기준
```typescript
// ✅ 좋은 계약 테스트 예시
describe('API Contract Tests', () => {
  it('should match OpenAPI schema for user creation', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(validUserData);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchSchema(userResponseSchema);
  });
});
```

### 4. E2E Tests (엔드투엔드 테스트) - 주요 플로우 필수
**목적**: 실제 사용자 시나리오 및 전체 시스템 동작 검증
**도구**: Playwright

#### 적용 범위 (우선순위별)
1. **Critical Path (필수)**
   - 사용자 로그인/회원가입
   - 문서 생성 및 편집
   - 실시간 협업 (2명 이상)
   - 파일 업로드

2. **Important Features (권장)**
   - 워크스페이스 관리
   - 페이지 계층 구조
   - 댓글 시스템
   - 검색 기능

3. **Nice to Have (선택적)**
   - 테마 변경
   - 모바일 반응형
   - 키보드 단축키

#### 작성 기준
```typescript
// ✅ 좋은 E2E 테스트 예시
test('collaborative editing workflow', async ({ page, context }) => {
  // 첫 번째 사용자 로그인
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'user1@example.com');
  await page.click('[data-testid=login-button]');
  
  // 문서 생성 및 편집
  await page.click('[data-testid=new-document]');
  await page.fill('[data-testid=document-title]', 'Collaboration Test');
  
  // 두 번째 사용자 시뮬레이션
  const page2 = await context.newPage();
  // ... 협업 시나리오 테스트
});
```

### 5. Database Tests (데이터베이스 테스트) - 필수
**목적**: 스키마, 쿼리, 마이그레이션의 정확성 검증
**도구**: Jest + Prisma Test Environment + Custom SQL Validation Scripts

#### 적용 범위
- **스키마 검증**: Prisma 스키마 문법, 테이블 구조, 제약 조건
- **쿼리 성능**: 복잡한 조인, 인덱스 효율성, 응답 시간
- **데이터 무결성**: 외래 키, 유니크 제약, 트랜잭션
- **마이그레이션**: 스키마 변경, 데이터 이전, 롤백
- **동시성**: 락, 트랜잭션 격리, 데드락 방지

#### 작성 기준
```typescript
// ✅ 좋은 데이터베이스 테스트 예시
describe('User-Workspace Relations', () => {
  it('should enforce workspace member uniqueness', async () => {
    const user = await prisma.user.create({ data: userData });
    const workspace = await prisma.workspace.create({ data: workspaceData });
    
    // 첫 번째 멤버 추가 성공
    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'editor' }
    });
    
    // 중복 멤버 추가 실패 확인
    await expect(
      prisma.workspaceMember.create({
        data: { userId: user.id, workspaceId: workspace.id, role: 'viewer' }
      })
    ).rejects.toThrow();
  });

  it('should handle query performance within limits', async () => {
    const startTime = Date.now();
    const result = await prisma.workspace.findMany({
      include: { members: { include: { user: true } } },
      take: 100
    });
    const duration = Date.now() - startTime;
    
    expect(result).toBeDefined();
    expect(duration).toBeLessThan(500); // 500ms 이내
  });
});

// ✅ SQL 검증 스크립트 사용
describe('Schema Validation', () => {
  it('should pass all schema validations', async () => {
    // Custom validation script 실행
    const result = await execSync('pnpm db:validate', { encoding: 'utf8' });
    expect(result).toContain('모든 스키마 검증이 통과');
  });
});
```

### 6. Performance Tests (성능 테스트) - 선택적
**목적**: 시스템 성능 및 확장성 검증
**도구**: Artillery, k6, Lighthouse

#### 적용 범위
- API 응답 시간
- 대용량 문서 처리
- 동시 사용자 부하
- 메모리 사용량
- Y.js 동기화 성능

## 📊 태스크별 테스트 매트릭스

| 태스크 유형 | Unit | Integration | Contract | E2E | DB | Performance |
|------------|------|-------------|----------|-----|----|-----------| 
| 인프라/설정 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 데이터베이스 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| API 개발 | ✅ | ✅ | ✅ | ❌ | ✅ | 선택 |
| UI 컴포넌트 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 실시간 기능 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 인증/보안 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 파일 처리 | ✅ | ✅ | ✅ | ✅ | ❌ | 선택 |

## 🔧 테스트 도구 설정

### Jest 설정
```javascript
// jest.config.js
module.exports = {
  projects: ['<rootDir>/packages/*', '<rootDir>/apps/*'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  }
};
```

### 데이터베이스 테스트 설정
```typescript
// packages/database/jest.setup.js
beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  execSync('pnpm prisma db push --force-reset');
  prisma = new PrismaClient();
});

beforeEach(async () => {
  // 각 테스트 전 데이터베이스 정리
  await cleanDatabase();
});
```

### SQL 검증 스크립트
```bash
# 스키마 검증
pnpm db:validate

# 성능 테스트
pnpm db:test --testNamePattern="performance"

# 전체 데이터베이스 테스트
pnpm db:test
```

### Playwright 설정
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:3000' }
});
```

## 📝 테스트 작성 규칙

### 1. 테스트 파일 구조
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── services/
│   ├── userService.ts
│   └── __tests__/
│       └── userService.test.ts
└── __tests__/
    └── integration/
        └── user-workflow.test.ts
```

### 2. 테스트 명명 규칙
```typescript
// ✅ 좋은 테스트 이름
describe('UserService.createUser', () => {
  it('should create user with valid email and name', () => {});
  it('should throw error when email is invalid', () => {});
  it('should hash password before saving', () => {});
});

// ❌ 나쁜 테스트 이름
describe('UserService', () => {
  it('should work', () => {});
  it('test user creation', () => {});
});
```

### 3. 테스트 데이터 관리
```typescript
// ✅ 테스트 팩토리 사용
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  name: 'Test User',
  provider: 'email',
  ...overrides
});

// ✅ 각 테스트마다 독립적인 데이터
beforeEach(async () => {
  await cleanDatabase();
});
```

## 🚀 CI/CD 통합

### GitHub Actions 워크플로우
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test:ci
      - name: Run E2E tests
        run: pnpm test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📈 품질 게이트

### 필수 조건 (모든 태스크)
- [ ] Unit 테스트 커버리지 70% 이상
- [ ] 모든 테스트 통과
- [ ] ESLint 에러 없음 (`pnpm eslint .`)
- [ ] 타입 체크 통과

### 추가 조건 (태스크별)
- [ ] Integration 테스트 (해당 시)
- [ ] Contract 테스트 (API 관련)
- [ ] E2E 테스트 (주요 기능)
- [ ] Performance 테스트 (실시간 기능)

## 🔍 테스트 실행 명령어

```bash
# 전체 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm --filter @editor/database test

# 데이터베이스 관련 테스트
pnpm --filter @editor/database db:test
pnpm --filter @editor/database db:validate

# 커버리지 포함 테스트
pnpm test:coverage

# E2E 테스트
pnpm test:e2e

# 성능 테스트
pnpm test --testNamePattern="performance|Performance"

# 테스트 감시 모드
pnpm test:watch

# 코드 품질 검사
pnpm eslint .              # ESLint 검사
pnpm eslint . --fix        # 자동 수정
pnpm type-check            # TypeScript 타입 체크

# SQL 스키마 검증
pnpm --filter @editor/database db:validate
```

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library 가이드](https://testing-library.com/)
- [Playwright 문서](https://playwright.dev/)
- [Prisma 테스트 가이드](https://www.prisma.io/docs/guides/testing)

---

**중요**: 각 태스크 완료 시 해당하는 테스트를 반드시 작성하고, PR 생성 전에 모든 테스트가 통과하는지 확인해야 합니다.