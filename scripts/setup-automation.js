#!/usr/bin/env node

/**
 * 자동화 스크립트 설정 도구
 *
 * 기능:
 * 1. package.json에 자동화 스크립트 추가
 * 2. Git hooks 설정
 * 3. 필요한 의존성 설치
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 추가할 스크립트들
const AUTOMATION_SCRIPTS = {
  // 문서화 자동화
  'docs:auto': 'node scripts/auto-document-task.js',
  'docs:api': 'node scripts/generate-api-docs.js',
  'docs:update': 'node scripts/update-docs-readme.js',

  // 코드 품질
  'quality:check': 'pnpm eslint . && pnpm type-check && pnpm test:ci',
  'quality:fix': 'pnpm eslint . --fix && pnpm format',

  // 보안
  'security:scan': 'pnpm audit && node scripts/generate-security-report.js',
  'security:fix': 'pnpm audit --fix',

  // 성능
  'perf:analyze': 'pnpm analyze && node scripts/generate-performance-report.js',
  'perf:test': 'node scripts/measure-test-performance.js',

  // 통합 자동화
  'auto:task-complete': 'pnpm docs:auto && pnpm docs:api && pnpm quality:check',
  'auto:pre-commit': 'pnpm quality:fix && pnpm security:scan',
  'auto:pre-push': 'pnpm quality:check && pnpm test:ci',
};

// 필요한 개발 의존성
const DEV_DEPENDENCIES = ['glob', 'js-yaml', 'license-checker', '@types/glob'];

function updatePackageJson() {
  console.log('📦 package.json 업데이트 중...');

  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // scripts 섹션에 자동화 스크립트 추가
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  let addedCount = 0;
  for (const [name, command] of Object.entries(AUTOMATION_SCRIPTS)) {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = command;
      addedCount++;
      console.log(`✅ 스크립트 추가: ${name}`);
    }
  }

  // 파일 저장
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`📝 ${addedCount}개 스크립트가 추가되었습니다.`);
}

function installDependencies() {
  console.log('📥 필요한 의존성 설치 중...');

  try {
    const command = `pnpm add -D ${DEV_DEPENDENCIES.join(' ')}`;
    execSync(command, { stdio: 'inherit' });
    console.log('✅ 의존성 설치 완료');
  } catch (error) {
    console.error('❌ 의존성 설치 실패:', error.message);
  }
}

function setupGitHooks() {
  console.log('🪝 Git hooks 설정 중...');

  const hooksDir = '.git/hooks';

  if (!fs.existsSync(hooksDir)) {
    console.log('⚠️ Git 저장소가 아닙니다. Git hooks를 건너뜁니다.');
    return;
  }

  // pre-commit hook
  const preCommitHook = `#!/bin/sh
# 자동 코드 품질 검사
echo "🔍 코드 품질 검사 중..."
pnpm auto:pre-commit

if [ $? -ne 0 ]; then
  echo "❌ 코드 품질 검사 실패. 커밋이 중단되었습니다."
  exit 1
fi

echo "✅ 코드 품질 검사 통과"
`;

  // pre-push hook
  const prePushHook = `#!/bin/sh
# 자동 테스트 실행
echo "🧪 테스트 실행 중..."
pnpm auto:pre-push

if [ $? -ne 0 ]; then
  echo "❌ 테스트 실패. 푸시가 중단되었습니다."
  exit 1
fi

echo "✅ 모든 테스트 통과"
`;

  // Hook 파일 생성
  fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
  fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePushHook);

  // 실행 권한 부여
  try {
    execSync('chmod +x .git/hooks/pre-commit');
    execSync('chmod +x .git/hooks/pre-push');
    console.log('✅ Git hooks 설정 완료');
  } catch (error) {
    console.error('❌ Git hooks 권한 설정 실패:', error.message);
  }
}

function createAutomationGuide() {
  console.log('📚 자동화 가이드 생성 중...');

  const guideContent = `# 자동화 가이드

## 🤖 사용 가능한 자동화 스크립트

### 문서화 자동화
\`\`\`bash
# Task 완료 시 문서 자동 생성
pnpm docs:auto 3  # Task 3 문서화

# API 문서 자동 생성
pnpm docs:api

# docs/README.md 업데이트
pnpm docs:update
\`\`\`

### 코드 품질 자동화
\`\`\`bash
# 코드 품질 검사
pnpm quality:check

# 코드 품질 자동 수정
pnpm quality:fix
\`\`\`

### 보안 자동화
\`\`\`bash
# 보안 취약점 스캔
pnpm security:scan

# 보안 취약점 자동 수정
pnpm security:fix
\`\`\`

### 성능 모니터링
\`\`\`bash
# 성능 분석
pnpm perf:analyze

# 테스트 성능 측정
pnpm perf:test
\`\`\`

### 통합 자동화
\`\`\`bash
# Task 완료 시 전체 자동화
pnpm auto:task-complete

# 커밋 전 자동화
pnpm auto:pre-commit

# 푸시 전 자동화
pnpm auto:pre-push
\`\`\`

## 🔧 Agent Hooks

### 파일 저장 시 자동 실행
- **코드 품질 검사**: ESLint, Prettier, TypeScript 체크
- **테스트 자동화**: 관련 테스트 실행
- **보안 스캔**: 의존성 취약점 검사

### 수동 실행 Hooks
- **Task 문서화**: 완료된 Task의 문서 자동 생성
- **스마트 커밋**: AI 기반 커밋 메시지 생성
- **성능 모니터링**: 빌드 및 테스트 성능 분석

## 📊 자동화 메트릭

### 품질 지표
- 코드 커버리지: 70% 이상 유지
- ESLint 에러: 0개 유지
- TypeScript 에러: 0개 유지

### 성능 지표
- 번들 크기: 500KB 이하 유지
- 빌드 시간: 60초 이하 유지
- 테스트 시간: 30초 이하 유지

### 보안 지표
- Critical 취약점: 0개 유지
- High 취약점: 24시간 내 해결
- 라이선스 정책: 100% 준수

---

**참고**: 자동화는 개발 효율성을 높이지만, 필요에 따라 수동으로 비활성화할 수 있습니다.
`;

  fs.writeFileSync('docs/automation-guide.md', guideContent);
  console.log('✅ 자동화 가이드 생성 완료: docs/automation-guide.md');
}

// 메인 실행 함수
async function main() {
  console.log('🚀 자동화 시스템 설정 시작');

  try {
    // 1. package.json 업데이트
    updatePackageJson();

    // 2. 필요한 의존성 설치
    installDependencies();

    // 3. Git hooks 설정
    setupGitHooks();

    // 4. 자동화 가이드 생성
    createAutomationGuide();

    console.log('✅ 자동화 시스템 설정 완료!');
    console.log('');
    console.log('🎯 다음 단계:');
    console.log('1. pnpm docs:auto 3 - Task 3 문서화 테스트');
    console.log('2. pnpm docs:api - API 문서 생성 테스트');
    console.log('3. pnpm quality:check - 코드 품질 검사 테스트');
    console.log('');
    console.log('📚 자세한 사용법: docs/automation-guide.md');
  } catch (error) {
    console.error('❌ 자동화 설정 중 오류:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updatePackageJson,
  installDependencies,
  setupGitHooks,
  createAutomationGuide,
};
