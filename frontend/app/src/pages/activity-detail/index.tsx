/**
 * 活动详情页面 - Lovable 精致风格
 * 重构时间: 2025年12月9日 13:30
 * 
 * 优化内容：
 * - 重新设计顶部导航，增加呼吸感
 * - 底部改为胶囊浮岛风格
 * - 卡片排版更精致
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchActivityDetail } from '../../services/activities'
import { addRecentView } from '../../utils/storage'
import { OverviewTab, AgendaTab, HotelTab, LiveTab, BottomBar } from './components'
import type { TabKey, Activity } from './types'
import { formatDate, formatTime } from './utils'
import './index.scss'

// PNG 图标
import iconArrowLeft from '../../assets/icons/arrow-left.png'

// Tab 配置
const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '活动速览' },
  { key: 'agenda', label: '活动议程' },
  { key: 'hotel', label: '酒店信息' },
  { key: 'live', label: '图片直播' },
]

// 默认议程数据
const DEFAULT_AGENDA = [
  { id: 1, time_start: '09:00', time_end: '09:30', title: '签到与早餐', speaker: '会务组', location: '主会场大厅', tag: '签到' },
  { id: 2, time_start: '09:30', time_end: '10:30', title: '开幕式致辞', speaker: '张伟 - CEO', location: '主会场' },
  { id: 3, time_start: '10:30', time_end: '12:00', title: '主题演讲：行业趋势与未来展望', speaker: '李明 - 首席战略官', location: '主会场' },
  { id: 4, time_start: '12:00', time_end: '13:30', title: '午餐时间', speaker: '自由交流', location: '餐厅', tag: '休息时间' },
]

// 默认酒店数据
const DEFAULT_HOTELS = [
  {
    id: 1,
    name: '喜来登大酒店',
    room_type: '商务标准间',
    price: 328,
    booking_tip: '预订时请报"强智科技"名称享受优惠价格',
    contact_name: '邓经理',
    contact_phone: '18176792056',
    facilities: ['免费WiFi', '咖啡厅', '洗衣房', '免费停车', '餐厅', '会议厅'],
    address: '长沙市江发路12号园博园东门',
  },
]

export default function ActivityDetail() {
  const router = useRouter()
  const { theme } = useTheme()
  const activityId = Number(router.params.id)
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(44)

  // 初始化
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  // 加载活动数据
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    fetchActivityDetail(activityId)
      .then((data) => {
        // 补充默认数据
        if (!data.agenda) data.agenda = DEFAULT_AGENDA
        if (!data.hotels) data.hotels = DEFAULT_HOTELS
        setActivity(data)
        
        // 记录到最近浏览
        addRecentView({
          id: data.id,
          title: data.title,
          cover_url: data.cover_url || 'https://via.placeholder.com/400',
          date: formatDate(data.start_time),
          time: formatTime(data.start_time),
          status: data.status,
          location: data.location_city || data.location_name || '待定'
        })
      })
      .catch((err) => {
        console.error('加载活动失败', err)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [activityId])

  // 事件处理
  const handleBack = useCallback(() => Taro.navigateBack(), [])
  const handleTabChange = useCallback((tab: TabKey) => setActiveTab(tab), [])
  const handleFavorite = useCallback(() => {
    setIsFavorited(!isFavorited)
    Taro.showToast({ title: isFavorited ? '已取消收藏' : '已收藏', icon: 'none' })
  }, [isFavorited])
  const handleLike = useCallback(() => setIsLiked(!isLiked), [isLiked])
  const handleComment = useCallback(() => Taro.showToast({ title: '评论功能开发中', icon: 'none' }), [])
  const handleShare = useCallback(() => Taro.showShareMenu({ withShareTicket: true }), [])
  const handleSignup = useCallback(() => {
    if (!activityId) return
    Taro.navigateTo({ url: `/pages/signup/index?activity_id=${activityId}` })
  }, [activityId])
  const handleCall = useCallback((phone: string) => Taro.makePhoneCall({ phoneNumber: phone }), [])
  const handleViewLive = useCallback(() => {
    if (activity?.live_url) {
      Taro.navigateTo({ url: activity.live_url })
    } else {
      Taro.showToast({ title: '直播尚未开始', icon: 'none' })
    }
  }, [activity])

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
        <Text className="empty-text">活动不存在</Text>
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
          <Text className="subtitle">暑期培训会</Text>
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
        {activeTab === 'agenda' && <AgendaTab agenda={activity.agenda || []} theme={theme} />}
        {activeTab === 'hotel' && <HotelTab hotels={activity.hotels || []} onCall={handleCall} theme={theme} />}
        {activeTab === 'live' && <LiveTab coverUrl={activity.cover_url} onViewLive={handleViewLive} theme={theme} />}
        
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
        theme={theme}
      />
    </View>
  )
}
