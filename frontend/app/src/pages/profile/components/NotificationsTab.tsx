/**
 * 通知Tab组件 — 完全对标设计稿
 * 三个子Tab: 系统通知 | @我的 | 我的评论
 * 功能: 左滑删除、批量删除、全部已读、底部弹窗、互动打通
 * 重构时间: 2026年2月27日
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Notification, NotifyTab, MentionItem, MyCommentItem } from '../types'
import {
  fetchMyNotifications,
  fetchMyMentions,
  fetchMyCommentsList,
  clearAllNotifications,
  deleteNotification,
  batchDeleteNotifications,
  markAllNotificationsRead,
} from '../../../services/notifications'
import { deleteComment } from '../../../services/comments'
import {
  likeActivity, unlikeActivity,
  favoriteActivity, unfavoriteActivity,
  shareActivity,
} from '../../../services/engagement'

interface NotificationsTabProps {
  notifications: Notification[]
  notifyTab: NotifyTab
  onNotifyTabChange: (tab: NotifyTab) => void
  onDeleteNotification: (id: number) => void
  onModalVisibleChange?: (visible: boolean) => void
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications: initialNotifications,
  notifyTab,
  onNotifyTabChange,
  onDeleteNotification,
  onModalVisibleChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [mentions, setMentions] = useState<MentionItem[]>([])
  const [myComments, setMyComments] = useState<MyCommentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 滑动删除
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // 批量删除
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // 底部弹窗
  const [showBottomSheet, setShowBottomSheet] = useState(false)

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
    setBatchMode(false)
    setSelectedIds(new Set())
    setSwipedId(null)
  }, [notifyTab])

  const setModalVisible = useCallback((visible: boolean) => {
    onModalVisibleChange?.(visible)
  }, [onModalVisibleChange])

  // ========== 底部弹窗: 清空消息 ==========
  const handleShowClearSheet = useCallback(() => {
    setShowBottomSheet(true)
    setModalVisible(true)
  }, [setModalVisible])

  const handleConfirmClear = useCallback(async () => {
    try {
      await clearAllNotifications()
      setNotifications([])
      setShowBottomSheet(false)
      setModalVisible(false)
      Taro.showToast({ title: '已清空', icon: 'success' })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [setModalVisible])

  // ========== 全部已读 ==========
  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_new: false })))
      Taro.showToast({ title: '已全部标为已读', icon: 'success' })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [])

  // ========== 滑动删除 ==========
  const handleTouchStart = useCallback((e: any) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: any, id: number) => {
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -40) {
        setSwipedId(id)
      } else if (deltaX > 20) {
        setSwipedId(null)
      }
    }
  }, [])

  const handleSwipeDelete = useCallback(async (id: number) => {
    try {
      await deleteNotification(id)
      onDeleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setSwipedId(null)
      Taro.showToast({ title: '已删除', icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }, [onDeleteNotification])

  // ========== 批量删除 ==========
  const toggleBatchMode = useCallback(() => {
    setBatchMode(prev => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
    setSwipedId(null)
  }, [])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    try {
      const ids = Array.from(selectedIds)
      await batchDeleteNotifications(ids)
      ids.forEach(id => onDeleteNotification(id))
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)))
      setSelectedIds(new Set())
      setBatchMode(false)
      Taro.showToast({ title: `已删除 ${ids.length} 条`, icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }, [selectedIds, onDeleteNotification])

  // ========== 我的评论: 删除评论 ==========
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const handleDeleteComment = useCallback((commentId: number) => {
    setPendingDeleteId(commentId)
    setShowDeleteSheet(true)
    setModalVisible(true)
  }, [setModalVisible])

  const handleConfirmDeleteComment = useCallback(async () => {
    if (!pendingDeleteId) return
    try {
      await deleteComment(pendingDeleteId)
      setMyComments(prev => prev.filter(c => c.id !== pendingDeleteId))
      setShowDeleteSheet(false)
      setPendingDeleteId(null)
      setModalVisible(false)
      Taro.showToast({ title: '已删除', icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }, [pendingDeleteId, setModalVisible])

  // ========== 我的评论: 修改 ==========
  const handleEditComment = useCallback((commentId: number, activityId: number) => {
    Taro.navigateTo({ url: `/pages/comment/index?id=${activityId}&editCommentId=${commentId}` })
  }, [])

  // ========== 我的评论: 互动操作 ==========
  const handleToggleLike = useCallback(async (item: MyCommentItem) => {
    try {
      if (item.is_liked) {
        await unlikeActivity(item.activity_id)
      } else {
        await likeActivity(item.activity_id)
      }
      setMyComments(prev => prev.map(c =>
        c.id === item.id
          ? {
              ...c,
              is_liked: !c.is_liked,
              stats: { ...c.stats, likes: c.stats.likes + (c.is_liked ? -1 : 1) },
            }
          : c
      ))
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [])

  const handleToggleFavorite = useCallback(async (item: MyCommentItem) => {
    try {
      if (item.is_favorited) {
        await unfavoriteActivity(item.activity_id)
      } else {
        await favoriteActivity(item.activity_id)
      }
      setMyComments(prev => prev.map(c =>
        c.id === item.id
          ? {
              ...c,
              is_favorited: !c.is_favorited,
              stats: { ...c.stats, favorites: c.stats.favorites + (c.is_favorited ? -1 : 1) },
            }
          : c
      ))
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [])

  const handleShare = useCallback(async (item: MyCommentItem) => {
    try {
      await shareActivity(item.activity_id)
      setMyComments(prev => prev.map(c =>
        c.id === item.id
          ? { ...c, stats: { ...c.stats, shares: c.stats.shares + 1 } }
          : c
      ))
      Taro.showToast({ title: '分享成功', icon: 'success' })
    } catch {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }, [])

  const handleGoComment = useCallback((activityId: number) => {
    Taro.navigateTo({ url: `/pages/comment/index?id=${activityId}` })
  }, [])

  // ========== @我的: 回复 ==========
  const handleReply = useCallback((mention: MentionItem) => {
    if (mention.activity_id) {
      Taro.navigateTo({ url: `/pages/comment/index?id=${mention.activity_id}` })
    }
  }, [])

  // ========== 分页 ==========
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
          <View
            key={notify.id}
            className={`nt-card ${swipedId === notify.id ? 'swiped' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e, notify.id)}
          >
            <View className="nt-card-body">
              {batchMode && (
                <View
                  className={`nt-checkbox ${selectedIds.has(notify.id) ? 'checked' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleSelect(notify.id) }}
                >
                  {selectedIds.has(notify.id) && <Text className="nt-check-mark">✓</Text>}
                </View>
              )}
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
            <View className="nt-delete-area" onClick={() => handleSwipeDelete(notify.id)}>
              <View className="nt-delete-icon-wrap">
                <View className="nt-trash-lid" />
                <View className="nt-trash-body" />
              </View>
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
              <View className="nt-stat-item" onClick={() => handleToggleLike(item)}>
                <Text className={`nt-stat-icon nt-stat-like ${item.is_liked ? 'active' : ''}`}>♥</Text>
                <Text className={`nt-stat-val ${item.is_liked ? 'nt-stat-val-active' : ''}`}>{item.stats.likes} 点赞</Text>
              </View>
              <View className="nt-stat-item" onClick={() => handleGoComment(item.activity_id)}>
                <Text className="nt-stat-icon nt-stat-comment">◎</Text>
                <Text className="nt-stat-val">{item.stats.comments} 评论</Text>
              </View>
              <View className="nt-stat-item" onClick={() => handleToggleFavorite(item)}>
                <Text className={`nt-stat-icon nt-stat-fav ${item.is_favorited ? 'active' : ''}`}>✦</Text>
                <Text className={`nt-stat-val ${item.is_favorited ? 'nt-stat-val-active' : ''}`}>{item.stats.favorites} 收藏</Text>
              </View>
              <View className="nt-stat-item" onClick={() => handleShare(item)}>
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

  // ========== 底部弹窗组件 ==========
  const renderBottomSheet = (
    visible: boolean,
    title: string,
    desc: string,
    onCancel: () => void,
    onConfirm: () => void,
  ) => {
    if (!visible) return null
    return (
      <View className="nt-bottom-sheet-mask" onClick={onCancel}>
        <View className="nt-bottom-sheet" onClick={e => e.stopPropagation()}>
          <Text className="nt-bs-title">{title}</Text>
          <Text className="nt-bs-desc">{desc}</Text>
          <View className="nt-bs-actions">
            <View className="nt-bs-btn nt-bs-cancel" onClick={onCancel}>
              <Text>取消</Text>
            </View>
            <View className="nt-bs-btn nt-bs-confirm" onClick={onConfirm}>
              <Text>确定</Text>
            </View>
          </View>
        </View>
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

      {/* 工具栏 — 右侧3个纯图标按钮 */}
      <View className="nt-toolbar">
        <View className="nt-toolbar-right">
          {batchMode ? (
            <>
              <View className="nt-batch-cancel" onClick={toggleBatchMode}>
                <Text>取消</Text>
              </View>
              <Text className="nt-batch-count">已选 {selectedIds.size} 项</Text>
              <View
                className={`nt-batch-delete-btn ${selectedIds.size === 0 ? 'disabled' : ''}`}
                onClick={handleBatchDelete}
              >
                <Text>删除</Text>
              </View>
            </>
          ) : (
            <>
              <View className="nt-toolbar-icon-btn" onClick={handleMarkAllRead}>
                <Text className="nt-icon-read">⊘</Text>
              </View>
              <View className="nt-toolbar-icon-btn" onClick={toggleBatchMode}>
                <Text className="nt-icon-batch">☰</Text>
              </View>
              <View className="nt-toolbar-icon-btn" onClick={handleShowClearSheet}>
                <Text className="nt-icon-clear">⌫</Text>
              </View>
            </>
          )}
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

      {/* 底部弹窗: 清空消息 */}
      {renderBottomSheet(
        showBottomSheet,
        '清空消息提醒',
        '确定要清空全部消息提醒吗？',
        () => { setShowBottomSheet(false); setModalVisible(false) },
        handleConfirmClear,
      )}

      {/* 底部弹窗: 删除评论 */}
      {renderBottomSheet(
        showDeleteSheet,
        '删除评论',
        '确定要删除这条评论吗？',
        () => { setShowDeleteSheet(false); setPendingDeleteId(null); setModalVisible(false) },
        handleConfirmDeleteComment,
      )}
    </View>
  )
}

export default NotificationsTab
