/**
 * NextAuth.js 설정 파일
 * 다중 프로바이더 인증 및 JWT 토큰 관리를 구현합니다.
 */
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { AuthService } from '@editor/auth';
import { getPrisma } from '@editor/database';

const authService = new AuthService();

/**
 * NextAuth.js 설정
 * 이메일/비밀번호, Google OAuth, GitHub OAuth 지원
 */
const prisma = getPrisma();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 이메일/비밀번호 인증
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaToken: { label: 'MFA Token', type: 'text', optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        try {
          const result = await authService.authenticateCredentials({
            email: credentials.email,
            password: credentials.password,
            mfaToken: credentials.mfaToken,
          });

          if (result.success && result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              image: result.user.avatar,
              provider: result.user.provider,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('인증에 실패했습니다.');
        }
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 업데이트
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  callbacks: {
    /**
     * JWT 토큰 생성 및 갱신 콜백
     */
    async jwt({ token, user, account, trigger }) {
      // 초기 로그인 시
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account?.provider || 'credentials';
      }

      // 토큰 갱신 시 사용자 정보 업데이트
      if (trigger === 'update' && token.userId) {
        const updatedUser = await authService.getUserById(
          token.userId as string
        );
        if (updatedUser) {
          token.name = updatedUser.name;
          token.picture = updatedUser.avatar;
          token.email = updatedUser.email;
        }
      }

      return token;
    },

    /**
     * 세션 객체 생성 콜백
     */
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.userId as string,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string,
        };
        session.accessToken = token.accessToken as string;
      }

      return session;
    },

    /**
     * OAuth 로그인 시 계정 연결 콜백
     */
    async signIn({ user, account }) {
      try {
        // OAuth 로그인 시 사용자 생성 또는 업데이트
        if (account?.provider !== 'credentials' && account) {
          const existingUser = await authService.findUserByEmail(user.email!);

          if (!existingUser) {
            // 새 사용자 생성
            await authService.createOAuthUser({
              email: user.email!,
              name: user.name!,
              provider: account.provider as 'google' | 'github',
              providerId: account.providerAccountId,
              avatar: user.image,
            });
          } else {
            // 기존 사용자 정보 업데이트
            await authService.updateUserLastActive(existingUser.id);
          }
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },

    /**
     * 리다이렉트 URL 제어
     */
    async redirect({ url, baseUrl }) {
      // 같은 도메인 내에서만 리다이렉트 허용
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);

      // 로그인 이벤트 로깅
      if (user.id) {
        await authService.logUserActivity(user.id, 'signin', {
          provider: account?.provider,
          isNewUser,
        });
      }
    },

    async signOut({ token }) {
      console.log(`User ${token?.email} signed out`);

      // 로그아웃 이벤트 로깅
      if (token?.userId) {
        await authService.logUserActivity(token.userId as string, 'signout');
      }
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },

    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`);
    },

    async linkAccount({ user, account }) {
      console.log(`Account ${account.provider} linked to user ${user.email}`);
    },

    async session({ token }) {
      // 세션 활성화 시 마지막 활동 시간 업데이트
      if (token?.userId) {
        await authService.updateUserLastActive(token.userId as string);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET,

  // CSRF 보호 설정
  useSecureCookies: process.env.NODE_ENV === 'production',

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

/**
 * NextAuth.js 타입 확장
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    provider?: string;
    accessToken?: string;
  }
}
