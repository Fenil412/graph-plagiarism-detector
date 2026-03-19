import { useEffect, useRef } from 'react'

export default function HyperspeedBackground({ starCount = 200, speed = 2 }) {
  const canvasRef = useRef(null)
  const starsRef = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Initialize stars
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      prevX: 0,
      prevY: 0,
    }))

    const animate = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light'
      ctx.fillStyle = isLight ? 'rgba(248, 250, 252, 0.2)' : 'rgba(10, 10, 20, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach((star) => {
        star.z -= speed

        if (star.z <= 0) {
          star.z = canvas.width
          star.x = Math.random() * canvas.width
          star.y = Math.random() * canvas.height
        }

        const k = 128 / star.z
        const px = (star.x - centerX) * k + centerX
        const py = (star.y - centerY) * k + centerY

        if (star.prevX !== 0) {
          const gradient = ctx.createLinearGradient(star.prevX, star.prevY, px, py)
          if (isLight) {
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0)')
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0.4)')
          } else {
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0)')
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0.8)')
          }

          ctx.strokeStyle = gradient
          ctx.lineWidth = (1 - star.z / canvas.width) * (isLight ? 2 : 3)
          ctx.beginPath()
          ctx.moveTo(star.prevX, star.prevY)
          ctx.lineTo(px, py)
          ctx.stroke()
        }

        star.prevX = px
        star.prevY = py
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [starCount, speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
