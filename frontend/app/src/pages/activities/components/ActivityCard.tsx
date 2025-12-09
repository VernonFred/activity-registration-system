/**
 * 活动卡片组件 - Lovable 精致风格
 * 创建时间: 2025年12月09日 12:00
 * 更新时间: 2025年12月09日 13:30
 * 
 * 更新内容：
 * - 调整"去报名"按钮尺寸，移至右下角
 * - 添加卡片悬浮阴影和橙色边框反馈
 * - 优化整体排版更精致
 */

import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../../context/ThemeContext'
import type { ActivityItem } from '../types'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface ActivityCardProps {
  activity: ActivityItem
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { theme } = useTheme()

  // 格式化日期
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startStr = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}`
    const endStr = `${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`
    return `${startStr}-${endStr}`
  }

  // 点击卡片
  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    })
  }

  // 点击报名按钮
  const handleSignupClick = (e: any) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/signup/index?activityId=${activity.id}`
    })
  }

  return (
    <View className={`activity-card theme-${theme}`} onClick={handleCardClick}>
      {/* 左侧封面图 */}
      <View className="card-cover">
        <Image src={activity.cover} className="cover-img" mode="aspectFill" />
        {/* 免费标签 */}
        {activity.isFree && (
          <View className="free-badge">
            <Text className="free-text">免费</Text>
          </View>
        )}
      </View>

      {/* 右侧内容区 */}
      <View className="card-body">
        {/* 标题区 */}
        <View className="card-header">
          <Text className="card-title">{activity.title}</Text>
          {/* 评分 */}
          <View className="card-rating">
            <Text className="star-icon">★</Text>
            <Text className="rating-score">{activity.rating}</Text>
            <Text className="rating-count">({activity.ratingCount})</Text>
          </View>
        </View>

        {/* 元信息 */}
        <View className="card-meta-list">
          {/* 日期 */}
          <View className="meta-row">
            <Image src={iconCalendar} className="meta-icon" mode="aspectFit" />
            <Text className="meta-text">{formatDateRange(activity.startDate, activity.endDate)}</Text>
          </View>

          {/* 地点 */}
          <View className="meta-row">
            <Image src={iconMapPin} className="meta-icon" mode="aspectFit" />
            <Text className="meta-text location-text">{activity.city} {activity.location}</Text>
          </View>
        </View>

        {/* 底部操作区 */}
        <View className="card-footer">
          <View className="signup-btn" onClick={handleSignupClick}>
            <Text className="btn-text">去报名</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ActivityCard
