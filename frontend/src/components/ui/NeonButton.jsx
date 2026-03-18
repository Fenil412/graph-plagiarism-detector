import { motion } from 'framer-motion'
import { useState } from 'react'

export default function NeonButton({ 
  children, 
  className = '',
  color = '#7c3aed',
  variant = 'solid',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variants = {
    solid: {
      background: color,
      color: '#fff',
      border: `2px solid ${color}`,
    },
    outline: {
      background: 'transparent',
      color: color,
      border: `2px solid ${color}`,
    },
    ghost: {
      background: 'transparent',
      color: color,
      border: '2px solid transparent',
    },
  }

  return (
    <motion.button
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold overflow-hidden ${sizes[size]} ${className}`}
      style={{
        ...variants[variant],
        boxShadow: isHovered 
          ? `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 10px ${color}20`
          : `0 0 10px ${color}40`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isPressed 
          ? `0 0 10px ${color}60, inset 0 0 20px ${color}30`
          : isHovered 
          ? `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 10px ${color}20`
          : `0 0 10px ${color}40`,
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Glow pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          opacity: 0,
        }}
        animate={{
          opacity: isHovered ? [0, 0.5, 0] : 0,
          scale: isHovered ? [1, 1.5, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
        }}
        animate={{
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </motion.button>
  )
}
