import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, GitCompare, TrendingUp, Calendar, AlertCircle, ArrowRight, Download, Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Reports.module.css'
import { documentAPI, plagiarismAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function Reports() {
  const [copiedId, setCopiedId] = useState(null)

  const { data: docData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })

  const { data: history, isLoading } = useQuery({
    queryKey: ['comparisons_history'],
    queryFn: () => plagiarismAPI.history().then(r => r.data),
  })

  const docs = docData?.documents || []
  const comparisons = history || []

  const docMap = {}
  docs.forEach(d => { docMap[d.id] = d })

  const completed = comparisons.filter(c => c.status === 'COMPLETED').length
  const avgSimilarity = comparisons.length > 0
    ? (comparisons.reduce((acc, curr) => acc + curr.plagiarism_percentage, 0) / comparisons.length).toFixed(1) + '%'
    : '0%'

  const getScoreColor = (score) => {
    if (score < 20) return '#10b981'
    if (score < 50) return '#f59e0b'
    if (score < 75) return '#f97316'
    return '#ef4444'
  }

  // PDF download
  const handleDownloadPdf = async (comparisonId) => {
    try {
      const response = await plagiarismAPI.downloadPdf(comparisonId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_${comparisonId.slice(0, 8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Failed to download PDF')
    }
  }

  // Copy share link
  const handleCopyShareLink = async (comparisonId) => {
    try {
      const { data } = await plagiarismAPI.report(comparisonId)
      if (data?.share_token) {
        const url = `${window.location.origin}/shared/${data.share_token}`
        await navigator.clipboard.writeText(url)
        setCopiedId(comparisonId)
        setTimeout(() => setCopiedId(null), 2000)
        toast.success('Share link copied!')
      }
    } catch {
      toast.error('Failed to get share link')
    }
  }

  return (
    <PageWrapper>
      <div className="page-container">
        <h2 style={{ marginBottom: '0.5rem' }}>Reports</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Detailed plagiarism analysis results. Download PDFs or share report links.
        </p>

        <div className={styles.summaryRow}>
          {[
            { icon: GitCompare, label: 'Total Comparisons', value: comparisons.length, color: '#7c3aed' },
            { icon: TrendingUp, label: 'Completed Analysis', value: completed, color: '#10b981' },
            { icon: AlertCircle, label: 'Avg Similarity', value: avgSimilarity, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ '--c': s.color }}><s.icon size={20} /></div>
              <div>
                <div className={styles.summaryVal}>{s.value}</div>
                <div className={styles.summaryLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.reportGrid}>
          {isLoading
            ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)
            : comparisons.length === 0
            ? (
              <div className={styles.empty}>
                <GitCompare size={40} style={{ opacity: 0.25 }} />
                <p>No comparisons yet. Go to the Compare page to start analysis.</p>
              </div>
            )
            : comparisons.map((comp, i) => {
              const docA = docMap[comp.document_a_id]
              const docB = docMap[comp.document_b_id]
              const scoreColor = getScoreColor(comp.plagiarism_percentage)

              return (
                <motion.div key={comp.id} className={styles.reportCard}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                  <div>
                    <div className={styles.reportHeader} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                        <span className={`badge ${comp.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {comp.status}
                        </span>
                        <div className={styles.reportDate}>
                          <Calendar size={11} /> {new Date(comp.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Document vs Document */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document A</div>
                        <div className={styles.reportName} style={{ margin: 0 }}>
                          {docA ? docA.original_name : <span style={{ opacity: 0.5 }}>Unknown</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document B</div>
                        <div className={styles.reportName} style={{ margin: 0 }}>
                          {docB ? docB.original_name : <span style={{ opacity: 0.5 }}>Unknown</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportMeta} style={{ justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        {comp.algorithm_used.replace('_', ' ')}
                      </span>
                      {/* Action buttons */}
                      {comp.status === 'COMPLETED' && (
                        <>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleDownloadPdf(comp.id)}
                            title="Download PDF"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleCopyShareLink(comp.id)}
                            title="Copy Share Link"
                          >
                            {copiedId === comp.id ? <Check size={13} color="#10b981" /> : <Share2 size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem' }}>Score:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: scoreColor }}>
                        {comp.plagiarism_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          }
        </div>
      </div>
    </PageWrapper>
  )
}
