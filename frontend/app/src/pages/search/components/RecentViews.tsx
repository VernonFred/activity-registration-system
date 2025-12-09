/**
 * 最近浏览组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import type { RecentViewItem } from '../types'
import { getStatusLabel } from '../constants'

interface RecentViewsProps {
  views: RecentViewItem[]
  onViewClick: (id: number) => void
  onClearAll: () => void
}

const RecentViews: React.FC<RecentViewsProps> = ({
  views,
  onViewClick,
  onClearAll,
}) => {
  if (views.length === 0) return null

  return (
    <View className="search-section">
      <View className="section-header">
        <Text className="section-title">最近浏览</Text>
        <Text className="clear-all-btn" onClick={onClearAll}>清除全部</Text>
      </View>
      <ScrollView scrollX className="recent-views-scroll" enhanced showScrollbar={false}>
        <View className="recent-views-list">
          {views.map(item => (
            <View
              key={item.id}
              className="recent-view-card"
              onClick={() => onViewClick(item.id)}
            >
              {/* 封面图 */}
              <View className="view-cover-wrapper">
                <Image 
                  src={item.cover_url && item.cover_url.length > 10 
                    ? item.cover_url 
                    : `https://picsum.photos/seed/view${item.id}/400/300`} 
                  className="view-cover-img" 
                  mode="aspectFill" 
                />
                <View className="view-cover-gradient" />
              </View>
              {/* 内容 */}
              <View className="view-content">
                <View className="view-date-row">
                  <Text className="view-date">{item.date || '2024年1月'} · {item.time || '08:00'}</Text>
                </View>
                <Text className="view-title">{item.title}</Text>
                <View className="view-bottom">
                  <View className="view-status">
                    <Text className="status-label">{getStatusLabel(item.status || '')}</Text>
                  </View>
                  <View className="view-location-row">
                    <Text className="view-location">{item.location || '待定'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default RecentViews

