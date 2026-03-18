import { motion } from 'framer-motion'

export default function GlassCard({ 
  children, 
  className = '',
  blur = 20,
  opacity = 0.7,
  borderOpacity = 0.2,
  hover = true,
  ...props 
}) {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity * 0.1})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
      whileHover={hover ? {
        scale: 1.02,
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
