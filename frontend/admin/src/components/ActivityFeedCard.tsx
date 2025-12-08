import { Avatar } from 'antd'
import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons'

type FeedItem = {
  id: string | number
  userName: string
  userTitle?: string
  avatarUrl?: string
  chips: { icon: 'upload' | 'attach'; text: string }[]
}

import { useState } from 'react'

export default function ActivityFeedCard({ items, withTitle = true }: { items: FeedItem[]; withTitle?: boolean }) {
  const iconMap = {
    upload: <CloudUploadOutlined style={{ color: '#4c8cf5' }} />,
    attach: <PaperClipOutlined style={{ color: '#7aa2f7' }} />,
  }

  const [expanded, setExpanded] = useState(false)
  const visible = (items || []).slice(0, expanded ? 6 : 3)

  return (
    <div className="section-card" style={{ padding: 16 }}>
      {withTitle ? <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>活动流</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visible.map((it) => (
          <div key={it.id}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <Avatar src={it.avatarUrl} size={36} style={{ background: '#fde3cf', color: '#f56a00' }}>
                {it.userName?.slice(0, 1)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 600 }}>{it.userName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{it.userTitle || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {it.chips.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f3f7ff', padding: '8px 12px', borderRadius: 12 }}>
                  <div style={{ fontSize: 16 }}>{iconMap[c.icon]}</div>
                  <div>{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ color: '#4c8cf5', marginTop: 12, fontWeight: 500, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        {expanded ? '收起 ▲' : '查看更多 ▾'}
      </div>
    </div>
  )
}
