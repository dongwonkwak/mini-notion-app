import { useState } from 'react'
import type { User } from '@mini-notion/types/domain'
import type { ApiResponse } from '@mini-notion/types/common'
import './App.css'

/**
 * 메인 애플리케이션 컴포넌트
 * 
 * React 19 기반의 미니 노션 웹 애플리케이션의 루트 컴포넌트입니다.
 * 공통 타입 패키지와의 연동을 확인하고 기본 UI를 제공합니다.
 * 
 * @returns 애플리케이션 메인 컴포넌트
 * 
 * @example
 * ```tsx
 * import App from './App'
 * 
 * createRoot(document.getElementById('root')!).render(<App />)
 * ```
 */
function App() {
  const [count, setCount] = useState(0)

  // 타입 사용 예시
  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'editor',
    preferences: {
      theme: 'light',
      language: 'ko',
      notifications: {
        email: true,
        push: false,
        mentions: true,
        comments: true,
        sharing: true
      },
      editor: {
        autoSaveInterval: 30,
        spellCheck: true,
        focusMode: false,
        showLineNumbers: false
      }
    },
    emailVerified: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const mockApiResponse: ApiResponse<User> = {
    success: true,
    data: mockUser
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Notion</h1>
        <p>React 19 + Vite 기반 블록 에디터</p>
      </header>
      
      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            React 19 프로젝트가 성공적으로 초기화되었습니다.
          </p>
          <p>
            공통 타입 패키지 연동 완료: {mockApiResponse.data?.name}
          </p>
        </div>
      </main>
    </div>
  )
}

export default App