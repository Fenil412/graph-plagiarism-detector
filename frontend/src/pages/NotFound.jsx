import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Network } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:'1.5rem',
      background:'var(--bg-base)', textAlign:'center', padding:'2rem'
    }}>
      <motion.div
        style={{ fontSize:'8rem', lineHeight:1, fontWeight:900, color:'var(--border-default)' }}
        animate={{ y:[0,-12,0] }} transition={{ duration:3, repeat:Infinity }}
      >404</motion.div>
      <div>
        <h2 style={{ marginBottom:'0.5rem' }}>Page not found</h2>
        <p style={{ color:'var(--text-muted)' }}>The page you're looking for doesn't exist or was moved.</p>
      </div>
      <Link to="/" className="btn btn-primary"><Home size={16}/> Back to Home</Link>
    </div>
  )
}
