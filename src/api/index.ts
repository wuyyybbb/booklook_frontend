/**
 * API SDK 统一入口
 * 
 * 使用示例：
 * ```typescript
 * import { uploadImage, createTask, getTask } from '@/api'
 * 
 * // 上传图片
 * const result = await uploadImage(file, 'source')
 * 
 * // 创建任务
 * const task = await createTask({
 *   mode: EditMode.HEAD_SWAP,
 *   source_image: result.file_id,
 *   config: { target_face_image: referenceFileId }
 * })
 * 
 * // 查询任务
 * const taskInfo = await getTask(task.task_id)
 * ```
 */

// ==================== 导出客户端 ====================
export { default as apiClient } from './client'

// ==================== 导出图片上传相关 ====================
export {
  uploadImage,
  getImageUrl,
  type UploadImageResponse,
} from './upload'

// ==================== 导出任务相关 ====================
export {
  createTask,
  getTask,
  listTasks,
  cancelTask,
  TaskStatus,
  EditMode,
  type CreateTaskRequest,
  type TaskInfo,
  type TaskResult,
  type TaskError,
  type TaskListResponse,
} from './tasks'

// ==================== 导出认证相关 ====================
export {
  sendVerificationCode,
  loginWithCode,
  getCurrentUser,
  saveAuthInfo,
  getToken,
  getUserInfo,
  clearAuthInfo,
  isLoggedIn,
  type SendCodeRequest,
  type SendCodeResponse,
  type LoginRequest,
  type LoginResponse,
  type UserInfo,
  type CurrentUserResponse,
} from './auth'

// ==================== 导出计费相关 ====================
export {
  getUserBilling,
  changePlan,
  consumeCredits,
  addCredits,
  type UserBillingInfo,
  type ChangePlanRequest,
  type ChangePlanResponse,
} from './billing'

// ==================== API 命名空间（可选的组织方式） ====================

/**
 * 图片相关 API
 */
export * as ImageAPI from './upload'

/**
 * 任务相关 API
 */
export * as TaskAPI from './tasks'

