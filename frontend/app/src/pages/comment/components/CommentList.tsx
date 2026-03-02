/**
 * 评论列表组件 - 带YouTube风格平滑弧线
 * 创建时间: 2026年1月28日
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import type { Comment, CommentSortType } from '../types'
import { formatTime, DEFAULT_AVATAR } from '../constants'
import './CommentList.scss'

interface CommentListProps {
  comments: Comment[]
  sortType: CommentSortType
  activeCommentMenu: number | null
  currentUserName: string
  onSortChange: (type: CommentSortType) => void
  onLike: (commentId: number) => void
  onViewReplies: (commentId: number) => void  // 查看回复列表
  onQuickReply: (userName: string) => void    // 快捷回复（弹出输入框@用户）
  onDelete: (commentId: number) => void
  onEdit: (commentId: number, currentContent: string) => void  // 编辑评论
  onMenuClick: (commentId: number, e: any) => void
}

export default function CommentList({
  comments,
  sortType,
  activeCommentMenu,
  currentUserName,
  onSortChange,
  onLike,
  onViewReplies,
  onQuickReply,
  onDelete,
  onEdit,
  onMenuClick
}: CommentListProps) {
  const { t } = useTranslation()
  // 记录加载失败的头像
  const [failedAvatars, setFailedAvatars] = useState<Set<number>>(new Set())
  
  // 获取头像URL，失败时返回默认头像
  const getAvatarUrl = (commentId: number, avatarUrl?: string) => {
    if (failedAvatars.has(commentId) || !avatarUrl) {
      return DEFAULT_AVATAR
    }
    return avatarUrl
  }
  
  // 头像加载失败处理
  const handleAvatarError = (commentId: number) => {
    setFailedAvatars(prev => new Set(prev).add(commentId))
  }
  
  return (
    <View className="comments-section">
      <Text className="comments-title">{t('comments.comment')}</Text>

      {/* 排序按钮 */}
      <View className="sort-tabs">
        {[
          { key: 'hottest', label: t('comments.hottest') },
          { key: 'time', label: t('comments.byTime') },
          { key: 'newest', label: t('comments.latest') }
        ].map(tab => (
          <View
            key={tab.key}
            className={`sort-tab ${sortType === tab.key ? 'active' : ''}`}
            onClick={() => onSortChange(tab.key as CommentSortType)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView className="comments-list" scrollY>
        {comments.map(comment => (
          <View key={comment.id} className={`comment-item ${comment.reply_count > 0 ? 'has-replies' : ''}`}>
            {/* 头像区域 */}
            <View className="avatar-area">
              <Image
                src={getAvatarUrl(comment.id, comment.user_avatar)}
                className="comment-avatar"
                mode="aspectFill"
                onError={() => handleAvatarError(comment.id)}
              />
              {/* 平滑弧线 - 仅当有回复时显示 */}
              {comment.reply_count > 0 && (
                <View className="reply-connector-curve" />
              )}
            </View>
            
            <View className="comment-content">
              <View className="comment-top">
                <Text className="comment-user">{comment.user_name}</Text>
                <Text className="comment-time">· {formatTime(comment.created_at)}</Text>
              </View>
              <Text className="comment-text">{comment.content}</Text>
              <View className="comment-actions">
                <View className="action-item" onClick={() => onLike(comment.id)}>
                  <Text className="action-icon">{comment.is_liked ? '👍🏻' : '👍'}</Text>
                  <Text className="action-count">{comment.like_count}</Text>
                </View>
                <View className="action-item">
                  <Text className="action-icon">👎</Text>
                </View>
              </View>
              {/* 查看回复链接 */}
              {comment.reply_count > 0 && (
                <View className="reply-link-wrapper">
                  <Text className="reply-link" onClick={() => onViewReplies(comment.id)}>
                    {t('comments.replyCount', { count: comment.reply_count })} &gt;
                  </Text>
                </View>
              )}
            </View>
            
            {/* 三点菜单 */}
            <View className="comment-menu">
              <View
                className="menu-trigger"
                onClick={(e) => onMenuClick(comment.id, e)}
              >
                <Text className="menu-dots">⋯</Text>
              </View>
              {activeCommentMenu === comment.id && (
                <View className="menu-action-sheet">
                  {comment.user_name === currentUserName ? (
                    <>
                      {/* 自己的评论：修改 + 删除 */}
                      <View className="action-item edit" onClick={() => onEdit(comment.id, comment.content)}>
                        <Text className="action-icon">✏️</Text>
                        <Text className="action-text">{t('common.modify')}</Text>
                      </View>
                      <View className="action-item cancel" onClick={() => onDelete(comment.id)}>
                        <Text className="action-icon">🗑️</Text>
                        <Text className="action-text">{t('common.delete')}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      {/* 别人的评论：回复 + 取消 */}
                      <View className="action-item reply" onClick={() => onQuickReply(comment.user_name)}>
                        <Text className="action-icon">💬</Text>
                        <Text className="action-text">{t('common.reply')}</Text>
                      </View>
                      <View className="action-item cancel" onClick={() => onMenuClick(0, { stopPropagation: () => {} })}>
                        <Text className="action-icon">✕</Text>
                        <Text className="action-text">{t('common.cancel')}</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
