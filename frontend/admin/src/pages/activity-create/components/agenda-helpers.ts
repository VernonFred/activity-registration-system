import dayjs from 'dayjs'

export const ENTRY_TYPE_OPTIONS = [
  { label: '演讲', value: 'speech' },
  { label: '茶歇', value: 'break' },
  { label: '讨论', value: 'discussion' },
  { label: '活动', value: 'activity' },
] as const

const ENTRY_TYPE_VALUE_TO_LABEL: Record<string, string> = {
  speech: '演讲',
  break: '茶歇',
  discussion: '讨论',
  activity: '活动',
}

const ENTRY_TYPE_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(ENTRY_TYPE_VALUE_TO_LABEL).map(([value, label]) => [label, value]),
)

export const TIME_FORMAT = 'HH:mm'
export const DAY_FORMAT = 'YYYY-MM-DD HH:mm'

export function timeToDayjs(t?: string) {
  if (!t) return null
  const d = dayjs(t, TIME_FORMAT)
  return d.isValid() ? d : null
}

export function dateToDayjs(date?: string) {
  if (!date) return null
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(date)) {
    const parsed = dayjs(date.replace(' ', 'T') + ':00')
    return parsed.isValid() ? parsed : null
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = dayjs(`${date}T00:00:00`)
    return parsed.isValid() ? parsed : null
  }
  const parsed = dayjs(date)
  return parsed.isValid() ? parsed : null
}

export function toTypeDisplayValue(type?: string) {
  if (!type) return ''
  return ENTRY_TYPE_VALUE_TO_LABEL[type] || type
}

export function toTypeStoredValue(raw?: string) {
  const value = (raw || '').trim()
  if (!value) return ''
  return ENTRY_TYPE_LABEL_TO_VALUE[value] || value
}
