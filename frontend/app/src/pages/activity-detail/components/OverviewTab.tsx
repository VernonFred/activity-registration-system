/**
 * 活动速览Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { Activity } from '../types'
import { formatDate } from '../utils'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface OverviewTabProps {
  activity: Activity
  theme: string
}

const OverviewTab: React.FC<OverviewTabProps> = ({ activity, theme }) => {
  const { t } = useTranslation()
  const mapConfig = activity.extra?.overview?.map || {}
  const latitude = Number(mapConfig?.lat)
  const longitude = Number(mapConfig?.lng)
  const canNavigate = Number.isFinite(latitude) && Number.isFinite(longitude)

  const handleOpenLocation = () => {
    if (!canNavigate) return

    Taro.openLocation({
      latitude,
      longitude,
      name: mapConfig?.label || activity.location_name || activity.title,
      address: activity.location_address || activity.location_name || '',
      scale: 18,
    }).catch(() => {
      Taro.showToast({
        title: t('activityDetail.navigateFailed'),
        icon: 'none',
      })
    })
  }

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
        <View className={`info-row ${canNavigate ? 'is-clickable' : ''}`} onClick={canNavigate ? handleOpenLocation : undefined}>
          <View className="row-left">
            <Image src={iconMapPin} className="row-icon" mode="aspectFit" />
            <View className="row-content">
              <Text className="main-text">
                {activity.location_city} | {activity.location_name}
              </Text>
              <Text className="sub-text">{activity.location_address}</Text>
            </View>
          </View>
          {canNavigate && (
            <View className="row-right map-cta">
              <Text className="map-link-text">{t('activityDetail.openMap')}</Text>
            </View>
          )}
        </View>

        <View className="info-divider" />

        {(activity.contact_name || activity.contact_phone || activity.contact_email) && (
          <>
            <View className="contact-section">
              <Text className="section-title">{t('activityDetail.contactSection')}</Text>
              <View className="contact-grid">
                {activity.contact_name && (
                  <View className="contact-item">
                    <Text className="contact-label">{t('activityDetail.contactName')}</Text>
                    <Text className="contact-value">{activity.contact_name}</Text>
                  </View>
                )}
                {activity.contact_phone && (
                  <View className="contact-item">
                    <Text className="contact-label">{t('activityDetail.contactPhone')}</Text>
                    <Text className="contact-value">{activity.contact_phone}</Text>
                  </View>
                )}
                {activity.contact_email && (
                  <View className="contact-item">
                    <Text className="contact-label">{t('activityDetail.contactEmail')}</Text>
                    <Text className="contact-value">{activity.contact_email}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="info-divider" />
          </>
        )}

        {activity.extra?.overview?.show_signup_count !== false && (
          <>
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
          </>
        )}

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
