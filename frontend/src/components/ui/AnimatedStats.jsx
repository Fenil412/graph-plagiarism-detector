import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export default function AnimatedStats({ value, label, icon: Icon, color = '#7c3aed' }) {
  const [count, setCount] = useState(0)
  const svgRef = useRef()

  useEffect(() => {
    const duration = 2000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = d3.easeCubicOut(progress)
      setCount(Math.floor(easeProgress * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value])

  useEffect(() => {
    if (!svgRef.current) return

    const size = 120
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const svg = d3
      .select(svgRef.current)
      .attr('width', size)
      .attr('height', size)

    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${size / 2}, ${size / 2})`)

    // Background circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(124, 58, 237, 0.1)')
      .attr('stroke-width', strokeWidth)

    // Animated circle
    const progressCircle = g
      .append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', circumference)
      .attr('stroke-dashoffset', circumference)
      .attr('transform', 'rotate(-90)')

    progressCircle
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', circumference * (1 - count / 100))
  }, [count, color])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4 p-4 md:p-6 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300 w-full min-w-0"
    >
      <div className="relative flex-shrink-0">
        <svg ref={svgRef} />
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon && <Icon size={32} className="text-[var(--accent-primary)]" />}
        </div>
      </div>
      <div className="text-center w-full">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 mb-2">
          <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            {count}%
          </span>
        </div>
        <div className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 truncate px-2">{label}</div>
      </div>
    </motion.div>
  )
}
