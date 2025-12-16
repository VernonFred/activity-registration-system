/**
 * 报名列表页 - Lovable 风格
 * 创建时间: 2025年12月09日 12:00
 * 
 * 页面结构：页面标题 → 筛选栏 → 状态标签 → 活动列表
 * 设计参考: lovable参考样式/截屏2025-12-09 10.04.11.png
 */

import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import { useTheme } from '../../context/ThemeContext'
import { FilterBar, StatusTabs, ActivityCard } from './components'
import { fetchActivityList } from '../../services/activities'
import type { ActivityItem, ActivityStatus, FilterState } from './types'
import './index.scss'

const ActivitiesPage = () => {
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
  
  // 状态标签（已开始、已结束、延期）
  const [activeStatus, setActiveStatus] = useState<ActivityStatus>('started')

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
      const data = await fetchActivityList({
        status: activeStatus,
        city: filters.city && filters.city !== 'all' ? filters.city : undefined,
      }) as ActivityItem[]
      setActivities(data)
    } catch (error) {
      console.error('加载活动列表失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
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
      itemList: ['按时间排序', '按评分排序', '按报名人数排序'],
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
            <Text className="empty-text">暂无相关活动</Text>
            <Text className="empty-desc">试试其他筛选条件吧</Text>
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
