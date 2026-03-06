import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { Comment, CommentSortType } from '../../types'
import { formatCommentTime } from './utils'

interface CommentListProps {
  activeCommentMenu: number | null
  comments: Comment[]
  iconMessage: string
  iconTrash: string
  onCloseMenu: () => void
  onLike: (commentId: number) => void
  onMenu: (commentId: number, e: any) => void
  onReply: (commentId: number) => void
  onSortChange: (sortType: CommentSortType) => void
  sortType: CommentSortType
}

const CommentList = ({
  activeCommentMenu,
  comments,
  iconMessage,
  iconTrash,
  onCloseMenu,
  onLike,
  onMenu,
  onReply,
  onSortChange,
  sortType,
}: CommentListProps) => {
  const { t } = useTranslation()

  return (
    <View className="comments-section">
      <View className="comments-header">
        <Text className="comments-title">{t('comments.comment')}</Text>
        <View className="sort-tabs">
          {[
            { key: 'hottest', labelKey: 'comments.hottest' },
            { key: 'time', labelKey: 'comments.byTime' },
            { key: 'newest', labelKey: 'comments.latest' },
          ].map((tab) => (
            <View
              key={tab.key}
              className={`sort-tab ${sortType === tab.key ? 'active' : ''}`}
              onClick={() => onSortChange(tab.key as CommentSortType)}
            >
              <Text className="sort-tab-text">{t(tab.labelKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="comments-list">
        {comments.map((comment) => (
          <View key={comment.id} className="comment-item">
            <View className="comment-header">
              <Image src={comment.user_avatar || 'https://i.pravatar.cc/150'} className="comment-avatar" mode="aspectFill" />
              <View className="comment-info">
                <View className="comment-user-row">
                  <Text className="comment-user-name">{comment.user_name}</Text>
                  <Text className="comment-time">{formatCommentTime(comment.created_at, t)}</Text>
                </View>
                <Text className="comment-content">{comment.content}</Text>
              </View>
              <View className="comment-menu">
                <View className="comment-menu-trigger" onClick={(e) => onMenu(comment.id, e)}>
                  <Text className="menu-dots">⋯</Text>
                </View>
              </View>
            </View>

            <View className="comment-actions">
              <View className="action-item" onClick={() => onLike(comment.id)}>
                <Text className={`action-icon ${comment.is_liked ? 'liked' : ''}`}>{comment.is_liked ? '❤️' : '🤍'}</Text>
                <Text className="action-count">{comment.like_count}</Text>
              </View>
              <View className="action-item" onClick={() => {}}>
                <Text className="action-icon dislike">👎</Text>
              </View>
              {comment.reply_count > 0 && (
                <Text className="reply-link" onClick={() => onReply(comment.id)}>
                  {t('comments.replyCount', { count: comment.reply_count })} &gt;
                </Text>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <View className="replies-section">
                  {comment.replies.map((reply) => (
                    <View key={reply.id} className="reply-item">
                      <Text className="reply-user">{reply.user_name}</Text>
                      {reply.reply_to && (
                        <>
                          <Text className="reply-arrow"> {t('common.reply')} </Text>
                          <Text className="reply-user">{reply.reply_to}</Text>
                        </>
                      )}
                      <Text className="reply-text">: {reply.content}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {activeCommentMenu !== null && (
        <View className="comment-action-sheet-overlay" onClick={onCloseMenu}>
          <View className="action-sheet-content" onClick={(e) => e.stopPropagation()}>
            <View className="action-sheet-item reply" onClick={() => onReply(activeCommentMenu)}>
              <Image src={iconMessage} className="action-icon" mode="aspectFit" />
              <Text className="action-text">{t('common.reply')}</Text>
            </View>
            <View className="action-sheet-item cancel" onClick={onCloseMenu}>
              <Image src={iconTrash} className="action-icon" mode="aspectFit" />
              <Text className="action-text">{t('common.cancel')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default CommentList
