/**
 * 活动速览Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { Activity } from '../types'
import { formatDate, formatDistance } from '../utils'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface OverviewTabProps {
  activity: Activity
  theme: string
}

const OverviewTab: React.FC<OverviewTabProps> = ({ activity, theme }) => {
  return (
    <View className={`tab-content overview theme-${theme}`}>
      {/* 标题卡片（Lovable 风格） */}
      <View className="title-card">
        <View className="title-row">
          <Text className="city-text">{activity.location_city || '长沙'}</Text>
          <Text className="divider">|</Text>
          <Text className="activity-title">{activity.title}</Text>
        </View>
        {activity.fee_type === 'free' && (
          <View className="fee-tag free">
            <Text className="fee-text">免费</Text>
          </View>
        )}
      </View>

      {/* 活动信息卡片 */}
      <View className="info-card">
        {/* 标题区 */}
        <View className="info-header">
          <View className="title-row">
            <Text className="city-text">{activity.location_city || '长沙'}</Text>
            <Text className="divider">|</Text>
            <Text className="activity-title">{activity.title}</Text>
          </View>
          <View className={`fee-tag ${activity.fee_type === 'free' ? 'free' : 'paid'}`}>
            <Text className="fee-text">{activity.fee_type === 'free' ? '免费' : `¥${activity.fee_amount}`}</Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 时间信息 */}
        <View className="info-row">
          <View className="row-left">
            <Image src={iconCalendar} className="row-icon" mode="aspectFit" />
            <View className="row-content">
              <Text className="main-text">{formatDate(activity.start_time)}-{formatDate(activity.end_time)}</Text>
              <Text className="sub-text">以实际情况为准</Text>
            </View>
          </View>
          <View className="row-right">
            <Text className="deadline-text">
              {activity.signup_deadline ? `${formatDate(activity.signup_deadline)} 截止报名` : ''}
            </Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 地点信息 */}
        <View className="info-row">
          <View className="row-left">
            <Image src={iconMapPin} className="row-icon" mode="aspectFit" />
            <View className="row-content">
              <Text className="main-text">{activity.location_city} | {activity.location_name}</Text>
              <Text className="sub-text">{activity.location_address}</Text>
            </View>
          </View>
          <View className="row-right distance">
            <Text className="distance-icon">📍</Text>
            <Text className="distance-text">{formatDistance(401.9)}</Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 报名人数 */}
        <View className="participants-section">
          <Text className="participants-label">目前报名人数</Text>
          <View className="participants-info">
            <Text className="participants-count">{activity.current_participants || 215}</Text>
            <Text className="participants-unit">人</Text>
            <View className="avatar-stack">
              {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                  key={i}
                    className="avatar-img"
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    mode="aspectFill"
                  style={{ left: `${(i - 1) * 16}px` }}
                  />
              ))}
            </View>
            <Text className="signup-status">火热报名中</Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 活动介绍 */}
        <View className="description-section">
          <Text className="section-title">活动介绍</Text>
          <Text className="description-text">
            {activity.description || '1. 临近前请您提前规划好行程，做好相应准备，以免影响您的正常出行。\n2. 请携带好相关证件，以便入住登记。\n3. 如有特殊饮食需求，请提前告知工作人员。'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default OverviewTab
