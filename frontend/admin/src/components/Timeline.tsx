import { PropsWithChildren } from 'react'

export function TimelineItem({ title, time, meta }: { title: string; time: string; meta?: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: 999, background: '#4c8cf5', marginTop: 6 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14 }}>{title}</div>
        <div style={{ color: '#8a94a6', fontSize: 12 }}>{meta} · {new Date(time).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default function Timeline({ children }: PropsWithChildren<{}>) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
}

