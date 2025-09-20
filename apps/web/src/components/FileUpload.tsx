/**
 * File upload component using react-dropzone
 * 
 * Provides drag-and-drop file upload functionality with validation
 * and preview capabilities. Supports multiple file types and size limits.
 * 
 * @example
 * ```typescript
 * <FileUpload
 *   onFilesAccepted={(files) => console.log('Files:', files)}
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   accept={{
 *     'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
 *     'application/pdf': ['.pdf']
 *   }}
 * />
 * ```
 * 
 * @since 1.0.0
 */

import { useCallback } from 'react'
import { useDropzone, type FileRejection, type Accept } from 'react-dropzone'
import { Upload, X, File } from 'lucide-react'
import { clsx } from 'clsx'

interface FileUploadProps {
  /** Callback when files are successfully accepted */
  onFilesAccepted: (files: File[]) => void
  /** Callback when files are rejected due to validation */
  onFilesRejected?: (rejections: FileRejection[]) => void
  /** Maximum file size in bytes */
  maxSize?: number
  /** Accepted file types */
  accept?: Accept
  /** Maximum number of files */
  maxFiles?: number
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Custom className for styling */
  className?: string
  /** Whether the component is disabled */
  disabled?: boolean
}

/**
 * FileUpload component implementation
 * 
 * @param props - Component props
 * @param props.onFilesAccepted - Callback when files are accepted
 * @param props.onFilesRejected - Callback when files are rejected
 * @param props.maxSize - Maximum file size in bytes
 * @param props.accept - Accepted file types
 * @param props.maxFiles - Maximum number of files
 * @param props.multiple - Whether to allow multiple files
 * @param props.className - Custom CSS class
 * @param props.disabled - Whether component is disabled
 * @returns JSX element
 * 
 * @example
 * ```tsx
 * <FileUpload onFilesAccepted={(files) => console.log(files)} />
 * ```
 */
export function FileUpload({
  onFilesAccepted,
  onFilesRejected,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md']
  },
  maxFiles = 5,
  multiple = true,
  className,
  disabled = false
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      onFilesAccepted(acceptedFiles)
    }
    
    if (rejectedFiles.length > 0 && onFilesRejected) {
      onFilesRejected(rejectedFiles)
    }
  }, [onFilesAccepted, onFilesRejected])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  })

  const dropzoneClassName = clsx(
    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
    {
      'border-blue-300 bg-blue-50': isDragAccept,
      'border-red-300 bg-red-50': isDragReject,
      'border-gray-300 hover:border-gray-400': !isDragActive && !disabled,
      'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
      'border-blue-400 bg-blue-50': isDragActive && !isDragReject
    },
    className
  )

  return (
    <div className="w-full">
      <div {...getRootProps({ className: dropzoneClassName })}>
        <input {...getInputProps()} style={{ display: 'none' }} />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={clsx('w-8 h-8', {
            'text-gray-400': disabled,
            'text-blue-500': isDragAccept,
            'text-red-500': isDragReject,
            'text-gray-600': !isDragActive && !disabled
          })} />
          
          {isDragActive ? (
            <p className="text-sm font-medium">
              {isDragAccept ? '파일을 놓아주세요' : '지원하지 않는 파일 형식입니다'}
            </p>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500 mt-1">
                최대 {maxFiles}개 파일, 파일당 {Math.round(maxSize / 1024 / 1024)}MB 이하
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accepted Files */}
      {acceptedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">업로드된 파일:</h4>
          <ul className="space-y-1">
            {acceptedFiles.map((file, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <File className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-gray-400">({Math.round(file.size / 1024)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rejected Files */}
      {fileRejections.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">업로드 실패:</h4>
          <ul className="space-y-1">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-red-600">
                <X className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-red-400">
                  ({errors.map(e => e.message).join(', ')})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}