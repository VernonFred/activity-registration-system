/**
 * 回复弹窗组件 - YouTube风格连接线
 * 2026年1月29日 - 使用Grid布局 + 主干线结构
 */
import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Comment, Reply } from '../types'
import { DEFAULT_AVATAR } from '../constants'
import ConfirmModal from './ConfirmModal'
import './ReplyPanel.scss'

interface CurrentUser {
  id: number
  name: string
  avatar: string
  organization: string
}

interface ReplyPanelProps {
  comment: Comment
  currentUser: CurrentUser
  onClose: () => void
  onSubmitReply: (commentId: number, content: string, replyTo?: string) => void
  onUpdateComment?: (commentId: number, newContent: string) => void  // 更新评论回调
}

// Mock回复数据
const MOCK_REPLIES: Reply[] = [
  {
    id: 101,
    comment_id: 1,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/150?img=5',
    content: '@王大二 真的就是干货满满！',
    created_at: '2026-01-05T15:30:00',
    reply_to: '王大二'
  },
  {
    id: 102,
    comment_id: 1,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/150?img=6',
    content: '同意楼上的观点！',
    created_at: '2026-01-05T16:00:00'
  }
]

export default function ReplyPanel({ comment, currentUser, onClose, onSubmitReply, onUpdateComment }: ReplyPanelProps) {
  const [replies, setReplies] = useState<Reply[]>(MOCK_REPLIES)
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [inputFocus, setInputFocus] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: number; isReply: boolean }>({ visible: false, id: 0, isReply: false })
  const [showReplies, setShowReplies] = useState(true)  // 控制回复显示/隐藏
  
  // 编辑状态
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isEditingReply, setIsEditingReply] = useState(false)
  
  // 点赞状态
  const [commentLiked, setCommentLiked] = useState(comment.is_liked || false)
  const [commentLikeCount, setCommentLikeCount] = useState(comment.like_count || 0)
  const [commentDisliked, setCommentDisliked] = useState(false)
  const [replyLikes, setReplyLikes] = useState<Record<number, { liked: boolean; disliked: boolean; count: number }>>({})
  
  // 主评论内容状态（用于编辑）
  const [mainCommentContent, setMainCommentContent] = useState(comment.content)
  
  // 头像加载失败记录
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set())
  
  // 获取头像URL
  const getAvatarUrl = (key: string, avatarUrl?: string) => {
    if (failedAvatars.has(key) || !avatarUrl) return DEFAULT_AVATAR
    return avatarUrl
  }
  
  // 头像加载失败处理
  const handleAvatarError = (key: string) => {
    setFailedAvatars(prev => new Set(prev).add(key))
  }
  
  // 点赞原评论
  const handleLikeComment = () => {
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount(c => c - 1)
    } else {
      setCommentLiked(true)
      setCommentLikeCount(c => c + 1)
      if (commentDisliked) setCommentDisliked(false)
    }
  }
  
  // 踩原评论
  const handleDislikeComment = () => {
    setCommentDisliked(!commentDisliked)
    if (!commentDisliked && commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount(c => c - 1)
    }
  }
  
  // 点赞回复
  const handleLikeReply = (replyId: number) => {
    setReplyLikes(prev => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 70 }
      if (current.liked) {
        return { ...prev, [replyId]: { ...current, liked: false, count: current.count - 1 } }
      } else {
        return { ...prev, [replyId]: { ...current, liked: true, disliked: false, count: current.count + 1 } }
      }
    })
  }
  
  // 踩回复
  const handleDislikeReply = (replyId: number) => {
    setReplyLikes(prev => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 70 }
      if (current.disliked) {
        return { ...prev, [replyId]: { ...current, disliked: false } }
      } else {
        const newCount = current.liked ? current.count - 1 : current.count
        return { ...prev, [replyId]: { ...current, disliked: true, liked: false, count: newCount } }
      }
    })
  }

  // 格式化时间
  const formatTime = (time: string) => {
    const isoTime = time.includes(' ') ? time.replace(' ', 'T') : time
    const date = new Date(isoTime)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 7) return isoTime.split('T')[0]
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  // 判断是否是自己的评论/回复
  const isOwnComment = (userName: string) => userName === currentUser.name

  // 点击菜单
  const handleMenuClick = (id: number, e: any) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === id ? null : id)
  }

  // 关闭所有菜单
  const closeMenus = () => {
    setActiveMenu(null)
  }

  // 点击回复
  const handleReply = (userName: string) => {
    setReplyTo(userName)
    setEditingId(null)
    setEditingContent('')
    setActiveMenu(null)
    setTimeout(() => setInputFocus(true), 100)
  }
  
  // 点击修改
  const handleEdit = (id: number, content: string, isReply: boolean) => {
    setActiveMenu(null)
    setEditingId(id)
    setEditingContent(content)
    setIsEditingReply(isReply)
    setReplyTo(null)
    setTimeout(() => setInputFocus(true), 100)
  }
  
  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditingContent('')
    setIsEditingReply(false)
  }

  // 显示删除确认
  const showDeleteConfirm = (id: number, isReply: boolean) => {
    setActiveMenu(null)
    setDeleteModal({ visible: true, id, isReply })
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (deleteModal.isReply) {
      setReplies(replies.filter(r => r.id !== deleteModal.id))
    }
    setDeleteModal({ visible: false, id: 0, isReply: false })
    Taro.showToast({ title: '删除成功', icon: 'success' })
  }

  // 提交回复或保存修改
  const handleSubmit = () => {
    // 编辑模式
    if (editingId !== null) {
      if (!editingContent.trim()) {
        Taro.showToast({ title: '请输入内容', icon: 'none' })
        return
      }
      
      if (isEditingReply) {
        // 编辑回复
        setReplies(replies.map(r => 
          r.id === editingId ? { ...r, content: editingContent } : r
        ))
      } else {
        // 编辑主评论
        setMainCommentContent(editingContent)
        // 通知父组件更新
        onUpdateComment?.(comment.id, editingContent)
      }
      
      setEditingId(null)
      setEditingContent('')
      setIsEditingReply(false)
      Taro.showToast({ title: '修改成功', icon: 'success' })
      return
    }
    
    // 新增回复模式
    const textToSubmit = replyText.trim()
    if (!textToSubmit) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    const newReply: Reply = {
      id: Date.now(),
      comment_id: comment.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      content: replyTo ? `@${replyTo} ${textToSubmit}` : textToSubmit,
      created_at: new Date().toISOString(),
      reply_to: replyTo || undefined
    }
    setReplies([...replies, newReply])
    setReplyText('')
    setReplyTo(null)
    onSubmitReply(comment.id, textToSubmit, replyTo || undefined)
    Taro.showToast({ title: '回复成功', icon: 'success' })
  }

  // 点击遮罩层
  const handleOverlayClick = () => {
    if (activeMenu !== null) {
      closeMenus()
    } else {
      onClose()
    }
  }

  const hasReplies = replies.length > 0

  return (
    <View className="reply-panel-overlay" onClick={handleOverlayClick}>
      <View className="reply-panel" onClick={(e) => { e.stopPropagation(); closeMenus() }}>
        {/* 头部 */}
        <View className="panel-header">
          <View className="header-left" onClick={onClose}>
            <Text className="back-icon">‹</Text>
            <Text className="header-title">回复</Text>
          </View>
          <View className="header-close" onClick={onClose}>
            <Text>✕</Text>
          </View>
        </View>

        {/* 评论内容区 - YouTube Grid布局 */}
        <View className="comment-thread-grid">
          {/* 左侧：头像列 + 主干线 */}
          <View className="avatar-column">
            <Image 
              src={getAvatarUrl('main', comment.user_avatar)} 
              className="main-avatar" 
              mode="aspectFill" 
              onError={() => handleAvatarError('main')}
            />
            {/* 主干线 - 连接到回复，由CSS控制截断 */}
            {hasReplies && showReplies && <View className="thread-line-container" />}
          </View>

          {/* 右侧：内容列 */}
          <View className="content-column">
            {/* 主评论内容 */}
            <View className="main-comment">
              <View className="comment-header-row">
                <Text className="user-name">{comment.user_name}</Text>
                <Text className="post-time">· {formatTime(comment.created_at)}</Text>
                {/* 三点菜单 */}
                <View className="menu-btn" onClick={(e) => handleMenuClick(comment.id, e)}>
                  <Text className="menu-dots">⋮</Text>
                </View>
              </View>
              <Text className="comment-text">{mainCommentContent}</Text>
              <View className="comment-actions">
                <View className="action-item" onClick={(e) => { e.stopPropagation(); handleLikeComment(); }}>
                  <Text className="action-icon">👍</Text>
                  <Text className="action-count">{commentLikeCount}</Text>
                </View>
                <View className="action-item" onClick={(e) => { e.stopPropagation(); handleDislikeComment(); }}>
                  <Text className="action-icon">👎</Text>
                </View>
              </View>
              
              {/* 菜单下拉 */}
              {activeMenu === comment.id && (
                <View className="menu-popup" onClick={(e) => e.stopPropagation()}>
                  {isOwnComment(comment.user_name) ? (
                    <>
                      <View className="popup-item edit" onClick={() => handleEdit(comment.id, mainCommentContent, false)}>
                        <Text className="popup-icon">✏️</Text>
                        <Text className="popup-text">修改</Text>
                      </View>
                      <View className="popup-item delete" onClick={(e) => { e.stopPropagation(); showDeleteConfirm(comment.id, false); }}>
                        <Text className="popup-icon">🗑️</Text>
                        <Text className="popup-text">删除</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View className="popup-item" onClick={() => handleReply(comment.user_name)}>
                        <Text className="popup-icon">💬</Text>
                        <Text className="popup-text">回复</Text>
                      </View>
                      <View className="popup-item" onClick={() => setActiveMenu(null)}>
                        <Text className="popup-icon">✕</Text>
                        <Text className="popup-text">取消</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* 回复区域 */}
            {hasReplies && showReplies && (
              <View className="replies-section">
                {replies.map((reply, index) => {
                  const isLast = index === replies.length - 1
                  return (
                    <View key={reply.id} className={`reply-item ${isLast ? 'last' : ''}`}>
                      <Image 
                          src={getAvatarUrl(`reply-${reply.id}`, reply.user_avatar)} 
                          className="reply-avatar" 
                          mode="aspectFill" 
                          onError={() => handleAvatarError(`reply-${reply.id}`)}
                        />
                      <View className="reply-body">
                        <View className="reply-header-row">
                          <Text className="reply-user">{reply.user_name}</Text>
                          <Text className="reply-time">· {formatTime(reply.created_at)}</Text>
                          <View className="menu-btn" onClick={(e) => handleMenuClick(reply.id, e)}>
                            <Text className="menu-dots">⋮</Text>
                          </View>
                        </View>
                        <Text className="reply-text">{reply.content}</Text>
                        <View className="reply-actions">
                          <View className="action-item" onClick={(e) => { e.stopPropagation(); handleLikeReply(reply.id); }}>
                            <Text className="action-icon">👍</Text>
                            <Text className="action-count">{replyLikes[reply.id]?.count ?? 70}</Text>
                          </View>
                          <View className="action-item" onClick={(e) => { e.stopPropagation(); handleDislikeReply(reply.id); }}>
                            <Text className="action-icon">👎</Text>
                          </View>
                        </View>
                        
                        {/* 回复菜单 */}
                        {activeMenu === reply.id && (
                          <View className="menu-popup reply-menu" onClick={(e) => e.stopPropagation()}>
                            {isOwnComment(reply.user_name) ? (
                              <>
                                <View className="popup-item edit" onClick={() => handleEdit(reply.id, reply.content, true)}>
                                  <Text className="popup-icon">✏️</Text>
                                  <Text className="popup-text">修改</Text>
                                </View>
                                <View className="popup-item delete" onClick={(e) => { e.stopPropagation(); showDeleteConfirm(reply.id, true); }}>
                                  <Text className="popup-icon">🗑️</Text>
                                  <Text className="popup-text">删除</Text>
                                </View>
                              </>
                            ) : (
                              <>
                                <View className="popup-item" onClick={() => handleReply(reply.user_name)}>
                                  <Text className="popup-icon">💬</Text>
                                  <Text className="popup-text">回复</Text>
                                </View>
                                <View className="popup-item" onClick={() => setActiveMenu(null)}>
                                  <Text className="popup-icon">✕</Text>
                                  <Text className="popup-text">取消</Text>
                                </View>
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            )}

            {/* 隐藏/显示回复按钮 */}
            {hasReplies && (
              <View className="toggle-replies-btn" onClick={() => setShowReplies(!showReplies)}>
                <Text className="toggle-icon">{showReplies ? '▲' : '▼'}</Text>
                <Text className="toggle-text">{showReplies ? '隐藏回复' : `显示${replies.length}条回复`}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 底部输入区 */}
        <View className="input-area">
          <View className="input-user-row">
            <Image 
              src={getAvatarUrl('user', currentUser.avatar)} 
              className="input-avatar" 
              mode="aspectFill" 
              onError={() => handleAvatarError('user')}
            />
            <View className="input-user-info">
              <Text className="input-user-name">{currentUser.name}</Text>
              <Text className="input-user-org">{currentUser.organization}</Text>
            </View>
            {/* 编辑模式时显示取消按钮 */}
            {editingId !== null && (
              <View className="cancel-edit-btn" onClick={cancelEdit}>
                <Text className="cancel-edit-text">取消编辑</Text>
              </View>
            )}
          </View>
          <View className="input-box">
            <Input
              className="input-field"
              placeholder={editingId !== null ? '编辑内容...' : (replyTo ? `@${replyTo} 回复...` : '添加回复...')}
              placeholderClass="input-placeholder"
              value={editingId !== null ? editingContent : replyText}
              onInput={(e) => editingId !== null ? setEditingContent(e.detail.value) : setReplyText(e.detail.value)}
              focus={inputFocus}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              confirmType="send"
              onConfirm={handleSubmit}
              adjustPosition
              cursorSpacing={16}
            />
            <View className={`send-btn ${(editingId !== null ? editingContent.trim() : replyText.trim()) ? 'active' : ''}`} onClick={handleSubmit}>
              <Text className="send-icon">➤</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        visible={deleteModal.visible}
        title="您确定要删除评论吗？"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, id: 0, isReply: false })}
      />
    </View>
  )
}
