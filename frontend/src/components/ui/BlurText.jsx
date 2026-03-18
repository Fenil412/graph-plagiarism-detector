import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function BlurText({
  text = '',
  className = '',
  delay = 0.03,
  duration = 0.5,
  animateBy = 'words',
  direction = 'top',
}) {
  const elements = useMemo(() => {
    if (animateBy === 'words') return text.split(' ')
    return text.split('')
  }, [text, animateBy])

  const getInitial = () => {
    switch (direction) {
      case 'top': return { y: -20, filter: 'blur(10px)', opacity: 0 }
      case 'bottom': return { y: 20, filter: 'blur(10px)', opacity: 0 }
      case 'left': return { x: -20, filter: 'blur(10px)', opacity: 0 }
      case 'right': return { x: 20, filter: 'blur(10px)', opacity: 0 }
      default: return { y: -20, filter: 'blur(10px)', opacity: 0 }
    }
  }

  return (
    <motion.span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={getInitial()}
          animate={{ y: 0, x: 0, filter: 'blur(0px)', opacity: 1 }}
          transition={{
            duration,
            delay: index * delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.span>
  )
}
