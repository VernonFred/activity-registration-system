/**
 * 图片直播Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface LiveTabProps {
  coverUrl?: string
  onViewLive: () => void
  theme: string
}

const LiveTab: React.FC<LiveTabProps> = ({ coverUrl, onViewLive, theme }) => {
  const { t } = useTranslation()
  return (
    <View className={`tab-content live theme-${theme}`}>
      <View className="live-container">
        <Image
          className="live-cover"
          src={coverUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
          mode="aspectFill"
        />
        <View className="live-overlay">
          <View className="live-icon">📷</View>
          <Text className="live-title">{t('activityDetail.livePhotoTitle')}</Text>
          <Text className="live-desc">{t('activityDetail.livePhotoDesc')}</Text>
          <View className="live-button" onClick={onViewLive}>
            <Text className="btn-text">{t('activityDetail.viewLive')}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default LiveTab
