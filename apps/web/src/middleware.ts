/**
 * Next.js 미들웨어
 * 보안 헤더, CORS, 인증 등을 처리합니다.
 */

import { NextRequest, NextResponse } from 'next/server';

import { config } from '@editor/config';

// Global 타입 확장
declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 보안 헤더 설정
  setSecurityHeaders(request, response);

  // CORS 설정
  setCorsHeaders(request, response);

  // Rate Limiting (간단한 구현)
  if (!checkRateLimit(request)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return response;
}

/**
 * 보안 헤더 설정
 */
function setSecurityHeaders(request: NextRequest, response: NextResponse) {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Type Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Frame Options
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (HTTPS에서만)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', ');

  response.headers.set('Permissions-Policy', permissionsPolicy);
}

/**
 * CORS 헤더 설정
 */
function setCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');

  if (origin && config.security.corsOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Preflight 요청 처리
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
}

/**
 * 간단한 Rate Limiting 구현
 */
function checkRateLimit(request: NextRequest): boolean {
  // 실제 구현에서는 Redis나 다른 저장소를 사용해야 합니다
  // 여기서는 간단한 메모리 기반 구현을 제공합니다

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // 메모리에 저장된 요청 기록 (실제로는 Redis 사용 권장)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const store = global.rateLimitStore as Map<string, number[]>;
  const requests = store.get(ip) || [];

  // 오래된 요청 제거
  const validRequests = requests.filter(
    timestamp => now - timestamp < config.security.rateLimitWindowMs
  );

  // 요청 수 확인
  if (validRequests.length >= config.security.rateLimitMaxRequests) {
    return false;
  }

  // 현재 요청 추가
  validRequests.push(now);
  store.set(ip, validRequests);

  return true;
}

export const middlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
