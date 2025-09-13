/**
 * 인증 서비스 클래스
 * 사용자 인증을 통합 관리하며, 분리된 서비스들을 조합하여 사용합니다.
 */

import bcrypt from 'bcryptjs';
import { getPrisma } from '@editor/database';
import { TokenService } from './TokenService';
import { MFAService } from './MFAService';
import { SessionCacheService } from './SessionCacheService';
import { AuthEventLogger } from './AuthEventLogger';

const prisma = getPrisma();
import type {
  User,
  CreateUserData,
  LoginCredentials,
  AuthResult,
  UserRole,
} from '@editor/types';
import { AuthErrorCode, AuthError } from '@editor/types';

export class AuthService {
  private readonly tokenService: TokenService;
  private readonly mfaService: MFAService;
  private readonly cacheService: SessionCacheService;
  private readonly eventLogger: AuthEventLogger;

  constructor(jwtSecret?: string) {
    this.tokenService = new TokenService(jwtSecret);
    this.mfaService = new MFAService();
    this.cacheService = new SessionCacheService();
    this.eventLogger = new AuthEventLogger();
  }

  /**
   * 이메일/비밀번호로 사용자 인증 (캐시 활용)
   */
  async authenticateCredentials(
    credentials: LoginCredentials,
    ip?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    try {
      // 캐시에서 사용자 정보 확인 (이메일로 캐시 키 생성)
      let user = await this.cacheService.getCachedUser(credentials.email);

      if (!user) {
        // DB에서 사용자 조회
        user = await this.findUserByEmail(credentials.email);
        if (!user) {
          // 로그인 실패 로깅
          await this.eventLogger.logSuspiciousActivity(
            'unknown',
            ip,
            userAgent,
            {
              reason: 'Login attempt with non-existent email',
              email: credentials.email,
            }
          );

          throw new AuthError(
            AuthErrorCode.USER_NOT_FOUND,
            '사용자를 찾을 수 없습니다.'
          );
        }

        // 캐시에 저장
        await this.cacheService.cacheUser(user.id, this.sanitizeUser(user));
      }

      // 의심스러운 활동 감지
      const isSuspicious = await this.eventLogger.detectSuspiciousActivity(
        user.id,
        ip
      );
      if (isSuspicious) {
        throw new AuthError(
          AuthErrorCode.ACCOUNT_LOCKED,
          '보안상의 이유로 계정이 잠겼습니다. 관리자에게 문의하세요.'
        );
      }

      // 비밀번호 검증
      const isValidPassword = await this.verifyPassword(
        credentials.password,
        user.password
      );
      if (!isValidPassword) {
        // 잘못된 비밀번호 시도 로깅
        await this.eventLogger.logSuspiciousActivity(user.id, ip, userAgent, {
          reason: 'Invalid password attempt',
          email: credentials.email,
        });

        throw new AuthError(
          AuthErrorCode.INVALID_PASSWORD,
          '비밀번호가 올바르지 않습니다.'
        );
      }

      // MFA 검증 (활성화된 경우)
      if (user.mfaEnabled) {
        if (!credentials.mfaToken) {
          throw new AuthError(
            AuthErrorCode.MFA_REQUIRED,
            'MFA 토큰이 필요합니다.'
          );
        }

        const isMfaValid = this.mfaService.verifyMFA(
          user.mfaSecret!,
          credentials.mfaToken
        );
        if (!isMfaValid) {
          // 잘못된 MFA 토큰 시도 로깅
          await this.eventLogger.logSuspiciousActivity(user.id, ip, userAgent, {
            reason: 'Invalid MFA token attempt',
            email: credentials.email,
          });

          throw new AuthError(
            AuthErrorCode.INVALID_MFA_TOKEN,
            'MFA 토큰이 올바르지 않습니다.'
          );
        }
      }

      // 마지막 활동 시간 업데이트
      await this.updateUserLastActive(user.id);

      const sanitizedUser = this.sanitizeUser(user);

      // JWT 토큰 생성
      const token = await this.tokenService.generateJWT({
        userId: sanitizedUser.id,
        email: sanitizedUser.email,
        role: 'editor' as UserRole, // 기본 역할
      });

      const refreshToken = await this.tokenService.generateRefreshToken(
        sanitizedUser.id
      );

      // 세션 캐시 저장
      await this.cacheService.cacheSession(sanitizedUser.id, sanitizedUser);

      // 성공적인 로그인 로깅
      await this.eventLogger.logLogin(user.id, ip, userAgent, {
        email: credentials.email,
        mfaUsed: user.mfaEnabled,
        loginMethod: 'email_password',
      });

      return {
        user: sanitizedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('Authentication error:', error);
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        '인증 중 오류가 발생했습니다.',
        error
      );
    }
  }

  /**
   * 새 사용자 생성 (이메일/비밀번호)
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // 이메일 중복 확인
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new AuthError(
          AuthErrorCode.USER_ALREADY_EXISTS,
          '이미 존재하는 이메일입니다.'
        );
      }

      // 비밀번호 해싱
      const hashedPassword = userData.password
        ? await this.hashPassword(userData.password)
        : null;

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          provider: userData.provider,
          providerId: userData.providerId,
          avatarUrl: userData.avatar,
          mfaEnabled: false,
          emailVerified: userData.provider !== 'email' ? new Date() : null,
        },
      });

      return this.sanitizeUser(user);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('User creation error:', error);
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        '사용자 생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * OAuth 사용자 생성 또는 업데이트
   */
  async createOAuthUser(
    userData: Omit<CreateUserData, 'password'>
  ): Promise<User> {
    try {
      const existingUser = await this.findUserByEmail(userData.email);

      if (existingUser) {
        // 기존 사용자 정보 업데이트
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: userData.name,
            avatarUrl: userData.avatar,
            lastActiveAt: new Date(),
            emailVerified: new Date(),
          },
        });
        return this.sanitizeUser(updatedUser);
      }

      // 새 OAuth 사용자 생성
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          provider: userData.provider,
          providerId: userData.providerId,
          avatarUrl: userData.avatar,
          mfaEnabled: false,
          emailVerified: new Date(),
        },
      });

      return this.sanitizeUser(user);
    } catch (error) {
      console.error('OAuth user creation error:', error);
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        'OAuth 사용자 생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * JWT 토큰 생성 (TokenService 위임)
   */
  async generateJWT(payload: {
    userId: string;
    email: string;
    role: UserRole;
    workspaceId?: string;
  }): Promise<string> {
    return this.tokenService.generateJWT(payload);
  }

  /**
   * JWT 토큰 검증 (TokenService 위임)
   */
  async verifyJWT(token: string): Promise<any> {
    return this.tokenService.verifyJWT(token);
  }

  /**
   * 리프레시 토큰 생성 (TokenService 위임)
   */
  async generateRefreshToken(userId: string): Promise<string> {
    return this.tokenService.generateRefreshToken(userId);
  }

  /**
   * MFA 설정 생성 (MFAService 위임)
   */
  async setupMFA(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<any> {
    const result = await this.mfaService.setupMFA(userId);

    // MFA 설정 시작 로깅
    await this.eventLogger.logMfaSetup(userId, ip, userAgent, {
      action: 'setup_initiated',
    });

    return result;
  }

  /**
   * MFA 활성화 (MFAService 위임)
   */
  async enableMFA(
    userId: string,
    token: string,
    ip?: string,
    userAgent?: string
  ): Promise<boolean> {
    const result = await this.mfaService.enableMFA(userId, token);

    if (result) {
      // MFA 활성화 성공 로깅
      await this.eventLogger.logMfaSetup(userId, ip, userAgent, {
        action: 'setup_completed',
      });
    }

    return result;
  }

  /**
   * MFA 비활성화 (MFAService 위임)
   */
  async disableMFA(userId: string): Promise<boolean> {
    return this.mfaService.disableMFA(userId);
  }

  /**
   * MFA 토큰 검증 (MFAService 위임)
   */
  verifyMFA(secret: string, token: string): boolean {
    return this.mfaService.verifyMFA(secret, token);
  }

  /**
   * MFA 상태 확인 (MFAService 위임)
   */
  async getMFAStatus(userId: string): Promise<any> {
    return this.mfaService.getMFAStatus(userId);
  }

  /**
   * 비밀번호 해싱
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 비밀번호 검증
   */
  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 이메일로 사용자 찾기
   */
  async findUserByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ID로 사용자 찾기
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * 사용자 마지막 활동 시간 업데이트
   */
  async updateUserLastActive(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }

  /**
   * 사용자 활동 로깅
   */
  async logUserActivity(
    userId: string,
    activity: string,
    metadata?: any
  ): Promise<void> {
    try {
      // 사용자 활동 로그 저장 (필요시 별도 테이블 생성)
      console.log(`User ${userId} activity: ${activity}`, metadata);
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }

  /**
   * 사용자 정보 정제 (민감한 정보 제거)
   */
  private sanitizeUser(user: any): User {
    const {
      password: _password,
      mfaSecret: _mfaSecret,
      mfaBackupCodes: _mfaBackupCodes,
      avatarUrl,
      ...sanitized
    } = user;
    return {
      ...sanitized,
      avatar: avatarUrl, // avatarUrl을 avatar로 매핑
    };
  }

  /**
   * 비밀번호 재설정 토큰 생성 (TokenService 위임)
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        '사용자를 찾을 수 없습니다.'
      );
    }

    return this.tokenService.generatePasswordResetToken(user.id, email);
  }

  /**
   * 비밀번호 재설정 (TokenService 위임)
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const { userId } =
        await this.tokenService.verifyPasswordResetToken(token);

      const hashedPassword = await this.hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // 사용자 캐시 무효화
      await this.cacheService.invalidateUser(userId);

      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('Password reset error:', error);
      throw new AuthError(
        AuthErrorCode.PASSWORD_RESET_FAILED,
        '비밀번호 재설정에 실패했습니다.',
        error
      );
    }
  }
}
