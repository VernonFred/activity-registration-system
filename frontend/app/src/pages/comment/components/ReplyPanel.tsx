/**
 * 回复弹窗组件 - YouTube风格
 * 创建时间: 2026年1月28日
 */
import { useState } from 'react'
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

// Mock回复数据
const MOCK_REPLIES: CommentReply[] = [
  {
    id: 101,
    comment_id: 1,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/150?img=5',
    content: '@王大二 真的就是干货满满！',
    created_at: '2026-01-05 15:30:00',
    reply_to: '王大二'
  },
  {
    id: 102,
    comment_id: 1,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/150?img=6',
    content: '同意楼上的观点！',
    created_at: '2026-01-05 16:00:00'
  }
]

export default function ReplyPanel({ comment, currentUser, onClose, onSubmitReply }: ReplyPanelProps) {
  const [replies, setReplies] = useState<CommentReply[]>(MOCK_REPLIES)
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  // 格式化时间
  const formatTime = (time: string) => {
    const now = new Date()
    const replyTime = new Date(time)
    const diff = now.getTime() - replyTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 7) return time.split(' ')[0]
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

  // 点击回复某人
  const handleReplyTo = (userName: string) => {
    setReplyTo(userName)
    setActiveMenu(null)
  }

  // 菜单点击
  const handleMenuClick = (replyId: number, e: any) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === replyId ? null : replyId)
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
            {/* 从头像引出的垂直线 */}
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
        </View>

        {/* 回复列表 - YouTube风格带弯曲连接线 */}
        <ScrollView className="replies-list" scrollY>
          {replies.map((reply) => (
            <View key={reply.id} className="reply-item-wrapper">
              {/* YouTube风格弯曲连接线（L形圆角）*/}
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
                {/* 三点菜单 */}
                <View className="reply-menu">
                  <View className="menu-trigger" onClick={(e) => handleMenuClick(reply.id, e)}>
                    <Text className="menu-dots">⋮</Text>
                  </View>
                  {activeMenu === reply.id && (
                    <View className="menu-dropdown">
                      <View className="menu-item" onClick={() => handleReplyTo(reply.user_name)}>
                        <Text>○ 回复</Text>
                      </View>
                      <View className="menu-item danger">
                        <Text>🗑 取消</Text>
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
              placeholder={replyTo ? `@${replyTo} 回复...` : '添加评论......'}
              placeholderClass="input-placeholder"
              value={replyText}
              onInput={(e) => setReplyText(e.detail.value)}
              confirmType="send"
              onConfirm={handleSubmitReply}
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
