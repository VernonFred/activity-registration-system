/**
 * 个人中心页面
 * 重构时间: 2025年12月9日
 */
import { useState, useEffect, useCallback } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import { useTheme } from '../../context/ThemeContext'
import {
  ProfileHeader,
  ActivitiesTab,
  BadgesTab,
  NotificationsTab,
  SettingsTab,
} from './components'
import { getBadgeVisual } from './components/BadgesTab'
import type { BottomSheetConfig } from './components/NotificationsTab'
import type { ProfileTab, NotifyTab, UserInfo, SignupRecord, Notification, Badge } from './types'
import { mockUserData, mockSignups, mockNotifications, mockBadges } from './mockData'
import {
  fetchCurrentUser,
  fetchMySignups,
  cancelSignup as cancelSignupApi,
  type User as ApiUser,
  type SignupRecord as ApiSignupRecord,
} from '../../services/user'
import {
  fetchEngagementData,
  likeActivity,
  unlikeActivity,
  favoriteActivity,
  unfavoriteActivity,
  shareActivity,
} from '../../services/engagement'
import { fetchComments as fetchCommentsApi } from '../../services/comments'
import { getMockCheckinOverrides } from '../../services/checkins'
import './index.scss'

// Tab 配置
const TABS: { key: ProfileTab; icon: string; activeIcon: string }[] = [
  { key: 'activities', icon: '📅', activeIcon: '📅' },
  { key: 'badges', icon: '🏆', activeIcon: '🏆' },
  { key: 'notifications', icon: '🔔', activeIcon: '🔔' },
  { key: 'settings', icon: '⚙️', activeIcon: '⚙️' },
]

const FALLBACK_ACTIVITY_DESC = 'It looks great I think it will really make it easier to work with illustrations.'

function mapApiUserToProfile(user: ApiUser): UserInfo {
  return {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar,
    organization: [user.school, user.department].filter(Boolean).join(''),
    title: user.position,
    bio: '这个用户很懒，还没填写个人简介',
  }
}

function mapCheckinStatus(value: unknown): SignupRecord['checkin_status'] {
  if (value === 'checked_in') return 'checked_in'
  if (value === 'no_show') return 'no_show'
  return 'not_checked_in'
}

function mapPaymentStatus(signup: ApiSignupRecord): SignupRecord['payment_status'] {
  if (signup.status !== 'approved') return 'unpaid'
  if (signup.payment) return 'paid'
  return 'unpaid'
}

function mapCompanions(signup: ApiSignupRecord): SignupRecord['companions'] {
  if (!Array.isArray(signup.companions) || signup.companions.length === 0) return []
  return signup.companions.map((companion: any, index) => ({
    id: Number(companion?.id || `${signup.id}${index + 1}`),
    name: companion?.personal?.name || companion?.name || `同行人员${index + 1}`,
  }))
}

function mapApiSignupToProfile(signup: ApiSignupRecord): SignupRecord {
  const start = signup.activity?.start_time || signup.created_at
  const end = signup.activity?.end_time
  const city = signup.activity?.location_city
  const place = signup.activity?.location_name
  const location = [city, place].filter(Boolean).join(' | ')
  const transport = (signup as any).transport || {}
  const transportCompleted = Boolean(
    transport?.arrival_time ||
    transport?.flight_train_number ||
    transport?.return_time ||
    transport?.return_flight_train_number
  )

  return {
    id: signup.id,
    activity_id: signup.activity?.id || 0,
    activity_title: signup.activity?.title || '未命名活动',
    activity_desc: location || FALLBACK_ACTIVITY_DESC,
    activity_date: start,
    activity_end_date: end,
    activity_location: location,
    status: signup.status,
    checkin_status: mapCheckinStatus((signup as any).checkin_status),
    payment_status: mapPaymentStatus(signup),
    transport_completed: transportCompleted,
    likes: 0,
    comments: 0,
    favorites: 0,
    shares: 0,
    companions: mapCompanions(signup),
  }
}

function applyCheckinOverridesToSignups(items: SignupRecord[]): SignupRecord[] {
  const overrides = getMockCheckinOverrides()
  if (!Object.keys(overrides).length) return items

  return items.map((item) => {
    const override = overrides[String(item.id)]
    if (!override) return item
    return {
      ...item,
      checkin_status: override.checkin_status,
    }
  })
}

export default function Profile() {
  const { theme } = useTheme()

  const [activeTab, setActiveTab] = useState<ProfileTab>('activities')
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [signups, setSignups] = useState<SignupRecord[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [notifyTab, setNotifyTab] = useState<NotifyTab>('system')
  const [expandedSignup, setExpandedSignup] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [navSafeHeight, setNavSafeHeight] = useState(52)
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig | null>(null)

  const applyFallbackData = useCallback(() => {
    setUser(mockUserData)
    setSignups(applyCheckinOverridesToSignups(mockSignups))
    setNotifications(mockNotifications)
    setBadges(mockBadges)
  }, [])

  const loadProfileData = useCallback(async () => {
    setLoading(true)

    try {
      const menuButton = Taro.getMenuButtonBoundingClientRect()
      setNavSafeHeight(Math.max(menuButton.bottom + 10, 52))
    } catch {
      const sysInfo = Taro.getSystemInfoSync()
      setNavSafeHeight((sysInfo.statusBarHeight || 44) + 10)
    }

    try {
      const [apiUser, signupResp] = await Promise.all([
        fetchCurrentUser(),
        fetchMySignups({ status: 'all', page: 1, per_page: 20 }),
      ])

      const baseSignups = (signupResp?.items || []).map(mapApiSignupToProfile)

      const withEngagement = await Promise.all(
        baseSignups.map(async (signup) => {
          try {
            if (!signup.activity_id) return signup
            const [engagement, commentsResp] = await Promise.all([
              fetchEngagementData(signup.activity_id).catch(() => null),
              fetchCommentsApi(signup.activity_id, { page: 1, per_page: 100, sort_by: 'newest' }).catch(() => null),
            ])

            const commentItems = commentsResp?.items || []
            return {
              ...signup,
              likes: engagement?.like_count ?? signup.likes,
              favorites: engagement?.favorite_count ?? signup.favorites,
              shares: engagement?.share_count ?? signup.shares,
              is_liked: engagement?.is_liked ?? signup.is_liked,
              is_favorited: engagement?.is_favorited ?? signup.is_favorited,
              comments: commentsResp?.total ?? commentItems.length ?? signup.comments,
              is_commented: commentItems.some((item: any) => item?.user?.id === apiUser.id),
            }
          } catch {
            return signup
          }
        })
      )

      setUser(mapApiUserToProfile(apiUser))
      setSignups(applyCheckinOverridesToSignups(withEngagement.length > 0 ? withEngagement : mockSignups))
      setNotifications(mockNotifications)
      setBadges(mockBadges)
    } catch (error) {
      console.error('加载个人中心数据失败，使用本地数据回退:', error)
      applyFallbackData()
    } finally {
      setLoading(false)
    }
  }, [applyFallbackData])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  useDidShow(() => {
    if (!loading) {
      loadProfileData()
    }
  })

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab)
  }, [])

  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorage()
          Taro.reLaunch({ url: '/pages/index/index' })
        }
      },
    })
  }, [])

  const toggleSignupExpand = useCallback((id: number) => {
    setExpandedSignup((prev) => (prev === id ? null : id))
  }, [])

  const getSignupById = useCallback((signupId: number) => {
    return signups.find((item) => item.id === signupId) || null
  }, [signups])

  const navigateToSignupPage = useCallback((signupId: number, mode: string) => {
    const signup = getSignupById(signupId)
    if (!signup?.activity_id) {
      Taro.showToast({ title: '活动信息不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/signup/index?activityId=${signup.activity_id}&signupId=${signup.id}&mode=${mode}`,
    })
  }, [getSignupById])

  const handleViewActivity = useCallback((activityId: number) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` })
  }, [])

  const handleEditSignup = useCallback((signupId: number) => {
    navigateToSignupPage(signupId, 'edit')
  }, [navigateToSignupPage])

  const handleEditTransport = useCallback((signupId: number) => {
    navigateToSignupPage(signupId, 'transport')
  }, [navigateToSignupPage])

  const handleCancelSignup = useCallback((signupId: number) => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await cancelSignupApi(signupId)
          setSignups((prev) => prev.filter((item) => item.id !== signupId))
          setExpandedSignup((prev) => (prev === signupId ? null : prev))
          Taro.showToast({ title: '已取消报名', icon: 'success' })
        } catch (error) {
          console.error('取消报名失败:', error)
          Taro.showToast({ title: '取消报名失败', icon: 'none' })
        }
      },
    })
  }, [])

  const handleAddCompanion = useCallback((signupId: number) => {
    navigateToSignupPage(signupId, 'companion')
  }, [navigateToSignupPage])

  const handlePayment = useCallback((signupId: number) => {
    navigateToSignupPage(signupId, 'payment')
  }, [navigateToSignupPage])

  const handleCheckin = useCallback((signupId: number) => {
    const signup = getSignupById(signupId)
    if (!signup?.activity_id) {
      Taro.showToast({ title: '签到信息不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/checkin/index?signupId=${signup.id}&activityId=${signup.activity_id}`,
    })
  }, [getSignupById])

  const handleViewCredential = useCallback((signupId: number) => {
    const signup = getSignupById(signupId)
    if (!signup?.activity_id) {
      Taro.showToast({ title: '凭证信息不存在', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/credential/index?signupId=${signup.id}&activityId=${signup.activity_id}`,
    })
  }, [getSignupById])

  const updateSignupByActivityId = useCallback((
    activityId: number,
    updater: (current: SignupRecord) => SignupRecord
  ) => {
    setSignups((prev) => prev.map((item) => (item.activity_id === activityId ? updater(item) : item)))
  }, [])

  const handleLikeActivity = useCallback(async (signup: SignupRecord) => {
    const nextLiked = !signup.is_liked
    updateSignupByActivityId(signup.activity_id, (item) => ({
      ...item,
      is_liked: nextLiked,
      likes: Math.max(0, item.likes + (nextLiked ? 1 : -1)),
    }))

    try {
      if (nextLiked) {
        const data = await likeActivity(signup.activity_id)
        updateSignupByActivityId(signup.activity_id, (item) => ({
          ...item,
          is_liked: data.is_liked,
          likes: data.like_count,
          favorites: data.favorite_count ?? item.favorites,
          shares: data.share_count ?? item.shares,
        }))
      } else {
        const data = await unlikeActivity(signup.activity_id)
        updateSignupByActivityId(signup.activity_id, (item) => ({
          ...item,
          is_liked: data.is_liked,
          likes: data.like_count,
          favorites: data.favorite_count ?? item.favorites,
          shares: data.share_count ?? item.shares,
        }))
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      updateSignupByActivityId(signup.activity_id, (item) => ({
        ...item,
        is_liked: signup.is_liked,
        likes: signup.likes,
      }))
    }
  }, [updateSignupByActivityId])

  const handleFavoriteActivity = useCallback(async (signup: SignupRecord) => {
    const nextFavorited = !signup.is_favorited
    updateSignupByActivityId(signup.activity_id, (item) => ({
      ...item,
      is_favorited: nextFavorited,
      favorites: Math.max(0, item.favorites + (nextFavorited ? 1 : -1)),
    }))

    try {
      if (nextFavorited) {
        const data = await favoriteActivity(signup.activity_id)
        updateSignupByActivityId(signup.activity_id, (item) => ({
          ...item,
          is_favorited: data.is_favorited,
          favorites: data.favorite_count,
          likes: data.like_count ?? item.likes,
          shares: data.share_count ?? item.shares,
        }))
      } else {
        const data = await unfavoriteActivity(signup.activity_id)
        updateSignupByActivityId(signup.activity_id, (item) => ({
          ...item,
          is_favorited: data.is_favorited,
          favorites: data.favorite_count,
          likes: data.like_count ?? item.likes,
          shares: data.share_count ?? item.shares,
        }))
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      updateSignupByActivityId(signup.activity_id, (item) => ({
        ...item,
        is_favorited: signup.is_favorited,
        favorites: signup.favorites,
      }))
    }
  }, [updateSignupByActivityId])

  const handleCommentActivity = useCallback((signup: SignupRecord) => {
    Taro.navigateTo({ url: `/pages/comment/index?id=${signup.activity_id}` })
  }, [])

  const handleShareActivity = useCallback(async (signup: SignupRecord) => {
    try {
      await Taro.setClipboardData({
        data: `pages/activity-detail/index?id=${signup.activity_id}`,
      })
      const data = await shareActivity(signup.activity_id, 'link')
      updateSignupByActivityId(signup.activity_id, (item) => ({
        ...item,
        shares: data.share_count,
        likes: data.like_count ?? item.likes,
        favorites: data.favorite_count ?? item.favorites,
      }))
      Taro.showToast({ title: '链接已复制', icon: 'success' })
    } catch (error) {
      console.error('分享记录失败:', error)
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }, [updateSignupByActivityId])

  const handleDeleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    Taro.showToast({ title: '已删除', icon: 'none' })
  }, [])

  const handleSettingClick = useCallback((setting: string) => {
    const messages: Record<string, string> = {
      profile: '个人简介',
      payment: '我的缴费',
      invoice: '发票抬头',
      language: '多语言',
      darkmode: '暗黑模式',
      privacy: '隐私与政策',
      help: '支持与帮助',
    }
    Taro.showToast({ title: messages[setting] || setting, icon: 'none' })
  }, [])

  if (loading) {
    return (
      <View className={`profile-page theme-${theme} loading`}>
        <View className="profile-nav-safe-space" style={{ height: `${navSafeHeight}px` }} />
        <View className="skeleton-header" />
        <View className="skeleton-tabs" />
        <View className="skeleton-content" />
      </View>
    )
  }

  return (
    <View className={`profile-page theme-${theme}`}>
      <View className="profile-nav-safe-space" style={{ height: `${navSafeHeight}px` }} />
      <ProfileHeader
        user={user}
        activeTab={activeTab}
        tabs={TABS}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onEditProfile={() => handleSettingClick('profile')}
      />

      <ScrollView className="content-area profile-content-scroll" scrollY>
        {activeTab === 'activities' && (
          <ActivitiesTab
            signups={signups}
            user={user}
            expandedSignup={expandedSignup}
            onToggleExpand={toggleSignupExpand}
            onViewActivity={handleViewActivity}
            onEditSignup={handleEditSignup}
            onEditTransport={handleEditTransport}
            onCancelSignup={handleCancelSignup}
            onAddCompanion={handleAddCompanion}
            onViewCredential={handleViewCredential}
            onCheckin={handleCheckin}
            onPayment={handlePayment}
            onLikeActivity={handleLikeActivity}
            onCommentActivity={handleCommentActivity}
            onFavoriteActivity={handleFavoriteActivity}
            onShareActivity={handleShareActivity}
          />
        )}

        {activeTab === 'badges' && <BadgesTab badges={badges} user={user} onBadgeSelect={setSelectedBadge} />}

        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            notifyTab={notifyTab}
            onNotifyTabChange={setNotifyTab}
            onDeleteNotification={handleDeleteNotification}
            onRequestSheet={setSheetConfig}
          />
        )}

        {activeTab === 'settings' && <SettingsTab onSettingClick={handleSettingClick} />}
      </ScrollView>

      {!selectedBadge && !sheetConfig && <CustomTabBar current={2} />}

      {/* 底部弹窗 — 页面顶层渲染（全屏高斯模糊） */}
      {sheetConfig && (
        <View className="nt-bottom-sheet-mask" onClick={() => setSheetConfig(null)}>
          <View className="nt-bottom-sheet" onClick={e => e.stopPropagation()}>
            <Text className="nt-bs-title">{sheetConfig.title}</Text>
            <Text className="nt-bs-desc">{sheetConfig.desc}</Text>
            <View className="nt-bs-actions">
              <View className="nt-bs-btn nt-bs-cancel" onClick={() => setSheetConfig(null)}>
                <Text>取消</Text>
              </View>
              <View className="nt-bs-btn nt-bs-confirm" onClick={sheetConfig.onConfirm}>
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 徽章详情弹窗 — 页面顶层渲染 */}
      {selectedBadge && (() => {
        const v = getBadgeVisual(selectedBadge.name)
        return (
          <View className="badge-modal-mask" onClick={() => setSelectedBadge(null)}>
            <View className="badge-modal-content" onClick={(e) => e.stopPropagation()}>
              <View className="badge-modal-badge-wrap">
                <View className="badge-modal-glow" style={{ background: v.glow }} />
                <View
                  className="css-badge css-badge--lg"
                  style={{ background: v.gradient, boxShadow: `0 8px 40px ${v.glow}` }}
                >
                  <View className="css-badge__ring" />
                  <View className="css-badge__inner-ring" />
                  <View className="css-badge__shine" />
                  <Text className="css-badge__symbol">{v.symbol}</Text>
                </View>
              </View>
              <Text className="badge-modal-name">{selectedBadge.name}</Text>
              {selectedBadge.slogan && (
                <Text className="badge-modal-slogan">「{selectedBadge.slogan}」</Text>
              )}
              {selectedBadge.earned_at && (
                <Text className="badge-modal-date">{selectedBadge.earned_at} 获得</Text>
              )}
            </View>
            <View className="badge-modal-close" onClick={() => setSelectedBadge(null)}>
              <Text>×</Text>
            </View>
          </View>
        )
      })()}
    </View>
  )
}
