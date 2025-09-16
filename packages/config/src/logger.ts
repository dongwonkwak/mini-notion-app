/**
 * 로깅 시스템
 * console.log 사용 금지 규칙에 따라 구조화된 로깅을 제공합니다.
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private service: string;
  private logLevel: LogLevel;

  constructor(service: string = 'mini-notion-app') {
    this.service = service;
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    switch (envLevel) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return process.env.NODE_ENV === 'development'
          ? LogLevel.DEBUG
          : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      metadata,
    };
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // 테스트 환경에서는 로그 출력하지 않음
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // 개발 환경에서는 가독성 좋은 형식으로 출력
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
      const servicePrefix = entry.service ? `[${entry.service}]` : '';
      const metadataStr = entry.metadata
        ? ` ${JSON.stringify(entry.metadata)}`
        : '';

      // 개발 환경에서만 console.log 사용 허용

      console.log(`${prefix}${servicePrefix}: ${entry.message}${metadataStr}`);
    } else {
      // 프로덕션 환경에서는 JSON 형식으로 출력
      // 프로덕션에서는 적절한 로깅 시스템으로 대체해야 함

      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog(LogLevel.ERROR, message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog(LogLevel.WARN, message, metadata));
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog(LogLevel.INFO, message, metadata));
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog(LogLevel.DEBUG, message, metadata));
  }
}

// 기본 로거 인스턴스
export const logger = new Logger();

// 서비스별 로거 생성 함수
export function createLogger(service: string): Logger {
  return new Logger(service);
}
