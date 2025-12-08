import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Card, Tag, Button, ListSkeleton, Empty } from '../../components'
import CustomTabBar from '../../components/CustomTabBar'
import { fetchActivityList } from '../../services/activities'
import type { MockActivity } from '../../mock/activities'
import './index.scss'

// 筛选选项
const CITY_FILTERS = [
  { label: '全部', value: '' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
]

const STATUS_FILTERS = [
  { label: '全部', value: '' },
  { label: '报名中', value: 'signup' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' },
]

const ActivityListPage = () => {
  // 状态管理
  const [activities, setActivities] = useState<MockActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statusBarHeight, setStatusBarHeight] = useState(44)

  // 初始化：获取状态栏高度
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    const baseHeight = sysInfo.statusBarHeight || 44
    setStatusBarHeight(baseHeight + 50)
  }, [])

  // 加载数据
  useEffect(() => {
    loadData()
  }, [cityFilter, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 调用 API（支持 Mock 数据）
      const data = await fetchActivityList({
        city: cityFilter || undefined,
        status: statusFilter || undefined,
      }) as MockActivity[]
      
      setActivities(data)
    } catch (error) {
      console.error('加载活动列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      } finally {
        setLoading(false)
      }
    }

  // 获取状态标签类型
  const getTagType = (status: MockActivity['status']) => {
    const map = {
      signup: 'signup' as const,
      upcoming: 'upcoming' as const,
      ongoing: 'ongoing' as const,
      finished: 'finished' as const
    }
    return map[status] || 'custom'
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 活动卡片点击
  const handleActivityClick = (activity: MockActivity) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    })
  }

  // 立即报名
  const handleSignupClick = (e: any, activity: MockActivity) => {
    e.stopPropagation()
    
    if (activity.status === 'signup') {
      Taro.navigateTo({
        url: `/pages/signup/index?activityId=${activity.id}`
      })
    } else if (activity.status === 'upcoming') {
      Taro.showToast({
        title: '活动即将开始',
        icon: 'none'
      })
    } else if (activity.status === 'ongoing') {
      Taro.showToast({
        title: '活动进行中',
        icon: 'none'
      })
    } else {
      Taro.showToast({
        title: '活动已结束',
        icon: 'none'
      })
    }
  }

  return (
    <View className="activities-page">
      {/* 状态栏占位 */}
      <View className="status-bar-placeholder" style={{ height: `${statusBarHeight}px` }} />
      
      {/* 头部区域 */}
      <View className="header-section">
        <Text className="page-title">所有活动</Text>
      </View>

      {/* 筛选栏 */}
      <View className="filter-section">
        {/* 城市筛选 */}
        <View className="filter-group">
          <View className="filter-label">
            <Text className="label-icon">📍</Text>
            <Text className="label-text">城市</Text>
          </View>
          <ScrollView className="filter-scroll" scrollX showScrollbar={false}>
            {CITY_FILTERS.map((item) => (
              <View
                key={item.value || 'all'}
                className={`filter-chip ${cityFilter === item.value ? 'active' : ''}`}
                onClick={() => setCityFilter(item.value)}
              >
                <Text className="chip-text">{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 状态筛选 */}
        <View className="filter-group">
          <View className="filter-label">
            <Text className="label-icon">🔍</Text>
            <Text className="label-text">状态</Text>
          </View>
          <ScrollView className="filter-scroll" scrollX showScrollbar={false}>
            {STATUS_FILTERS.map((item) => (
              <View
            key={item.value || 'all'}
                className={`filter-chip ${statusFilter === item.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(item.value)}
          >
                <Text className="chip-text">{item.label}</Text>
              </View>
        ))}
          </ScrollView>
        </View>
      </View>

      {/* 活动列表 */}
      <View className="list-section">
        {loading ? (
          <ListSkeleton count={5} />
        ) : activities.length === 0 ? (
          <Empty
            title="暂无活动"
            desc="尝试调整筛选条件"
          />
        ) : (
          <ScrollView className="list-scroll" scrollY enhanced showScrollbar={false}>
            {activities.map((activity) => (
              <Card
                key={activity.id}
                radius="large"
                shadow
                onClick={() => handleActivityClick(activity)}
                className="activity-card"
              >
                {/* 活动封面 */}
                <View className="card-cover">
                  <Image 
                    className="cover-image" 
                    src={activity.cover} 
                    mode="aspectFill" 
                  />
                  <Tag 
                    type={getTagType(activity.status)}
                    className="status-badge"
                  >
                    {activity.status === 'signup' && '报名中'}
                    {activity.status === 'upcoming' && '即将开始'}
                    {activity.status === 'ongoing' && '进行中'}
                    {activity.status === 'finished' && '已结束'}
                  </Tag>
                </View>

                {/* 活动信息 */}
                <View className="card-body">
                  <Text className="activity-title">{activity.title}</Text>
                  
                  <View className="activity-meta">
                    <View className="meta-item">
                      <Text className="meta-pin">⏰</Text>
                      <Text className="meta-text">
                        {formatDate(activity.start_time)} - {formatDate(activity.end_time)}
                      </Text>
            </View>
                    
                    <View className="meta-item">
                      <Text className="meta-pin">📍</Text>
                      <Text className="meta-text">{activity.location}</Text>
                    </View>
                    
                    <View className="meta-item">
                      <Text className="meta-pin">👤</Text>
                      <Text className="meta-text">{activity.signup_count}人已报名</Text>
                    </View>
                  </View>

                  {/* 底部操作栏 */}
                  <View className="card-actions">
                    <View className="price-info">
                      {activity.is_free ? (
                        <Text className="price-free">免费</Text>
                      ) : (
                        <>
                          <Text className="price-symbol">¥</Text>
                          <Text className="price-value">399</Text>
                        </>
                      )}
                    </View>
                    
                    <View onClick={(e) => handleSignupClick(e, activity)}>
                      <Button
                        type={activity.status === 'signup' ? 'primary' : 'secondary'}
                        size="small"
                        disabled={activity.status === 'finished'}
                      >
                        {activity.status === 'signup' && '立即报名'}
                        {activity.status === 'upcoming' && '即将开始'}
                        {activity.status === 'ongoing' && '查看详情'}
                        {activity.status === 'finished' && '已结束'}
              </Button>
            </View>
          </View>
                </View>
              </Card>
        ))}
            
            <View className="bottom-spacer" />
          </ScrollView>
        )}
      </View>

      {/* 自定义TabBar */}
      <CustomTabBar current={1} />
    </View>
  )
}

export default ActivityListPage
