import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Header */}
      <header className="border-b border-dark-border backdrop-blur-sm">
        <div className="container-center py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-sm"></div>
              <span className="text-xl font-bold">Booklook｜形我</span>
            </div>
            <Link to="/editor" className="btn-primary">
              开始创作
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-center py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="title-h1 mb-6">
            形象由我，风格随心
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed">
            My look, my way.
          </p>
          <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
            专为服装摄影师、电商从业者、品牌运营者打造的 AI 视觉创作工具<br />
            一键换头 · 换背景 · 换姿势
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/editor" className="btn-primary text-lg px-8 py-4">
              开始使用
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              查看示例
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-center py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="card-hover">
            <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="title-h3 mb-3 text-primary">AI 换头</h3>
            <p className="text-text-secondary leading-relaxed">
              智能识别人脸特征，自然替换模特头像，保持原图风格与质感
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-hover">
            <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="title-h3 mb-3 text-accent">AI 换背景</h3>
            <p className="text-text-secondary leading-relaxed">
              精准抠图分割，一键更换拍摄背景，支持自定义与预设场景
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-hover">
            <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h3 className="title-h3 mb-3 text-primary">AI 换姿势</h3>
            <p className="text-text-secondary leading-relaxed">
              姿态迁移技术，改变模特姿势与动作，创造更多展示可能
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-center py-20">
        <div className="card bg-gradient-to-r from-dark-card to-dark-card/50 border-primary/20 text-center p-12 md:p-16">
          <h2 className="title-h2 mb-4">开始你的创作之旅</h2>
          <p className="text-text-secondary text-lg mb-8">
            无需摄影棚，无需模特，AI 即刻生成专业服装展示图
          </p>
          <Link to="/editor" className="btn-primary text-lg px-10 py-4 inline-block">
            立即体验
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 mt-20">
        <div className="container-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-text-tertiary text-sm">
              © 2025 Booklook｜形我. All rights reserved.
            </div>
            <div className="flex gap-6 text-text-tertiary text-sm">
              <a href="#" className="hover:text-primary transition-base">关于我们</a>
              <a href="#" className="hover:text-primary transition-base">使用条款</a>
              <a href="#" className="hover:text-primary transition-base">隐私政策</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

