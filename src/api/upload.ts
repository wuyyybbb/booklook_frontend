/**
 * 图片上传 API
 */
import apiClient from './client'

export interface UploadImageResponse {
  file_id: string
  filename: string
  size: number
  url: string
  uploaded_at: string
}

/**
 * 上传图片
 * @param file - 图片文件
 * @param purpose - 用途（source: 原图, reference: 参考图）
 * @returns 上传结果，包含图片 URL
 */
export async function uploadImage(
  file: File,
  purpose: 'source' | 'reference' = 'source'
): Promise<UploadImageResponse> {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件格式，请上传 JPG、PNG 或 WEBP 格式的图片')
  }

  // 验证文件大小（10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 10MB')
  }

  // 构建 FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)

  // 发送请求
  const response = await apiClient.post<UploadImageResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * 获取图片完整 URL
 * @param url - 相对 URL 或完整 URL
 * @returns 完整的图片 URL
 */
export function getImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 如果是相对路径，拼接基础 URL
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  
  // 移除 /api/v1 后缀，因为静态文件挂载在根路径
  const apiBase = baseURL.replace(/\/api\/v1$/, '')
  
  return `${apiBase}${url}`
}

