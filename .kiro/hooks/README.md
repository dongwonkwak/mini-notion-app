# Agent Hooks 설정

이 디렉토리에는 Mini Notion App 프로젝트의 개발 워크플로우를 자동화하는 Agent Hooks가 정의되어 있습니다.

## 🔧 설정된 Hooks

### 1. **Spec Documents Sync** (`spec-sync.json`)
- **트리거**: requirements.md, design.md, tasks.md 파일 변경
- **기능**: 세 문서 간의 일관성 자동 유지
- **자동 실행**: ✅ 예

### 2. **Task Completion Tests** (`task-completion-tests.json`)  
- **트리거**: tasks.md에서 태스크 완료 표시
- **기능**: 완료된 태스크에 맞는 테스트 자동 생성 및 실행
- **자동 실행**: ❌ 수동 (확인 후 실행)

### 3. **Git Workflow Automation** (`git-workflow-automation.json`)
- **트리거**: 수동 버튼 클릭
- **기능**: 새 태스크 시작 시 브랜치 생성, 이슈 등록 자동화
- **자동 실행**: ❌ 수동

### 4. **Code Quality Check** (`code-quality-check.json`)
- **트리거**: TypeScript/JavaScript 파일 변경
- **기능**: 린트, 타입 체크, 테스트 자동 실행
- **자동 실행**: ✅ 예

### 5. **PR Preparation** (`pr-preparation.json`)
- **트리거**: 수동 버튼 클릭  
- **기능**: PR 생성 전 체크리스트 검증 및 자동화
- **자동 실행**: ❌ 수동

### 6. **Task Documentation Auto-Update** (`task-documentation.json`)
- **트리거**: 코드/설정 파일 변경
- **기능**: 태스크 범위를 벗어나는 추가 작업 자동 문서화
- **자동 실행**: ✅ 예

### 7. **GitIgnore Auto Update** (`gitignore-auto-update.json`)
- **트리거**: 수동 버튼 클릭
- **기능**: Git으로 관리할 필요 없는 파일을 자동으로 .gitignore에 추가
- **자동 실행**: ❌ 수동 (커밋 전 실행 권장)

### 8. **Environment Validation** (`environment-validation.json`)
- **트리거**: 수동 버튼 클릭
- **기능**: 개발 환경 설정 상태 검증 (Node.js, Docker, DB 등)
- **자동 실행**: ❌ 수동 (태스크 시작 전 권장)

### 9. **Security Scan** (`security-scan.json`)
- **트리거**: 수동 버튼 클릭
- **기능**: 보안 취약점 및 민감 정보 노출 검사
- **자동 실행**: ❌ 수동 (주간 또는 릴리즈 전 권장)

## 🚀 사용 방법

### Kiro IDE에서 Hook 활성화
1. Kiro IDE의 Explorer 패널에서 "Agent Hooks" 섹션 확인
2. 또는 Command Palette에서 "Open Kiro Hook UI" 실행
3. 각 Hook의 활성화 상태 확인 및 설정

### 수동 Hook 실행
- **새 태스크 시작**: "🚀 새 태스크 시작" 버튼 클릭
- **PR 준비**: "📋 PR 준비" 버튼 클릭

### 자동 Hook 모니터링
- 파일 변경 시 자동으로 실행되는 Hook들의 결과 확인
- 실행 로그 및 오류 메시지 검토

## 📋 워크플로우 예시

### 새 태스크 시작 시
1. "🔧 환경 검증" Hook으로 개발 환경 확인 (선택적)
2. "🚀 새 태스크 시작" Hook 실행
3. 자동으로 브랜치 생성 및 이슈 등록
4. 코드 작성 중 "Code Quality Check" 자동 실행 (실시간)
5. 추가 작업 발생 시 "Task Documentation" 자동 실행
6. Spec 문서 수정 시 "Spec Documents Sync" 자동 실행

### 태스크 완료 시  
1. tasks.md에서 태스크를 완료로 표시
2. "🧹 .gitignore 정리" Hook으로 불필요한 파일 정리
3. "Task Completion Tests" Hook 실행 (수동 확인)
4. "🔒 보안 스캔" Hook으로 보안 검증 (선택적)
5. "📋 PR 준비" Hook으로 최종 검증 (자동으로 .gitignore 재검증 포함)
6. PR 생성 및 리뷰 요청

## ⚙️ Hook 커스터마이징

각 Hook 파일을 수정하여 프로젝트 요구사항에 맞게 조정할 수 있습니다:

- **트리거 조건 변경**: `trigger` 섹션 수정
- **실행 조건 추가**: `conditions` 배열에 조건 추가  
- **프롬프트 개선**: `prompt` 내용 수정
- **자동 실행 설정**: `auto_execute` 값 변경

## 🔍 문제 해결

### Hook이 실행되지 않는 경우
1. Hook 파일의 JSON 문법 확인
2. 트리거 조건이 올바른지 확인
3. Kiro IDE에서 Hook 활성화 상태 확인
4. 파일 경로 패턴이 정확한지 확인

### 성능 최적화
- 자주 실행되는 Hook의 조건을 더 구체적으로 설정
- 대용량 파일 변경 시 제외 패턴 추가
- 불필요한 Hook 비활성화

## 📚 참고 문서

- [Kiro Agent Hooks 공식 문서](https://docs.kiro.ai/hooks)
- [Git Workflow](.kiro/steering/git-workflow.md)
- [Testing Strategy](.kiro/steering/testing-strategy.md)
- [Project Context](.kiro/steering/project-context.md)