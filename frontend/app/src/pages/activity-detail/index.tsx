import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchActivityDetail } from '../../services/activities'
import { fetchMySignups as fetchMySignupsApi } from '../../services/user'
import { addRecentView } from '../../utils/storage'
import { OverviewTab, AgendaTab, HotelTab, LiveTab, BottomBar } from './components'
import { normalizeAgendaFromDetail } from './adapters/agenda'
import { normalizeHotelsFromDetail } from './adapters/hotel'
import type { TabKey, Activity } from './types'
import { formatDate, formatTime } from './utils'
import './index.scss'

// PNG 图标
import iconArrowLeft from '../../assets/icons/arrow-left.png'

// Tab 配置（评论评分通过底部胶囊浮岛进入独立页面）
const TAB_KEYS: { key: TabKey; labelKey: string }[] = [
  { key: 'overview', labelKey: 'activityDetail.tabOverview' },
  { key: 'agenda', labelKey: 'activityDetail.tabAgenda' },
  { key: 'hotel', labelKey: 'activityDetail.tabHotel' },
  { key: 'live', labelKey: 'activityDetail.tabLive' },
]

export default function ActivityDetail() {
  const { t } = useTranslation()
  const router = useRouter()
  const { theme } = useTheme()
  const activityId = Number(router.params.id)

  const TABS = useMemo(
    () =>
      TAB_KEYS
        .filter(({ key }) => key !== 'live' || activity?.materials?.live?.enabled !== false)
        .map(({ key, labelKey }) => ({ key, label: t(labelKey) })),
    [t, activity?.materials?.live?.enabled],
  )
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [currentSignup, setCurrentSignup] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(44)

  // 配置微信分享（符合微信官方规范）
  useShareAppMessage(() => {
    return {
      title: activity?.title || t('activityDetail.shareTitle'),
      path: `/pages/activity-detail/index?id=${activityId}`,
      imageUrl: activity?.cover_url || undefined,
    }
  })

  // 初始化
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  useEffect(() => {
    if (activeTab === 'live' && activity?.materials?.live?.enabled === false) {
      setActiveTab('overview')
    }
  }, [activeTab, activity?.materials?.live?.enabled])

  // 加载活动数据
  useEffect(() => {
    // 参数校验：如果缺少 activityId，提示并返回上一页
    if (!activityId || isNaN(activityId)) {
      Taro.showToast({
        title: t('activityDetail.invalidActivity'),
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 2000)
      return
    }

    setLoading(true)
    Promise.all([
      fetchActivityDetail(activityId),
      fetchMySignupsApi({ status: 'all', page: 1, per_page: 100 }).catch(() => null),
    ])
      .then(([data, signupResp]) => {
        const normalized: Activity = {
          ...data,
          cover_url: data?.cover_url || data?.cover_image_url,
          group_qr_image_url: data?.group_qr_image_url,
          location_city: data?.location_city || data?.city,
          location_name: data?.location_name || data?.location,
          location_address: data?.location_address || data?.location_detail,
          contact_name: data?.contact_name,
          contact_phone: data?.contact_phone,
          contact_email: data?.contact_email,
          signup_deadline: data?.signup_deadline || data?.signup_end_time,
          current_participants: data?.current_participants ?? data?.signup_count,
          agenda: normalizeAgendaFromDetail(data),
          hotels: normalizeHotelsFromDetail(data),
          materials: data?.materials || {},
          extra: data?.extra || {},
        }

        setActivity(normalized)

        const signupItems = signupResp?.items || []
        setCurrentSignup(signupItems.find((item: any) => item?.activity?.id === normalized.id) || null)
        
        // 记录到最近浏览
        addRecentView({
          id: normalized.id,
          title: normalized.title,
          cover_url: normalized.cover_url || 'https://via.placeholder.com/400',
          date: formatDate(normalized.start_time),
          time: formatTime(normalized.start_time),
          status: normalized.status,
          location: normalized.location_city || normalized.location_name || t('activityDetail.tbd')
        })
      })
      .catch((err) => {
        console.error('加载活动失败', err)
        Taro.showToast({ title: t('common.loadFailedShort'), icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [activityId, t])

  // 事件处理
  const handleBack = useCallback(() => Taro.navigateBack(), [])
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
  }, [])
  const handleFavorite = useCallback(() => {
    setIsFavorited(!isFavorited)
    Taro.showToast({ title: isFavorited ? t('activityDetail.uncollected') : t('activityDetail.collected'), icon: 'none' })
  }, [isFavorited, t])
  const handleLike = useCallback(() => setIsLiked(!isLiked), [isLiked])
  const handleComment = useCallback(() => {
    // 跳转到独立的评论页面
    Taro.navigateTo({
      url: `/pages/comment/index?id=${activityId}&cover=${encodeURIComponent(activity?.cover_url || '')}`
    })
  }, [activityId, activity])

  // 分享功能（符合微信官方规范：引导用户点击右上角分享）
  const handleShare = useCallback(() => {
    Taro.showToast({
      title: t('activityDetail.shareHint'),
      icon: 'none',
      duration: 2000
    })
  }, [t])
  const handleSignup = useCallback(() => {
    if (!activityId) return
    if (currentSignup?.id) {
      Taro.navigateTo({ url: `/pages/checkin/index?signupId=${currentSignup.id}&activityId=${activityId}` })
      return
    }
    Taro.navigateTo({ url: `/pages/signup/index?activity_id=${activityId}` })
  }, [activityId, currentSignup])
  const handleCall = useCallback((phone: string) => Taro.makePhoneCall({ phoneNumber: phone }), [])
  const handleViewLive = useCallback(() => {
    const live = activity?.materials?.live
    if (live?.enabled === false) {
      Taro.showToast({ title: t('activityDetail.liveNotStarted'), icon: 'none' })
      return
    }

    if (live?.action_type === 'qrcode' && live?.qrcode_image_url) {
      Taro.previewImage({
        current: live.qrcode_image_url,
        urls: [live.qrcode_image_url],
      })
      return
    }

    const liveUrl = live?.action_url || activity?.live_url
    if (liveUrl) {
      if (/^https?:\/\//i.test(liveUrl)) {
        Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(liveUrl)}` })
      } else {
        Taro.navigateTo({ url: liveUrl })
      }
      return
    }

    Taro.showToast({ title: t('activityDetail.liveNotStarted'), icon: 'none' })
  }, [activity, t])

  const primaryActionText = currentSignup?.id ? t('profile.goCheckin') : t('activityDetail.signupNow')

  // 加载状态
  if (loading) {
    return (
      <View className={`activity-detail theme-${theme} loading`}>
        <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
        <View className="skeleton-header" />
        <View className="skeleton-tabs" />
        <View className="skeleton-content">
          <View className="skeleton-line" />
          <View className="skeleton-line short" />
          <View className="skeleton-line" />
        </View>
      </View>
    )
  }

  // 空状态
  if (!activity) {
    return (
      <View className={`activity-detail theme-${theme} empty`}>
        <Text className="empty-text">{t('activityDetail.activityNotExist')}</Text>
      </View>
    )
  }

  return (
    <View className={`activity-detail theme-${theme}`}>
      {/* Hero Banner 区域（Lovable 风格） */}
      <View className="hero-section">
        {/* Banner 图片 */}
        <View className="banner-container">
          <Image 
            src={activity.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
            className="banner-image" 
            mode="aspectFill" 
          />
          {/* 渐变遮罩 */}
          <View className="banner-gradient" />
        </View>

        {/* 浮动返回按钮 */}
        <View 
          className="floating-back-btn" 
          onClick={handleBack}
          style={{ top: `${statusBarHeight + 16}px` }}
        >
          <Image src={iconArrowLeft} className="back-icon" mode="aspectFit" />
        </View>

        {/* 标题 Overlay（显示副标题或分类） */}
        <View className="title-overlay">
          <Text className="subtitle">{activity.category || activity.title}</Text>
        </View>
      </View>

      {/* Tab 切换 - 粘性定位 + 毛玻璃效果 */}
      <View className="tabs-sticky-wrapper">
        <View className="tabs-content">
          {TABS.map((tab) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <Text className="tab-text">{tab.label}</Text>
              {activeTab === tab.key && <View className="tab-indicator" />}
            </View>
          ))}
        </View>
      </View>

      {/* 内容区域 - 卡片化布局 */}
      <ScrollView className="content-scroll" scrollY enhanced showScrollbar={false}>
        {activeTab === 'overview' && <OverviewTab activity={activity} theme={theme} />}
        {activeTab === 'agenda' && <AgendaTab agenda={activity.agenda || []} theme={theme} activityId={activity.id} />}
        {activeTab === 'hotel' && <HotelTab hotels={activity.hotels || []} onCall={handleCall} theme={theme} />}
        {activeTab === 'live' && (
          <LiveTab
            coverUrl={activity.materials?.live?.cover_image_url || activity.cover_url}
            buttonText={activity.materials?.live?.button_text}
            enabled={activity.materials?.live?.enabled !== false}
            onViewLive={handleViewLive}
            theme={theme}
          />
        )}

        {/* 底部安全区 */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部胶囊浮岛（保持不变） */}
      <BottomBar
        isFavorited={isFavorited}
        isLiked={isLiked}
        onFavorite={handleFavorite}
        onComment={handleComment}
        onLike={handleLike}
        onShare={handleShare}
        onSignup={handleSignup}
        ctaText={primaryActionText}
        theme={theme}
      />
    </View>
  )
}
