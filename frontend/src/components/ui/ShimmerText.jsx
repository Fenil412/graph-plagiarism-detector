import { motion } from 'framer-motion'

export default function ShimmerText({ text, className = '' }) {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: '200% auto',
      }}
      animate={{
        backgroundPosition: ['0% center', '200% center'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  )
}
