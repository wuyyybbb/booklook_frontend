interface PreviewPanelProps {
  resultImage: string | null
  comparisonImage?: string | null
  isProcessing: boolean
  progress?: number
  currentStep?: string | null
  taskStatus?: string | null
  errorMessage?: string | null
  processingTime?: number
}

export default function PreviewPanel({ 
  resultImage, 
  comparisonImage = null,
  isProcessing,
  progress = 0,
  currentStep = null,
  taskStatus = null,
  errorMessage = null,
  processingTime = undefined
}: PreviewPanelProps) {
  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="title-h3">预览</h3>
          {resultImage && (
            <button className="btn-secondary">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载结果
            </button>
          )}
          {comparisonImage && (
            <a
              className="btn-ghost text-sm"
              href={comparisonImage}
              download
              target="_blank"
              rel="noreferrer"
            >
              导出对比分割图
            </a>
          )}
        </div>

        {/* Results Display - 不显示原图，只显示处理结果和对比图 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Result (output:image:1) */}
          <div>
            <div className="text-sm font-medium mb-3 text-primary">处理结果</div>
            <div className="aspect-[3/4] bg-dark-card rounded-md border border-dark-border overflow-hidden flex items-center justify-center">
              {isProcessing ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-secondary mb-2">AI 处理中...</p>
                    
                    {/* 进度条 */}
                    {progress > 0 && (
                      <div className="w-full max-w-xs mx-auto mb-2">
                        <div className="bg-dark-border rounded-full h-2 overflow-hidden">
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
                      <p className="text-text-tertiary text-sm mt-2">{currentStep}</p>
                    )}
                  </div>
                </div>
              ) : resultImage ? (
                /* 使用 object-contain 保证图片完整显示，不会裁剪 */
                <img 
                  src={resultImage} 
                  alt="处理结果" 
                  className="max-w-full max-h-full object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              ) : (
                <div className="text-center text-text-tertiary">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm">等待生成结果</p>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Image (output:image_comparer:2) */}
          <div>
            <div className="text-sm font-medium mb-3 text-primary">对比展示</div>
            <div className="aspect-[3/4] bg-dark-card rounded-md border border-dark-border overflow-hidden flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center text-text-tertiary">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm">等待生成结果</p>
                </div>
              ) : comparisonImage ? (
                /* 对比图片 - 使用 object-contain 保证完整显示 */
                <img 
                  src={comparisonImage} 
                  alt="对比展示" 
                  className="max-w-full max-h-full object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              ) : (
                <div className="text-center text-text-tertiary">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm">等待生成对比图</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {/* Processing State */}
        {isProcessing && (
          <div className="mt-6 card border-primary/20 bg-primary/5">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mt-2 mr-3 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <span>AI Processing</span>
                  {progress > 0 && <span className="text-sm text-primary">({progress}%)</span>}
                </p>
                <p className="text-sm text-text-secondary">
                  {currentStep || 'AI is analyzing and processing your image...'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success State */}
        {!isProcessing && taskStatus === 'done' && resultImage && (
          <div className="mt-6 card border-green-500/20 bg-green-500/5">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-500 mb-1">
                  Generation Complete!
                </p>
                <p className="text-sm text-text-secondary">
                  Your image has been processed successfully
                  {processingTime && ` in ${processingTime.toFixed(1)}s`}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resultImage && (
                    <a 
                      href={resultImage} 
                      download 
                      className="btn-secondary text-sm py-1.5 px-4"
                    >
                      <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Result
                    </a>
                  )}
                  {comparisonImage && (
                    <a 
                      href={comparisonImage} 
                      download 
                      className="btn-ghost text-sm py-1.5 px-4"
                    >
                      Download Comparison
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {!isProcessing && taskStatus === 'failed' && errorMessage && (
          <div className="mt-6 card border-red-500/20 bg-red-500/5">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-500 mb-1">
                  Generation Failed
                </p>
                <p className="text-sm text-text-secondary break-words">
                  {errorMessage}
                </p>
                <div className="mt-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

