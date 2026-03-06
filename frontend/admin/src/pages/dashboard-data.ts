export interface MetricItem {
  title: string
  value: number | string
}

export interface FeedItem {
  id: number
  user: string
  action: string
  target: string
  time: string
}

export interface NotifyItem {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  desc: string
  time: string
}

export const mockFeedItems: FeedItem[] = [
  { id: 1, user: '张三', action: '评论', target: '高校品牌沙龙 · 长沙', time: '2小时前' },
  { id: 2, user: '李四', action: '评分', target: '春季学术研讨会', time: '3小时前' },
  { id: 3, user: '王五', action: '评论', target: '暑期培训会议', time: '5小时前' },
  { id: 4, user: '赵六', action: '评分', target: '行业闭门会', time: '6小时前' },
  { id: 5, user: '陈七', action: '评论', target: '高校品牌沙龙 · 长沙', time: '8小时前' },
]

export const mockNotifications: NotifyItem[] = [
  { id: 1, type: 'warning', title: '3 份报名待审核', desc: '需要在 2 小时内完成处理', time: '10分钟前' },
  { id: 2, type: 'success', title: '批量审核完成', desc: '已通过 12 份报名申请', time: '1小时前' },
  { id: 3, type: 'info', title: '新活动已发布', desc: '春季学术研讨会开放报名', time: '3小时前' },
  { id: 4, type: 'error', title: '通知推送失败', desc: '2 条短信通知发送失败', time: '5小时前' },
]

export function extractMetrics(data: any): MetricItem[] {
  return [
    { title: '总报名', value: data?.total_signups ?? data?.totalSignups ?? data?.signups ?? '-' },
    { title: '总签到', value: data?.checked_in_signups ?? data?.checkedInSignups ?? data?.checked_in ?? data?.checkedIn ?? data?.checkins ?? '-' },
  ]
}

export function pickTimeSeries(data: any) {
  return data?.time_series ?? data?.timeSeries ?? data?.trend ?? data?.timeseries ?? []
}

export function mapFeedType(type?: string) {
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

export function mapNotifyType(status?: string): NotifyItem['type'] {
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

export function mapNotifyTitle(event?: string) {
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

export function formatRelativeTime(value?: string) {
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

export function mockDates(count: number) {
  const dates: string[] = []
  const now = new Date()
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getTime() - index * 86400_000)
    dates.push(`${date.getMonth() + 1}.${date.getDate()}`)
  }
  return dates
}

export function mockValues(count: number, min: number, max: number) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min))
}
