---
inclusion: always
---

# .gitignore 관리 가이드라인

## 개요

프로젝트 진행 중 생성되는 다양한 파일들 중 Git으로 관리할 필요가 없는 파일들을 자동으로 식별하고 .gitignore에 추가하여 저장소를 깔끔하게 유지합니다.

## 🎯 목적

1. **저장소 정리**: 불필요한 파일로 인한 저장소 크기 증가 방지
2. **협업 효율성**: 개인 설정이나 임시 파일로 인한 충돌 방지
3. **보안**: 민감한 정보가 포함된 파일의 실수 커밋 방지
4. **성능**: 대용량 빌드 결과물이나 로그 파일 제외로 Git 성능 향상

## 📋 자동 .gitignore 추가 대상

### 🧪 테스트 관련 파일
```gitignore
# 테스트 결과 및 커버리지
coverage/
test-results/
*.lcov
junit.xml
test-report.html
playwright-report/
test-output/
```

**이유**: 테스트 실행 시마다 생성되는 결과 파일들은 로컬 환경에 따라 달라지며, CI/CD에서 별도로 생성됨

### 🏗️ 빌드 및 컴파일 결과물
```gitignore
# 빌드 결과물
dist/
build/
.next/
.turbo/
*.tsbuildinfo
out/
```

**이유**: 소스 코드에서 자동 생성되는 파일들로, 저장소에 포함할 필요 없음

### 🗄️ 데이터베이스 파일
```gitignore
# 개발용 데이터베이스
*.db
*.db-journal
*.sqlite
*.sqlite3
dev.db
test.db
```

**이유**: 개발 환경의 로컬 데이터베이스는 개인별로 다르며, 시딩 스크립트로 재생성 가능

### 📝 로그 및 디버그 파일
```gitignore
# 로그 파일
*.log
logs/
debug.log
error.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
```

**이유**: 실행 시점과 환경에 따라 달라지는 로그는 디버깅 후 삭제되어야 함

### ⚙️ 환경 설정 파일
```gitignore
# 로컬 환경 변수
.env.local
.env.development.local
.env.test.local
.env.production.local
config.local.json
```

**이유**: 개인별 개발 환경 설정이나 민감한 정보가 포함될 수 있음

### 🔧 IDE 및 에디터 파일
```gitignore
# IDE 개인 설정
.vscode/settings.json
.idea/workspace.xml
*.swp
*.swo
.DS_Store
Thumbs.db
```

**이유**: 개발자 개인의 IDE 설정은 다른 팀원에게 영향을 주지 않아야 함

### 📊 성능 및 프로파일링 파일
```gitignore
# 프로파일링 결과
*.cpuprofile
*.heapprofile
*.heapsnapshot
profile-*
benchmark-results/
```

**이유**: 성능 분석 결과는 일시적이며, 분석 후 삭제되는 것이 일반적

### 🔐 보안 관련 파일
```gitignore
# 보안 파일
*.pem
*.key
*.crt
secrets/
credentials.json
auth-config.local.json
```

**이유**: 인증서나 키 파일은 보안상 저장소에 포함되어서는 안 됨

## 🔄 자동화 워크플로우

### Agent Hook 동작 과정

1. **수동 트리거**: 커밋 전 또는 PR 준비 시 "🧹 .gitignore 정리" 버튼 클릭
2. **현재 상태 스캔**: `git status --porcelain`으로 추적되지 않는 파일 확인
3. **패턴 매칭**: 미리 정의된 패턴과 비교하여 .gitignore 대상 식별
4. **중복 확인**: 현재 .gitignore에 이미 포함된 패턴인지 확인
5. **자동 추가**: 누락된 패턴을 적절한 그룹에 추가
6. **정리 및 포맷팅**: 주석과 함께 논리적으로 그룹화

### 권장 실행 시점

- **커밋 전**: 새로운 파일들이 Git에 추가되기 전
- **PR 준비 시**: "📋 PR 준비" Hook에서 자동으로 포함됨
- **새 도구 도입 후**: 새로운 빌드 도구나 테스트 도구 사용 시
- **정기 정리**: 주간 또는 스프린트 종료 시

### 수동 검토가 필요한 경우

- **대용량 파일**: 100MB 이상의 파일
- **바이너리 파일**: 실행 파일이나 라이브러리
- **임시 디렉토리**: `tmp/`, `temp/`, `cache/` 등
- **써드파티 도구 결과물**: 새로운 도구 사용 시

## 📝 .gitignore 관리 원칙

### 1. **그룹별 정리**
```gitignore
# Dependencies
node_modules/

# Production builds
dist/
build/

# Environment variables
.env.local

# IDE
.vscode/settings.json
```

### 2. **주석 활용**
- 각 그룹의 목적을 명확히 설명
- 특별한 이유가 있는 패턴에 대한 설명 추가

### 3. **패턴 우선순위**
- 구체적인 파일명 → 일반적인 패턴 순서
- 자주 사용되는 패턴을 상단에 배치

### 4. **정기적인 검토**
- 새로운 도구 도입 시 관련 파일 패턴 추가
- 사용하지 않는 패턴 정리
- 팀 컨벤션에 맞게 조정

## ⚠️ 주의사항

### 이미 추적 중인 파일 처리
```bash
# 이미 Git에 추가된 파일을 .gitignore에 추가한 경우
git rm --cached filename
git rm -r --cached directory/

# 변경사항 커밋
git commit -m "Remove tracked files that should be ignored"
```

### 글로벌 vs 프로젝트 .gitignore
- **글로벌**: OS나 IDE 관련 파일 (`.DS_Store`, `.idea/`)
- **프로젝트**: 프로젝트 특화 파일 (`dist/`, `coverage/`)

### 민감한 정보 처리
```bash
# 실수로 커밋된 민감한 정보 제거
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/sensitive/file' \
  --prune-empty --tag-name-filter cat -- --all
```

## 🔍 검증 방법

### 정기적인 .gitignore 검증
```bash
# 추적되지 않는 파일 확인
git status --ignored

# .gitignore 패턴 테스트
git check-ignore -v filename

# 저장소 크기 확인
git count-objects -vH
```

### 자동화된 검증
- CI/CD에서 불필요한 파일이 포함되지 않았는지 확인
- 대용량 파일이나 민감한 정보 패턴 검사
- .gitignore 패턴의 유효성 검증

## 📊 모니터링 지표

### 추적해야 할 메트릭
- **저장소 크기**: 불필요한 파일로 인한 크기 증가 모니터링
- **커밋 품질**: 빌드 결과물이나 로그 파일 커밋 빈도
- **충돌 빈도**: 개인 설정 파일로 인한 머지 충돌
- **보안 이슈**: 민감한 정보 실수 커밋 발생률

### 개선 지표
- .gitignore 자동 업데이트 정확도
- 수동 개입이 필요한 케이스 감소
- 팀원들의 .gitignore 관련 문의 감소

## 🎯 베스트 프랙티스

1. **예방적 접근**: 새로운 도구 도입 시 미리 .gitignore 패턴 추가
2. **팀 컨벤션**: 팀 전체가 동의하는 .gitignore 규칙 수립
3. **문서화**: 특별한 패턴이나 예외사항에 대한 문서화
4. **정기 검토**: 월 1회 .gitignore 패턴 검토 및 정리
5. **교육**: 새로운 팀원에게 .gitignore 관리 방법 교육

---

**참고**: 이 가이드라인은 프로젝트 특성에 맞게 조정할 수 있으며, 새로운 도구나 워크플로우 도입 시 지속적으로 업데이트됩니다.