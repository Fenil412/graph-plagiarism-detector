import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, User, Bell, Shield, Palette } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import PageWrapper from '@/components/ui/PageWrapper'
import styles from './Settings.module.css'

function SettingSection({ icon: Icon, title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        <Icon size={18} style={{ color:'var(--accent-primary)' }}/> {title}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { theme, setLight, setDark, setSystem } = useTheme()
  const { user } = useAuth()

  const THEMES = [
    { key:'light', icon:<Sun size={20}/>,     label:'Light'  },
    { key:'dark',  icon:<Moon size={20}/>,    label:'Dark'   },
    { key:'system',icon:<Monitor size={20}/>, label:'System' },
  ]

  return (
    <PageWrapper>
      <div className="page-container" style={{ maxWidth: 720 }}>
        <h2 style={{ marginBottom:'0.5rem' }}>Settings</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Manage your account preferences and appearance.</p>

        {/* Theme */}
        <SettingSection icon={Palette} title="Appearance">
          <p className={styles.settingDesc}>Choose your preferred colour theme.</p>
          <div className={styles.themeRow}>
            {THEMES.map(t => (
              <motion.button key={t.key}
                className={`${styles.themeBtn} ${theme===t.key?styles.themeBtnActive:''}`}
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={() => { if(t.key==='light') setLight(); else if(t.key==='dark') setDark(); else setSystem() }}>
                <div className={styles.themeIcon}>{t.icon}</div>
                <span>{t.label}</span>
                {theme===t.key && <span className={styles.activeDot}/>}
              </motion.button>
            ))}
          </div>
        </SettingSection>

        {/* Account */}
        <SettingSection icon={User} title="Account">
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
            <div>
              <div className={styles.profileName}>{user?.name}</div>
              <div className={styles.profileEmail}>{user?.email}</div>
              <span className="badge badge-purple" style={{ marginTop:'0.4rem' }}>{user?.role}</span>
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Notifications">
          {[
            { label:'Graph build complete', sub:'Notify when document graph is ready' },
            { label:'Comparison done',      sub:'Notify when plagiarism analysis finishes' },
          ].map(n => (
            <div key={n.label} className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>{n.label}</div>
                <div className={styles.toggleSub}>{n.sub}</div>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" defaultChecked/>
                <span className={styles.slider}/>
              </label>
            </div>
          ))}
        </SettingSection>

        {/* Security */}
        <SettingSection icon={Shield} title="Security">
          <div className={styles.secItem}>
            <div><div className={styles.toggleLabel}>JWT Authentication</div><div className={styles.toggleSub}>All requests are secured with JWT tokens</div></div>
            <span className="badge badge-success">Active</span>
          </div>
          <div className={styles.secItem}>
            <div><div className={styles.toggleLabel}>Password Encryption</div><div className={styles.toggleSub}>Passwords hashed with bcrypt</div></div>
            <span className="badge badge-success">Active</span>
          </div>
        </SettingSection>
      </div>
    </PageWrapper>
  )
}
