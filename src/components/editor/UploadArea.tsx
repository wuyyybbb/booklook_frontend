import { useState } from 'react'
import { uploadImage, getImageUrl } from '../../api/upload'

export interface UploadResult {
  imageUrl: string
  fileId: string
}

interface UploadAreaProps {
  label: string
  image: string | null
  onChange: (result: UploadResult | null) => void
  purpose?: 'source' | 'reference'
}

export default function UploadArea({ label, image, onChange, purpose = 'source' }: UploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // 调用后端 API 上传图片
      const result = await uploadImage(file, purpose)
      
      // 获取完整的图片 URL
      const imageUrl = getImageUrl(result.url)
      
      // 更新状态，传递 URL 和 file_id
      onChange({
        imageUrl,
        fileId: result.file_id
      })
      
      console.log('图片上传成功:', result)
    } catch (error) {
      console.error('图片上传失败:', error)
      setUploadError(error instanceof Error ? error.message : '上传失败，请重试')
      
      // 上传失败时，不调用 onChange
      // 用户需要重新上传
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {/* 上传错误提示 */}
      {uploadError && (
        <div className="mb-2 p-3 bg-accent/10 border border-accent/30 rounded-sm text-sm text-accent">
          {uploadError}
        </div>
      )}
      
      {image ? (
        <div className="relative group">
          <div className="w-full h-48 bg-dark-card rounded-sm border border-dark-border overflow-hidden flex items-center justify-center">
            <img
              src={image}
              alt={label}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm flex items-center justify-center">
            <button
              onClick={() => {
                onChange(null)
                setUploadError(null)
              }}
              className="btn-secondary"
              disabled={isUploading}
            >
              重新上传
            </button>
          </div>
          
          {/* 上传中遮罩 */}
          {isUploading && (
            <div className="absolute inset-0 bg-dark/90 rounded-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">上传中...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className={`
            border-2 border-dashed border-dark-border rounded-sm p-8 text-center transition-all duration-200
            ${isUploading 
              ? 'bg-dark-card opacity-50 cursor-wait' 
              : 'hover:border-primary/50 hover:bg-dark-card'
            }
          `}>
            {isUploading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-text-secondary text-sm">上传中...</p>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-text-tertiary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-text-secondary text-sm mb-1">点击上传或拖拽文件</p>
                <p className="text-text-tertiary text-xs">支持 JPG, PNG, WEBP 格式，最大 10MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}

