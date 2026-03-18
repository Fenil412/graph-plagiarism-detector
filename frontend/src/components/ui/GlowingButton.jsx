import { motion } from 'framer-motion'
import { useState } from 'react'

export default function GlowingButton({ children, onClick, className = '', variant = 'primary' }) {
  const [isHovered, setIsHovered] = useState(false)

  const variants = {
    primary: {
      bg: 'bg-gradient-to-r from-purple-600 to-cyan-500',
      glow: 'shadow-[0_0_30px_rgba(124,58,237,0.6)]',
      hoverGlow: 'shadow-[0_0_50px_rgba(124,58,237,0.8)]',
    },
    secondary: {
      bg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.6)]',
      hoverGlow: 'shadow-[0_0_50px_rgba(6,182,212,0.8)]',
    },
  }

  const style = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative px-8 py-3 rounded-xl font-semibold text-white overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`absolute inset-0 ${style.bg} ${isHovered ? style.hoverGlow : style.glow}`}
        animate={{
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: isHovered ? ['0%', '200%'] : '0%',
          opacity: isHovered ? [0, 0.3, 0] : 0,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
