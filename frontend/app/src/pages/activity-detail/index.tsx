import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchActivityDetail } from '../../services/activities'
import { addRecentView } from '../../utils/storage'
import './index.scss'

// Tab 类型
type TabKey = 'overview' | 'agenda' | 'hotel' | 'live'

// 活动数据类型
interface Activity {
  id: number
  title: string
  cover_url?: string
  status: string
  start_time: string
  end_time: string
  signup_deadline?: string
  location_name?: string
  location_address?: string
  location_city?: string
  description?: string
  max_participants?: number
  current_participants?: number
  fee_type?: string
  fee_amount?: number
  agenda?: AgendaItem[]
  hotels?: Hotel[]
  live_url?: string
  extra?: Record<string, any>
}

interface AgendaItem {
  id: number
  time_start: string
  time_end: string
  title: string
  speaker?: string
  location?: string
  tag?: string
}

interface Hotel {
  id: number
  name: string
  logo?: string
  image?: string
  room_type: string
  price: number
  booking_tip?: string
  contact_name?: string
  contact_phone?: string
  facilities?: string[]
  address?: string
  map_url?: string
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 计算距离（模拟）
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export default function ActivityDetail() {
  const router = useRouter()
  const activityId = Number(router.params.id)
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // 加载活动数据
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    fetchActivityDetail(activityId)
      .then((data) => {
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
        
        // 模拟议程数据（实际应从后端获取）
        if (!data.agenda) {
          data.agenda = [
            { id: 1, time_start: '09:00', time_end: '09:30', title: '签到与早餐', speaker: '会务组', location: '主会场大厅', tag: '签到' },
            { id: 2, time_start: '09:30', time_end: '10:30', title: '开幕式致辞', speaker: '张伟 - CEO', location: '主会场' },
            { id: 3, time_start: '10:30', time_end: '12:00', title: '主题演讲：行业趋势与未来展望', speaker: '李明 - 首席战略官', location: '主会场' },
            { id: 4, time_start: '12:00', time_end: '13:30', title: '午餐时间', speaker: '自由交流', location: '餐厅', tag: '休息时间' },
          ]
        }
        // 模拟酒店数据
        if (!data.hotels) {
          data.hotels = [
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
        }
      })
      .catch((err) => {
        console.error('加载活动失败', err)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [activityId])

  // 切换Tab
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
  }, [])

  // 收藏
  const handleFavorite = useCallback(() => {
    setIsFavorited(!isFavorited)
    Taro.showToast({ title: isFavorited ? '已取消收藏' : '已收藏', icon: 'none' })
  }, [isFavorited])

  // 点赞
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked)
  }, [isLiked])

  // 评论
  const handleComment = useCallback(() => {
    Taro.showToast({ title: '评论功能开发中', icon: 'none' })
  }, [])

  // 分享
  const handleShare = useCallback(() => {
    Taro.showShareMenu({ withShareTicket: true })
  }, [])

  // 立即报名
  const handleSignup = useCallback(() => {
    if (!activityId) return
    Taro.navigateTo({ url: `/pages/signup/index?activity_id=${activityId}` })
  }, [activityId])

  // 拨打电话
  const handleCall = useCallback((phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone })
  }, [])

  // 查看直播
  const handleViewLive = useCallback(() => {
    if (activity?.live_url) {
      Taro.navigateTo({ url: activity.live_url })
    } else {
      Taro.showToast({ title: '直播尚未开始', icon: 'none' })
    }
  }, [activity])

  if (loading) {
    return (
      <View className="activity-detail loading">
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

  if (!activity) {
    return (
      <View className="activity-detail empty">
        <Text>活动不存在</Text>
      </View>
    )
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: '活动速览' },
    { key: 'agenda', label: '活动议程' },
    { key: 'hotel', label: '酒店信息' },
    { key: 'live', label: '图片直播' },
  ]

  return (
    <View className="activity-detail">
      {/* 顶部导航栏 */}
      <View className="nav-header">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <Text className="icon-back">‹</Text>
        </View>
        <Text className="nav-title">{activity.title}</Text>
        <View className="nav-placeholder" />
      </View>

      {/* Tab 切换 */}
      <View className="tabs-container">
        <View className="tabs">
          {tabs.map((tab) => (
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

      {/* 内容区域 */}
      <ScrollView className="content-scroll" scrollY>
        {/* 活动速览 Tab */}
        {activeTab === 'overview' && (
          <View className="tab-content overview animate-fade-in">
            {/* Banner */}
            <View className="banner-section">
              <Image
                className="banner-image"
                src={activity.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                mode="aspectFill"
              />
              <View className="banner-overlay" />
            </View>

            {/* 活动信息卡片 */}
            <View className="info-card glass-card">
              <View className="info-header">
                <View className="location-badge">
                  <Text>{activity.location_city || '长沙'}</Text>
                </View>
                <Text className="activity-title">{activity.title}</Text>
                <View className={`fee-tag ${activity.fee_type === 'free' ? 'free' : 'paid'}`}>
                  {activity.fee_type === 'free' ? '免费' : `¥${activity.fee_amount}`}
                </View>
              </View>

              <View className="info-divider" />

              {/* 时间 */}
              <View className="info-row">
                <View className="info-label">
                  <Text className="info-date">{formatDate(activity.start_time)}-{formatDate(activity.end_time)}</Text>
                  <Text className="info-note">以实际情况为准</Text>
                </View>
                <View className="info-deadline">
                  <Text>{activity.signup_deadline ? `${formatDate(activity.signup_deadline)} 截止报名` : ''}</Text>
                </View>
              </View>

              <View className="info-divider" />

              {/* 地点 */}
              <View className="info-row location-row">
                <View className="info-label">
                  <Text className="location-name">{activity.location_city} | {activity.location_name}</Text>
                  <Text className="location-address">{activity.location_address}</Text>
                </View>
                <View className="location-distance">
                  <View className="distance-icon">📍</View>
                  <Text>{formatDistance(401.9)}</Text>
                </View>
              </View>

              <View className="info-divider" />

              {/* 报名人数 */}
              <View className="info-row participants-row">
                <Text className="participants-label">目前报名人数</Text>
                <View className="participants-count">
                  <Text className="count-number">{activity.current_participants || 215}</Text>
                  <Text className="count-unit">人</Text>
                  <View className="avatar-stack">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View key={i} className="avatar-item" style={{ left: `${(i - 1) * 16}px` }}>
                        <Image
                          className="avatar-img"
                          src={`https://i.pravatar.cc/40?img=${i + 10}`}
                          mode="aspectFill"
                        />
                      </View>
                    ))}
                  </View>
                </View>
                <Text className="signup-status">火热报名中</Text>
              </View>

              <View className="info-divider" />

              {/* 活动介绍 */}
              <View className="description-section">
                <Text className="section-title">活动介绍</Text>
                <Text className="description-text">
                  {activity.description || '1. 临近前请您提前规划好行程，做好相应准备，以免影响您的正常出行。'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 活动议程 Tab */}
        {activeTab === 'agenda' && (
          <View className="tab-content agenda animate-fade-in">
            <View className="agenda-timeline">
              {(activity.agenda || []).map((item, index) => (
                <View key={item.id} className="agenda-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <View className="timeline-dot">
                    <View className={`dot ${index === 0 ? 'active' : ''}`} />
                    {index < (activity.agenda?.length || 0) - 1 && <View className="timeline-line" />}
                  </View>
                  <View className="agenda-card glass-card">
                    <View className="agenda-time">
                      <Text className="time-icon">🕐</Text>
                      <Text className="time-text">{item.time_start} - {item.time_end}</Text>
                    </View>
                    <Text className="agenda-title">{item.title}</Text>
                    {item.speaker && (
                      <View className="agenda-info">
                        <Text className="info-icon">👤</Text>
                        <Text className="info-text">{item.speaker}</Text>
                      </View>
                    )}
                    {item.location && (
                      <View className="agenda-info">
                        <Text className="info-icon">📍</Text>
                        <Text className="info-text">{item.location}</Text>
                      </View>
                    )}
                    {item.tag && (
                      <View className="agenda-tag">{item.tag}</View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 酒店信息 Tab */}
        {activeTab === 'hotel' && (
          <View className="tab-content hotel animate-fade-in">
            {/* 酒店选择器 */}
            <ScrollView className="hotel-tabs" scrollX>
              {(activity.hotels || []).map((hotel, index) => (
                <View key={hotel.id} className={`hotel-tab ${index === 0 ? 'active' : ''}`}>
                  {hotel.name}
                </View>
              ))}
            </ScrollView>

            {/* 酒店详情 */}
            {(activity.hotels || []).slice(0, 1).map((hotel) => (
              <View key={hotel.id} className="hotel-detail">
                {/* 酒店卡片 */}
                <View className="hotel-card">
                  <Image
                    className="hotel-image"
                    src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                    mode="aspectFill"
                  />
                  <View className="hotel-overlay">
                    <View className="hotel-header">
                      <View className="hotel-logo">🏨</View>
                      <Text className="hotel-name">{hotel.name}</Text>
                      <Text className="hotel-verify">✓</Text>
                    </View>
                    <View className="hotel-tip">
                      <Text className="tip-icon">📍</Text>
                      <Text className="tip-text">{hotel.booking_tip}</Text>
                    </View>
                    <View className="hotel-phone">
                      <Text className="phone-icon">📞</Text>
                      <Text className="phone-text">{hotel.contact_phone}</Text>
                    </View>
                    <View className="hotel-facilities">
                      {(hotel.facilities || []).map((f, i) => (
                        <View key={i} className="facility-item">
                          <Text className="facility-icon">{['📶', '☕', '🧺', '🅿️', '🍽️', '🏢'][i % 6]}</Text>
                          <Text className="facility-text">{f}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 房型价格 */}
                <View className="room-section">
                  <View className="room-info">
                    <Text className="room-type">{hotel.room_type}</Text>
                    <Text className="room-note">单双同价</Text>
                  </View>
                  <View className="room-price">
                    <Text className="price-currency">💰</Text>
                    <Text className="price-amount">{hotel.price}</Text>
                    <Text className="price-unit">/晚</Text>
                  </View>
                </View>

                {/* 预订说明 */}
                <View className="booking-section glass-card">
                  <View className="booking-item">
                    <Text className="booking-icon">🏷️</Text>
                    <View className="booking-content">
                      <Text className="booking-label">预订说明</Text>
                      <Text className="booking-text">{hotel.booking_tip}</Text>
                    </View>
                  </View>
                  <View className="booking-item">
                    <Text className="booking-icon">📞</Text>
                    <View className="booking-content">
                      <Text className="booking-label">预定联系人</Text>
                      <Text className="booking-name">{hotel.contact_name}</Text>
                      <Text className="booking-phone">{hotel.contact_phone}</Text>
                    </View>
                  </View>
                </View>

                {/* 预订按钮 */}
                <View className="booking-button" onClick={() => handleCall(hotel.contact_phone || '')}>
                  <Text>拨打电话预定</Text>
                </View>

                {/* 位置地图 */}
                <View className="map-section">
                  <View className="section-header">
                    <Text className="section-icon">📍</Text>
                    <Text className="section-title">位置地图</Text>
                  </View>
                  <View className="map-placeholder">
                    <Image
                      className="map-image"
                      src="https://maps.googleapis.com/maps/api/staticmap?center=28.228,112.939&zoom=14&size=600x200&maptype=roadmap"
                      mode="aspectFill"
                    />
                  </View>
                </View>

                {/* 交通指南 */}
                <View className="transport-section">
                  <View className="section-header">
                    <Text className="section-icon">🚇</Text>
                    <Text className="section-title">交通指南</Text>
                  </View>
                  <View className="transport-list">
                    <View className="transport-item">
                      <Text className="transport-type">地铁</Text>
                      <Text className="transport-desc">地铁2号线/4号线/6号线 世纪大道站，3号出口步行5分钟</Text>
                    </View>
                    <View className="transport-item">
                      <Text className="transport-type">公交</Text>
                      <Text className="transport-desc">81路、985路、583路 世纪大道站下车</Text>
                    </View>
                    <View className="transport-item">
                      <Text className="transport-type">自驾</Text>
                      <Text className="transport-desc">酒店提供免费地下停车场，车位充足</Text>
                    </View>
                  </View>
                </View>

                {/* 当地天气 */}
                <View className="weather-section">
                  <View className="section-header">
                    <Text className="section-icon">☁️</Text>
                    <Text className="section-title">当地天气</Text>
                  </View>
                  <View className="weather-card">
                    <View className="weather-main">
                      <Text className="weather-temp">22°C</Text>
                      <Text className="weather-desc">多云</Text>
                    </View>
                    <View className="weather-details">
                      <View className="weather-item">
                        <Text className="weather-icon">💧</Text>
                        <Text className="weather-label">湿度</Text>
                        <Text className="weather-value">65%</Text>
                      </View>
                      <View className="weather-item">
                        <Text className="weather-icon">💨</Text>
                        <Text className="weather-label">风速</Text>
                        <Text className="weather-value">12km/h</Text>
                      </View>
                      <View className="weather-item">
                        <Text className="weather-icon">👁️</Text>
                        <Text className="weather-label">能见度</Text>
                        <Text className="weather-value">10km</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 图片直播 Tab */}
        {activeTab === 'live' && (
          <View className="tab-content live animate-fade-in">
            <View className="live-container">
              <Image
                className="live-cover"
                src={activity.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                mode="aspectFill"
              />
              <View className="live-overlay">
                <View className="live-button" onClick={handleViewLive}>
                  <Text>查看直播</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bottom-bar">
        <View className="action-buttons">
          <View className={`action-item ${isFavorited ? 'active' : ''}`} onClick={handleFavorite}>
            <Text className="action-icon">{isFavorited ? '⭐' : '☆'}</Text>
            <Text className="action-text">收藏</Text>
          </View>
          <View className="action-item" onClick={handleComment}>
            <Text className="action-icon">💬</Text>
            <Text className="action-text">评论</Text>
          </View>
          <View className={`action-item ${isLiked ? 'active' : ''}`} onClick={handleLike}>
            <Text className="action-icon">{isLiked ? '❤️' : '🤍'}</Text>
            <Text className="action-text">点赞</Text>
          </View>
          <View className="action-item" onClick={handleShare}>
            <Text className="action-icon">↗️</Text>
            <Text className="action-text">分享</Text>
          </View>
        </View>
        <View className="signup-button" onClick={handleSignup}>
          <Text>立即报名</Text>
        </View>
      </View>
    </View>
  )
}

