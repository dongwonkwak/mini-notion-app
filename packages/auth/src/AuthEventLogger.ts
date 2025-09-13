/**
 * 인증 이벤트 로깅 시스템
 * 사용자의 인증 관련 활동을 추적하고 로깅합니다.
 */

import { getPrisma } from '@editor/database';

export interface AuthEvent {
  type:
    | 'LOGIN'
    | 'LOGOUT'
    | 'MFA_SETUP'
    | 'PASSWORD_RESET'
    | 'ACCOUNT_LOCKED'
    | 'SUSPICIOUS_ACTIVITY';
  userId: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuthEventFilter {
  userId?: string;
  type?: AuthEvent['type'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuthEventLogger {
  private prisma: ReturnType<typeof getPrisma>;

  constructor(prisma?: ReturnType<typeof getPrisma>) {
    this.prisma = prisma || getPrisma();
  }

  /**
   * 인증 이벤트 로깅
   */
  async logEvent(event: Omit<AuthEvent, 'timestamp'>): Promise<void> {
    try {
      // authEvent 테이블이 존재하지 않을 수 있으므로 안전하게 처리
      if (this.prisma.authEvent) {
        await this.prisma.authEvent.create({
          data: {
            type: event.type,
            userId: event.userId,
            timestamp: new Date(),
            ip: event.ip,
            userAgent: event.userAgent,
            metadata: event.metadata || {},
          },
        });
      } else {
        // 테이블이 없으면 콘솔에 로깅
        console.log('Auth Event:', {
          type: event.type,
          userId: event.userId,
          timestamp: new Date(),
          ip: event.ip,
          userAgent: event.userAgent,
          metadata: event.metadata,
        });
      }

      // 실시간 알림 (선택적)
      await this.handleRealTimeNotification(event);
    } catch (error) {
      console.error('Failed to log auth event:', error);
      // 로깅 실패가 애플리케이션 동작을 방해하지 않도록 에러를 던지지 않음
    }
  }

  /**
   * 로그인 이벤트 로깅
   */
  async logLogin(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'LOGIN',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        loginTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 로그아웃 이벤트 로깅
   */
  async logLogout(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'LOGOUT',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        logoutTime: new Date().toISOString(),
      },
    });
  }

  /**
   * MFA 설정 이벤트 로깅
   */
  async logMfaSetup(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'MFA_SETUP',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        setupTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 비밀번호 재설정 이벤트 로깅
   */
  async logPasswordReset(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'PASSWORD_RESET',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        resetTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 계정 잠금 이벤트 로깅
   */
  async logAccountLocked(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'ACCOUNT_LOCKED',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        lockedTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 의심스러운 활동 이벤트 로깅
   */
  async logSuspiciousActivity(
    userId: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        detectedTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 인증 이벤트 조회
   */
  async getEvents(filter: AuthEventFilter = {}): Promise<AuthEvent[]> {
    try {
      if (!this.prisma.authEvent) {
        return [];
      }

      const where: any = {};

      if (filter.userId) {
        where.userId = filter.userId;
      }

      if (filter.type) {
        where.type = filter.type;
      }

      if (filter.startDate || filter.endDate) {
        where.timestamp = {};
        if (filter.startDate) {
          where.timestamp.gte = filter.startDate;
        }
        if (filter.endDate) {
          where.timestamp.lte = filter.endDate;
        }
      }

      const events = await this.prisma.authEvent.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: filter.limit || 100,
        skip: filter.offset || 0,
      });

      return events.map(event => ({
        type: event.type as AuthEvent['type'],
        userId: event.userId,
        timestamp: event.timestamp,
        ip: event.ip || undefined,
        userAgent: event.userAgent || undefined,
        metadata: (event.metadata as Record<string, any>) || undefined,
      }));
    } catch (error) {
      console.error('Failed to get auth events:', error);
      return [];
    }
  }

  /**
   * 사용자별 최근 로그인 조회
   */
  async getRecentLogins(
    userId: string,
    limit: number = 10
  ): Promise<AuthEvent[]> {
    return this.getEvents({
      userId,
      type: 'LOGIN',
      limit,
    });
  }

  /**
   * 의심스러운 활동 감지
   */
  async detectSuspiciousActivity(
    userId: string,
    ip?: string
  ): Promise<boolean> {
    try {
      const recentEvents = await this.getEvents({
        userId,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 최근 24시간
        limit: 100,
      });

      // 1. 여러 IP에서 로그인 시도
      const uniqueIPs = new Set(
        recentEvents
          .filter(event => event.type === 'LOGIN' && event.ip)
          .map(event => event.ip)
      );

      if (uniqueIPs.size > 3) {
        await this.logSuspiciousActivity(userId, ip, undefined, {
          reason: 'Multiple IP addresses',
          ipCount: uniqueIPs.size,
          ips: Array.from(uniqueIPs),
        });
        return true;
      }

      // 2. 짧은 시간 내 반복 로그인 시도
      const loginEvents = recentEvents.filter(event => event.type === 'LOGIN');
      if (loginEvents.length > 10) {
        await this.logSuspiciousActivity(userId, ip, undefined, {
          reason: 'Frequent login attempts',
          attemptCount: loginEvents.length,
        });
        return true;
      }

      // 3. 비정상적인 시간대 로그인
      const now = new Date();
      const hour = now.getHours();
      if (hour < 6 || hour > 23) {
        const nightLogins = recentEvents.filter(event => {
          const eventHour = event.timestamp.getHours();
          return event.type === 'LOGIN' && (eventHour < 6 || eventHour > 23);
        });

        if (nightLogins.length > 2) {
          await this.logSuspiciousActivity(userId, ip, undefined, {
            reason: 'Unusual time login',
            nightLoginCount: nightLogins.length,
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return false;
    }
  }

  /**
   * 보안 통계 생성
   */
  async getSecurityStats(
    userId?: string,
    days: number = 30
  ): Promise<{
    totalLogins: number;
    uniqueIPs: number;
    mfaSetupCount: number;
    passwordResetCount: number;
    suspiciousActivityCount: number;
    accountLockedCount: number;
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.getEvents({
      userId,
      startDate,
      limit: 10000,
    });

    const logins = events.filter(e => e.type === 'LOGIN');
    const uniqueIPs = new Set(logins.map(e => e.ip).filter(Boolean));
    const mfaSetups = events.filter(e => e.type === 'MFA_SETUP');
    const passwordResets = events.filter(e => e.type === 'PASSWORD_RESET');
    const suspiciousActivities = events.filter(
      e => e.type === 'SUSPICIOUS_ACTIVITY'
    );
    const accountLocked = events.filter(e => e.type === 'ACCOUNT_LOCKED');

    return {
      totalLogins: logins.length,
      uniqueIPs: uniqueIPs.size,
      mfaSetupCount: mfaSetups.length,
      passwordResetCount: passwordResets.length,
      suspiciousActivityCount: suspiciousActivities.length,
      accountLockedCount: accountLocked.length,
    };
  }

  /**
   * 실시간 알림 처리
   */
  private async handleRealTimeNotification(
    event: Omit<AuthEvent, 'timestamp'>
  ): Promise<void> {
    // 의심스러운 활동이나 계정 잠금 시 즉시 알림
    if (
      event.type === 'SUSPICIOUS_ACTIVITY' ||
      event.type === 'ACCOUNT_LOCKED'
    ) {
      // 여기서 이메일, SMS, 푸시 알림 등을 보낼 수 있습니다
      console.log(`Security alert: ${event.type} for user ${event.userId}`);

      // 실제 구현에서는 알림 서비스를 호출
      // await notificationService.sendSecurityAlert(event);
    }
  }

  /**
   * 오래된 로그 정리
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.prisma.authEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
