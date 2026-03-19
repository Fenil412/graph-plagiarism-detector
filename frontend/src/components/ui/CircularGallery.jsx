import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CircularGallery({ items = [], radius = 200 }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const angleStep = (2 * Math.PI) / items.length

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Center selected item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIndex}
          className="absolute z-20 w-64 h-64 rounded-2xl overflow-hidden shadow-2xl shadow-[var(--accent-glow)]"
          initial={{ scale: 0, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0, opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.5 }}
        >
          {items[selectedIndex]?.content}
        </motion.div>
      </AnimatePresence>

      {/* Circular items */}
      {items.map((item, index) => {
        const angle = angleStep * index - Math.PI / 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const isSelected = index === selectedIndex

        return (
          <motion.button
            key={index}
            className={`absolute w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              isSelected
                ? 'border-[var(--accent-primary)] opacity-100'
                : 'border-[var(--border-subtle)] opacity-50 hover:opacity-80'
            }`}
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: x - 40,
              y: y - 40,
              scale: isSelected ? 1.2 : 1,
            }}
            whileHover={{ scale: isSelected ? 1.2 : 1.1 }}
            onClick={() => setSelectedIndex(index)}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {item.thumbnail || item.content}
          </motion.button>
        )
      })}
    </div>
  )
}
