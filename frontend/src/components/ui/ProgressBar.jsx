import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  showLabel = true,
  color = 'var(--accent-primary)',
  height = 8,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            Progress
          </span>
          <motion.span
            className="text-sm font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={displayValue}
          >
            {Math.round(displayValue)}%
          </motion.span>
        </div>
      )}
      
      <div 
        className="w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
