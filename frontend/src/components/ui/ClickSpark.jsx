import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClickSpark() {
  const [sparks, setSparks] = useState([])

  useEffect(() => {
    const handleClick = (e) => {
      const sparkId = Date.now()
      const sparkCount = 8

      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        id: `${sparkId}-${i}`,
        x: e.clientX,
        y: e.clientY,
        angle: (360 / sparkCount) * i,
      }))

      setSparks((prev) => [...prev, ...newSparks])

      setTimeout(() => {
        setSparks((prev) => prev.filter((spark) => !spark.id.startsWith(sparkId)))
      }, 600)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            style={{
              left: spark.x,
              top: spark.y,
            }}
            initial={{
              opacity: 1,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              scale: 0,
              x: Math.cos((spark.angle * Math.PI) / 180) * 50,
              y: Math.sin((spark.angle * Math.PI) / 180) * 50,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
