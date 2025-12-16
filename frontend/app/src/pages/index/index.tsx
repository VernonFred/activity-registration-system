/**
 * 首页 - Lovable 风格
 * 支持浅色/深色主题切换
 */
import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import ThemeToggle from '../../components/ThemeToggle'
import { useTheme } from '../../context/ThemeContext'
import { fetchFeaturedActivities, fetchHistoricalActivities } from '../../services/activities'
import { mockCurrentUser } from '../../mock'
import type { MockActivity } from '../../mock/activities'
import './index.scss'

// PNG 图标
import iconBell from '../../assets/icons/bell.png'
import iconSearch from '../../assets/icons/search.png'
import iconCalendar from '../../assets/icons/calendar.png'
import iconMapPin from '../../assets/icons/map-pin.png'
import iconArrowRight from '../../assets/icons/arrow-right.png'

const IndexPage = () => {
  const { theme, isDark } = useTheme()
  const [featuredActivities, setFeaturedActivities] = useState<MockActivity[]>([])
  const [historyActivities, setHistoryActivities] = useState<MockActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [featured, history] = await Promise.all([
        fetchFeaturedActivities() as Promise<MockActivity[]>,
        fetchHistoricalActivities() as Promise<MockActivity[]>
      ])
      setFeaturedActivities(featured)
      setHistoryActivities(history)
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
      // 设置为空数组，避免后续渲染错误
      setFeaturedActivities([])
      setHistoryActivities([])
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期范围
  const formatDateRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const startStr = `${start.getMonth() + 1}月${start.getDate()}日`
    const endStr = `${end.getMonth() + 1}月${end.getDate()}日`
    if (startStr === endStr) return startStr
    return `${startStr} - ${endStr}`
  }

  // 格式化单个日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 获取状态标签
  const getStatusConfig = (status: MockActivity['status']) => {
    const config = {
      signup: { label: '报名中', class: 'status-active' },
      upcoming: { label: '即将开始', class: 'status-pending' },
      ongoing: { label: '进行中', class: 'status-ongoing' },
      finished: { label: '已结束', class: 'status-closed' }
    }
    return config[status]
  }

  // 点击事件
  const handleActivityClick = (activity: MockActivity) => {
    if (activity.status === 'finished' && activity.article_url) {
      Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(activity.article_url)}` })
    } else {
      Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activity.id}` })
    }
  }

  const handleSearchClick = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleNotificationClick = () => {
    Taro.navigateTo({ url: '/pages/profile/index?tab=notifications' })
  }

  const handleViewAll = (type: string) => {
    Taro.navigateTo({ url: `/pages/activities/index?type=${type}` })
  }

  // Swiper 切换
  const handleSwiperChange = (e: any) => {
    setCurrentIndex(e.detail.current)
  }

  return (
    <View className={`index-page theme-${theme}`}>
      {/* 状态栏 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />

      {/* 用户头部 */}
      <View className="user-header">
        <View className="user-left">
          <View className="avatar">
            {mockCurrentUser.avatar ? (
              <Image src={mockCurrentUser.avatar} className="avatar-img" mode="aspectFill" />
            ) : (
              <Text className="avatar-text">{mockCurrentUser.name.charAt(0)}</Text>
            )}
          </View>
          <View className="user-info">
            <Text className="greeting">你好</Text>
            <Text className="username">{mockCurrentUser.name}</Text>
          </View>
        </View>
        <View className="user-right">
          {/* 主题切换按钮 */}
          <ThemeToggle />
          <View className="notification-btn" onClick={handleNotificationClick}>
            <Image src={iconBell} className="icon-img" mode="aspectFit" />
            <View className="notification-dot" />
          </View>
        </View>
      </View>

      {/* 搜索框 */}
      <View className="search-bar" onClick={handleSearchClick}>
        <Image src={iconSearch} className="search-icon" mode="aspectFit" />
        <Text className="search-placeholder">搜索活动、会议、讲座...</Text>
      </View>

      {/* 主内容 */}
      <ScrollView className="main-content" scrollY enhanced showScrollbar={false}>
        
        {/* 热门精选 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">热门精选</Text>
            <View className="view-all" onClick={() => handleViewAll('featured')}>
              <Text className="view-all-text">查看全部</Text>
              <Image src={iconArrowRight} className="view-all-icon" mode="aspectFit" />
            </View>
          </View>

          {loading ? (
            <View className="skeleton-cards">
              {[1, 2, 3].map(i => <View key={i} className="skeleton-card" />)}
            </View>
          ) : featuredActivities.length === 0 ? (
            <View className="empty-state">
              <Text className="empty-text">暂无热门活动</Text>
              <Text className="empty-desc">敬请期待更多精彩活动</Text>
            </View>
          ) : (
            <>
              {/* 使用 Swiper 实现居中放大效果 - 两侧露出部分 */}
              <Swiper
                className="featured-swiper"
                circular
                autoplay
                interval={4000}
                duration={500}
                previousMargin="80rpx"
                nextMargin="80rpx"
                current={currentIndex}
                onChange={handleSwiperChange}
                easingFunction="easeOutCubic"
              >
                {featuredActivities.map((activity, index) => (
                  <SwiperItem key={activity.id} className="swiper-item">
                    <View
                      className={`event-card ${index === currentIndex ? 'active' : 'inactive'}`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      {/* 封面 */}
                      <View className="card-cover">
                        <Image src={activity.cover} className="cover-img" mode="aspectFill" />
                        <View className="cover-gradient" />
                        <View className={`status-badge ${getStatusConfig(activity.status).class}`}>
                          <Text className="status-text">{getStatusConfig(activity.status).label}</Text>
                        </View>
                      </View>

                      {/* 内容 */}
                      <View className="card-content">
                        <View className="card-date">
                          <Image src={iconCalendar} className="meta-icon" mode="aspectFit" />
                          <Text className="date-text">{formatDateRange(activity.start_time, activity.end_time)}</Text>
                        </View>
                        <Text className="card-title">{activity.title}</Text>
                        <View className="card-footer">
                          <View className="footer-item">
                            <Image src={iconMapPin} className="meta-icon" mode="aspectFit" />
                            <Text className="footer-text">{activity.location}</Text>
                          </View>
                          <View className="footer-item">
                            <Image src={iconCalendar} className="meta-icon" mode="aspectFit" />
                            <Text className="footer-text">{activity.signup_count.toLocaleString()}人</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </SwiperItem>
                ))}
              </Swiper>

              {/* 轮播指示器 */}
              <View className="indicators">
                {featuredActivities.map((_, idx) => (
                  <View key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />
                ))}
              </View>
            </>
          )}
        </View>

        {/* 历史活动 */}
        <View className="section history-section">
          <View className="section-header">
            <Text className="section-title">历史活动</Text>
            <View className="view-all" onClick={() => handleViewAll('history')}>
              <Text className="view-all-text">查看全部</Text>
              <Image src={iconArrowRight} className="view-all-icon" mode="aspectFit" />
            </View>
          </View>

          {loading ? (
            <View className="skeleton-list">
              {[1, 2, 3].map(i => <View key={i} className="skeleton-item" />)}
            </View>
          ) : historyActivities.length === 0 ? (
            <View className="empty-state">
              <Text className="empty-text">暂无历史活动</Text>
              <Text className="empty-desc">历史活动记录将在此展示</Text>
            </View>
          ) : (
            <View className="history-list">
              {historyActivities.slice(0, 5).map((activity) => (
                <View
                  key={activity.id}
                  className="history-card"
                  onClick={() => handleActivityClick(activity)}
                >
                  {/* 缩略图 */}
                  <View className="history-thumb">
                    <Image src={activity.cover} className="thumb-img" mode="aspectFill" />
                  </View>

                  {/* 内容 */}
                  <View className="history-content">
                    <Text className="history-title">{activity.title}</Text>
                    <View className="history-meta">
                      <View className="meta-item">
                        <Image src={iconCalendar} className="meta-icon-sm" mode="aspectFit" />
                        <Text className="meta-text">{formatDate(activity.start_time)}</Text>
                      </View>
                      <View className="meta-item">
                        <Image src={iconMapPin} className="meta-icon-sm" mode="aspectFit" />
                        <Text className="meta-text">{activity.location}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 箭头 */}
                  <View className="history-arrow">
                    <Image src={iconArrowRight} className="arrow-icon" mode="aspectFit" />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部导航 */}
      <CustomTabBar current={0} />
    </View>
  )
}

export default IndexPage
