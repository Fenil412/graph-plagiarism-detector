import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export default function CustomCursor() {
  const { theme } = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [cursorText, setCursorText] = useState('')

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 28, stiffness: 400, mass: 0.4 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 20)
      cursorY.set(e.clientY - 20)
      dotX.set(e.clientX - 3)
      dotY.set(e.clientY - 3)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      const cursorTextAttr = target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text')
      
      if (cursorTextAttr) {
        setCursorText(cursorTextAttr)
      } else {
        setCursorText('')
      }

      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('[data-cursor="pointer"]')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  const isDark = theme === 'dark'
  const ringColor = isDark ? 'rgba(167, 139, 250, 0.6)' : 'rgba(124, 58, 237, 0.6)'
  const dotColor = isDark ? '#a78bfa' : '#7c3aed'
  const hoverRingColor = isDark ? 'rgba(6, 182, 212, 0.7)' : 'rgba(6, 182, 212, 0.7)'
  const glowColor = isDark ? 'rgba(124, 58, 237, 0.4)' : 'rgba(124, 58, 237, 0.3)'

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null

  return (
    <>
      {/* Outer ring with gradient border */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: isHovering ? 56 : 40,
          height: isHovering ? 56 : 40,
        }}
        animate={{
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: isHovering
              ? `conic-gradient(from 0deg, ${hoverRingColor}, ${ringColor}, ${hoverRingColor})`
              : `conic-gradient(from 0deg, ${ringColor}, transparent, ${ringColor})`,
            padding: '2px',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: isClicking
                ? isDark
                  ? 'rgba(167, 139, 250, 0.2)'
                  : 'rgba(124, 58, 237, 0.15)'
                : 'transparent',
              backdropFilter: isHovering ? 'blur(4px)' : 'none',
            }}
          />
        </div>
        {cursorText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold whitespace-nowrap px-3 py-1 rounded-full bg-[var(--accent-primary)] text-white shadow-lg">
            {cursorText}
          </div>
        )}
      </motion.div>

      {/* Inner dot with glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: dotX,
          y: dotY,
          width: isClicking ? 4 : 6,
          height: isClicking ? 4 : 6,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 ${isHovering ? '20px' : '10px'} ${glowColor}, 0 0 ${isHovering ? '40px' : '20px'} ${glowColor}`,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.15s, height 0.15s, box-shadow 0.3s, opacity 0.2s',
        }}
      />

      {/* Trailing particles */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            width: 80,
            height: 80,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              opacity: isVisible ? 0.6 : 0,
              transition: 'opacity 0.3s',
            }}
          />
        </motion.div>
      )}
    </>
  )
}
