/**
 * 热门搜索组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { HotSearchItem } from '../types'

interface HotSearchesProps {
  searches: HotSearchItem[]
  onSearchClick: (title: string) => void
}

const HotSearches: React.FC<HotSearchesProps> = ({ searches, onSearchClick }) => {
  return (
    <View className="search-section">
      <Text className="section-title">热门搜索</Text>
      <View className="hot-search-list">
        {searches.map(item => (
          <View
            key={item.id}
            className="hot-search-item"
            onClick={() => onSearchClick(item.title)}
          >
            <Image src={item.cover} className="hot-cover" mode="aspectFill" />
            <View className="hot-info">
              <Text className="hot-title">{item.title}</Text>
              <Text className="hot-meta">{item.count} · {item.time}</Text>
            </View>
            <View className="hot-badge">
              <Text className="badge-text">热门</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default HotSearches

