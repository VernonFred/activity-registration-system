/**
 * 回复弹窗组件 - 嵌套回复版本
 * 2026年1月30日 - 支持多级嵌套回复结构
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Comment, Reply } from '../types'
import { DEFAULT_AVATAR, type CurrentUser } from '../constants'
import ConfirmModal from './ConfirmModal'
import MainCommentThread from './reply-panel/MainCommentThread'
import { MOCK_NESTED_REPLIES } from './reply-panel/mock-replies'
import { deleteReplyRecursive, updateReplyRecursive } from './reply-panel/utils'
import './ReplyPanel.scss'

interface ReplyPanelProps {
  comment: Comment
  currentUser: CurrentUser
  onClose: () => void
  onSubmitReply: (commentId: number, content: string, replyTo?: string) => void
  onUpdateComment?: (commentId: number, newContent: string) => void
}

export default function ReplyPanel({ comment, currentUser, onClose, onSubmitReply, onUpdateComment }: ReplyPanelProps) {
  const { t } = useTranslation()
  const [replies, setReplies] = useState<Reply[]>(MOCK_NESTED_REPLIES)
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [showReplies, setShowReplies] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: 0, isReply: false })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isEditingReply, setIsEditingReply] = useState(false)
  const [commentLiked, setCommentLiked] = useState(comment.is_liked || false)
  const [commentLikeCount, setCommentLikeCount] = useState(comment.like_count || 0)
  const [commentDisliked, setCommentDisliked] = useState(false)
  const [replyLikeStates, setReplyLikeStates] = useState<Record<number, { liked: boolean; disliked: boolean; count: number }>>({})
  const [mainCommentContent, setMainCommentContent] = useState(comment.content)
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set())

  const getAvatarUrl = (key: string, avatarUrl?: string) => failedAvatars.has(key) || !avatarUrl ? DEFAULT_AVATAR : avatarUrl
  const handleAvatarError = (key: string) => setFailedAvatars((prev) => new Set(prev).add(key))
  const handleMenuClick = (id: number, e: any) => { e.stopPropagation(); setActiveMenu((prev) => prev === id ? null : id) }
  const handleReplyTo = (userName: string, e: any) => { e.stopPropagation(); setReplyTo(userName); setActiveMenu(null) }
  const handleEdit = (id: number, content: string, isReply: boolean, e: any) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingContent(content)
    setIsEditingReply(isReply)
    setActiveMenu(null)
  }
  const cancelEdit = () => { setEditingId(null); setEditingContent(''); setIsEditingReply(false) }
  const handleDeleteClick = (id: number, isReply: boolean, e: any) => { e.stopPropagation(); setDeleteModal({ visible: true, id, isReply }); setActiveMenu(null) }

  const handleLikeComment = (e: any) => {
    e.stopPropagation()
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount((count) => count - 1)
      return
    }
    setCommentLiked(true)
    setCommentLikeCount((count) => count + 1)
    if (commentDisliked) setCommentDisliked(false)
  }

  const handleDislikeComment = (e: any) => {
    e.stopPropagation()
    setCommentDisliked((prev) => !prev)
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount((count) => count - 1)
    }
  }

  const handleLikeReply = (replyId: number, e: any) => {
    e.stopPropagation()
    setReplyLikeStates((prev) => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 0 }
      return { ...prev, [replyId]: current.liked ? { ...current, liked: false, count: current.count - 1 } : { liked: true, disliked: false, count: current.count + 1 } }
    })
  }

  const handleDislikeReply = (replyId: number, e: any) => {
    e.stopPropagation()
    setReplyLikeStates((prev) => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 0 }
      return { ...prev, [replyId]: current.disliked ? { ...current, disliked: false } : { liked: false, disliked: true, count: current.liked ? current.count - 1 : current.count } }
    })
  }

  const confirmDelete = () => {
    if (deleteModal.isReply) setReplies((prev) => deleteReplyRecursive(prev, deleteModal.id))
    setDeleteModal({ visible: false, id: 0, isReply: false })
    Taro.showToast({ title: t('comments.deleteSuccess'), icon: 'success' })
  }

  const handleSubmit = () => {
    const text = editingId !== null ? editingContent.trim() : replyText.trim()
    if (!text) return
    if (editingId !== null) {
      if (isEditingReply) {
        setReplies((prev) => updateReplyRecursive(prev, editingId, text))
      } else {
        setMainCommentContent(text)
        onUpdateComment?.(comment.id, text)
      }
      Taro.showToast({ title: t('comments.modifySuccess'), icon: 'success' })
      cancelEdit()
      return
    }
    setReplies((prev) => [...prev, {
      id: Date.now(),
      comment_id: comment.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      content: replyTo ? `@${replyTo} ${text}` : text,
      created_at: new Date().toISOString(),
      reply_to: replyTo || undefined,
      like_count: 0,
      is_liked: false,
    }])
    setReplyText('')
    setReplyTo(null)
    onSubmitReply(comment.id, text, replyTo || undefined)
    Taro.showToast({ title: t('comments.replySuccess'), icon: 'success' })
  }

  return (
    <View className="reply-panel-overlay" onClick={onClose}>
      <View className="reply-panel" onClick={(e) => e.stopPropagation()}>
        <View className="panel-header">
          <View className="back-btn" onClick={onClose}>
            <Text className="back-icon">&lt;</Text>
            <Text className="back-text">{t('comments.replyPanelTitle')}</Text>
          </View>
        </View>
        <View className="panel-content">
          <MainCommentThread
            comment={comment}
            currentUser={currentUser}
            mainCommentContent={mainCommentContent}
            commentLiked={commentLiked}
            commentDisliked={commentDisliked}
            commentLikeCount={commentLikeCount}
            replies={replies}
            showReplies={showReplies}
            activeMenu={activeMenu}
            failedAvatars={failedAvatars}
            replyLikeStates={replyLikeStates}
            onAvatarError={handleAvatarError}
            onMenuClick={handleMenuClick}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
            onReplyTo={handleReplyTo}
            onLikeComment={handleLikeComment}
            onDislikeComment={handleDislikeComment}
            onLikeReply={handleLikeReply}
            onDislikeReply={handleDislikeReply}
            onToggleReplies={() => setShowReplies((prev) => !prev)}
          />
        </View>
        <View className="panel-footer">
          <Image src={getAvatarUrl('user', currentUser.avatar)} className="input-avatar" mode="aspectFill" onError={() => handleAvatarError('user')} />
          <View className="input-wrapper">
            {editingId !== null && (
              <View className="edit-mode-hint">
                <Text className="hint-text">{t('comments.editMode')}</Text>
                <Text className="cancel-btn" onClick={cancelEdit}>{t('common.cancel')}</Text>
              </View>
            )}
            <Input
              className="input-field"
              placeholder={editingId !== null ? t('comments.editPlaceholder') : replyTo ? t('comments.replyToPlaceholder', { name: replyTo }) : t('comments.addReplyPlaceholder')}
              placeholderClass="input-placeholder"
              value={editingId !== null ? editingContent : replyText}
              onInput={(e) => editingId !== null ? setEditingContent(e.detail.value) : setReplyText(e.detail.value)}
              maxlength={500}
              confirmType="send"
              onConfirm={handleSubmit}
              adjustPosition
              cursorSpacing={16}
            />
          </View>
          <View className={`send-btn ${(editingId !== null ? editingContent.trim() : replyText.trim()) ? 'active' : ''}`} onClick={handleSubmit}>
            <Text className="send-icon">➤</Text>
          </View>
        </View>
        <ConfirmModal
          visible={deleteModal.visible}
          title={t('comments.confirmDeleteReply')}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ visible: false, id: 0, isReply: false })}
        />
      </View>
    </View>
  )
}
