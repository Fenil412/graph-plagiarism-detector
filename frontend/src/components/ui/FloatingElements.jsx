import { motion } from 'framer-motion'

export default function FloatingElements({ count = 20 }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(count)].map((_, i) => {
        const size = Math.random() * 100 + 50
        const duration = Math.random() * 20 + 15
        const delay = Math.random() * 5
        const x = Math.random() * 100
        const y = Math.random() * 100

        return (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
              background: `radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
