# Git 워크플로우 가이드

미니 노션 프로젝트의 브랜치 전략, PR 관리, 그리고 GitHub CLI를 활용한 효율적인 개발 워크플로우를 정의합니다.

## 브랜치 전략

### 기본 원칙
- **main**: 항상 배포 가능한 안정적인 상태 유지
- **feature 브랜치**: 모든 개발 작업은 feature 브랜치에서 진행
- **단일 기능 원칙**: 하나의 브랜치는 하나의 완결된 기능만 구현

### 브랜치 명명 규칙

#### Spec 00 (프로젝트 초기 설정)
```bash
# 단일 브랜치로 전체 설정 작업
feature/00-project-setup
```

#### Spec 01+ (기능별 세분화)
```bash
# 패턴: feature/{spec번호}-{기능명}
feature/{spec번호}-{기능명}

# 예시:
feature/01-jwt-setup           # JWT 인증 기본 설정
feature/01-login-api          # 로그인/회원가입 API
feature/01-auth-guards        # NestJS 인증 가드
feature/01-auth-ui            # 프론트엔드 인증 UI
feature/01-oauth-integration  # OAuth 소셜 로그인

feature/03-editor-core        # Tiptap 에디터 핵심 기능
feature/03-slash-commands     # 슬래시 커맨드 시스템
feature/03-block-types        # 블록 타입 구현
feature/03-drag-drop          # 드래그 앤 드롭 기능

feature/05-yjs-integration    # Y.js 기본 통합
feature/05-websocket-server   # WebSocket 서버 구현
feature/05-presence-system    # 사용자 Presence 시스템
feature/05-offline-sync       # 오프라인 동기화
```

### 브랜치 생성 및 작업 흐름

```bash
# 1. 최신 main에서 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/01-jwt-setup

# 2. 작업 진행 및 커밋
# (개발 작업 수행)
git add .
git commit -m "feat(auth): JWT 토큰 생성 및 검증 로직 구현"

# 3. 원격 브랜치에 푸시
git push -u origin feature/01-jwt-setup

# 4. PR 생성 (GitHub CLI 사용)
# 상황별 선택: 큰 기능은 --draft, 작은 기능은 바로 Ready
gh pr create --title "feat(auth): JWT 인증 시스템 기본 설정" --label "feature,auth"
# 또는 Draft로 시작: gh pr create --draft --title "..." --label "feature,auth"

# 5. 리뷰 완료 후 머지
gh pr merge --squash
```

## PR 생성 가이드

### GitHub CLI 명령어 템플릿

```bash
# 기본 PR 생성
gh pr create \
  --title "feat(auth): JWT 인증 시스템 기본 설정" \
  --body "$(cat <<EOF
## 📋 작업 내용

JWT 기반 인증 시스템의 기본 설정을 구현했습니다.

### 구현된 기능
- [ ] JWT 토큰 생성 및 검증 서비스
- [ ] 환경변수 기반 시크릿 키 관리
- [ ] 토큰 만료 시간 설정
- [ ] 기본 인증 미들웨어 구현

### 기술적 변경사항
- NestJS JWT 모듈 설정
- Zod 스키마로 JWT 설정 검증
- 토큰 생성/검증 유닛 테스트 추가

## 🧪 테스트 확인
- [ ] JWT 토큰 생성 테스트 통과
- [ ] 토큰 검증 로직 테스트 통과
- [ ] 환경변수 검증 테스트 통과
- [ ] 타입 검사 통과 (pnpm type-check)

## 📚 관련 정보
- **Spec**: 01-user-authentication
- **Tasks**: 1.1, 1.2
- **Requirements**: 1.1, 1.2, 6.1

## 🔗 관련 링크
- [JWT 공식 문서](https://jwt.io/)
- [NestJS JWT 가이드](https://docs.nestjs.com/security/authentication)

EOF
)" \
  --assignee @me \
  --label "feature,auth"
```

### PR 템플릿 파일 (.github/pull_request_template.md)

```markdown
## 📋 작업 내용

<!-- 이 PR에서 구현한 기능이나 수정한 내용을 간략히 설명해주세요 -->

### 구현된 기능
- [ ] 기능 1
- [ ] 기능 2
- [ ] 기능 3

### 기술적 변경사항
<!-- 주요 기술적 변경사항이나 아키텍처 결정을 설명해주세요 -->

## 🧪 테스트 확인
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과 (해당하는 경우)
- [ ] 타입 검사 통과 (pnpm type-check)
- [ ] 린팅 통과 (pnpm lint)
- [ ] 빌드 성공 (pnpm build)

## 📚 관련 정보
- **Spec**: <!-- 관련 spec 번호 및 이름 -->
- **Tasks**: <!-- 완료된 task 번호들 -->
- **Requirements**: <!-- 충족한 requirement 번호들 -->

## 🔗 관련 링크
<!-- 관련 문서, 이슈, 참고 자료 링크 -->

## 📸 스크린샷 (UI 변경사항이 있는 경우)
<!-- UI 변경사항이 있다면 스크린샷을 첨부해주세요 -->

## ⚠️ 주의사항
<!-- 리뷰어가 특별히 확인해야 할 부분이나 주의사항 -->
```

## 실제 사용 예시

### 1. JWT 인증 설정 PR

```bash
gh pr create \
  --title "feat(auth): JWT 인증 시스템 기본 설정" \
  --body "JWT 토큰 생성/검증 로직과 NestJS 인증 모듈을 구현했습니다.

## 구현 내용
- JWT 서비스 클래스 구현
- 환경변수 기반 설정 관리
- 토큰 생성/검증 유닛 테스트

## 테스트 확인
- [x] JWT 토큰 생성 테스트 통과
- [x] 토큰 검증 테스트 통과
- [x] 타입 검사 통과

**Spec**: 01-user-authentication  
**Tasks**: 1.1, 1.2  
**Requirements**: 1.1, 1.2, 6.1" \
  --assignee @me \
  --label "feature,auth"
```

### 2. 에디터 핵심 기능 PR

```bash
gh pr create \
  --title "feat(editor): Tiptap 에디터 핵심 기능 구현" \
  --body "Tiptap 기반 리치 텍스트 에디터의 핵심 기능을 구현했습니다.

## 구현 내용
- Tiptap 에디터 컴포넌트 생성
- 기본 확장 (Bold, Italic, Heading) 설정
- 에디터 툴바 UI 구현
- 콘텐츠 저장/로드 기능

## 테스트 확인
- [x] 에디터 렌더링 테스트 통과
- [x] 기본 포맷팅 기능 테스트
- [x] 컴포넌트 단위 테스트 통과

**Spec**: 03-block-based-editor  
**Tasks**: 1.1, 1.2, 1.3  
**Requirements**: 2.1, 2.2, 3.1" \
  --assignee @me \
  --label "feature,editor"
```

## PR 리뷰 및 머지 가이드

### 리뷰 체크리스트
- [ ] 코드 품질 및 스타일 가이드 준수
- [ ] 테스트 커버리지 적절성
- [ ] 타입 안전성 확보
- [ ] 성능 영향도 검토
- [ ] 보안 취약점 검토
- [ ] 문서화 적절성

### 머지 전 확인사항
```bash
# CI/CD 파이프라인 통과 확인
gh pr checks

# 리뷰 승인 상태 확인
gh pr view --json reviewDecision

# Squash 머지 실행
gh pr merge --squash --delete-branch
```

### 머지 후 정리
```bash
# 로컬 브랜치 정리
git checkout main
git pull origin main
git branch -d feature/01-jwt-setup

# 다음 작업 브랜치 생성
git checkout -b feature/01-login-api
```

## 브랜치 보호 규칙

### main 브랜치 보호 설정
- PR을 통한 머지만 허용
- 최소 1명의 리뷰 승인 필요
- CI/CD 파이프라인 통과 필수
- 브랜치가 최신 상태여야 머지 가능
- 관리자도 동일한 규칙 적용

### 자동화 설정
- **Commitlint**: 커밋 메시지 규칙 자동 검증
- CI/CD 파이프라인 자동 실행
- 머지 후 브랜치 자동 삭제
- **수동 라벨링**: 상황에 맞는 라벨 선택

## 트러블슈팅

### 자주 발생하는 문제들

**1. 브랜치 충돌**
```bash
# main 브랜치 최신 변경사항 가져오기
git checkout feature/01-jwt-setup
git rebase main

# 충돌 해결 후
git rebase --continue
git push --force-with-lease
```

**2. PR 생성 실패**
```bash
# GitHub CLI 인증 확인
gh auth status

# 재인증
gh auth login
```

**3. 커밋 메시지 수정**
```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 여러 커밋 메시지 수정
git rebase -i HEAD~3
```

## Commitlint 설정

### 설치 및 설정
```bash
# 루트 package.json에 추가
pnpm add -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js 생성
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Husky hook 추가
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg
```

### 커밋 메시지 규칙 검증
```bash
# ✅ 올바른 커밋 메시지
git commit -m "feat(auth): JWT 토큰 생성 로직 구현"
git commit -m "fix(editor): 블록 삭제 시 포커스 이동 버그 수정"
git commit -m "docs(readme): 개발 환경 설정 가이드 업데이트"

# ❌ 잘못된 커밋 메시지 (commitlint가 차단)
git commit -m "JWT 구현"  # 타입 누락
git commit -m "feat JWT 구현"  # 콜론 누락
git commit -m "feat(auth) JWT 구현"  # 콜론 누락
```

## PR 템플릿 세분화

### 기본 템플릿 (.github/pull_request_template.md)
```markdown
## 📋 작업 내용

<!-- 이 PR에서 구현한 기능이나 수정한 내용을 간략히 설명해주세요 -->

### 구현된 기능
- [ ] 기능 1
- [ ] 기능 2

### 기술적 변경사항
<!-- 주요 기술적 변경사항이나 아키텍처 결정을 설명해주세요 -->

## 🧪 테스트 확인
- [ ] 단위 테스트 통과
- [ ] 타입 검사 통과 (pnpm type-check)
- [ ] 린팅 통과 (pnpm lint)
- [ ] 빌드 성공 (pnpm build)

## 📚 관련 정보
- **Spec**: <!-- 관련 spec 번호 및 이름 -->
- **Tasks**: <!-- 완료된 task 번호들 -->
- **Requirements**: <!-- 충족한 requirement 번호들 -->

## 🔗 관련 링크
<!-- 관련 문서, 이슈, 참고 자료 링크 -->
```

### 기능별 특화 템플릿

#### 1. 인증 관련 (.github/PULL_REQUEST_TEMPLATE/auth.md)
```markdown
## 🔐 인증 시스템 변경사항

### 보안 관련 구현
- [ ] JWT 토큰 생성/검증
- [ ] 비밀번호 해싱
- [ ] 세션 관리
- [ ] 권한 검증

### 보안 테스트 확인
- [ ] 토큰 만료 테스트
- [ ] 무효한 토큰 처리 테스트
- [ ] 권한 없는 접근 차단 테스트
- [ ] SQL Injection 방어 테스트

### 환경변수 설정
- [ ] JWT_SECRET 설정 확인
- [ ] 토큰 만료 시간 설정
- [ ] 보안 관련 환경변수 검증

**Spec**: 01-user-authentication
```

#### 2. 에디터 관련 (.github/PULL_REQUEST_TEMPLATE/editor.md)
```markdown
## ✏️ 에디터 기능 변경사항

### 에디터 기능
- [ ] 새로운 블록 타입 추가
- [ ] 에디터 확장 구현
- [ ] 키보드 단축키 추가
- [ ] 툴바 UI 변경

### 사용자 경험 테스트
- [ ] 키보드 네비게이션 테스트
- [ ] 마우스 상호작용 테스트
- [ ] 접근성 (ARIA) 테스트
- [ ] 모바일 반응형 테스트

### 성능 확인
- [ ] 대용량 문서 렌더링 테스트
- [ ] 메모리 사용량 확인
- [ ] 타이핑 지연 시간 측정

**Spec**: 03-block-based-editor
```

#### 3. 실시간 협업 (.github/PULL_REQUEST_TEMPLATE/collaboration.md)
```markdown
## 🤝 실시간 협업 기능 변경사항

### 협업 기능
- [ ] Y.js 문서 동기화
- [ ] WebSocket 연결 관리
- [ ] 사용자 Presence 표시
- [ ] 충돌 해결 로직

### 동시성 테스트
- [ ] 다중 사용자 동시 편집 테스트
- [ ] 네트워크 단절 시나리오 테스트
- [ ] 재연결 후 동기화 테스트
- [ ] 대용량 변경사항 동기화 테스트

### 성능 및 안정성
- [ ] WebSocket 연결 안정성
- [ ] 메모리 누수 확인
- [ ] 동기화 지연 시간 측정

**Spec**: 05-realtime-collaboration
```

#### 4. 버그 수정 (.github/PULL_REQUEST_TEMPLATE/bugfix.md)
```markdown
## 🐛 버그 수정

### 버그 설명
**문제**: <!-- 발생한 문제 상황 설명 -->
**원인**: <!-- 버그 발생 원인 분석 -->
**해결**: <!-- 적용한 해결 방법 -->

### 수정 내용
- [ ] 버그 수정 코드 구현
- [ ] 관련 테스트 케이스 추가
- [ ] 회귀 테스트 확인

### 테스트 시나리오
- [ ] 버그 재현 시나리오 테스트
- [ ] 수정 후 정상 동작 확인
- [ ] 관련 기능 영향도 테스트
- [ ] 엣지 케이스 테스트

### 영향 범위
- **영향받는 기능**: <!-- 수정으로 영향받는 다른 기능들 -->
- **호환성**: <!-- 기존 데이터/API 호환성 -->
```

### PR 템플릿 사용 방법
```bash
# 기본 템플릿 사용
gh pr create --title "feat(auth): JWT 인증 구현"

# 특화 템플릿 사용
gh pr create --title "feat(auth): JWT 인증 구현" \
  --body-file .github/PULL_REQUEST_TEMPLATE/auth.md

gh pr create --title "feat(editor): 슬래시 커맨드 구현" \
  --body-file .github/PULL_REQUEST_TEMPLATE/editor.md

gh pr create --title "fix(collab): 동기화 지연 버그 수정" \
  --body-file .github/PULL_REQUEST_TEMPLATE/bugfix.md
```

## PR 템플릿 세분화 추천

### **추천: 기본 + 2개 특화 템플릿**

1. **기본 템플릿**: 모든 일반적인 PR용
2. **에디터 템플릿**: UI/UX 관련 기능용 (사용자 경험 테스트 중요)
3. **버그 수정 템플릿**: 버그 수정용 (원인 분석, 영향 범위 중요)

**이유:**
- **관리 용이성**: 너무 많은 템플릿은 오히려 복잡
- **실용성**: 가장 자주 사용하는 케이스에 집중
- **확장성**: 필요시 나중에 추가 가능

이 워크플로우를 따르면 체계적이고 효율적인 개발 프로세스를 유지할 수 있습니다.