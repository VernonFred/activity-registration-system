import { useEffect, useMemo, useState } from 'react'
import { Tag, Avatar, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { getActivityReport } from '../services/reports'
import { listSignups } from '../services/signups'

export default function ActivityCard({ activity }: { activity: any }) {
  const [stats, setStats] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  useEffect(() => {
    getActivityReport(activity.id, 7).then(setStats).catch(() => setStats(null))
    listSignups({ activity_id: activity.id, limit: 20 })
      .then((all) => {
        const now = Date.now()
        const within24h = all.filter((s: any) => s.created_at && (now - new Date(s.created_at).getTime()) <= 24*3600*1000)
        const pick = (within24h.length ? within24h : all).slice(0, 3)
        setRecent(pick)
      })
      .catch(() => setRecent([]))
  }, [activity.id])

  const pillColor = activity.status === 'published' ? 'green' : activity.status === 'scheduled' ? 'blue' : activity.status === 'closed' ? 'orange' : 'default'
  const statusLabelMap: Record<string, string> = { scheduled: '计划中', published: '已发布', closed: '已结束', archived: '已归档' }
  const statusText = statusLabelMap[activity.status] || activity.status
  // 英文标题：统一显示“Brand Event”（品牌活动）
  const enTitle: string | undefined = 'Brand Event'
  const createdAt = activity.created_at ? new Date(activity.created_at).toLocaleDateString() : '-'

  const assignees = useMemo(() => recent.slice(0, 3), [recent])
  const moreCount = Math.max(0, recent.length - assignees.length)

  return (
    <div className="section-card" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 320px', alignItems: 'center', gap: 16 }}>
        {/* 左侧块 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* 彩色小封面占位 */}
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#ffe8b3,#ff9bd6)', position: 'relative' }} />
            <div>
              {enTitle ? <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 2 }}>{enTitle}</div> : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{activity.title}</div>
              </div>
            </div>
          </div>
          {/* 在标题下方显示状态胶囊（替代原“创建时间”的位置） */}
          <div style={{ marginTop: 8 }}>
            <Tag color={pillColor} style={{
              borderRadius: 999,
              padding: '0 8px',
              height: 20,
              lineHeight: '20px',
              fontSize: 12,
            }}>
              {statusText}
            </Tag>
          </div>
        </div>

        {/* 中间分割线 */}
        <div style={{ height: '100%', background: '#eef1f6', width: 1, justifySelf: 'stretch' }} />

        {/* 右侧：活动数据 */}
        <div style={{ paddingLeft: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>活动数据</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, height: 40 }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, lineHeight: '20px' }}>报名人数</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{stats?.total_signups ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, lineHeight: '20px' }}>通过人数</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{stats?.approved_signups ?? '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, lineHeight: '20px' }}>报名人</div>
              <div>
                <Space size={-8}>
                  {assignees.map((s: any) => {
                    const name = s?.form_snapshot?.name || `U${s.user_id}`
                    const letter = name?.slice(0, 1) || 'U'
                    return <Avatar key={s.id} size={28} src={s?.user?.avatar_url} style={{ background: '#e6f0ff', color: '#3366ff', border: '2px solid #fff' }}>{letter}</Avatar>
                  })}
                  {moreCount > 0 ? (
                    <Avatar size={28} style={{ background: '#4c8cf5', color: '#fff', fontSize: 12 }}>+{moreCount}</Avatar>
                  ) : null}
                </Space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
