/**
 * 搜索结果组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import type { SearchResult } from '../types'
import type { Category } from '../types'
import SearchIcon from '../../../assets/icons/search.png'

interface SearchResultsProps {
  results: SearchResult[]
  total: number
  categories: Category[]
  activeCategory: string
  isLoading: boolean
  isEmpty: boolean
  hasMore: boolean
  favorites: Set<number>
  onCategoryChange: (category: string) => void
  onResultClick: (id: number) => void
  onToggleFavorite: (id: number, e: any) => void
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  total,
  categories,
  activeCategory,
  isLoading,
  isEmpty,
  hasMore,
  favorites,
  onCategoryChange,
  onResultClick,
  onToggleFavorite,
}) => {
  return (
    <View className="search-results-container">
      {/* 分类标签 */}
      <ScrollView scrollX className="category-scroll" enhanced showScrollbar={false}>
        <View className="category-list">
          {categories.map(cat => (
            <View
              key={cat.key}
              className={`category-item ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.key)}
            >
              <Text className="category-label">{cat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 加载状态 */}
      {isLoading && (
        <View className="loading-state">
          <View className="loading-spinner" />
          <Text className="loading-text">搜索中...</Text>
        </View>
      )}

      {/* 空状态 */}
      {!isLoading && isEmpty && (
        <View className="empty-state">
          <View className="empty-icon-wrapper">
            <Image src={SearchIcon} className="empty-icon" mode="aspectFit" />
          </View>
          <Text className="empty-title">未找到相关活动</Text>
          <Text className="empty-desc">试试其它关键词吧</Text>
        </View>
      )}

      {/* 结果列表 */}
      {!isLoading && !isEmpty && (
        <>
          <View className="results-header">
            <Text className="results-title">发现活动</Text>
            <Text className="results-count">({total})</Text>
          </View>

          <ScrollView
            scrollX
            className="results-scroll"
            enhanced
            showScrollbar={false}
          >
            <View className="results-grid">
              {results.map(item => (
                <View
                  key={item.id}
                  className="result-card"
                  onClick={() => onResultClick(item.id)}
                >
                  <View className="card-cover">
                    <Image 
                      src={item.cover || 'https://picsum.photos/400/300'} 
                      className="cover-image" 
                      mode="aspectFill" 
                    />
                    <View
                      className={`favorite-btn ${favorites.has(item.id) ? 'active' : ''}`}
                      onClick={(e) => onToggleFavorite(item.id, e)}
                    >
                      <Text className="favorite-icon">
                        {favorites.has(item.id) ? '♥' : '♡'}
                      </Text>
                    </View>
                  </View>
                  <View className="card-info">
                    <Text className="card-title">{item.title}</Text>
                    <Text className="card-location">{item.location || '福建省，厦门市'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {hasMore && (
            <View className="load-more-tip">
              <Text className="load-more-text">← 左右滑动查看更多 →</Text>
            </View>
          )}
        </>
      )}
    </View>
  )
}

export default SearchResults

