/**
 * 评论页面 - 按设计稿风格
 * 创建时间: 2026年1月8日
 * 更新时间: 2026年1月28日 - 添加回复功能、拆分组件
 */
import { useEffect, useState, useMemo, useRef } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import type { Comment, CommentSortType, Rating } from './types'
import { MOCK_CURRENT_USER, MOCK_RATING, MOCK_COMMENTS, DEFAULT_AVATAR } from './constants'
import {
  updateComment as updateCommentApi,
  fetchComments as fetchCommentsApi,
  fetchRating as fetchRatingApi,
  createComment as createCommentApi,
  likeComment as likeCommentApi,
  unlikeComment as unlikeCommentApi,
  submitRating as submitRatingApi,
} from '../../services/comments'
import { fetchCurrentUser } from '../../services/user'
import RatingSection from './components/RatingSection'
import CommentList from './components/CommentList'
import ReplyPanel from './components/ReplyPanel'
import ConfirmModal from './components/ConfirmModal'
import './index.scss'

const mapApiCommentToPageComment = (item: any): Comment => ({
  id: item.id,
  user_name: item.user?.name || '用户',
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
    user_name: reply.user?.name || '用户',
    user_avatar: reply.user?.avatar || DEFAULT_AVATAR,
    content: reply.content || '',
    reply_to: reply.reply_to?.name,
    created_at: reply.created_at || new Date().toISOString(),
  }))
})

export default function CommentPage() {
  const router = useRouter()
  const coverUrl = router.params.cover || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  const activityId = Number(router.params.id || router.params.activityId || router.params.activity_id || 0)

  const [rating, setRating] = useState<Rating>(MOCK_RATING)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [sortType, setSortType] = useState<CommentSortType>('hottest')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [tempRating, setTempRating] = useState(0)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyToUser, setReplyToUser] = useState<string | null>(null)  // 被回复的用户
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState(MOCK_CURRENT_USER)
  const [showReplyPanel, setShowReplyPanel] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [panelTranslateY, setPanelTranslateY] = useState(0)  // 面板下拉偏移
  const touchStartY = useRef(0)  // 触摸起始Y坐标
  const isDragging = useRef(false)  // 是否正在拖拽
  const [isEditingRating, setIsEditingRating] = useState(false)  // 是否是修改评分模式
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; commentId: number }>({ visible: false, commentId: 0 })
  
  // 编辑评论状态
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  
  // 头像加载失败状态
  const [avatarFailed, setAvatarFailed] = useState(false)
  const userAvatar = avatarFailed ? DEFAULT_AVATAR : currentUser.avatar

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [userRes, ratingRes, commentsRes] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          activityId ? fetchRatingApi(activityId).catch(() => null) : Promise.resolve(null),
          activityId ? fetchCommentsApi(activityId, { page: 1, per_page: 50, sort_by: 'newest' }).catch(() => null) : Promise.resolve(null),
        ])

        if (!active) return

        if (userRes) {
          setCurrentUser({
            id: userRes.id,
            name: userRes.name,
            avatar: userRes.avatar || DEFAULT_AVATAR,
            organization: [userRes.school, userRes.department].filter(Boolean).join(''),
          })
        }
        if (ratingRes) {
          setRating((prev) => ({ ...prev, ...ratingRes }))
        }
        if (commentsRes?.items) {
          setComments(commentsRes.items.map(mapApiCommentToPageComment))
        }
      } catch (error) {
        console.error('加载评论页数据失败，使用本地Mock:', error)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [activityId])

  // 点击评分按钮（首次评分）
  const handleRateClick = () => {
    if (rating.user_rating && rating.user_rating > 0) {
      // 已评分，进入修改模式
      handleEditRating()
      return
    }
    setTempRating(0)
    setIsEditingRating(false)
    setShowRatingDialog(true)
  }

  // 修改评分
  const handleEditRating = () => {
    setTempRating(rating.user_rating || 0)
    setIsEditingRating(true)
    setShowRatingDialog(true)
  }

  // 提交评分
  const handleSubmitRating = async () => {
    if (tempRating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    try {
      if (activityId) {
        const ratingRes: any = await submitRatingApi(activityId, tempRating)
        setRating({
          ...rating,
          ...ratingRes,
          user_rating: tempRating,
          user_rating_date: new Date().toISOString(),
        })
      } else {
        setRating({ ...rating, user_rating: tempRating, user_rating_date: new Date().toISOString() })
      }
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({ title: '评分失败', icon: 'none' })
      return
    }
    setShowRatingDialog(false)
    setIsEditingRating(false)
    Taro.showToast({ title: isEditingRating ? '修改成功' : '评分成功', icon: 'success' })
  }

  // 取消评分
  const handleCancelRating = () => {
    setRating({ ...rating, user_rating: 0, user_rating_date: undefined })
    setShowRatingDialog(false)
    setIsEditingRating(false)
    Taro.showToast({ title: '已取消评分', icon: 'success' })
  }

  // 打开评论输入（普通评论）
  const handleOpenCommentInput = () => {
    setReplyToUser(null)
    setCommentText('')
    setShowCommentInput(true)
  }

  // 快捷回复 - 点击三点菜单的"回复"
  const handleQuickReply = (userName: string) => {
    setReplyToUser(userName)
    setCommentText('')
    setActiveCommentMenu(null)
    setShowCommentInput(true)
  }

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    const content = replyToUser ? `@${replyToUser} ${commentText}` : commentText
    try {
      if (activityId) {
        const created = await createCommentApi(activityId, {
          rating: rating.user_rating || 5,
          content,
        })
        setComments([mapApiCommentToPageComment(created), ...comments])
      } else {
        const newComment: Comment = {
          id: Date.now(),
          user_name: currentUser.name,
          user_avatar: currentUser.avatar,
          rating: rating.user_rating || 5,
          content,
          created_at: new Date().toISOString(),
          like_count: 0,
          reply_count: 0,
          is_liked: false,
          replies: []
        }
        setComments([newComment, ...comments])
      }
    } catch (error) {
      console.error('评论提交失败:', error)
      Taro.showToast({ title: '评论失败', icon: 'none' })
      return
    }
    setCommentText('')
    setReplyToUser(null)
    setShowCommentInput(false)
    Taro.showToast({ title: '评论成功', icon: 'success' })
  }

  // 点赞评论
  const handleLikeComment = async (commentId: number) => {
    const target = comments.find(c => c.id === commentId)
    if (!target) return

    setComments(comments.map(c => (
      c.id === commentId
        ? { ...c, is_liked: !c.is_liked, like_count: c.is_liked ? Math.max(0, c.like_count - 1) : c.like_count + 1 }
        : c
    )))

    try {
      if (target.is_liked) {
        await unlikeCommentApi(commentId)
      } else {
        await likeCommentApi(commentId)
      }
    } catch (error) {
      console.error('评论点赞失败:', error)
      setComments(comments)
    }
  }

  // 显示删除确认弹窗
  const handleDeleteComment = (commentId: number) => {
    setActiveCommentMenu(null)
    setDeleteModal({ visible: true, commentId })
  }

  // 确认删除评论
  const handleConfirmDelete = () => {
    setComments(comments.filter(c => c.id !== deleteModal.commentId))
    setDeleteModal({ visible: false, commentId: 0 })
    Taro.showToast({ title: '删除成功', icon: 'success' })
  }

  // 查看回复列表
  const handleViewReplies = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      setSelectedComment(comment)
      setShowReplyPanel(true)
      setActiveCommentMenu(null)
    }
  }

  // 提交回复（在回复弹窗中）
  const handleSubmitReply = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, reply_count: c.reply_count + 1 }
      }
      return c
    }))
  }
  
  // 更新评论内容（从回复弹窗中或评论列表中）
  const handleUpdateComment = async (commentId: number, newContent: string) => {
    try {
      // 调用API更新评论
      await updateCommentApi(commentId, newContent)
      
      // 更新本地状态
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { ...c, content: newContent }
        }
        return c
      }))
      // 同时更新selectedComment以保持同步
      if (selectedComment && selectedComment.id === commentId) {
        setSelectedComment({ ...selectedComment, content: newContent })
      }
      
      Taro.showToast({ title: '修改成功', icon: 'success' })
    } catch (error) {
      console.error('更新评论失败:', error)
      Taro.showToast({ title: '修改失败', icon: 'none' })
    }
  }
  
  // 点击编辑按钮（评论列表中）
  const handleEditComment = (commentId: number, currentContent: string) => {
    setActiveCommentMenu(null)
    setEditingCommentId(commentId)
    setEditingContent(currentContent)
    setReplyToUser(null)
    setShowCommentInput(true)
  }
  
  // 取消编辑
  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }
  
  // 提交编辑
  const submitEdit = async () => {
    if (!editingContent.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    if (editingCommentId !== null) {
      await handleUpdateComment(editingCommentId, editingContent.trim())
      setEditingCommentId(null)
      setEditingContent('')
      setShowCommentInput(false)
    }
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

  // 输入框placeholder
  const inputPlaceholder = replyToUser ? `@${replyToUser} 回复...` : '添加评论......'

  // 点击页面空白处关闭菜单
  const handlePageClick = () => {
    if (activeCommentMenu !== null) {
      setActiveCommentMenu(null)
    }
  }

  // 拖拽条触摸开始
  const handleDragStart = (e: any) => {
    e.stopPropagation()
    touchStartY.current = e.touches[0].clientY
    isDragging.current = true
  }

  // 拖拽条触摸移动 - 阻止默认行为防止页面滚动
  const handleDragMove = (e: any) => {
    e.stopPropagation()
    if (!isDragging.current) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY.current
    // 只允许向下拖动
    if (deltaY > 0) {
      setPanelTranslateY(Math.min(deltaY, 200))  // 限制最大拖动距离
    }
  }

  // 拖拽条触摸结束
  const handleDragEnd = (e: any) => {
    e.stopPropagation()
    isDragging.current = false
    // 下拉超过80px则关闭
    if (panelTranslateY > 80) {
      setShowCommentInput(false)
      setReplyToUser(null)
    }
    setPanelTranslateY(0)
  }

  return (
    <View className="comment-page" onClick={handlePageClick}>
      {/* 顶部活动图片 */}
      <View className="header-cover">
        <Image src={coverUrl} className="cover-image" mode="aspectFill" />
        <View className="cover-overlay" />
      </View>

      {/* 评分区域 */}
      <RatingSection rating={rating} onRateClick={handleRateClick} onEditRating={handleEditRating} />

      {/* 评论列表 */}
      <CommentList
        comments={sortedComments}
        sortType={sortType}
        activeCommentMenu={activeCommentMenu}
        currentUserName={currentUser.name}
        onSortChange={setSortType}
        onLike={handleLikeComment}
        onViewReplies={handleViewReplies}
        onQuickReply={handleQuickReply}
        onDelete={handleDeleteComment}
        onEdit={handleEditComment}
        onMenuClick={handleCommentMenuClick}
      />

      {/* 底部评论输入触发器 */}
      <View className="comment-input-trigger" onClick={handleOpenCommentInput}>
        <Image 
          src={userAvatar} 
          className="trigger-avatar" 
          mode="aspectFill" 
          onError={() => setAvatarFailed(true)}
        />
        <View className="trigger-placeholder">
          <Text>添加评论......</Text>
        </View>
      </View>

      {/* 评分弹窗 */}
      {showRatingDialog && (
        <View className="rating-dialog-overlay" onClick={() => { setShowRatingDialog(false); setIsEditingRating(false) }}>
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
              {/* 取消评分按钮（仅修改模式显示） */}
              {isEditingRating && (
                <View className="dialog-cancel-rating" onClick={handleCancelRating}>
                  <Text>取消评分</Text>
                </View>
              )}
            </View>
            <View className="dialog-close" onClick={() => { setShowRatingDialog(false); setIsEditingRating(false) }}>
              <Text>✕</Text>
            </View>
          </View>
        </View>
      )}

      {/* 评论输入面板 */}
      {showCommentInput && (
        <View className="comment-input-overlay" onClick={() => { 
          setShowCommentInput(false)
          setReplyToUser(null)
          cancelEditing()
        }}>
          <View 
            className={`comment-input-panel ${isDragging.current ? 'dragging' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              transform: `translateY(${panelTranslateY}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* 拖拽条 - 支持点击关闭和下拉手势关闭 */}
            <View 
              className="panel-drag-bar" 
              onClick={(e) => { 
                e.stopPropagation()
                setShowCommentInput(false)
                setReplyToUser(null)
                cancelEditing()
              }}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              catchMove
            />
            <Text className="panel-title">
              {editingCommentId !== null ? '编辑评论' : '将以下面的身份进行评论'}
            </Text>
            <View className="panel-user">
              <Image 
                src={userAvatar} 
                className="panel-avatar" 
                mode="aspectFill" 
                onError={() => setAvatarFailed(true)}
              />
              <View className="panel-user-info">
                <Text className="panel-user-name">{currentUser.name}</Text>
                <Text className="panel-user-org">{currentUser.organization}</Text>
              </View>
              {/* 取消编辑按钮 */}
              {editingCommentId !== null && (
                <View className="cancel-edit-btn" onClick={cancelEditing}>
                  <Text className="cancel-text">取消</Text>
                </View>
              )}
            </View>
            <View className="panel-input-row">
              <Input
                className="panel-input-field"
                placeholder={editingCommentId !== null ? '编辑内容...' : inputPlaceholder}
                placeholderClass="input-placeholder"
                value={editingCommentId !== null ? editingContent : commentText}
                onInput={(e) => editingCommentId !== null 
                  ? setEditingContent(e.detail.value) 
                  : setCommentText(e.detail.value)
                }
                focus={showCommentInput}
                maxlength={500}
                confirmType="send"
                onConfirm={editingCommentId !== null ? submitEdit : handleSubmitComment}
                adjustPosition
                cursorSpacing={16}
              />
              <View 
                className={`panel-send-btn ${(editingCommentId !== null ? editingContent.trim() : commentText.trim()) ? 'active' : ''}`}
                onClick={editingCommentId !== null ? submitEdit : handleSubmitComment}
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
          onUpdateComment={handleUpdateComment}
        />
      )}

      {/* 删除确认弹窗 */}
      <ConfirmModal
        visible={deleteModal.visible}
        title="您确定要删除评论吗？"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, commentId: 0 })}
      />
    </View>
  )
}
