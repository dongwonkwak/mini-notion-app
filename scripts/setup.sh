#!/bin/bash

echo "🚀 Mini Notion App 개발 환경 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. pnpm 설치 확인
print_step "pnpm 설치 확인 중..."
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm이 설치되어 있지 않습니다. 설치를 진행합니다..."
    npm install -g pnpm
    print_success "pnpm 설치 완료"
else
    print_success "pnpm이 이미 설치되어 있습니다"
fi

# 2. Docker 설치 확인
print_step "Docker 설치 확인 중..."
if ! command -v docker &> /dev/null; then
    print_error "Docker가 설치되어 있지 않습니다. Docker를 먼저 설치해주세요."
    echo "Docker 설치: https://docs.docker.com/get-docker/"
    exit 1
else
    print_success "Docker가 설치되어 있습니다"
fi

# 3. 환경 변수 파일 생성
print_step "환경 변수 파일 설정 중..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success ".env 파일이 생성되었습니다"
    print_warning "필요한 환경 변수 값을 .env 파일에서 설정해주세요"
else
    print_success ".env 파일이 이미 존재합니다"
fi

# 4. 의존성 설치
print_step "의존성 설치 중..."
pnpm install
print_success "의존성 설치 완료"

# 5. Docker 서비스 시작
print_step "Docker 서비스 시작 중..."
docker-compose up -d
print_success "Docker 서비스 시작 완료"

# 6. 데이터베이스 설정
print_step "데이터베이스 설정 중..."
cd packages/database
pnpm db:generate
pnpm db:push
print_success "데이터베이스 설정 완료"

# 7. 테스트 데이터 시딩
print_step "테스트 데이터 시딩 중..."
pnpm db:seed
print_success "테스트 데이터 시딩 완료"

cd ../..

echo ""
echo "🎉 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. .env 파일에서 필요한 환경 변수를 설정하세요"
echo "2. 개발 서버를 시작하려면: pnpm dev"
echo ""
echo "🔗 유용한 링크:"
echo "- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo "- MailHog UI: http://localhost:8025"
echo "- Redis: localhost:6379"
echo ""
echo "📚 문서:"
echo "- 요구사항: ./.kiro/specs/realtime-collaborative-editor/requirements.md"
echo "- 설계: ./.kiro/specs/realtime-collaborative-editor/design.md"
echo "- 구현 계획: ./.kiro/specs/realtime-collaborative-editor/tasks.md"