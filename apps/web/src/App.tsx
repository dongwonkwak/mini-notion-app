import { useState } from 'react'
import type { User } from '@mini-notion/types/domain'
import type { ApiResponse } from '@mini-notion/types/common'
import { useExampleStore } from './stores'
import { FileUpload } from './components/FileUpload'
import { UIShowcase } from './components/UIShowcase'
import { formatDate, formatFileSize, cn } from './utils'
import { Upload, Download } from 'lucide-react'
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  // Zustand store 사용 예시
  const { count: storeCount, increment, decrement, reset } = useExampleStore()

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

  const handleFilesAccepted = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Notion</h1>
        <p>React 19 + Vite 기반 블록 에디터</p>
      </header>
      
      <main className="app-main space-y-6">
        {/* 기본 카운터 */}
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

        {/* Zustand 상태 관리 예시 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Zustand 상태 관리
          </h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={decrement}
              className={cn(
                "px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600",
                "transition-colors"
              )}
            >
              -
            </button>
            <span className="font-mono text-xl">{storeCount}</span>
            <button 
              onClick={increment}
              className={cn(
                "px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600",
                "transition-colors"
              )}
            >
              +
            </button>
            <button 
              onClick={reset}
              className={cn(
                "px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600",
                "transition-colors"
              )}
            >
              Reset
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            상태는 localStorage에 자동 저장됩니다
          </p>
        </div>

        {/* 파일 업로드 예시 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            파일 업로드 (react-dropzone)
          </h3>
          <FileUpload
            onFilesAccepted={handleFilesAccepted}
            maxSize={5 * 1024 * 1024} // 5MB
            maxFiles={3}
          />
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">업로드된 파일 목록:</h4>
              <ul className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} - {formatFileSize(file.size)} - {formatDate(new Date(file.lastModified))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 유틸리티 함수 예시 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">유틸리티 함수 예시</h3>
          <div className="space-y-2 text-sm">
            <p>현재 시간: {formatDate(new Date(), 'yyyy년 M월 d일 HH:mm:ss')}</p>
            <p>파일 크기 포맷: {formatFileSize(1048576)} (1MB)</p>
            <p className={cn("p-2 rounded", "bg-blue-100 text-blue-800")}>
              clsx + tailwind-merge 조합으로 클래스 병합
            </p>
          </div>
        </div>

        {/* Shadcn/ui 컴포넌트 쇼케이스 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Shadcn/ui 컴포넌트</h3>
          <UIShowcase />
        </div>
      </main>
    </div>
  )
}

export default App