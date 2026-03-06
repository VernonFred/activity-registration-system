import type { TFunction } from 'i18next'
import type { MockActivity } from '../../mock/activities'

export function formatDateRange(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const startStr = `${start.getMonth() + 1}月${start.getDate()}日`
  const endStr = `${end.getMonth() + 1}月${end.getDate()}日`
  return startStr === endStr ? startStr : `${startStr} - ${endStr}`
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function getStatusConfig(status: MockActivity['status'], t: TFunction) {
  return {
    signup: { label: t('home.statusRegistering'), class: 'status-active' },
    upcoming: { label: t('home.statusUpcoming'), class: 'status-pending' },
    ongoing: { label: t('home.statusOngoing'), class: 'status-ongoing' },
    finished: { label: t('home.statusEnded'), class: 'status-closed' },
  }[status]
}
