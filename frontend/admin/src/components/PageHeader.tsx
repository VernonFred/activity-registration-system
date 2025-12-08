import { PropsWithChildren } from 'react'

export default function PageHeader({ title, subtitle, extra }: PropsWithChildren<{ title: string; subtitle?: string; extra?: React.ReactNode }>) {
  return (
    <div className="page-header">
      <div className="title-block">
        <div className="page-title">{title}</div>
        {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
      </div>
      <div>{extra}</div>
    </div>
  )
}

