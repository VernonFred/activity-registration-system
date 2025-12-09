/**
 * 搜索页面 - Lovable 风格 + 双主题
 * 重构时间: 2025年12月9日
 * 代码行数: 从511行优化至约200行
 */
import { View, ScrollView } from '@tarojs/components'
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
import {
  SearchHeader,
  RecentSearches,
  RecentViews,
  HotSearches,
  SearchResults,
} from './components'
import { CATEGORIES, MOCK_HOT_SEARCHES } from './constants'
import './index.scss'

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
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  
  const debouncedKeyword = useDebounce(keyword, 300)
  
  // 初始化
  useEffect(() => {
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    setStatusBarHeight(menuButtonInfo.bottom + 10)
    
    setRecentSearches(getRecentSearches())
    setRecentViews(getRecentViews())
    setFavorites(getFavorites())
    
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.initialKeyword) {
      const initialKeyword = decodeURIComponent(params.initialKeyword)
      setKeyword(initialKeyword)
      setTimeout(() => performSearch(initialKeyword, activeCategory, 1), 100)
    }
  }, [])
  
  // 搜索响应
  useEffect(() => {
    if (debouncedKeyword.trim()) {
      performSearch(debouncedKeyword, activeCategory, 1)
    } else {
      setIsSearching(false)
      setSearchResults([])
      setIsEmpty(false)
    }
  }, [debouncedKeyword, activeCategory])
  
  // 执行搜索
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
  
  // 事件处理
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
    if (keyword.trim()) setPage(1)
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
  
  const navigateToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  }
  
  return (
    <View className={`search-page theme-${theme}`}>
      <SearchHeader
        keyword={keyword}
        statusBarHeight={statusBarHeight}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
        onClear={handleClearKeyword}
        onBack={() => Taro.navigateBack()}
      />

      {isSearching ? (
        <SearchResults
          results={searchResults}
          total={total}
          categories={CATEGORIES}
          activeCategory={activeCategory}
          isLoading={isLoading}
          isEmpty={isEmpty}
          hasMore={hasMore}
          favorites={favorites}
          onCategoryChange={handleCategoryChange}
          onResultClick={navigateToDetail}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <ScrollView scrollY className="search-content" enhanced showScrollbar={false}>
          <RecentSearches
            searches={recentSearches}
            onSearchClick={setKeyword}
            onRemove={handleRemoveRecentSearch}
            onClearAll={handleClearRecentSearches}
          />

          <RecentViews
            views={recentViews}
            onViewClick={navigateToDetail}
            onClearAll={handleClearRecentViews}
          />

          <HotSearches
            searches={MOCK_HOT_SEARCHES}
            onSearchClick={setKeyword}
          />
          
          <View className="bottom-spacer" />
        </ScrollView>
      )}
    </View>
  )
}

export default SearchPage
