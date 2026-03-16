import { useLocation } from 'react-router-dom'
import { Moon, Sun, Bell } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import styles from './Header.module.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Document',
  '/compare':   'Compare Documents',
  '/reports':   'Reports',
  '/history':   'History',
  '/settings':  'Settings',
}

export default function Header() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'GraphPlag'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span className={styles.notifDot} />
        </button>
      </div>
    </header>
  )
}
