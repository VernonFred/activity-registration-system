/**
 * 通知Tab组件 — 完全对标设计稿
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { BottomSheetConfig, MentionItem, MyCommentItem, Notification, NotifyTab } from '../types'
import { batchDeleteNotifications, clearAllNotifications, deleteNotification, fetchMyCommentsList, fetchMyMentions, fetchMyNotifications, markAllNotificationsRead } from '../../../services/notifications'
import { deleteComment } from '../../../services/comments'
import { favoriteActivity, likeActivity, shareActivity, unfavoriteActivity, unlikeActivity } from '../../../services/engagement'
import MentionsPane from './notifications/MentionsPane'
import MyCommentsPane from './notifications/MyCommentsPane'
import NotificationsToolbar from './notifications/NotificationsToolbar'
import SystemNotificationsPane from './notifications/SystemNotificationsPane'

interface NotificationsTabProps {
  notifications: Notification[]
  notifyTab: NotifyTab
  onNotifyTabChange: (tab: NotifyTab) => void
  onDeleteNotification: (id: number) => void
  onRequestSheet?: (config: BottomSheetConfig | null) => void
}

const pageSize = 10

const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications: initialNotifications, notifyTab, onNotifyTabChange, onDeleteNotification, onRequestSheet }) => {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [mentions, setMentions] = useState<MentionItem[]>([])
  const [myComments, setMyComments] = useState<MyCommentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => setNotifications(initialNotifications), [initialNotifications])

  useEffect(() => {
    const loadTabData = async () => {
      setLoading(true)
      try {
        if (notifyTab === 'system') setNotifications(await fetchMyNotifications())
        if (notifyTab === 'mentions') setMentions(await fetchMyMentions())
        if (notifyTab === 'comments') setMyComments(await fetchMyCommentsList())
      } catch (error) {
        console.error('加载通知数据失败:', error)
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

  const getCurrentPageItems = <T,>(items: T[]) => items.slice((page - 1) * pageSize, page * pageSize)
  const getTotalPages = (total: number) => Math.max(1, Math.ceil(total / pageSize))

  const handleShowClearSheet = useCallback(() => {
    onRequestSheet?.({
      title: t('profile.clearNotice'),
      desc: t('profile.clearNoticeConfirm'),
      onConfirm: async () => {
        try {
          await clearAllNotifications()
          setNotifications([])
          onRequestSheet?.(null)
          Taro.showToast({ title: t('profile.cleared'), icon: 'success' })
        } catch {
          Taro.showToast({ title: t('common.failed'), icon: 'none' })
        }
      },
    })
  }, [onRequestSheet, t])

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, is_new: false })))
      Taro.showToast({ title: t('profile.allRead'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('common.failed'), icon: 'none' })
    }
  }, [t])

  const handleTouchStart = useCallback((e: any) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: any, id: number) => {
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > Math.abs(deltaY)) setSwipedId(deltaX < -40 ? id : deltaX > 20 ? null : swipedId)
  }, [swipedId])

  const handleSwipeDelete = useCallback(async (id: number) => {
    try {
      await deleteNotification(id)
      onDeleteNotification(id)
      setNotifications((prev) => prev.filter((item) => item.id !== id))
      setSwipedId(null)
      Taro.showToast({ title: t('common.deleted'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('profile.deleteFailed'), icon: 'none' })
    }
  }, [onDeleteNotification, t])

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => { if (prev) setSelectedIds(new Set()); return !prev })
    setSwipedId(null)
  }, [])
  const toggleSelect = useCallback((id: number) => setSelectedIds((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  }), [])

  const handleBatchDelete = useCallback(async () => {
    if (!selectedIds.size) return
    try {
      const ids = Array.from(selectedIds)
      await batchDeleteNotifications(ids)
      ids.forEach((id) => onDeleteNotification(id))
      setNotifications((prev) => prev.filter((item) => !selectedIds.has(item.id)))
      setSelectedIds(new Set())
      setBatchMode(false)
      Taro.showToast({ title: t('profile.deletedCount', { count: ids.length }), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('profile.deleteFailed'), icon: 'none' })
    }
  }, [selectedIds, onDeleteNotification, t])

  const handleDeleteComment = useCallback((commentId: number) => {
    onRequestSheet?.({
      title: t('profile.deleteComment'),
      desc: t('profile.deleteCommentConfirm'),
      onConfirm: async () => {
        try {
          await deleteComment(commentId)
          setMyComments((prev) => prev.filter((item) => item.id !== commentId))
          onRequestSheet?.(null)
          Taro.showToast({ title: t('common.deleted'), icon: 'success' })
        } catch {
          Taro.showToast({ title: t('profile.deleteFailed'), icon: 'none' })
        }
      },
    })
  }, [onRequestSheet, t])

  const handleToggleLike = useCallback(async (item: MyCommentItem) => {
    try {
      await (item.is_liked ? unlikeActivity(item.activity_id) : likeActivity(item.activity_id))
      setMyComments((prev) => prev.map((comment) => comment.id === item.id ? { ...comment, is_liked: !comment.is_liked, stats: { ...comment.stats, likes: comment.stats.likes + (comment.is_liked ? -1 : 1) } } : comment))
    } catch {
      Taro.showToast({ title: t('common.failed'), icon: 'none' })
    }
  }, [t])

  const handleToggleFavorite = useCallback(async (item: MyCommentItem) => {
    try {
      await (item.is_favorited ? unfavoriteActivity(item.activity_id) : favoriteActivity(item.activity_id))
      setMyComments((prev) => prev.map((comment) => comment.id === item.id ? { ...comment, is_favorited: !comment.is_favorited, stats: { ...comment.stats, favorites: comment.stats.favorites + (comment.is_favorited ? -1 : 1) } } : comment))
    } catch {
      Taro.showToast({ title: t('common.failed'), icon: 'none' })
    }
  }, [t])

  const handleShare = useCallback(async (item: MyCommentItem) => {
    try {
      await shareActivity(item.activity_id)
      setMyComments((prev) => prev.map((comment) => comment.id === item.id ? { ...comment, stats: { ...comment.stats, shares: comment.stats.shares + 1 } } : comment))
      Taro.showToast({ title: t('profile.shareSuccess'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('profile.shareFailed'), icon: 'none' })
    }
  }, [t])

  return (
    <View className="tab-content notifications-tab animate-fade-in" onClick={() => setActiveMenu(null)}>
      <View className="nt-tabs">
        {([
          { key: 'system' as NotifyTab, label: t('profile.tabSystemNotice') },
          { key: 'mentions' as NotifyTab, label: t('profile.tabMentions') },
          { key: 'comments' as NotifyTab, label: t('profile.tabMyComments') },
        ]).map((tab) => (
          <View key={tab.key} className={`nt-tab ${notifyTab === tab.key ? 'active' : ''}`} onClick={() => onNotifyTabChange(tab.key)}>
            <Text>{tab.label}</Text>
            {notifyTab === tab.key && <View className="nt-tab-line" />}
          </View>
        ))}
      </View>

      {notifyTab === 'system' && (
        <NotificationsToolbar
          batchMode={batchMode}
          selectedCount={selectedIds.size}
          onCancelBatch={toggleBatchMode}
          onBatchDelete={handleBatchDelete}
          onMarkAllRead={handleMarkAllRead}
          onToggleBatchMode={toggleBatchMode}
          onClearAll={handleShowClearSheet}
        />
      )}

      {loading ? (
        <View className="nt-loading"><Text>{t('common.loading')}</Text></View>
      ) : notifyTab === 'system' ? (
        <SystemNotificationsPane
          items={getCurrentPageItems(notifications)}
          loading={loading}
          batchMode={batchMode}
          selectedIds={selectedIds}
          swipedId={swipedId}
          page={page}
          totalPages={getTotalPages(notifications.length)}
          onPageChange={setPage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onToggleSelect={toggleSelect}
          onOpenAction={(url) => Taro.navigateTo({ url })}
          onDelete={handleSwipeDelete}
        />
      ) : notifyTab === 'mentions' ? (
        <MentionsPane
          items={getCurrentPageItems(mentions)}
          loading={loading}
          page={page}
          totalPages={getTotalPages(mentions.length)}
          onPageChange={setPage}
          onReply={(mention) => mention.activity_id && Taro.navigateTo({ url: `/pages/comment/index?id=${mention.activity_id}` })}
        />
      ) : (
        <MyCommentsPane
          items={getCurrentPageItems(myComments)}
          loading={loading}
          page={page}
          totalPages={getTotalPages(myComments.length)}
          activeMenu={activeMenu}
          onPageChange={setPage}
          onLike={handleToggleLike}
          onComment={(activityId) => Taro.navigateTo({ url: `/pages/comment/index?id=${activityId}` })}
          onFavorite={handleToggleFavorite}
          onShare={handleShare}
          onToggleMenu={(id) => setActiveMenu((prev) => prev === id ? null : id)}
          onEdit={(commentId, activityId) => { setActiveMenu(null); Taro.navigateTo({ url: `/pages/comment/index?id=${activityId}&editCommentId=${commentId}` }) }}
          onDelete={(commentId) => { setActiveMenu(null); handleDeleteComment(commentId) }}
          onOpenActivity={(activityId) => Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` })}
        />
      )}
    </View>
  )
}

export default NotificationsTab
