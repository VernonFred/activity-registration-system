import { PropsWithChildren } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  extra?: React.ReactNode
}

export default function PageHeader({ title, subtitle, extra }: PropsWithChildren<PageHeaderProps>) {
  return (
    <div className="page-header">
      <div className="title-block">
        <div className="page-header__eyebrow">Frost Admin</div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {extra && <div className="page-header__extra">{extra}</div>}
    </div>
  )
}
