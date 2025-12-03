import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

type FeatureType = 'HEAD_SWAP' | 'BACKGROUND_CHANGE' | 'POSE_CHANGE' | null

export default function FeatureSelection() {
  const navigate = useNavigate()
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null)

  const handleStartEditing = () => {
    if (selectedFeature) {
      // 跳转到编辑页面，并传递选中的模式
      navigate(`/editor?mode=${selectedFeature}`)
    }
  }

  const features = [
    {
      id: 'HEAD_SWAP' as FeatureType,
      title: 'AI 换头',
      subtitle: 'Head Swap',
      description: '智能识别人脸特征，自然替换模特头像，保持原图风格与质感',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
      color: 'primary',
      features: [
        '智能人脸识别',
        '自然光影匹配',
        '保持原图质感',
        '批量处理支持'
      ]
    },
    {
      id: 'BACKGROUND_CHANGE' as FeatureType,
      title: 'AI 换背景',
      subtitle: 'Background Change',
      description: '精准抠图分割，一键更换拍摄背景，支持自定义与预设场景',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
      color: 'accent',
      features: [
        '精准智能抠图',
        '自定义背景',
        '预设场景库',
        '边缘优化'
      ]
    },
    {
      id: 'POSE_CHANGE' as FeatureType,
      title: 'AI 换姿势',
      subtitle: 'Pose Transfer',
      description: '姿态迁移技术，改变模特姿势与动作，创造更多展示可能',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      ),
      color: 'primary',
      features: [
        '姿态智能迁移',
        '保持服装细节',
        '多样化动作',
        '自然流畅'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-dark-border backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-base">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-sm flex items-center justify-center">
                <span className="text-dark font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">Booklook</span>
            </Link>
            
            <Link to="/" className="btn-ghost">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="title-h1 mb-4">选择你的创作模式</h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            选择一个 AI 功能开始创作，每个功能都经过专业优化
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id)}
              className={`
                relative card cursor-pointer transition-all duration-300
                ${selectedFeature === feature.id 
                  ? `ring-2 ring-${feature.color} scale-105 shadow-2xl` 
                  : 'hover:scale-102 hover:border-primary/30'
                }
              `}
            >
              {/* Selected Badge */}
              {selectedFeature === feature.id && (
                <div className={`absolute -top-3 -right-3 w-10 h-10 bg-${feature.color} rounded-full flex items-center justify-center shadow-lg`}>
                  <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`w-20 h-20 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-6 mx-auto`}>
                <svg className={`w-12 h-12 text-${feature.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {feature.icon}
                </svg>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className={`title-h3 mb-1 text-${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-text-tertiary text-sm mb-3">{feature.subtitle}</p>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                {feature.features.map((item, index) => (
                  <div key={index} className="flex items-center text-sm text-text-secondary">
                    <svg className={`w-4 h-4 text-${feature.color} mr-2 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleStartEditing}
            disabled={!selectedFeature}
            className={`
              btn-primary text-lg px-12 py-4
              ${!selectedFeature && 'opacity-50 cursor-not-allowed'}
              ${selectedFeature && 'glow-primary'}
            `}
          >
            {selectedFeature ? '开始创作' : '请先选择一个功能'}
          </button>
          <p className="text-text-tertiary text-sm mt-4">
            选择功能后点击按钮进入编辑页面
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="card bg-dark-card/50 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-text-primary">不确定选择哪个功能？</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  • <strong>换头</strong>：适合需要更换模特但保留服装和场景的情况
                  <br />
                  • <strong>换背景</strong>：适合需要更改拍摄环境或添加场景效果
                  <br />
                  • <strong>换姿势</strong>：适合需要展示不同动作和姿态的服装展示
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

