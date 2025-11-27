import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import LoginModal from '../components/auth/LoginModal'
import { getUserInfo, clearAuthInfo, isLoggedIn, type UserInfo } from '../api/auth'

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null) // 选中的套餐
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set()) // 正在播放的视频
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map()) // 视频元素引用

  // 页面加载时检查登录状态
  useEffect(() => {
    if (isLoggedIn()) {
      const userInfo = getUserInfo()
      setUser(userInfo)
    }
  }, [])

  // 登录成功回调
  const handleLoginSuccess = () => {
    const userInfo = getUserInfo()
    setUser(userInfo)
  }

  // 登出
  const handleLogout = () => {
    clearAuthInfo()
    setUser(null)
    setShowUserMenu(false)
  }

  // 平滑滚动到指定区域
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 处理视频播放/暂停
  const handleVideoPlayback = useCallback((itemNum: number, shouldPlay: boolean) => {
    const video = videoRefs.current.get(itemNum)
    if (!video) return

    if (shouldPlay) {
      if (video.paused) {
        video.play().catch(err => console.log('Video play failed:', err))
      }
      setPlayingVideos(prev => {
        const newSet = new Set(prev)
        newSet.add(itemNum)
        return newSet
      })
    } else {
      if (!video.paused) {
        video.pause()
        video.currentTime = 0 // 重置视频到开始
      }
      setPlayingVideos(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemNum)
        return newSet
      })
    }
  }, [])

  // 监听滚动，检测元素是否在屏幕中间
  useEffect(() => {
    const checkItemPosition = () => {
      const items = document.querySelectorAll('.scrolling-item')
      const viewportCenter = window.innerWidth / 2
      const centerThreshold = 150 // 中心线左右 150px 范围内算作"在中间"
      
      items.forEach((item) => {
        const itemNum = parseInt(item.getAttribute('data-item-num') || '0')
        if (itemNum > 0) {
          const rect = item.getBoundingClientRect()
          const itemCenter = rect.left + rect.width / 2
          
          // 检测元素中心是否在视口中心附近
          const isInCenter = Math.abs(itemCenter - viewportCenter) < centerThreshold
          
          // 调试日志（可以在开发时查看）
          if (isInCenter && !playingVideos.has(itemNum)) {
            console.log(`Item ${itemNum} reached center, playing video...`)
          }
          
          handleVideoPlayback(itemNum, isInCenter)
        }
      })
    }

    // 初始检查
    checkItemPosition()

    // 监听动画，每帧检查位置
    const interval = setInterval(checkItemPosition, 100) // 每 100ms 检查一次
    
    return () => {
      clearInterval(interval)
    }
  }, [handleVideoPlayback, playingVideos])

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-dark-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-sm flex items-center justify-center">
                <span className="text-dark font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">Formy</span>
            </div>
            
            {/* Nav */}
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <button 
                onClick={() => scrollToSection('advantages')} 
                className="text-text-secondary hover:text-primary transition-base"
              >
                优势
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-text-secondary hover:text-primary transition-base"
              >
                功能
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-text-secondary hover:text-primary transition-base"
              >
                价格
              </button>
              
              {/* 登录/用户信息 */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-6 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-dark transition-all duration-300 rounded-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user.username || user.email.split('@')[0]}</span>
                  </button>
                  
                  {/* 用户菜单 */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-sm shadow-xl z-50">
                      <div className="p-3 border-b border-dark-border">
                        <div className="text-xs text-text-tertiary">登录邮箱</div>
                        <div className="text-sm text-text-primary truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/editor"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-dark hover:text-primary transition-base"
                        onClick={() => setShowUserMenu(false)}
                      >
                        我的工作台
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-accent hover:bg-dark transition-base"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-dark transition-all duration-300 rounded-sm"
                >
                  登录
                </button>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden btn-ghost">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Background Tech Grid */}
        <div className="absolute inset-0 tech-grid-bg opacity-30"></div>
        
        {/* Decorative Corners */}
        <div className="absolute top-32 left-8 w-32 h-32 border-l-2 border-t-2 border-primary/20"></div>
        <div className="absolute top-32 right-8 w-32 h-32 border-r-2 border-t-2 border-primary/20"></div>
        <div className="absolute bottom-32 left-8 w-32 h-32 border-l-2 border-b-2 border-primary/20"></div>
        <div className="absolute bottom-32 right-8 w-32 h-32 border-r-2 border-b-2 border-primary/20"></div>
        
        <div className="relative container mx-auto px-6 py-20">
          {/* Main Content - Slogan */}
          <div className="max-w-5xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-cyan-400">
                My Look, My Way
              </span>
            </h1>
            
            <p className="text-text-secondary text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              专为服装人而生的商用级 AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/features" className="btn-primary text-lg px-10 py-4 glow-primary">
                开始创作
              </Link>
              <button className="btn-secondary text-lg px-10 py-4">
                观看演示
              </button>
            </div>
          </div>

          {/* Scrolling Product Showcase with Compare Effect */}
          <div className="relative w-full overflow-hidden">
            {/* Compare Line - Center */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent z-20 transform -translate-x-1/2">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Scrolling Images Container */}
            <div className="scrolling-wrapper py-8">
              <div className="scrolling-content">
                {/* First Set */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={`first-${num}`}
                    className="scrolling-item"
                    data-item-num={num}
                  >
                    <div className="relative group">
                      {/* 容器：固定宽度，图片和视频重叠 */}
                      <div 
                        className="relative overflow-hidden" 
                        style={{ 
                          width: '210px',
                          height: '314px' 
                        }}
                      >
                        {/* 底层：视频（z-index: 0） */}
                        <div className="absolute inset-0 z-0">
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current.set(num, el)
                            }}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                          >
                            <source src={`/Landing_Page_hero_webm/1 (${num}).webm`} type="video/webm" />
                          </video>
                        </div>
                        
                        {/* 上层：图片（z-index: 10），通过 clip-path 控制显示区域 */}
                        <div 
                          className="absolute inset-0 z-10 transition-all duration-700"
                          style={{
                            clipPath: playingVideos.has(num) 
                              ? 'inset(0 0 0 50%)' // 只显示右半部分（左侧被裁剪，露出视频）
                              : 'inset(0 0 0 0)'   // 显示全部（覆盖视频）
                          }}
                        >
                          <img
                            src={`/Landing_Page_hero_image/1 (${num}).png`}
                            alt={`Fashion ${num}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        
                        {/* Subtle Glow Effect on Hover */}
                        <div className="absolute inset-0 z-20 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate Set for Seamless Loop */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={`second-${num}`}
                    className="scrolling-item"
                    data-item-num={num + 10}
                  >
                    <div className="relative group">
                      {/* 容器：固定宽度，图片和视频重叠 */}
                      <div 
                        className="relative overflow-hidden" 
                        style={{ 
                          width: '210px',
                          height: '314px' 
                        }}
                      >
                        {/* 底层：视频（z-index: 0） */}
                        <div className="absolute inset-0 z-0">
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current.set(num + 10, el)
                            }}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                          >
                            <source src={`/Landing_Page_hero_webm/1 (${num}).webm`} type="video/webm" />
                          </video>
                        </div>
                        
                        {/* 上层：图片（z-index: 10），通过 clip-path 控制显示区域 */}
                        <div 
                          className="absolute inset-0 z-10 transition-all duration-700"
                          style={{
                            clipPath: playingVideos.has(num + 10) 
                              ? 'inset(0 0 0 50%)' // 只显示右半部分（左侧被裁剪，露出视频）
                              : 'inset(0 0 0 0)'   // 显示全部（覆盖视频）
                          }}
                        >
                          <img
                            src={`/Landing_Page_hero_image/1 (${num}).png`}
                            alt={`Fashion ${num}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        
                        {/* Subtle Glow Effect on Hover */}
                        <div className="absolute inset-0 z-20 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Fade on Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Value Props - Video + Stats */}
      <section id="advantages" className="py-20 bg-dark-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-h2 mb-4">产品优势</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              10 倍效率提升，80% 成本降低，全天候 AI 服务
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* 左右布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：视频容器 */}
              <div className="relative group">
                <div className="aspect-video rounded-lg overflow-hidden border border-dark-border bg-dark shadow-2xl">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/landing/guide-demo.mp4" type="video/mp4" />
                    您的浏览器不支持视频播放
                  </video>
                </div>
                {/* 视频装饰边框 */}
                <div className="absolute inset-0 rounded-lg border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-500 pointer-events-none"></div>
              </div>

              {/* 右侧：数据指标 */}
              <div className="space-y-12" style={{ marginLeft: '200px' }}>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="text-6xl md:text-7xl font-bold text-primary">10x</div>
                  </div>
                  <div>
                    <div className="text-xl text-text-secondary">处理速度提升</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="text-6xl md:text-7xl font-bold text-primary">80%</div>
                  </div>
                  <div>
                    <div className="text-xl text-text-secondary">成本降低</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="text-6xl md:text-7xl font-bold text-primary">24/7</div>
                  </div>
                  <div>
                    <div className="text-xl text-text-secondary">全天候服务</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-h2 mb-4">核心功能</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              AI 驱动的视觉创作工具，让服装展示更简单、更高效
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="card-hover group">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-dark-card rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <svg className="w-24 h-24 text-primary group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="title-h3 mb-3 text-primary">AI 换头</h3>
              <p className="text-text-secondary leading-relaxed">
                智能人脸识别与替换，保持自然光影与细节，一键生成专业级效果
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover group">
              <div className="aspect-square bg-gradient-to-br from-accent/10 to-dark-card rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <svg className="w-24 h-24 text-accent group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="title-h3 mb-3 text-accent">AI 换背景</h3>
              <p className="text-text-secondary leading-relaxed">
                精准智能抠图，支持自定义背景或预设场景，打造理想拍摄环境
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover group">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-dark-card rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <svg className="w-24 h-24 text-primary group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="title-h3 mb-3 text-primary">AI 换姿势</h3>
              <p className="text-text-secondary leading-relaxed">
                姿态迁移技术，自由改变模特动作与姿势，创造更多展示可能性
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-h2 mb-4">订阅计划与价格</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              选择适合您的套餐，开始 AI 创作之旅
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Starter Plan */}
            <div className={`card group hover:border-primary/50 transition-all duration-300 ${selectedPlan === 'starter' ? 'border-primary' : ''}`}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-tertiary mb-2">STARTER</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-primary">¥49</span>
                  <span className="text-text-tertiary">/月</span>
                </div>
                <div className="text-sm text-accent">每月节省 ¥10</div>
                <div className="text-sm text-text-tertiary line-through">¥59/月</div>
              </div>

              <div className="mb-6 pb-6 border-b border-dark-border">
                <div className="text-text-secondary">每月 <span className="text-primary font-semibold">2000</span> 算力</div>
              </div>

              <button 
                onClick={() => setSelectedPlan('starter')}
                className="w-full mb-6 px-8 py-3 bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-dark transition-all duration-300 rounded-sm"
              >
                选择方案
              </button>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-text-primary mb-3">功能特色</div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>基础 AI 换头功能</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>约 50 张图片生成</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>标准处理速度</span>
                </div>
              </div>
            </div>

            {/* Basic Plan */}
            <div className={`card group hover:border-primary/50 transition-all duration-300 ${selectedPlan === 'basic' ? 'border-primary' : ''}`}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-tertiary mb-2">BASIC</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-primary">¥99</span>
                  <span className="text-text-tertiary">/月</span>
                </div>
                <div className="text-sm text-accent">每月节省 ¥20</div>
                <div className="text-sm text-text-tertiary line-through">¥119/月</div>
              </div>

              <div className="mb-6 pb-6 border-b border-dark-border">
                <div className="text-text-secondary">每月 <span className="text-primary font-semibold">5000</span> 算力</div>
              </div>

              <button 
                onClick={() => setSelectedPlan('basic')}
                className="w-full mb-6 px-8 py-3 bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-dark transition-all duration-300 rounded-sm"
              >
                选择方案
              </button>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-text-primary mb-3">功能特色</div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>全部 AI 功能</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>约 120 张图片生成</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>优先处理速度</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>批量处理</span>
                </div>
              </div>
            </div>

            {/* Pro Plan - Recommended */}
            <div className={`card border-primary/50 group hover:border-primary transition-all duration-300 relative ${selectedPlan === 'pro' ? 'border-primary' : ''}`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-dark text-xs font-bold px-4 py-1 rounded-full">推荐</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-tertiary mb-2">PRO</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-primary">¥199</span>
                  <span className="text-text-tertiary">/月</span>
                </div>
                <div className="text-sm text-accent">每月节省 ¥50</div>
                <div className="text-sm text-text-tertiary line-through">¥249/月</div>
              </div>

              <div className="mb-6 pb-6 border-b border-dark-border">
                <div className="text-text-secondary">每月 <span className="text-primary font-semibold">12000</span> 算力</div>
              </div>

              <button 
                onClick={() => setSelectedPlan('pro')}
                className="w-full mb-6 px-8 py-3 bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-dark transition-all duration-300 rounded-sm"
              >
                选择方案
              </button>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-text-primary mb-3">功能特色</div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>全部 AI 功能</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>约 300 张图片生成</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>极速处理</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>高级批量处理</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>优先客服支持</span>
                </div>
              </div>
            </div>

            {/* Ultimate Plan */}
            <div className={`card group hover:border-primary/50 transition-all duration-300 ${selectedPlan === 'ultimate' ? 'border-primary' : ''}`}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-tertiary mb-2">ULTIMATE</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-primary">¥399</span>
                  <span className="text-text-tertiary">/月</span>
                </div>
                <div className="text-sm text-accent">每月节省 ¥100</div>
                <div className="text-sm text-text-tertiary line-through">¥499/月</div>
              </div>

              <div className="mb-6 pb-6 border-b border-dark-border">
                <div className="text-text-secondary">每月 <span className="text-primary font-semibold">30000</span> 算力</div>
              </div>

              <button 
                onClick={() => setSelectedPlan('ultimate')}
                className="w-full mb-6 px-8 py-3 bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-dark transition-all duration-300 rounded-sm"
              >
                选择方案
              </button>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-text-primary mb-3">功能特色</div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>全部 AI 功能</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>约 750 张图片生成</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>最高优先级处理</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>无限批量处理</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>专属客服支持</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>API 接口访问</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-text-tertiary text-sm">
              所有套餐均支持随时取消 · 年付享受额外折扣
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-dark to-dark-card">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="title-h1 mb-6">
              开始你的 AI 创作之旅
            </h2>
            <p className="text-text-secondary text-xl mb-12 max-w-2xl mx-auto">
              无需昂贵的摄影棚，无需聘请模特
              <br />
              AI 即刻生成专业服装展示图
            </p>
            <Link to="/features" className="btn-primary text-lg px-12 py-4 glow-primary inline-block">
              立即体验
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-dark-border py-12 bg-dark-card/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-sm"></div>
              <span className="text-lg font-bold">Formy｜形我</span>
            </div>
            <div className="flex gap-8 text-text-tertiary text-sm">
              <a href="#" className="hover:text-primary transition-base">关于我们</a>
              <a href="#" className="hover:text-primary transition-base">使用条款</a>
              <a href="#" className="hover:text-primary transition-base">隐私政策</a>
              <a href="#" className="hover:text-primary transition-base">联系我们</a>
            </div>
          </div>
          <div className="mt-8 text-center text-text-tertiary text-sm">
            © 2025 Formy｜形我. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .scrolling-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .scrolling-content {
          display: flex;
          gap: 2rem;
          animation: scroll-left 60s linear infinite;
          width: fit-content;
        }

        .scrolling-content:hover {
          animation-play-state: paused;
        }

        .scrolling-item {
          flex-shrink: 0;
          position: relative;
        }

        /* Compare effect when item is near center */
        .scrolling-item:hover {
          z-index: 30;
        }

        /* Minimal glow effect - no visible border */
        .scrolling-item::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(45deg, transparent, rgba(0, 217, 255, 0.05), transparent);
          opacity: 0;
          transition: opacity 0.5s;
          z-index: -1;
        }

        .scrolling-item:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

