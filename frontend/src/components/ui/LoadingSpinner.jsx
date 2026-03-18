import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 40, color = 'var(--accent-primary)' }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: color,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent"
          style={{
            borderBottomColor: color,
            borderLeftColor: color,
            opacity: 0.5,
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  )
}
