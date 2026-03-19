import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import GalaxyBackground from '@/components/ui/GalaxyBackground'

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
    /* FIX: position relative + overflow hidden contains the floating orbs */
    <div className="auth-page">
      {/* ── Galaxy / Space background ────────────── */}
      <GalaxyBackground opacity={0.8} />

      {/* Background orbs — z-index 0, pointer-events none, contained by parent */}
      <motion.div
        className="bg-orb bg-orb--purple bg-orb--lg"
        style={{ top: '-80px', left: '-80px' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="bg-orb bg-orb--cyan bg-orb--lg"
        style={{ bottom: '-80px', right: '-80px' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Card — z-index 1 sits above orbs */}
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="auth-logo__icon">
            <Network size={26} color="#fff" />
          </div>
          <span className="auth-logo__text">GraphPlag</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 className="auth-title" style={{ marginBottom: 0 }}>Welcome back</h1>
            <motion.div
              animate={{ rotate: [0, 14, -14, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={22} color="var(--clr-purple)" />
            </motion.div>
          </div>
          <p className="auth-subtitle">Sign in to your account to continue detecting plagiarism</p>
        </motion.div>

        {/* Form */}
        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="input-icon input-icon--right"
                onClick={() => setShowPwd(v => !v)}
                style={{ color: 'var(--text-muted)', transition: 'color 150ms' }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, y: -2 }}
            whileTap={loading ? {} : { scale: 0.98 }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.p
          className="auth-footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Don't have an account?{' '}
          <Link to="/register" className="auth-footer-link">Create one</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
