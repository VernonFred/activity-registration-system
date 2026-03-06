import { useMemo, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import {
  createComment as createCommentApi,
  likeComment as likeCommentApi,
  submitRating as submitRatingApi,
  unlikeComment as unlikeCommentApi,
  updateComment as updateCommentApi,
} from '../../../services/comments'
import { DEFAULT_AVATAR, MOCK_COMMENTS, MOCK_CURRENT_USER, MOCK_RATING } from '../constants'
import type { Comment, CommentSortType, Rating } from '../types'
import { mapApiCommentToPageComment, sortComments } from '../utils'
import { useCommentPageBootstrap } from './useCommentPageBootstrap'

export function useCommentPageState(activityId: number) {
  const { t } = useTranslation()
  const [rating, setRating] = useState<Rating>(MOCK_RATING)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [sortType, setSortType] = useState<CommentSortType>('hottest')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [tempRating, setTempRating] = useState(0)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyToUser, setReplyToUser] = useState<string | null>(null)
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState(MOCK_CURRENT_USER)
  const [showReplyPanel, setShowReplyPanel] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [panelTranslateY, setPanelTranslateY] = useState(0)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ visible: false, commentId: 0 })
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [avatarFailed, setAvatarFailed] = useState(false)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  useCommentPageBootstrap(activityId, { setCurrentUser, setRating, setComments })

  const userAvatar = avatarFailed ? DEFAULT_AVATAR : currentUser.avatar
  const sortedComments = useMemo(() => sortComments(comments, sortType), [comments, sortType])

  const closeCommentInput = () => {
    setShowCommentInput(false)
    setReplyToUser(null)
    setEditingCommentId(null)
    setEditingContent('')
    setPanelTranslateY(0)
  }

  const handleRateClick = () => {
    if (rating.user_rating && rating.user_rating > 0) {
      setTempRating(rating.user_rating)
      setIsEditingRating(true)
      setShowRatingDialog(true)
      return
    }
    setTempRating(0)
    setIsEditingRating(false)
    setShowRatingDialog(true)
  }

  const handleSubmitRating = async () => {
    if (tempRating === 0) {
      Taro.showToast({ title: t('comments.selectRating'), icon: 'none' })
      return
    }
    try {
      if (activityId) {
        const ratingRes: any = await submitRatingApi(activityId, tempRating)
        setRating((prev) => ({ ...prev, ...ratingRes, user_rating: tempRating, user_rating_date: new Date().toISOString() }))
      } else {
        setRating((prev) => ({ ...prev, user_rating: tempRating, user_rating_date: new Date().toISOString() }))
      }
      setShowRatingDialog(false)
      setIsEditingRating(false)
      Taro.showToast({ title: isEditingRating ? t('comments.modifySuccess') : t('comments.ratingSuccess'), icon: 'success' })
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({ title: t('comments.ratingFailed'), icon: 'none' })
    }
  }

  const handleCloseRatingDialog = () => {
    setShowRatingDialog(false)
    setIsEditingRating(false)
    setTempRating(0)
  }

  const handleCancelRating = () => {
    setRating((prev) => ({ ...prev, user_rating: 0, user_rating_date: undefined }))
    handleCloseRatingDialog()
    Taro.showToast({ title: t('comments.cancelledRating'), icon: 'success' })
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: t('comments.enterComment'), icon: 'none' })
      return
    }
    const content = replyToUser ? `@${replyToUser} ${commentText}` : commentText
    try {
      if (activityId) {
        const created = await createCommentApi(activityId, { rating: rating.user_rating || 5, content })
        setComments((prev) => [mapApiCommentToPageComment(created), ...prev])
      } else {
        setComments((prev) => [{
          id: Date.now(),
          user_name: currentUser.name,
          user_avatar: currentUser.avatar,
          rating: rating.user_rating || 5,
          content,
          created_at: new Date().toISOString(),
          like_count: 0,
          reply_count: 0,
          is_liked: false,
          replies: [],
        }, ...prev])
      }
      setCommentText('')
      setReplyToUser(null)
      setShowCommentInput(false)
      Taro.showToast({ title: t('comments.commentSuccess'), icon: 'success' })
    } catch (error) {
      console.error('评论提交失败:', error)
      Taro.showToast({ title: t('comments.commentFailed'), icon: 'none' })
    }
  }

  const handleLikeComment = async (commentId: number) => {
    const target = comments.find((comment) => comment.id === commentId)
    if (!target) return
    const previous = comments
    setComments((prev) => prev.map((comment) => (
      comment.id === commentId
        ? { ...comment, is_liked: !comment.is_liked, like_count: comment.is_liked ? Math.max(0, comment.like_count - 1) : comment.like_count + 1 }
        : comment
    )))
    try {
      await (target.is_liked ? unlikeCommentApi(commentId) : likeCommentApi(commentId))
    } catch (error) {
      console.error('评论点赞失败:', error)
      setComments(previous)
    }
  }

  const handleUpdateComment = async (commentId: number, newContent: string) => {
    try {
      await updateCommentApi(commentId, newContent)
      setComments((prev) => prev.map((comment) => (comment.id === commentId ? { ...comment, content: newContent } : comment)))
      setSelectedComment((prev) => (prev && prev.id === commentId ? { ...prev, content: newContent } : prev))
      Taro.showToast({ title: t('comments.modifySuccess'), icon: 'success' })
    } catch (error) {
      console.error('更新评论失败:', error)
      Taro.showToast({ title: t('comments.modifyFailed'), icon: 'none' })
    }
  }

  const handleSubmitEdit = async () => {
    if (!editingContent.trim()) {
      Taro.showToast({ title: t('comments.enterContent'), icon: 'none' })
      return
    }
    if (editingCommentId !== null) {
      await handleUpdateComment(editingCommentId, editingContent.trim())
      closeCommentInput()
    }
  }

  return {
    state: {
      rating,
      sortedComments,
      sortType,
      showRatingDialog,
      tempRating,
      showCommentInput,
      commentText,
      replyToUser,
      activeCommentMenu,
      currentUser,
      showReplyPanel,
      selectedComment,
      panelTranslateY,
      isDragging: isDragging.current,
      isEditingRating,
      deleteModal,
      editingCommentId,
      editingContent,
      userAvatar,
    },
    actions: {
      setSortType,
      setTempRating,
      setCommentText,
      setReplyToUser,
      setActiveCommentMenu,
      setShowReplyPanel,
      setSelectedComment,
      setDeleteModal,
      setEditingContent,
      setAvatarFailed,
      handleRateClick,
      handleSubmitRating,
      handleCancelRating,
      handleCloseRatingDialog,
      openCommentInput: () => {
        setReplyToUser(null)
        setCommentText('')
        setShowCommentInput(true)
      },
      handleQuickReply: (userName: string) => {
        setReplyToUser(userName)
        setCommentText('')
        setActiveCommentMenu(null)
        setShowCommentInput(true)
      },
      handleSubmitComment,
      handleLikeComment,
      handleDeleteComment: (commentId: number) => {
        setActiveCommentMenu(null)
        setDeleteModal({ visible: true, commentId })
      },
      handleConfirmDelete: () => {
        setComments((prev) => prev.filter((comment) => comment.id !== deleteModal.commentId))
        setDeleteModal({ visible: false, commentId: 0 })
        Taro.showToast({ title: t('comments.deleteSuccess'), icon: 'success' })
      },
      handleViewReplies: (commentId: number) => {
        const comment = comments.find((item) => item.id === commentId)
        if (comment) {
          setSelectedComment(comment)
          setShowReplyPanel(true)
          setActiveCommentMenu(null)
        }
      },
      handleSubmitReply: (commentId: number) => {
        setComments((prev) => prev.map((comment) => (
          comment.id === commentId ? { ...comment, reply_count: comment.reply_count + 1 } : comment
        )))
      },
      handleUpdateComment,
      handleEditComment: (commentId: number, currentContent: string) => {
        setActiveCommentMenu(null)
        setEditingCommentId(commentId)
        setEditingContent(currentContent)
        setReplyToUser(null)
        setShowCommentInput(true)
      },
      closeCommentInput,
      handleCommentMenuClick: (commentId: number, e: any) => {
        e.stopPropagation()
        setActiveCommentMenu((prev) => (prev === commentId ? null : commentId))
      },
      handlePageClick: () => activeCommentMenu !== null && setActiveCommentMenu(null),
      handleDragStart: (e: any) => {
        e.stopPropagation()
        touchStartY.current = e.touches[0].clientY
        isDragging.current = true
      },
      handleDragMove: (e: any) => {
        e.stopPropagation()
        if (!isDragging.current) return
        const deltaY = e.touches[0].clientY - touchStartY.current
        if (deltaY > 0) setPanelTranslateY(Math.min(deltaY, 200))
      },
      handleDragEnd: (e: any) => {
        e.stopPropagation()
        isDragging.current = false
        if (panelTranslateY > 80) closeCommentInput()
        setPanelTranslateY(0)
      },
    },
  }
}
