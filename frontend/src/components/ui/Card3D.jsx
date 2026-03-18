import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

export default function Card3D({ 
  children, 
  className = '', 
  intensity = 15,
  glowColor = 'rgba(124, 58, 237, 0.3)',
  gradient = false,
  glass = false,
  ...props 
}) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    const rotateXValue = (mouseY / (rect.height / 2)) * intensity
    const rotateYValue = (mouseX / (rect.width / 2)) * intensity
    
    setRotateX(-rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const baseClasses = glass 
    ? 'glass-card' 
    : gradient 
    ? 'gradient-border' 
    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)]'

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-2xl overflow-hidden ${baseClasses} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: isHovered 
          ? `0 20px 60px ${glowColor}, 0 0 0 1px rgba(255,255,255,0.1) inset`
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      {...props}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
          opacity: 0,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          x: isHovered ? ['-100%', '100%'] : '-100%',
        }}
        transition={{
          opacity: { duration: 0.3 },
          x: { duration: 0.8, ease: 'easeInOut' },
        }}
      />
      
      {/* Content */}
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}
