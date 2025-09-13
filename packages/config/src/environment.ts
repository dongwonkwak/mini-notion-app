/**
 * 환경별 설정 관리
 * 개발, 스테이징, 프로덕션 환경에 따른 설정을 관리합니다.
 */

export interface EnvironmentConfig {
  // Database
  database: {
    url: string;
    provider: 'sqlite' | 'postgresql';
  };

  // Authentication
  auth: {
    nextAuthUrl: string;
    nextAuthSecret: string;
    jwtSecret: string;
    encryptionKey: string;
  };

  // OAuth Providers
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
    github: {
      clientId: string;
      clientSecret: string;
    };
  };

  // Redis
  redis: {
    url: string;
    enabled: boolean;
  };

  // Security
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    corsOrigins: string[];
  };

  // File Upload
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };

  // Monitoring
  monitoring: {
    sentryDsn?: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // Feature Flags
  features: {
    enableMfa: boolean;
    enableAnalytics: boolean;
    enableDebugMode: boolean;
  };
}

export type Environment = 'development' | 'staging' | 'production';

/**
 * 환경 변수에서 설정을 로드합니다.
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV as Environment) || 'development';

  return {
    database: {
      url: process.env.DATABASE_URL || 'sqlite:./dev.db',
      provider: process.env.DATABASE_URL?.startsWith('postgresql')
        ? 'postgresql'
        : 'sqlite',
    },

    auth: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      nextAuthSecret: process.env.NEXTAUTH_SECRET || 'development-secret',
      jwtSecret: process.env.JWT_SECRET || 'development-jwt-secret',
      encryptionKey: process.env.ENCRYPTION_KEY || 'development-encryption-key',
    },

    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      },
    },

    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      enabled: !!process.env.REDIS_URL,
    },

    security: {
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMaxRequests: parseInt(
        process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      ),
      corsOrigins: getCorsOrigins(nodeEnv),
    },

    upload: {
      maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'),
      allowedTypes: (
        process.env.ALLOWED_FILE_TYPES ||
        'image/jpeg,image/png,image/gif,application/pdf'
      ).split(','),
    },

    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
    },

    features: {
      enableMfa: process.env.ENABLE_MFA === 'true',
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      enableDebugMode:
        process.env.ENABLE_DEBUG_MODE === 'true' || nodeEnv === 'development',
    },
  };
}

/**
 * 환경에 따른 CORS Origins를 반환합니다.
 */
function getCorsOrigins(env: Environment): string[] {
  switch (env) {
    case 'development':
      return ['http://localhost:3000', 'http://localhost:3001'];
    case 'staging':
      return ['https://staging.mini-notion.app'];
    case 'production':
      return ['https://mini-notion.app'];
    default:
      return ['http://localhost:3000'];
  }
}

/**
 * 환경별 설정 검증
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): void {
  const errors: string[] = [];

  // 필수 환경 변수 검증
  if (
    !config.auth.nextAuthSecret ||
    config.auth.nextAuthSecret === 'development-secret'
  ) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('NEXTAUTH_SECRET must be set in production');
    }
  }

  if (
    !config.auth.jwtSecret ||
    config.auth.jwtSecret === 'development-jwt-secret'
  ) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET must be set in production');
    }
  }

  if (
    !config.auth.encryptionKey ||
    config.auth.encryptionKey === 'development-encryption-key'
  ) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('ENCRYPTION_KEY must be set in production');
    }
  }

  // 데이터베이스 URL 검증
  if (!config.database.url) {
    errors.push('DATABASE_URL must be set');
  }

  // 프로덕션 환경에서 PostgreSQL 사용 검증
  if (
    process.env.NODE_ENV === 'production' &&
    config.database.provider !== 'postgresql'
  ) {
    errors.push('PostgreSQL must be used in production environment');
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
  }
}

/**
 * 환경별 설정 인스턴스
 */
export const config = loadEnvironmentConfig();

// 프로덕션 환경에서 설정 검증
if (process.env.NODE_ENV === 'production') {
  validateEnvironmentConfig(config);
}
