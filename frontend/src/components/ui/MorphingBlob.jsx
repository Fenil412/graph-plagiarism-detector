import { motion } from 'framer-motion'

export default function MorphingBlob({ 
  className = '',
  size = 200,
  color = '#7c3aed',
  opacity = 0.3,
  blur = 60,
  duration = 8,
  ...props 
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        opacity: opacity,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        borderRadius: [
          '30% 70% 70% 30% / 30% 30% 70% 70%',
          '58% 42% 75% 25% / 76% 46% 54% 24%',
          '50% 50% 33% 67% / 55% 27% 73% 45%',
          '33% 67% 58% 42% / 63% 68% 32% 37%',
          '30% 70% 70% 30% / 30% 30% 70% 70%',
        ],
        x: [0, 30, -20, 40, 0],
        y: [0, -40, 30, -20, 0],
        scale: [1, 1.1, 0.9, 1.05, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    />
  )
}
