# 기술 부채 추적 가이드라인

## 개요

프로젝트 진행 중 빌드나 테스트 문제로 인해 임시로 비활성화하거나 수정한 코드들을 체계적으로 추적하여, 나중에 반드시 해결하도록 관리하는 가이드라인입니다.

## 🎯 목적

1. **기술 부채 가시화**: 임시 해결책들을 명확히 기록
2. **추후 작업 계획**: 언제, 어떻게 해결할지 계획 수립
3. **품질 유지**: 임시 해결책이 영구적이 되지 않도록 방지
4. **팀 공유**: 모든 팀원이 기술 부채 현황을 파악

## 📋 현재 기술 부채 목록

### 🧪 **테스트 관련 기술 부채**

#### 1. Database 패키지 테스트 비활성화 (태스크 1에서 발생)
**문제**: Prisma 스키마와 테스트 코드 불일치로 빌드 실패
**임시 해결**: TypeScript 빌드에서 테스트 파일 제외
```typescript
// packages/database/tsconfig.json
"exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/**/__tests__/**/*"]
```

**영향받는 파일들**:
- `packages/database/src/__tests__/migration-validation.test.ts`
- `packages/database/src/__tests__/query-performance.test.ts` 
- `packages/database/src/__tests__/schema-validation.test.ts`
- `packages/database/src/__tests__/prisma.test.ts`
- `packages/database/src/__tests__/seed.test.ts`

**해결 계획**: 
- **언제**: 태스크 2 (데이터베이스 스키마 설정) 시작 시 우선 해결
- **방법**: Prisma 스키마 완성 후 테스트 코드 수정 및 재활성화
- **연결 태스크**: 태스크 2에 "태스크 1 미완료 작업 해결" 섹션으로 명시됨
- **우선순위**: 🔴 High (핵심 기능 테스트)

#### 2. Jest Setup 파일 ES6 Import 문제
**문제**: `packages/database/jest.setup.js`에서 ES6 import 사용으로 Jest 실행 실패
**임시 해결**: 해당 테스트들 실행 제외
**해결 계획**: 
- **언제**: 태스크 2에서 Jest 설정 정리 시
- **방법**: CommonJS 형식으로 변경 또는 ES6 모듈 설정 추가
- **연결 태스크**: 태스크 2 "태스크 1 미완료 작업 해결" 섹션에 포함됨

### 🏗️ **빌드 관련 기술 부채**

#### 3. Prisma 파일 빌드 제외
**문제**: `prisma/seed.ts`에서 Node.js 타입 오류
**임시 해결**: Prisma 폴더를 TypeScript 빌드에서 제외
```typescript
// packages/database/tsconfig.json  
"exclude": [..., "prisma/**/*"]
```
**해결 계획**:
- **언제**: 태스크 2에서 데이터베이스 설정 시
- **방법**: 적절한 TypeScript 설정 및 타입 추가
- **연결 태스크**: 태스크 2 "태스크 1 미완료 작업 해결" 섹션에 포함됨

## 🔧 기술 부채 관리 프로세스

### 1. **기술 부채 발생 시 기록 방법**

```markdown
#### N. [문제 제목] (발생 태스크)
**문제**: [구체적인 문제 설명]
**임시 해결**: [적용한 임시 해결책]
**영향받는 파일들**: 
- 파일1
- 파일2
**해결 계획**:
- **언제**: [해결 예정 시점]
- **방법**: [해결 방법]
- **우선순위**: 🔴/🟡/🟢 [High/Medium/Low]
```

### 2. **우선순위 기준**

- 🔴 **High**: 핵심 기능에 영향, 보안 문제, 성능 저하
- 🟡 **Medium**: 개발 효율성 저하, 코드 품질 문제
- 🟢 **Low**: 코드 정리, 문서화, 최적화

### 3. **해결 추적**

```markdown
#### ✅ [해결 완료] N. [문제 제목]
**해결 일시**: 2024-XX-XX
**해결 방법**: [실제 적용한 해결책]
**관련 커밋**: [커밋 해시]
```

## 🚨 자동화 도구

### 1. **기술 부채 스캔 스크립트**

```bash
#!/bin/bash
# scripts/scan-technical-debt.sh

echo "🔍 기술 부채 스캔 시작..."

# TODO 주석 검색
echo "📝 TODO 주석:"
grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" --include="*.js" src/ apps/ packages/

# 임시 해결책 검색  
echo "⚠️ 임시 해결책:"
grep -r "임시\|temporary\|temp\|workaround" --include="*.ts" --include="*.tsx" src/ apps/ packages/

# 비활성화된 테스트 검색
echo "🧪 비활성화된 테스트:"
grep -r "skip\|xit\|xdescribe" --include="*.test.ts" --include="*.spec.ts" src/ apps/ packages/

echo "✅ 기술 부채 스캔 완료"
```

### 2. **Agent Hook 연동**

```json
{
  "name": "technical-debt-check",
  "description": "기술 부채 현황 확인 및 알림",
  "trigger": "manual",
  "actions": [
    "./scripts/scan-technical-debt.sh",
    "기술 부채 문서 업데이트 확인",
    "해결 예정 일정 리마인드"
  ]
}
```

### 3. **PR 체크리스트에 포함**

```markdown
## PR 체크리스트
- [ ] 새로운 기술 부채가 발생했다면 `technical-debt-tracking.md`에 기록
- [ ] 기존 기술 부채를 해결했다면 문서에서 완료 표시
- [ ] 임시 해결책 사용 시 TODO 주석과 함께 해결 계획 명시
```

## 📊 정기 리뷰

### 주간 리뷰 (매주 금요일)
- [ ] 새로 발생한 기술 부채 검토
- [ ] 해결 예정 일정 확인
- [ ] 우선순위 재조정

### 스프린트 리뷰 (2주마다)
- [ ] High 우선순위 기술 부채 해결 계획 수립
- [ ] 기술 부채 해결을 위한 태스크 생성
- [ ] 팀 전체 기술 부채 현황 공유

## 🎯 목표 지표

- **기술 부채 해결률**: 월 80% 이상
- **High 우선순위 부채**: 2주 이내 해결
- **Medium 우선순위 부채**: 1개월 이내 해결
- **새 기술 부채 발생률**: 주당 3개 이하

## 📚 베스트 프랙티스

### 1. **예방적 접근**
- 새 기능 개발 시 충분한 설계 검토
- 테스트 우선 개발 (TDD) 적용
- 코드 리뷰에서 기술 부채 가능성 검토

### 2. **투명한 소통**
- 기술 부채 발생 시 즉시 팀 공유
- 해결 불가능한 경우 대안 논의
- 정기적인 기술 부채 현황 보고

### 3. **점진적 개선**
- 큰 기술 부채는 작은 단위로 분할
- 새 기능 개발과 함께 기존 부채 해결
- 리팩토링 시간을 정기적으로 확보

---

**중요**: 기술 부채는 프로젝트의 자연스러운 부분이지만, 체계적으로 관리하지 않으면 개발 속도와 품질에 심각한 영향을 미칩니다. 모든 팀원이 이 가이드라인을 따라 투명하게 기술 부채를 관리해야 합니다.