import { useEffect, useState } from 'react'
import { Segmented, Select } from 'antd'
import './dashboard-base.css'
import './dashboard-hero.css'
import './dashboard-panels.css'
import './dashboard-rail.css'
import './dashboard-spotlight.css'
import { listActivities } from '../services/activities'
import { getActivityReport, getOverview } from '../services/reports'
import { recentFeed } from '../services/engagements'
import { listLogs } from '../services/notifications'
import { useThemeContext } from '../hooks/useTheme'
import {
  extractMetrics,
  formatRelativeTime,
  mapFeedType,
  mapNotifyTitle,
  mapNotifyType,
  pickTimeSeries,
  type FeedItem,
  type NotifyItem,
} from './dashboard-data'
import { ActivityFeed, NotificationList, TrendChart } from './dashboard-sections'

export default function Dashboard() {
  const [days, setDays] = useState(7)
  const [activityId, setActivityId] = useState<number | undefined>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [options, setOptions] = useState<any[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [notifyItems, setNotifyItems] = useState<NotifyItem[]>([])
  const { isDark } = useThemeContext()

  useEffect(() => {
    listActivities({ limit: 10 })
      .then((res) => {
        setActivities(res)
        setOptions(res.map((item: any) => ({ label: item.title, value: item.id })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const loader = activityId ? getActivityReport(activityId, days) : getOverview(days)
    loader.then(setData).finally(() => setLoading(false))
  }, [activityId, days])

  useEffect(() => {
    const targetActivityId = activityId ?? activities[0]?.id
    if (!targetActivityId) {
      setFeedItems([])
      return
    }

    recentFeed(targetActivityId, 5)
      .then((items) => {
        setFeedItems(
          Array.isArray(items)
            ? items.map((item: any, index: number) => ({
                id: index,
                user: item.user_name || '匿名用户',
                action: mapFeedType(item.type),
                target: item.content || '-',
                time: formatRelativeTime(item.created_at),
              }))
            : [],
        )
      })
      .catch(() => setFeedItems([]))
  }, [activityId, activities])

  useEffect(() => {
    listLogs({ limit: 4 })
      .then((items) => {
        setNotifyItems(
          Array.isArray(items)
            ? items.map((item: any) => ({
                id: item.id,
                type: mapNotifyType(item.status),
                title: mapNotifyTitle(item.event),
                desc: item.payload?.title || item.payload?.content || `${item.channel}`,
                time: formatRelativeTime(item.sent_at || item.created_at),
              }))
            : [],
        )
      })
      .catch(() => setNotifyItems([]))
  }, [])

  const metrics = extractMetrics(data)

  return (
    <div className="dashboard-shell dashboard-shell--snow">
      <section className="dashboard-topbar dashboard-topbar--compact">
        <div className="dashboard-topbar__tools dashboard-topbar__tools--end">
          <Segmented
            value={days}
            options={[
              { label: '7天', value: 7 },
              { label: '14天', value: 14 },
              { label: '30天', value: 30 },
            ]}
            onChange={(value) => setDays(Number(value))}
          />
          <Select
            allowClear
            placeholder="聚焦活动"
            options={options}
            value={activityId}
            onChange={setActivityId}
            className="dashboard-topbar__select"
          />
        </div>
      </section>

      <section className="dashboard-kpis dashboard-kpis--two">
        {metrics.map((item, index) => (
          <article key={item.title} className={`dashboard-kpi dashboard-kpi--${index + 1}`}>
            <div className="dashboard-kpi__label">{item.title}</div>
            <div className="dashboard-kpi__value">{loading ? '...' : item.value}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid dashboard-grid--single">
        <article className="dashboard-panel dashboard-panel--signal">
          <header className="dashboard-panel__header compact">
            <h2 className="dashboard-panel__title">报名趋势</h2>
          </header>
          <div className="dashboard-signal dashboard-signal--chart-only">
            <div className="dashboard-signal__chart dashboard-signal__chart--full">
              <TrendChart data={pickTimeSeries(data)} isDark={isDark} />
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--secondary">
        <article className="dashboard-panel">
          <header className="dashboard-panel__header compact">
            <h2 className="dashboard-panel__title small">活动流</h2>
          </header>
          <ActivityFeed items={feedItems} />
        </article>

        <article className="dashboard-panel">
          <header className="dashboard-panel__header compact">
            <h2 className="dashboard-panel__title small">通知列表</h2>
          </header>
          <NotificationList items={notifyItems} />
        </article>
      </section>
    </div>
  )
}
