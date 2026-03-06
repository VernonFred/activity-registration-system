import { Image, Text, View } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { MockActivity } from '../../../mock/activities'
import { formatDate } from '../utils'

interface HistorySectionProps {
  historyActivities: MockActivity[]
  iconArrowRight: string
  iconCalendar: string
  iconMapPin: string
  loading: boolean
  onActivityClick: (activity: MockActivity) => void
  onViewAll: () => void
}

const HistorySection = ({ historyActivities, iconArrowRight, iconCalendar, iconMapPin, loading, onActivityClick, onViewAll }: HistorySectionProps) => {
  const { t } = useTranslation()

  return (
    <View className="section history-section">
      <View className="section-header">
        <Text className="section-title">{t('home.historyEvents')}</Text>
        <View className="view-all" onClick={onViewAll}><Text className="view-all-text">{t('common.more')}</Text><Image src={iconArrowRight} className="view-all-icon" mode="aspectFit" /></View>
      </View>

      {loading ? (
        <View className="skeleton-list">{[1, 2, 3].map((i) => <View key={i} className="skeleton-item" />)}</View>
      ) : historyActivities.length === 0 ? (
        <View className="empty-state"><Text className="empty-text">{t('home.noHistoryEvents')}</Text><Text className="empty-desc">{t('home.historyHint')}</Text></View>
      ) : (
        <View className="history-list">
          {historyActivities.slice(0, 5).map((activity) => (
            <View key={activity.id} className="history-card" onClick={() => onActivityClick(activity)}>
              <View className="history-thumb"><Image src={activity.cover} className="thumb-img" mode="aspectFill" /></View>
              <View className="history-content">
                <Text className="history-title">{activity.title}</Text>
                <View className="history-meta">
                  <View className="meta-item"><Image src={iconCalendar} className="meta-icon-sm" mode="aspectFit" /><Text className="meta-text">{formatDate(activity.start_time)}</Text></View>
                  <View className="meta-item"><Image src={iconMapPin} className="meta-icon-sm" mode="aspectFit" /><Text className="meta-text">{activity.location}</Text></View>
                </View>
              </View>
              <View className="history-arrow"><Image src={iconArrowRight} className="arrow-icon" mode="aspectFit" /></View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default HistorySection
