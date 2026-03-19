import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Network, ArrowRight, Shield, Zap, BarChart3, Sparkles, TrendingUp, Lock, Menu, X } from 'lucide-react'
import { useState, useRef } from 'react'

// UI Components
import HyperspeedBackground from '@/components/ui/HyperspeedBackground'
import AnimatedGrid from '@/components/ui/AnimatedGrid'
import ClickSpark from '@/components/ui/ClickSpark'
import GradientText from '@/components/ui/GradientText'
import Magnet from '@/components/ui/Magnet'
import GlowingButton from '@/components/ui/GlowingButton'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import TiltCard from '@/components/ui/TiltCard'
import GlowBorderCard from '@/components/ui/GlowBorderCard'
import ShimmerText from '@/components/ui/ShimmerText'

const FEATURES = [
  { 
    icon: Network, 
    title: 'Graph-Based', 
    desc: 'Convert documents to node-edge graphs for structural comparison', 
    color: '#7c3aed' 
  },
  { 
    icon: Zap, 
    title: 'Fast Detection', 
    desc: 'Multiple algorithms from O(n) node overlap to subgraph matching', 
    color: '#06b6d4' 
  },
  { 
    icon: Shield, 
    title: 'Secure', 
    desc: 'JWT authentication with encrypted passwords and user isolation', 
    color: '#10b981' 
  },
  { 
    icon: BarChart3, 
    title: 'Rich Reports', 
    desc: 'Detailed similarity scores, matching sentences and keyword lists', 
    color: '#f59e0b' 
  },
]

const STATS = [
  { value: 99, label: 'Accuracy', icon: TrendingUp },
  { value: 95, label: 'Speed', icon: Zap },
  { value: 100, label: 'Security', icon: Lock },
]

export default function HomeImproved() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Background Effects */}
      <HyperspeedBackground starCount={150} speed={1.5} />
      <AnimatedGrid gridSize={60} />
      <ClickSpark />

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[rgba(10,10,20,0.85)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.05 }}
            >
              <Magnet padding={15}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] relative overflow-hidden group">
                  <Network size={22} className="text-white relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </Magnet>
              <ShimmerText text="GraphPlag" className="text-lg md:text-xl font-extrabold" />
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-3">
              <Magnet padding={10}>
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all duration-300"
                >
                  Sign In
                </Link>
              </Magnet>
              <Magnet padding={10}>
                <Link to="/register">
                  <GlowingButton variant="primary" className="text-sm">
                    Get Started <ArrowRight size={16} />
                  </GlowingButton>
                </Link>
              </Magnet>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-[var(--border-subtle)]"
            >
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-3 rounded-xl font-semibold text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GlowingButton variant="primary" className="w-full justify-center">
                    Get Started <ArrowRight size={16} />
                  </GlowingButton>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="text-center lg:text-left"
            >
              <RevealOnScroll direction="up" delay={0.1}>
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgba(124,58,237,0.15)] to-[rgba(6,182,212,0.15)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa] text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles size={16} className="animate-pulse" />
                  Graph-Based Plagiarism Detection
                </motion.div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 text-[var(--text-primary)]">
                  Detect Plagiarism<br />
                  <GradientText animationSpeed={5}>Like Never Before</GradientText>
                </h1>
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={0.3}>
                <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  Transform documents into knowledge graphs and compare them using advanced
                  NetworkX algorithms — node overlap, edge similarity, subgraph matching, and GED.
                </p>
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                  <Magnet padding={15}>
                    <Link to="/register">
                      <GlowingButton variant="primary" className="text-base px-8 py-4 w-full sm:w-auto">
                        Start Detection <ArrowRight size={20} />
                      </GlowingButton>
                    </Link>
                  </Magnet>
                  <Magnet padding={15}>
                    <Link 
                      to="/login" 
                      className="px-8 py-4 rounded-xl font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-2 border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all duration-300 backdrop-blur-sm hover:bg-[var(--bg-hover)] w-full sm:w-auto text-center"
                    >
                      Sign In
                    </Link>
                  </Magnet>
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={0.5}>
                <div className="flex items-center justify-center lg:justify-start gap-8 sm:gap-12 flex-wrap">
                  {[
                    ['4+', 'Algorithms'],
                    ['100%', 'Graph-Based'],
                    ['JWT', 'Secured']
                  ].map(([v, l]) => (
                    <motion.div 
                      key={l} 
                      className="flex flex-col items-center lg:items-start"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                        {v}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">
                        {l}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </RevealOnScroll>
            </motion.div>

            {/* Right Visual */}
            <RevealOnScroll direction="left" delay={0.3} className="hidden lg:block">
              <div className="relative w-full h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(6,182,212,0.2)] blur-3xl rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Magnet padding={60} magnetStrength={5}>
                    <TiltCard tiltAmount={12} className="w-full max-w-md aspect-square">
                      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-glow)] border border-[var(--accent-primary)] backdrop-blur-sm bg-[rgba(10,10,20,0.5)] flex items-center justify-center">
                        <Network size={120} className="text-[var(--accent-primary)] opacity-50" />
                      </div>
                    </TiltCard>
                  </Magnet>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <motion.div
                className="inline-block mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="text-4xl sm:text-5xl">✨</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Why <GradientText>GraphPlag?</GradientText>
              </h2>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto px-4">
                Powered by cutting-edge graph algorithms and AI technology
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <RevealOnScroll key={title} direction="up" delay={i * 0.1}>
                <Magnet padding={15} magnetStrength={8}>
                  <TiltCard tiltAmount={10} className="h-full">
                    <GlowBorderCard className="h-full group">
                      <motion.div
                        className="relative h-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-500 overflow-hidden"
                        whileHover={{ y: -8 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <motion.div
                          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6"
                          style={{
                            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                          }}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon size={28} style={{ color }} />
                        </motion.div>

                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-[var(--text-primary)] relative z-10">
                          {title}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed relative z-10">
                          {desc}
                        </p>

                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{ transformOrigin: 'left' }}
                        />
                      </motion.div>
                    </GlowBorderCard>
                  </TiltCard>
                </Magnet>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-[rgba(6,182,212,0.05)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                <ShimmerText text="Performance Metrics" />
              </h2>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] px-4">
                Industry-leading accuracy and speed
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <RevealOnScroll key={stat.label} direction="up" delay={i * 0.15}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
                      <stat.icon size={32} className="text-white" />
                    </div>
                    <motion.div
                      className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent mb-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      {stat.value}%
                    </motion.div>
                    <div className="text-[var(--text-secondary)] font-semibold text-sm sm:text-base">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-[var(--accent-glow)]">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white opacity-10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-400 opacity-10 blur-3xl rounded-full" />
              
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="inline-block mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles size={40} className="text-white sm:w-12 sm:h-12" />
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 px-4">
                  Ready to detect plagiarism?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto px-4">
                  Create an account and upload your first document in seconds. No credit card required.
                </p>
                
                <Magnet padding={20}>
                  <Link to="/register">
                    <motion.button
                      className="px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white text-[var(--accent-primary)] font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Free Account <ArrowRight size={20} className="inline ml-2" />
                    </motion.button>
                  </Link>
                </Magnet>
              </motion.div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 sm:py-12 border-t border-[var(--border-subtle)] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[var(--text-muted)] text-sm"
        >
          <p className="mb-2">© {new Date().getFullYear()} GraphPlag — Graph-Based Plagiarism Detection</p>
          <p className="text-xs">Built with ❤️ using React, Framer Motion, and D3.js</p>
        </motion.div>
      </footer>
    </div>
  )
}
