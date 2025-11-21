/**
 * 任务相关 API
 */
import apiClient from './client'

// ==================== 枚举 ====================

/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 编辑模式
 */
export enum EditMode {
  HEAD_SWAP = 'HEAD_SWAP',
  BACKGROUND_CHANGE = 'BACKGROUND_CHANGE',
  POSE_CHANGE = 'POSE_CHANGE'
}

// ==================== 接口定义 ====================

/**
 * 任务创建请求
 */
export interface CreateTaskRequest {
  mode: EditMode
  source_image: string // file_id
  config: Record<string, any>
}

/**
 * 任务结果
 */
export interface TaskResult {
  output_image?: string
  thumbnail?: string
  comparison_image?: string
  metadata?: Record<string, any>
}

/**
 * 任务错误
 */
export interface TaskError {
  code: string
  message: string
  details?: string
}

/**
 * 任务信息
 */
export interface TaskInfo {
  task_id: string
  status: TaskStatus
  mode: EditMode
  progress: number
  current_step?: string
  
  // 输入信息
  source_image: string
  config: Record<string, any>
  
  // 结果信息
  result?: TaskResult
  error?: TaskError
  
  // 时间信息
  created_at: string
  updated_at?: string
  completed_at?: string
  failed_at?: string
  processing_time?: number
}

/**
 * 任务列表响应
 */
export interface TaskListResponse {
  tasks: TaskInfo[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
}

// ==================== API 函数 ====================

/**
 * 创建任务
 * @param request - 任务创建请求
 * @returns 任务信息
 */
export async function createTask(request: CreateTaskRequest): Promise<TaskInfo> {
  const response = await apiClient.post<TaskInfo>('/tasks', request)
  return response.data
}

/**
 * 获取任务详情
 * @param taskId - 任务 ID
 * @returns 任务信息
 */
export async function getTask(taskId: string): Promise<TaskInfo> {
  const response = await apiClient.get<TaskInfo>(`/tasks/${taskId}`)
  return response.data
}

/**
 * 获取任务列表
 * @param params - 查询参数
 * @returns 任务列表
 */
export async function listTasks(params?: {
  status?: string
  mode?: string
  page?: number
  page_size?: number
}): Promise<TaskListResponse> {
  const response = await apiClient.get<TaskListResponse>('/tasks', { params })
  return response.data
}

/**
 * 取消任务
 * @param taskId - 任务 ID
 */
export async function cancelTask(taskId: string): Promise<void> {
  await apiClient.post(`/tasks/${taskId}/cancel`)
}

