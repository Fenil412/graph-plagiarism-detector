import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, ChevronDown, Loader, Trophy, AlertTriangle, BarChart3, Network } from 'lucide-react'
import { documentAPI, scanAPI } from '@/services/api'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Scan.module.css'

const ALGOS = ['node_overlap', 'edge_similarity', 'subgraph', 'graph_edit_distance']

function getScoreColor(pct) {
  if (pct < 20) return '#10b981'
  if (pct < 50) return '#f59e0b'
  if (pct < 75) return '#f97316'
  return '#ef4444'
}

export default function Scan() {
  const [selectedDoc, setSelectedDoc] = useState('')
  const [algo, setAlgo] = useState('node_overlap')
  const [openSelect, setOpenSelect] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })
  const docs = (data?.documents || []).filter(d => d.status === 'READY')

  const { data: scanHistory } = useQuery({
    queryKey: ['scan_history'],
    queryFn: () => scanAPI.history().then(r => r.data),
  })

  const { mutate: runScan, isPending } = useMutation({
    mutationFn: () => scanAPI.run(selectedDoc, algo).then(r => r.data),
    onSuccess: data => {
      setScanResult(data)
      toast.success(`Scan complete! ${data.total_compared} documents compared.`)
    },
    onError: err => toast.error(err.response?.data?.detail || 'Scan failed'),
  })

  const sel = docs.find(d => d.id === selectedDoc)

  return (
    <PageWrapper>
      <div className="page-container">
        <motion.h1 
          className="text-4xl font-black mb-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Multi-Document Scan
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Compare one document against <strong>all</strong> stored documents. Get a ranked list of the most similar documents.
        </p>

        {/* Config Panel */}
        <div className={styles.configPanel}>
          <div className={styles.configLeft}>
            <label className={styles.label}>Source Document</label>
            <div className={styles.selectWrap}>
              <button className={styles.selectBtn} onClick={() => setOpenSelect(o => !o)}>
                <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>{sel ? sel.original_name : 'Select a document…'}</span>
                <ChevronDown size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
              <AnimatePresence>
                {openSelect && (
                  <motion.div className={styles.dropdown}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    {docs.map(d => (
                      <div key={d.id}
                        className={`${styles.dropItem} ${selectedDoc === d.id ? styles.dropItemActive : ''}`}
                        onClick={() => { setSelectedDoc(d.id); setOpenSelect(false) }}>
                        <FileText size={14} />
                        <span>{d.original_name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{d.word_count} words</span>
                      </div>
                    ))}
                    {docs.length === 0 && (
                      <div className={styles.dropEmpty}>No READY documents. Upload and process documents first.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <label className={styles.label} style={{ marginTop: '1rem' }}>Algorithm</label>
            <div className={styles.algoGrid}>
              {ALGOS.map(a => (
                <button key={a}
                  className={`${styles.algoBtn} ${algo === a ? styles.algoBtnActive : ''}`}
                  onClick={() => setAlgo(a)}>
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '1.25rem' }}
              onClick={() => runScan()}
              disabled={!selectedDoc || isPending}
            >
              {isPending ? <><Loader size={17} className="animate-spin" /> Scanning…</> : <><Search size={17} /> Run Scan</>}
            </button>
          </div>

          {/* Result Summary */}
          <div className={styles.configRight}>
            <AnimatePresence mode="wait">
              {!scanResult && !isPending && (
                <motion.div key="idle" className={styles.idle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Search size={48} style={{ opacity: 0.15 }} />
                  <p>Select a document and run a scan to see results.</p>
                </motion.div>
              )}
              {isPending && (
                <motion.div key="loading" className={styles.idle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader size={48} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  <p>Scanning all documents…</p>
                </motion.div>
              )}
              {scanResult && !isPending && (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                      <BarChart3 size={20} color="#7c3aed" />
                      <div>
                        <div className={styles.summaryVal}>{scanResult.total_compared}</div>
                        <div className={styles.summaryLabel}>Compared</div>
                      </div>
                    </div>
                    <div className={styles.summaryCard}>
                      <AlertTriangle size={20} color={getScoreColor(scanResult.highest_score * 100)} />
                      <div>
                        <div className={styles.summaryVal} style={{ color: getScoreColor(scanResult.highest_score * 100) }}>
                          {(scanResult.highest_score * 100).toFixed(1)}%
                        </div>
                        <div className={styles.summaryLabel}>Highest</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ranked Results */}
        {scanResult?.results?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={{ margin: '2rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="#f59e0b" /> Top Similar Documents
            </h3>
            <div className={styles.rankList}>
              {scanResult.results.map((r, i) => {
                const color = getScoreColor(r.plagiarism_percentage)
                const level = r.plagiarism_percentage < 20 ? 'Low' : r.plagiarism_percentage < 50 ? 'Moderate' : r.plagiarism_percentage < 75 ? 'Significant' : 'High'
                return (
                  <motion.div key={r.document_id} className={styles.rankItem}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.01, boxShadow: `0 0 16px ${color}22` }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toast(
                      `📄 ${r.document_name}\nSimilarity: ${(r.similarity_score * 100).toFixed(2)}%\nPlagiarism: ${r.plagiarism_percentage.toFixed(1)}% (${level})`,
                      { icon: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📊', duration: 4000, style: { background: '#0f172a', color: '#e2e8f0', border: `1px solid ${color}`, whiteSpace: 'pre-line' } }
                    )}>
                    <div className={styles.rankBadge} style={{
                      background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#eab308)' :
                        i === 1 ? 'linear-gradient(135deg,#94a3b8,#cbd5e1)' :
                          i === 2 ? 'linear-gradient(135deg,#b45309,#d97706)' :
                            'var(--bg-overlay)',
                      color: i < 3 ? '#fff' : 'var(--text-muted)',
                    }}>
                      #{i + 1}
                    </div>
                    <div className={styles.rankInfo}>
                      <span className={styles.rankName}>{r.document_name}</span>
                      <span className={styles.rankMeta}>
                        Similarity: {(r.similarity_score * 100).toFixed(2)}% · {level}
                      </span>
                    </div>
                    <div className={styles.rankScore} style={{ color }}>
                      {r.plagiarism_percentage.toFixed(1)}%
                    </div>
                    <div className={styles.rankBar}>
                      <motion.div
                        className={styles.rankBarFill}
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.plagiarism_percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Scan History */}
        {scanHistory?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📜 Scan History</h3>
            <div className={styles.historyList}>
              {scanHistory.slice(0, 5).map((s, i) => (
                <div key={s.scan_id} className={styles.historyItem}>
                  <FileText size={16} color="var(--accent-primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.source_document_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.algorithm.replace(/_/g, ' ')} · {s.total_compared} docs compared · {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 700,
                    color: getScoreColor(s.highest_score * 100),
                  }}>
                    {(s.highest_score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
