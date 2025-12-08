import { ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined } from '@ant-design/icons'

type EventItem = {
  id: string | number
  title: string
  time: string
  direction?: 'up' | 'down'
  color?: string
  content?: string
}

function hoursAgo(ts: string) {
  const diff = Math.max(0, Date.now() - new Date(ts).getTime())
  const h = Math.round(diff / 3600000)
  return `${h}小时`
}

export default function RecentEventsCard({ items, withTitle = true }: { items: EventItem[]; withTitle?: boolean }) {
  const colors = ['#4c8cf5', '#b37feb', '#36cfc9', '#f59a23']
  return (
    <div className="section-card" style={{ padding: 16 }}>
      {withTitle ? <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>最近通知</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((e, idx) => (
          <div key={e.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 4, borderRadius: 4, background: e.color || colors[idx % colors.length], height: 28, marginTop: 3 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{e.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(e.time).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f2f4f7', padding: '2px 8px', borderRadius: 999 }}>
                  <ClockCircleOutlined />
                  {hoursAgo(e.time)}
                </span>
                {e.direction === 'up' ? (
                  <ArrowUpOutlined style={{ color: '#f59a23' }} />
                ) : e.direction === 'down' ? (
                  <ArrowDownOutlined style={{ color: '#52c41a' }} />
                ) : null}
              </div>
            </div>
            {e.content ? (
              <div style={{ marginLeft: 16, marginTop: 8, background: '#f3f7ff', padding: '8px 12px', borderRadius: 12 }}>{e.content}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
