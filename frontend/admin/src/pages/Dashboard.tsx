import { useEffect, useState } from 'react'
import { Segmented, Select } from 'antd'
import ReactECharts from 'echarts-for-react'
import { AlarmClock, BellRing, CheckCheck, CircleAlert } from 'lucide-react'
import { listActivities } from '../services/activities'
import { getActivityReport, getOverview } from '../services/reports'
import { recentFeed } from '../services/engagements'
import { listLogs } from '../services/notifications'
import { useThemeContext } from '../hooks/useTheme'

interface MetricItem {
  title: string
  value: number | string
}

interface FeedItem {
  id: number
  user: string
  action: string
  target: string
  time: string
}

interface NotifyItem {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  desc: string
  time: string
}

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

function extractMetrics(data: any): MetricItem[] {
  return [
    {
      title: '总报名',
      value: data?.total_signups ?? data?.totalSignups ?? data?.signups ?? '-',
    },
    {
      title: '总签到',
      value: data?.checked_in_signups ?? data?.checkedInSignups ?? data?.checked_in ?? data?.checkedIn ?? data?.checkins ?? '-',
    },
  ]
}

function TrendChart({ data, isDark }: { data: any[]; isDark: boolean }) {
  const textColor = isDark ? 'rgba(255,255,255,0.64)' : 'rgba(15,23,42,0.56)'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'
  const primaryLine = isDark ? '#18181b' : '#18181b'
  const secondaryLine = isDark ? '#0f766e' : '#0f766e'

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.96)',
      borderWidth: 0,
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
    },
    legend: { show: false },
    grid: { left: 32, right: 16, top: 14, bottom: 24 },
    xAxis: {
      type: 'category' as const,
      data: data.length ? data.map((item: any) => item.date) : mockDates(7),
      boundaryGap: false,
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 11 },
    },
    series: [
      {
        name: '报名',
        type: 'line' as const,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: primaryLine },
        data: data.length ? data.map((item: any) => item.signups) : mockValues(7, 20, 64),
      },
      {
        name: '签到',
        type: 'line' as const,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: secondaryLine, type: 'dashed' as const },
        data: data.length ? data.map((item: any) => item.checkins) : mockValues(7, 14, 46),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 320 }} />
}

function ActivityFeed({ items }: { items: FeedItem[] }) {
  const renderItems = items.length ? items : mockFeedItems
  return (
    <div className="dashboard-feed dashboard-feed--clean">
      {renderItems.map((item) => (
        <div key={item.id} className="dashboard-feed__item dashboard-feed__item--compact">
          <div className="dashboard-feed__avatar">{item.user.charAt(item.user.length - 1)}</div>
          <div className="dashboard-feed__body">
            <div className="dashboard-feed__meta">
              <strong>{item.user}</strong>
              <span>{item.action}</span>
              <time>{item.time}</time>
            </div>
            <div className="dashboard-feed__target">{item.target}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NotificationList({ items }: { items: NotifyItem[] }) {
  const renderItems = items.length ? items : mockNotifications
  return (
    <div className="dashboard-rail-list">
      {renderItems.map((item) => {
        const Icon = item.type === 'success' ? CheckCheck : item.type === 'warning' ? AlarmClock : item.type === 'error' ? CircleAlert : BellRing
        return (
          <div key={item.id} className={`dashboard-rail-item tone-${item.type}`}>
            <div className="dashboard-rail-item__icon">
              <Icon size={15} />
            </div>
            <div className="dashboard-rail-item__body">
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </div>
            <time>{item.time}</time>
          </div>
        )
      })}
    </div>
  )
}

const mockFeedItems: FeedItem[] = [
  { id: 1, user: '张三', action: '评论', target: '高校品牌沙龙 · 长沙', time: '2小时前' },
  { id: 2, user: '李四', action: '评分', target: '春季学术研讨会', time: '3小时前' },
  { id: 3, user: '王五', action: '评论', target: '暑期培训会议', time: '5小时前' },
  { id: 4, user: '赵六', action: '评分', target: '行业闭门会', time: '6小时前' },
  { id: 5, user: '陈七', action: '评论', target: '高校品牌沙龙 · 长沙', time: '8小时前' },
]

const mockNotifications: NotifyItem[] = [
  { id: 1, type: 'warning', title: '3 份报名待审核', desc: '需要在 2 小时内完成处理', time: '10分钟前' },
  { id: 2, type: 'success', title: '批量审核完成', desc: '已通过 12 份报名申请', time: '1小时前' },
  { id: 3, type: 'info', title: '新活动已发布', desc: '春季学术研讨会开放报名', time: '3小时前' },
  { id: 4, type: 'error', title: '通知推送失败', desc: '2 条短信通知发送失败', time: '5小时前' },
]

function pickTimeSeries(data: any) {
  return data?.time_series ?? data?.timeSeries ?? data?.trend ?? data?.timeseries ?? []
}

function mapFeedType(type?: string) {
  switch (type) {
    case 'comment':
      return '评论'
    case 'like':
      return '点赞'
    case 'favorite':
      return '收藏'
    case 'share':
      return '分享'
    default:
      return '动态'
  }
}

function mapNotifyType(status?: string): NotifyItem['type'] {
  switch (status) {
    case 'failed':
      return 'error'
    case 'sent':
      return 'success'
    case 'queued':
      return 'warning'
    default:
      return 'info'
  }
}

function mapNotifyTitle(event?: string) {
  switch (event) {
    case 'signup_submitted':
      return '报名提交'
    case 'signup_approved':
      return '报名通过'
    case 'signup_rejected':
      return '报名驳回'
    case 'payment_reminder':
      return '缴费提醒'
    case 'checkin_reminder':
      return '签到提醒'
    case 'badge_earned':
      return '徽章发放'
    default:
      return '系统通知'
  }
}

function formatRelativeTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diff / 60000))
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

function mockDates(count: number) {
  const dates: string[] = []
  const now = new Date()
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getTime() - index * 86400_000)
    dates.push(`${date.getMonth() + 1}.${date.getDate()}`)
  }
  return dates
}

function mockValues(count: number, min: number, max: number) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min))
}
