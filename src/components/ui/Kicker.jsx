export default function Kicker({ index, children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-mute ${className}`}>
      <span className="text-signal">{index}</span>
      <span className="h-px w-8 bg-fg/20" />
      {children}
    </div>
  )
}
