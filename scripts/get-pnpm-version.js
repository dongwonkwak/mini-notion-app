#!/usr/bin/env node

/**
 * package.json의 packageManager 필드에서 pnpm 버전을 추출하는 스크립트
 * GitHub Actions에서 동적으로 pnpm 버전을 설정하기 위해 사용됩니다.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // package.json 파일 읽기
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  // packageManager 필드에서 pnpm 버전 추출
  const packageManager = packageJson.packageManager;

  if (!packageManager) {
    console.error('Error: packageManager field not found in package.json');
    process.exit(1);
  }

  // pnpm@버전 형태에서 버전만 추출
  const pnpmMatch = packageManager.match(/^pnpm@(.+)$/);

  if (!pnpmMatch) {
    console.error(`Error: Invalid packageManager format: ${packageManager}`);
    console.error('Expected format: pnpm@version');
    process.exit(1);
  }

  const pnpmVersion = pnpmMatch[1];

  // 버전 출력 (GitHub Actions에서 사용할 수 있도록)
  console.log(pnpmVersion);
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}
