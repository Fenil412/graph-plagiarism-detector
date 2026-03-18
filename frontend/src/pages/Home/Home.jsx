import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Network, ArrowRight, Shield, Zap, BarChart3, GitCompare, Sparkles, TrendingUp, Lock } from 'lucide-react'
import Particles from '@/components/ui/Particles'
import GradientText from '@/components/ui/GradientText'
import Magnet from '@/components/ui/Magnet'
import GlowingButton from '@/components/ui/GlowingButton'
import WaveBackground from '@/components/ui/WaveBackground'
import MorphingShape from '@/components/ui/MorphingShape'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import ParallaxSection from '@/components/ui/ParallaxSection'
import AnimatedCard from '@/components/ui/AnimatedCard'
import FloatingElements from '@/components/ui/FloatingElements'
import ShimmerText from '@/components/ui/ShimmerText'
import Scene3D from '@/components/ui/Scene3D'
import { useRef } from 'react'

const FEATURES = [
  { icon: Network, title: 'Graph-Based', desc: 'Convert documents to node-edge graphs for structural comparison', color: '#7c3aed' },
  { icon: Zap, title: 'Fast Detection', desc: 'Multiple algorithms from O(n) node overlap to subgraph matching', color: '#06b6d4' },
  { icon: Shield, title: 'Secure', desc: 'JWT authentication with encrypted passwords and user isolation', color: '#10b981' },
  { icon: BarChart3, title: 'Rich Reports', desc: 'Detailed similarity scores, matching sentences and keyword lists', color: '#f59e0b' },
]

const STATS = [
  { value: 99, label: 'Accuracy', icon: TrendingUp },
  { value: 95, label: 'Speed', icon: Zap },
  { value: 100, label: 'Security', icon: Lock },
]

export default function Home() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)]">
      <Particles />
      <FloatingElements count={15} />
      <WaveBackground />

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 flex items-center justify-between px-8 py-4 backdrop-blur-xl bg-[rgba(10,10,20,0.8)] border-b border-[var(--border-subtle)] z-50 transition-all duration-300">
        <motion.div 
          className="flex items-center gap-2.5 font-extrabold text-xl"
          whileHover={{ scale: 1.05 }}
        >
          <Magnet padding={15}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)] relative overflow-hidden group">
              <Network size={22} className="relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </Magnet>
          <ShimmerText text="GraphPlag" className="text-xl font-extrabold" />
        </motion.div>
        <div className="flex gap-3">
          <Magnet padding={10}>
            <Link 
              to="/login" 
              className="px-6 py-2.5 rounded-xl font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all duration-300 backdrop-blur-sm"
              data-cursor-text="Sign In"
            >
              Sign In
            </Link>
          </Magnet>
          <Magnet padding={10}>
            <Link to="/register" data-cursor-text="Get Started">
              <GlowingButton variant="primary">
                Get Started <ArrowRight size={16} />
              </GlowingButton>
            </Link>
          </Magnet>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-between gap-16 px-6 md:px-16 pt-32 pb-16 max-w-7xl mx-auto">
        <motion.div
          style={{ opacity, scale }}
          className="flex-1 max-w-2xl text-center lg:text-left"
        >
          <RevealOnScroll direction="up" delay={0.1}>
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgba(124,58,237,0.15)] to-[rgba(6,182,212,0.15)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa] text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles size={16} className="animate-pulse" />
              Graph-Based Plagiarism Detection
            </motion.div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.2}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] mb-6 text-[var(--text-primary)]">
              Detect Plagiarism<br />
              <GradientText animationSpeed={5}>Like Never Before</GradientText>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.3}>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-[580px] mx-auto lg:mx-0">
              Transform documents into knowledge graphs and compare them using advanced
              NetworkX algorithms — node overlap, edge similarity, subgraph matching, and GED.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
              <Magnet padding={15}>
                <Link to="/register" data-cursor-text="Start Now">
                  <GlowingButton variant="primary" className="text-base px-10 py-4">
                    Start Detection <ArrowRight size={20} />
                  </GlowingButton>
                </Link>
              </Magnet>
              <Magnet padding={15}>
                <Link 
                  to="/login" 
                  className="px-10 py-4 rounded-xl font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-2 border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all duration-300 backdrop-blur-sm hover:bg-[var(--bg-hover)]"
                  data-cursor-text="Sign In"
                >
                  Sign In
                </Link>
              </Magnet>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.5}>
            <div className="flex items-center justify-center lg:justify-start gap-12 flex-wrap">
              {[
                ['4+', 'Algorithms'],
                ['100%', 'Graph-Based'],
                ['JWT', 'Secured']
              ].map(([v, l], i) => (
                <motion.div 
                  key={l} 
                  className="flex flex-col items-center lg:items-start"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
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

        {/* 3D Visual */}
        <ParallaxSection speed={0.3} className="flex-1 w-full max-w-[500px] h-[400px] lg:h-[600px]">
          <RevealOnScroll direction="left" delay={0.3}>
            <div className="relative w-full h-full">
              <MorphingShape className="w-full h-full bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(6,182,212,0.2)] blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Magnet padding={80} magnetStrength={5}>
                  <AnimatedCard intensity={10}>
                    <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-glow)] border border-[var(--accent-primary)] backdrop-blur-sm bg-[rgba(10,10,20,0.5)]">
                      <Scene3D />
                    </div>
                  </AnimatedCard>
                </Magnet>
              </div>
            </div>
          </RevealOnScroll>
        </ParallaxSection>
      </section>

      {/* Features */}
      <section className="relative z-10 py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <RevealOnScroll direction="up">
          <div className="text-center mb-20">
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <span className="text-5xl">✨</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why <GradientText>GraphPlag?</GradientText>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Powered by cutting-edge graph algorithms and AI technology
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <RevealOnScroll key={title} direction="up" delay={i * 0.1}>
              <Magnet padding={15} magnetStrength={8}>
                <AnimatedCard intensity={8}>
                  <motion.div
                    className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-500 overflow-hidden group"
                    whileHover={{ y: -8 }}
                    data-cursor-text={title}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                      }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon size={32} style={{ color }} />
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle, ${color}40, transparent)`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] relative z-10">
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
                </AnimatedCard>
              </Magnet>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32 px-6 md:px-16 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-[rgba(6,182,212,0.05)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <ShimmerText text="Performance Metrics" />
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Industry-leading accuracy and speed
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <RevealOnScroll key={stat.label} direction="up" delay={i * 0.15}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
                      <stat.icon size={36} className="text-white" />
                    </div>
                    <motion.div
                      className="text-5xl font-black bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent mb-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      {stat.value}%
                    </motion.div>
                    <div className="text-[var(--text-secondary)] font-semibold">
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
      <section className="relative z-10 py-32 px-8 max-w-5xl mx-auto">
        <RevealOnScroll direction="up">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] p-16 text-center shadow-2xl shadow-[var(--accent-glow)]">
            <MorphingShape className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 blur-3xl" />
            <MorphingShape className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 opacity-10 blur-3xl" />
            
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
                <Sparkles size={48} className="text-white" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to detect plagiarism?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Create an account and upload your first document in seconds. No credit card required.
              </p>
              
              <Magnet padding={20}>
                <Link to="/register" data-cursor-text="Create Account">
                  <motion.button
                    className="px-12 py-5 rounded-2xl bg-white text-[var(--accent-primary)] font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300"
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
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 border-t border-[var(--border-subtle)]">
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
