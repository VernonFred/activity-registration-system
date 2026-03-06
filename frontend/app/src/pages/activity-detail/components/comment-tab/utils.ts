import type { TFunction } from 'i18next'
import type { Comment, CommentSortType } from '../../types'

export function sortComments(comments: Comment[], sortType: CommentSortType) {
  const sorted = [...comments]
  switch (sortType) {
    case 'hottest':
      return sorted.sort((a, b) => b.like_count - a.like_count)
    case 'time':
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    default:
      return sorted
  }
}

export function formatCommentTime(time: string, t: TFunction) {
  const now = new Date()
  const commentTime = new Date(time)
  const diff = now.getTime() - commentTime.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return time.split(' ')[0]
  if (days > 0) return t('time.daysAgo', { days })
  if (hours > 0) return t('time.hoursAgo', { hours })
  if (minutes > 0) return t('time.minutesAgo', { minutes })
  return t('time.justNow')
}
