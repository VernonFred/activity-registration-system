import { PropsWithChildren } from 'react'

export default function FilterBar({ children, style, plain }: PropsWithChildren<{ style?: React.CSSProperties; plain?: boolean }>) {
  const className = plain ? undefined : 'filter-bar'
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
      {children}
    </div>
  )
}
