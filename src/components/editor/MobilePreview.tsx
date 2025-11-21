interface MobilePreviewProps {
  sourceImage: string | null
  resultImage: string | null
  comparisonImage?: string | null
  isProcessing: boolean
  progress?: number
  currentStep?: string | null
}

export default function MobilePreview({ 
  sourceImage, 
  resultImage, 
  comparisonImage = null,
  isProcessing,
  progress = 0,
  currentStep = null
}: MobilePreviewProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Processing Result (output:image:1) */}
      <div>
        <div className="text-xs font-medium mb-2 text-primary">处理结果</div>
        <div className="aspect-[3/4] bg-dark-card rounded-sm border border-dark-border overflow-hidden">
          {isProcessing ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-text-secondary mb-2">AI 处理中...</p>
                
                {/* 进度条 */}
                {progress > 0 && (
                  <div className="w-full max-w-xs mx-auto mb-2">
                    <div className="bg-dark-border rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{progress}%</p>
                  </div>
                )}
                
                {/* 当前步骤 */}
                {currentStep && (
                  <p className="text-text-tertiary text-xs mt-1">{currentStep}</p>
                )}
              </div>
            </div>
          ) : resultImage ? (
            <img src={resultImage} alt="处理结果" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              <div className="text-center px-4">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm">等待生成结果</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Image (output:image_comparer:2) */}
      <div>
        <div className="text-xs font-medium mb-2 text-primary">对比展示</div>
        <div className="aspect-[3/4] bg-dark-card rounded-sm border border-dark-border overflow-hidden">
          {isProcessing ? (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              <div className="text-center px-4">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm">等待生成对比图</p>
              </div>
            </div>
          ) : comparisonImage ? (
            // 对比图片（支持左右滑动查看）
            <img src={comparisonImage} alt="对比展示" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              <div className="text-center px-4">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm">等待生成对比图</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

