# 개선사항 관리 시스템

> **목적**: 프로젝트의 지속적인 개선을 위한 기술 부채와 개선사항을 체계적으로 관리합니다.

## 📁 구조

```
docs/improvements/
├── README.md              # 이 파일
├── template.yaml          # 새 문서 생성용 템플릿
├── 2024-12-19.yaml       # 오늘의 개선사항
├── 2024-12-20.yaml       # 내일의 개선사항
└── ...                   # 날짜별 문서들
```

## 🚀 사용법

### 1. 새 개선사항 문서 생성

```bash
# 템플릿 복사
cp docs/improvements/template.yaml docs/improvements/$(date +%Y-%m-%d).yaml

# 또는 직접 생성
touch docs/improvements/2024-12-20.yaml
```

### 2. 개선사항 추가

각 YAML 파일에는 다음 정보가 포함됩니다:

- **id**: 고유 식별자 (IMP-001, IMP-002, ...)
- **title**: 개선사항 제목
- **scope**: 영향받는 범위
- **priority**: 우선순위 (critical, high, medium, low)
- **estimated_hours**: 예상 소요시간
- **context**: 배경 및 필요성
- **commands**: 실행할 명령어들
- **acceptance_criteria**: 완료 기준
- **assignee**: 담당자
- **status**: 진행 상태

### 3. 우선순위 분류

- **🔴 Critical**: 즉시 해결 필요 (보안, 안정성)
- **🟡 High**: 단기 내 해결 권장 (성능, 사용성)
- **🟢 Medium**: 중기 계획 (기능 개선, 코드 품질)
- **🔵 Low**: 장기 계획 (리팩토링, 최적화)

## 📊 진행 상황 추적

### 상태 관리

- **pending**: 대기 중
- **in_progress**: 진행 중
- **completed**: 완료
- **cancelled**: 취소됨

### 담당자 역할

- **devops**: 인프라, 배포, 모니터링
- **frontend**: UI/UX, 클라이언트 사이드
- **backend**: API, 서버 로직, 데이터베이스
- **qa**: 테스트, 품질 보증
- **full-stack**: 전체 스택 관련

## 🔧 유틸리티 스크립트

### 개선사항 요약 생성

```bash
# 모든 개선사항 요약
find docs/improvements -name "*.yaml" -not -name "template.yaml" | xargs grep -l "date:" | sort
```

### 진행률 계산

```bash
# 완료된 항목 수 계산
grep -r "status: completed" docs/improvements/ | wc -l

# 전체 항목 수 계산
grep -r "id: IMP-" docs/improvements/ | wc -l
```

### 담당자별 작업량

```bash
# 특정 담당자의 작업량 확인
grep -r "assignee: backend" docs/improvements/ | wc -l
```

## 📅 정기 검토

### 주간 검토 (매주 금요일)

1. **완료된 항목 체크**
2. **새로운 개선사항 추가**
3. **우선순위 재조정**
4. **예상 소요시간 업데이트**

### 월간 검토 (매월 마지막 주)

1. **전체 진행률 분석**
2. **기술 부채 현황 파악**
3. **다음 달 계획 수립**
4. **리소스 배분 조정**

## 🎯 모범 사례

### 1. 명확한 제목 작성

```yaml
# 좋은 예
title: "Redis 연결 풀링 최적화"

# 나쁜 예
title: "Redis 개선"
```

### 2. 구체적인 완료 기준

```yaml
# 좋은 예
acceptance_criteria:
  - "Redis 연결 안정성 테스트 통과"
  - "성능 벤치마크 기준 달성"
  - "연결 풀링 설정 완료"

# 나쁜 예
acceptance_criteria:
  - "Redis 개선 완료"
```

### 3. 실행 가능한 명령어

```yaml
# 좋은 예
commands:
  - "pnpm --filter packages/database test"
  - "pnpm run redis:health-check"
  - "pnpm run redis:benchmark"

# 나쁜 예
commands:
  - "Redis 테스트"
```

## 🔗 관련 문서

- [개발 가이드](../development/)
- [API 문서](../api/)
- [보안 정책](../auth/security-policies.md)

## 📝 참고사항

- 각 개선사항은 별도의 이슈로 생성하여 추적
- 완료된 항목은 체크리스트에서 제거하지 않고 상태만 변경
- 새로운 기술 부채 발견 시 즉시 추가
- 팀 회의에서 우선순위 재검토

---

**문서 관리자**: 개발팀 리드  
**최종 업데이트**: 2024-12-19  
**다음 검토일**: 2024-12-26
