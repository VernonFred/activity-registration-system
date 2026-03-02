/**
 * 活动速览Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <View className={`tab-content overview theme-${theme}`}>
      {/* 标题区域（Lovable 风格 - 只显示一次） */}
      <View className="title-section">
        <Text className="main-title">{activity.location_city} | {activity.title}</Text>
        {activity.fee_type === 'free' && (
          <View className="free-badge">
            <Text className="badge-text">{t('activityDetail.free')}</Text>
          </View>
        )}
        </View>

      {/* 日期时间卡片 */}
      <View className="info-card">

        {/* 时间信息 */}
        <View className="info-row">
          <View className="row-left">
            <Image src={iconCalendar} className="row-icon" mode="aspectFit" />
            <View className="row-content">
              <Text className="main-text">{formatDate(activity.start_time)}-{formatDate(activity.end_time)}</Text>
              <Text className="sub-text">{t('activityDetail.subjectToChange')}</Text>
            </View>
          </View>
          <View className="row-right">
            <Text className="deadline-text">
              {activity.signup_deadline ? `${formatDate(activity.signup_deadline)} ${t('activityDetail.signupDeadline')}` : ''}
            </Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 地点信息 */}
        <View className="info-row">
          <View className="row-left">
            <Image src={iconMapPin} className="row-icon" mode="aspectFit" />
            <View className="row-content">
              <Text className="main-text">
                {activity.location_city} | {activity.location_name}
              </Text>
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
          <Text className="participants-label">{t('activityDetail.currentParticipants')}</Text>
          <View className="participants-info">
            <Text className="participants-count">{activity.current_participants || 215}</Text>
            <Text className="participants-unit">{t('common.person')}</Text>
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
            <Text className="signup-status">{t('activityDetail.hotRegistration')}</Text>
          </View>
        </View>

        <View className="info-divider" />

        {/* 活动介绍 */}
        <View className="description-section">
          <Text className="section-title">{t('activityDetail.introductionTitle')}</Text>
          <Text className="description-text">
            {activity.description}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default OverviewTab
