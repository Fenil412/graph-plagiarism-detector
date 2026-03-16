import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, GitCompare, TrendingUp, Calendar } from 'lucide-react'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Reports.module.css'

/* Placeholder — real reports come from comparison history */
export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => import('@/services/api').then(m => m.documentAPI.list().then(r => r.data)),
  })

  const docs = data?.documents || []
  const ready = docs.filter(d => d.status === 'READY')

  return (
    <PageWrapper>
      <div className="page-container">
        <h2 style={{ marginBottom: '0.5rem' }}>Reports</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Detailed plagiarism analysis reports from your comparisons.
        </p>

        <div className={styles.summaryRow}>
          {[
            { icon: FileText,   label: 'Total Documents', value: docs.length,  color:'#7c3aed' },
            { icon: TrendingUp, label: 'Ready for Compare', value: ready.length, color:'#10b981' },
          ].map(s => (
            <div key={s.label} className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ '--c': s.color }}><s.icon size={20}/></div>
              <div>
                <div className={styles.summaryVal}>{s.value}</div>
                <div className={styles.summaryLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.reportGrid}>
          {isLoading
            ? [...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:100, borderRadius:16 }}/>)
            : ready.length === 0
            ? (
              <div className={styles.empty}>
                <GitCompare size={40} style={{ opacity:0.25 }}/>
                <p>No READY documents yet. Upload documents and run comparisons first.</p>
              </div>
            )
            : ready.map((doc, i) => (
              <motion.div key={doc.id} className={styles.reportCard}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportIcon}><FileText size={18}/></div>
                  <div>
                    <div className={styles.reportName}>{doc.original_name}</div>
                    <div className={styles.reportDate}>
                      <Calendar size={11}/> {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-success">READY</span>
                </div>
                <div className={styles.reportMeta}>
                  <span>{doc.word_count} words</span>
                  <span>{doc.mime_type}</span>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </PageWrapper>
  )
}
