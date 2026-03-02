import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import i18n from '../i18n'

function currentLocale(): string {
  return i18n.language || 'zh-CN'
}

function isZh(): boolean {
  return currentLocale().startsWith('zh')
}

export function formatDate(
  date: string | number | Date | undefined,
  pattern?: string
): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return String(date)

  if (pattern) return d.locale(isZh() ? 'zh-cn' : 'en').format(pattern)

  return isZh()
    ? d.locale('zh-cn').format('YYYY年M月D日')
    : d.locale('en').format('MMM D, YYYY')
}

export function formatDateTime(date: string | number | Date | undefined): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return String(date)

  return isZh()
    ? d.locale('zh-cn').format('YYYY年M月D日 HH:mm')
    : d.locale('en').format('MMM D, YYYY HH:mm')
}

export function formatTime(date: string | number | Date | undefined): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return String(date)
  return d.format('HH:mm')
}

export function formatDateRange(
  start: string | number | Date | undefined,
  end: string | number | Date | undefined
): string {
  if (!start) return ''
  const s = dayjs(start)
  if (!s.isValid()) return String(start)

  const startStr = formatDate(start)
  if (!end) return startStr

  const e = dayjs(end)
  if (!e.isValid()) return startStr

  if (s.isSame(e, 'day')) {
    return `${startStr} ${s.format('HH:mm')}-${e.format('HH:mm')}`
  }

  return `${startStr} - ${formatDate(end)}`
}

export function formatCurrency(
  amount: number | string | undefined,
  showSymbol = true
): string {
  if (amount === undefined || amount === null) return ''
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return String(amount)

  const formatted = num.toFixed(2)
  if (!showSymbol) return formatted

  return isZh() ? `¥${formatted}` : `¥${formatted}`
}

export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0'

  if (num >= 10000 && isZh()) {
    return `${(num / 10000).toFixed(1)}万`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return String(num)
}

export function formatRelativeTime(date: string | number | Date | undefined): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return String(date)

  const now = dayjs()
  const diffMinutes = now.diff(d, 'minute')
  const diffHours = now.diff(d, 'hour')
  const diffDays = now.diff(d, 'day')

  const t = i18n.t.bind(i18n)

  if (diffMinutes < 1) return t('time.justNow')
  if (diffHours < 1) return `${diffMinutes}${isZh() ? '分钟前' : 'm ago'}`
  if (diffDays < 1) return t('time.hoursAgo', { hours: diffHours })
  if (diffDays < 30) return t('time.daysAgo', { days: diffDays })

  return formatDate(date)
}
