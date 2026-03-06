import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { MyCommentItem } from '../../types'
import NotificationsPagination from './NotificationsPagination'

interface MyCommentsPaneProps {
  items: MyCommentItem[]
  loading: boolean
  page: number
  totalPages: number
  activeMenu: number | null
  onPageChange: (page: number) => void
  onLike: (item: MyCommentItem) => void
  onComment: (activityId: number) => void
  onFavorite: (item: MyCommentItem) => void
  onShare: (item: MyCommentItem) => void
  onToggleMenu: (id: number) => void
  onEdit: (commentId: number, activityId: number) => void
  onDelete: (commentId: number) => void
  onOpenActivity: (activityId: number) => void
}

export default function MyCommentsPane(props: MyCommentsPaneProps) {
  const { t } = useTranslation()
  const { items, loading, page, totalPages, activeMenu, onPageChange, onLike, onComment, onFavorite, onShare, onToggleMenu, onEdit, onDelete, onOpenActivity } = props

  return (
    <View className="nt-my-comments">
      {items.map((item) => (
        <View key={item.id} className="nt-comment-card">
          <View className="nt-comment-meta" onClick={() => onOpenActivity(item.activity_id)}>
            <Text className="nt-comment-category">{item.activity_category}</Text>
            <Text className="nt-comment-title">{item.activity_title}</Text>
          </View>
          <View className="nt-comment-desc-row">
            <View className="nt-desc-dot" />
            <Text className="nt-comment-desc">{item.activity_desc}</Text>
            <View className="nt-rating">
              {[1, 2, 3, 4, 5].map((star) => <Text key={star} className={`nt-star ${star <= item.rating ? 'filled' : ''}`}>★</Text>)}
            </View>
          </View>
          <View className="nt-comment-stats">
            <View className="nt-stat-item" onClick={() => onLike(item)}>
              <Text className={`nt-stat-icon nt-stat-like ${item.is_liked ? 'active' : ''}`}>♥</Text>
              <Text className={`nt-stat-val ${item.is_liked ? 'nt-stat-val-active' : ''}`}>{item.stats.likes} {t('profile.likes')}</Text>
            </View>
            <View className="nt-stat-item" onClick={() => onComment(item.activity_id)}>
              <Text className="nt-stat-icon nt-stat-comment">◎</Text>
              <Text className="nt-stat-val">{item.stats.comments} {t('profile.comments')}</Text>
            </View>
            <View className="nt-stat-item" onClick={() => onFavorite(item)}>
              <Text className={`nt-stat-icon nt-stat-fav ${item.is_favorited ? 'active' : ''}`}>✦</Text>
              <Text className={`nt-stat-val ${item.is_favorited ? 'nt-stat-val-active' : ''}`}>{item.stats.favorites} {t('profile.favorites')}</Text>
            </View>
            <View className="nt-stat-item" onClick={() => onShare(item)}>
              <Text className="nt-stat-icon nt-stat-share">↗</Text>
              <Text className="nt-stat-val">{item.stats.shares} {t('profile.shares')}</Text>
            </View>
          </View>
          <View className="nt-my-comment-row">
            <Image className="nt-my-comment-avatar" src={item.user_avatar} mode="aspectFill" />
            <View className="nt-my-comment-bubble"><Text>{item.comment_text}</Text></View>
            <View className="nt-more-wrap">
              <View className="nt-more-btn" onClick={(e) => { e.stopPropagation(); onToggleMenu(item.id) }}><Text>⋮</Text></View>
              {activeMenu === item.id && (
                <View className="nt-dropdown">
                  <View className="nt-dropdown-item" onClick={() => onEdit(item.id, item.activity_id)}>
                    <Text className="nt-dropdown-icon">✎</Text>
                    <Text>{t('common.modify')}</Text>
                  </View>
                  <View className="nt-dropdown-item nt-dropdown-danger" onClick={() => onDelete(item.id)}>
                    <Text className="nt-dropdown-icon">▬</Text>
                    <Text>{t('common.delete')}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
      {items.length === 0 && !loading && <View className="nt-empty"><Text>{t('profile.noComments')}</Text></View>}
      <NotificationsPagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </View>
  )
}
