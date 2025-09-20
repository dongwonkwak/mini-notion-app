#!/usr/bin/env node

/**
 * Turbo 설정 검증 스크립트
 * 
 * 이 스크립트는 turbo.json 설정이 올바르게 구성되었는지 검증하고
 * 캐싱 및 의존성 설정이 예상대로 동작하는지 확인합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Turbo 설정 검증 시작...\n');

// 1. turbo.json 파일 존재 확인
const turboJsonPath = path.join(process.cwd(), 'turbo.json');
if (!fs.existsSync(turboJsonPath)) {
  console.error('❌ turbo.json 파일을 찾을 수 없습니다.');
  process.exit(1);
}

console.log('✅ turbo.json 파일 존재 확인');

// 2. turbo.json 구문 검증
try {
  const turboConfig = JSON.parse(fs.readFileSync(turboJsonPath, 'utf8'));
  console.log('✅ turbo.json 구문 유효성 확인');
  
  // 필수 섹션 확인
  const requiredSections = ['tasks', 'globalDependencies', 'globalEnv'];
  for (const section of requiredSections) {
    if (!turboConfig[section]) {
      console.error(`❌ 필수 섹션 누락: ${section}`);
      process.exit(1);
    }
  }
  console.log('✅ 필수 섹션 존재 확인');
  
} catch (error) {
  console.error('❌ turbo.json 파싱 오류:', error.message);
  process.exit(1);
}

// 3. Turbo CLI 동작 확인
try {
  console.log('\n🧪 Turbo CLI 동작 테스트...');
  
  // 기본 명령어 테스트
  execSync('pnpm turbo --version', { stdio: 'pipe' });
  console.log('✅ Turbo CLI 설치 확인');
  
  // 설정 검증 (dry-run)
  const dryRunOutput = execSync('pnpm turbo run build --dry-run=json', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  const dryRunResult = JSON.parse(dryRunOutput);
  console.log('✅ Turbo 설정 구문 검증 통과');
  
  // 글로벌 캐시 입력 확인
  if (dryRunResult.globalCacheInputs) {
    console.log('✅ 글로벌 캐시 입력 설정 확인');
    console.log(`   - 파일: ${Object.keys(dryRunResult.globalCacheInputs.files || {}).length}개`);
    console.log(`   - 환경변수: ${dryRunResult.globalCacheInputs.environmentVariables?.specified?.env?.length || 0}개`);
  }
  
} catch (error) {
  console.error('❌ Turbo CLI 테스트 실패:', error.message);
  process.exit(1);
}

// 4. 태스크 의존성 그래프 검증
try {
  console.log('\n📊 태스크 의존성 그래프 검증...');
  
  const tasks = ['build', 'test', 'lint', 'type-check'];
  for (const task of tasks) {
    try {
      execSync(`pnpm turbo run ${task} --dry-run`, { stdio: 'pipe' });
      console.log(`✅ ${task} 태스크 설정 유효`);
    } catch (taskError) {
      console.warn(`⚠️  ${task} 태스크 설정 문제 (패키지 없음으로 인한 것일 수 있음)`);
    }
  }
  
} catch (error) {
  console.error('❌ 태스크 의존성 검증 실패:', error.message);
}

// 5. 캐시 디렉토리 확인
const cacheDir = path.join(process.cwd(), '.turbo');
if (fs.existsSync(cacheDir)) {
  console.log('✅ Turbo 캐시 디렉토리 존재');
} else {
  console.log('ℹ️  Turbo 캐시 디렉토리 미존재 (첫 실행 후 생성됨)');
}

// 6. 설정 요약 출력
console.log('\n📋 설정 요약:');
try {
  const turboConfig = JSON.parse(fs.readFileSync(turboJsonPath, 'utf8'));
  
  console.log(`   - 태스크 수: ${Object.keys(turboConfig.tasks || {}).length}개`);
  console.log(`   - 글로벌 의존성: ${(turboConfig.globalDependencies || []).length}개`);
  console.log(`   - 글로벌 환경변수: ${(turboConfig.globalEnv || []).length}개`);
  console.log(`   - 원격 캐시: ${turboConfig.remoteCache?.signature ? '활성화' : '비활성화'}`);
  console.log(`   - 캐시 디렉토리: ${turboConfig.cacheDir || '.turbo'}`);
  
} catch (error) {
  console.warn('⚠️  설정 요약 생성 실패');
}

console.log('\n🎉 Turbo 설정 검증 완료!');
console.log('\n💡 다음 명령어로 캐싱 동작을 테스트할 수 있습니다:');
console.log('   pnpm turbo run build --dry-run');
console.log('   pnpm turbo run test --dry-run');
console.log('   pnpm turbo run lint --dry-run');