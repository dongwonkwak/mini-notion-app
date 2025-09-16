
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import { describe, expect, it } from '@jest/globals';

describe('Monorepo Structure', () => {
  it('should have correct package.json structure', () => {
    const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

    expect(rootPackageJson.name).toBe('mini-notion-app');
    expect(rootPackageJson.private).toBe(true);
    expect(rootPackageJson.packageManager).toContain('pnpm');
    expect(rootPackageJson.scripts.dev).toBe('turbo run dev');
    expect(rootPackageJson.scripts.build).toBe('turbo run build');
    expect(rootPackageJson.scripts.test).toBe('turbo run test');
  });

  it('should have pnpm workspace configuration', () => {
    expect(existsSync('pnpm-workspace.yaml')).toBe(true);

    const workspaceConfig = readFileSync('pnpm-workspace.yaml', 'utf-8');
    expect(workspaceConfig).toContain('apps/*');
    expect(workspaceConfig).toContain('packages/*');
  });

  it('should have turbo configuration', () => {
    expect(existsSync('turbo.json')).toBe(true);

    const turboConfig = JSON.parse(readFileSync('turbo.json', 'utf-8'));

    expect(turboConfig.pipeline).toBeDefined();
    expect(turboConfig.pipeline.build).toBeDefined();
    expect(turboConfig.pipeline.dev).toBeDefined();
    expect(turboConfig.pipeline.test).toBeDefined();
    expect(turboConfig.pipeline.lint).toBeDefined();
  });

  it('should have all required apps directories', () => {
    const requiredApps = ['web', 'server', 'api'];

    requiredApps.forEach(app => {
      const appPath = path.join('apps', app);
      expect(existsSync(appPath)).toBe(true);
      expect(existsSync(path.join(appPath, 'package.json'))).toBe(true);
      expect(existsSync(path.join(appPath, 'tsconfig.json'))).toBe(true);
    });
  });

  it('should have all required packages directories', () => {
    const requiredPackages = [
      'ui',
      'editor',
      'collaboration',
      'auth',
      'database',
      'types',
      'ai',
      'config',
    ];

    requiredPackages.forEach(pkg => {
      const pkgPath = path.join('packages', pkg);
      expect(existsSync(pkgPath)).toBe(true);
      expect(existsSync(path.join(pkgPath, 'package.json'))).toBe(true);
    });
  });

  it('should have correct package naming convention', () => {
    const packages = [
      'ui',
      'editor',
      'collaboration',
      'auth',
      'database',
      'types',
      'ai',
    ];

    packages.forEach(pkg => {
      const packageJson = JSON.parse(
        readFileSync(path.join('packages', pkg, 'package.json'), 'utf-8')
      );

      expect(packageJson.name).toBe(`@editor/${pkg}`);
      expect(packageJson.private).toBe(true);
    });
  });

  it('should have proper TypeScript configuration inheritance', () => {
    // Base config should exist
    expect(existsSync('packages/config/tsconfig/base.json')).toBe(true);
    expect(existsSync('packages/config/tsconfig/nextjs.json')).toBe(true);
    expect(existsSync('packages/config/tsconfig/node.json')).toBe(true);

    // Root tsconfig should reference all projects
    const rootTsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'));

    expect(rootTsConfig.references).toBeDefined();
    expect(rootTsConfig.references.length).toBeGreaterThan(5);
  });

  it('should have development environment configuration', () => {
    expect(existsSync('.env.example')).toBe(true);
    expect(existsSync('docker-compose.yml')).toBe(true);
    expect(existsSync('.gitignore')).toBe(true);
    expect(existsSync('.eslintrc.js')).toBe(true);
    expect(existsSync('.prettierrc.js')).toBe(true);
  });

  it('should have setup script', () => {
    expect(existsSync('scripts/setup.sh')).toBe(true);

    // Check if script is executable
    const stats = require('fs').statSync('scripts/setup.sh');
    expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0);
  });
});

describe('Package Dependencies', () => {
  it('should have correct workspace dependencies', () => {
    const webPackageJson = JSON.parse(
      readFileSync('apps/web/package.json', 'utf-8')
    );

    expect(webPackageJson.dependencies['@editor/ui']).toBe('workspace:*');
    expect(webPackageJson.dependencies['@editor/editor']).toBe('workspace:*');
    expect(webPackageJson.dependencies['@editor/collaboration']).toBe(
      'workspace:*'
    );
  });

  it('should not have circular dependencies', () => {
    // This is a simplified check - in a real scenario, you'd use a tool like madge
    const packages = [
      'ui',
      'editor',
      'collaboration',
      'auth',
      'database',
      'types',
      'ai',
    ];

    packages.forEach(pkg => {
      const packageJson = JSON.parse(
        readFileSync(path.join('packages', pkg, 'package.json'), 'utf-8')
      );

      // Types package should not depend on other packages (except config)
      if (pkg === 'types') {
        const deps = packageJson.dependencies || {};
        const workspaceDeps = Object.keys(deps).filter(
          dep => dep.startsWith('@editor/') && dep !== '@editor/config'
        );
        expect(workspaceDeps).toHaveLength(0);
      }
    });
  });
});

describe('Build System', () => {
  it('should be able to run type checking', () => {
    expect(() => {
      execSync('pnpm type-check', { stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should be able to run linting', () => {
    expect(() => {
      execSync('pnpm eslint .', { stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should be able to generate Prisma client', () => {
    expect(() => {
      execSync('pnpm db:generate', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
