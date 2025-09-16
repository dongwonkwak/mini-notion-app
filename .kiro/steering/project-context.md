---
inclusion: always
---

# 프로젝트 컨텍스트

## 프로젝트 개요

- **이름**: mini-notion-app
- **목적**: Y.js, Tiptap, Hocuspocus를 활용한 실시간 협업 에디터
- **아키텍처**: Turbo 모노레포 + Next.js + Node.js

## 핵심 기술 스택

- **Frontend**: React/Next.js, Tiptap, Y.js, TailwindCSS
- **Backend**: Node.js, Hocuspocus, Express.js
- **Database**: PostgreSQL (운영), SQLite (개발)
- **Cache**: Redis
- **Storage**: AWS S3 (또는 MinIO)
- **Authentication**: NextAuth.js (OAuth + JWT)
- **AI**: OpenAI GPT-4
- **Monorepo**: Turbo + pnpm workspace

## 패키지 구조

```
mini-notion-app/
├── apps/
│   ├── web/          # Next.js 클라이언트
│   ├── server/       # Hocuspocus 서버
│   └── api/          # REST API 서버
├── packages/
│   ├── ui/           # 공통 UI 컴포넌트
│   ├── editor/       # Tiptap 에디터 로직
│   ├── collaboration/# Y.js 협업 로직
│   ├── auth/         # 인증 관련 유틸리티
│   ├── database/     # DB 스키마 & 쿼리
│   ├── types/        # TypeScript 타입 정의
│   ├── ai/           # AI 문서 생성 기능
│   └── config/       # 공통 설정
```

## 개발 환경

- **Node.js**: 18+
- **Package Manager**: pnpm
- **Database**: SQLite (개발), PostgreSQL (운영)
- **Container**: Docker Compose (Redis, MinIO, Mailhog)
- **Code Quality**: ESLint (직접 실행), Prettier, TypeScript

## 현재 상태

프로젝트 초기 설정 단계 - 요구사항, 설계, 구현 계획 완료
