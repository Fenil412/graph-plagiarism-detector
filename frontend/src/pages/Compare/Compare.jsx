import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, FileText, ChevronDown, Loader, Network, ZoomIn, ZoomOut, Maximize2, X, Minimize2 } from 'lucide-react'
import { documentAPI, plagiarismAPI, graphAPI } from '@/services/api'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/ui/PageWrapper'
import ForceGraph2D from 'react-force-graph-2d'
import styles from './Compare.module.css'

/* ── Color palette for nodes by weight rank ──────────────────────────────────── */
const NODE_PALETTE = [
  '#a78bfa', '#818cf8', '#7c3aed', '#6d28d9', '#5b21b6',  // purples
  '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',  // cyans
]
const NODE_PALETTE_B = [
  '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',  // cyans
  '#34d399', '#10b981', '#059669', '#047857', '#065f46',  // greens
]

/* ── Score meter arc ─────────────────────────────────────────────────────────── */
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

/* ── Document selector dropdown ──────────────────────────────────────────────── */
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

/* ── Fullscreen modal overlay for a graph ────────────────────────────────────── */
function FullscreenModal({ isOpen, onClose, label, accentColor, forceData, graphData, palette }) {
  const fgRef = useRef()
  const containerRef = useRef()
  const [dims, setDims] = useState({ width: 900, height: 600 })
  const [hoveredNode, setHoveredNode] = useState(null)

  // Measure the modal body
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const measure = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Auto-fit
  useEffect(() => {
    if (isOpen && fgRef.current) {
      setTimeout(() => fgRef.current?.zoomToFit(500, 50), 300)
    }
  }, [isOpen, dims])

  const paintNode = useCallback((node, ctx, globalScale) => {
    const baseR = Math.max(3.5, (node.weight || 1) * 2.5)
    const isMatch = node.isMatch
    const isHovered = hoveredNode === node.id
    const nodeColor = isMatch ? '#f59e0b' : isHovered ? '#fff' : (node.color || accentColor)

    // Glow
    if (isMatch || isHovered) {
      ctx.shadowColor = isMatch ? '#f59e0b' : accentColor
      ctx.shadowBlur = isHovered ? 22 : 14
    }

    // Circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, baseR, 0, 2 * Math.PI)
    ctx.fillStyle = nodeColor
    ctx.fill()

    // Outer ring
    ctx.strokeStyle = isMatch ? '#fbbf24' : nodeColor
    ctx.lineWidth = 0.6
    ctx.stroke()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Always show labels in fullscreen
    const fontSize = Math.max(9, 13 / globalScale)
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const text = node.label || node.id
    const textW = ctx.measureText(text).width
    const padding = 3 / globalScale
    ctx.fillStyle = 'rgba(10, 12, 20, 0.8)'
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(node.x - textW / 2 - padding, node.y + baseR + 2, textW + padding * 2, fontSize + padding * 2, 3 / globalScale)
    } else {
      ctx.rect(node.x - textW / 2 - padding, node.y + baseR + 2, textW + padding * 2, fontSize + padding * 2)
    }
    ctx.fill()

    ctx.fillStyle = isMatch ? '#fbbf24' : isHovered ? '#fff' : 'rgba(255,255,255,0.9)'
    ctx.fillText(text, node.x, node.y + baseR + 2 + padding)
  }, [accentColor, hoveredNode])

  // Edge renderer with weight labels
  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source
    const end = link.target
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = `${accentColor}55`
    ctx.lineWidth = Math.max(0.8, (link.weight || 1) * 0.7)
    ctx.stroke()

    // Weight label
    if (globalScale > 0.8 && link.weight && link.weight > 1) {
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const fs = Math.max(7, 9 / globalScale)
      ctx.font = `${fs}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(148,163,184,0.55)'
      ctx.fillText(link.weight.toFixed(1), mx, my)
    }
  }, [accentColor])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContent}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', duration: 0.35 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <Network size={18} style={{ color: accentColor }} />
          <span className={styles.modalTitle}>{label}</span>
          {graphData && (
            <span className={styles.graphStats}>
              {graphData.node_count} nodes · {graphData.edge_count} edges
            </span>
          )}
          <div className={styles.graphToolbar}>
            <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 300)} title="Zoom In"><ZoomIn size={15}/></button>
            <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 300)} title="Zoom Out"><ZoomOut size={15}/></button>
            <button onClick={() => fgRef.current?.zoomToFit(400, 40)} title="Fit to View"><Minimize2 size={15}/></button>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={20}/></button>
        </div>

        <div className={styles.modalBody} ref={containerRef}>
          {forceData.nodes.length > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={forceData}
              width={dims.width}
              height={dims.height}
              backgroundColor="transparent"
              nodeCanvasObject={paintNode}
              nodePointerAreaPaint={(node, color, ctx) => {
                const r = Math.max(4, (node.weight || 1) * 3)
                ctx.beginPath()
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
                ctx.fillStyle = color
                ctx.fill()
              }}
              onNodeHover={node => setHoveredNode(node?.id || null)}
              linkCanvasObject={paintLink}
              linkDirectionalParticles={0}
              cooldownTicks={100}
              d3AlphaDecay={0.03}
              d3VelocityDecay={0.25}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ── 2D Force-Graph panel for a single document ──────────────────────────────── */
function GraphPanel({ documentId, label, accentColor, matchingKeywords, palette }) {
  const graphRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 400, height: 340 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredNode, setHoveredNode] = useState(null)

  // Fetch graph data
  const { data: graphData, isLoading, isError } = useQuery({
    queryKey: ['graph', documentId],
    queryFn: () => graphAPI.get(documentId).then(r => r.data),
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5,
  })

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({ width: Math.max(280, width - 4), height: 340 })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Convert API data → force-graph format with colors
  const forceData = useMemo(() => {
    if (!graphData?.nodes?.length) return { nodes: [], links: [] }

    const matchSet = new Set((matchingKeywords || []).map(k => k.toLowerCase()))

    // Sort by weight to assign colors by rank
    const sorted = [...graphData.nodes].sort((a, b) => (b.weight || 1) - (a.weight || 1))
    const colorMap = {}
    sorted.forEach((n, idx) => {
      const colorIdx = Math.min(Math.floor((idx / sorted.length) * palette.length), palette.length - 1)
      colorMap[n.id || n.label] = palette[colorIdx]
    })

    const nodes = graphData.nodes.map(n => ({
      id: n.id || n.label,
      label: n.label,
      weight: n.weight || 1,
      isMatch: matchSet.has((n.label || '').toLowerCase()),
      color: colorMap[n.id || n.label] || accentColor,
    }))

    const nodeIds = new Set(nodes.map(n => n.id))
    const links = (graphData.edges || [])
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight || 1,
        relation: e.relation || 'co-occurrence',
      }))

    return { nodes, links }
  }, [graphData, matchingKeywords, palette, accentColor])

  // ── DEFAULT VIEW: clean graph, NO labels (labels only on hover or zoom) ──
  const paintNode = useCallback((node, ctx, globalScale) => {
    const r = Math.max(2.5, (node.weight || 1) * 1.8)
    const isMatch = node.isMatch
    const isHovered = hoveredNode === node.id
    const showLabel = isHovered || globalScale > 3.0  // labels only on hover or high zoom
    const nodeColor = isMatch ? '#f59e0b' : isHovered ? '#e2e8f0' : (node.color || accentColor)

    // Glow
    if (isMatch || isHovered) {
      ctx.shadowColor = isMatch ? '#f59e0b' : nodeColor
      ctx.shadowBlur = isHovered ? 18 : 10
    }

    // Node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
    ctx.fillStyle = nodeColor
    ctx.fill()

    // Outer ring for larger nodes
    if (node.weight > 2 || isMatch) {
      ctx.strokeStyle = isMatch ? '#fbbf2488' : nodeColor + '66'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Label — only on hover or zoom
    if (showLabel) {
      const fontSize = Math.max(7, 10 / globalScale)
      ctx.font = `600 ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      const text = node.label || node.id
      const textW = ctx.measureText(text).width
      const pad = 2 / globalScale

      // Background pill
      ctx.fillStyle = 'rgba(10, 12, 20, 0.8)'
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(node.x - textW / 2 - pad, node.y + r + 1, textW + pad * 2, fontSize + pad * 2, 2 / globalScale)
      } else {
        ctx.rect(node.x - textW / 2 - pad, node.y + r + 1, textW + pad * 2, fontSize + pad * 2)
      }
      ctx.fill()

      ctx.fillStyle = isMatch ? '#fbbf24' : isHovered ? '#fff' : 'rgba(255,255,255,0.85)'
      ctx.fillText(text, node.x, node.y + r + 1 + pad)
    }
  }, [accentColor, hoveredNode])

  // ── Edge renderer: always visible, colored, thicker ──
  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source
    const end = link.target

    // Edge line — visible at default zoom
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = `${accentColor}55`
    ctx.lineWidth = Math.max(0.6, (link.weight || 1) * 0.5)
    ctx.stroke()

    // Weight label on zoom
    if (globalScale > 3.0 && link.weight && link.weight > 1) {
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const fs = Math.max(6, 8 / globalScale)
      ctx.font = `${fs}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(148,163,184,0.5)'
      ctx.fillText(link.weight.toFixed(1), mx, my)
    }
  }, [accentColor])

  // Toolbar
  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 300)
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 300)
  const handleFit = () => graphRef.current?.zoomToFit(400, 30)

  if (!documentId) {
    return (
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <Network size={16} style={{ color: accentColor }} />
          <span>{label}</span>
        </div>
        <div className={styles.graphEmpty}>
          <Network size={36} style={{ opacity: 0.15 }} />
          <p>Select a document to view its graph</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <Network size={16} style={{ color: accentColor }} />
          <span>{label}</span>
          {graphData && (
            <span className={styles.graphStats}>
              {graphData.node_count} nodes · {graphData.edge_count} edges
            </span>
          )}
          <div className={styles.graphToolbar}>
            <button onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14}/></button>
            <button onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14}/></button>
            <button onClick={handleFit} title="Fit to View"><Minimize2 size={14}/></button>
            <button onClick={() => setIsFullscreen(true)} title="Fullscreen" className={styles.maxBtn}><Maximize2 size={14}/></button>
          </div>
        </div>

        <div className={styles.graphBody} ref={containerRef}>
          {isLoading && (
            <div className={styles.graphEmpty}>
              <Loader size={28} className="animate-spin" style={{ color: accentColor }}/>
              <p>Loading graph…</p>
            </div>
          )}
          {isError && (
            <div className={styles.graphEmpty}>
              <Network size={28} style={{ color: 'var(--danger)' }}/>
              <p style={{ color:'var(--danger)' }}>Failed to load graph</p>
            </div>
          )}
          {!isLoading && !isError && forceData.nodes.length === 0 && (
            <div className={styles.graphEmpty}>
              <Network size={28} style={{ opacity: 0.2 }}/>
              <p>No graph data available</p>
            </div>
          )}
          {!isLoading && !isError && forceData.nodes.length > 0 && (
            <ForceGraph2D
              ref={graphRef}
              graphData={forceData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="transparent"
              nodeCanvasObject={paintNode}
              nodePointerAreaPaint={(node, color, ctx) => {
                const r = Math.max(3, (node.weight || 1) * 2.2)
                ctx.beginPath()
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
                ctx.fillStyle = color
                ctx.fill()
              }}
              onNodeHover={node => setHoveredNode(node?.id || null)}
              linkCanvasObject={paintLink}
              linkDirectionalParticles={0}
              cooldownTicks={80}
              d3AlphaDecay={0.04}
              d3VelocityDecay={0.3}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 30)}
            />
          )}
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenModal
            isOpen={isFullscreen}
            onClose={() => setIsFullscreen(false)}
            label={label}
            accentColor={accentColor}
            forceData={forceData}
            graphData={graphData}
            palette={palette}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Algorithm list ──────────────────────────────────────────────────────────── */
const ALGOS = ['node_overlap','edge_similarity','subgraph','graph_edit_distance']

/* ── Main Compare page ───────────────────────────────────────────────────────── */
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
  const matchingKw = result?.matching_keywords || []

  return (
    <PageWrapper>
      <div className="page-container">
        <h2 style={{ marginBottom:'0.5rem' }}>Compare Documents</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Select two READY documents and run graph-based plagiarism detection.</p>

        {/* ── Graph Visualization Row ── */}
        <motion.div className={styles.graphRow}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GraphPanel
            documentId={docA}
            label="Document A — Graph"
            accentColor="#7c3aed"
            matchingKeywords={matchingKw}
            palette={NODE_PALETTE}
          />
          <div className={styles.graphVs}>
            <div className={styles.vsBadge}><GitCompare size={18}/></div>
          </div>
          <GraphPanel
            documentId={docB}
            label="Document B — Graph"
            accentColor="#06b6d4"
            matchingKeywords={matchingKw}
            palette={NODE_PALETTE_B}
          />
        </motion.div>

        {/* ── Config + Results row ── */}
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
