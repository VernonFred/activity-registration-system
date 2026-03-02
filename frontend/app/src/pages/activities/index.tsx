/**
 * 报名列表页 - Lovable 风格
 * 创建时间: 2025年12月09日 12:00
 * 
 * 页面结构：页面标题 → 筛选栏 → 状态标签 → 活动列表
 * 设计参考: lovable参考样式/截屏2025-12-09 10.04.11.png
 */

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import { useTheme } from '../../context/ThemeContext'
import { FilterBar, StatusTabs, ActivityCard } from './components'
import { fetchActivityList } from '../../services/activities'
import type { ActivityItem, ActivityStatus, FilterState } from './types'
import './index.scss'

// 将 mock/API 返回的数据格式统一映射为页面使用的 ActivityItem
const normalizeActivity = (raw: any): ActivityItem => ({
  id: String(raw.id),
  title: raw.title || '',
  cover: raw.cover || '',
  rating: raw.rating || 0,
  ratingCount: raw.rating_count ?? raw.ratingCount ?? 0,
  startDate: raw.start_time || raw.startDate || '',
  endDate: raw.end_time || raw.endDate || '',
  city: raw.location || raw.city || '',
  location: raw.venue || raw.location || '',
  status: raw.status === 'signup' ? 'ongoing' : (raw.status as ActivityStatus),
  isFree: raw.is_free ?? raw.isFree ?? false,
  price: raw.price,
})

const ActivitiesPage = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  
  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    timeRange: '',
    status: '',
  })
  
  // 状态标签（未开始、进行中、已结束）
  const [activeStatus, setActiveStatus] = useState<ActivityStatus>('ongoing')

  // 初始化
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
    loadData()
  }, [])

  // 加载数据（使用统一的 services）
  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetchActivityList({
        status: activeStatus,
        city: filters.city && filters.city !== 'all' ? filters.city : undefined,
      }) as any

      // 处理返回数据格式
      // Mock 模式返回 { items: [...], total, page, ... }
      // 真实 API 可能直接返回数组
      const rawData = Array.isArray(response) ? response : (response.items || [])
      setActivities(rawData.map(normalizeActivity))
    } catch (error) {
      console.error('加载活动列表失败:', error)
      Taro.showToast({
        title: t('common.loadFailed'),
        icon: 'none',
        duration: 2000
      })
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  // 筛选后的数据
  const filteredActivities = useMemo(() => {
    // 确保 activities 是数组
    if (!Array.isArray(activities)) {
      return []
    }
    return activities.filter(activity => {
      // 状态筛选
      if (activeStatus && activity.status !== activeStatus) {
        return false
      }
      // 城市筛选
      if (filters.city && filters.city !== 'all' && activity.city !== filters.city) {
        return false
      }
      return true
    })
  }, [activities, activeStatus, filters])

  // 筛选变更
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 状态变更
  const handleStatusChange = (status: ActivityStatus) => {
    setActiveStatus(status)
  }

  // 排序按钮点击
  const handleSortClick = () => {
    Taro.showActionSheet({
      itemList: [t('activities.sortByTime'), t('activities.sortByRating'), t('activities.sortByRegistration')],
    }).then(res => {
      console.log('排序选择:', res.tapIndex)
    }).catch(() => {})
  }

  return (
    <View className={`activities-page theme-${theme}`}>
      {/* 状态栏占位 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />

      {/* 筛选栏 */}
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSortClick={handleSortClick}
      />

      {/* 状态标签 */}
      <StatusTabs 
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
      />

      {/* 分隔线 */}
      <View className="divider" />

      {/* 活动列表 */}
      <ScrollView 
        className="activity-list"
        scrollY
        enhanced
        showScrollbar={false}
      >
        {loading ? (
          // 骨架屏
          <View className="skeleton-list">
            {[1, 2, 3, 4].map(i => (
              <View key={i} className="skeleton-card" />
            ))}
          </View>
        ) : filteredActivities.length === 0 ? (
          // 空状态
          <View className="empty-state">
            <Text className="empty-text">{t('activities.noActivities')}</Text>
            <Text className="empty-desc">{t('activities.tryOtherFilter')}</Text>
      </View>
        ) : (
          // 活动卡片列表
          <View className="card-list">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}
            
        {/* 底部安全区 */}
            <View className="bottom-spacer" />
          </ScrollView>

      {/* 底部导航 */}
      <CustomTabBar current={1} />
    </View>
  )
}

export default ActivitiesPage
