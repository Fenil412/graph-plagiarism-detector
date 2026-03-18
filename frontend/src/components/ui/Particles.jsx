import { useEffect, useRef } from 'react'

export default function Particles({
  particleCount = 55,
  particleColor = 'rgba(167, 139, 250, 0.7)',
  lineColor = '124, 58, 237',
  maxDistance = 130,
  minSize = 1,
  maxSize = 3.5,
  speed = 0.4,
  opacity = 0.6,
  className = '',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, W, H
    let nodes = []

    const resize = () => {
      W = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth
      H = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    for (let i = 0; i < particleCount; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * (maxSize - minSize) + minSize,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${lineColor}, ${(0.25 * (1 - dist / maxDistance)).toFixed(2)})`
            ctx.lineWidth = 1
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [particleCount, particleColor, lineColor, maxDistance, minSize, maxSize, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={{ opacity }}
    />
  )
}
