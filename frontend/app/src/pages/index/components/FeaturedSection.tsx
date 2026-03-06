import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { MockActivity } from '../../../mock/activities'
import { formatDateRange, getStatusConfig } from '../utils'

interface FeaturedSectionProps {
  currentIndex: number
  featuredActivities: MockActivity[]
  iconArrowRight: string
  iconCalendar: string
  iconMapPin: string
  loading: boolean
  onActivityClick: (activity: MockActivity) => void
  onSwiperChange: (e: any) => void
  onViewAll: () => void
}

const FeaturedSection = ({ currentIndex, featuredActivities, iconArrowRight, iconCalendar, iconMapPin, loading, onActivityClick, onSwiperChange, onViewAll }: FeaturedSectionProps) => {
  const { t } = useTranslation()

  return (
    <View className="section">
      <View className="section-header">
        <Text className="section-title">{t('home.hotPicks')}</Text>
        <View className="view-all" onClick={onViewAll}><Text className="view-all-text">{t('common.more')}</Text><Image src={iconArrowRight} className="view-all-icon" mode="aspectFit" /></View>
      </View>

      {loading ? (
        <View className="skeleton-cards">{[1, 2, 3].map((i) => <View key={i} className="skeleton-card" />)}</View>
      ) : featuredActivities.length === 0 ? (
        <View className="empty-state"><Text className="empty-text">{t('home.noHotEvents')}</Text><Text className="empty-desc">{t('home.stayTuned')}</Text></View>
      ) : (
        <>
          <Swiper className="featured-swiper" circular autoplay interval={4000} duration={500} previousMargin="80rpx" nextMargin="80rpx" current={currentIndex} onChange={onSwiperChange} easingFunction="easeOutCubic">
            {featuredActivities.map((activity, index) => (
              <SwiperItem key={activity.id} className="swiper-item">
                <View className={`event-card ${index === currentIndex ? 'active' : 'inactive'}`} onClick={() => onActivityClick(activity)}>
                  <View className="card-cover">
                    <Image src={activity.cover} className="cover-img" mode="aspectFill" />
                    <View className="cover-gradient" />
                    <View className={`status-badge ${getStatusConfig(activity.status, t).class}`}><Text className="status-text">{getStatusConfig(activity.status, t).label}</Text></View>
                  </View>
                  <View className="card-content">
                    <View className="card-date"><Image src={iconCalendar} className="meta-icon" mode="aspectFit" /><Text className="date-text">{formatDateRange(activity.start_time, activity.end_time)}</Text></View>
                    <Text className="card-title">{activity.title}</Text>
                    <View className="card-footer">
                      <View className="footer-item"><Image src={iconMapPin} className="meta-icon" mode="aspectFit" /><Text className="footer-text">{activity.location}</Text></View>
                      <View className="footer-item"><Image src={iconCalendar} className="meta-icon" mode="aspectFit" /><Text className="footer-text">{activity.signup_count.toLocaleString()}{t('common.person')}</Text></View>
                    </View>
                  </View>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
          <View className="indicators">{featuredActivities.map((_, idx) => <View key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />)}</View>
        </>
      )}
    </View>
  )
}

export default FeaturedSection
