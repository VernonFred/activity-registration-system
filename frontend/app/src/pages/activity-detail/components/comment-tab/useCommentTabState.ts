import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import type { TFunction } from 'i18next'
import type { Comment, CommentSortType, Rating } from '../../types'
import { createComment, deleteComment, fetchComments, fetchRating, likeComment, submitRating, unlikeComment } from '../../../../services/comments'
import { getUserInfo } from '../../../../services/auth'
import { DEFAULT_COMMENTS, DEFAULT_CURRENT_USER, DEFAULT_RATING } from './constants'
import { sortComments } from './utils'

export function useCommentTabState(activityId: number, t: TFunction) {
  const [rating, setRating] = useState<Rating>(DEFAULT_RATING)
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS)
  const [sortType, setSortType] = useState<CommentSortType>('hottest')
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [tempRating, setTempRating] = useState(0)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState(DEFAULT_CURRENT_USER)

  useEffect(() => {
    void loadData()
  }, [activityId, sortType])

  const sortedComments = useMemo(() => sortComments(comments, sortType), [comments, sortType])

  async function loadData() {
    try {
      const user = getUserInfo()
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          avatar: user.avatar || DEFAULT_CURRENT_USER.avatar,
          organization: user.school || user.organization || DEFAULT_CURRENT_USER.organization,
          title: user.position || user.title || DEFAULT_CURRENT_USER.title,
        })
      }

      const [ratingData, commentsData] = await Promise.all([
        fetchRating(activityId),
        fetchComments(activityId, { sort_by: sortType === 'time' ? 'newest' : sortType === 'hottest' ? 'hottest' : 'newest' }),
      ])
      setRating(ratingData)
      setComments(commentsData.items)
    } catch (error) {
      console.error('加载评论数据失败:', error)
      Taro.showToast({ title: t('common.loadFailedShort'), icon: 'none' })
    }
  }

  function openRatingDialog() {
    if (rating.user_rating && rating.user_rating > 0) {
      Taro.showToast({ title: t('comments.alreadyRated'), icon: 'none' })
      return
    }
    setTempRating(0)
    setShowRatingDialog(true)
  }

  async function submitUserRating() {
    if (tempRating === 0) {
      Taro.showToast({ title: t('comments.selectRating'), icon: 'none' })
      return
    }

    try {
      const newRating = await submitRating(activityId, tempRating)
      setRating(newRating)
      setShowRatingDialog(false)
      Taro.showToast({ title: t('comments.ratingSuccess'), icon: 'success' })
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({ title: t('comments.ratingFailed'), icon: 'none' })
    }
  }

  async function toggleCommentLike(commentId: number) {
    const comment = comments.find((item) => item.id === commentId)
    if (!comment) return

    setComments((prev) => prev.map((item) => item.id === commentId ? {
      ...item,
      is_liked: !item.is_liked,
      like_count: item.is_liked ? item.like_count - 1 : item.like_count + 1,
    } : item))

    try {
      if (comment.is_liked) await unlikeComment(commentId)
      else await likeComment(commentId)
    } catch (error) {
      console.error('点赞失败:', error)
      setComments((prev) => prev.map((item) => item.id === commentId ? {
        ...item,
        is_liked: comment.is_liked,
        like_count: comment.like_count,
      } : item))
      Taro.showToast({ title: t('common.failed'), icon: 'none' })
    }
  }

  function replyToComment(_commentId: number) {
    setShowCommentInput(true)
  }

  function openCommentInput() {
    setCommentText('')
    setShowCommentInput(true)
  }

  async function submitCommentDraft() {
    if (!commentText.trim()) {
      Taro.showToast({ title: t('comments.enterComment'), icon: 'none' })
      return
    }

    try {
      const newComment = await createComment(activityId, {
        content: commentText,
        rating: rating.user_rating || 5,
      })
      setComments((prev) => [newComment, ...prev])
      setCommentText('')
      setShowCommentInput(false)
      Taro.showToast({ title: t('comments.commentSuccess'), icon: 'success' })
    } catch (error) {
      console.error('提交评论失败:', error)
      Taro.showToast({ title: t('comments.commentFailedRetry'), icon: 'none' })
    }
  }

  function requestDeleteComment(commentId: number) {
    Taro.showModal({
      title: t('comments.deleteConfirmTitle'),
      content: t('comments.deleteConfirm'),
      success: async (res) => {
        if (!res.confirm) return
        try {
          await deleteComment(commentId)
          setComments((prev) => prev.filter((item) => item.id !== commentId))
          setActiveCommentMenu(null)
          Taro.showToast({ title: t('comments.deleteSuccess'), icon: 'success' })
        } catch (error) {
          console.error('删除评论失败:', error)
          Taro.showToast({ title: t('comments.deleteFailedRetry'), icon: 'none' })
        }
      },
    })
  }

  function toggleCommentMenu(commentId: number, e?: { stopPropagation?: () => void }) {
    e?.stopPropagation?.()
    setActiveCommentMenu((prev) => prev === commentId ? null : commentId)
  }

  function closeCommentMenu() {
    setActiveCommentMenu(null)
  }

  return {
    activeCommentMenu,
    commentText,
    currentUser,
    rating,
    showCommentInput,
    showRatingDialog,
    sortedComments,
    sortType,
    tempRating,
    closeCommentMenu,
    openCommentInput,
    openRatingDialog,
    replyToComment,
    requestDeleteComment,
    setCommentText,
    setShowCommentInput,
    setShowRatingDialog,
    setSortType,
    setTempRating,
    submitCommentDraft,
    submitUserRating,
    toggleCommentLike,
    toggleCommentMenu,
  }
}
