import { useEffect, useState } from 'react'
import { TaskInfo, TaskStatus, listTasks } from '../../api/tasks'
import { getImageUrl } from '../../api/upload'

interface HistorySidebarProps {
  currentMode: string
  onSelectTask?: (task: TaskInfo) => void
}

export default function HistorySidebar({ currentMode, onSelectTask }: HistorySidebarProps) {
  const [tasks, setTasks] = useState<TaskInfo[]>([])
  const [loading, setLoading] = useState(false)

  // 加载历史任务
  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await listTasks({
        status: TaskStatus.DONE,
        mode: currentMode,
        page: 1,
        page_size: 20
      })
      setTasks(response.tasks || [])
    } catch (error) {
      console.error('加载历史任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode])

  // 获取任务缩略图
  const getTaskThumbnail = (task: TaskInfo): string | null => {
    if (task.result?.thumbnail) {
      return getImageUrl(task.result.thumbnail)
    }
    if (task.result?.output_image) {
      return getImageUrl(task.result.output_image)
    }
    if (task.result?.comparison_image) {
      return getImageUrl(task.result.comparison_image)
    }
    return null
  }

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-64 flex-shrink-0 border-l border-dark-border bg-dark flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-text-primary">历史结果</h3>
        <p className="text-xs text-text-tertiary mt-1">已完成的任务</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-4 text-center text-text-tertiary">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">暂无历史记录</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {tasks.map((task) => {
              const thumbnail = getTaskThumbnail(task)
              return (
                <div
                  key={task.task_id}
                  onClick={() => onSelectTask?.(task)}
                  className="group relative cursor-pointer rounded-sm border border-dark-border bg-dark-card hover:border-primary/50 transition-all duration-200 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-dark-border relative overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="历史结果"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-xs text-text-primary">查看详情</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs text-text-secondary truncate">
                      {formatTime(task.completed_at || task.created_at)}
                    </p>
                    {task.processing_time && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {task.processing_time.toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="p-2 border-t border-dark-border">
        <button
          onClick={loadHistory}
          disabled={loading}
          className="w-full py-2 px-3 text-xs text-text-secondary hover:text-text-primary hover:bg-dark-card rounded-sm transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
    </div>
  )
}

