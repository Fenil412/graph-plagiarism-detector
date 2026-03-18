import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, File, CheckCircle, XCircle, Loader, X, Network, FileText } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { documentAPI, plagiarismAPI } from '@/services/api'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Upload.module.css'

const STEPS = ['Upload', 'Processing', 'Graph Build', 'Ready']

function ProgressSteps({ currentStep, steps }) {
  return (
    <div className={styles.progressSteps}>
      {steps.map((label, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        const isError = currentStep === -1
        return (
          <div key={i} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${isDone ? styles.stepDone : isActive ? styles.stepActive : ''} ${isError ? styles.stepError : ''}`}>
              {isDone ? <CheckCircle size={14}/> : isError ? <XCircle size={14}/> : <span>{step}</span>}
            </div>
            <span className={styles.stepLabel} style={{ color: isActive ? 'var(--accent-primary)' : isDone ? 'var(--success)' : 'var(--text-muted)' }}>
              {label}
            </span>
            {i < steps.length - 1 && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`}/>}
          </div>
        )
      })}
    </div>
  )
}

function FileItem({ file, status, onRemove, documentId }) {
  const icons = { idle: <File size={18}/>, uploading: <Loader size={18} className="animate-spin"/>, done: <CheckCircle size={18}/>, error: <XCircle size={18}/> }
  const colors = { idle:'var(--text-muted)', uploading:'var(--info)', done:'var(--success)', error:'var(--danger)' }

  // Poll document status after upload
  const { data: statusData } = useQuery({
    queryKey: ['doc-status', documentId],
    queryFn: () => plagiarismAPI.status(documentId).then(r => r.data),
    enabled: !!documentId && status === 'done',
    refetchInterval: 2000,
  })

  const step = statusData?.step || (status === 'done' ? 1 : 0)
  const isReady = statusData?.status === 'READY'

  return (
    <motion.div className={styles.fileItem} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:20 }}>
      <div className={styles.fileIcon} style={{ color: isReady ? 'var(--success)' : colors[status] }}>
        {isReady ? <Network size={18}/> : icons[status]}
      </div>
      <div className={styles.fileInfo}>
        <span className={styles.fileName}>{file.name}</span>
        <span className={styles.fileSize}>
          {(file.size/1024).toFixed(1)} KB · {isReady ? '✅ Ready' : status}
        </span>
        {status === 'uploading' && (
          <div className={styles.progressBar}>
            <motion.div className={styles.progressFill} animate={{ width:['0%','100%'] }} transition={{ duration:2.5, ease:'easeInOut' }}/>
          </div>
        )}
        {/* Show step progress after upload */}
        {documentId && status === 'done' && !isReady && (
          <ProgressSteps currentStep={step} steps={STEPS}/>
        )}
      </div>
      {status !== 'uploading' && (
        <button className={styles.removeBtn} onClick={onRemove}><X size={14}/></button>
      )}
    </motion.div>
  )
}

export default function Upload() {
  const [files, setFiles] = useState([])
  const [statuses, setStatuses] = useState({})
  const [docIds, setDocIds] = useState({})  // file.name -> document ID
  const queryClient = useQueryClient()

  const { mutateAsync: uploadFile } = useMutation({
    mutationFn: file => documentAPI.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const onDrop = useCallback(accepted => {
    const newFiles = accepted.filter(f => !files.find(e => e.name === f.name))
    setFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(f => setStatuses(s => ({ ...s, [f.name]: 'idle' })))
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  })

  const uploadAll = async () => {
    const pending = files.filter(f => statuses[f.name] === 'idle')
    if (!pending.length) { toast.error('No files to upload'); return }
    for (const file of pending) {
      setStatuses(s => ({ ...s, [file.name]: 'uploading' }))
      try {
        const res = await uploadFile(file)
        setStatuses(s => ({ ...s, [file.name]: 'done' }))
        // Store the document ID for status tracking
        if (res.data?.id) {
          setDocIds(d => ({ ...d, [file.name]: res.data.id }))
        }
        toast.success(`${file.name} uploaded!`)
      } catch {
        setStatuses(s => ({ ...s, [file.name]: 'error' }))
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const remove = name => {
    setFiles(f => f.filter(x => x.name !== name))
    setStatuses(s => { const n = { ...s }; delete n[name]; return n })
    setDocIds(d => { const n = { ...d }; delete n[name]; return n })
  }

  return (
    <PageWrapper>
      <div className="page-container">
        <motion.h1 
          className="text-4xl font-black mb-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Upload Document
        </motion.h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>
          Upload PDF, TXT or DOCX files. Graphs are built automatically in the background. Track progress in real-time.
        </p>

        {/* Drop zone */}
        <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
          <input {...getInputProps()} />
          <motion.div className={styles.dropContent}
            animate={{ scale: isDragActive ? 1.03 : 1 }} transition={{ duration: 0.2 }}>
            <div className={styles.dropIcon}>
              <UploadIcon size={36}/>
            </div>
            <h3>{isDragActive ? 'Drop files here' : 'Drag & drop your documents'}</h3>
            <p>or <span className={styles.browse}>browse files</span></p>
            <div className={styles.exts}>
              {['PDF','TXT','DOCX'].map(e => <span key={e} className="badge badge-purple">{e}</span>)}
            </div>
            <p style={{fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.5rem'}}>
              Max 10 MB per file · Auto-checked against knowledge base
            </p>
          </motion.div>
        </div>

        {/* File list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div className={styles.fileList}
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}>
              <div className={styles.fileListHead}>
                <span>{files.length} file{files.length>1?'s':''} selected</span>
                <button className="btn btn-primary" onClick={uploadAll}>
                  <UploadIcon size={15}/> Upload All
                </button>
              </div>
              <AnimatePresence>
                {files.map(f => (
                  <FileItem
                    key={f.name}
                    file={f}
                    status={statuses[f.name] || 'idle'}
                    onRemove={() => remove(f.name)}
                    documentId={docIds[f.name]}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
