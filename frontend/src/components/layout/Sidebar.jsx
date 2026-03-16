import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, GitCompare, FileText,
  History, Settings, LogOut, Network
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/upload',    icon: Upload,          label: 'Upload'      },
  { to: '/compare',   icon: GitCompare,      label: 'Compare'     },
  { to: '/reports',   icon: FileText,        label: 'Reports'     },
  { to: '/history',   icon: History,         label: 'History'     },
  { to: '/settings',  icon: Settings,        label: 'Settings'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <motion.div
          className={styles.logoIcon}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Network size={22} />
        </motion.div>
        <span className={styles.logoText}>GraphPlag</span>
      </div>

      {/* Nav links */}
      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className={styles.indicator}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={18} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userEmail}>{user?.email || ''}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
