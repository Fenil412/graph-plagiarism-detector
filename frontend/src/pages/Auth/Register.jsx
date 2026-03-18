import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import Magnet from '@/components/ui/Magnet'
import GradientText from '@/components/ui/GradientText'
import Particles from '@/components/ui/Particles'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)] overflow-hidden">
      <Particles particleCount={40} opacity={0.3} className="-z-10" />
      <div className="absolute inset-0 pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(124,58,237,0.15) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.1) 0%, transparent 55%)' }} />

      <Magnet padding={20} magnetStrength={8} innerClassName="w-full">
        <motion.div
          className="relative z-10 w-full max-w-[420px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl p-10 shadow-[var(--shadow-lg),var(--shadow-glow)] backdrop-blur-xl mx-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg">
              <Network size={24} />
            </div>
            <span className="text-[1.3rem] font-black bg-gradient-to-br from-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent">
              GraphPlag
            </span>
          </div>

          <h2 className="text-[1.8rem] font-bold mb-1.5 text-[var(--text-primary)]">
            <GradientText animationSpeed={8}>Create account</GradientText>
          </h2>
          <p className="text-[var(--text-muted)] text-[15px] mb-8">Start detecting plagiarism for free</p>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-semibold text-[var(--text-secondary)]">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  className="input pl-10 h-12 text-[15px] bg-[var(--bg-overlay)] border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-semibold text-[var(--text-secondary)]">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="email"
                  className="input pl-10 h-12 text-[15px] bg-[var(--bg-overlay)] border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-semibold text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-10 h-12 text-[15px] bg-[var(--bg-overlay)] border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0 flex cursor-none"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.password && (
                <div className="flex gap-1.5 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                      style={{ background: form.password.length > i * 3 + 2 ? 'var(--success)' : 'var(--bg-overlay)' }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center mt-3 h-12 text-[15px] rounded-xl shadow-lg shadow-[var(--accent-glow)] flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-[14px] text-[var(--text-muted)] mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent-primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </Magnet>
    </div>
  )
}
