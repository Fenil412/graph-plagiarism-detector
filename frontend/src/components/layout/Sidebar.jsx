import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, Upload, GitCompare, FileText,
  History, Settings, LogOut, Network, Search, 
  ChevronRight, BarChart3, Menu, X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Magnet from '@/components/ui/Magnet'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#7c3aed' },
  { to: '/upload',    icon: Upload,          label: 'Upload',    color: '#06b6d4' },
  { to: '/compare',   icon: GitCompare,      label: 'Compare',   color: '#10b981' },
  { to: '/scan',      icon: Search,          label: 'Scan',      color: '#f59e0b' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',   color: '#ef4444' },
  { to: '/history',   icon: History,         label: 'History',   color: '#8b5cf6' },
  { to: '/settings',  icon: Settings,        label: 'Settings',  color: '#64748b' },
]

// Tooltip component for collapsed state
function Tooltip({ text, show }) {
  if (!show) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="absolute left-full ml-3 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-xl whitespace-nowrap z-[200] pointer-events-none"
      style={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}
    >
      <span className="text-sm font-semibold text-[var(--text-primary)]">{text}</span>
      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-8 border-transparent border-r-[var(--bg-elevated)]" />
    </motion.div>
  )
}

export default function Sidebar({ onCollapseChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const handleCollapse = (val) => {
    setIsCollapsed(val)
    onCollapseChange?.(val)
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: val } }))
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-[110] md:hidden w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-cursor-text="Menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[99] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-screen border-r flex flex-col z-[100] overflow-hidden transition-all duration-300 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: 'rgba(6, 4, 16, 0.55)',
          backdropFilter: 'blur(28px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.04)',
        }}
        animate={{ width: isCollapsed ? '88px' : '280px' }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.03)] via-transparent to-[rgba(6,182,212,0.03)] pointer-events-none" />
        
        {/* Logo */}
        <div className={`relative flex items-center gap-3 p-6 pb-5 border-b border-[var(--border-subtle)] backdrop-blur-sm ${isCollapsed ? 'justify-center px-4' : ''}`}>
          <Magnet padding={20} magnetStrength={3}>
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] via-[#8b5cf6] to-[var(--accent-secondary)] flex items-center justify-center text-white shrink-0 shadow-2xl relative overflow-hidden group"
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              data-cursor-text="GraphPlag"
              style={{
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <Network size={26} className="relative z-10 drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-40"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </Magnet>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="text-2xl font-black bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent whitespace-nowrap tracking-tight drop-shadow-sm">
                  GraphPlag
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-3 p-4 pt-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
          {NAV.map(({ to, icon: Icon, label, color }, index) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileOpen(false)}
              onMouseEnter={() => isCollapsed && setHoveredItem(label)}
              onMouseLeave={() => setHoveredItem(null)}
              className={({ isActive }) =>
                `relative flex items-center gap-4 px-4 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 group overflow-visible ${
                  isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                } ${isCollapsed ? 'justify-center px-3' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${color}dd, ${color}aa)`,
                        boxShadow: `0 8px 24px ${color}40, 0 0 0 1px rgba(255,255,255,0.1) inset`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                      />
                    </motion.div>
                  )}
                  
                  {/* Hover background */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
                      }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <motion.div 
                    className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-white/15 shadow-lg' : 'bg-transparent'
                    } ${isCollapsed ? '' : 'mr-[-4px]'}`}
                    style={!isActive ? { 
                      backgroundColor: `${color}12`,
                      boxShadow: `0 0 0 1px ${color}20 inset`,
                    } : {}}
                    whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon 
                      size={22} 
                      strokeWidth={2.5}
                      style={{ color: isActive ? 'white' : color }}
                      className="drop-shadow-sm"
                    />
                  </motion.div>
                  
                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="relative z-10 whitespace-nowrap tracking-wide drop-shadow-sm"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <AnimatePresence>
                      <Tooltip text={label} show={hoveredItem === label} />
                    </AnimatePresence>
                  )}
                  
                  {/* Active indicator dot */}
                  {isActive && !isCollapsed && (
                    <motion.div
                      className="absolute right-4 w-2 h-2 rounded-full bg-white shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {/* Collapse Toggle - Now at bottom of nav */}
          <div className="hidden md:block mt-3">
            <div 
              className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 group overflow-visible cursor-pointer hover:bg-[var(--bg-hover)] ${isCollapsed ? 'justify-center px-3' : ''}`}
              onClick={() => handleCollapse(!isCollapsed)}
              onMouseEnter={() => isCollapsed && setHoveredItem('toggle')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Hover background */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, rgba(124,58,237,0.15), transparent 70%)`,
                }}
              />
              
              {/* Icon container */}
              <Magnet padding={12}>
                <motion.div 
                  className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg overflow-hidden group"
                  style={{
                    backgroundColor: `rgba(124,58,237,0.12)`,
                    boxShadow: `0 0 0 1px rgba(124,58,237,0.2) inset`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 0 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <ChevronRight 
                      size={22} 
                      strokeWidth={2.5}
                      style={{ color: '#7c3aed' }}
                      className="drop-shadow-sm"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-0 group-hover:opacity-10 transition-opacity"
                  />
                </motion.div>
              </Magnet>
              
              {/* Label */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className="relative z-10 whitespace-nowrap tracking-wide drop-shadow-sm text-[var(--text-secondary)]"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <AnimatePresence>
                  <Tooltip text={isCollapsed ? 'Expand' : 'Collapse'} show={hoveredItem === 'toggle'} />
                </AnimatePresence>
              )}
            </div>
          </div>
        </nav>

        {/* User section with separate spacing */}
        <div className={`relative border-t border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-surface)] backdrop-blur-sm ${isCollapsed ? 'p-4 pt-6' : 'p-4 pt-6'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(124,58,237,0.05)] to-transparent pointer-events-none" />
          
          {/* User Info */}
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed ? (
              <Magnet padding={20} magnetStrength={3} className="flex-1 min-w-0 relative z-10">
                <motion.div 
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  data-cursor-text={user?.name || 'User'}
                >
                  <div 
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-base font-black text-white shrink-0 shadow-xl ring-2 ring-white/20"
                    style={{
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">
                      {user?.email || ''}
                    </span>
                  </div>
                </motion.div>
              </Magnet>
            ) : (
              <Magnet padding={15} className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  onMouseEnter={() => setHoveredItem('user')}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative"
                >
                  <div 
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-base font-black text-white shadow-xl ring-2 ring-white/20"
                    style={{
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                    }}
                    data-cursor-text={user?.name || 'User'}
                  >
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <Tooltip text={user?.name || 'User'} show={hoveredItem === 'user'} />
                </motion.div>
              </Magnet>
            )}
          </div>
          
          {/* Logout Button - Separate section */}
          <div className={`pt-4 border-t border-[var(--border-subtle)] ${isCollapsed ? 'flex justify-center' : ''}`}>
            {!isCollapsed ? (
              <Magnet padding={15} magnetStrength={2} className="relative z-10 w-full">
                <motion.button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] transition-all hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:border-red-500 shadow-lg overflow-hidden group"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-cursor-text="Logout"
                  style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <LogOut size={20} strokeWidth={2.5} className="relative z-10" />
                  <span className="relative z-10 font-semibold">Logout</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.button>
              </Magnet>
            ) : (
              <Magnet padding={15} className="relative z-10">
                <motion.button
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center transition-all hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:border-red-500 shadow-lg overflow-hidden group relative"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onMouseEnter={() => setHoveredItem('logout')}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <LogOut size={20} strokeWidth={2.5} className="relative z-10" />
                  <Tooltip text="Logout" show={hoveredItem === 'logout'} />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.button>
              </Magnet>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
