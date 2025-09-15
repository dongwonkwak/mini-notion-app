/**
 * NextAuth.js API 라우트
 * 모든 인증 관련 API 엔드포인트를 처리합니다.
 */
import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';


/**
 * NextAuth.js 핸들러
 * GET, POST 요청을 모두 처리합니다.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
