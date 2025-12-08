export default function SectionPill({ children, color = 'brand', style }: { children: React.ReactNode; color?: 'brand' | 'green' | 'orange' | 'slate'; style?: React.CSSProperties }) {
  return (
    <div className={`pill-title pill-${color}`} style={style}>
      {children}
    </div>
  )
}

