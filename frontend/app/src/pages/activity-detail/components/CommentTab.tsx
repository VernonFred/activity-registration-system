/**
 * 评论/评分 Tab 组件
 * 创建时间: 2026年1月7日
 * 重构时间: 2026年1月8日
 *
 * 功能：
 * - 5星评分系统（含我的评分卡片）
 * - 评论列表（支持排序）
 * - 点赞、回复功能
 * - 底部评论输入面板
 * - 评论操作菜单（删除/回复）
 * - 完整API集成
 */
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Comment, CommentSortType, Rating } from '../types'
import {
  fetchComments,
  fetchRating,
  submitRating,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '../../../services/comments'
import { getUserInfo } from '../../../services/auth'
import './CommentTab.scss'

// 图标
import iconStar from '../../../assets/icons/star.png'
import iconHeart from '../../../assets/icons/heart.png'
import iconMessage from '../../../assets/icons/message-circle.png'
import iconTrash from '../../../assets/icons/inbox.png' // 使用 inbox 图标作为取消图标

interface CommentTabProps {
  activityId: number
  theme: string
}

// Mock 当前用户信息
const MOCK_CURRENT_USER = {
  id: 1,
  name: '王小利',
  avatar: 'https://i.pravatar.cc/150?img=12',
  organization: '湖南大学信息学院中心',
  title: '主任'
}

// Mock 数据 - 评分信息
const MOCK_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: undefined, // undefined 表示用户还未评分
  distribution: {
    5: 98,
    4: 20,
    3: 6,
    2: 2,
    1: 2
  }
}

// Mock 数据 - 评论列表
const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user_name: '张三',
    user_avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    content: '活动非常精彩，组织得很好，学到了很多东西！会议议程安排合理，讲师水平都很高。酒店环境也不错，推荐大家参加！',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'],
    created_at: '2026-01-05 14:30:00',
    like_count: 28,
    reply_count: 3,
    is_liked: false,
    replies: [
      {
        id: 11,
        comment_id: 1,
        user_name: '李四',
        content: '同感！这次活动确实很棒',
        created_at: '2026-01-05 15:20:00'
      },
      {
        id: 12,
        comment_id: 1,
        user_name: '王五',
        reply_to: '张三',
        content: '请问您是参加哪个分论坛的？',
        created_at: '2026-01-05 16:10:00'
      }
    ]
  },
  {
    id: 2,
    user_name: '李明',
    user_avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    content: '整体不错，就是会场有点挤。建议下次可以考虑更大的场地。',
    created_at: '2026-01-04 10:15:00',
    like_count: 15,
    reply_count: 1,
    is_liked: true,
    replies: []
  },
  {
    id: 3,
    user_name: '王芳',
    user_avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    content: '非常值得参加的活动！',
    created_at: '2026-01-03 18:45:00',
    like_count: 42,
    reply_count: 0,
    is_liked: false,
    replies: []
  },
  {
    id: 4,
    user_name: '赵强',
    user_avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    content: '收获满满，期待下次活动！',
    images: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400'],
    created_at: '2026-01-02 20:30:00',
    like_count: 8,
    reply_count: 0,
    is_liked: false,
    replies: []
  }
]

const CommentTab = ({ activityId, theme }: CommentTabProps) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState<Rating>(MOCK_RATING)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [sortType, setSortType] = useState<CommentSortType>('hottest')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [tempRating, setTempRating] = useState(0)

  // 新增状态
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(MOCK_CURRENT_USER)

  // 加载数据
  useEffect(() => {
    loadData()
  }, [activityId])

  const loadData = async () => {
    try {
      setLoading(true)

      // 获取当前用户信息
      const user = getUserInfo()
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          avatar: user.avatar || MOCK_CURRENT_USER.avatar,
          organization: user.school || user.organization || MOCK_CURRENT_USER.organization,
          title: user.position || user.title || MOCK_CURRENT_USER.title
        })
      }

      // 并行加载评分和评论
      const [ratingData, commentsData] = await Promise.all([
        fetchRating(activityId),
        fetchComments(activityId, { sort: sortType })
      ])

      setRating(ratingData)
      setComments(commentsData.items)
    } catch (error) {
      console.error('加载评论数据失败:', error)
      Taro.showToast({
        title: t('common.loadFailedShort'),
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 排序后的评论列表
  const sortedComments = useMemo(() => {
    const sorted = [...comments]
    switch (sortType) {
      case 'hottest':
        return sorted.sort((a, b) => b.like_count - a.like_count)
      case 'time':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default:
        return sorted
    }
  }, [comments, sortType])

  // 点击评分
  const handleRateClick = () => {
    if (rating.user_rating && rating.user_rating > 0) {
      Taro.showToast({
        title: t('comments.alreadyRated'),
        icon: 'none'
      })
      return
    }
    setTempRating(0)
    setShowRatingDialog(true)
  }

  // 提交评分
  const handleSubmitRating = async () => {
    if (tempRating === 0) {
      Taro.showToast({
        title: t('comments.selectRating'),
        icon: 'none'
      })
      return
    }

    try {
      // 调用 API 提交评分
      const newRating = await submitRating(activityId, tempRating)
      setRating(newRating)

      setShowRatingDialog(false)
      Taro.showToast({
        title: t('comments.ratingSuccess'),
        icon: 'success'
      })
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({
        title: t('comments.ratingFailed'),
        icon: 'none'
      })
    }
  }

  // 点赞评论
  const handleLikeComment = async (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    try {
      // 乐观更新UI
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: !c.is_liked,
            like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1
          }
        }
        return c
      }))

      // 调用API
      if (comment.is_liked) {
        await unlikeComment(commentId)
      } else {
        await likeComment(commentId)
      }
    } catch (error) {
      console.error('点赞失败:', error)
      // 回滚UI
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: comment.is_liked,
            like_count: comment.like_count
          }
        }
        return c
      }))
      Taro.showToast({
        title: t('common.failed'),
        icon: 'none'
      })
    }
  }

  // 回复评论
  const handleReplyComment = (commentId: number) => {
    setShowCommentInput(true)
    // TODO: 设置回复目标
  }

  // 打开评论输入面板
  const handleOpenCommentInput = () => {
    setCommentText('')
    setShowCommentInput(true)
  }

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Taro.showToast({
        title: t('comments.enterComment'),
        icon: 'none'
      })
      return
    }

    try {
      // 调用 API 提交评论
      const newComment = await createComment(activityId, {
        content: commentText,
        rating: rating.user_rating || 5
      })

      setComments([newComment, ...comments])
      setCommentText('')
      setShowCommentInput(false)

      Taro.showToast({
        title: t('comments.commentSuccess'),
        icon: 'success'
      })
    } catch (error) {
      console.error('提交评论失败:', error)
      Taro.showToast({
        title: t('comments.commentFailedRetry'),
        icon: 'none'
      })
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    Taro.showModal({
      title: t('comments.deleteConfirmTitle'),
      content: t('comments.deleteConfirm'),
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用 API 删除评论
            await deleteComment(commentId)

            setComments(comments.filter(c => c.id !== commentId))
            setActiveCommentMenu(null)

            Taro.showToast({
              title: t('comments.deleteSuccess'),
              icon: 'success'
            })
          } catch (error) {
            console.error('删除评论失败:', error)
            Taro.showToast({
              title: t('comments.deleteFailedRetry'),
              icon: 'none'
            })
          }
        }
      }
    })
  }

  // 显示/隐藏评论菜单
  const handleCommentMenuClick = (commentId: number, e: any) => {
    e.stopPropagation()
    setActiveCommentMenu(activeCommentMenu === commentId ? null : commentId)
  }

  // 渲染星星
  const renderStars = (count: number, size: 'large' | 'small' = 'small', interactive: boolean = false) => {
    const stars = []
    const starSize = size === 'large' ? 'star-large' : 'star-small'

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          src={iconStar}
          className={`star-icon ${starSize} ${i <= count ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          mode="aspectFit"
          onClick={interactive ? () => setTempRating(i) : undefined}
        />
      )
    }
    return stars
  }

  // 格式化时间
  const formatTime = (time: string) => {
    const now = new Date()
    const commentTime = new Date(time)
    const diff = now.getTime() - commentTime.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return time.split(' ')[0] // 返回日期部分
    } else if (days > 0) {
      return t('time.daysAgo', { days })
    } else if (hours > 0) {
      return t('time.hoursAgo', { hours })
    } else if (minutes > 0) {
      return t('time.minutesAgo', { minutes })
    } else {
      return t('time.justNow')
    }
  }

  return (
    <View className={`comment-tab theme-${theme}`}>
      {/* 评分概览卡片 */}
      <View className="rating-overview-card">
        <View className="rating-header">
          <Text className="rating-title">{t('comments.starRating')}</Text>
          <View className="rating-action" onClick={handleRateClick}>
            <Image src={iconStar} className="rating-action-icon" mode="aspectFit" />
            <Text className="rating-action-text">{t('comments.rating')}</Text>
          </View>
        </View>

        <View className="rating-summary">
          <View className="rating-score-section">
            {/* 暂未评分时不显示任何东西 */}
            {rating.average > 0 && <Text className="rating-score">{rating.average.toFixed(1)}</Text>}
            <View className="rating-stars-large">
              {renderStars(Math.round(rating.average), 'large')}
            </View>
            <Text className="rating-count">{t('comments.ratingCount', { count: rating.total_count })}</Text>
          </View>

          <View className="rating-distribution">
            {[5, 4, 3, 2, 1].map(star => {
              const count = rating.distribution[star as keyof Rating['distribution']]
              const percentage = rating.total_count > 0 ? (count / rating.total_count) * 100 : 0
              return (
                <View key={star} className="distribution-row">
                  <Text className="distribution-star">{t('comments.starCount', { count: star })}</Text>
                  <View className="distribution-bar-bg">
                    <View
                      className="distribution-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="distribution-count">{count}</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      {/* 我的评分卡片 - Instagram 风格 */}
      <View className="my-rating-card">
        <Text className="my-rating-label">{t('comments.myRating')}</Text>
        <View className="my-rating-content">
          {rating.user_rating && rating.user_rating > 0 ? (
            <>
              <View className="my-rating-stars">
                {renderStars(rating.user_rating, 'small')}
              </View>
              <Text className="my-rating-date">2025.12.10</Text>
            </>
          ) : (
            <Text className="my-rating-empty">{t('comments.notRated')}</Text>
          )}
        </View>
      </View>

      {/* 评论区域 - Instagram 风格 */}
      <View className="comments-section">
        <View className="comments-header">
          <Text className="comments-title">{t('comments.comment')}</Text>
          <View className="sort-tabs">
            {[
              { key: 'hottest', labelKey: 'comments.hottest' },
              { key: 'time', labelKey: 'comments.byTime' },
              { key: 'newest', labelKey: 'comments.latest' }
            ].map(tab => (
              <View
                key={tab.key}
                className={`sort-tab ${sortType === tab.key ? 'active' : ''}`}
                onClick={() => setSortType(tab.key as CommentSortType)}
              >
                <Text className="sort-tab-text">{t(tab.labelKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="comments-list">
          {sortedComments.map(comment => (
            <View key={comment.id} className="comment-item">
              {/* Instagram 风格评论头部 */}
              <View className="comment-header">
                <Image
                  src={comment.user_avatar || 'https://i.pravatar.cc/150'}
                  className="comment-avatar"
                  mode="aspectFill"
                />
                <View className="comment-info">
                  <View className="comment-user-row">
                    <Text className="comment-user-name">{comment.user_name}</Text>
                    <Text className="comment-time">{formatTime(comment.created_at)}</Text>
                  </View>
                  <Text className="comment-content">{comment.content}</Text>
                </View>
                {/* 三点菜单 */}
                <View className="comment-menu">
                  <View
                    className="comment-menu-trigger"
                    onClick={(e) => handleCommentMenuClick(comment.id, e)}
                  >
                    <Text className="menu-dots">⋯</Text>
                  </View>
                </View>
              </View>

              {/* Instagram 风格评论操作 */}
              <View className="comment-actions">
                <View
                  className="action-item"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <Text className={`action-icon ${comment.is_liked ? 'liked' : ''}`}>
                    {comment.is_liked ? '❤️' : '🤍'}
                  </Text>
                  <Text className="action-count">{comment.like_count}</Text>
                </View>
                <View
                  className="action-item"
                  onClick={() => {}}
                >
                  <Text className="action-icon dislike">👎</Text>
                </View>
                {comment.reply_count > 0 && (
                  <Text
                    className="reply-link"
                    onClick={() => handleReplyComment(comment.id)}
                  >
                    {t('comments.replyCount', { count: comment.reply_count })} &gt;
                  </Text>
                )}

                {/* 回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <View className="replies-section">
                    {comment.replies.map(reply => (
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
      </View>

      {/* 评分弹窗 - Instagram 风格 */}
      {showRatingDialog && (
        <View className="rating-dialog-overlay" onClick={() => setShowRatingDialog(false)}>
          <View className="rating-dialog" onClick={(e) => e.stopPropagation()}>
            <Text className="dialog-title">{t('comments.ratingDialogTitle')}</Text>
            <View className="dialog-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <View
                  key={star}
                  className="star-item"
                  onClick={() => setTempRating(star)}
                >
                  <Text className={`star-icon ${tempRating >= star ? 'filled' : ''}`}>
                    {tempRating >= star ? '★' : '☆'}
                  </Text>
                </View>
              ))}
            </View>
            <View className="dialog-actions">
              <View className="dialog-confirm" onClick={handleSubmitRating}>
                <Text className="confirm-text">{t('common.confirm')}</Text>
              </View>
            </View>
            <View className="dialog-close" onClick={() => setShowRatingDialog(false)}>
              <Text className="close-icon">✕</Text>
            </View>
          </View>
        </View>
      )}

      {/* 底部评论输入入口 */}
      <View className="comment-input-trigger" onClick={handleOpenCommentInput}>
        <Image
          src={MOCK_CURRENT_USER.avatar}
          className="trigger-avatar"
          mode="aspectFill"
        />
        <View className="trigger-input-placeholder">
          <Text className="placeholder-text">{t('comments.addCommentPlaceholder')}</Text>
        </View>
      </View>

      {/* 评论输入面板 */}
      {showCommentInput && (
        <View className="comment-input-overlay" onClick={() => setShowCommentInput(false)}>
          <View className="comment-input-panel" onClick={(e) => e.stopPropagation()}>
            {/* 拖动条 */}
            <View className="panel-drag-bar" />

            <View className="panel-header">
              <Text className="panel-title">{t('comments.commentAsIdentity')}</Text>
            </View>

            {/* 用户信息 */}
            <View className="panel-user-info">
              <Image
                src={MOCK_CURRENT_USER.avatar}
                className="panel-user-avatar"
                mode="aspectFill"
              />
              <View className="panel-user-detail">
                <Text className="panel-user-name">{MOCK_CURRENT_USER.name}</Text>
                <Text className="panel-user-org">{MOCK_CURRENT_USER.organization}</Text>
              </View>
            </View>

            {/* 评论输入框 */}
            <View className="panel-input-wrapper">
              <Textarea
                className="panel-textarea"
                placeholder={t('comments.addCommentPlaceholder')}
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                autoFocus
                maxlength={500}
              />
              <View className="input-footer">
                <Text className="char-count">{commentText.length}/500</Text>
              </View>
            </View>

            {/* 提交按钮 */}
            <View className="panel-submit-wrapper">
              <View
                className={`panel-submit-button ${commentText.trim() ? 'active' : ''}`}
                onClick={handleSubmitComment}
              >
                <Text className="submit-button-text">{t('common.send')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 评论操作菜单 - 底部弹出卡片式 */}
      {activeCommentMenu !== null && (
        <View
          className="comment-action-sheet-overlay"
          onClick={() => setActiveCommentMenu(null)}
        >
          <View
            className="action-sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            <View
              className="action-sheet-item reply"
              onClick={() => {
                handleReplyComment(activeCommentMenu)
                setActiveCommentMenu(null)
              }}
            >
              <Image src={iconMessage} className="action-icon" mode="aspectFit" />
              <Text className="action-text">{t('common.reply')}</Text>
            </View>
            <View
              className="action-sheet-item cancel"
              onClick={() => {
                setActiveCommentMenu(null)
              }}
            >
              <Image src={iconTrash} className="action-icon" mode="aspectFit" />
              <Text className="action-text">{t('common.cancel')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default CommentTab
