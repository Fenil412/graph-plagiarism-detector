import styles from './PageLoader.module.css'
import { Network } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <Network size={32} />
      </div>
      <div className={styles.bars}>
        {[0,1,2].map(i => (
          <div key={i} className={styles.bar} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
