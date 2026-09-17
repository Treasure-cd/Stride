interface MetaCardProps {
  label: string
  value: string
  rotate?: string
}

export default function MetaCard({ label, value, rotate = '0' }: MetaCardProps) {
  return (
    <div
      className="px-3.5 py-2 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) text-center shadow-xs transition-colors"
      style={{ transform: rotate !== '0' ? `rotate(${rotate}deg)` : undefined }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-(--text) opacity-60">
        {label}
      </p>
      <p className="text-sm font-medium text-(--text-h) whitespace-nowrap mt-0.5">
        {value}
      </p>
    </div>
  )
}