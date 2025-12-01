import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import LoginModal from '../components/auth/LoginModal'
import ImageCompareSlider from '../components/ImageCompareSlider'
import PoseExampleGallery from '../components/PoseExampleGallery'
import { getUserInfo, clearAuthInfo, isLoggedIn, type UserInfo } from '../api/auth'

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null) // 选中的套餐
  const [showBetaModal, setShowBetaModal] = useState(false) // 内测弹窗
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


  // 计算图片的 clip-path，实现渐进式透明效果
  const [imageClipPaths, setImageClipPaths] = useState<Map<string, string>>(new Map())

  // 监听滚动，动态计算每个图片的裁剪区域
  useEffect(() => {
    const updateClipPaths = () => {
      const items = document.querySelectorAll('.scrolling-item')
      const viewportCenter = window.innerWidth / 2
      const newClipPaths = new Map<string, string>()
      const newPlayingVideos = new Set<number>()
      
      items.forEach((item) => {
        const itemNum = parseInt(item.getAttribute('data-item-num') || '0')
        if (itemNum > 0) {
          const rect = item.getBoundingClientRect()
          const itemLeft = rect.left
          const itemRight = rect.right
          const itemWidth = rect.width
          
          // 判断图片是否跨越中心线
          if (itemLeft < viewportCenter && itemRight > viewportCenter) {
            // 图片正在经过中心线
            // 计算中心线在图片中的相对位置（百分比）
            const centerPositionInItem = (viewportCenter - itemLeft) / itemWidth
            const clipPercentage = centerPositionInItem * 100
            
            // 使用 clip-path 只显示中心线右边的部分
            // inset(top right bottom left)
            newClipPaths.set(`img-${itemNum}`, `inset(0 0 0 ${clipPercentage}%)`)
            
            // 视频开始播放
            newPlayingVideos.add(itemNum)
            
            // 调试日志
            if (Math.random() < 0.05) { // 5% 概率输出
              console.log(`📐 Item ${itemNum}: Center at ${clipPercentage.toFixed(1)}% | Left ${(100-clipPercentage).toFixed(1)}% = video, Right ${clipPercentage.toFixed(1)}% = image`)
            }
          } else if (itemRight <= viewportCenter) {
            // 图片完全在中心线左边 - 完全裁剪（显示视频）
            newClipPaths.set(`img-${itemNum}`, 'inset(0 100% 0 0)')
            newPlayingVideos.add(itemNum)
          } else {
            // 图片完全在中心线右边 - 完全显示
            newClipPaths.set(`img-${itemNum}`, 'inset(0 0 0 0)')
          }
        }
      })
      
      setImageClipPaths(newClipPaths)
      
      // 更新视频播放状态
      newPlayingVideos.forEach(num => {
        const video = videoRefs.current.get(num)
        if (video && video.paused) {
          video.play().catch(err => console.log('Video play failed:', err))
        }
      })
      
      // 停止不在中心的视频
      playingVideos.forEach(num => {
        if (!newPlayingVideos.has(num)) {
          const video = videoRefs.current.get(num)
          if (video && !video.paused) {
            video.pause()
            video.currentTime = 0
          }
        }
      })
      
      setPlayingVideos(newPlayingVideos)
    }

    // 初始更新
    updateClipPaths()

    // 持续更新（每 50ms 一次，更流畅）
    const interval = setInterval(updateClipPaths, 50)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

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
                {/* First Set - 图片 1 到 10 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={`first-${num}`}
                    className="scrolling-item"
                    data-item-num={num}
                  >
                    <div className="relative group">
                      {/* 容器：固定宽度 210px x 314px */}
                      <div 
                        className="relative overflow-hidden" 
                        style={{ 
                          width: '210px',
                          height: '314px' 
                        }}
                      >
                        {/* 底层：视频 - z-index: 0 */}
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
                            <source src={`/Landing_Page_hero_webm/${num}.webm`} type="video/webm" />
                          </video>
                        </div>
                        
                        {/* 上层：图片 - z-index: 10，使用 clip-path 动态裁剪 */}
                        <div 
                          className="absolute inset-0 z-10 transition-all duration-100"
                          style={{
                            clipPath: imageClipPaths.get(`img-${num}`) || 'inset(0 0 0 0)'
                          }}
                        >
                          <img
                            src={`/Landing_Page_hero_image/${num}.png`}
                            alt={`Fashion ${num}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Hover 效果 */}
                        <div className="absolute inset-0 z-20 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Second Set - 重复 1 到 10，用于无缝循环 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={`second-${num}`}
                    className="scrolling-item"
                    data-item-num={num + 10}
                  >
                    <div className="relative group">
                      {/* 容器：固定宽度 210px x 314px */}
                      <div 
                        className="relative overflow-hidden" 
                        style={{ 
                          width: '210px',
                          height: '314px' 
                        }}
                      >
                        {/* 底层：视频 - z-index: 0 */}
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
                            <source src={`/Landing_Page_hero_webm/${num}.webm`} type="video/webm" />
                          </video>
                        </div>
                        
                        {/* 上层：图片 - z-index: 10，使用 clip-path 动态裁剪 */}
                        <div 
                          className="absolute inset-0 z-10 transition-all duration-100"
                          style={{
                            clipPath: imageClipPaths.get(`img-${num + 10}`) || 'inset(0 0 0 0)'
                          }}
                        >
                          <img
                            src={`/Landing_Page_hero_image/${num}.png`}
                            alt={`Fashion ${num}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Hover 效果 */}
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
              {/* 展示案例 - 替换原来的图标容器 */}
              <div className="mb-6">
                <PoseExampleGallery totalGroups={3} />
              </div>
              
              <h3 className="title-h3 mb-3 text-primary">AI 换姿势</h3>
              <p className="text-text-secondary leading-relaxed">
                姿态迁移技术，自由改变模特动作与姿势，创造更多展示可能性
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies - Before/After Comparison */}
      <section className="py-20 bg-dark-card/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-h2 mb-4">案例展示</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              拖动中间滑块，查看 AI 处理前后的效果对比
            </p>
          </div>
          
          {/* Scrolling Grid Container with Fade Effect - Desktop Only */}
          <div className="relative max-w-[1400px] mx-auto hidden lg:block">
            {/* Top Fade Gradient - 精确的多级淡出效果 */}
            <div className="absolute top-0 left-0 right-0 h-48 z-10 pointer-events-none"
                 style={{
                   background: 'linear-gradient(to bottom, rgba(23, 23, 23, 1) 0%, rgba(23, 23, 23, 1) 5%, rgba(23, 23, 23, 0.95) 10%, rgba(23, 23, 23, 0.9) 20%, rgba(23, 23, 23, 0.6) 40%, rgba(23, 23, 23, 0.3) 60%, rgba(23, 23, 23, 0.1) 80%, transparent 100%)'
                 }}>
            </div>
            
            {/* Bottom Fade Gradient - 精确的多级淡出效果 */}
            <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
                 style={{
                   background: 'linear-gradient(to top, rgba(23, 23, 23, 1) 0%, rgba(23, 23, 23, 1) 5%, rgba(23, 23, 23, 0.95) 10%, rgba(23, 23, 23, 0.9) 20%, rgba(23, 23, 23, 0.6) 40%, rgba(23, 23, 23, 0.3) 60%, rgba(23, 23, 23, 0.1) 80%, transparent 100%)'
                 }}>
            </div>
            
            {/* Scrolling Columns */}
            <div className="flex gap-6 h-[800px] overflow-hidden">
              {/* Column 1 - Scroll Up */}
              <div className="flex-1 animate-scroll-up">
                <div className="flex flex-col gap-6">
                  {[
                    { num: 1, name: '岩石海岸风光' },
                    { num: 6, name: '庭院园林风景' },
                    { num: 1, name: '岩石海岸风光' },
                    { num: 6, name: '庭院园林风景' }
                  ].map(({ num, name }, idx) => (
                    <div key={`col1-${idx}`} className="group flex-shrink-0">
                      <ImageCompareSlider
                        beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                        afterImage={`/Landing_Page_compare_image/${num}.png`}
                        beforeLabel="原图"
                        afterLabel="AI 处理"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-tertiary">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Column 2 - Scroll Down */}
              <div className="flex-1 animate-scroll-down">
                <div className="flex flex-col gap-6">
                  {[
                    { num: 2, name: '海滨沙滩写真' },
                    { num: 7, name: '峡谷地貌奇观' },
                    { num: 2, name: '海滨沙滩写真' },
                    { num: 7, name: '峡谷地貌奇观' }
                  ].map(({ num, name }, idx) => (
                    <div key={`col2-${idx}`} className="group flex-shrink-0">
                      <ImageCompareSlider
                        beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                        afterImage={`/Landing_Page_compare_image/${num}.png`}
                        beforeLabel="原图"
                        afterLabel="AI 处理"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-tertiary">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Column 3 - Scroll Up */}
              <div className="flex-1 animate-scroll-up">
                <div className="flex flex-col gap-6">
                  {[
                    { num: 3, name: '海边礁石景致' },
                    { num: 8, name: '红土地质公园' },
                    { num: 3, name: '海边礁石景致' },
                    { num: 8, name: '红土地质公园' }
                  ].map(({ num, name }, idx) => (
                    <div key={`col3-${idx}`} className="group flex-shrink-0">
                      <ImageCompareSlider
                        beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                        afterImage={`/Landing_Page_compare_image/${num}.png`}
                        beforeLabel="原图"
                        afterLabel="AI 处理"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-tertiary">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Column 4 - Scroll Down */}
              <div className="flex-1 animate-scroll-down">
                <div className="flex flex-col gap-6">
                  {[
                    { num: 4, name: '都市街拍风尚' },
                    { num: 9, name: '海岸礁石风光' },
                    { num: 4, name: '都市街拍风尚' },
                    { num: 9, name: '海岸礁石风光' }
                  ].map(({ num, name }, idx) => (
                    <div key={`col4-${idx}`} className="group flex-shrink-0">
                      <ImageCompareSlider
                        beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                        afterImage={`/Landing_Page_compare_image/${num}.png`}
                        beforeLabel="原图"
                        afterLabel="AI 处理"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-tertiary">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Column 5 - Scroll Up */}
              <div className="flex-1 animate-scroll-up">
                <div className="flex flex-col gap-6">
                  {[
                    { num: 5, name: '山林自然风光' },
                    { num: 10, name: '海景沙滩风情' },
                    { num: 5, name: '山林自然风光' },
                    { num: 10, name: '海景沙滩风情' }
                  ].map(({ num, name }, idx) => (
                    <div key={`col5-${idx}`} className="group flex-shrink-0">
                      <ImageCompareSlider
                        beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                        afterImage={`/Landing_Page_compare_image/${num}.png`}
                        beforeLabel="原图"
                        afterLabel="AI 处理"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-text-tertiary">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Static Grid for Mobile/Tablet */}
          <div className="lg:hidden grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { num: 1, name: '岩石海岸风光' },
              { num: 2, name: '海滨沙滩写真' },
              { num: 3, name: '海边礁石景致' },
              { num: 4, name: '都市街拍风尚' },
              { num: 5, name: '山林自然风光' },
              { num: 6, name: '庭院园林风景' }
            ].map(({ num, name }) => (
              <div key={num} className="group">
                <ImageCompareSlider
                  beforeImage={`/Landing_Page_compare_image/${num}-1.png`}
                  afterImage={`/Landing_Page_compare_image/${num}.png`}
                  beforeLabel="原图"
                  afterLabel="AI 处理"
                />
                <div className="mt-3 text-center">
                  <p className="text-xs text-text-tertiary">{name}</p>
                </div>
              </div>
            ))}
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
                onClick={() => setShowBetaModal(true)}
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
                onClick={() => setShowBetaModal(true)}
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
                onClick={() => setShowBetaModal(true)}
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
                onClick={() => setShowBetaModal(true)}
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

        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
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

      {/* 内测弹窗 */}
      {showBetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBetaModal(false)}
          />
          
          {/* 弹窗内容 */}
          <div className="relative bg-dark-card border-2 border-primary/50 rounded-lg shadow-2xl max-w-lg w-full p-8 transform transition-all">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowBetaModal(false)}
              className="absolute top-4 right-4 text-text-tertiary hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-3xl font-bold text-center mb-4 text-primary">
              内测阶段
            </h3>

            {/* 内容 */}
            <div className="text-center space-y-4 mb-6">
              <p className="text-xl text-text-primary leading-relaxed">
                请联系工作人员领取内测码
              </p>
              <p className="text-2xl font-bold text-primary animate-pulse">
                🎉 免费试用 🎉
              </p>
              <p className="text-text-secondary">
                内测期间，所有功能均可<span className="text-primary font-semibold">完全免费</span>使用
              </p>
            </div>

            {/* 按钮 */}
            <div className="space-y-3">
              <button
                onClick={() => setShowBetaModal(false)}
                className="w-full px-6 py-3 bg-primary text-dark font-semibold hover:bg-primary/90 transition-all duration-300 rounded-sm"
              >
                我知道了
              </button>
              <p className="text-xs text-text-tertiary text-center">
                如需内测码，请联系客服微信：<span className="text-primary">Formy_AI</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

