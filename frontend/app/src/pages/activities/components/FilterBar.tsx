/**
 * 筛选栏组件
 * 创建时间: 2025年12月09日 12:00
 * 
 * 包含：城市、时间、状态三个下拉筛选 + 排序按钮
 */

import { View, Text, Image, Picker } from '@tarojs/components'
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

  // 获取当前选中的索引
  const getCityIndex = () => {
    const index = CITY_FILTERS.findIndex(c => c.value === filters.city)
    return index >= 0 ? index : 0
  }

  const getTimeIndex = () => {
    const index = TIME_FILTERS.findIndex(t => t.value === filters.timeRange)
    return index >= 0 ? index : 0
  }

  const getStatusIndex = () => {
    const index = STATUS_FILTERS.findIndex(s => s.value === filters.status)
    return index >= 0 ? index : 0
  }

  return (
    <View className={`filter-bar theme-${theme}`}>
      {/* 城市筛选 */}
      <Picker
        mode="selector"
        range={CITY_FILTERS}
        rangeKey="label"
        value={getCityIndex()}
        onChange={(e) => {
          const index = Number(e.detail.value)
          onFilterChange('city', CITY_FILTERS[index].value)
        }}
      >
        <View className={`filter-item ${filters.city && filters.city !== 'all' ? 'active' : ''}`}>
          <Text className="filter-text">{getFilterLabel(CITY_FILTERS, filters.city)}</Text>
          <View className="filter-arrow" />
        </View>
      </Picker>

      {/* 时间筛选 */}
      <Picker
        mode="selector"
        range={TIME_FILTERS}
        rangeKey="label"
        value={getTimeIndex()}
        onChange={(e) => {
          const index = Number(e.detail.value)
          onFilterChange('timeRange', TIME_FILTERS[index].value)
        }}
      >
        <View className={`filter-item ${filters.timeRange && filters.timeRange !== 'all' ? 'active' : ''}`}>
          <Text className="filter-text">{getFilterLabel(TIME_FILTERS, filters.timeRange)}</Text>
          <View className="filter-arrow" />
        </View>
      </Picker>

      {/* 状态筛选 */}
      <Picker
        mode="selector"
        range={STATUS_FILTERS}
        rangeKey="label"
        value={getStatusIndex()}
        onChange={(e) => {
          const index = Number(e.detail.value)
          onFilterChange('status', STATUS_FILTERS[index].value)
        }}
      >
        <View className={`filter-item ${filters.status && filters.status !== 'all' ? 'active' : ''}`}>
          <Text className="filter-text">{getFilterLabel(STATUS_FILTERS, filters.status)}</Text>
          <View className="filter-arrow" />
        </View>
      </Picker>

      {/* 排序按钮 */}
      <View className="filter-sort" onClick={onSortClick}>
        <Image src={iconFilter} className="sort-icon" mode="aspectFit" />
      </View>
    </View>
  )
}

export default FilterBar

