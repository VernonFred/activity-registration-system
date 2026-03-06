import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR, formatTime, type CurrentUser } from '../../constants'
import type { Comment } from '../../types'
import type { ReplyLikeState } from './utils'
import ReplyThread from './ReplyThread'

interface MainCommentThreadProps {
  comment: Comment
  currentUser: CurrentUser
  mainCommentContent: string
  commentLiked: boolean
  commentDisliked: boolean
  commentLikeCount: number
  replies: Comment['replies']
  showReplies: boolean
  activeMenu: number | null
  failedAvatars: Set<string>
  replyLikeStates: Record<number, ReplyLikeState>
  onAvatarError: (key: string) => void
  onMenuClick: (id: number, e: any) => void
  onEdit: (id: number, content: string, isReply: boolean, e: any) => void
  onDeleteClick: (id: number, isReply: boolean, e: any) => void
  onReplyTo: (userName: string, e: any) => void
  onLikeComment: (e: any) => void
  onDislikeComment: (e: any) => void
  onLikeReply: (replyId: number, e: any) => void
  onDislikeReply: (replyId: number, e: any) => void
  onToggleReplies: () => void
}

export default function MainCommentThread(props: MainCommentThreadProps) {
  const { t } = useTranslation()
  const {
    comment,
    currentUser,
    mainCommentContent,
    commentLiked,
    commentDisliked,
    commentLikeCount,
    replies,
    showReplies,
    activeMenu,
    failedAvatars,
    replyLikeStates,
    onAvatarError,
    onMenuClick,
    onEdit,
    onDeleteClick,
    onReplyTo,
    onLikeComment,
    onDislikeComment,
    onLikeReply,
    onDislikeReply,
    onToggleReplies,
  } = props

  const hasReplies = replies.length > 0
  const mainAvatar = failedAvatars.has('main') || !comment.user_avatar ? DEFAULT_AVATAR : comment.user_avatar

  return (
    <View className={`thread main ${hasReplies && showReplies ? 'has-replies' : ''}`}>
      <View className="avatar-col">
        <Image src={mainAvatar} className="avatar-main" mode="aspectFill" onError={() => onAvatarError('main')} />
      </View>
      <View className="content-col">
        <View className="comment-header">
          <Text className="username">{comment.user_name}</Text>
          <Text className="timestamp">· {formatTime(comment.created_at)}</Text>
          <View className="menu-btn" onClick={(e) => onMenuClick(comment.id, e)}>
            <Text className="menu-dots">⋯</Text>
          </View>
          {activeMenu === comment.id && (
            <View className="menu-popup">
              {comment.user_name === currentUser.name ? (
                <>
                  <View className="popup-item" onClick={(e) => onEdit(comment.id, mainCommentContent, false, e)}>
                    <Text className="popup-icon">✏️</Text>
                    <Text className="popup-text">{t('common.modify')}</Text>
                  </View>
                  <View className="popup-item delete" onClick={(e) => onDeleteClick(comment.id, false, e)}>
                    <Text className="popup-icon">🗑️</Text>
                    <Text className="popup-text">{t('common.delete')}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="popup-item" onClick={(e) => onReplyTo(comment.user_name, e)}>
                    <Text className="popup-icon">💬</Text>
                    <Text className="popup-text">{t('common.reply')}</Text>
                  </View>
                  <View className="popup-item" onClick={(e) => { e.stopPropagation(); onMenuClick(comment.id, e) }}>
                    <Text className="popup-icon">✕</Text>
                    <Text className="popup-text">{t('common.cancel')}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
        <Text className="comment-text">{mainCommentContent}</Text>
        <View className="comment-actions">
          <View className={`action-btn ${commentLiked ? 'active' : ''}`} onClick={onLikeComment}>
            <Text className="action-icon">{commentLiked ? '👍🏻' : '👍'}</Text>
            {commentLikeCount > 0 && <Text className="like-count">{commentLikeCount}</Text>}
          </View>
          <View className={`action-btn ${commentDisliked ? 'active' : ''}`} onClick={onDislikeComment}>
            <Text className="action-icon">{commentDisliked ? '👎🏻' : '👎'}</Text>
          </View>
        </View>
        {hasReplies && showReplies && (
          <ReplyThread
            replies={replies}
            currentUser={currentUser}
            activeMenu={activeMenu}
            failedAvatars={failedAvatars}
            replyLikeStates={replyLikeStates}
            onAvatarError={onAvatarError}
            onMenuClick={onMenuClick}
            onEdit={onEdit}
            onDeleteClick={onDeleteClick}
            onReplyTo={onReplyTo}
            onLikeReply={onLikeReply}
            onDislikeReply={onDislikeReply}
          />
        )}
        {hasReplies && (
          <View className="toggle-replies-btn" onClick={onToggleReplies}>
            <Text className="toggle-icon">{showReplies ? '▲' : '▼'}</Text>
            <Text className="toggle-text">{showReplies ? t('comments.hideReplies') : t('comments.showReplies', { count: replies.length })}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
