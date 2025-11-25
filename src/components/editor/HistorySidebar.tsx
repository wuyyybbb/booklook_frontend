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

  // 加载历史任务 - 显示所有状态
  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await listTasks({
        mode: currentMode,
        page: 1,
        page_size: 20
      })
      setTasks(response.tasks || [])
    } catch (error) {
      console.error('Failed to load history:', error)
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

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // 获取状态徽章样式
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return {
          bg: 'bg-green-500',
          text: '✓',
          title: 'Completed'
        }
      case TaskStatus.PROCESSING:
        return {
          bg: 'bg-blue-500 animate-pulse',
          text: '⋯',
          title: 'Processing'
        }
      case TaskStatus.FAILED:
        return {
          bg: 'bg-red-500',
          text: '✗',
          title: 'Failed'
        }
      case TaskStatus.PENDING:
        return {
          bg: 'bg-yellow-500',
          text: '⋯',
          title: 'Pending'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: '?',
          title: 'Unknown'
        }
    }
  }

  return (
    <div className="w-24 flex-shrink-0 border-l border-dark-border bg-dark flex flex-col overflow-hidden">
      {/* Header - 紧凑版 */}
      <div className="p-2 border-b border-dark-border text-center">
        <div className="text-xs font-medium text-text-secondary">历史</div>
      </div>

      {/* Content - 紧凑的缩略图列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-2 text-center text-text-tertiary">
            <svg className="w-8 h-8 mx-auto mb-1 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">暂无</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-1.5">
            {tasks.map((task) => {
              const thumbnail = getTaskThumbnail(task)
              const statusBadge = getStatusBadge(task.status)
              return (
                <div
                  key={task.task_id}
                  onClick={() => onSelectTask?.(task)}
                  className="group relative cursor-pointer rounded-sm border-2 border-dark-border hover:border-primary transition-all duration-200 overflow-hidden"
                  title={`${statusBadge.title} - ${formatTime(task.completed_at || task.created_at)}${task.processing_time ? ` - ${task.processing_time.toFixed(1)}s` : ''}`}
                >
                  {/* 紧凑的缩略图 */}
                  <div className="aspect-[3/4] bg-dark-border relative overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="History result"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        {task.status === TaskStatus.PROCESSING ? (
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    )}
                    
                    {/* 状态徽章 */}
                    <div className="absolute top-1 right-1">
                      <div 
                        className={`${statusBadge.bg} w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                        title={statusBadge.title}
                      >
                        {statusBadge.text}
                      </div>
                    </div>
                    
                    {/* Hover 指示器 */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    
                    {/* 时间标签（悬停时显示） */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-xs text-white text-center truncate">
                        {formatTime(task.completed_at || task.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh Button - 紧凑版 */}
      <div className="p-1.5 border-t border-dark-border">
        <button
          onClick={loadHistory}
          disabled={loading}
          className="w-full py-1.5 text-xs text-text-tertiary hover:text-primary hover:bg-dark-card rounded-sm transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          title="刷新历史记录"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

