import { motion } from 'framer-motion'

const variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0  },
}

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}
