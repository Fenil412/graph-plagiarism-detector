import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, Bell, Check, FileText, GitCompare, AlertTriangle, Info, Trash2, Clock } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationAPI } from '@/services/api'
import { motion, AnimatePresence } from 'framer-motion'
import Magnet from '@/components/ui/Magnet'
import BlurText from '@/components/ui/BlurText'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Document',
  '/compare':   'Compare Documents',
  '/scan':      'Multi-Document Scan',
  '/reports':   'Reports',
  '/history':   'History',
  '/settings':  'Settings',
}

const typeIcons = { success: FileText, warning: AlertTriangle, info: Info, error: AlertTriangle }
const typeColors = { success: '#10b981', warning: '#f59e0b', info: '#06b6d4', error: '#ef4444' }

function timeAgo(dateStr) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function Header({ sidebarWidth = 280 }) {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'GraphPlag'
  const queryClient = useQueryClient()

  const [showNotifs, setShowNotifs] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.list().then(r => r.data),
    refetchInterval: 30000,
  })

  const notifications = notifData?.notifications || []
  const unreadCount = notifData?.unread_count || 0

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationAPI.markRead([]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => notificationAPI.markRead([id]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    if (!showNotifs) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  return (
    <header 
      className="fixed top-0 right-0 h-[var(--header-h)] border-b border-[var(--border-subtle)] flex items-center justify-end px-6 z-[90] transition-all duration-300 ease-in-out"
      style={{ 
        left: isMobile ? '0' : `${sidebarWidth}px`,
        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        background: 'rgba(8, 5, 20, 0.45)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-2">
        <Magnet padding={15} magnetStrength={2}>
          <button 
            className="group relative w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-center transition-all hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]" 
            onClick={toggle} title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="transform transition-transform group-hover:rotate-45" /> : <Moon size={18} className="transform transition-transform group-hover:-rotate-12" />}
          </button>
        </Magnet>

        <div className="relative" ref={panelRef}>
          <Magnet padding={15} magnetStrength={2}>
            <button
              className="group relative w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-center transition-all hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
              title="Notifications"
              onClick={() => setShowNotifs(o => !o)}
            >
              <Bell size={18} className="transform transition-transform group-hover:animate-swing origin-top" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-[var(--accent-primary)] border-2 border-[var(--bg-surface)] text-white text-[10px] font-bold flex items-center justify-center px-[3px] leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </Magnet>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                className="absolute top-[calc(100%+12px)] right-[-16px] md:right-0 w-[320px] md:w-[400px] max-h-[520px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl overflow-hidden z-[999] flex flex-col"
                style={{
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-elevated)]">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-[var(--accent-primary)]" />
                    <span className="text-base font-bold text-[var(--text-primary)]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:bg-[rgba(124,58,237,0.1)] px-3 py-1.5 rounded-lg transition-colors font-semibold" 
                      onClick={() => markAllRead()}
                    >
                      <Check size={14}/> Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1 max-h-[440px] scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <Bell size={48} className="text-[var(--text-muted)] opacity-30 mb-4" />
                      <p className="text-sm text-[var(--text-muted)]">No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const Icon = typeIcons[n.type] || Info
                      const color = typeColors[n.type] || '#06b6d4'
                      return (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: i * 0.05 }}
                          key={n.id}
                          className={`flex items-start gap-3 p-4 border-b border-[var(--border-subtle)] last:border-b-0 transition-all relative group hover:bg-[var(--bg-hover)] ${n.is_read ? '' : 'bg-[rgba(124,58,237,0.04)]'}`}
                          onClick={() => { if (!n.is_read) markRead(n.id) }}
                        >
                          {/* Icon */}
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" 
                            style={{ background: `${color}18`, color }}
                          >
                            <Icon size={18}/>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-8">
                            <div className="text-sm font-bold text-[var(--text-primary)] mb-1 leading-snug break-words">{n.title}</div>
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">{n.message}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
                              <Clock size={10} />
                              {timeAgo(n.created_at)}
                            </div>
                          </div>
                          
                          {/* Unread indicator */}
                          {!n.is_read && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shrink-0 shadow-lg" 
                              style={{ boxShadow: `0 0 8px ${color}` }}
                            />
                          )}
                          
                          {/* Delete button */}
                          <button
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-all hover:bg-[rgba(239,68,68,0.15)] hover:text-[#ef4444] border border-[var(--border-subtle)]"
                            onClick={(e) => { e.stopPropagation(); deleteNotif(n.id) }}
                            title="Delete"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </motion.div>
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
