import { useCallback, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import i18n from '../../../i18n'
import { getMockCheckinOverrides } from '../../../services/checkins'
import { fetchComments as fetchCommentsApi } from '../../../services/comments'
import { favoriteActivity, fetchEngagementData, likeActivity, shareActivity, unfavoriteActivity, unlikeActivity } from '../../../services/engagement'
import { cancelSignup as cancelSignupApi, fetchCurrentUser, fetchMySignups, type SignupRecord as ApiSignupRecord, type User as ApiUser } from '../../../services/user'
import { mockBadges, mockNotifications, mockSignups, mockUserData } from '../mockData'
import type { Badge, BottomSheetConfig, Notification, NotifyTab, ProfileTab, SignupRecord, UserInfo } from '../types'

const FALLBACK_ACTIVITY_DESC = 'It looks great I think it will really make it easier to work with illustrations.'

function mapApiUserToProfile(user: ApiUser): UserInfo {
  return {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar,
    organization: [user.school, user.department].filter(Boolean).join(''),
    title: user.position,
    bio: i18n.t('profile.defaultBio'),
  }
}

const mapCheckinStatus = (value: unknown): SignupRecord['checkin_status'] => value === 'checked_in' ? 'checked_in' : value === 'no_show' ? 'no_show' : 'not_checked_in'
const mapPaymentStatus = (signup: ApiSignupRecord): SignupRecord['payment_status'] => signup.status !== 'approved' ? 'unpaid' : signup.payment ? 'paid' : 'unpaid'
const mapCompanions = (signup: ApiSignupRecord): SignupRecord['companions'] => !Array.isArray(signup.companions) || signup.companions.length === 0 ? [] : signup.companions.map((companion: any, index) => ({
  id: Number(companion?.id || `${signup.id}${index + 1}`),
  name: companion?.personal?.name || companion?.name || i18n.t('profile.companionFallback', { index: index + 1 }),
}))

function mapApiSignupToProfile(signup: ApiSignupRecord): SignupRecord {
  const start = signup.activity?.start_time || signup.created_at
  const end = signup.activity?.end_time
  const city = signup.activity?.location_city
  const place = signup.activity?.location_name
  const location = [city, place].filter(Boolean).join(' | ')
  const transport = (signup as any).transport || {}
  const transportCompleted = Boolean(transport?.arrival_time || transport?.flight_train_number || transport?.return_time || transport?.return_flight_train_number)
  return {
    id: signup.id,
    activity_id: signup.activity?.id || 0,
    activity_title: signup.activity?.title || i18n.t('profile.unnamedActivity'),
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

const applyCheckinOverridesToSignups = (items: SignupRecord[]) => {
  const overrides = getMockCheckinOverrides()
  if (!Object.keys(overrides).length) return items
  return items.map((item) => ({ ...item, checkin_status: overrides[String(item.id)]?.checkin_status || item.checkin_status }))
}

export function useProfilePage(t: (key: string, options?: any) => string) {
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
      const [apiUser, signupResp] = await Promise.all([fetchCurrentUser(), fetchMySignups({ status: 'all', page: 1, per_page: 20 })])
      const baseSignups = (signupResp?.items || []).map(mapApiSignupToProfile)
      const withEngagement = await Promise.all(baseSignups.map(async (signup) => {
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
      }))
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

  useEffect(() => { loadProfileData() }, [loadProfileData])
  useDidShow(() => { if (!loading) loadProfileData() })

  const getSignupById = useCallback((signupId: number) => signups.find((item) => item.id === signupId) || null, [signups])
  const navigateToSignupPage = useCallback((signupId: number, mode: string) => {
    const signup = getSignupById(signupId)
    if (!signup?.activity_id) {
      Taro.showToast({ title: t('profile.activityNotExist'), icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/signup/index?activityId=${signup.activity_id}&signupId=${signup.id}&mode=${mode}` })
  }, [getSignupById, t])
  const updateSignupByActivityId = useCallback((activityId: number, updater: (current: SignupRecord) => SignupRecord) => {
    setSignups((prev) => prev.map((item) => (item.activity_id === activityId ? updater(item) : item)))
  }, [])

  return {
    state: { activeTab, selectedBadge, user, signups, notifications, badges, notifyTab, expandedSignup, loading, navSafeHeight, sheetConfig },
    actions: {
      setActiveTab,
      setSelectedBadge,
      setNotifyTab,
      setExpandedSignup: (id: number) => setExpandedSignup((prev) => prev === id ? null : id),
      setSheetConfig,
      handleLogout: () => Taro.showModal({ title: t('profile.exitConfirmTitle'), content: t('profile.exitConfirmContent'), success: (res) => res.confirm && (Taro.clearStorage(), Taro.reLaunch({ url: '/pages/index/index' })) }),
      handleViewActivity: (activityId: number) => Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` }),
      handleEditSignup: (signupId: number) => navigateToSignupPage(signupId, 'edit'),
      handleEditTransport: (signupId: number) => navigateToSignupPage(signupId, 'transport'),
      handleAddCompanion: (signupId: number) => navigateToSignupPage(signupId, 'companion'),
      handlePayment: (signupId: number) => navigateToSignupPage(signupId, 'payment'),
      handleCheckin: (signupId: number) => {
        const signup = getSignupById(signupId)
        if (!signup?.activity_id) return Taro.showToast({ title: t('profile.checkinNotExist'), icon: 'none' })
        Taro.navigateTo({ url: `/pages/checkin/index?signupId=${signup.id}&activityId=${signup.activity_id}` })
      },
      handleViewCredential: (signupId: number) => {
        const signup = getSignupById(signupId)
        if (!signup?.activity_id) return Taro.showToast({ title: t('profile.credentialNotExist'), icon: 'none' })
        Taro.navigateTo({ url: `/pages/credential/index?signupId=${signup.id}&activityId=${signup.activity_id}` })
      },
      handleCancelSignup: (signupId: number) => Taro.showModal({
        title: t('profile.cancelConfirmTitle'),
        content: t('profile.cancelConfirmContent'),
        success: async (res) => {
          if (!res.confirm) return
          try {
            await cancelSignupApi(signupId)
            setSignups((prev) => prev.filter((item) => item.id !== signupId))
            setExpandedSignup((prev) => prev === signupId ? null : prev)
            Taro.showToast({ title: t('profile.cancelledSignup'), icon: 'success' })
          } catch (error) {
            console.error('取消报名失败:', error)
            Taro.showToast({ title: t('profile.cancelSignupFailed'), icon: 'none' })
          }
        },
      }),
      handleLikeActivity: async (signup: SignupRecord) => {
        const nextLiked = !signup.is_liked
        updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_liked: nextLiked, likes: Math.max(0, item.likes + (nextLiked ? 1 : -1)) }))
        try {
          const data = await (nextLiked ? likeActivity(signup.activity_id) : unlikeActivity(signup.activity_id))
          updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_liked: data.is_liked, likes: data.like_count, favorites: data.favorite_count ?? item.favorites, shares: data.share_count ?? item.shares }))
        } catch (error) {
          console.error('点赞操作失败:', error)
          updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_liked: signup.is_liked, likes: signup.likes }))
        }
      },
      handleFavoriteActivity: async (signup: SignupRecord) => {
        const nextFavorited = !signup.is_favorited
        updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_favorited: nextFavorited, favorites: Math.max(0, item.favorites + (nextFavorited ? 1 : -1)) }))
        try {
          const data = await (nextFavorited ? favoriteActivity(signup.activity_id) : unfavoriteActivity(signup.activity_id))
          updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_favorited: data.is_favorited, favorites: data.favorite_count, likes: data.like_count ?? item.likes, shares: data.share_count ?? item.shares }))
        } catch (error) {
          console.error('收藏操作失败:', error)
          updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, is_favorited: signup.is_favorited, favorites: signup.favorites }))
        }
      },
      handleCommentActivity: (signup: SignupRecord) => Taro.navigateTo({ url: `/pages/comment/index?id=${signup.activity_id}` }),
      handleShareActivity: async (signup: SignupRecord) => {
        try {
          await Taro.setClipboardData({ data: `pages/activity-detail/index?id=${signup.activity_id}` })
          const data = await shareActivity(signup.activity_id, 'link')
          updateSignupByActivityId(signup.activity_id, (item) => ({ ...item, shares: data.share_count, likes: data.like_count ?? item.likes, favorites: data.favorite_count ?? item.favorites }))
          Taro.showToast({ title: t('profile.linkCopied'), icon: 'success' })
        } catch (error) {
          console.error('分享记录失败:', error)
          Taro.showToast({ title: t('profile.shareFailed'), icon: 'none' })
        }
      },
      handleDeleteNotification: (id: number) => { setNotifications((prev) => prev.filter((n) => n.id !== id)); Taro.showToast({ title: t('common.deleted'), icon: 'none' }) },
      handleSettingClick: (setting: string) => {
        const routes: Record<string, string> = { profile: '/pages/profile-edit/index', payment: '/pages/my-payments/index', invoice: '/pages/invoice-headers/index', darkmode: '/pages/dark-mode/index', language: '/pages/language/index' }
        if (routes[setting]) return Taro.navigateTo({ url: routes[setting] })
        const messages: Record<string, string> = { privacy: t('settings.privacy'), help: t('settings.support') }
        Taro.showToast({ title: messages[setting] || setting, icon: 'none' })
      },
    },
  }
}
