/**
 * 搜索页面 - Lovable 风格 + 双主题
 */
import { View, Text, Input, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useTheme } from '../../context/ThemeContext'
import { searchActivities } from '../../services/activities'
import { toggleFavorite } from '../../services/engagements'
import type { MockActivity } from '../../mock/activities'
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  getRecentViews,
  clearRecentViews,
  getFavorites
} from '../../utils/storage'
import './index.scss'

// 图标导入 - Lucide Icons PNG
import SearchIcon from '../../assets/icons/search.png'
import ArrowLeftIcon from '../../assets/icons/arrow-left.png'

// 活动分类
const CATEGORIES = [
  { key: 'all', label: '所有活动' },
  { key: 'forum', label: '论坛' },
  { key: 'summit', label: '峰会' },
]

// 状态中英文转换
const STATUS_MAP: Record<string, string> = {
  signup: '报名中',
  upcoming: '即将开始',
  ongoing: '进行中',
  finished: '已结束',
  draft: '草稿',
  scheduled: '即将开始',
  published: '报名中',
  closed: '已截止',
  archived: '已结束',
}

const getStatusLabel = (status: string) => STATUS_MAP[status] || status

// 模拟热门搜索
const MOCK_HOT_SEARCHES = [
  { 
    id: 1, 
    title: '第八届高等教育博览会', 
    count: '1,23k 搜索', 
    time: '今日',
    cover: 'https://picsum.photos/200/200?random=1'
  },
  { 
    id: 2, 
    title: '2025教育创新峰会', 
    count: '856 搜索', 
    time: '本周',
    cover: 'https://picsum.photos/200/200?random=2'
  },
  { 
    id: 3, 
    title: '智慧校园建设论坛', 
    count: '632 搜索', 
    time: '本周',
    cover: 'https://picsum.photos/200/200?random=3'
  },
]

const SearchPage = () => {
  const { theme } = useTheme()
  
  // 搜索状态
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 状态标识
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // 数据
  const [searchResults, setSearchResults] = useState<MockActivity[]>([])
  const [total, setTotal] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [recentViews, setRecentViews] = useState<any[]>([])
  const [hotSearches] = useState(MOCK_HOT_SEARCHES)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  
  const debouncedKeyword = useDebounce(keyword, 300)
  
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    // 获取状态栏高度 + 额外偏移（避开微信胶囊按钮）
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    // 胶囊按钮底部位置 + 间距
    const safeTop = menuButtonInfo.bottom + 10
    setStatusBarHeight(safeTop)
    
    setRecentSearches(getRecentSearches())
    setRecentViews(getRecentViews())
    setFavorites(getFavorites())
    
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.initialKeyword) {
      const initialKeyword = decodeURIComponent(params.initialKeyword)
      setKeyword(initialKeyword)
      setTimeout(() => {
        performSearch(initialKeyword, activeCategory, 1)
      }, 100)
    }
  }, [])
  
  useEffect(() => {
    if (debouncedKeyword.trim()) {
      performSearch(debouncedKeyword, activeCategory, 1)
    } else {
      setIsSearching(false)
      setSearchResults([])
      setIsEmpty(false)
    }
  }, [debouncedKeyword, activeCategory])
  
  const performSearch = async (
    searchKeyword: string,
    category: string,
    searchPage: number,
    isLoadMore: boolean = false
  ) => {
    if (!searchKeyword.trim()) return
    
    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setIsSearching(true)
      }
      
      const result = await searchActivities(searchKeyword, {
        category,
        page: searchPage,
        per_page: pageSize
      }) as any
      
      if (isLoadMore) {
        setSearchResults(prev => [...prev, ...result.data])
      } else {
        setSearchResults(result.data)
        setPage(searchPage)
        addRecentSearch(searchKeyword)
        setRecentSearches(getRecentSearches())
      }
      
      setTotal(result.total)
      setHasMore(result.hasMore)
      setIsEmpty(result.data.length === 0)
      
    } catch (error) {
      console.error('搜索失败:', error)
      Taro.showToast({ title: '搜索失败，请重试', icon: 'none' })
      setIsEmpty(true)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }
  
  const handleClearKeyword = (e: any) => {
    e.stopPropagation()
    setKeyword('')
    setIsSearching(false)
    setSearchResults([])
    setIsEmpty(false)
  }

  const handleSearch = () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    performSearch(keyword, activeCategory, 1)
  }
  
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return
    setActiveCategory(category)
    if (keyword.trim()) {
      setPage(1)
    }
  }
  
  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || isLoading) return
    const nextPage = page + 1
    setPage(nextPage)
    performSearch(keyword, activeCategory, nextPage, true)
  }
  
  const handleRecentSearchClick = (item: string) => {
    setKeyword(item)
  }
  
  const handleRemoveRecentSearch = (item: string, e: any) => {
    e.stopPropagation()
    removeRecentSearch(item)
    setRecentSearches(getRecentSearches())
  }
  
  const handleClearRecentSearches = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清除所有搜索记录吗？',
      success: (res) => {
        if (res.confirm) {
          clearRecentSearches()
          setRecentSearches([])
        }
      }
    })
  }
  
  const handleRecentViewClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  }
  
  const handleClearRecentViews = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清除所有浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          clearRecentViews()
          setRecentViews([])
        }
      }
    })
  }
  
  const handleHotSearchClick = (title: string) => {
    setKeyword(title)
  }
  
  const handleResultClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  }
  
  const handleToggleFavorite = async (id: number, e: any) => {
    e.stopPropagation()
    const isFavorited = favorites.has(id)
    
    try {
      await toggleFavorite(id, isFavorited)
      const newFavorites = new Set(favorites)
      if (isFavorited) {
        newFavorites.delete(id)
        Taro.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        newFavorites.add(id)
        Taro.showToast({ title: '收藏成功', icon: 'success' })
      }
      setFavorites(newFavorites)
    } catch (error) {
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
  }
  
  const handleBack = () => {
    Taro.navigateBack()
  }
  
  return (
    <View className={`search-page theme-${theme}`}>
      {/* 状态栏 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
      
      {/* 顶部导航 */}
      <View className="search-header">
        <View className="back-btn" onClick={handleBack}>
          <Image src={ArrowLeftIcon} className="back-icon" mode="aspectFit" />
        </View>
        
        <View className="search-input-wrapper">
          <Image src={SearchIcon} className="search-icon" mode="aspectFit" />
          <Input
            className="search-input"
            placeholder="搜索活动、会议、讲座..."
            placeholderClass="search-placeholder"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
          />
          {keyword && (
            <View className="clear-btn" onClick={handleClearKeyword}>
              <Text className="clear-icon">×</Text>
            </View>
          )}
        </View>
      </View>

      {/* 搜索结果模式 */}
      {isSearching ? (
        <View className="search-results-container">
          {/* 分类标签 */}
          <ScrollView scrollX className="category-scroll" enhanced showScrollbar={false}>
            <View className="category-list">
              {CATEGORIES.map(cat => (
                <View
                  key={cat.key}
                  className={`category-item ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.key)}
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
                  {searchResults.map(item => (
                    <View
                      key={item.id}
                      className="result-card"
                      onClick={() => handleResultClick(item.id)}
                    >
                      <View className="card-cover">
                        <Image 
                          src={item.cover || 'https://picsum.photos/400/300'} 
                          className="cover-image" 
                          mode="aspectFill" 
                        />
                        <View
                          className={`favorite-btn ${favorites.has(item.id) ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(item.id, e)}
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
      ) : (
        /* 初始状态 */
        <ScrollView scrollY className="search-content" enhanced showScrollbar={false}>
          {/* 最近搜索 */}
          {recentSearches.length > 0 && (
            <View className="search-section">
              <View className="section-header">
                <Text className="section-title">最近搜索</Text>
                <Text className="clear-all-btn" onClick={handleClearRecentSearches}>清除全部</Text>
              </View>
              <View className="recent-tags">
                {recentSearches.map((item, index) => (
                  <View 
                    key={index} 
                    className="recent-tag" 
                    onClick={() => handleRecentSearchClick(item)}
                  >
                    <Text className="tag-text">{item}</Text>
                    <Text 
                      className="tag-close" 
                      onClick={(e) => handleRemoveRecentSearch(item, e)}
                    >
                      ×
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 最近浏览 - 照搬 Lovable Search.tsx */}
          {recentViews.length > 0 && (
            <View className="search-section">
              <View className="section-header">
                <Text className="section-title">最近浏览</Text>
                <Text className="clear-all-btn" onClick={handleClearRecentViews}>清除全部</Text>
              </View>
              <ScrollView scrollX className="recent-views-scroll" enhanced showScrollbar={false}>
                <View className="recent-views-list">
                  {recentViews.map(item => (
                    <View
                      key={item.id}
                      className="recent-view-card"
                      onClick={() => handleRecentViewClick(item.id)}
                    >
                      {/* 封面图 - 确保有图片 */}
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
                      {/* 内容 - 照搬 Lovable 结构 */}
                      <View className="view-content">
                        <View className="view-date-row">
                          <Text className="view-date">{item.date || '2024年1月'} · {item.time || '08:00'}</Text>
                        </View>
                        <Text className="view-title">{item.title}</Text>
                        <View className="view-bottom">
                          <View className="view-status">
                            <Text className="status-label">{getStatusLabel(item.status)}</Text>
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
          )}

          {/* 热门搜索 */}
          <View className="search-section">
            <Text className="section-title">热门搜索</Text>
            <View className="hot-search-list">
              {hotSearches.map(item => (
                <View
                  key={item.id}
                  className="hot-search-item"
                  onClick={() => handleHotSearchClick(item.title)}
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
          
          <View className="bottom-spacer" />
        </ScrollView>
      )}
    </View>
  )
}

export default SearchPage
