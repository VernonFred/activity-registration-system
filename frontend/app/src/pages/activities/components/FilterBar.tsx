/**
 * 筛选栏组件
 * 创建时间: 2025年12月09日 12:00
 * 
 * 包含：城市、时间、状态三个下拉筛选 + 排序按钮
 */

import { View, Text, Image } from '@tarojs/components'
import { useTheme } from '../../../context/ThemeContext'
import type { FilterState } from '../types'
import { CITY_FILTERS, TIME_FILTERS, STATUS_FILTERS } from '../constants'

// 图标
import iconFilter from '../../../assets/icons/filter.png'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onSortClick: () => void
}

const FilterBar = ({ filters, onFilterChange, onSortClick }: FilterBarProps) => {
  const { theme } = useTheme()

  // 获取筛选器显示文本
  const getFilterLabel = (options: { label: string; value: string }[], value: string) => {
    const option = options.find(o => o.value === value)
    return option?.label || options[0].label
  }

  return (
    <View className={`filter-bar theme-${theme}`}>
      {/* 城市筛选 */}
      <View 
        className={`filter-item ${filters.city ? 'active' : ''}`}
        onClick={() => {
          // TODO: 弹出选择器
          const currentIndex = CITY_FILTERS.findIndex(c => c.value === filters.city)
          const nextIndex = (currentIndex + 1) % CITY_FILTERS.length
          onFilterChange('city', CITY_FILTERS[nextIndex].value)
        }}
      >
        <Text className="filter-text">{getFilterLabel(CITY_FILTERS, filters.city)}</Text>
        <View className="filter-arrow" />
      </View>

      {/* 时间筛选 */}
      <View 
        className={`filter-item ${filters.timeRange ? 'active' : ''}`}
        onClick={() => {
          const currentIndex = TIME_FILTERS.findIndex(t => t.value === filters.timeRange)
          const nextIndex = (currentIndex + 1) % TIME_FILTERS.length
          onFilterChange('timeRange', TIME_FILTERS[nextIndex].value)
        }}
      >
        <Text className="filter-text">{getFilterLabel(TIME_FILTERS, filters.timeRange)}</Text>
        <View className="filter-arrow" />
      </View>

      {/* 状态筛选 */}
      <View 
        className={`filter-item ${filters.status ? 'active' : ''}`}
        onClick={() => {
          const currentIndex = STATUS_FILTERS.findIndex(s => s.value === filters.status)
          const nextIndex = (currentIndex + 1) % STATUS_FILTERS.length
          onFilterChange('status', STATUS_FILTERS[nextIndex].value)
        }}
      >
        <Text className="filter-text">{getFilterLabel(STATUS_FILTERS, filters.status)}</Text>
        <View className="filter-arrow" />
      </View>

      {/* 排序按钮 */}
      <View className="filter-sort" onClick={onSortClick}>
        <Image src={iconFilter} className="sort-icon" mode="aspectFit" />
      </View>
    </View>
  )
}

export default FilterBar

