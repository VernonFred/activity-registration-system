import { PropsWithChildren } from 'react'

export default function SectionCard({ children, style }: PropsWithChildren<{ style?: React.CSSProperties }>) {
  return (
    <div className="section-card" style={style}>
      {children}
    </div>
  )
}

