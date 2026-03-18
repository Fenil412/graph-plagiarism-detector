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

  // Edge renderer with weight labels and hover highlighting
  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source
    const end = link.target

    const srcId = typeof link.source === 'object' ? link.source.id : link.source
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target
    const isConnected = hoveredNode && (srcId === hoveredNode || tgtId === hoveredNode)

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)

    if (isConnected) {
      ctx.strokeStyle = `${accentColor}cc`
      ctx.lineWidth = Math.max(1.8, (link.weight || 1) * 1.2)
      ctx.shadowColor = accentColor
      ctx.shadowBlur = 8
    } else {
      ctx.strokeStyle = hoveredNode ? `${accentColor}22` : `${accentColor}55`
      ctx.lineWidth = Math.max(0.8, (link.weight || 1) * 0.7)
    }
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Weight label
    if ((globalScale > 0.8 || isConnected) && link.weight && link.weight > 1) {
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const fs = Math.max(7, 9 / globalScale)
      ctx.font = `${fs}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isConnected ? 'rgba(255,255,255,0.85)' : 'rgba(148,163,184,0.55)'
      ctx.fillText(link.weight.toFixed(1), mx, my)
    }
  }, [accentColor, hoveredNode])

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
              onNodeClick={node => {
                toast(`🔍 "${node.label}" — weight: ${node.weight?.toFixed(1) || 1}${node.isMatch ? ' ⭐ Matching keyword!' : ''}`, {
                  icon: node.isMatch ? '⭐' : '🔎',
                  style: { background: '#0f172a', color: '#e2e8f0', border: `1px solid ${node.isMatch ? '#f59e0b' : accentColor}` },
                })
              }}
              onNodeDrag={node => {
                node.fx = node.x
                node.fy = node.y
              }}
              onNodeDragEnd={node => {
                node.fx = node.x
                node.fy = node.y
              }}
              linkCanvasObject={paintLink}
              linkDirectionalParticles={link => {
                const srcMatch = forceData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))?.isMatch
                const tgtMatch = forceData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target))?.isMatch
                return (srcMatch && tgtMatch) ? 3 : 0
              }}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleColor={() => '#f59e0b'}
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
  const [focusedNode, setFocusedNode] = useState(null)

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

  // Count connections for a node
  const getNodeConnections = useCallback((nodeId) => {
    return forceData.links.filter(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      return s === nodeId || t === nodeId
    }).length
  }, [forceData.links])

  // Get connected node labels
  const getConnectedLabels = useCallback((nodeId) => {
    const connected = []
    forceData.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      if (s === nodeId) {
        const n = forceData.nodes.find(x => x.id === t)
        if (n) connected.push(n.label)
      } else if (t === nodeId) {
        const n = forceData.nodes.find(x => x.id === s)
        if (n) connected.push(n.label)
      }
    })
    return connected.slice(0, 5)
  }, [forceData])

  // ── DEFAULT VIEW: clean graph, NO labels (labels only on hover or zoom) ──
  const paintNode = useCallback((node, ctx, globalScale) => {
    const r = Math.max(2.5, (node.weight || 1) * 1.8)
    const isMatch = node.isMatch
    const isHovered = hoveredNode === node.id
    const isFocused = focusedNode?.id === node.id
    const showLabel = isHovered || isFocused || globalScale > 3.0
    const nodeColor = isMatch ? '#f59e0b' : isHovered ? '#e2e8f0' : isFocused ? '#fff' : (node.color || accentColor)

    // Glow
    if (isMatch || isHovered || isFocused) {
      ctx.shadowColor = isMatch ? '#f59e0b' : isFocused ? accentColor : nodeColor
      ctx.shadowBlur = isFocused ? 22 : isHovered ? 18 : 10
    }

    // Node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, isFocused ? r * 1.4 : r, 0, 2 * Math.PI)
    ctx.fillStyle = nodeColor
    ctx.fill()

    // Outer ring for larger nodes or focused
    if (node.weight > 2 || isMatch || isFocused) {
      ctx.strokeStyle = isFocused ? '#fff44' : isMatch ? '#fbbf2488' : nodeColor + '66'
      ctx.lineWidth = isFocused ? 1 : 0.5
      ctx.beginPath()
      ctx.arc(node.x, node.y, (isFocused ? r * 1.4 : r) + 1.5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Pinned indicator
    if (node.fx !== undefined && node.fy !== undefined) {
      ctx.fillStyle = accentColor + '88'
      ctx.beginPath()
      ctx.arc(node.x, node.y - r - 3, 1.5, 0, 2 * Math.PI)
      ctx.fill()
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Label — only on hover, focus, or zoom
    if (showLabel) {
      const fontSize = Math.max(7, 10 / globalScale)
      ctx.font = `600 ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      const text = node.label || node.id
      const textW = ctx.measureText(text).width
      const pad = 2 / globalScale

      // Background pill
      ctx.fillStyle = isFocused ? 'rgba(124, 58, 237, 0.9)' : 'rgba(10, 12, 20, 0.8)'
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(node.x - textW / 2 - pad, node.y + r + 1, textW + pad * 2, fontSize + pad * 2, 2 / globalScale)
      } else {
        ctx.rect(node.x - textW / 2 - pad, node.y + r + 1, textW + pad * 2, fontSize + pad * 2)
      }
      ctx.fill()

      ctx.fillStyle = isMatch ? '#fbbf24' : isFocused ? '#fff' : isHovered ? '#fff' : 'rgba(255,255,255,0.85)'
      ctx.fillText(text, node.x, node.y + r + 1 + pad)
    }
  }, [accentColor, hoveredNode, focusedNode])

  // ── Edge renderer: highlight connected edges on node hover ──
  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source
    const end = link.target

    const srcId = typeof link.source === 'object' ? link.source.id : link.source
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target
    const isConnectedHover = hoveredNode && (srcId === hoveredNode || tgtId === hoveredNode)
    const isConnectedFocus = focusedNode && (srcId === focusedNode.id || tgtId === focusedNode.id)
    const isHighlighted = isConnectedHover || isConnectedFocus

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)

    if (isHighlighted) {
      ctx.strokeStyle = isConnectedFocus ? `${accentColor}dd` : `${accentColor}cc`
      ctx.lineWidth = Math.max(1.5, (link.weight || 1) * 1.2)
      ctx.shadowColor = accentColor
      ctx.shadowBlur = isConnectedFocus ? 10 : 6
    } else {
      ctx.strokeStyle = (hoveredNode || focusedNode) ? `${accentColor}18` : `${accentColor}55`
      ctx.lineWidth = Math.max(0.6, (link.weight || 1) * 0.5)
    }
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Weight label on zoom, hover, or focus
    if ((globalScale > 3.0 || isHighlighted) && link.weight && link.weight > 1) {
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const fs = Math.max(6, 8 / globalScale)
      ctx.font = `${fs}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isHighlighted ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.5)'
      ctx.fillText(link.weight.toFixed(1), mx, my)
    }
  }, [accentColor, hoveredNode, focusedNode])

  // Toolbar
  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 300)
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 300)
  const handleFit = () => { graphRef.current?.zoomToFit(400, 30); setFocusedNode(null) }

  // Node click → zoom to node + show info overlay
  const handleNodeClick = useCallback((node) => {
    setFocusedNode(prev => prev?.id === node.id ? null : node)
    // Zoom to the clicked node
    graphRef.current?.centerAt(node.x, node.y, 600)
    graphRef.current?.zoom(4, 600)
  }, [])

  // Double click → unpin a node
  const handleNodeDoubleClick = useCallback((node) => {
    node.fx = undefined
    node.fy = undefined
    toast('📌 Node unpinned!', { icon: '🔓', duration: 1500 })
  }, [])

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

        <div className={styles.graphBody} ref={containerRef} style={{ position: 'relative' }}>
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
            <>
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
                onNodeHover={node => {
                  setHoveredNode(node?.id || null)
                  document.body.style.cursor = node ? 'pointer' : 'default'
                }}
                onNodeClick={handleNodeClick}
                onBackgroundClick={() => setFocusedNode(null)}
                onNodeDrag={node => {
                  node.fx = node.x
                  node.fy = node.y
                }}
                onNodeDragEnd={node => {
                  node.fx = node.x
                  node.fy = node.y
                }}
                linkCanvasObject={paintLink}
                linkDirectionalParticles={link => {
                  const srcMatch = forceData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))?.isMatch
                  const tgtMatch = forceData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target))?.isMatch
                  return (srcMatch && tgtMatch) ? 4 : 1
                }}
                linkDirectionalParticleWidth={link => {
                  const srcMatch = forceData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))?.isMatch
                  const tgtMatch = forceData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target))?.isMatch
                  return (srcMatch && tgtMatch) ? 2.5 : 1
                }}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={link => {
                  const srcMatch = forceData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))?.isMatch
                  return srcMatch ? '#f59e0b' : accentColor + '66'
                }}
                cooldownTicks={80}
                d3AlphaDecay={0.04}
                d3VelocityDecay={0.3}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                onEngineStop={() => graphRef.current?.zoomToFit(400, 30)}
              />

              {/* ── Focused Node Info Overlay ── */}
              <AnimatePresence>
                {focusedNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={styles.nodeOverlay}
                    style={{ borderColor: focusedNode.isMatch ? '#f59e0b44' : accentColor + '44' }}
                  >
                    <div className={styles.nodeOverlayDot} style={{ background: focusedNode.isMatch ? '#f59e0b' : focusedNode.color || accentColor }}/>
                    <div className={styles.nodeOverlayInfo}>
                      <div className={styles.nodeOverlayName}>
                        {focusedNode.label}
                        {focusedNode.isMatch && <span className={styles.nodeOverlayBadge}>⭐ Match</span>}
                        {focusedNode.fx !== undefined && <span className={styles.nodeOverlayPin}>📌</span>}
                      </div>
                      <div className={styles.nodeOverlayMeta}>
                        Weight: {focusedNode.weight?.toFixed(1)} · 
                        {' '}{getNodeConnections(focusedNode.id)} connections · 
                        {' '}{getConnectedLabels(focusedNode.id).join(', ')}
                      </div>
                    </div>
                    <div className={styles.nodeOverlayActions}>
                      {focusedNode.fx !== undefined && (
                        <button onClick={() => { focusedNode.fx = undefined; focusedNode.fy = undefined; setFocusedNode(null) }}
                          className={styles.nodeOverlayBtn} title="Unpin node">🔓</button>
                      )}
                      <button onClick={() => setFocusedNode(null)} className={styles.nodeOverlayBtn} title="Dismiss">✕</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Interaction hint ── */}
              {!focusedNode && !hoveredNode && (
                <div className={styles.graphHint}>
                  Click nodes to explore · Drag to pin · Double-click to unpin
                </div>
              )}
            </>
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

/* ── Highlight level → color ─────────────────────────────────────────────────── */
const LEVEL_COLORS = {
  high:    { bg:'rgba(239,68,68,0.15)', border:'#ef4444', text:'#fca5a5' },
  partial: { bg:'rgba(245,158,11,0.12)', border:'#f59e0b', text:'#fde68a' },
  low:     { bg:'rgba(148,163,184,0.08)', border:'#64748b', text:'#94a3b8' },
}

/* ── Side-by-side highlighting panel ─────────────────────────────────────────── */
function HighlightPanel({ sentences, label, accentColor, scrollRef, onScroll }) {
  if (!sentences?.length) return null
  return (
    <div className={styles.hlPanel}>
      <div className={styles.hlHeader} style={{ borderColor: accentColor + '33' }}>
        <FileText size={14} style={{ color: accentColor }}/>
        <span>{label}</span>
        <span className={styles.hlCount}>{sentences.length} sentences</span>
      </div>
      <div className={styles.hlBody} ref={scrollRef} onScroll={onScroll}>
        {sentences.map((s, i) => {
          const colors = s.level ? LEVEL_COLORS[s.level] : null
          return (
            <div key={i} className={styles.hlSentence}
              style={colors ? {
                background: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
              } : {}}>
              <span className={styles.hlIndex}>#{i+1}</span>
              <span>{s.text}</span>
              {s.level && (
                <span className={styles.hlBadge} style={{ color: colors.border, background: colors.bg }}>
                  {s.level} · {(s.similarity * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Compare page ───────────────────────────────────────────────────────── */
export default function Compare() {
  const [docA, setDocA] = useState('')
  const [docB, setDocB] = useState('')
  const [algo, setAlgo] = useState('node_overlap')
  const [result, setResult] = useState(null)
  const scrollRefA = useRef(null)
  const scrollRefB = useRef(null)
  const syncing = useRef(false)

  const { data } = useQuery({ queryKey:['documents'], queryFn:()=>documentAPI.list().then(r=>r.data) })
  const docs = data?.documents || []

  const { mutate: compare, isPending } = useMutation({
    mutationFn: () => plagiarismAPI.compare(docA, docB, algo).then(r => r.data),
    onSuccess: data => { setResult(data); toast.success('Comparison complete!') },
    onError: err => toast.error(err.response?.data?.detail || 'Comparison failed'),
  })

  const canCompare = docA && docB && docA !== docB && !isPending
  const matchingKw = result?.matching_keywords || []
  const matchingSubgraph = result?.matching_subgraph || null

  // Synchronized scrolling between highlight panels
  const handleScrollSync = (source) => {
    if (syncing.current) return
    syncing.current = true
    const src = source === 'a' ? scrollRefA.current : scrollRefB.current
    const dst = source === 'a' ? scrollRefB.current : scrollRefA.current
    if (src && dst) {
      const ratio = src.scrollTop / (src.scrollHeight - src.clientHeight || 1)
      dst.scrollTop = ratio * (dst.scrollHeight - dst.clientHeight || 1)
    }
    requestAnimationFrame(() => { syncing.current = false })
  }

  // PDF download
  const handleDownloadPdf = async () => {
    if (!result?.comparison?.id) return
    try {
      const response = await plagiarismAPI.downloadPdf(result.comparison.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_${result.comparison.id.slice(0,8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Failed to download PDF')
    }
  }

  return (
    <PageWrapper>
      <div className="page-container">
        <motion.h1 
          className="text-4xl font-black mb-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Compare Documents
        </motion.h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Select two READY documents and run graph-based plagiarism detection with AI-powered semantic analysis.</p>

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
                  <p>Analyzing graphs + semantic AI…</p>
                </motion.div>
              )}
              {result && !isPending && (
                <motion.div key="result" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
                  <ScoreMeter pct={result.comparison?.plagiarism_percentage || 0}/>
                  <div className={styles.resultDetails}>
                    <div className={styles.resultRow}>
                      <span>Graph Similarity</span>
                      <strong>{((result.comparison?.similarity_score||0)*100).toFixed(2)}%</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>🧠 Semantic AI Score</span>
                      <strong style={{ color:'#06b6d4' }}>{((result.semantic_score||0)*100).toFixed(1)}%</strong>
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
                      <span>Matched Sentences</span>
                      <strong>{result.sentence_matches?.length || 0}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>AI Paraphrases</span>
                      <strong style={{ color:'#f59e0b' }}>{result.semantic_matches?.length || 0}</strong>
                    </div>
                  </div>

                  {/* Download PDF button */}
                  <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.65rem', marginTop:'0.75rem', fontSize:'0.85rem' }}
                    onClick={handleDownloadPdf}>
                    📄 Download PDF Report
                  </button>

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

                  {/* Semantic AI matches */}
                  {result.semantic_matches?.length > 0 && (
                    <div className={styles.sentences} style={{ marginTop:'1rem' }}>
                      <h4>🧠 AI-Detected Paraphrases</h4>
                      {result.semantic_matches.slice(0,3).map((m,i) => (
                        <div key={i} className={styles.sentItem} style={{
                          borderLeftColor: m.level === 'high' ? '#ef4444' : m.level === 'partial' ? '#f59e0b' : '#64748b'
                        }}>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.3rem' }}>
                            Similarity: <strong style={{ color: m.level === 'high' ? '#ef4444' : '#f59e0b' }}>{(m.similarity*100).toFixed(0)}%</strong>
                          </div>
                          <div style={{ fontSize:'0.78rem' }}>A: "{m.sentence_a?.slice(0,120)}"</div>
                          <div style={{ fontSize:'0.78rem', marginTop:'0.2rem' }}>B: "{m.sentence_b?.slice(0,120)}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Smart Highlighting: Side-by-Side ── */}
        {result?.highlight_map && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'2rem 0 1rem' }}>
              <h3 style={{ margin:0 }}>🔍 Smart Highlighting</h3>
              <div style={{ display:'flex', gap:'0.6rem', fontSize:'0.72rem' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:'rgba(239,68,68,0.3)', border:'1px solid #ef4444' }}/> High
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:'rgba(245,158,11,0.2)', border:'1px solid #f59e0b' }}/> Partial
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:'var(--bg-overlay)', border:'1px solid var(--border-subtle)' }}/> Clean
                </span>
              </div>
            </div>
            <div className={styles.hlGrid}>
              <HighlightPanel
                sentences={result.highlight_map.sentences_a}
                label="Document A"
                accentColor="#7c3aed"
                scrollRef={scrollRefA}
                onScroll={() => handleScrollSync('a')}
              />
              <HighlightPanel
                sentences={result.highlight_map.sentences_b}
                label="Document B"
                accentColor="#06b6d4"
                scrollRef={scrollRefB}
                onScroll={() => handleScrollSync('b')}
              />
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

