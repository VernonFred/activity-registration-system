/**
 * 回复弹窗组件 - 严格按设计稿
 * 2026年1月29日 - 重写
 */
import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Comment, CommentReply } from '../types'
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
}

// Mock回复数据
const MOCK_REPLIES: CommentReply[] = [
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

export default function ReplyPanel({ comment, currentUser, onClose, onSubmitReply }: ReplyPanelProps) {
  const [replies, setReplies] = useState<CommentReply[]>(MOCK_REPLIES)
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [inputFocus, setInputFocus] = useState(false)

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
    setActiveMenu(null)
    setTimeout(() => setInputFocus(true), 100)
  }

  // 删除评论/回复
  const handleDelete = (id: number, isReply: boolean) => {
    Taro.showModal({
      title: '确认删除',
      content: isReply ? '确定要删除这条回复吗？' : '确定要删除这条评论吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          if (isReply) {
            setReplies(replies.filter(r => r.id !== id))
          }
          setActiveMenu(null)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  // 提交回复
  const handleSubmit = () => {
    if (!replyText.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    const newReply: CommentReply = {
      id: Date.now(),
      comment_id: comment.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      content: replyTo ? `@${replyTo} ${replyText}` : replyText,
      created_at: new Date().toISOString(),
      reply_to: replyTo || undefined
    }
    setReplies([...replies, newReply])
    setReplyText('')
    setReplyTo(null)
    onSubmitReply(comment.id, replyText, replyTo || undefined)
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

        {/* 评论内容区 */}
        <View className="comment-thread">
          {/* 原评论 */}
          <View className="original-comment">
            <View className="comment-row">
              <Image src={comment.user_avatar || ''} className="comment-avatar" mode="aspectFill" />
              <View className="comment-body">
                <View className="comment-header">
                  <Text className="comment-user">{comment.user_name}</Text>
                  <Text className="comment-time">· {formatTime(comment.created_at)}</Text>
                </View>
                <Text className="comment-text">{comment.content}</Text>
                <View className="comment-footer">
                  <View className="footer-item">
                    <Text className="item-icon">👍</Text>
                    <Text className="item-count">{comment.like_count}</Text>
                  </View>
                  <View className="footer-item">
                    <Text className="item-icon">👎</Text>
                  </View>
                </View>
              </View>
              {/* 三点菜单按钮 */}
              <View className="comment-menu-btn" onClick={(e) => handleMenuClick(comment.id, e)}>
                <Text className="menu-dots">⋯</Text>
              </View>
            </View>
            {/* 菜单下拉 */}
            {activeMenu === comment.id && (
              <View className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
                {isOwnComment(comment.user_name) ? (
                  <>
                    <View className="menu-item edit-item" onClick={() => { /* TODO: 修改功能 */ setActiveMenu(null) }}>
                      <Text className="menu-icon">✏️</Text>
                      <Text className="menu-text">修改</Text>
                    </View>
                    <View className="menu-item delete-item" onClick={() => handleDelete(comment.id, false)}>
                      <Text className="menu-icon">🗑️</Text>
                      <Text className="menu-text">删除</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="menu-item reply-item" onClick={() => handleReply(comment.user_name)}>
                      <Text className="menu-icon">💬</Text>
                      <Text className="menu-text">回复</Text>
                    </View>
                    <View className="menu-item" onClick={() => setActiveMenu(null)}>
                      <Text className="menu-icon">✕</Text>
                      <Text className="menu-text">取消</Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>

          {/* 回复列表 */}
          {replies.length > 0 && (
            <View className="replies-container">
              {replies.map((reply) => (
                <View key={reply.id} className="reply-item">
                  <View className="reply-row">
                    <Image src={reply.user_avatar || ''} className="reply-avatar" mode="aspectFill" />
                    <View className="reply-body">
                      <View className="reply-header">
                        <Text className="reply-user">{reply.user_name}</Text>
                        <Text className="reply-time">· {formatTime(reply.created_at)}</Text>
                      </View>
                      <Text className="reply-text">{reply.content}</Text>
                      <View className="reply-footer">
                        <View className="footer-item">
                          <Text className="item-icon">👍</Text>
                          <Text className="item-count">70</Text>
                        </View>
                        <View className="footer-item">
                          <Text className="item-icon">👎</Text>
                        </View>
                      </View>
                    </View>
                    {/* 三点菜单按钮 - 始终显示 */}
                    <View className="reply-menu-btn" onClick={(e) => handleMenuClick(reply.id, e)}>
                      <Text className="menu-dots">⋯</Text>
                    </View>
                  </View>
                  {/* 菜单下拉 */}
                  {activeMenu === reply.id && (
                    <View className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      {isOwnComment(reply.user_name) ? (
                        <>
                          <View className="menu-item edit-item" onClick={() => { /* TODO: 修改功能 */ setActiveMenu(null) }}>
                            <Text className="menu-icon">✏️</Text>
                            <Text className="menu-text">修改</Text>
                          </View>
                          <View className="menu-item delete-item" onClick={() => handleDelete(reply.id, true)}>
                            <Text className="menu-icon">🗑️</Text>
                            <Text className="menu-text">删除</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View className="menu-item reply-item" onClick={() => handleReply(reply.user_name)}>
                            <Text className="menu-icon">💬</Text>
                            <Text className="menu-text">回复</Text>
                          </View>
                          <View className="menu-item" onClick={() => setActiveMenu(null)}>
                            <Text className="menu-icon">✕</Text>
                            <Text className="menu-text">取消</Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 底部输入区 */}
        <View className="input-area">
          <View className="input-user-row">
            <Image src={currentUser.avatar} className="input-avatar" mode="aspectFill" />
            <View className="input-user-info">
              <Text className="input-user-name">{currentUser.name}</Text>
              <Text className="input-user-org">{currentUser.organization}</Text>
            </View>
          </View>
          <View className="input-box">
            <Input
              className="input-field"
              placeholder={replyTo ? `@${replyTo} 回复...` : '添加回复...'}
              placeholderClass="input-placeholder"
              value={replyText}
              onInput={(e) => setReplyText(e.detail.value)}
              focus={inputFocus}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              confirmType="send"
              onConfirm={handleSubmit}
              adjustPosition
              cursorSpacing={16}
            />
            <View className={`send-btn ${replyText.trim() ? 'active' : ''}`} onClick={handleSubmit}>
              <Text className="send-icon">➤</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
