import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, FileText, ChevronDown, Loader, CheckCircle, AlertTriangle } from 'lucide-react'
import { documentAPI, plagiarismAPI } from '@/services/api'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Compare.module.css'

function ScoreMeter({ pct }) {
  const color = pct < 30 ? '#10b981' : pct < 60 ? '#f59e0b' : '#ef4444'
  const label = pct < 30 ? 'Low' : pct < 60 ? 'Moderate' : 'High'
  return (
    <div className={styles.meter}>
      <svg viewBox="0 0 120 70" className={styles.meterSvg}>
        <path d="M10,70 A50,50 0 0,1 110,70" fill="none" stroke="var(--bg-overlay)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M10,70 A50,50 0 0,1 110,70" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(pct/100)*157} 157`} style={{ transition: 'stroke-dasharray 1s ease' }}/>
      </svg>
      <div className={styles.meterValue} style={{ color }}>{pct.toFixed(1)}%</div>
      <div className={styles.meterLabel}>{label} Plagiarism</div>
    </div>
  )
}

function DocSelect({ label, docs, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const sel = docs.find(d => d.id === selected)
  return (
    <div className={styles.selectWrap}>
      <label className={styles.selectLabel}>{label}</label>
      <button className={styles.selectBtn} onClick={() => setOpen(o => !o)}>
        <FileText size={16} style={{ color:'var(--accent-primary)' }}/>
        <span>{sel ? sel.original_name : 'Select a document…'}</span>
        <ChevronDown size={16} style={{ marginLeft:'auto', color:'var(--text-muted)' }}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className={styles.dropdown}
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
            {docs.filter(d => d.status === 'READY').map(d => (
              <div key={d.id} className={`${styles.dropItem} ${selected===d.id?styles.dropItemActive:''}`}
                onClick={() => { onSelect(d.id); setOpen(false) }}>
                <FileText size={14}/>
                <span>{d.original_name}</span>
              </div>
            ))}
            {docs.filter(d=>d.status==='READY').length === 0 && (
              <div className={styles.dropEmpty}>No READY documents. Upload and wait for graph build.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ALGOS = ['node_overlap','edge_similarity','subgraph','graph_edit_distance']

export default function Compare() {
  const [docA, setDocA] = useState('')
  const [docB, setDocB] = useState('')
  const [algo, setAlgo] = useState('node_overlap')
  const [result, setResult] = useState(null)

  const { data } = useQuery({ queryKey:['documents'], queryFn:()=>documentAPI.list().then(r=>r.data) })
  const docs = data?.documents || []

  const { mutate: compare, isPending } = useMutation({
    mutationFn: () => plagiarismAPI.compare(docA, docB, algo).then(r => r.data),
    onSuccess: data => { setResult(data); toast.success('Comparison complete!') },
    onError: err => toast.error(err.response?.data?.detail || 'Comparison failed'),
  })

  const canCompare = docA && docB && docA !== docB && !isPending

  return (
    <PageWrapper>
      <div className="page-container">
        <h2 style={{ marginBottom:'0.5rem' }}>Compare Documents</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Select two READY documents and run graph-based plagiarism detection.</p>

        <div className={styles.compareGrid}>
          {/* Left: Config */}
          <div className={styles.configCard}>
            <DocSelect label="Document A" docs={docs} selected={docA} onSelect={setDocA}/>
            <div className={styles.vsRow}><div className={styles.vsBadge}><GitCompare size={20}/></div></div>
            <DocSelect label="Document B" docs={docs} selected={docB} onSelect={setDocB}/>

            <div className={styles.algoSection}>
              <label className={styles.selectLabel}>Algorithm</label>
              <div className={styles.algoGrid}>
                {ALGOS.map(a => (
                  <button key={a} className={`${styles.algoBtn} ${algo===a?styles.algoBtnActive:''}`}
                    onClick={() => setAlgo(a)}>
                    {a.replace(/_/g,' ')}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.8rem' }}
              onClick={() => compare()} disabled={!canCompare}>
              {isPending ? <><Loader size={17} className="animate-spin"/> Comparing…</> : <><GitCompare size={17}/> Run Detection</>}
            </button>
            {docA === docB && docA && <p style={{ color:'var(--danger)', fontSize:'0.8rem', textAlign:'center' }}>Please select two different documents.</p>}
          </div>

          {/* Right: Result */}
          <div className={styles.resultCard}>
            <AnimatePresence mode="wait">
              {!result && !isPending && (
                <motion.div key="idle" className={styles.resultIdle} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <GitCompare size={48} style={{ opacity:0.2 }}/>
                  <p>Configure and run a comparison to see results here.</p>
                </motion.div>
              )}
              {isPending && (
                <motion.div key="loading" className={styles.resultIdle} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <Loader size={48} className="animate-spin" style={{ color:'var(--accent-primary)' }}/>
                  <p>Analyzing graphs…</p>
                </motion.div>
              )}
              {result && !isPending && (
                <motion.div key="result" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
                  <ScoreMeter pct={result.comparison?.plagiarism_percentage || 0}/>
                  <div className={styles.resultDetails}>
                    <div className={styles.resultRow}>
                      <span>Similarity Score</span>
                      <strong>{((result.comparison?.similarity_score||0)*100).toFixed(2)}%</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Algorithm</span>
                      <strong style={{fontFamily:'var(--font-mono)', fontSize:'0.8rem'}}>{result.comparison?.algorithm_used}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Matching Keywords</span>
                      <strong>{result.matching_keywords?.length || 0}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Matching Sentences</span>
                      <strong>{result.matching_sentences?.length || 0}</strong>
                    </div>
                  </div>

                  {result.matching_keywords?.length > 0 && (
                    <div className={styles.keywords}>
                      <h4>Matching Keywords</h4>
                      <div className={styles.kwTags}>
                        {result.matching_keywords.slice(0,20).map(kw => (
                          <span key={kw} className="badge badge-purple">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matching_sentences?.length > 0 && (
                    <div className={styles.sentences}>
                      <h4>Matching Sentences</h4>
                      {result.matching_sentences.slice(0,3).map((s,i) => (
                        <div key={i} className={styles.sentItem}>{s}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
