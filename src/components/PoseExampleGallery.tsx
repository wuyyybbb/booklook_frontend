import { useState } from 'react'

interface PoseExampleGalleryProps {
  totalGroups: number
}

export default function PoseExampleGallery({ totalGroups }: PoseExampleGalleryProps) {
  const [currentGroup, setCurrentGroup] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePrevGroup = () => {
    setCurrentGroup(prev => prev === 1 ? totalGroups : prev - 1)
  }

  const handleNextGroup = () => {
    setCurrentGroup(prev => prev === totalGroups ? 1 : prev + 1)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevGroup()
    } else if (e.key === 'ArrowRight') {
      handleNextGroup()
    } else if (e.key === 'Escape') {
      closeModal()
    }
  }

  return (
    <>
      {/* Compact Gallery View */}
      <div className="relative">
        {/* 2x2 Grid - 3:4 比例适配全身照 */}
        <div 
          className="grid grid-cols-2 gap-2 cursor-pointer group"
          onClick={openModal}
        >
          {/* Origin - Top Left */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-dark-border/50 group-hover:border-primary/50 transition-all bg-dark-card">
            <img
              src={`/Landing_Page_example_change_pose/${currentGroup}/origin.jpg`}
              alt="Origin pose"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-dark/80 text-white text-xs rounded">
              原图
            </div>
          </div>

          {/* Image 1 - Top Right */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-dark-border/50 group-hover:border-primary/50 transition-all bg-dark-card">
            <img
              src={`/Landing_Page_example_change_pose/${currentGroup}/1.png`}
              alt="Pose 1"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-dark text-xs rounded">
              效果1
            </div>
          </div>

          {/* Image 2 - Bottom Left */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-dark-border/50 group-hover:border-primary/50 transition-all bg-dark-card">
            <img
              src={`/Landing_Page_example_change_pose/${currentGroup}/2.png`}
              alt="Pose 2"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-dark text-xs rounded">
              效果2
            </div>
          </div>

          {/* Image 3 - Bottom Right */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-dark-border/50 group-hover:border-primary/50 transition-all bg-dark-card">
            <img
              src={`/Landing_Page_example_change_pose/${currentGroup}/3.png`}
              alt="Pose 3"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-dark text-xs rounded">
              效果3
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevGroup()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-dark-border hover:border-primary hover:bg-primary/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm text-text-tertiary">
            {currentGroup} / {totalGroups}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNextGroup()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-dark-border hover:border-primary hover:bg-primary/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Click to Expand Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
            点击查看大图
          </p>
        </div>
      </div>

      {/* Modal - Enlarged View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div 
            className="relative w-full max-w-5xl my-auto" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-primary transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Large 2x2 Grid - 适配屏幕，确保完整显示 */}
            <div className="grid grid-cols-2 gap-3 bg-dark-card p-3 rounded-lg border border-dark-border">
              {/* Origin - Top Left */}
              <div className="relative overflow-hidden rounded-sm border border-dark-border bg-dark-card flex items-center justify-center" style={{ minHeight: '300px', maxHeight: 'calc((100vh - 200px) / 2)' }}>
                <img
                  src={`/Landing_Page_example_change_pose/${currentGroup}/origin.jpg`}
                  alt="Origin pose"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '100%' }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-dark/90 text-white text-xs rounded">
                  原图
                </div>
              </div>

              {/* Image 1 - Top Right */}
              <div className="relative overflow-hidden rounded-sm border border-dark-border bg-dark-card flex items-center justify-center" style={{ minHeight: '300px', maxHeight: 'calc((100vh - 200px) / 2)' }}>
                <img
                  src={`/Landing_Page_example_change_pose/${currentGroup}/1.png`}
                  alt="Pose 1"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '100%' }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-dark text-xs rounded">
                  效果1
                </div>
              </div>

              {/* Image 2 - Bottom Left */}
              <div className="relative overflow-hidden rounded-sm border border-dark-border bg-dark-card flex items-center justify-center" style={{ minHeight: '300px', maxHeight: 'calc((100vh - 200px) / 2)' }}>
                <img
                  src={`/Landing_Page_example_change_pose/${currentGroup}/2.png`}
                  alt="Pose 2"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '100%' }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-dark text-xs rounded">
                  效果2
                </div>
              </div>

              {/* Image 3 - Bottom Right */}
              <div className="relative overflow-hidden rounded-sm border border-dark-border bg-dark-card flex items-center justify-center" style={{ minHeight: '300px', maxHeight: 'calc((100vh - 200px) / 2)' }}>
                <img
                  src={`/Landing_Page_example_change_pose/${currentGroup}/3.png`}
                  alt="Pose 3"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '100%' }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-dark text-xs rounded">
                  效果3
                </div>
              </div>
            </div>

            {/* Modal Navigation */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <button
                onClick={handlePrevGroup}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-card border border-dark-border hover:border-primary hover:bg-primary/10 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-white text-lg">
                组 {currentGroup} / {totalGroups}
              </span>

              <button
                onClick={handleNextGroup}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-card border border-dark-border hover:border-primary hover:bg-primary/10 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Keyboard Hint */}
            <div className="text-center mt-3 text-text-tertiary text-sm">
              使用 ← → 键切换 | ESC 关闭
            </div>
          </div>
        </div>
      )}
    </>
  )
}

