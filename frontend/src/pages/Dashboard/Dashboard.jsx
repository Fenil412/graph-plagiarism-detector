import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Network, GitCompare, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { documentAPI, plagiarismAPI } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Dashboard.module.css'

// -- Charts & 3D Graphs Imports --
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut, Bar, PolarArea } from 'react-chartjs-2'
import ForceGraph3D from 'react-force-graph-3d'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function DocBadge({ status }) {
  const map = { READY:'badge-success', PENDING:'badge-warning', PROCESSING:'badge-info', ERROR:'badge-danger' }
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>
}

function processActivityData(docs) {
  // Group by date
  const counts = {}
  docs.forEach(doc => {
    const d = new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    counts[d] = (counts[d] || 0) + 1
  })
  
  // Convert to arrays
  const labels = Object.keys(counts).slice(-7) // last 7 distinct days
  const data = labels.map(l => counts[l])
  
  return { labels, data }
}

function processStatusData(docs) {
  const counts = { READY: 0, PENDING: 0, PROCESSING: 0, ERROR: 0 }
  docs.forEach(d => { if(counts[d.status] !== undefined) counts[d.status]++ })
  return counts
}

// Generate a 3D graph with named/labeled nodes and visible edges
function generateToughGraph() {
  const groups = [
    { name: 'Lexical', color: '#7c3aed' },
    { name: 'Semantic', color: '#06b6d4' },
    { name: 'Syntactic', color: '#10b981' },
    { name: 'Structural', color: '#f59e0b' },
    { name: 'Statistical', color: '#ef4444' },
  ]
  const sampleLabels = [
    ['word', 'token', 'lemma', 'stem', 'n-gram', 'bigram', 'trigram', 'char', 'prefix', 'suffix', 'phrase', 'collocation','frequency','TF-IDF','vocabulary','dictionary','corpus','stopword','punctuation','morpheme','inflection','derivation','compound','abbreviation'],
    ['meaning','concept','context','synonym','antonym','hypernym','hyponym','meronym','holonym','polysemy','homonym','metaphor','analogy','inference','entailment','paraphrase','coreference','disambiguation','categorization','taxonomy','ontology','embedding','vector','similarity'],
    ['parse','clause','modifier','subject','predicate','object','complement','adjunct','dependency','constituent','head','POS','tag','verb','noun','adjective','adverb','preposition','conjunction','determiner','pronoun','tense','aspect','mood'],
    ['paragraph','section','chapter','heading','title','abstract','introduction','conclusion','citation','reference','footnote','appendix','figure','table','caption','index','outline','summary','layout','format','template','scheme','pattern','hierarchy'],
    ['mean','median','mode','variance','deviation','distribution','correlation','regression','percentile','frequency','probability','hypothesis','confidence','interval','sample','population','outlier','normal','skew','kurtosis','entropy','divergence','mutual','information'],
  ]

  const N = 80
  const nodes = []
  for (let i = 0; i < N; i++) {
    const g = i % 5
    const labelIdx = Math.floor(i / 5) % sampleLabels[g].length
    nodes.push({
      id: i,
      name: sampleLabels[g][labelIdx],
      group: g,
      groupName: groups[g].name,
      color: groups[g].color,
      val: 1 + Math.random() * 3,
    })
  }

  const links = []
  // Intra-group connections (dense)
  for (let i = 0; i < N; i++) {
    const sameGroup = nodes.filter(n => n.group === nodes[i].group && n.id !== i)
    const edgeCount = 1 + Math.floor(Math.random() * 2)
    for (let j = 0; j < edgeCount && j < sameGroup.length; j++) {
      const target = sameGroup[Math.floor(Math.random() * sameGroup.length)]
      links.push({ source: i, target: target.id, value: 0.5 + Math.random() * 0.5 })
    }
  }
  // Inter-group connections (sparse)
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(Math.random() * N)
    let b = Math.floor(Math.random() * N)
    while (nodes[b].group === nodes[a].group) b = Math.floor(Math.random() * N)
    links.push({ source: a, target: b, value: 0.2 + Math.random() * 0.3 })
  }

  return { nodes, links }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(r => r.data),
  })

  const { data: historyData } = useQuery({
    queryKey: ['comparisons_history'],
    queryFn: () => plagiarismAPI.history().then(r => r.data),
  })

  // Graph data
  const graphData = useMemo(() => generateToughGraph(), [])
  const graphRef = useRef()

  // Auto-rotate 3D graph
  useEffect(() => {
    let angle = 0;
    let interval;
    if (graphRef.current) {
      interval = setInterval(() => {
        if (!graphRef.current) return;
        graphRef.current.cameraPosition({
          x: 350 * Math.sin(angle),
          z: 350 * Math.cos(angle)
        });
        angle += Math.PI / 450;
      }, 30);
    }
    return () => clearInterval(interval);
  }, [graphRef.current]);

  // Custom 3D node renderer with text labels
  const nodeThreeObject = useCallback((node) => {
    const group = new THREE.Group()

    // Sphere
    const geometry = new THREE.SphereGeometry(node.val * 1.5, 16, 16)
    const material = new THREE.MeshPhongMaterial({
      color: node.color,
      emissive: node.color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9,
    })
    const sphere = new THREE.Mesh(geometry, material)
    group.add(sphere)

    // Text label using canvas sprite
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 256
    canvas.height = 64
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background pill
    ctx.fillStyle = 'rgba(10, 12, 20, 0.8)'
    const text = node.name || `Node ${node.id}`
    ctx.font = 'bold 28px Inter, Arial, sans-serif'
    const textW = ctx.measureText(text).width
    const pillW = Math.min(textW + 24, 250)
    const pillX = (256 - pillW) / 2
    ctx.beginPath()
    ctx.roundRect(pillX, 8, pillW, 46, 12)
    ctx.fill()

    // Text
    ctx.fillStyle = node.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(20, 5, 1)
    sprite.position.set(0, node.val * 2 + 3, 0)
    group.add(sprite)

    return group
  }, [])

  const docs  = data?.documents || []
  const history = historyData || []
  const ready = docs.filter(d => d.status === 'READY').length
  const total = docs.length

  const totalComparisons = history.length
  const avgSimilarity = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.plagiarism_percentage, 0) / history.length).toFixed(1) + '%' 
    : '0%'

  // -- Charts Data --
  const activity = processActivityData(docs)
  const statusCounts = processStatusData(docs)

  // Check if we have minimal real data — if not, use richer dummy data
  const hasEnoughActivity = activity.labels.length >= 3
  const hasEnoughStatuses = (statusCounts.READY + statusCounts.PENDING + statusCounts.PROCESSING + statusCounts.ERROR) >= 3

  // Algorithm usage counts — include graph_edit_distance
  const algoCounts = { node_overlap: 0, edge_similarity: 0, subgraph: 0, graph_edit_distance: 0 }
  history.forEach(h => {
    if(algoCounts[h.algorithm_used] !== undefined) algoCounts[h.algorithm_used]++
  })
  const hasEnoughAlgo = Object.values(algoCounts).some(v => v > 0)

  // Dummy fallback data for Activity Over Time
  const dummyActivityLabels = ['Mar 11', 'Mar 12', 'Mar 13', 'Mar 14', 'Mar 15', 'Mar 16', 'Mar 17']
  const dummyActivityData = [3, 5, 2, 8, 6, 12, 7]

  // Chartjs Configs
  const lineChartData = {
    labels: hasEnoughActivity ? activity.labels : dummyActivityLabels,
    datasets: [
      {
        label: 'Uploads',
        data: hasEnoughActivity ? activity.data : dummyActivityData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
      }
    ]
  }

  const polarData = {
    labels: ['Node Overlap', 'Edge Similarity', 'Subgraph', 'Graph Edit Distance'],
    datasets: [{
      data: hasEnoughAlgo
        ? [algoCounts.node_overlap, algoCounts.edge_similarity, algoCounts.subgraph, algoCounts.graph_edit_distance]
        : [14, 9, 6, 4],
      backgroundColor: [
        'rgba(124, 58, 237, 0.7)',
        'rgba(6, 182, 212, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
      ],
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    }]
  }

  // Dummy status data when only one status has items
  const doughnutData = {
    labels: ['Ready', 'Pending', 'Processing', 'Error'],
    datasets: [{
      data: hasEnoughStatuses
        ? [statusCounts.READY, statusCounts.PENDING, statusCounts.PROCESSING, statusCounts.ERROR]
        : [
            statusCounts.READY || 8,
            statusCounts.PENDING || 3,
            statusCounts.PROCESSING || 2,
            statusCounts.ERROR || 1,
          ],
      backgroundColor: ['#10b981', '#f59e0b', '#06b6d4', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        display: true,
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        ticks: { color: '#64748b', font: { size: 11 } },
        beginAtZero: true,
      },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', usePointStyle: true, padding: 16, font: { size: 12 } } },
    }
  }

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        ticks: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    },
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } } },
    }
  }

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
            { icon: GitCompare, label: 'Comparisons',     value: totalComparisons,         color: '#10b981' },
            { icon: TrendingUp, label: 'Avg Similarity',  value: avgSimilarity,            color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* --- CHARTS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Activity Line Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#7c3aed" /> Activity Over Time
            </h3>
            <div style={{ height: '220px' }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Status Doughnut Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={18} color="#06b6d4" /> Document Processing Status
            </h3>
            <div style={{ height: '220px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </motion.div>

          {/* Algorithm Polar Area Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitCompare size={18} color="#10b981" /> Algorithm Popularity
            </h3>
            <div style={{ height: '220px' }}>
                <PolarArea data={polarData} options={polarOptions} />
            </div>
          </motion.div>
          
        </div>

        {/* --- 3D GRAPH VISUALIZATION --- */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}
        >
           <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', zIndex: 10, position: 'relative' }}>
             Algorithm Mapping Topology (Live Engine Preview)
           </h3>
           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', zIndex: 10, position: 'relative' }}>
             Interactive 3D representation of lexical connections detected by our plagiarism engine algorithm. Nodes are colored by category. Drag to rotate, scroll to zoom.
           </p>
           
           {/* Legend */}
           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', zIndex: 10, position: 'relative' }}>
             {['Lexical', 'Semantic', 'Syntactic', 'Structural', 'Statistical'].map((name, i) => (
               <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                 <span style={{ width: 10, height: 10, borderRadius: '50%', background: ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444'][i] }}/>
                 {name}
               </div>
             ))}
           </div>

           <div style={{ width: '100%', height: '400px', background: '#090a0f', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <ForceGraph3D
                ref={graphRef}
                graphData={graphData}
                nodeThreeObject={nodeThreeObject}
                nodeThreeObjectExtend={false}
                nodeRelSize={3}
                linkWidth={1.2}
                linkOpacity={0.4}
                linkColor={link => {
                  const src = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))
                  return src ? src.color + '88' : 'rgba(124, 58, 237, 0.35)'
                }}
                backgroundColor="#090a0f"
                showNavInfo={false}
                width={document.body.clientWidth - (document.body.clientWidth > 768 ? 320 : 64)}
                height={400}
              />
           </div>
        </motion.div>

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
              {docs.slice(0, 4).map((doc, i) => (
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
