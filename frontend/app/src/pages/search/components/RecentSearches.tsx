/**
 * 最近搜索组件
 * 创建时间: 2025年12月9日
 */
import { View, Text } from '@tarojs/components'

interface RecentSearchesProps {
  searches: string[]
  onSearchClick: (item: string) => void
  onRemove: (item: string, e: any) => void
  onClearAll: () => void
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchClick,
  onRemove,
  onClearAll,
}) => {
  if (searches.length === 0) return null

  return (
    <View className="search-section">
      <View className="section-header">
        <Text className="section-title">最近搜索</Text>
        <Text className="clear-all-btn" onClick={onClearAll}>清除全部</Text>
      </View>
      <View className="recent-tags">
        {searches.map((item, index) => (
          <View 
            key={index} 
            className="recent-tag" 
            onClick={() => onSearchClick(item)}
          >
            <Text className="tag-text">{item}</Text>
            <Text 
              className="tag-close" 
              onClick={(e) => onRemove(item, e)}
            >
              ×
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default RecentSearches

