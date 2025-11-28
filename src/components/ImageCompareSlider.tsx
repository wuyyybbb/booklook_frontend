import { useState, useRef, useEffect } from 'react'

interface ImageCompareSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export default function ImageCompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After'
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    
    // 限制在 0-100 之间
    const newPosition = Math.max(0, Math.min(100, percentage))
    setSliderPosition(newPosition)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  useEffect(() => {
    if (isDragging) {
      // 禁用文本选择
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        // 恢复文本选择
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
        
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[3/4] overflow-hidden rounded-lg border border-dark-border bg-dark-card cursor-ew-resize group select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* After Image (Full) - AI 处理 */}
      <div className="absolute inset-0">
        <img 
          src={afterImage} 
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* After Label - 左上角 */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-dark text-sm font-medium rounded-full">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Clipped) - 原图 */}
      <div 
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <img 
          src={beforeImage} 
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Before Label - 右上角，深灰色背景 */}
        <div 
          className="absolute top-4 right-4 px-3 py-1 text-white text-sm font-medium rounded-full"
          style={{ backgroundColor: '#111111' }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line & Handle - 弱化样式 */}
      <div 
        className="absolute top-0 bottom-0 bg-primary/20 group-hover:bg-primary/30 transition-all"
        style={{ 
          left: `${sliderPosition}%`,
          width: '2px'
        }}
      >
        {/* Slider Handle - 缩小按钮 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary/30 rounded-full border-2 border-primary/50 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/40 transition-all">
          {/* Left Arrow */}
          <svg className="w-3 h-3 text-white -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          {/* Right Arrow */}
          <svg className="w-3 h-3 text-white -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

