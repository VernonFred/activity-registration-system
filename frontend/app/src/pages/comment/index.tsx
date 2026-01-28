/**
 * 评论页面 - 按设计稿风格
 * 创建时间: 2026年1月8日
 * 更新时间: 2026年1月28日 - 添加回复功能、拆分组件
 */
import { useState, useMemo } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import type { Comment, CommentSortType, Rating } from './types'
import { MOCK_CURRENT_USER, MOCK_RATING, MOCK_COMMENTS } from './constants'
import RatingSection from './components/RatingSection'
import CommentList from './components/CommentList'
import ReplyPanel from './components/ReplyPanel'
import './index.scss'

export default function CommentPage() {
  const router = useRouter()
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
  const [showReplyPanel, setShowReplyPanel] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)

  // 点击评分按钮
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
    setRating({ ...rating, user_rating: tempRating })
    setShowRatingDialog(false)
    Taro.showToast({ title: '评分成功', icon: 'success' })
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
  }

  // 点赞评论
  const handleLikeComment = (commentId: number) => {
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
  }

  // 删除评论
  const handleDeleteComment = (commentId: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          setComments(comments.filter(c => c.id !== commentId))
          setActiveCommentMenu(null)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  // 打开回复弹窗
  const handleReplyComment = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      setSelectedComment(comment)
      setShowReplyPanel(true)
      setActiveCommentMenu(null)
    }
  }

  // 提交回复
  const handleSubmitReply = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, reply_count: c.reply_count + 1 }
      }
      return c
    }))
  }

  // 三点菜单
  const handleCommentMenuClick = (commentId: number, e: any) => {
    e.stopPropagation()
    setActiveCommentMenu(activeCommentMenu === commentId ? null : commentId)
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
      <RatingSection rating={rating} onRateClick={handleRateClick} />

      {/* 评论列表 */}
      <CommentList
        comments={sortedComments}
        sortType={sortType}
        activeCommentMenu={activeCommentMenu}
        currentUserName={currentUser.name}
        onSortChange={setSortType}
        onLike={handleLikeComment}
        onReply={handleReplyComment}
        onDelete={handleDeleteComment}
        onMenuClick={handleCommentMenuClick}
      />

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
                <View key={star} className="star-item" onClick={() => setTempRating(star)}>
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
            <View className="panel-input-row">
              <Input
                className="panel-input-field"
                placeholder="添加评论......"
                placeholderClass="input-placeholder"
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                focus={showCommentInput}
                maxlength={500}
                confirmType="send"
                onConfirm={handleSubmitComment}
              />
              <View 
                className={`panel-send-btn ${commentText.trim() ? 'active' : ''}`}
                onClick={handleSubmitComment}
              >
                <Text className="send-icon">➤</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 回复弹窗 */}
      {showReplyPanel && selectedComment && (
        <ReplyPanel
          comment={selectedComment}
          currentUser={currentUser}
          onClose={() => {
            setShowReplyPanel(false)
            setSelectedComment(null)
          }}
          onSubmitReply={handleSubmitReply}
        />
      )}
    </View>
  )
}
