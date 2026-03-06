import ReactECharts from 'echarts-for-react'
import { AlarmClock, BellRing, CheckCheck, CircleAlert } from 'lucide-react'
import { mockDates, mockFeedItems, mockNotifications, mockValues, type FeedItem, type NotifyItem } from './dashboard-data'

export function TrendChart({ data, isDark }: { data: any[]; isDark: boolean }) {
  const textColor = isDark ? 'rgba(255,255,255,0.64)' : 'rgba(15,23,42,0.56)'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'
  const primaryLine = '#18181b'
  const secondaryLine = '#0f766e'

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

export function ActivityFeed({ items }: { items: FeedItem[] }) {
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

export function NotificationList({ items }: { items: NotifyItem[] }) {
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
