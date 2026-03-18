import { motion } from 'framer-motion'
import { Sparkles, Zap, Heart, Star } from 'lucide-react'
import PageWrapper from '@/components/ui/PageWrapper'
import GlowingButton from '@/components/ui/GlowingButton'
import WaveBackground from '@/components/ui/WaveBackground'
import MorphingShape from '@/components/ui/MorphingShape'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import ParallaxSection from '@/components/ui/ParallaxSection'
import TextScramble from '@/components/ui/TextScramble'
import AnimatedCard from '@/components/ui/AnimatedCard'
import FloatingElements from '@/components/ui/FloatingElements'
import ShimmerText from '@/components/ui/ShimmerText'
import Scene3D from '@/components/ui/Scene3D'
import D3NetworkGraph from '@/components/ui/D3NetworkGraph'
import AnimatedStats from '@/components/ui/AnimatedStats'
import Magnet from '@/components/ui/Magnet'
import GradientText from '@/components/ui/GradientText'

export default function ComponentShowcase() {
  const graphData = {
    nodes: [
      { id: 'a', label: 'Node A' },
      { id: 'b', label: 'Node B' },
      { id: 'c', label: 'Node C' },
      { id: 'd', label: 'Node D' },
      { id: 'e', label: 'Node E' },
    ],
    links: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'e' },
      { source: 'd', target: 'e' },
    ],
  }

  return (
    <PageWrapper>
      <div className="relative min-h-screen bg-[var(--bg-base)]">
        <FloatingElements count={20} />
        <WaveBackground />

        <div className="max-w-7xl mx-auto px-6 py-16 pt-20 relative z-10">
          {/* Header */}
          <RevealOnScroll direction="up">
            <div className="text-center mb-20">
              <motion.div
                className="inline-block mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={48} className="text-[var(--accent-primary)]" />
              </motion.div>
              <h1 className="text-6xl font-black mb-6">
                <GradientText>Component Showcase</GradientText>
              </h1>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                Explore all the amazing animated components available in GraphPlag
              </p>
            </div>
          </RevealOnScroll>

          {/* Glowing Buttons */}
          <RevealOnScroll direction="up" delay={0.1}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                <ShimmerText text="Glowing Buttons" />
              </h2>
              <div className="flex flex-wrap gap-6">
                <Magnet padding={15}>
                  <GlowingButton variant="primary">
                    Primary Button <Zap size={18} />
                  </GlowingButton>
                </Magnet>
                <Magnet padding={15}>
                  <GlowingButton variant="secondary">
                    Secondary Button <Heart size={18} />
                  </GlowingButton>
                </Magnet>
              </div>
            </section>
          </RevealOnScroll>

          {/* Animated Cards */}
          <RevealOnScroll direction="up" delay={0.2}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                3D Animated Cards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Sparkles, title: 'Feature One', desc: 'Amazing feature description', color: '#7c3aed' },
                  { icon: Zap, title: 'Feature Two', desc: 'Another great feature', color: '#06b6d4' },
                  { icon: Star, title: 'Feature Three', desc: 'Yet another feature', color: '#10b981' },
                ].map((feature, i) => (
                  <AnimatedCard key={i} intensity={10}>
                    <motion.div
                      className="p-8 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all h-full"
                      whileHover={{ y: -8 }}
                      data-cursor-text={feature.title}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                        style={{ background: `${feature.color}20` }}
                      >
                        <feature.icon size={32} style={{ color: feature.color }} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--text-secondary)]">{feature.desc}</p>
                    </motion.div>
                  </AnimatedCard>
                ))}
              </div>
            </section>
          </RevealOnScroll>

          {/* Text Effects */}
          <RevealOnScroll direction="up" delay={0.3}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                Text Effects
              </h2>
              <div className="space-y-6 p-8 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Shimmer Text</h3>
                  <div className="text-4xl font-bold">
                    <ShimmerText text="Amazing Shimmer Effect" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Gradient Text</h3>
                  <div className="text-4xl font-bold">
                    <GradientText>Beautiful Gradient</GradientText>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Text Scramble</h3>
                  <div className="text-4xl font-bold text-[var(--text-primary)]">
                    <TextScramble text="Scrambled Text" speed={50} />
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* Stats */}
          <RevealOnScroll direction="up" delay={0.4}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                Animated Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AnimatedStats value={95} label="Performance" icon={Zap} color="#7c3aed" />
                <AnimatedStats value={88} label="Quality" icon={Star} color="#06b6d4" />
                <AnimatedStats value={92} label="Satisfaction" icon={Heart} color="#10b981" />
              </div>
            </section>
          </RevealOnScroll>

          {/* 3D Scene */}
          <RevealOnScroll direction="up" delay={0.5}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                3D Visualization
              </h2>
              <ParallaxSection speed={0.3}>
                <AnimatedCard intensity={5}>
                  <div className="h-96 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                    <Scene3D />
                  </div>
                </AnimatedCard>
              </ParallaxSection>
            </section>
          </RevealOnScroll>

          {/* D3 Network Graph */}
          <RevealOnScroll direction="up" delay={0.6}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                D3.js Network Graph
              </h2>
              <AnimatedCard intensity={5}>
                <div className="p-8 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]">
                  <D3NetworkGraph data={graphData} className="h-96" />
                </div>
              </AnimatedCard>
            </section>
          </RevealOnScroll>

          {/* Morphing Shapes */}
          <RevealOnScroll direction="up" delay={0.7}>
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                Morphing Background Shapes
              </h2>
              <div className="relative h-96 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                <MorphingShape className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl" />
                <MorphingShape className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-cyan-500/30 to-transparent blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    Organic Morphing Shapes
                  </p>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* Footer */}
          <RevealOnScroll direction="up" delay={0.8}>
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)] mb-6">
                All components are fully responsive and theme-aware
              </p>
              <Magnet padding={20}>
                <GlowingButton variant="primary">
                  Explore More <Sparkles size={18} />
                </GlowingButton>
              </Magnet>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </PageWrapper>
  )
}
