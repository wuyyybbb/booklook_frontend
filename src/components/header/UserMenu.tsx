import { useState, useEffect, useRef } from 'react'
import { UserInfo, clearAuthInfo, isLoggedIn, getUserInfo as getStoredUserInfo } from '../../api/auth'
import { getUserBilling, UserBillingInfo } from '../../api/billing'
import { useNavigate } from 'react-router-dom'

interface UserMenuProps {
  className?: string
}

export default function UserMenu({ className = '' }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [billing, setBilling] = useState<UserBillingInfo | null>(null)
  const [loadingBilling, setLoadingBilling] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Load user info on mount
  useEffect(() => {
    if (isLoggedIn()) {
      const userInfo = getStoredUserInfo()
      setUser(userInfo)
    }
  }, [])

  // Load billing info when menu opens
  useEffect(() => {
    if (showMenu && !billing && user) {
      loadBillingInfo()
    }
  }, [showMenu, user])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const loadBillingInfo = async () => {
    setLoadingBilling(true)
    try {
      const billingData = await getUserBilling()
      setBilling(billingData)
    } catch (error) {
      console.error('Failed to load billing info:', error)
    } finally {
      setLoadingBilling(false)
    }
  }

  const handleLogout = () => {
    clearAuthInfo()
    setUser(null)
    setBilling(null)
    setShowMenu(false)
    navigate('/')
  }

  const handleRefreshCredits = () => {
    setBilling(null)
    loadBillingInfo()
  }

  if (!user) {
    return null
  }

  // Get display name (username or email prefix)
  const displayName = user.username || user.email.split('@')[0]

  // Get initials for avatar
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-card transition-base"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-sm font-medium">{initials}</span>
        </div>
        
        {/* Username */}
        <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
        
        {/* Dropdown Icon */}
        <svg
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-dark-border bg-dark-card/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-lg font-medium">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className="px-4 py-3 border-b border-dark-border">
            {loadingBilling ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : billing ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">剩余算力</span>
                  <button
                    onClick={handleRefreshCredits}
                    className="text-xs text-primary hover:text-primary/80 transition-base"
                  >
                    刷新
                  </button>
                </div>
                
                {/* Credits Display */}
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-3xl font-bold text-primary">
                    {billing.current_credits}
                  </span>
                  {billing.monthly_credits > 0 && (
                    <span className="text-sm text-text-secondary">
                      / {billing.monthly_credits}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {billing.monthly_credits > 0 && (
                  <div className="mb-2">
                    <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (billing.current_credits / billing.monthly_credits) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Plan Info */}
                {billing.current_plan_name && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">当前套餐</span>
                    <span className="font-medium text-primary">{billing.current_plan_name}</span>
                  </div>
                )}

                {/* Total Used */}
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-text-secondary">累计使用</span>
                  <span className="text-text-secondary">{billing.total_credits_used} 算力</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary">无法加载积分信息</p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setShowMenu(false)
                navigate('/')
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-dark-border/50 transition-base flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>返回首页</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-error hover:bg-dark-border/50 transition-base flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

