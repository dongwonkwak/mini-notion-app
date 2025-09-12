---
inclusion: always
---

# Git 워크플로우 및 브랜치 전략

## 프로젝트 정보
- **프로젝트명**: mini-notion-app (실시간 협업 에디터)
- **팀 구성**: 개인/소규모 팀
- **개발 방식**: 태스크별 세밀한 관리

## 브랜치 전략

### 브랜치 구조
```
main (프로덕션)
├── develop (개발 메인)
├── feature/task-{번호}-{간단한-설명}
└── hotfix/urgent-fix (긴급 수정용)
```

### 브랜치 명명 규칙
```bash
# 개별 태스크용
feature/task-{번호}-{간단한-설명}

# 예시
feature/task-1-monorepo-setup
feature/task-4-editor-foundation
feature/task-8-file-upload-system
```

## 워크플로우

### 1. 새 태스크 시작
```bash
git checkout develop
git pull origin develop
git checkout -b feature/task-{번호}-{설명}
```

### 2. 커밋 컨벤션
```bash
feat(scope): 기능 추가
fix(scope): 버그 수정  
docs(scope): 문서 변경
style(scope): 코드 스타일 변경
refactor(scope): 리팩토링
test(scope): 테스트 추가/수정
chore(scope): 빌드/설정 변경

# 예시
feat(editor): Tiptap 기반 협업 에디터 기초 구축
fix(auth): JWT 토큰 갱신 로직 수정
test(collaboration): Y.js 실시간 동기화 테스트 추가
```

### 3. PR 및 머지 프로세스
1. **커밋 전 .gitignore 검증**
   ```bash
   # 추적되지 않는 파일 확인
   git status --ignored
   
   # 필요시 .gitignore 정리 Hook 실행
   # "🧹 .gitignore 정리" 버튼 클릭
   ```
2. 태스크 완료 후 `git push origin feature/task-{번호}-{설명}`
3. GitHub에서 develop 브랜치로 Pull Request 생성
4. 코드 리뷰 및 테스트 통과 후 머지
5. 브랜치 삭제 후 다음 태스크로 이동

## GitHub Issues 관리

### Issue 템플릿
```markdown
## 📋 태스크 {번호}: {제목}

### 작업 내용
- [ ] 세부 작업 1
- [ ] 세부 작업 2
- [ ] 세부 작업 3

### 완료 조건 ✅
- [ ] 기능 정상 동작 확인
- [ ] 테스트 통과
- [ ] 코드 리뷰 완료

### 관련 브랜치
`feature/task-{번호}-{설명}`

### 예상 소요 시간
{일수}일
```

## 현재 진행 상황

### 완료된 태스크
- [ ] 태스크 1: 모노레포 구조 및 개발 환경 초기화
- [ ] 태스크 2: 데이터베이스 스키마 및 ORM 설정
- [ ] 태스크 3: NextAuth.js를 사용한 인증 시스템 설정

### 진행 중인 태스크
현재 진행 중인 태스크: 없음

### 다음 태스크
다음 예정 태스크: 태스크 1 (모노레포 구조 및 개발 환경 초기화)

## GitHub 연동 방식
**확정된 도구**: GitHub CLI (gh) ✅
- **이슈 생성**: `issue-template.md` 파일 + 수동 실행 방식
- **PR 관리**: GitHub CLI 명령어 (추후 결정)
- MCP 대신 GitHub CLI 사용으로 결정
- 더 안정적이고 널리 사용되는 도구
- 명령어 기반으로 예측 가능한 동작

## GitHub CLI 워크플로우

### 1. Issue 생성 (수동 방식)
**프로세스**:
1. Agent가 `issue-template.md` 파일에 이슈 내용 작성
2. 사용자에게 GitHub CLI 명령어 제공
3. 사용자가 수동으로 이슈 생성

**명령어**:
```bash
gh issue create --title "태스크 {번호}: {제목}" --body-file issue-template.md --label "enhancement" --assignee @me
```

**이유**: Kiro 터미널에서 GitHub CLI 실행 시 서식 깨짐 문제로 인해 수동 방식 채택

### 2. 브랜치 생성 및 연동
```bash
git checkout -b feature/task-{번호}-{설명}
git push -u origin feature/task-{번호}-{설명}
```

### 3. PR 생성
```bash
gh pr create --title "feat: {태스크 제목}" --body "Closes #{issue번호}" --base develop --head feature/task-{번호}-{설명}
```

### 4. PR 머지 및 정리
```bash
gh pr merge {pr번호} --squash --delete-branch
```

## 참고사항
- 각 태스크는 독립적으로 개발하여 안전한 실험 가능
- 작은 단위로 PR을 생성하여 세밀한 코드 리뷰 진행
- GitHub CLI로 Issues와 PR을 자동화하여 진행률 시각적 관리
- 문제 발생 시 해당 태스크만 롤백하여 영향 최소화