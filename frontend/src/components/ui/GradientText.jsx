import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion'

export default function GradientText({
  children,
  className = '',
  colors = ['#a78bfa', '#06b6d4', '#7c3aed'],
  animationSpeed = 6,
  showBorder = false,
}) {
  const progress = useMotionValue(0)
  const elapsedRef = useRef(0)
  const lastTimeRef = useRef(null)
  const animationDuration = animationSpeed * 1000

  useAnimationFrame((time) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time
      return
    }
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    elapsedRef.current += deltaTime
    const fullCycle = animationDuration * 2
    const cycleTime = elapsedRef.current % fullCycle
    if (cycleTime < animationDuration) {
      progress.set((cycleTime / animationDuration) * 100)
    } else {
      progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100)
    }
  })

  const backgroundPosition = useTransform(progress, (p) => `${p}% 50%`)

  const gradientColors = [...colors, colors[0]].join(', ')
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${gradientColors})`,
    backgroundSize: '300% 100%',
  }

  return (
    <motion.span
      className={`relative inline-flex items-center justify-center font-semibold ${
        showBorder ? 'px-4 py-1.5 rounded-full backdrop-blur-sm' : ''
      } ${className}`}
    >
      {showBorder && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ ...gradientStyle, backgroundPosition, opacity: 0.4 }}
        />
      )}
      <motion.span
        className="relative z-10 bg-clip-text"
        style={{
          ...gradientStyle,
          backgroundPosition,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
