import { PropsWithChildren } from 'react'

export default function FilterBar({ children, style, plain }: PropsWithChildren<{ style?: React.CSSProperties; plain?: boolean }>) {
  const className = plain ? 'filter-bar filter-bar--plain' : 'filter-bar'
  return (
    <div className={className} style={{ ...style }}>
      {children}
    </div>
  )
}
