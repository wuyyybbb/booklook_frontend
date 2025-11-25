/**
 * 统一错误码和错误消息映射
 * 与后端 error_codes.py 保持一致
 */

export type TaskErrorCode = string

/**
 * 错误消息映射表
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // 通用错误
  UNKNOWN_ERROR: '未知错误',
  INTERNAL_ERROR: '系统内部错误',
  INVALID_REQUEST: '请求参数无效',
  
  // 任务数据错误
  TASK_DATA_NOT_FOUND: '任务数据不存在',
  TASK_ALREADY_PROCESSING: '任务正在处理中',
  TASK_CANCELLED: '任务已取消',
  
  // 参数验证错误
  INVALID_MODE: '编辑模式无效',
  INVALID_SOURCE_IMAGE: '原始图片无效',
  INVALID_REFERENCE_IMAGE: '参考图片无效',
  INVALID_CONFIG: '配置参数无效',
  MISSING_REQUIRED_PARAM: '缺少必要参数',
  
  // 图片相关错误
  IMAGE_NOT_FOUND: '图片文件不存在',
  IMAGE_FORMAT_INVALID: '图片格式不支持',
  IMAGE_SIZE_TOO_LARGE: '图片尺寸过大',
  IMAGE_SIZE_TOO_SMALL: '图片尺寸过小',
  IMAGE_LOAD_FAILED: '图片加载失败',
  IMAGE_DECODE_FAILED: '图片解码失败',
  
  // Pipeline 执行错误
  PIPELINE_ERROR: '处理流程错误',
  PIPELINE_TIMEOUT: '处理超时',
  PIPELINE_INIT_FAILED: '处理流程初始化失败',
  PIPELINE_CONFIG_ERROR: '处理流程配置错误',
  
  // Engine 错误
  ENGINE_NOT_AVAILABLE: 'AI 引擎不可用',
  ENGINE_CONNECTION_FAILED: '无法连接到 AI 引擎',
  ENGINE_TIMEOUT: 'AI 引擎响应超时',
  ENGINE_RESPONSE_ERROR: 'AI 引擎返回错误',
  ENGINE_AUTH_FAILED: 'AI 引擎认证失败',
  
  // ComfyUI 特定错误
  COMFYUI_NOT_AVAILABLE: 'AI 服务暂时不可用',
  COMFYUI_CONNECTION_TIMEOUT: '连接 AI 服务超时',
  COMFYUI_WORKFLOW_ERROR: 'AI 工作流配置错误',
  COMFYUI_PROCESSING_FAILED: 'AI 处理失败',
  COMFYUI_RESULT_NOT_FOUND: '无法获取 AI 处理结果',
  
  // 资源错误
  INSUFFICIENT_CREDITS: '算力不足',
  RESOURCE_LIMIT_EXCEEDED: '资源使用超限',
  STORAGE_FULL: '存储空间已满',
  
  // 业务逻辑错误
  PROCESSING_FAILED: '处理失败',
  RESULT_SAVE_FAILED: '结果保存失败',
  NO_FACE_DETECTED: '未检测到人脸',
  MULTIPLE_FACES_DETECTED: '检测到多张人脸',
  POSE_EXTRACTION_FAILED: '姿势提取失败',
}

/**
 * 错误建议映射表
 */
export const ERROR_SUGGESTIONS: Record<string, string> = {
  IMAGE_FORMAT_INVALID: '请上传 JPG、PNG 或 WEBP 格式的图片',
  IMAGE_SIZE_TOO_LARGE: '请上传小于 10MB 的图片',
  IMAGE_SIZE_TOO_SMALL: '请上传分辨率至少为 512x512 的图片',
  COMFYUI_NOT_AVAILABLE: '请稍后重试',
  COMFYUI_CONNECTION_TIMEOUT: '请检查网络连接或稍后重试',
  NO_FACE_DETECTED: '请确保图片中包含清晰可见的人脸',
  MULTIPLE_FACES_DETECTED: '请上传只包含单个人脸的图片',
  INSUFFICIENT_CREDITS: '请充值算力或升级套餐',
}

/**
 * 获取用户友好的错误消息
 * @param errorCode 错误码
 * @param fallbackMessage 备用消息（当错误码未知时使用）
 * @returns 用户友好的错误消息
 */
export function getErrorMessage(errorCode?: string, fallbackMessage?: string): string {
  if (!errorCode) {
    return fallbackMessage || '处理失败，请稍后重试'
  }
  
  return ERROR_MESSAGES[errorCode] || fallbackMessage || `错误: ${errorCode}`
}

/**
 * 获取错误建议
 * @param errorCode 错误码
 * @returns 错误建议（如果有）
 */
export function getErrorSuggestion(errorCode?: string): string | null {
  if (!errorCode) {
    return null
  }
  
  return ERROR_SUGGESTIONS[errorCode] || null
}

/**
 * 格式化完整的错误信息（用于显示）
 * @param errorCode 错误码
 * @param errorMessage 原始错误消息
 * @param _errorDetails 错误详情 (reserved for future use)
 * @returns 格式化后的错误信息
 */
export function formatErrorDisplay(
  errorCode?: string,
  errorMessage?: string,
  _errorDetails?: string
): { title: string; message: string; suggestion?: string } {
  // 优先使用映射表中的友好消息
  const friendlyMessage = errorCode ? getErrorMessage(errorCode, errorMessage) : errorMessage || '处理失败'
  const suggestion = errorCode ? getErrorSuggestion(errorCode) : null
  
  return {
    title: errorCode ? `错误: ${errorCode}` : '处理失败',
    message: friendlyMessage,
    suggestion: suggestion || undefined
  }
}

/**
 * 是否是需要重试的错误
 * @param errorCode 错误码
 * @returns 是否建议重试
 */
export function isRetryableError(errorCode?: string): boolean {
  if (!errorCode) {
    return true // 未知错误建议重试
  }
  
  const retryableErrors = [
    'ENGINE_CONNECTION_FAILED',
    'ENGINE_TIMEOUT',
    'COMFYUI_NOT_AVAILABLE',
    'COMFYUI_CONNECTION_TIMEOUT',
    'PIPELINE_TIMEOUT',
    'INTERNAL_ERROR',
  ]
  
  return retryableErrors.includes(errorCode)
}

/**
 * 获取错误的严重程度
 * @param errorCode 错误码
 * @returns 严重程度 (error | warning | info)
 */
export function getErrorSeverity(errorCode?: string): 'error' | 'warning' | 'info' {
  if (!errorCode) {
    return 'error'
  }
  
  // 警告级别的错误（用户操作问题）
  const warningErrors = [
    'INVALID_REQUEST',
    'INVALID_MODE',
    'INVALID_SOURCE_IMAGE',
    'INVALID_REFERENCE_IMAGE',
    'IMAGE_FORMAT_INVALID',
    'IMAGE_SIZE_TOO_LARGE',
    'IMAGE_SIZE_TOO_SMALL',
    'NO_FACE_DETECTED',
    'MULTIPLE_FACES_DETECTED',
    'INSUFFICIENT_CREDITS',
  ]
  
  if (warningErrors.includes(errorCode)) {
    return 'warning'
  }
  
  // 信息级别的错误
  const infoErrors = [
    'TASK_CANCELLED',
  ]
  
  if (infoErrors.includes(errorCode)) {
    return 'info'
  }
  
  // 默认是错误级别
  return 'error'
}

