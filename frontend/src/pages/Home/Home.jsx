import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Network, ArrowRight, Shield, Zap, BarChart3,
  Sparkles, TrendingUp, Lock, Menu, X,
  CheckCircle, FileText, GitCompare
} from 'lucide-react'
import { useState, useRef } from 'react'
import GradientText from '@/components/ui/GradientText'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import ShimmerText from '@/components/ui/ShimmerText'
import HyperspeedBackground from '@/components/ui/HyperspeedBackground'
import AnimatedGrid from '@/components/ui/AnimatedGrid'
import ClickSpark from '@/components/ui/ClickSpark'

const FEATURES = [
  { icon: Network,   title: 'Graph-Based',    desc: 'Convert documents to node-edge graphs for structural comparison',       color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  { icon: Zap,       title: 'Fast Detection', desc: 'Multiple algorithms from O(n) node overlap to subgraph matching',       color: '#00D4FF', bg: 'rgba(0,212,255,0.12)' },
  { icon: Shield,    title: 'Secure',         desc: 'JWT authentication with encrypted passwords and user isolation',         color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { icon: BarChart3, title: 'Rich Reports',   desc: 'Detailed similarity scores, matching sentences and keyword lists',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
]

const STATS = [
  { value: 99,  label: 'Accuracy', icon: TrendingUp },
  { value: 95,  label: 'Speed',    icon: Zap },
  { value: 100, label: 'Security', icon: Lock },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Documents', desc: 'Upload your documents in PDF, TXT, or DOCX format',              icon: FileText  },
  { step: '02', title: 'Graph Analysis',   desc: 'Our AI converts documents into knowledge graphs',                 icon: Network   },
  { step: '03', title: 'Get Results',       desc: 'Receive detailed plagiarism reports with similarity scores',      icon: GitCompare },
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale   = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>
      <HyperspeedBackground starCount={150} speed={1.5} />
      <AnimatedGrid gridSize={60} />
      <ClickSpark />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <Network size={20} color="#fff" />
            </div>
            <span className="navbar__logo-text">GraphPlag</span>
          </Link>

          <div className="navbar__actions">
            <Link to="/login"    className="btn btn--ghost btn--sm">Sign In</Link>
            <Link to="/register" className="btn btn--primary btn--sm">Get Started <ArrowRight size={15} /></Link>
          </div>

          <button className="navbar__mobile-toggle" onClick={() => setMobileMenuOpen(o => !o)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Link to="/login"    className="btn btn--ghost"   onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn--primary" onClick={() => setMobileMenuOpen(false)}>Get Started <ArrowRight size={16} /></Link>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        {/* Background orbs — FIXED: position absolute, pointer-events none, z-index 0 */}
        <motion.div
          className="bg-orb bg-orb--purple bg-orb--lg"
          style={{ top: '-100px', left: '-100px' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-orb bg-orb--cyan bg-orb--lg"
          style={{ bottom: '0', right: '-100px' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="hero__inner">
          {/* Left: text */}
          <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
            <RevealOnScroll direction="up" delay={0.1}>
              <div className="hero__badge">
                <Sparkles size={14} style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                Graph-Based Plagiarism Detection
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.2}>
              <h1 className="hero__heading">
                Detect Plagiarism<br />
                <GradientText animationSpeed={5}>Like Never Before</GradientText>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.3}>
              <p className="hero__sub">
                Transform documents into knowledge graphs and compare them using advanced
                NetworkX algorithms — node overlap, edge similarity, subgraph matching, and GED.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.4}>
              <div className="hero__cta-row">
                <Link to="/register"><button className="btn btn--primary btn--lg">Start Detection <ArrowRight size={18} /></button></Link>
                <Link to="/login"   ><button className="btn btn--ghost   btn--lg">Sign In</button></Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.5}>
              <div className="hero__stats">
                {[['4+', 'Algorithms'], ['100%', 'Graph-Based'], ['JWT', 'Secured']].map(([v, l]) => (
                  <motion.div key={l} whileHover={{ y: -4, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <div className="hero__stat-value">{v}</div>
                    <div className="hero__stat-label">{l}</div>
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>
          </motion.div>

          {/* Right: SVG graph visual */}
          <RevealOnScroll direction="right" delay={0.3}>
            <div className="hero__visual">
              <motion.div
                style={{ width: '100%', maxWidth: 460, position: 'relative' }}
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto' }}>
                  <defs>
                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {[
                    { x1:200,y1:100,x2:100,y2:200,delay:0   },
                    { x1:200,y1:100,x2:300,y2:200,delay:0.3 },
                    { x1:100,y1:200,x2:200,y2:300,delay:0.6 },
                    { x1:300,y1:200,x2:200,y2:300,delay:0.9 },
                  ].map((l, i) => (
                    <motion.line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                      stroke="url(#g1)" strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: l.delay, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  ))}
                  {[{cx:200,cy:100,d:0},{cx:100,cy:200,d:0.2},{cx:300,cy:200,d:0.4},{cx:200,cy:300,d:0.6}].map((n,i) => (
                    <motion.g key={i}>
                      <motion.circle cx={n.cx} cy={n.cy} r="35" fill="url(#g1)"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, delay: n.d, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.circle cx={n.cx} cy={n.cy} r="42" fill="none" stroke="#6C63FF" strokeWidth="2" opacity="0.4"
                        animate={{ scale: [0.8, 1.6], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, delay: n.d, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </motion.g>
                  ))}
                </svg>

                {/* Floating info cards */}
                <motion.div className="hero__floating-card hero__floating-card--top"
                  animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="hero__floating-icon" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D4FF)' }}>
                    <CheckCircle size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>99% Match</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Similarity</div>
                  </div>
                </motion.div>

                <motion.div className="hero__floating-card hero__floating-card--bot"
                  animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <div className="hero__floating-icon" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                    <Network size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Graph Built</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready to Compare</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="how-it-works">
        {/* Background orb — properly contained */}
        <div className="bg-orb bg-orb--purple bg-orb--md" style={{ top: '10%', right: '5%', opacity: 0.4 }} />

        <div className="section-inner">
          <RevealOnScroll direction="up">
            <div className="section-header">
              <h2>How It <GradientText>Works</GradientText></h2>
              <p>Three simple steps to detect plagiarism with cutting-edge technology</p>
            </div>
          </RevealOnScroll>

          <div className="how-it-works__grid">
            {HOW_IT_WORKS.map((item, i) => (
              <RevealOnScroll key={item.step} direction="up" delay={i * 0.2}>
                <motion.div className="step-card" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="step-card__number">{item.step}</div>
                  <div className="step-card__icon-wrap">
                    <item.icon size={38} color="#fff" />
                  </div>
                  <h3 className="step-card__title">{item.title}</h3>
                  <p className="step-card__desc">{item.desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GraphPlag ────────────────────────────────────── */}
      <section className="features">
        <div className="bg-orb bg-orb--cyan bg-orb--md" style={{ bottom: '10%', left: '5%', opacity: 0.3 }} />

        <div className="section-inner">
          <RevealOnScroll direction="up">
            <div className="section-header">
              <motion.span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >✨</motion.span>
              <h2>Why <GradientText>GraphPlag?</GradientText></h2>
              <p>Powered by cutting-edge graph algorithms and AI technology</p>
            </div>
          </RevealOnScroll>

          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <RevealOnScroll key={title} direction="up" delay={i * 0.1}>
                <motion.div className="feature-card" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="feature-card__icon-wrap" style={{ background: bg }}>
                    <Icon size={30} color={color} />
                  </div>
                  <h3 className="feature-card__title">{title}</h3>
                  <p className="feature-card__desc">{desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance Metrics ──────────────────────────────── */}
      <section className="metrics">
        <div className="bg-orb bg-orb--purple bg-orb--sm" style={{ top: '20%', left: '2%',  opacity: 0.35 }} />
        <div className="bg-orb bg-orb--cyan   bg-orb--sm" style={{ bottom: '15%', right: '2%', opacity: 0.3  }} />

        <div className="section-inner">
          <RevealOnScroll direction="up">
            <div className="section-header">
              <h2><ShimmerText text="Performance Metrics" /></h2>
              <p>Industry-leading accuracy and speed</p>
            </div>
          </RevealOnScroll>

          {/* FIX: justify-content center, bounded card width */}
          <div className="metrics__grid">
            {STATS.map((stat, i) => (
              <RevealOnScroll key={stat.label} direction="up" delay={i * 0.15}>
                <motion.div className="metric-card" whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="metric-card__icon-wrap">
                    <stat.icon size={36} color="#fff" />
                  </div>
                  <div className="metric-card__value">{stat.value}%</div>
                  <div className="metric-card__label">{stat.label}</div>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <RevealOnScroll direction="up">
            <div className="cta-card">
              {/* Internal blobs — clipped by cta-card overflow:hidden */}
              <div className="cta-card__blob cta-card__blob--1" />
              <div className="cta-card__blob cta-card__blob--2" />

              <div className="cta-card__content">
                <motion.span className="cta-card__icon"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles size={52} color="#fff" style={{ margin: '0 auto' }} />
                </motion.span>
                <h2 className="cta-card__heading">Ready to detect plagiarism?</h2>
                <p className="cta-card__sub">
                  Create an account and upload your first document in seconds. No credit card required.
                </p>
                <Link to="/register">
                  <motion.button className="btn--white"
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Create Free Account <ArrowRight size={22} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer__main">
          {/* Brand */}
          <div>
            <Link to="/" className="footer__brand-logo">
              <div className="footer__brand-logo-icon">
                <Network size={22} color="#fff" />
              </div>
              <span className="footer__brand-logo-text">GraphPlag</span>
            </Link>
            <p className="footer__brand-desc">
              Advanced plagiarism detection using graph-based algorithms and AI technology.
              Transform documents into knowledge graphs for accurate similarity analysis.
            </p>
            <Link to="/register" className="btn btn--primary btn--sm">Get Started <ArrowRight size={14} /></Link>
          </div>

          {/* Product */}
          <div>
            <div className="footer__col-title">Product</div>
            <ul className="footer__links">
              {['Features', 'How It Works', 'Pricing', 'Documentation'].map(l => (
                <li key={l}><Link to="/" className="footer__link">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="footer__col-title">Company</div>
            <ul className="footer__links">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><Link to="/" className="footer__link">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="footer__col-title">Resources</div>
            <ul className="footer__links">
              {['Blog', 'Help Center', 'API Reference', 'Status'].map(l => (
                <li key={l}><Link to="/" className="footer__link">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copy">
            © {new Date().getFullYear()} GraphPlag. All rights reserved.
            <span>Built with ❤️ using React, Framer Motion, and D3.js</span>
          </div>
          <div className="footer__socials">
            {[['𝕏','Twitter'],['in','LinkedIn'],['GH','GitHub']].map(([icon, label]) => (
              <a key={label} href="#" className="footer__social-link" aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
