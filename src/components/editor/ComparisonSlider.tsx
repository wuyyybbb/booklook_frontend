import { useState, useCallback, type ChangeEvent } from 'react'

interface ComparisonSliderProps {
  beforeImage: string
  afterImage: string
}

export default function ComparisonSlider({ beforeImage, afterImage }: ComparisonSliderProps) {
  const [position, setPosition] = useState(50)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPosition(Number(event.target.value))
  }, [])

  return (
    <div className="relative w-full h-full select-none">
      <img
        src={afterImage}
        alt="AI 结果"
        className="absolute inset-0 w-full h-full object-contain"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="原图"
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className="absolute inset-y-0 flex items-center pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="h-full w-px bg-white/70 shadow-[0_0_12px_rgba(0,0,0,0.45)]" />
        <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg" />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={handleChange}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 accent-primary cursor-pointer"
        aria-label="对比滑块"
      />
    </div>
  )
}

