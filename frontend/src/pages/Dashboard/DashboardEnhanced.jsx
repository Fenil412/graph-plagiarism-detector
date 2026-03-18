import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Network, GitCompare, TrendingUp, Clock, ArrowRight, Upload, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { documentAPI, plagiarismAPI } from '@/services/api'
import PageWrapper from '@/components/ui/PageWrapper'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import AnimatedCard from '@/components/ui/AnimatedCard'
import GlowingButton from '@/components/ui/GlowingButton'
import AnimatedStats from '@/components/ui/AnimatedStats'
import D3NetworkGraph from '@/components/ui/D3NetworkGraph'
import FloatingElements from '@/components/ui/FloatingElements'
import Magnet from '@/components/ui/Magnet'
import Card3D from '@/components/ui/Card3D'
import GradientCard from '@/components/ui/GradientCard'
import NeonButton from '@/components/ui/NeonButton'
import MorphingBlob from '@/components/ui/MorphingBlob'
import GlassCard from '@/components/ui/GlassCard'

export default function DashboardEnhanced() {
  const { user } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })

  const { data: historyData } = useQuery({
    queryKey: ['comparisons_history'],
    queryFn: () => plagiarismAPI.history().then(r => r.data),
  })

  const docs = data?.documents || []
  const history = historyData || []
  const ready = docs.filter(d => d.status === 'READY').length
  const total = docs.length
  const totalComparisons = history.length
  const avgSimilarity = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.plagiarism_percentage, 0) / history.length)
    : 0

  // Sample graph data for D3
  const graphData = {
    nodes: [
      { id: 'doc1', label: 'Doc 1' },
      { id: 'doc2', label: 'Doc 2' },
      { id: 'doc3', label: 'Doc 3' },
      { id: 'doc4', label: 'Doc 4' },
      { id: 'doc5', label: 'Doc 5' },
    ],
    links: [
      { source: 'doc1', target: 'doc2' },
      { source: 'doc1', target: 'doc3' },
      { source: 'doc2', target: 'doc4' },
      { source: 'doc3', target: 'doc5' },
      { source: 'doc4', target: 'doc5' },
    ],
  }

  return (
    <PageWrapper>
      <FloatingElements count={10} />
      
      {/* Morphing blobs for background */}
      <MorphingBlob size={300} color="#7c3aed" opacity={0.15} blur={80} className="top-20 left-10" />
      <MorphingBlob size={250} color="#06b6d4" opacity={0.12} blur={70} className="top-40 right-20" duration={10} />
      <MorphingBlob size={200} color="#8b5cf6" opacity={0.1} blur={60} className="bottom-40 left-1/3" duration={12} />
      
      <div className="max-w-7xl mx-auto px-6 py-8 pt-20 relative z-10">
        {/* Greeting */}
        <RevealOnScroll direction="up">
          <motion.div 
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <motion.h1 
                className="text-4xl lg:text-5xl font-black mb-3"
                whileHover={{ scale: 1.02 }}
              >
                Good day,{' '}
                <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0]}
                </span>{' '}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block origin-bottom"
                >
                  👋
                </motion.span>
              </motion.h1>
              <p className="text-lg text-[var(--text-secondary)]">
                Here's an overview of your plagiarism detection activity
              </p>
            </div>
            <Magnet padding={15}>
              <Link to="/upload" data-cursor-text="Upload">
                <NeonButton color="#7c3aed" size="lg" icon={<Upload size={20} />}>
                  Upload Document
                </NeonButton>
              </Link>
            </Magnet>
          </motion.div>
        </RevealOnScroll>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <RevealOnScroll direction="up" delay={0.1}>
            <div className="w-full">
              <AnimatedStats value={total > 0 ? Math.min((total / 100) * 100, 100) : 75} label="Total Documents" icon={FileText} color="#7c3aed" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.2}>
            <div className="w-full">
              <AnimatedStats value={ready > 0 ? Math.min((ready / total) * 100, 100) : 85} label="Graphs Built" icon={Network} color="#06b6d4" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.3}>
            <div className="w-full">
              <AnimatedStats value={totalComparisons > 0 ? Math.min((totalComparisons / 50) * 100, 100) : 65} label="Comparisons" icon={GitCompare} color="#10b981" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.4}>
            <div className="w-full">
              <AnimatedStats value={avgSimilarity} label="Avg Similarity" icon={TrendingUp} color="#f59e0b" />
            </div>
          </RevealOnScroll>
        </div>

        {/* Network Visualization */}
        <RevealOnScroll direction="up" delay={0.5}>
          <Card3D intensity={10} glowColor="rgba(124, 58, 237, 0.4)">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
                  <Network size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">Document Network</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Interactive graph visualization</p>
                </div>
              </div>
              <D3NetworkGraph data={graphData} className="h-96" />
            </div>
          </Card3D>
        </RevealOnScroll>

        {/* Recent Documents */}
        <RevealOnScroll direction="up" delay={0.6}>
          <GlassCard className="p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-[var(--accent-primary)]" />
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Recent Documents</h3>
              </div>
              <Link 
                to="/history" 
                className="text-sm text-[var(--text-accent)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2"
                data-cursor-text="View All"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : docs.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FileText size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
                <p className="text-[var(--text-secondary)] mb-6">No documents yet. Upload your first document to get started.</p>
                <Link to="/upload">
                  <GlowingButton variant="primary">Upload Now</GlowingButton>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {docs.slice(0, 5).map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300 cursor-pointer group"
                    data-cursor-text="View"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(6,182,212,0.2)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={20} className="text-[var(--accent-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--text-primary)] truncate">{doc.original_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>{doc.word_count} words</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'READY' ? 'bg-green-500/20 text-green-400' :
                      doc.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      doc.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {doc.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </RevealOnScroll>

        {/* Quick Actions */}
        <RevealOnScroll direction="up" delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Upload, title: 'Upload Document', desc: 'Add new documents for analysis', link: '/upload', color: '#7c3aed' },
              { icon: GitCompare, title: 'Compare Documents', desc: 'Run plagiarism detection', link: '/compare', color: '#06b6d4' },
              { icon: TrendingUp, title: 'View Reports', desc: 'Check analysis results', link: '/reports', color: '#10b981' },
            ].map((action, i) => (
              <Magnet key={action.title} padding={12}>
                <Link to={action.link} data-cursor-text={action.title}>
                  <GradientCard gradient={i === 0 ? 'primary' : i === 1 ? 'secondary' : 'success'} hover3d={true}>
                    <motion.div
                      className="p-6 h-full"
                      whileHover={{ y: -4 }}
                    >
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ background: `${action.color}20` }}
                      >
                        <action.icon size={28} style={{ color: action.color }} />
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">{action.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">{action.desc}</p>
                    </motion.div>
                  </GradientCard>
                </Link>
              </Magnet>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </PageWrapper>
  )
}
