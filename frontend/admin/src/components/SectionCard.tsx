import { PropsWithChildren } from 'react'

export default function SectionCard({ children, style, className }: PropsWithChildren<{ style?: React.CSSProperties; className?: string }>) {
  return (
    <div className={className ? `section-card ${className}` : 'section-card'} style={style}>
      {children}
    </div>
  )
}
