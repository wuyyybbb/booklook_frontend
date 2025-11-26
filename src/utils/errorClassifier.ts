/**
 * Error classification and user-friendly message generation
 */

export interface ClassifiedError {
  category: 'validation' | 'service_unavailable' | 'processing' | 'unknown'
  userMessage: string
  technicalMessage: string
  suggestion: string
  isRefundable: boolean
  isRetryable: boolean
}

/**
 * Classify error based on error code and details
 */
export function classifyError(
  errorCode?: string | null,
  errorMessage?: string | null,
  errorDetails?: string | null
): ClassifiedError {
  const code = errorCode || ''
  const message = errorMessage || '处理失败'
  const details = errorDetails || ''

  // Category 1: Validation errors (user input issues)
  if (
    code.includes('INVALID') ||
    code.includes('VALIDATION') ||
    code.includes('MISSING_REQUIRED') ||
    code.includes('FORMAT_INVALID') ||
    code.includes('SIZE_TOO') ||
    code.includes('NO_FACE') ||
    code.includes('MULTIPLE_FACES')
  ) {
    return {
      category: 'validation',
      userMessage: '请检查上传的图片和参数',
      technicalMessage: message,
      suggestion: '请确保图片格式正确、尺寸合适，并包含所需的内容',
      isRefundable: true,
      isRetryable: false,
    }
  }

  // Category 2: Service unavailable (AI engine issues)
  if (
    code === 'PROCESSING_FAILED' ||
    code === 'COMFYUI_PROCESSING_FAILED' ||
    code === 'COMFYUI_NOT_AVAILABLE' ||
    code === 'ENGINE_NOT_AVAILABLE' ||
    code === 'ENGINE_CONNECTION_FAILED' ||
    code === 'ENGINE_TIMEOUT' ||
    code.includes('CONNECTION') ||
    code.includes('TIMEOUT') ||
    details.includes('502') ||
    details.includes('Bad Gateway') ||
    details.includes('Connection') ||
    details.includes('Timeout') ||
    message.includes('502') ||
    message.includes('连接')
  ) {
    return {
      category: 'service_unavailable',
      userMessage: 'AI 服务暂时不可用',
      technicalMessage: message,
      suggestion: '请稍后重试，不会扣除积分',
      isRefundable: true,
      isRetryable: true,
    }
  }

  // Category 3: Processing errors (internal issues)
  if (
    code.includes('PIPELINE') ||
    code.includes('RESULT_SAVE') ||
    code === 'INTERNAL_ERROR'
  ) {
    return {
      category: 'processing',
      userMessage: '处理过程中出现问题',
      technicalMessage: message,
      suggestion: '请稍后重试，不会扣除积分',
      isRefundable: true,
      isRetryable: true,
    }
  }

  // Category 4: Unknown errors
  return {
    category: 'unknown',
    userMessage: '处理失败',
    technicalMessage: message,
    suggestion: '请稍后重试，不会扣除积分',
    isRefundable: true,
    isRetryable: true,
  }
}

/**
 * Get icon for error category
 */
export function getErrorIcon(category: ClassifiedError['category']): string {
  switch (category) {
    case 'validation':
      return '⚠️'
    case 'service_unavailable':
      return '🔌'
    case 'processing':
      return '⚙️'
    default:
      return '❌'
  }
}

/**
 * Get color scheme for error category
 */
export function getErrorColorScheme(category: ClassifiedError['category']) {
  switch (category) {
    case 'validation':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-500',
        iconBg: 'bg-yellow-500/20',
      }
    case 'service_unavailable':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
      }
    case 'processing':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        iconBg: 'bg-orange-500/20',
      }
    default:
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        iconBg: 'bg-red-500/20',
      }
  }
}

