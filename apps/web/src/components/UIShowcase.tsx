import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { ThemeToggle } from './ThemeToggle'
import { designTokens, getCollaborationColor } from '@/lib/design-tokens'

/**
 * UI 컴포넌트 쇼케이스 컴포넌트
 * 
 * 설치된 Shadcn/ui 컴포넌트들의 동작을 확인하기 위한 테스트 컴포넌트입니다.
 * 개발 중에 컴포넌트들이 올바르게 렌더링되는지 검증할 수 있습니다.
 * 
 * @returns UI 컴포넌트 쇼케이스 JSX 엘리먼트
 * 
 * @example
 * ```tsx
 * // App.tsx에서 사용
 * <UIShowcase />
 * ```
 */
export function UIShowcase() {
  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center">UI 컴포넌트 쇼케이스</h1>
      
      {/* Button 컴포넌트 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Button 컴포넌트</CardTitle>
          <CardDescription>다양한 버튼 variants와 크기를 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>기본 버튼</Button>
            <Button variant="secondary">보조 버튼</Button>
            <Button variant="outline">아웃라인 버튼</Button>
            <Button variant="ghost">고스트 버튼</Button>
            <Button variant="destructive">삭제 버튼</Button>
            <Button variant="link">링크 버튼</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">작은 버튼</Button>
            <Button size="default">기본 크기</Button>
            <Button size="lg">큰 버튼</Button>
            <Button size="icon">🔍</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input 컴포넌트 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Input 컴포넌트</CardTitle>
          <CardDescription>다양한 입력 필드 타입을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="기본 텍스트 입력" />
            <Input type="email" placeholder="이메일 입력" />
            <Input type="password" placeholder="비밀번호 입력" />
            <Input disabled placeholder="비활성화된 입력" />
            <Input aria-invalid placeholder="에러 상태 입력" />
          </div>
        </CardContent>
      </Card>

      {/* Card 컴포넌트 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Card 컴포넌트</CardTitle>
          <CardDescription>카드 레이아웃과 하위 컴포넌트들을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>이것은 카드의 메인 콘텐츠 영역입니다. 다양한 콘텐츠를 배치할 수 있습니다.</p>
        </CardContent>
        <CardFooter>
          <Button>액션 버튼</Button>
          <Button variant="outline" className="ml-2">취소</Button>
        </CardFooter>
      </Card>

      {/* 테마 토글 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            테마 시스템
            <ThemeToggle />
          </CardTitle>
          <CardDescription>라이트/다크 테마 전환을 테스트할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>우측 상단의 버튼을 클릭하여 테마를 전환해보세요. 모든 컴포넌트가 자동으로 테마에 맞게 변경됩니다.</p>
        </CardContent>
      </Card>

      {/* 디자인 토큰 쇼케이스 */}
      <Card>
        <CardHeader>
          <CardTitle>디자인 토큰</CardTitle>
          <CardDescription>미니 노션 프로젝트의 디자인 토큰들을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 색상 팔레트 */}
            <div>
              <h4 className="font-medium mb-3">색상 팔레트</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-md bg-primary mx-auto mb-1"></div>
                  <span className="text-xs">Primary</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-md bg-secondary mx-auto mb-1"></div>
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-md bg-muted mx-auto mb-1"></div>
                  <span className="text-xs">Muted</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-md bg-destructive mx-auto mb-1"></div>
                  <span className="text-xs">Destructive</span>
                </div>
              </div>
            </div>

            {/* 협업 사용자 색상 */}
            <div>
              <h4 className="font-medium mb-3">협업 사용자 색상</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: getCollaborationColor(i) }}
                    ></div>
                    <span className="text-xs">User {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 간격 시스템 */}
            <div>
              <h4 className="font-medium mb-3">간격 시스템</h4>
              <div className="space-y-2">
                {Object.entries(designTokens.spacing).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm w-8">{key}</span>
                    <div 
                      className="bg-primary h-4 rounded"
                      style={{ width: value }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 타이포그래피 */}
            <div>
              <h4 className="font-medium mb-3">타이포그래피</h4>
              <div className="space-y-2">
                <div className="text-xs">Extra Small (12px)</div>
                <div className="text-sm">Small (14px)</div>
                <div className="text-base">Base (16px)</div>
                <div className="text-lg">Large (18px)</div>
                <div className="text-xl">Extra Large (20px)</div>
                <div className="text-2xl">2X Large (24px)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}