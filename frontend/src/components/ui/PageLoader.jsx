import { Network } from 'lucide-react'
import GradientText from './GradientText'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg-base)]">
      <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-[0_0_20px_var(--accent-glow)] animate-glow">
        <Network size={32} />
      </div>
      <div className="flex items-end gap-1.5 h-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce"
            style={{ height: '100%', animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
      <div className="text-sm font-semibold tracking-widest uppercase">
        <GradientText animationSpeed={3}>Loading Space</GradientText>
      </div>
    </div>
  )
}
