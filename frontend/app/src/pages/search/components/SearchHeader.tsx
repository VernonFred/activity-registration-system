/**
 * 搜索头部组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Input, Image } from '@tarojs/components'
import SearchIcon from '../../../assets/icons/search.png'
import ArrowLeftIcon from '../../../assets/icons/arrow-left.png'

interface SearchHeaderProps {
  keyword: string
  statusBarHeight: number
  onKeywordChange: (value: string) => void
  onSearch: () => void
  onClear: (e: any) => void
  onBack: () => void
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  keyword,
  statusBarHeight,
  onKeywordChange,
  onSearch,
  onClear,
  onBack,
}) => {
  return (
    <>
      {/* 状态栏 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
      
      {/* 顶部导航 */}
      <View className="search-header">
        <View className="back-btn" onClick={onBack}>
          <Image src={ArrowLeftIcon} className="back-icon" mode="aspectFit" />
        </View>
        
        <View className="search-input-wrapper">
          <Image src={SearchIcon} className="search-icon" mode="aspectFit" />
          <Input
            className="search-input"
            placeholder="搜索活动、会议、讲座..."
            placeholderClass="search-placeholder"
            value={keyword}
            onInput={(e) => onKeywordChange(e.detail.value)}
            onConfirm={onSearch}
            confirmType="search"
          />
          {keyword && (
            <View className="clear-btn" onClick={onClear}>
              <Text className="clear-icon">×</Text>
            </View>
          )}
        </View>
      </View>
    </>
  )
}

export default SearchHeader

