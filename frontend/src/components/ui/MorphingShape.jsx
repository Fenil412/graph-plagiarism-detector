import { motion } from 'framer-motion'

export default function MorphingShape({ className = '' }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        borderRadius: [
          '60% 40% 30% 70%/60% 30% 70% 40%',
          '30% 60% 70% 40%/50% 60% 30% 60%',
          '50% 50% 50% 50%/50% 50% 50% 50%',
          '60% 40% 30% 70%/60% 30% 70% 40%',
        ],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
