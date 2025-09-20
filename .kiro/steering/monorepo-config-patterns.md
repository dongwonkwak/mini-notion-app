# 모노레포 공통 설정 패턴

모노레포에서 공통 설정을 효율적으로 관리하기 위한 패턴과 가이드라인입니다.

## 핵심 원칙

### 1. 중앙화된 설정 관리
- **packages/config** 패키지에서 모든 공통 설정 관리
- 각 앱은 config 패키지를 의존성으로 추가하여 설정 상속
- 설정 변경 시 한 곳에서만 수정하면 전체 프로젝트에 적용

### 2. 루트 레벨 공통 도구 설치
- ESLint, TypeScript, Prettier 등 공통 개발 도구는 루트 package.json에 설치
- 각 앱에서 중복 설치하지 않음
- peerDependencies로 버전 호환성 관리

### 3. 환경별 설정 분리
- **base**: 공통 기본 설정
- **react**: 프론트엔드 앱용 설정
- **node**: 백엔드 앱용 설정

## 디렉토리 구조

```
packages/config/
├── package.json                 # config 패키지 정의
├── typescript/
│   ├── base.json               # 공통 TypeScript 설정
│   ├── react.json              # React 앱용 설정
│   └── node.json               # Node.js 앱용 설정
├── eslint/
│   ├── base.js                 # 공통 ESLint 설정
│   ├── react.js                # React 앱용 ESLint 설정
│   └── node.js                 # Node.js 앱용 ESLint 설정
├── prettier/
│   └── index.js                # Prettier 설정
└── vitest/
    └── base.js                 # Vitest 설정
```

## 설정 사용 방법

### TypeScript 설정 상속

**apps/web/tsconfig.json**
```json
{
  "extends": "@mini-notion/config/typescript/react",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### ESLint 설정 상속

**apps/web/eslint.config.js**
```javascript
import reactConfig from '@mini-notion/config/eslint/react'

export default reactConfig
```

### 패키지 의존성 설정

**apps/web/package.json**
```json
{
  "devDependencies": {
    "@mini-notion/config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

## 새 앱 추가 시 체크리스트

### 1. 의존성 추가
- [ ] `@mini-notion/config`를 devDependencies에 추가
- [ ] 앱별 특화 도구만 개별 설치 (Vite, NestJS 등)

### 2. 설정 파일 생성
- [ ] `tsconfig.json`에서 적절한 config 상속
- [ ] `eslint.config.js`에서 환경에 맞는 설정 import
- [ ] 필요시 `prettier.config.js` 생성

### 3. 스크립트 설정
- [ ] `lint`, `type-check`, `build` 스크립트 추가
- [ ] Turbo 설정에 새 앱 추가

## 설정 업데이트 가이드

### 공통 설정 변경
1. `packages/config`에서 설정 수정
2. 변경사항이 모든 앱에 자동 적용됨
3. 필요시 앱별 오버라이드 설정

### 앱별 특화 설정
1. 앱의 설정 파일에서 오버라이드
2. 공통 설정을 extends한 후 추가 설정 적용

## 주의사항

### 버전 호환성
- config 패키지의 peerDependencies와 루트의 devDependencies 버전 일치 필요
- 새 도구 추가 시 양쪽 모두 업데이트

### 설정 충돌 방지
- 앱별 설정에서 공통 설정과 충돌하는 규칙 주의
- 필요시 명시적으로 오버라이드하되 이유 문서화

### 성능 고려사항
- 너무 많은 설정을 한 번에 상속하면 빌드 시간 증가 가능
- 필요한 설정만 선택적으로 import

## 예시: 새 백엔드 앱 추가

```bash
# 1. 앱 디렉토리 생성
mkdir apps/api

# 2. package.json 생성
cat > apps/api/package.json << EOF
{
  "name": "@mini-notion/api",
  "devDependencies": {
    "@mini-notion/config": "workspace:*"
  }
}
EOF

# 3. TypeScript 설정
cat > apps/api/tsconfig.json << EOF
{
  "extends": "@mini-notion/config/typescript/node",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

# 4. ESLint 설정
cat > apps/api/eslint.config.js << EOF
import nodeConfig from '@mini-notion/config/eslint/node'
export default nodeConfig
EOF
```

이 패턴을 따르면 일관성 있고 유지보수하기 쉬운 모노레포 설정을 구축할 수 있습니다.