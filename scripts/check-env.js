#!/usr/bin/env node

/**
 * 환경 변수 체크 스크립트
 * IMP-001: 환경 변수 관리 체계화
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * 환경별 설정 템플릿 생성
 */
function generateEnvTemplates() {
  const templates = {
    development: `# Development Environment Configuration
NODE_ENV=development

# Database Configuration
DATABASE_URL="sqlite:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"

# OAuth Providers (Development)
GOOGLE_CLIENT_ID="your-google-client-id-dev"
GOOGLE_CLIENT_SECRET="your-google-client-secret-dev"
GITHUB_CLIENT_ID="your-github-client-id-dev"
GITHUB_CLIENT_SECRET="your-github-client-secret-dev"

# Redis Configuration (Optional for development)
REDIS_URL="redis://localhost:6379"

# Security Configuration (Development)
JWT_SECRET="development-jwt-secret-change-in-production"
ENCRYPTION_KEY="development-encryption-key-change-in-production"

# File Upload Configuration
UPLOAD_MAX_SIZE="10485760" # 10MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"

# Rate Limiting (Relaxed for development)
RATE_LIMIT_WINDOW_MS="900000" # 15 minutes
RATE_LIMIT_MAX_REQUESTS="1000"

# Monitoring (Development)
SENTRY_DSN="" # Optional for development
LOG_LEVEL="debug"

# Feature Flags
ENABLE_MFA="true"
ENABLE_ANALYTICS="false"
ENABLE_DEBUG_MODE="true"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"`,

    staging: `# Staging Environment Configuration
NODE_ENV=staging

# Database Configuration
DATABASE_URL="postgresql://username:password@staging-db-host:5432/mini_notion_app_staging"

# NextAuth.js Configuration
NEXTAUTH_URL="https://staging.mini-notion.app"
NEXTAUTH_SECRET="staging-secret-key-must-be-secure"

# OAuth Providers (Staging)
GOOGLE_CLIENT_ID="your-google-client-id-staging"
GOOGLE_CLIENT_SECRET="your-google-client-secret-staging"
GITHUB_CLIENT_ID="your-github-client-id-staging"
GITHUB_CLIENT_SECRET="your-github-client-secret-staging"

# Redis Configuration
REDIS_URL="redis://staging-redis-host:6379"

# Security Configuration
JWT_SECRET="staging-jwt-secret-must-be-secure"
ENCRYPTION_KEY="staging-encryption-key-must-be-secure"

# File Upload Configuration
UPLOAD_MAX_SIZE="52428800" # 50MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,text/plain"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000" # 15 minutes
RATE_LIMIT_MAX_REQUESTS="500"

# Monitoring
SENTRY_DSN="your-sentry-dsn-staging"
LOG_LEVEL="info"

# Feature Flags
ENABLE_MFA="true"
ENABLE_ANALYTICS="true"
ENABLE_DEBUG_MODE="false"

# CORS Configuration
CORS_ORIGINS="https://staging.mini-notion.app"`,

    production: `# Production Environment Configuration
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://username:password@production-db-host:5432/mini_notion_app"

# NextAuth.js Configuration
NEXTAUTH_URL="https://mini-notion.app"
NEXTAUTH_SECRET="production-secret-key-must-be-very-secure"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="your-google-client-id-production"
GOOGLE_CLIENT_SECRET="your-google-client-secret-production"
GITHUB_CLIENT_ID="your-github-client-id-production"
GITHUB_CLIENT_SECRET="your-github-client-secret-production"

# Redis Configuration
REDIS_URL="redis://production-redis-host:6379"

# Security Configuration
JWT_SECRET="production-jwt-secret-must-be-very-secure"
ENCRYPTION_KEY="production-encryption-key-must-be-very-secure"

# File Upload Configuration
UPLOAD_MAX_SIZE="104857600" # 100MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# Rate Limiting (Strict for production)
RATE_LIMIT_WINDOW_MS="900000" # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"

# Monitoring
SENTRY_DSN="your-sentry-dsn-production"
LOG_LEVEL="warn"

# Feature Flags
ENABLE_MFA="true"
ENABLE_ANALYTICS="true"
ENABLE_DEBUG_MODE="false"

# CORS Configuration
CORS_ORIGINS="https://mini-notion.app"`
  };

  return templates;
}

/**
 * 환경별 .env 파일 생성
 */
function createEnvFiles() {
  console.log('📝 환경별 .env 파일을 생성합니다...\n');
  
  const templates = generateEnvTemplates();
  const createdFiles = [];

  for (const [env, content] of Object.entries(templates)) {
    const fileName = `.env.${env}`;
    const filePath = join(projectRoot, fileName);
    
    if (!existsSync(filePath)) {
      writeFileSync(filePath, content);
      createdFiles.push(fileName);
      console.log(`✅ ${fileName} 생성됨`);
    } else {
      console.log(`⚠️  ${fileName} 이미 존재함`);
    }
  }

  if (createdFiles.length > 0) {
    console.log(`\n🎉 ${createdFiles.length}개의 환경 파일이 생성되었습니다!`);
    console.log('\n💡 다음 단계:');
    console.log('  1. 각 환경 파일의 실제 값으로 업데이트하세요');
    console.log('  2. 보안이 중요한 키들은 반드시 변경하세요');
    console.log('  3. pnpm run env:validate로 검증하세요');
  } else {
    console.log('\n📋 모든 환경 파일이 이미 존재합니다.');
  }
}

/**
 * 환경 변수 상태 체크
 */
function checkEnvironmentStatus() {
  console.log('🔍 환경 변수 상태를 확인합니다...\n');
  
  const envFiles = ['.env', '.env.local', '.env.development', '.env.staging', '.env.production'];
  const existingFiles = [];
  const missingFiles = [];

  envFiles.forEach(file => {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  });

  console.log('📁 환경 파일 상태:');
  existingFiles.forEach(file => {
    console.log(`  ✅ ${file}`);
  });
  missingFiles.forEach(file => {
    console.log(`  ❌ ${file}`);
  });

  if (missingFiles.length > 0) {
    console.log(`\n⚠️  ${missingFiles.length}개의 환경 파일이 누락되었습니다.`);
    console.log('💡 해결 방법: pnpm run env:setup');
  } else {
    console.log('\n🎉 모든 환경 파일이 존재합니다!');
  }

  return { existingFiles, missingFiles };
}

/**
 * 환경 변수 요약 정보 출력
 */
function showEnvironmentSummary() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  console.log('\n📊 환경 변수 요약:');
  console.log(`  환경: ${nodeEnv}`);
  console.log(`  필수 변수: ${requiredVars.length}개`);
  
  const setVars = requiredVars.filter(varName => process.env[varName]);
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  console.log(`  설정됨: ${setVars.length}개`);
  console.log(`  누락됨: ${missingVars.length}개`);

  if (missingVars.length > 0) {
    console.log('\n❌ 누락된 필수 변수:');
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'setup':
    case 'create':
      createEnvFiles();
      break;
    case 'status':
    case 'check':
      checkEnvironmentStatus();
      showEnvironmentSummary();
      break;
    default:
      console.log('🔧 환경 변수 관리 도구\n');
      console.log('사용법:');
      console.log('  pnpm run env:setup    - 환경별 .env 파일 생성');
      console.log('  pnpm run env:check    - 환경 변수 상태 확인');
      console.log('  pnpm run env:validate - 환경 변수 검증');
      break;
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createEnvFiles, checkEnvironmentStatus, showEnvironmentSummary };
