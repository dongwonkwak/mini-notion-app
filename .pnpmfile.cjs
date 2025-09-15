/**
 * PNPM 패키지 설치 후킹 파일
 * 허용된 패키지만 설치할 수 있도록 제어합니다.
 */

// 허용된 패키지 목록 (정확한 패키지명)
const ALLOWED_PACKAGES = new Set([
  // 현재 기존 허용 패키지들
  '@prisma/client',
  '@prisma/engines',
  'core-js-pure',
  'esbuild',
  'prisma',
  'sharp',
  'unrs-resolver',

  // 프레임워크 및 런타임
  'react',
  'react-dom',
  'next',
  'typescript',

  // 에디터 관련
  'yjs',
  'y-protocols',

  // 인증 관련
  'bcryptjs',
  'jsonwebtoken',
  'next-auth',
  'qrcode',
  'speakeasy',

  // 데이터베이스
  'ioredis',

  // 개발 도구
  'eslint',
  'jest',
  'turbo',
  'husky',
  'lint-staged',
  'prettier',
  'ts-jest',
  'tsx',
  'chalk',
  'playwright',
  'identity-obj-proxy',
  'jest-environment-jsdom',
  'jest-transform-stub',
  'eslint-import-resolver-typescript',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-config-next',
]);

// 허용된 스코프 (조직 패키지)
const ALLOWED_SCOPES = new Set([
  '@prisma',
  '@tiptap',
  '@hocuspocus',
  '@next-auth',
  '@types',
  '@eslint',
  '@typescript-eslint',
  '@next',
  '@jest',
  '@commitlint',
  '@turbo',
  '@testing-library',
  '@playwright',
  '@trivago',
  '@editor', // 내부 워크스페이스 패키지들
]);

// 개발 의존성에서만 허용되는 패키지들
const DEV_ONLY_PACKAGES = new Set([
  'eslint',
  'jest',
  'turbo',
  'husky',
  'lint-staged',
  'prettier',
  'ts-jest',
  'tsx',
  'chalk',
  'playwright',
  'identity-obj-proxy',
  'jest-environment-jsdom',
  'jest-transform-stub',
  'eslint-import-resolver-typescript',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-config-next',
]);

// 패키지명에서 스코프 추출
function getScope(packageName) {
  if (packageName.startsWith('@')) {
    return packageName.split('/')[0];
  }
  return null;
}

// 패키지가 허용되는지 확인
function isPackageAllowed(packageName, isDev = false) {
  // 스코프가 있는 패키지 확인
  const scope = getScope(packageName);
  if (scope && ALLOWED_SCOPES.has(scope)) {
    return true;
  }

  // 정확한 패키지명 확인
  if (ALLOWED_PACKAGES.has(packageName)) {
    return true;
  }

  // 개발 의존성 전용 패키지 확인
  if (isDev && DEV_ONLY_PACKAGES.has(packageName)) {
    return true;
  }

  return false;
}

// 금지된 패키지들 (보안상 위험하거나 불필요한 패키지)
const FORBIDDEN_PACKAGES = new Set([
  // 지정된 패키지 외에는 모두 금지
]);

// 패키지가 금지되어 있는지 확인
function isForbiddenPackage(packageName) {
  return FORBIDDEN_PACKAGES.has(packageName);
}

module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // 패키지 설치 전 검증
      const packageName = pkg.name;

      // 금지된 패키지 체크
      if (isForbiddenPackage(packageName)) {
        throw new Error(
          `❌ 금지된 패키지: ${packageName} - 보안상 위험하여 설치할 수 없습니다.`
        );
      }

      // 의존성 검증
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(depName => {
          if (isForbiddenPackage(depName)) {
            console.warn(
              `⚠️  ${packageName}이 금지된 의존성 ${depName}을 포함하고 있습니다.`
            );
            delete pkg.dependencies[depName];
          } else if (!isPackageAllowed(depName, false)) {
            console.warn(
              `⚠️  ${packageName}의 의존성 ${depName}이 허용 목록에 없습니다.`
            );
            // 허용되지 않은 패키지는 삭제
            delete pkg.dependencies[depName];
          }
        });
      }

      // 개발 의존성 검증
      if (pkg.devDependencies) {
        Object.keys(pkg.devDependencies).forEach(depName => {
          if (isForbiddenPackage(depName)) {
            console.warn(
              `⚠️  ${packageName}이 금지된 개발 의존성 ${depName}을 포함하고 있습니다.`
            );
            delete pkg.devDependencies[depName];
          } else if (!isPackageAllowed(depName, true)) {
            console.warn(
              `⚠️  ${packageName}의 개발 의존성 ${depName}이 허용 목록에 없습니다.`
            );
            // 허용되지 않은 패키지는 삭제
            delete pkg.devDependencies[depName];
          }
        });
      }

      return pkg;
    },

    afterAllResolved(lockfile, context) {
      // 모든 의존성 해결 후 실행
      console.log('📦 패키지 의존성 해결 완료');

      // 설치된 패키지 검증
      const installedPackages = Object.keys(lockfile.packages || {});
      const unauthorizedPackages = installedPackages.filter(pkgPath => {
        // lockfile의 패키지 경로에서 실제 패키지명 추출
        const packageName = pkgPath.split('/').pop();
        return (
          !isPackageAllowed(packageName, true) &&
          !isForbiddenPackage(packageName)
        );
      });

      if (unauthorizedPackages.length > 0) {
        console.warn('⚠️  다음 패키지들이 허용 목록에 없습니다:');
        unauthorizedPackages.forEach(pkg => console.warn(`   - ${pkg}`));
        console.warn(
          '필요시 .pnpmfile.cjs의 ALLOWED_PACKAGES 또는 ALLOWED_SCOPES에 추가하세요.'
        );
      }

      return lockfile;
    },
  },
};
