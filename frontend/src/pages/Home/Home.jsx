import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, ArrowRight, Shield, Zap, BarChart3, GitCompare } from 'lucide-react'
import styles from './Home.module.css'

/* Animated canvas background */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf, W, H
    const NODES = 55
    let nodes = []

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)
    resize()

    for (let i = 0; i < NODES; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 2.5 + 1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(124,58,237,${0.25 * (1 - dist / 130)})`
            ctx.lineWidth = 1
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(167,139,250,0.7)'
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={canvasRef} className={styles.canvas} />
}

const FEATURES = [
  { icon: Network,    title: 'Graph-Based',    desc: 'Convert documents to node-edge graphs for structural comparison' },
  { icon: Zap,        title: 'Fast Detection', desc: 'Multiple algorithms from O(n) node overlap to subgraph matching' },
  { icon: Shield,     title: 'Secure',         desc: 'JWT authentication with encrypted passwords and user isolation' },
  { icon: BarChart3,  title: 'Rich Reports',   desc: 'Detailed similarity scores, matching sentences and keyword lists' },
]

export default function Home() {
  return (
    <div className={styles.page}>
      <ParticleCanvas />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}><Network size={20} /></div>
          <span>GraphPlag</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/login"    className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started <ArrowRight size={16} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={styles.heroContent}
        >
          <div className={styles.pill}>✦ Graph-Based Plagiarism Detection</div>
          <h1 className={styles.heroTitle}>
            Detect Plagiarism<br />
            <span className="gradient-text">Like Never Before</span>
          </h1>
          <p className={styles.heroDesc}>
            Transform documents into knowledge graphs and compare them using advanced
            NetworkX algorithms — node overlap, edge similarity, subgraph matching, and GED.
          </p>
          <div className={styles.heroCTA}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
              Start Detection <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
              Sign In
            </Link>
          </div>
          <div className={styles.heroStats}>
            {[['4','Algorithms'],['100%','Graph-Based'],['JWT','Secured']].map(([v,l]) => (
              <div key={l} className={styles.heroStat}>
                <span className={styles.heroStatVal}>{v}</span>
                <span className={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating graph illustration */}
        <motion.div
          className={styles.heroVisual}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.graphBall}>
            <GitCompare size={72} style={{ opacity: 0.9 }} />
          </div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.orbit}
              style={{ '--delay': `${i * 0.6}s`, '--deg': `${i * 60}deg` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
            />
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.6 }}
        >
          Why <span className="gradient-text">GraphPlag?</span>
        </motion.h2>
        <div className={styles.featureGrid}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className={styles.featureCard}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay: i * 0.1 }}
              whileHover={{ y:-6 }}
            >
              <div className={styles.featureIcon}><Icon size={26} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section className={styles.ctaBand}>
        <motion.div
          initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }} transition={{ duration:0.6 }}
        >
          <h2>Ready to detect plagiarism?</h2>
          <p>Create an account and upload your first document in seconds.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize:'1rem', padding:'0.85rem 2.2rem', marginTop:'1.2rem' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <footer className={styles.footer}>
        <span>© 2026 GraphPlag — Graph-Based Plagiarism Detection</span>
      </footer>
    </div>
  )
}
