import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Trash2, Clock, Search } from 'lucide-react'
import { documentAPI } from '@/services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './History.module.css'

const STATUS_MAP = { READY:'badge-success', PENDING:'badge-warning', PROCESSING:'badge-info', ERROR:'badge-danger' }

export default function History() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })

  const { mutate: deleteDoc } = useMutation({
    mutationFn: id => documentAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey:['documents'] }); toast.success('Document deleted') },
    onError: () => toast.error('Delete failed'),
  })

  const docs = (data?.documents || []).filter(d =>
    d.original_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper>
      <div className="page-container">
        <h2 style={{ marginBottom:'0.5rem' }}>History</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>All uploaded documents and their processing status.</p>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon}/>
            <input className="input" placeholder="Search documents…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'2.4rem' }}/>
          </div>
          <span className={styles.count}>{docs.length} document{docs.length!==1?'s':''}</span>
        </div>

        {isLoading
          ? <div className={styles.list}>{[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{height:64,borderRadius:12}}/>)}</div>
          : docs.length === 0
          ? <div className={styles.empty}><FileText size={40} style={{opacity:0.25}}/><p>{search ? 'No documents match your search.' : 'No documents yet.'}</p></div>
          : (
            <div className={styles.list}>
              {docs.map((doc, i) => (
                <motion.div key={doc.id} className={styles.row}
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                  <div className={styles.rowIcon}><FileText size={18}/></div>
                  <div className={styles.rowInfo}>
                    <span className={styles.rowName}>{doc.original_name}</span>
                    <span className={styles.rowMeta}>
                      <Clock size={11}/> {new Date(doc.created_at).toLocaleString()} · {doc.word_count} words · {(doc.file_size/1024).toFixed(1)} KB
                    </span>
                  </div>
                  <span className={`badge ${STATUS_MAP[doc.status]||'badge-info'}`}>{doc.status}</span>
                  <button className={styles.deleteBtn} onClick={() => { if(confirm('Delete this document?')) deleteDoc(doc.id) }}>
                    <Trash2 size={15}/>
                  </button>
                </motion.div>
              ))}
            </div>
          )
        }
      </div>
    </PageWrapper>
  )
}
