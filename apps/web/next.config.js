/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma 클라이언트와의 호환성을 위한 설정
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { isServer }) => {
    // Prisma 클라이언트 관련 webpack 설정
    if (isServer) {
      config.externals.push('@prisma/client');
    }

    // Prisma 클라이언트 경로 해결
    config.resolve.alias = {
      ...config.resolve.alias,
      '.prisma/client': require.resolve('@prisma/client'),
    };

    return config;
  },
  // 환경 변수 설정
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
