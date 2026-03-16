import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Network, GitCompare, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { documentAPI } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Dashboard.module.css'

function DocBadge({ status }) {
  const map = { READY:'badge-success', PENDING:'badge-warning', PROCESSING:'badge-info', ERROR:'badge-danger' }
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })

  const docs  = data?.documents || []
  const ready = docs.filter(d => d.status === 'READY').length
  const total = docs.length

  return (
    <PageWrapper>
      <div className="page-container">
        {/* Greeting */}
        <motion.div className={styles.greeting}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div>
            <h1>Good day, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p style={{color:'var(--text-muted)', marginTop:'0.25rem'}}>Here's an overview of your plagiarism detection activity.</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <FileText size={16}/> Upload Document
          </Link>
        </motion.div>

        {/* Stats row */}
        <div className={styles.stats}>
          {[
            { icon: FileText,   label: 'Total Documents', value: total,                    color: '#7c3aed' },
            { icon: Network,    label: 'Graphs Built',    value: ready,                    color: '#06b6d4' },
            { icon: GitCompare, label: 'Comparisons',     value: '—',                      color: '#10b981' },
            { icon: TrendingUp, label: 'Avg Similarity',  value: '—',                      color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Recent documents */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3>Recent Documents</h3>
            <Link to="/upload" className="btn btn-ghost" style={{fontSize:'0.82rem'}}>
              View all <ArrowRight size={14}/>
            </Link>
          </div>

          {isLoading ? (
            <div className={styles.docList}>
              {[...Array(4)].map((_,i) => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className={styles.empty}>
              <FileText size={40} style={{ opacity:0.3 }} />
              <p>No documents yet. Upload your first document to get started.</p>
              <Link to="/upload" className="btn btn-primary">Upload Now</Link>
            </div>
          ) : (
            <div className={styles.docList}>
              {docs.slice(0, 6).map((doc, i) => (
                <motion.div key={doc.id} className={styles.docRow}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.06 }}>
                  <div className={styles.docIcon}><FileText size={18}/></div>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.original_name}</span>
                    <span className={styles.docMeta}>
                      <Clock size={12}/> {new Date(doc.created_at).toLocaleDateString()} · {doc.word_count} words
                    </span>
                  </div>
                  <DocBadge status={doc.status} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className={styles.section}>
          <h3>Quick Actions</h3>
          <div className={styles.quickGrid}>
            {[
              { to:'/upload',  icon: FileText,   label:'Upload Document',   desc:'Add a new document for analysis'     },
              { to:'/compare', icon: GitCompare, label:'Compare Documents', desc:'Run plagiarism detection between two docs' },
              { to:'/reports', icon: TrendingUp, label:'View Reports',      desc:'See detailed similarity reports'     },
            ].map(({ to, icon: Icon, label, desc }) => (
              <Link key={to} to={to} className={styles.quickCard}>
                <div className={styles.quickIcon}><Icon size={22}/></div>
                <div>
                  <div className={styles.quickLabel}>{label}</div>
                  <div className={styles.quickDesc}>{desc}</div>
                </div>
                <ArrowRight size={16} className={styles.quickArrow}/>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
