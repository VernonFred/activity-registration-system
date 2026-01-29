/**
 * 回复弹窗组件 - YouTube风格
 * 创建时间: 2026年1月28日
 */
import { useState, useRef, useEffect } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
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

// Mock回复数据 - 使用ISO格式日期（兼容iOS）
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
  const [showOriginalMenu, setShowOriginalMenu] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)

  // 格式化时间 - 兼容iOS日期格式
  const formatTime = (time: string) => {
    const now = new Date()
    // 兼容iOS：将空格格式转换为ISO格式
    const isoTime = time.includes(' ') ? time.replace(' ', 'T') : time
    const replyTime = new Date(isoTime)
    const diff = now.getTime() - replyTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 7) return isoTime.split('T')[0]
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  // 提交回复
  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      Taro.showToast({ title: '请输入回复内容', icon: 'none' })
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

  // 点击回复某人 - 弹出键盘
  const handleReplyTo = (userName: string) => {
    setReplyTo(userName)
    setActiveMenu(null)
    setShowOriginalMenu(false)
    // 延迟设置焦点，确保状态更新后再触发
    setTimeout(() => setInputFocus(true), 100)
  }

  // 原评论菜单点击
  const handleOriginalMenuClick = (e: any) => {
    e.stopPropagation()
    setShowOriginalMenu(!showOriginalMenu)
    setActiveMenu(null)
  }

  // 回复菜单点击
  const handleMenuClick = (replyId: number, e: any) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === replyId ? null : replyId)
    setShowOriginalMenu(false)
  }

  // 删除回复
  const handleDeleteReply = (replyId: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条回复吗？',
      success: (res) => {
        if (res.confirm) {
          setReplies(replies.filter(r => r.id !== replyId))
          setActiveMenu(null)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className="reply-panel-overlay" onClick={onClose}>
      <View className="reply-panel" onClick={(e) => e.stopPropagation()}>
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

        {/* 原评论 */}
        <View className="original-comment">
          <View className="avatar-area">
            <Image src={comment.user_avatar || ''} className="comment-avatar" mode="aspectFill" />
            {replies.length > 0 && <View className="avatar-connector-line" />}
          </View>
          <View className="comment-content">
            <View className="comment-top">
              <Text className="comment-user">{comment.user_name}</Text>
              <Text className="comment-time">· {formatTime(comment.created_at)}</Text>
            </View>
            <Text className="comment-text">{comment.content}</Text>
            <View className="comment-actions">
              <View className="action-item">
                <Text className="action-icon">👍</Text>
                <Text className="action-count">{comment.like_count}</Text>
              </View>
              <View className="action-item">
                <Text className="action-icon">👎</Text>
              </View>
            </View>
          </View>
          {/* 原评论三点菜单 */}
          <View className="comment-menu">
            <View className="menu-trigger" onClick={handleOriginalMenuClick}>
              <Text className="menu-dots">⋯</Text>
            </View>
            {showOriginalMenu && (
              <View className="menu-action-sheet">
                <View className="action-item reply" onClick={() => handleReplyTo(comment.user_name)}>
                  <Text className="action-icon">💬</Text>
                  <Text className="action-text">回复</Text>
                </View>
                <View 
                  className="action-item cancel" 
                  onClick={() => setShowOriginalMenu(false)}
                >
                  <Text className="action-icon">🗑️</Text>
                  <Text className="action-text">{comment.user_name === currentUser.name ? '删除' : '取消'}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 回复列表 */}
        <ScrollView className="replies-list" scrollY>
          {replies.map((reply) => (
            <View key={reply.id} className="reply-item-wrapper">
              <View className="reply-connector-curve" />
              <View className="reply-item">
                <Image src={reply.user_avatar || ''} className="reply-avatar" mode="aspectFill" />
                <View className="reply-content">
                  <View className="reply-top">
                    <Text className="reply-user">{reply.user_name}</Text>
                    <Text className="reply-time">· {formatTime(reply.created_at)}</Text>
                  </View>
                  <Text className="reply-text">{reply.content}</Text>
                  <View className="reply-actions">
                    <View className="action-item">
                      <Text className="action-icon">👍</Text>
                      <Text className="action-count">70</Text>
                    </View>
                    <View className="action-item">
                      <Text className="action-icon">👎</Text>
                    </View>
                  </View>
                </View>
                {/* 每条回复的三点菜单 */}
                <View className="reply-menu">
                  <View className="menu-trigger" onClick={(e) => handleMenuClick(reply.id, e)}>
                    <Text className="menu-dots">⋯</Text>
                  </View>
                  {activeMenu === reply.id && (
                    <View className="menu-action-sheet">
                      <View className="action-item reply" onClick={() => handleReplyTo(reply.user_name)}>
                        <Text className="action-icon">💬</Text>
                        <Text className="action-text">回复</Text>
                      </View>
                      <View 
                        className="action-item cancel" 
                        onClick={() => reply.user_name === currentUser.name ? handleDeleteReply(reply.id) : setActiveMenu(null)}
                      >
                        <Text className="action-icon">🗑️</Text>
                        <Text className="action-text">{reply.user_name === currentUser.name ? '删除' : '取消'}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 底部回复输入 */}
        <View className="reply-input-area">
          <View className="input-user">
            <Image src={currentUser.avatar} className="input-avatar" mode="aspectFill" />
            <View className="input-user-info">
              <Text className="input-user-name">{currentUser.name}</Text>
              <Text className="input-user-org">{currentUser.organization}</Text>
            </View>
          </View>
          <View className="input-row">
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
              onConfirm={handleSubmitReply}
              adjustPosition
              cursorSpacing={16}
            />
            <View 
              className={`send-btn ${replyText.trim() ? 'active' : ''}`}
              onClick={handleSubmitReply}
            >
              <Text className="send-icon">➤</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
