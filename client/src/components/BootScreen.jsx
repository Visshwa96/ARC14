import { useState, useEffect } from 'react'

function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing ARC-14 System...')

  useEffect(() => {
    const stages = [
      { text: 'Initializing ARC-14 System...', duration: 800 },
      { text: 'Loading Mirror-14 Engine...', duration: 800 },
      { text: 'Connecting to Local Database...', duration: 800 },
      { text: 'System Ready', duration: 600 },
    ]

    let currentStage = 0
    let accumulatedTime = 0

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2
        const elapsedTime = (newProgress / 100) * 3000

        if (elapsedTime > accumulatedTime + stages[currentStage]?.duration) {
          accumulatedTime += stages[currentStage].duration
          currentStage++
          if (currentStage < stages.length) {
            setLoadingText(stages[currentStage].text)
          }
        }

        return newProgress > 100 ? 100 : newProgress
      })
    }, 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-transparent bg-clip-text animate-pulse">
            ARC-14
          </div>
          <div className="text-xl md:text-2xl text-slate-400 font-light tracking-wider">
            Action · Reflection · Correction
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 md:w-96 mx-auto space-y-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-slate-400 text-sm animate-pulse">
            {loadingText}
          </div>
        </div>

        {/* Version Info */}
        <div className="text-slate-600 text-xs">
          v1.0.0 | Mirror-14 Engine
        </div>
      </div>
    </div>
  )
}

export default BootScreen
