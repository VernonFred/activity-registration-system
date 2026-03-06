import { useTranslation } from 'react-i18next'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import ThemeToggle from '../../components/ThemeToggle'
import { useTheme } from '../../context/ThemeContext'
import { mockCurrentUser } from '../../mock'
import type { MockActivity } from '../../mock/activities'
import FeaturedSection from './components/FeaturedSection'
import HistorySection from './components/HistorySection'
import { useHomePage } from './hooks/useHomePage'
import './index.scss'

import iconBell from '../../assets/icons/bell.png'
import iconSearch from '../../assets/icons/search.png'
import iconCalendar from '../../assets/icons/calendar.png'
import iconMapPin from '../../assets/icons/map-pin.png'
import iconArrowRight from '../../assets/icons/arrow-right.png'

const IndexPage = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentIndex, featuredActivities, historyActivities, loading, setCurrentIndex, statusBarHeight } = useHomePage(t)

  const handleActivityClick = (activity: MockActivity) => {
    if (activity.status === 'finished' && activity.article_url) {
      Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(activity.article_url)}` })
      return
    }
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activity.id}` })
  }

  return (
    <View className={`index-page theme-${theme}`}>
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />

      <View className="user-header">
        <View className="user-left">
          <View className="avatar">
            {mockCurrentUser.avatar ? <Image src={mockCurrentUser.avatar} className="avatar-img" mode="aspectFill" /> : <Text className="avatar-text">{mockCurrentUser.name.charAt(0)}</Text>}
          </View>
          <View className="user-info"><Text className="greeting">{t('home.greeting')}</Text><Text className="username">{mockCurrentUser.name}</Text></View>
        </View>
        <View className="user-right">
          <ThemeToggle />
          <View className="notification-btn" onClick={() => Taro.navigateTo({ url: '/pages/profile/index?tab=notifications' })}>
            <Image src={iconBell} className="icon-img" mode="aspectFit" />
            <View className="notification-dot" />
          </View>
        </View>
      </View>

      <View className="search-bar" onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>
        <Image src={iconSearch} className="search-icon" mode="aspectFit" />
        <Text className="search-placeholder">{t('home.searchPlaceholder')}</Text>
      </View>

      <ScrollView className="main-content" scrollY enhanced showScrollbar={false}>
        <FeaturedSection
          currentIndex={currentIndex}
          featuredActivities={featuredActivities}
          iconArrowRight={iconArrowRight}
          iconCalendar={iconCalendar}
          iconMapPin={iconMapPin}
          loading={loading}
          onActivityClick={handleActivityClick}
          onSwiperChange={(e) => setCurrentIndex(e.detail.current)}
          onViewAll={() => Taro.navigateTo({ url: '/pages/activities/index?type=featured' })}
        />
        <HistorySection
          historyActivities={historyActivities}
          iconArrowRight={iconArrowRight}
          iconCalendar={iconCalendar}
          iconMapPin={iconMapPin}
          loading={loading}
          onActivityClick={handleActivityClick}
          onViewAll={() => Taro.navigateTo({ url: '/pages/activities/index?type=history' })}
        />
        <View className="bottom-spacer" />
      </ScrollView>

      <CustomTabBar current={0} />
    </View>
  )
}

export default IndexPage
