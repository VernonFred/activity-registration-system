import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR, formatTime } from '../../constants'
import type { Reply } from '../../types'
import type { CurrentUser } from '../../constants'
import { getReplyLikeState, type ReplyLikeState } from './utils'

interface ReplyThreadProps {
  replies: Reply[]
  currentUser: CurrentUser
  activeMenu: number | null
  failedAvatars: Set<string>
  replyLikeStates: Record<number, ReplyLikeState>
  onAvatarError: (key: string) => void
  onMenuClick: (id: number, e: any) => void
  onEdit: (id: number, content: string, isReply: boolean, e: any) => void
  onDeleteClick: (id: number, isReply: boolean, e: any) => void
  onReplyTo: (userName: string, e: any) => void
  onLikeReply: (replyId: number, e: any) => void
  onDislikeReply: (replyId: number, e: any) => void
  level?: number
}

export default function ReplyThread({
  replies,
  currentUser,
  activeMenu,
  failedAvatars,
  replyLikeStates,
  onAvatarError,
  onMenuClick,
  onEdit,
  onDeleteClick,
  onReplyTo,
  onLikeReply,
  onDislikeReply,
  level = 1,
}: ReplyThreadProps) {
  const { t } = useTranslation()

  const getAvatarUrl = (key: string, avatarUrl?: string) => {
    if (failedAvatars.has(key) || !avatarUrl) return DEFAULT_AVATAR
    return avatarUrl
  }

  return (
    <View className={`replies-level-${Math.min(level, 3)}`}>
      {replies.map((reply, idx) => {
        const likeState = getReplyLikeState(reply, replyLikeStates)
        const hasSubReplies = !!reply.replies?.length
        const replyKey = `reply-${reply.id}`

        return (
          <View key={reply.id} className={`reply-item ${idx === replies.length - 1 ? 'last' : ''}`}>
            <View className={`thread reply level-${level} ${hasSubReplies ? 'has-replies' : ''}`}>
              <View className="avatar-col">
                <Image
                  src={getAvatarUrl(replyKey, reply.user_avatar)}
                  className="avatar-small"
                  mode="aspectFill"
                  onError={() => onAvatarError(replyKey)}
                />
              </View>
              <View className="content-col">
                <View className="comment-header">
                  <Text className="username">{reply.user_name}</Text>
                  <Text className="timestamp">· {formatTime(reply.created_at)}</Text>
                  <View className="menu-btn" onClick={(e) => onMenuClick(reply.id, e)}>
                    <Text className="menu-dots">⋯</Text>
                  </View>
                  {activeMenu === reply.id && (
                    <View className="menu-popup">
                      {reply.user_name === currentUser.name ? (
                        <>
                          <View className="popup-item" onClick={(e) => onEdit(reply.id, reply.content, true, e)}>
                            <Text className="popup-icon">✏️</Text>
                            <Text className="popup-text">{t('common.modify')}</Text>
                          </View>
                          <View className="popup-item delete" onClick={(e) => onDeleteClick(reply.id, true, e)}>
                            <Text className="popup-icon">🗑️</Text>
                            <Text className="popup-text">{t('common.delete')}</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View className="popup-item" onClick={(e) => onReplyTo(reply.user_name, e)}>
                            <Text className="popup-icon">💬</Text>
                            <Text className="popup-text">{t('common.reply')}</Text>
                          </View>
                          <View className="popup-item" onClick={(e) => { e.stopPropagation(); onMenuClick(reply.id, e) }}>
                            <Text className="popup-icon">✕</Text>
                            <Text className="popup-text">{t('common.cancel')}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
                <Text className="comment-text">
                  {reply.reply_to && <Text className="mention">@{reply.reply_to} </Text>}
                  {reply.content.replace(/@\S+\s*/, '')}
                </Text>
                <View className="comment-actions">
                  <View className={`action-btn ${likeState.liked ? 'active' : ''}`} onClick={(e) => onLikeReply(reply.id, e)}>
                    <Text className="action-icon">{likeState.liked ? '👍🏻' : '👍'}</Text>
                    {likeState.count > 0 && <Text className="like-count">{likeState.count}</Text>}
                  </View>
                  <View className={`action-btn ${likeState.disliked ? 'active' : ''}`} onClick={(e) => onDislikeReply(reply.id, e)}>
                    <Text className="action-icon">{likeState.disliked ? '👎🏻' : '👎'}</Text>
                  </View>
                </View>
                {hasSubReplies && (
                  <ReplyThread
                    replies={reply.replies!}
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
                    level={Math.min(level + 1, 3)}
                  />
                )}
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}
