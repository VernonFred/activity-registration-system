import i18n from '../../i18n'
import { DEFAULT_AVATAR } from './constants'
import type { Comment } from './types'

export const mapApiCommentToPageComment = (item: any): Comment => ({
  id: item.id,
  user_name: item.user?.name || i18n.t('common.user'),
  user_avatar: item.user?.avatar || DEFAULT_AVATAR,
  rating: item.rating || 5,
  content: item.content || '',
  images: item.images,
  created_at: item.created_at || new Date().toISOString(),
  like_count: item.like_count || 0,
  reply_count: item.reply_count || 0,
  is_liked: !!item.is_liked,
  replies: (item.replies || []).map((reply: any) => ({
    id: reply.id,
    comment_id: reply.comment_id || item.id,
    user_name: reply.user?.name || i18n.t('common.user'),
    user_avatar: reply.user?.avatar || DEFAULT_AVATAR,
    content: reply.content || '',
    reply_to: reply.reply_to?.name,
    created_at: reply.created_at || new Date().toISOString(),
  })),
})

export const sortComments = (comments: Comment[], sortType: 'hottest' | 'time' | 'newest') => {
  const sorted = [...comments]
  if (sortType === 'hottest') {
    sorted.sort((a, b) => b.like_count - a.like_count)
  } else {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return sorted
}
