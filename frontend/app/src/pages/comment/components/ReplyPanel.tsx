/**
 * 回复弹窗组件 - 嵌套回复版本
 * 2026年1月30日 - 支持多级嵌套回复结构
 */
import { useState, useEffect, useRef } from 'react'
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
  onUpdateComment?: (commentId: number, newContent: string) => void
}

// Mock嵌套回复数据 - 展示多级结构
const MOCK_NESTED_REPLIES: Reply[] = [
  {
    id: 101,
    comment_id: 1,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/150?img=5',
    content: '@王大二 真的就是干货满满！',
    created_at: '2026-01-05T15:30:00',
    reply_to: '王大二',
    like_count: 12,
    is_liked: false,
    replies: [
      {
        id: 1011,
        comment_id: 1,
        user_name: '李四',
        user_avatar: 'https://i.pravatar.cc/150?img=7',
        content: '@王小二 同意你的看法！',
        created_at: '2026-01-05T16:00:00',
        reply_to: '王小二',
        like_count: 5,
        is_liked: false,
        replies: [
          {
            id: 10111,
            comment_id: 1,
            user_name: '张三',
            user_avatar: 'https://i.pravatar.cc/150?img=8',
            content: '@李四 确实如此',
            created_at: '2026-01-05T17:00:00',
            reply_to: '李四',
            like_count: 2,
            is_liked: false
          }
        ]
      }
    ]
  },
  {
    id: 102,
    comment_id: 1,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/150?img=6',
    content: '同意楼上的观点！',
    created_at: '2026-01-05T16:00:00',
    like_count: 8,
    is_liked: false,
    replies: [
      {
        id: 1021,
        comment_id: 1,
        user_name: '赵五',
        user_avatar: 'https://i.pravatar.cc/150?img=9',
        content: '@王大二 说得好！',
        created_at: '2026-01-05T18:00:00',
        reply_to: '王大二',
        like_count: 3,
        is_liked: false,
        replies: [
          {
            id: 10211,
            comment_id: 1,
            user_name: '钱六',
            user_avatar: 'https://i.pravatar.cc/150?img=10',
            content: '@赵五 +1',
            created_at: '2026-01-05T19:00:00',
            reply_to: '赵五',
            like_count: 1,
            is_liked: false
          }
        ]
      }
    ]
  }
]

// 格式化时间
const formatTime = (time: string): string => {
  const now = new Date()
  const isoTime = time.includes(' ') ? time.replace(' ', 'T') : time
  const commentTime = new Date(isoTime)
  const diff = now.getTime() - commentTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 7) return isoTime.split('T')[0]
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  return '刚刚'
}

export default function ReplyPanel({ 
  comment, 
  currentUser, 
  onClose, 
  onSubmitReply, 
  onUpdateComment 
}: ReplyPanelProps) {
  const [replies, setReplies] = useState<Reply[]>(MOCK_NESTED_REPLIES)
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [showReplies, setShowReplies] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: number; isReply: boolean }>({ visible: false, id: 0, isReply: false })
  
  // 编辑状态
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isEditingReply, setIsEditingReply] = useState(false)
  
  // 点赞状态
  const [commentLiked, setCommentLiked] = useState(comment.is_liked || false)
  const [commentLikeCount, setCommentLikeCount] = useState(comment.like_count || 0)
  const [commentDisliked, setCommentDisliked] = useState(false)
  const [replyLikeStates, setReplyLikeStates] = useState<Record<number, { liked: boolean; disliked: boolean; count: number }>>({})
  
  // 主评论内容
  const [mainCommentContent, setMainCommentContent] = useState(comment.content)
  
  // 头像加载失败记录
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set())
  
  // Ref for replies container
  const repliesContainerRef = useRef<HTMLDivElement>(null)
  
  const getAvatarUrl = (key: string, avatarUrl?: string) => {
    if (failedAvatars.has(key) || !avatarUrl) return DEFAULT_AVATAR
    return avatarUrl
  }
  
  const handleAvatarError = (key: string) => {
    setFailedAvatars(prev => new Set(prev).add(key))
  }
  
  // 点赞处理
  const handleLikeComment = (e: any) => {
    e.stopPropagation()
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount(c => c - 1)
    } else {
      setCommentLiked(true)
      setCommentLikeCount(c => c + 1)
      if (commentDisliked) setCommentDisliked(false)
    }
  }
  
  const handleDislikeComment = (e: any) => {
    e.stopPropagation()
    setCommentDisliked(!commentDisliked)
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount(c => c - 1)
    }
  }
  
  const handleLikeReply = (replyId: number, e: any) => {
    e.stopPropagation()
    setReplyLikeStates(prev => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 0 }
      if (current.liked) {
        return { ...prev, [replyId]: { ...current, liked: false, count: current.count - 1 } }
      } else {
        return { ...prev, [replyId]: { liked: true, disliked: false, count: current.count + 1 } }
      }
    })
  }
  
  const handleDislikeReply = (replyId: number, e: any) => {
    e.stopPropagation()
    setReplyLikeStates(prev => {
      const current = prev[replyId] || { liked: false, disliked: false, count: 0 }
      if (current.disliked) {
        return { ...prev, [replyId]: { ...current, disliked: false } }
      } else {
        const newCount = current.liked ? current.count - 1 : current.count
        return { ...prev, [replyId]: { liked: false, disliked: true, count: newCount } }
      }
    })
  }
  
  // 菜单处理
  const handleMenuClick = (id: number, e: any) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === id ? null : id)
  }
  
  // 回复处理
  const handleReplyTo = (userName: string, e: any) => {
    e.stopPropagation()
    setReplyTo(userName)
    setActiveMenu(null)
  }
  
  // 编辑处理
  const handleEdit = (id: number, content: string, isReply: boolean, e: any) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingContent(content)
    setIsEditingReply(isReply)
    setActiveMenu(null)
  }
  
  const cancelEdit = () => {
    setEditingId(null)
    setEditingContent('')
    setIsEditingReply(false)
  }
  
  // 删除处理
  const handleDeleteClick = (id: number, isReply: boolean, e: any) => {
    e.stopPropagation()
    setDeleteModal({ visible: true, id, isReply })
    setActiveMenu(null)
  }
  
  const confirmDelete = () => {
    if (deleteModal.isReply) {
      // 递归删除回复
      const deleteReplyRecursive = (replies: Reply[], targetId: number): Reply[] => {
        return replies.filter(r => r.id !== targetId).map(r => ({
          ...r,
          replies: r.replies ? deleteReplyRecursive(r.replies, targetId) : undefined
        }))
      }
      setReplies(deleteReplyRecursive(replies, deleteModal.id))
    }
    setDeleteModal({ visible: false, id: 0, isReply: false })
    Taro.showToast({ title: '删除成功', icon: 'success' })
  }
  
  // 提交处理
  const handleSubmit = () => {
    const text = editingId !== null ? editingContent.trim() : replyText.trim()
    if (!text) return
    
    if (editingId !== null) {
      // 编辑模式
      if (isEditingReply) {
        // 递归更新回复
        const updateReplyRecursive = (replies: Reply[], targetId: number, newContent: string): Reply[] => {
          return replies.map(r => {
            if (r.id === targetId) {
              return { ...r, content: newContent }
            }
            return {
              ...r,
              replies: r.replies ? updateReplyRecursive(r.replies, targetId, newContent) : undefined
            }
          })
        }
        setReplies(updateReplyRecursive(replies, editingId, text))
        Taro.showToast({ title: '修改成功', icon: 'success' })
      } else {
        // 编辑主评论
        setMainCommentContent(text)
        onUpdateComment?.(comment.id, text)
        Taro.showToast({ title: '修改成功', icon: 'success' })
      }
      cancelEdit()
    } else {
      // 新回复 - 添加到一级回复
      const newReply: Reply = {
        id: Date.now(),
        comment_id: comment.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        content: replyTo ? `@${replyTo} ${text}` : text,
        created_at: new Date().toISOString(),
        reply_to: replyTo || undefined,
        like_count: 0,
        is_liked: false
      }
      setReplies([...replies, newReply])
      setReplyText('')
      setReplyTo(null)
      onSubmitReply(comment.id, text, replyTo || undefined)
      Taro.showToast({ title: '回复成功', icon: 'success' })
    }
  }
  
  const hasReplies = replies.length > 0
  
  // 获取回复的点赞状态
  const getReplyLikeState = (reply: Reply) => {
    const state = replyLikeStates[reply.id]
    return state || { liked: reply.is_liked || false, disliked: false, count: reply.like_count || 0 }
  }
  
  // 递归渲染回复项
  const renderReplyItem = (reply: Reply, level: number, isLast: boolean) => {
    const likeState = getReplyLikeState(reply)
    const hasSubReplies = reply.replies && reply.replies.length > 0
    const replyKey = `reply-${reply.id}`
    
    return (
      <View key={reply.id} className={`reply-item ${isLast ? 'last' : ''}`}>
        <View className={`thread reply level-${level} ${hasSubReplies ? 'has-replies' : ''}`}>
          {/* 头像列 */}
          <View className="avatar-col">
            <Image 
              src={getAvatarUrl(replyKey, reply.user_avatar)}
              className="avatar-small"
              mode="aspectFill"
              onError={() => handleAvatarError(replyKey)}
            />
          </View>
          
          {/* 内容列 */}
          <View className="content-col">
            <View className="comment-header">
              <Text className="username">{reply.user_name}</Text>
              <Text className="timestamp">· {formatTime(reply.created_at)}</Text>
              
              {/* 三点菜单 */}
              <View className="menu-btn" onClick={(e) => handleMenuClick(reply.id, e)}>
                <Text className="menu-dots">⋯</Text>
              </View>
              
              {activeMenu === reply.id && (
                <View className="menu-popup">
                  {reply.user_name === currentUser.name ? (
                    <>
                      <View className="popup-item" onClick={(e) => handleEdit(reply.id, reply.content, true, e)}>
                        <Text className="popup-icon">✏️</Text>
                        <Text className="popup-text">修改</Text>
                      </View>
                      <View className="popup-item delete" onClick={(e) => handleDeleteClick(reply.id, true, e)}>
                        <Text className="popup-icon">🗑️</Text>
                        <Text className="popup-text">删除</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View className="popup-item" onClick={(e) => handleReplyTo(reply.user_name, e)}>
                        <Text className="popup-icon">💬</Text>
                        <Text className="popup-text">回复</Text>
                      </View>
                      <View className="popup-item" onClick={(e) => { e.stopPropagation(); setActiveMenu(null) }}>
                        <Text className="popup-icon">✕</Text>
                        <Text className="popup-text">取消</Text>
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
              <View className={`action-btn ${likeState.liked ? 'active' : ''}`} onClick={(e) => handleLikeReply(reply.id, e)}>
                <Text className="action-icon">{likeState.liked ? '👍🏻' : '👍'}</Text>
                {likeState.count > 0 && <Text className="like-count">{likeState.count}</Text>}
              </View>
              <View className={`action-btn ${likeState.disliked ? 'active' : ''}`} onClick={(e) => handleDislikeReply(reply.id, e)}>
                <Text className="action-icon">{likeState.disliked ? '👎🏻' : '👎'}</Text>
              </View>
            </View>
            
            {/* 嵌套回复 - 下一级 */}
            {hasSubReplies && (
              <View className={`replies-level-${Math.min(level + 1, 3)}`}>
                {reply.replies!.map((subReply, idx) => 
                  renderReplyItem(subReply, Math.min(level + 1, 3), idx === reply.replies!.length - 1)
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
  
  return (
    <View className="reply-panel-overlay" onClick={onClose}>
      <View className="reply-panel" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <View className="panel-header">
          <View className="back-btn" onClick={onClose}>
            <Text className="back-icon">&lt;</Text>
            <Text className="back-text">回复</Text>
          </View>
        </View>
        
        {/* 滚动内容区 */}
        <View className="panel-content">
          {/* 主评论线程 */}
          <View className={`thread main ${hasReplies && showReplies ? 'has-replies' : ''}`}>
            {/* 主头像列 */}
            <View className="avatar-col">
              <Image 
                src={getAvatarUrl('main', comment.user_avatar)}
                className="avatar-main"
                mode="aspectFill"
                onError={() => handleAvatarError('main')}
              />
            </View>
            
            {/* 主内容列 */}
            <View className="content-col">
              <View className="comment-header">
                <Text className="username">{comment.user_name}</Text>
                <Text className="timestamp">· {formatTime(comment.created_at)}</Text>
                
                {/* 三点菜单 */}
                <View className="menu-btn" onClick={(e) => handleMenuClick(comment.id, e)}>
                  <Text className="menu-dots">⋯</Text>
                </View>
                
                {activeMenu === comment.id && (
                  <View className="menu-popup">
                    {comment.user_name === currentUser.name ? (
                      <>
                        <View className="popup-item" onClick={(e) => handleEdit(comment.id, mainCommentContent, false, e)}>
                          <Text className="popup-icon">✏️</Text>
                          <Text className="popup-text">修改</Text>
                        </View>
                        <View className="popup-item delete" onClick={(e) => handleDeleteClick(comment.id, false, e)}>
                          <Text className="popup-icon">🗑️</Text>
                          <Text className="popup-text">删除</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View className="popup-item" onClick={(e) => handleReplyTo(comment.user_name, e)}>
                          <Text className="popup-icon">💬</Text>
                          <Text className="popup-text">回复</Text>
                        </View>
                        <View className="popup-item" onClick={(e) => { e.stopPropagation(); setActiveMenu(null) }}>
                          <Text className="popup-icon">✕</Text>
                          <Text className="popup-text">取消</Text>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
              
              <Text className="comment-text">{mainCommentContent}</Text>
              
              <View className="comment-actions">
                <View className={`action-btn ${commentLiked ? 'active' : ''}`} onClick={handleLikeComment}>
                  <Text className="action-icon">{commentLiked ? '👍🏻' : '👍'}</Text>
                  {commentLikeCount > 0 && <Text className="like-count">{commentLikeCount}</Text>}
                </View>
                <View className={`action-btn ${commentDisliked ? 'active' : ''}`} onClick={handleDislikeComment}>
                  <Text className="action-icon">{commentDisliked ? '👎🏻' : '👎'}</Text>
                </View>
              </View>
              
              {/* 一级回复区域 */}
              {hasReplies && showReplies && (
                <View className="replies-level-1" ref={repliesContainerRef}>
                  {replies.map((reply, idx) => 
                    renderReplyItem(reply, 1, idx === replies.length - 1)
                  )}
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
        </View>
        
        {/* 底部输入区 */}
        <View className="panel-footer">
          <Image 
            src={getAvatarUrl('user', currentUser.avatar)}
            className="input-avatar"
            mode="aspectFill"
            onError={() => handleAvatarError('user')}
          />
          <View className="input-wrapper">
            {editingId !== null && (
              <View className="edit-mode-hint">
                <Text className="hint-text">编辑模式</Text>
                <Text className="cancel-btn" onClick={cancelEdit}>取消</Text>
              </View>
            )}
            <Input
              className="input-field"
              placeholder={
                editingId !== null 
                  ? '编辑内容...' 
                  : replyTo 
                    ? `回复 @${replyTo}...` 
                    : '添加回复...'
              }
              placeholderClass="input-placeholder"
              value={editingId !== null ? editingContent : replyText}
              onInput={(e) => editingId !== null 
                ? setEditingContent(e.detail.value) 
                : setReplyText(e.detail.value)
              }
              maxlength={500}
              confirmType="send"
              onConfirm={handleSubmit}
              adjustPosition
              cursorSpacing={16}
            />
          </View>
          <View 
            className={`send-btn ${(editingId !== null ? editingContent.trim() : replyText.trim()) ? 'active' : ''}`}
            onClick={handleSubmit}
          >
            <Text className="send-icon">➤</Text>
          </View>
        </View>
        
        {/* 删除确认弹窗 */}
        <ConfirmModal
          visible={deleteModal.visible}
          title="确认删除此评论？"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ visible: false, id: 0, isReply: false })}
        />
      </View>
    </View>
  )
}
