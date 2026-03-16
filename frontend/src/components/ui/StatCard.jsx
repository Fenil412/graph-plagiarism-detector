import { motion } from 'framer-motion'
import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, label, value, color = '#7c3aed', delta }) {
  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={styles.iconWrap} style={{ '--card-color': color }}>
        <Icon size={22} />
      </div>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {delta !== undefined && (
          <span className={styles.delta} style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
