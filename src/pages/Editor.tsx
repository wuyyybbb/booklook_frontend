import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ModeTabs from '../components/editor/ModeTabs'
import ControlPanel from '../components/editor/ControlPanel'
import PreviewPanel from '../components/editor/PreviewPanel'
import MobilePreview from '../components/editor/MobilePreview'
import MobileControls from '../components/editor/MobileControls'
import HistorySidebar from '../components/editor/HistorySidebar'
import { UploadResult } from '../components/editor/UploadArea'
import { createTask, EditMode as ApiEditMode, TaskStatus, TaskInfo } from '../api/tasks'
import { useTaskPolling } from '../hooks/useTaskPolling'
import { getImageUrl } from '../api/upload'

export type EditMode = 'HEAD_SWAP' | 'BACKGROUND_CHANGE' | 'POSE_CHANGE'

export default function Editor() {
  const [searchParams] = useSearchParams()
  const modeFromUrl = searchParams.get('mode') as EditMode | null
  const [currentMode, setCurrentMode] = useState<EditMode>(modeFromUrl || 'HEAD_SWAP')
  
  // 当 URL 参数变化时更新模式
  useEffect(() => {
    if (modeFromUrl && (modeFromUrl === 'HEAD_SWAP' || modeFromUrl === 'BACKGROUND_CHANGE' || modeFromUrl === 'POSE_CHANGE')) {
      setCurrentMode(modeFromUrl)
    }
  }, [modeFromUrl])
  
  // 图片 URL（用于显示）
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [comparisonImage, setComparisonImage] = useState<string | null>(null)
  
  // 图片 file_id（用于创建任务）
  const [sourceFileId, setSourceFileId] = useState<string | null>(null)
  const [referenceFileId, setReferenceFileId] = useState<string | null>(null)
  
  // 任务状态
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [_taskStatus, setTaskStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [_errorMessage, setErrorMessage] = useState<string | null>(null)
  const [historyKey, setHistoryKey] = useState(0) // 用于触发历史记录刷新
  
  // 处理原图上传
  const handleSourceUpload = (result: UploadResult | null) => {
    if (result) {
      setSourceImage(result.imageUrl)
      setSourceFileId(result.fileId)
    } else {
      setSourceImage(null)
      setSourceFileId(null)
    }
  }
  
  // 处理参考图上传
  const handleReferenceUpload = (result: UploadResult | null) => {
    if (result) {
      setReferenceImage(result.imageUrl)
      setReferenceFileId(result.fileId)
    } else {
      setReferenceImage(null)
      setReferenceFileId(null)
    }
  }
  
  // 轮询任务状态
  useTaskPolling({
    taskId: currentTaskId,
    enabled: isProcessing && currentTaskId !== null,
    interval: 2500, // 2.5 秒轮询一次
    onUpdate: (taskInfo: TaskInfo) => {
      // 更新任务状态
      setTaskStatus(taskInfo.status)
      setProgress(taskInfo.progress)
      setCurrentStep(taskInfo.current_step || null)
      
      console.log('任务状态更新:', {
        task_id: taskInfo.task_id,
        status: taskInfo.status,
        progress: taskInfo.progress,
        current_step: taskInfo.current_step
      })
    },
    onComplete: (taskInfo: TaskInfo) => {
      // 任务完成
      console.log('任务完成:', taskInfo)
      setIsProcessing(false)
      setTaskStatus(TaskStatus.DONE)
      
      // 同时设置处理结果和对比图片
      if (taskInfo.result?.output_image) {
        const resultUrl = getImageUrl(taskInfo.result.output_image)
        setResultImage(resultUrl)
      } else {
        setResultImage(null)
      }
      
      if (taskInfo.result?.comparison_image) {
        const comparisonUrl = getImageUrl(taskInfo.result.comparison_image)
        setComparisonImage(comparisonUrl)
      } else {
        setComparisonImage(null)
      }
      
      // 刷新历史记录
      setHistoryKey(prev => prev + 1)
    },
    onError: (taskInfo: TaskInfo) => {
      // 任务失败
      console.error('❌ 任务失败:', taskInfo)
      setIsProcessing(false)
      setTaskStatus(TaskStatus.FAILED)
      
      // 构建详细的错误信息
      const error = taskInfo.error
      let errorMsg = '任务处理失败'
      
      if (error) {
        // 显示错误码和消息
        errorMsg = error.message || errorMsg
        
        // 记录详细信息到控制台
        console.error('错误码:', error.code)
        console.error('错误消息:', error.message)
        if (error.details) {
          console.error('错误详情:', error.details)
        }
        
        // 如果有详细信息，追加到提示中
        if (error.code) {
          errorMsg = `[${error.code}] ${errorMsg}`
        }
      }
      
      setErrorMessage(errorMsg)
      
      // 弹窗显示错误（可以考虑改为更友好的 UI 组件）
      alert(`❌ 任务失败\n\n${errorMsg}\n\n请检查：\n- 图片格式是否正确\n- 网络连接是否正常\n- 服务是否可用`)
    }
  })
  
  // 处理生成按钮点击
  const handleGenerate = async () => {
    // 1. 验证必要的图片已上传
    if (!sourceFileId) {
      alert('请先上传原始图片')
      return
    }
    
    // 2. 根据模式验证是否需要参考图
    if ((currentMode === 'HEAD_SWAP' || currentMode === 'POSE_CHANGE') && !referenceFileId) {
      alert('此模式需要上传参考图片')
      return
    }
    
    // 3. 重置状态
    setResultImage(null)
    setErrorMessage(null)
    setProgress(0)
    setCurrentStep(null)
    
    // 4. 组装请求体
    const config: Record<string, any> = {}
    
    // 根据不同模式添加配置
    if (currentMode === 'HEAD_SWAP' && referenceFileId) {
      config.target_face_image = referenceFileId
    } else if (currentMode === 'BACKGROUND_CHANGE' && referenceFileId) {
      config.background_image = referenceFileId
    } else if (currentMode === 'POSE_CHANGE' && referenceFileId) {
      config.pose_image = referenceFileId
    }
    
    try {
      setIsProcessing(true)
      setTaskStatus(TaskStatus.PENDING)
      
      // 5. 发送创建任务请求
      const taskInfo = await createTask({
        mode: currentMode as ApiEditMode,
        source_image: sourceFileId,
        config
      })
      
      // 6. 记住 task_id，轮询会自动开始
      setCurrentTaskId(taskInfo.task_id)
      setTaskStatus(taskInfo.status)
      
      console.log('任务创建成功，开始轮询:', taskInfo)
      
    } catch (error) {
      console.error('创建任务失败:', error)
      
      // 提取错误信息
      let errorMsg = '未知错误'
      if (error instanceof Error) {
        errorMsg = error.message
      } else if (typeof error === 'string') {
        errorMsg = error
      } else if (error && typeof error === 'object') {
        // 尝试从对象中提取错误信息
        const err = error as any
        errorMsg = err.message || err.error || JSON.stringify(error)
      }
      
      alert('创建任务失败:\n' + errorMsg)
      setIsProcessing(false)
      setTaskStatus(TaskStatus.FAILED)
      setCurrentTaskId(null)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border backdrop-blur-sm flex-shrink-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-base">
              <div className="w-8 h-8 bg-primary rounded-sm"></div>
              <span className="text-xl font-bold">Formy</span>
            </Link>
            
            {/* Desktop Mode Tabs */}
            <div className="hidden md:block">
              <ModeTabs currentMode={currentMode} onModeChange={setCurrentMode} />
            </div>

            <button className="btn-ghost">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Mobile Mode Tabs */}
          <div className="md:hidden mt-4">
            <ModeTabs currentMode={currentMode} onModeChange={setCurrentMode} />
          </div>
        </div>
      </header>

      {/* Main Content - Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-96 flex-shrink-0 border-r border-dark-border overflow-y-auto">
          <ControlPanel
            mode={currentMode}
            sourceImage={sourceImage}
            referenceImage={referenceImage}
            onSourceImageChange={handleSourceUpload}
            onReferenceImageChange={handleReferenceUpload}
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel
            sourceImage={sourceImage}
            resultImage={resultImage}
            comparisonImage={comparisonImage}
            isProcessing={isProcessing}
            progress={progress}
            currentStep={currentStep}
          />
        </div>

        {/* History Sidebar */}
        <HistorySidebar
          key={historyKey}
          currentMode={currentMode}
          onSelectTask={(task) => {
            // 点击历史任务时，显示其结果
            if (task.result?.output_image) {
              const resultUrl = getImageUrl(task.result.output_image)
              setResultImage(resultUrl)
            }
            if (task.result?.comparison_image) {
              const comparisonUrl = getImageUrl(task.result.comparison_image)
              setComparisonImage(comparisonUrl)
            }
          }}
        />
      </div>

      {/* Main Content - Mobile Layout */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Top Preview */}
        <div className="flex-1 overflow-hidden">
          <MobilePreview
            sourceImage={sourceImage}
            resultImage={resultImage}
            comparisonImage={comparisonImage}
            isProcessing={isProcessing}
            progress={progress}
            currentStep={currentStep}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex-shrink-0 border-t border-dark-border">
          <MobileControls
            mode={currentMode}
            sourceImage={sourceImage}
            referenceImage={referenceImage}
            onSourceImageChange={handleSourceUpload}
            onReferenceImageChange={handleReferenceUpload}
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}

