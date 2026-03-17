import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, Bell, Check, FileText, GitCompare, AlertTriangle, Info } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Header.module.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Document',
  '/compare':   'Compare Documents',
  '/reports':   'Reports',
  '/history':   'History',
  '/settings':  'Settings',
}

// Static notifications — will show demo data
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'success', icon: FileText, title: 'Document Processed', message: 'Your document graph has been built successfully.', time: '2 min ago', read: false },
  { id: 2, type: 'info', icon: GitCompare, title: 'Comparison Complete', message: 'Plagiarism check between Doc A and Doc B is done.', time: '15 min ago', read: false },
  { id: 3, type: 'warning', icon: AlertTriangle, title: 'High Similarity Detected', message: '78% similarity found — review recommended.', time: '1 hr ago', read: false },
  { id: 4, type: 'info', icon: Info, title: 'System Update', message: 'New algorithm "Graph Edit Distance" is now available.', time: '3 hrs ago', read: true },
  { id: 5, type: 'success', icon: FileText, title: 'Upload Successful', message: 'research_paper.pdf has been uploaded.', time: '5 hrs ago', read: true },
]

export default function Header() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'GraphPlag'

  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const panelRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close on click outside
  useEffect(() => {
    if (!showNotifs) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const typeColors = {
    success: '#10b981',
    warning: '#f59e0b',
    info: '#06b6d4',
    error: '#ef4444',
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell + dropdown */}
        <div className={styles.notifWrap} ref={panelRef}>
          <button
            className={styles.iconBtn}
            title="Notifications"
            onClick={() => setShowNotifs(o => !o)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.notifDot}>{unreadCount}</span>}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                className={styles.notifPanel}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notifications</span>
                  {unreadCount > 0 && (
                    <button className={styles.notifMarkAll} onClick={markAllRead}>
                      <Check size={13}/> Mark all read
                    </button>
                  )}
                </div>

                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>No notifications yet.</div>
                  ) : (
                    notifications.map(n => {
                      const Icon = n.icon
                      return (
                        <div
                          key={n.id}
                          className={`${styles.notifItem} ${n.read ? '' : styles.notifItemUnread}`}
                          onClick={() => markRead(n.id)}
                        >
                          <div className={styles.notifIcon} style={{ background: typeColors[n.type] + '18', color: typeColors[n.type] }}>
                            <Icon size={15}/>
                          </div>
                          <div className={styles.notifBody}>
                            <div className={styles.notifItemTitle}>{n.title}</div>
                            <div className={styles.notifMsg}>{n.message}</div>
                            <div className={styles.notifTime}>{n.time}</div>
                          </div>
                          {!n.read && <span className={styles.notifUnreadDot}/>}
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
