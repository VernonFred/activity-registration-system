/**
 * 评论页面 - Instagram 风格
 * 创建时间: 2026年1月8日
 * 这是一个独立的全屏页面，用于展示和管理活动评论
 */
import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import type { Comment, CommentSortType, Rating } from './types'
import './index.scss'

// 图标
import iconStar from '../../assets/icons/star.png'

interface CurrentUser {
  id: number
  name: string
  avatar: string
  organization: string
}

// Mock 当前用户
const MOCK_CURRENT_USER: CurrentUser = {
  id: 1,
  name: '王小利',
  avatar: 'https://i.pravatar.cc/150?img=12',
  organization: '湖南大学信息学院中心'
}

// Mock 评分数据
const MOCK_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: 0,
  distribution: { 5: 98, 4: 20, 3: 6, 2: 2, 1: 2 }
}

// Mock 评论数据
const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user_name: '王小利',
    user_avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    content: '这场活动举办得非常好，干货满满',
    created_at: '2026-01-05 14:30:00',
    like_count: 70,
    reply_count: 10,
    is_liked: false,
    replies: []
  },
  {
    id: 2,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    content: '真的就是干货满满！',
    created_at: '2026-01-05 15:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  },
  {
    id: 3,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    content: '活动举办得非常精彩',
    created_at: '2026-01-05 16:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  },
  {
    id: 4,
    user_name: '王小利',
    user_avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    content: '这场活动举办得非常好，干货满满',
    created_at: '2026-01-05 17:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  }
]

export default function CommentPage() {
  const router = useRouter()
  const activityId = Number(router.params.id)
  const coverUrl = router.params.cover || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'

  const [rating, setRating] = useState<Rating>(MOCK_RATING)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [sortType, setSortType] = useState<CommentSortType>('hottest')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [tempRating, setTempRating] = useState(0)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null)
  const [currentUser] = useState(MOCK_CURRENT_USER)

  // 返回
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 点击评分
  const handleRateClick = () => {
    if (rating.user_rating && rating.user_rating > 0) {
      Taro.showToast({ title: '您已经评分过了', icon: 'none' })
      return
    }
    setTempRating(0)
    setShowRatingDialog(true)
  }

  // 提交评分
  const handleSubmitRating = async () => {
    if (tempRating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    try {
      // TODO: 调用API提交评分
      setRating({ ...rating, user_rating: tempRating })
      setShowRatingDialog(false)
      Taro.showToast({ title: '评分成功', icon: 'success' })
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({ title: '评分失败', icon: 'none' })
    }
  }

  // 打开评论输入
  const handleOpenCommentInput = () => {
    setCommentText('')
    setShowCommentInput(true)
  }

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    try {
      // TODO: 调用API提交评论
      const newComment: Comment = {
        id: Date.now(),
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        rating: rating.user_rating || 5,
        content: commentText,
        created_at: new Date().toISOString(),
        like_count: 0,
        reply_count: 0,
        is_liked: false,
        replies: []
      }
      setComments([newComment, ...comments])
      setCommentText('')
      setShowCommentInput(false)
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (error) {
      console.error('提交评论失败:', error)
      Taro.showToast({ title: '评论失败', icon: 'none' })
    }
  }

  // 点赞评论
  const handleLikeComment = async (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    try {
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
      // TODO: 调用API
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用API删除
            setComments(comments.filter(c => c.id !== commentId))
            setActiveCommentMenu(null)
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            console.error('删除失败:', error)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 回复评论
  const handleReplyComment = (commentId: number) => {
    // TODO: 实现回复功能
    Taro.showToast({ title: '回复功能开发中', icon: 'none' })
  }

  // 三点菜单
  const handleCommentMenuClick = (commentId: number, e: any) => {
    e.stopPropagation()
    setActiveCommentMenu(activeCommentMenu === commentId ? null : commentId)
  }

  // 格式化时间
  const formatTime = (time: string) => {
    const now = new Date()
    const commentTime = new Date(time)
    const diff = now.getTime() - commentTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 7) return time.split(' ')[0]
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  // 排序后的评论
  const sortedComments = useMemo(() => {
    const sorted = [...comments]
    if (sortType === 'hottest') {
      sorted.sort((a, b) => b.like_count - a.like_count)
    } else if (sortType === 'time' || sortType === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return sorted
  }, [comments, sortType])

  return (
    <View className="comment-page">
      {/* 顶部活动图片 */}
      <View className="header-cover">
        <Image src={coverUrl} className="cover-image" mode="aspectFill" />
        <View className="cover-overlay" />
      </View>

      {/* 评分区域 */}
      <View className="rating-section">
        <Text className="rating-title">星级评分</Text>

        <View className="rating-main-row">
          {/* 左侧：评分数字和星星 */}
          <View className="rating-left">
            <Text className="rating-score">{rating.average.toFixed(1)}</Text>
            <View className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => {
                // 将10分制转换为5星制
                const stars = rating.average / 2
                if (star <= Math.floor(stars)) {
                  // 实心星
                  return <Text key={star} className="star-icon">★</Text>
                } else if (star === Math.floor(stars) + 1 && stars % 1 >= 0.25) {
                  // 半星（当小数部分 >= 0.25）
                  return <Text key={star} className="star-icon half-star">⚝</Text>
                } else {
                  // 空心星
                  return <Text key={star} className="star-icon">☆</Text>
                }
              })}
            </View>
          </View>

          {/* 右侧：评分按钮 */}
          <View className="rating-button" onClick={handleRateClick}>
            <Image src={iconStar} className="rating-button-icon" mode="aspectFit" />
            <Text className="rating-button-text">评分</Text>
          </View>
        </View>

        <Text className="rating-count">{rating.total_count} 人评价</Text>

        {/* 我的评分 - 在同一个卡片内部 */}
        <View className="my-rating-row">
          <Text className="my-rating-label">我的评分</Text>
          <View className="my-rating-value">
            {rating.user_rating && rating.user_rating > 0 ? (
              <>
                <View className="my-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} className="star-icon">
                      {star <= rating.user_rating! ? '★' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text className="my-rating-date">2025.12.10</Text>
              </>
            ) : (
              <Text className="my-rating-empty">暂未评分</Text>
            )}
          </View>
        </View>
      </View>

      {/* 评论区域 */}
      <View className="comments-section">
        {/* 评论标题 - 单独一行 */}
        <Text className="comments-title">评论</Text>

        {/* 排序按钮 - 下一行 */}
        <View className="sort-tabs">
          {[
            { key: 'hottest', label: '最热门' },
            { key: 'time', label: '按时间' },
            { key: 'newest', label: '最新' }
          ].map(tab => (
            <View
              key={tab.key}
              className={`sort-tab ${sortType === tab.key ? 'active' : ''}`}
              onClick={() => setSortType(tab.key as CommentSortType)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView className="comments-list" scrollY>
          {sortedComments.map(comment => (
            <View key={comment.id} className="comment-item">
              <Image
                src={comment.user_avatar}
                className="comment-avatar"
                mode="aspectFill"
              />
              <View className="comment-content">
                <View className="comment-top">
                  <Text className="comment-user">{comment.user_name}</Text>
                  <Text className="comment-time">· {formatTime(comment.created_at)}</Text>
                </View>
                <Text className="comment-text">{comment.content}</Text>
                <View className="comment-actions">
                  <View className="action-item" onClick={() => handleLikeComment(comment.id)}>
                    <Text className="action-icon">{comment.is_liked ? '👍🏻' : '👍'}</Text>
                    <Text className="action-count">{comment.like_count}</Text>
                  </View>
                  <View className="action-item">
                    <Text className="action-icon">👎</Text>
                  </View>
                </View>
                {comment.reply_count > 0 && (
                  <Text className="reply-link" onClick={() => handleReplyComment(comment.id)}>
                    {comment.reply_count}条回复 &gt;
                  </Text>
                )}
              </View>
              {/* 三点菜单 */}
              <View className="comment-menu">
                <View
                  className="menu-trigger"
                  onClick={(e) => handleCommentMenuClick(comment.id, e)}
                >
                  <Text className="menu-dots">⋯</Text>
                </View>
                {activeCommentMenu === comment.id && (
                  <View className="menu-dropdown">
                    <View className="menu-item" onClick={() => handleReplyComment(comment.id)}>
                      <Text>回复</Text>
                    </View>
                    {comment.user_name === currentUser.name && (
                      <View className="menu-item danger" onClick={() => handleDeleteComment(comment.id)}>
                        <Text>取消</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 底部评论输入触发器 */}
      <View className="comment-input-trigger" onClick={handleOpenCommentInput}>
        <Image src={currentUser.avatar} className="trigger-avatar" mode="aspectFill" />
        <View className="trigger-placeholder">
          <Text>添加评论......</Text>
        </View>
      </View>

      {/* 评分弹窗 */}
      {showRatingDialog && (
        <View className="rating-dialog-overlay" onClick={() => setShowRatingDialog(false)}>
          <View className="rating-dialog" onClick={(e) => e.stopPropagation()}>
            <Text className="dialog-title">点击星星评分</Text>
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
                <Text>确定</Text>
              </View>
            </View>
            <View className="dialog-close" onClick={() => setShowRatingDialog(false)}>
              <Text>✕</Text>
            </View>
          </View>
        </View>
      )}

      {/* 评论输入面板 */}
      {showCommentInput && (
        <View className="comment-input-overlay" onClick={() => setShowCommentInput(false)}>
          <View className="comment-input-panel" onClick={(e) => e.stopPropagation()}>
            <View className="panel-drag-bar" />
            <Text className="panel-title">将以下面的身份进行评论</Text>
            <View className="panel-user">
              <Image src={currentUser.avatar} className="panel-avatar" mode="aspectFill" />
              <View className="panel-user-info">
                <Text className="panel-user-name">{currentUser.name}</Text>
                <Text className="panel-user-org">{currentUser.organization}</Text>
              </View>
            </View>
            <View className="panel-input">
              <Textarea
                className="panel-textarea"
                placeholder="添加评论......"
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                autoFocus
                maxlength={500}
              />
              <Text className="char-count">{commentText.length}/500</Text>
            </View>
            <View
              className={`panel-submit ${commentText.trim() ? 'active' : ''}`}
              onClick={handleSubmitComment}
            >
              <Text>发送</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
