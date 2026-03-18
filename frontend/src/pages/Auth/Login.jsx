import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import Magnet from '@/components/ui/Magnet'
import GradientText from '@/components/ui/GradientText'
import Particles from '@/components/ui/Particles'
import FloatingElements from '@/components/ui/FloatingElements'
import MorphingShape from '@/components/ui/MorphingShape'
import AnimatedCard from '@/components/ui/AnimatedCard'
import GlowingButton from '@/components/ui/GlowingButton'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)] overflow-hidden">
      <Particles particleCount={50} opacity={0.4} />
      <FloatingElements count={12} />
      
      {/* Animated background shapes */}
      <MorphingShape className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[rgba(124,58,237,0.15)] to-transparent blur-3xl" />
      <MorphingShape className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[rgba(6,182,212,0.15)] to-transparent blur-3xl" />

      <Magnet padding={20} magnetStrength={8}>
        <AnimatedCard intensity={6}>
          <motion.div
            className="relative z-10 w-full max-w-[460px] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-12 shadow-2xl backdrop-blur-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-transparent pointer-events-none" />
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--accent-primary)] rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div 
              className="flex items-center gap-3 mb-10 relative z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)] relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Network size={24} className="relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                  animate={{ x: ['-100%', '200%'], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
              <span className="text-xl font-black bg-gradient-to-br from-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent">
                GraphPlag
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                  <GradientText animationSpeed={6}>Welcome back</GradientText>
                </h2>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles size={20} className="text-[var(--accent-primary)]" />
                </motion.div>
              </div>
              <p className="text-[var(--text-secondary)] text-base mb-10">
                Sign in to your account to continue detecting plagiarism
              </p>
            </motion.div>

            <motion.form 
              className="flex flex-col gap-6 relative z-10" 
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div 
                className="flex flex-col gap-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Email address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none z-10" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 h-14 text-base bg-[var(--bg-overlay)] border-2 border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_4px_var(--accent-glow)] transition-all outline-none"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col gap-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none z-10" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="w-full pl-12 pr-14 h-14 text-base bg-[var(--bg-overlay)] border-2 border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_4px_var(--accent-glow)] transition-all outline-none"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <motion.button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 flex z-10"
                    onClick={() => setShowPwd((v) => !v)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    data-cursor-text={showPwd ? 'Hide' : 'Show'}
                  >
                    {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2"
              >
                <GlowingButton
                  variant="primary"
                  className="w-full h-14 text-base font-semibold flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <motion.div
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Sign In <ArrowRight size={20} />
                    </>
                  )}
                </GlowingButton>
              </motion.div>
            </motion.form>

            <motion.p 
              className="text-center text-sm text-[var(--text-muted)] mt-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-[var(--accent-primary)] font-semibold hover:text-[var(--accent-secondary)] transition-colors"
                data-cursor-text="Register"
              >
                Create one
              </Link>
            </motion.p>
          </motion.div>
        </AnimatedCard>
      </Magnet>
    </div>
  )
}
