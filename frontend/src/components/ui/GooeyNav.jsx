import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

export default function GooeyNav({ items = [] }) {
  const location = useLocation()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <nav className="relative flex items-center gap-1 p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] backdrop-blur-xl">
      <svg width="0" height="0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative flex items-center gap-1" style={{ filter: 'url(#gooey)' }}>
        {items.map((item, index) => {
          const isActive = location.pathname === item.path
          const isHovered = hoveredIndex === index

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative z-10"
            >
              <motion.div
                className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-colors duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {(isActive || isHovered) && (
                  <motion.div
                    layoutId="gooey-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
