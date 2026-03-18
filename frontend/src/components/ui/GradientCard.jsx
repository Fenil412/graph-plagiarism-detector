import { motion } from 'framer-motion'
import { useState } from 'react'

export default function GradientCard({ 
  children, 
  className = '',
  gradient = 'primary',
  animated = true,
  hover3d = false,
  ...props 
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const gradients = {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #06b6d4 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  }

  const handleMouseMove = (e) => {
    if (!hover3d) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <motion.div
      className={`relative rounded-2xl p-[2px] overflow-hidden ${className}`}
      style={{
        background: gradients[gradient] || gradients.primary,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hover3d ? { scale: 1.02, rotateX: 5, rotateY: 5 } : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Animated gradient overlay */}
      {animated && (
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Inner content */}
      <div className="relative bg-[var(--bg-card)] rounded-[calc(1rem-2px)] h-full">
        {children}
      </div>
    </motion.div>
  )
}
