#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 * IMP-001: 환경 변수 관리 체계화
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 필수 환경 변수 정의
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'Database connection URL',
    validation: (value) => {
      if (!value) return 'DATABASE_URL is required';
      if (process.env.NODE_ENV === 'production' && !value.startsWith('postgresql://')) {
        return 'PostgreSQL must be used in production';
      }
      return null;
    }
  },

  // Authentication
  NEXTAUTH_URL: {
    required: true,
    description: 'NextAuth.js URL',
    validation: (value) => {
      if (!value) return 'NEXTAUTH_URL is required';
      if (process.env.NODE_ENV === 'production' && !value.startsWith('https://')) {
        return 'HTTPS must be used in production';
      }
      return null;
    }
  },

  NEXTAUTH_SECRET: {
    required: true,
    description: 'NextAuth.js secret key',
    validation: (value) => {
      if (!value) return 'NEXTAUTH_SECRET is required';
      if (process.env.NODE_ENV === 'production' && value.length < 32) {
        return 'NEXTAUTH_SECRET must be at least 32 characters in production';
      }
      if (value.includes('development-secret') || value.includes('change-in-production')) {
        return 'NEXTAUTH_SECRET must be changed from default value';
      }
      return null;
    }
  },

  JWT_SECRET: {
    required: true,
    description: 'JWT secret key',
    validation: (value) => {
      if (!value) return 'JWT_SECRET is required';
      if (process.env.NODE_ENV === 'production' && value.length < 32) {
        return 'JWT_SECRET must be at least 32 characters in production';
      }
      if (value.includes('development-jwt-secret') || value.includes('change-in-production')) {
        return 'JWT_SECRET must be changed from default value';
      }
      return null;
    }
  },

  ENCRYPTION_KEY: {
    required: true,
    description: 'Encryption key',
    validation: (value) => {
      if (!value) return 'ENCRYPTION_KEY is required';
      if (process.env.NODE_ENV === 'production' && value.length < 32) {
        return 'ENCRYPTION_KEY must be at least 32 characters in production';
      }
      if (value.includes('development-encryption-key') || value.includes('change-in-production')) {
        return 'ENCRYPTION_KEY must be changed from default value';
      }
      return null;
    }
  },

  // OAuth (Optional but recommended)
  GOOGLE_CLIENT_ID: {
    required: false,
    description: 'Google OAuth client ID',
    validation: (value) => {
      if (value && value.includes('your-google-client-id')) {
        return 'GOOGLE_CLIENT_ID must be set to actual value';
      }
      return null;
    }
  },

  GOOGLE_CLIENT_SECRET: {
    required: false,
    description: 'Google OAuth client secret',
    validation: (value) => {
      if (value && value.includes('your-google-client-secret')) {
        return 'GOOGLE_CLIENT_SECRET must be set to actual value';
      }
      return null;
    }
  },

  GITHUB_CLIENT_ID: {
    required: false,
    description: 'GitHub OAuth client ID',
    validation: (value) => {
      if (value && value.includes('your-github-client-id')) {
        return 'GITHUB_CLIENT_ID must be set to actual value';
      }
      return null;
    }
  },

  GITHUB_CLIENT_SECRET: {
    required: false,
    description: 'GitHub OAuth client secret',
    validation: (value) => {
      if (value && value.includes('your-github-client-secret')) {
        return 'GITHUB_CLIENT_SECRET must be set to actual value';
      }
      return null;
    }
  },

  // Redis (Optional)
  REDIS_URL: {
    required: false,
    description: 'Redis connection URL',
    validation: (value) => {
      if (value && !value.startsWith('redis://')) {
        return 'REDIS_URL must start with redis://';
      }
      return null;
    }
  },

  // Security
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    description: 'Rate limit window in milliseconds',
    validation: (value) => {
      if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
        return 'RATE_LIMIT_WINDOW_MS must be a positive number';
      }
      return null;
    }
  },

  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    description: 'Maximum requests per window',
    validation: (value) => {
      if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
        return 'RATE_LIMIT_MAX_REQUESTS must be a positive number';
      }
      return null;
    }
  },

  // File Upload
  UPLOAD_MAX_SIZE: {
    required: false,
    description: 'Maximum file upload size in bytes',
    validation: (value) => {
      if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
        return 'UPLOAD_MAX_SIZE must be a positive number';
      }
      return null;
    }
  },

  // Monitoring
  LOG_LEVEL: {
    required: false,
    description: 'Log level',
    validation: (value) => {
      if (value && !['debug', 'info', 'warn', 'error'].includes(value)) {
        return 'LOG_LEVEL must be one of: debug, info, warn, error';
      }
      return null;
    }
  },

  // Feature Flags
  ENABLE_MFA: {
    required: false,
    description: 'Enable Multi-Factor Authentication',
    validation: (value) => {
      if (value && !['true', 'false'].includes(value)) {
        return 'ENABLE_MFA must be true or false';
      }
      return null;
    }
  },

  ENABLE_ANALYTICS: {
    required: false,
    description: 'Enable Analytics',
    validation: (value) => {
      if (value && !['true', 'false'].includes(value)) {
        return 'ENABLE_ANALYTICS must be true or false';
      }
      return null;
    }
  },

  ENABLE_DEBUG_MODE: {
    required: false,
    description: 'Enable Debug Mode',
    validation: (value) => {
      if (value && !['true', 'false'].includes(value)) {
        return 'ENABLE_DEBUG_MODE must be true or false';
      }
      return null;
    }
  }
};

/**
 * 환경 변수 검증
 */
function validateEnvironmentVariables() {
  console.log('🔍 환경 변수 검증을 시작합니다...\n');
  
  const errors = [];
  const warnings = [];
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log(`📋 환경: ${nodeEnv}`);
  console.log('─'.repeat(50));

  // 필수 환경 변수 검증
  for (const [varName, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (config.required && !value) {
      errors.push(`❌ ${varName}: 필수 환경 변수가 설정되지 않았습니다`);
      continue;
    }

    if (value && config.validation) {
      const validationError = config.validation(value);
      if (validationError) {
        if (config.required) {
          errors.push(`❌ ${varName}: ${validationError}`);
        } else {
          warnings.push(`⚠️  ${varName}: ${validationError}`);
        }
      } else {
        console.log(`✅ ${varName}: ${config.description}`);
      }
    } else if (value) {
      console.log(`✅ ${varName}: ${config.description}`);
    }
  }

  // 결과 출력
  console.log('\n' + '─'.repeat(50));
  
  if (warnings.length > 0) {
    console.log('\n⚠️  경고사항:');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ 오류:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log('\n💡 해결 방법:');
    console.log('  1. .env 파일을 확인하고 누락된 환경 변수를 추가하세요');
    console.log('  2. env.example 파일을 참고하여 올바른 값을 설정하세요');
    console.log('  3. 프로덕션 환경에서는 보안 키를 반드시 변경하세요');
    process.exit(1);
  }

  console.log('\n🎉 모든 환경 변수가 올바르게 설정되었습니다!');
}

/**
 * .env 파일 존재 여부 확인
 */
function checkEnvFiles() {
  const envFiles = ['.env', '.env.local', '.env.development', '.env.staging', '.env.production'];
  const existingFiles = envFiles.filter(file => existsSync(join(projectRoot, file)));
  
  console.log('\n📁 환경 파일 상태:');
  envFiles.forEach(file => {
    const exists = existingFiles.includes(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });

  if (existingFiles.length === 0) {
    console.log('\n💡 .env 파일이 없습니다. env.example을 복사하여 .env 파일을 생성하세요:');
    console.log('  cp env.example .env');
    return false;
  }

  return true;
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  const checkFiles = args.includes('--check-files') || args.includes('-c');
  
  if (checkFiles) {
    checkEnvFiles();
  }
  
  validateEnvironmentVariables();
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateEnvironmentVariables, checkEnvFiles };
