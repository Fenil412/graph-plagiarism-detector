export default function StatCard({ title, label, value, icon: Icon, color, trend }) {
  const displayTitle = title || label
  const isPositive = trend > 0
  const isNegative = trend < 0

  return (
    <div 
      className="border border-[var(--border-subtle)] rounded-2xl p-5 flex items-start gap-4 transition-all duration-250 hover:border-[var(--border-default)] hover:shadow-lg hover:shadow-[var(--shadow-glow)]"
      style={{ 
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      >
        <Icon size={22} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13px] font-medium text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">
          {displayTitle}
        </span>
        <span className="text-[26px] font-extrabold text-[var(--text-primary)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </span>
        {trend !== undefined && (
          <span className={`text-[12px] font-semibold mt-1 flex items-center gap-1 ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
            {isPositive ? '↑' : isNegative ? '↓' : '−'}
            {Math.abs(trend)}% from last week
          </span>
        )}
      </div>
    </div>
  )
}
