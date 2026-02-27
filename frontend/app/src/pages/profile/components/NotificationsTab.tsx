/**
 * 通知Tab组件 — 对标设计稿
 * 三个子Tab: 系统通知 | @我的 | 我的评论
 * 重构时间: 2026年2月27日
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Notification, NotifyTab, MentionItem, MyCommentItem } from '../types'
import {
  fetchMyNotifications,
  fetchMyMentions,
  fetchMyCommentsList,
  clearAllNotifications,
} from '../../../services/notifications'

interface NotificationsTabProps {
  notifications: Notification[]
  notifyTab: NotifyTab
  onNotifyTabChange: (tab: NotifyTab) => void
  onDeleteNotification: (id: number) => void
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications: initialNotifications,
  notifyTab,
  onNotifyTabChange,
  onDeleteNotification,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [mentions, setMentions] = useState<MentionItem[]>([])
  const [myComments, setMyComments] = useState<MyCommentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    const loadTabData = async () => {
      setLoading(true)
      try {
        if (notifyTab === 'system') {
          const data = await fetchMyNotifications()
          setNotifications(data)
        } else if (notifyTab === 'mentions') {
          const data = await fetchMyMentions()
          setMentions(data)
        } else if (notifyTab === 'comments') {
          const data = await fetchMyCommentsList()
          setMyComments(data)
        }
      } catch (e) {
        console.error('加载通知数据失败:', e)
      } finally {
        setLoading(false)
      }
    }
    loadTabData()
    setPage(1)
    setActiveMenu(null)
  }, [notifyTab])

  const handleClearAll = useCallback(() => {
    Taro.showModal({
      title: '清空消息提醒',
      content: '确定要清空全部消息提醒吗？',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#2d5a3d',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await clearAllNotifications()
          setNotifications([])
          Taro.showToast({ title: '已清空', icon: 'success' })
        } catch {
          Taro.showToast({ title: '操作失败', icon: 'none' })
        }
      },
    })
  }, [])

  const handleDeleteComment = useCallback((commentId: number) => {
    Taro.showModal({
      title: '删除评论',
      content: '确定要删除这条评论吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          setMyComments(prev => prev.filter(c => c.id !== commentId))
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  }, [])

  const handleEditComment = useCallback((commentId: number, activityId: number) => {
    Taro.navigateTo({ url: `/pages/comment/index?id=${activityId}&editCommentId=${commentId}` })
  }, [])

  const handleReply = useCallback((mention: MentionItem) => {
    if (mention.activity_id) {
      Taro.navigateTo({ url: `/pages/comment/index?id=${mention.activity_id}` })
    }
  }, [])

  const getCurrentPageItems = <T,>(items: T[]) => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }

  const getTotalPages = (total: number) => Math.max(1, Math.ceil(total / pageSize))

  const renderPagination = (total: number) => {
    const totalPages = getTotalPages(total)
    if (totalPages <= 1) return null
    return (
      <View className="nt-pagination">
        <View
          className={`nt-page-btn ${page <= 1 ? 'disabled' : ''}`}
          onClick={() => page > 1 && setPage(page - 1)}
        >
          <Text>‹</Text>
        </View>
        {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(n => (
          <View
            key={n}
            className={`nt-page-num ${page === n ? 'active' : ''}`}
            onClick={() => setPage(n)}
          >
            <Text>{n}</Text>
          </View>
        ))}
        <View
          className={`nt-page-btn ${page >= totalPages ? 'disabled' : ''}`}
          onClick={() => page < totalPages && setPage(page + 1)}
        >
          <Text>›</Text>
        </View>
      </View>
    )
  }

  // ========== 系统通知 ==========
  const renderSystemTab = () => {
    const items = getCurrentPageItems(notifications)
    return (
      <View className="nt-system">
        {items.map(notify => (
          <View key={notify.id} className="nt-card">
            <View className="nt-card-body">
              <View className="nt-dot-wrap">
                <View className="nt-dot" />
              </View>
              <View className="nt-card-content">
                <View className="nt-card-header">
                  <Text className="nt-card-title">{notify.title}</Text>
                  {notify.is_new && <View className="nt-new-tag"><Text>新</Text></View>}
                </View>
                <Text className="nt-card-text">{notify.content}</Text>
                {notify.action_url && (
                  <View
                    className="nt-action-btn"
                    onClick={() => Taro.navigateTo({ url: notify.action_url! })}
                  >
                    <Text>→ {notify.action_text || '查看'}</Text>
                  </View>
                )}
                <Text className="nt-card-time">{notify.time}</Text>
              </View>
            </View>
            <View className="nt-delete-area" onClick={() => onDeleteNotification(notify.id)}>
              <Text className="nt-delete-icon">◻</Text>
            </View>
          </View>
        ))}
        {items.length === 0 && !loading && (
          <View className="nt-empty"><Text>暂无通知</Text></View>
        )}
        {renderPagination(notifications.length)}
      </View>
    )
  }

  // ========== @我的 ==========
  const renderMentionsTab = () => {
    const items = getCurrentPageItems(mentions)
    return (
      <View className="nt-mentions">
        {items.map(mention => (
          <View key={mention.id} className="nt-mention-card">
            <View className="nt-mention-header">
              <Image className="nt-mention-avatar" src={mention.user_avatar} mode="aspectFill" />
              <View className="nt-mention-user">
                <View className="nt-mention-name-row">
                  <Text className="nt-mention-name">{mention.user_name}</Text>
                  <Text className="nt-mention-time">{mention.time}</Text>
                </View>
                <Text className="nt-mention-org">{mention.user_org}</Text>
              </View>
            </View>
            <Text className="nt-mention-text">{mention.comment_text}</Text>
            <View className="nt-mention-original">
              <Text className="nt-mention-original-text">我：{mention.my_original_text}</Text>
            </View>
            <View className="nt-mention-actions">
              <View className="nt-reply-btn" onClick={() => handleReply(mention)}>
                <Text className="nt-reply-icon">↩</Text>
                <Text className="nt-reply-text">回复</Text>
              </View>
            </View>
          </View>
        ))}
        {items.length === 0 && !loading && (
          <View className="nt-empty"><Text>暂无@我的消息</Text></View>
        )}
        {renderPagination(mentions.length)}
      </View>
    )
  }

  // ========== 我的评论 ==========
  const renderCommentsTab = () => {
    const items = getCurrentPageItems(myComments)
    return (
      <View className="nt-my-comments">
        {items.map(item => (
          <View key={item.id} className="nt-comment-card">
            <View className="nt-comment-meta">
              <Text className="nt-comment-category">{item.activity_category}</Text>
              <Text className="nt-comment-title">{item.activity_title}</Text>
            </View>
            <View className="nt-comment-desc-row">
              <View className="nt-desc-dot" />
              <Text className="nt-comment-desc">{item.activity_desc}</Text>
              <View className="nt-rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <Text key={s} className={`nt-star ${s <= item.rating ? 'filled' : ''}`}>★</Text>
                ))}
              </View>
            </View>
            <View className="nt-comment-stats">
              <View className="nt-stat-item">
                <Text className="nt-stat-icon nt-stat-like">♥</Text>
                <Text className="nt-stat-val">{item.stats.likes} 点赞</Text>
              </View>
              <View className="nt-stat-item">
                <Text className="nt-stat-icon nt-stat-comment">◎</Text>
                <Text className="nt-stat-val">{item.stats.comments} 评论</Text>
              </View>
              <View className="nt-stat-item">
                <Text className="nt-stat-icon nt-stat-fav">✦</Text>
                <Text className="nt-stat-val">{item.stats.favorites} 收藏</Text>
              </View>
              <View className="nt-stat-item">
                <Text className="nt-stat-icon nt-stat-share">↗</Text>
                <Text className="nt-stat-val">{item.stats.shares} 分享</Text>
              </View>
            </View>
            <View className="nt-my-comment-row">
              <Image className="nt-my-comment-avatar" src={item.user_avatar} mode="aspectFill" />
              <View className="nt-my-comment-bubble">
                <Text>{item.comment_text}</Text>
              </View>
              <View className="nt-more-wrap">
                <View
                  className="nt-more-btn"
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id) }}
                >
                  <Text>⋮</Text>
                </View>
                {activeMenu === item.id && (
                  <View className="nt-dropdown">
                    <View
                      className="nt-dropdown-item"
                      onClick={() => { setActiveMenu(null); handleEditComment(item.id, item.activity_id) }}
                    >
                      <Text className="nt-dropdown-icon">✎</Text>
                      <Text>修改</Text>
                    </View>
                    <View
                      className="nt-dropdown-item nt-dropdown-danger"
                      onClick={() => { setActiveMenu(null); handleDeleteComment(item.id) }}
                    >
                      <Text className="nt-dropdown-icon">▬</Text>
                      <Text>删除</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
        {items.length === 0 && !loading && (
          <View className="nt-empty"><Text>暂无评论</Text></View>
        )}
        {renderPagination(myComments.length)}
      </View>
    )
  }

  return (
    <View className="tab-content notifications-tab animate-fade-in" onClick={() => setActiveMenu(null)}>
      {/* 子Tab */}
      <View className="nt-tabs">
        {([
          { key: 'system' as NotifyTab, label: '系统通知' },
          { key: 'mentions' as NotifyTab, label: '@ 我的' },
          { key: 'comments' as NotifyTab, label: '我的评论' },
        ]).map(tab => (
          <View
            key={tab.key}
            className={`nt-tab ${notifyTab === tab.key ? 'active' : ''}`}
            onClick={() => onNotifyTabChange(tab.key)}
          >
            <Text>{tab.label}</Text>
            {notifyTab === tab.key && <View className="nt-tab-line" />}
          </View>
        ))}
      </View>

      {/* 批量操作栏 */}
      <View className="nt-toolbar">
        <View className="nt-toolbar-right" onClick={handleClearAll}>
          <Text className="nt-toolbar-icon">◎</Text>
          <Text className="nt-toolbar-text">批量删除</Text>
        </View>
      </View>

      {/* 内容区 */}
      {loading ? (
        <View className="nt-loading"><Text>加载中...</Text></View>
      ) : (
        <>
          {notifyTab === 'system' && renderSystemTab()}
          {notifyTab === 'mentions' && renderMentionsTab()}
          {notifyTab === 'comments' && renderCommentsTab()}
        </>
      )}
    </View>
  )
}

export default NotificationsTab
