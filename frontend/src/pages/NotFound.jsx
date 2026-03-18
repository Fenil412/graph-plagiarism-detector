import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Network } from 'lucide-react'
import GradientText from '@/components/ui/GradientText'
import Magnet from '@/components/ui/Magnet'
import Particles from '@/components/ui/Particles'

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg-base)] text-center p-8 overflow-hidden z-0">
      <Particles particleCount={30} opacity={0.3} className="-z-10" />

      <Magnet padding={50} magnetStrength={5}>
        <motion.div
          className="text-[8rem] font-extrabold leading-none text-[var(--border-strong)] z-10"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          404
        </motion.div>
      </Magnet>
      
      <div className="z-10 relative">
        <h2 className="text-3xl font-bold mb-2">
          <GradientText>Page not found</GradientText>
        </h2>
        <p className="text-[var(--text-muted)] text-lg">The page you're looking for doesn't exist or was moved.</p>
      </div>
      
      <Magnet padding={20} magnetStrength={3} className="z-10 mt-4">
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Back to Home
        </Link>
      </Magnet>
    </div>
  )
}
