/**
 * Billing and Credits API
 */
import apiClient from './client'

// ==================== Interface Definitions ====================

/**
 * User billing information
 */
export interface UserBillingInfo {
  user_id: string
  email: string
  current_plan_id: string | null
  current_plan_name: string | null
  current_credits: number
  monthly_credits: number
  total_credits_used: number
  plan_renew_at: string | null
  credits_usage_percentage: number
}

/**
 * Change plan request
 */
export interface ChangePlanRequest {
  plan_id: string
}

/**
 * Change plan response
 */
export interface ChangePlanResponse {
  success: boolean
  message: string
  new_plan_id: string
  new_plan_name: string
  new_credits: number
  plan_renew_at: string
}

// ==================== API Functions ====================

/**
 * Get current user billing information
 * @returns User billing info including credits and plan
 */
export async function getUserBilling(): Promise<UserBillingInfo> {
  const response = await apiClient.get<UserBillingInfo>('/billing/me')
  return response.data
}

/**
 * Change user plan
 * @param planId - Target plan ID (starter/basic/pro/ultimate)
 * @returns Change plan result
 */
export async function changePlan(planId: string): Promise<ChangePlanResponse> {
  const response = await apiClient.post<ChangePlanResponse>('/billing/change_plan', {
    plan_id: planId,
  })
  return response.data
}

/**
 * Consume credits (internal API)
 * @param amount - Amount of credits to consume
 * @returns Operation result
 */
export async function consumeCredits(amount: number): Promise<{
  success: boolean
  remaining_credits: number
}> {
  const response = await apiClient.post<{
    success: boolean
    remaining_credits: number
  }>('/billing/consume_credits', { amount })
  return response.data
}

/**
 * Add credits (internal API)
 * @param amount - Amount of credits to add
 * @returns Operation result
 */
export async function addCredits(amount: number): Promise<{
  success: boolean
  total_credits: number
}> {
  const response = await apiClient.post<{
    success: boolean
    total_credits: number
  }>('/billing/add_credits', { amount })
  return response.data
}

