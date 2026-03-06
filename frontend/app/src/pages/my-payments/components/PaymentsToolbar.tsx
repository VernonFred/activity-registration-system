import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import { CATEGORIES, CATEGORY_LABEL_KEYS, SORT_FIELDS, SORT_LABEL_KEYS, TIME_OPTIONS, type CategoryFilter, type SortField, type TimeFilter } from '../constants'

interface PaymentsToolbarProps {
  batchMode: boolean
  categoryFilter: CategoryFilter
  closeMenus: () => void
  onCategoryClick: () => void
  onSortClick: () => void
  onTimeClick: () => void
  setCategoryFilter: (value: CategoryFilter) => void
  setSortField: (value: SortField) => void
  setTimeFilter: (value: TimeFilter) => void
  showCategoryMenu: boolean
  showSortMenu: boolean
  showTimeMenu: boolean
  timeFilter: TimeFilter
  toggleBatchMode: () => void
}

const PaymentsToolbar = ({
  batchMode,
  categoryFilter,
  closeMenus,
  onCategoryClick,
  onSortClick,
  onTimeClick,
  setCategoryFilter,
  setSortField,
  setTimeFilter,
  showCategoryMenu,
  showSortMenu,
  showTimeMenu,
  timeFilter,
  toggleBatchMode,
}: PaymentsToolbarProps) => {
  const { t } = useTranslation()

  return (
    <>
      <View className="mp-toolbar">
        <View className="mp-filters">
          <View className={`mp-filter ${showSortMenu ? 'active' : ''}`} onClick={onSortClick}>
            <Text>{t('payments.sort')}</Text><Text className="mp-filter-arrow">▾</Text>
            {showSortMenu && (
              <View className="mp-dropdown">
                {SORT_FIELDS.map((field) => (
                  <View key={field} className="mp-drop-item" onClick={(e) => { e.stopPropagation(); setSortField(field); closeMenus() }}>
                    <Text>{t(SORT_LABEL_KEYS[field])}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View className={`mp-filter ${showCategoryMenu ? 'active' : ''}`} onClick={onCategoryClick}>
            <Text>{t('payments.type')}</Text><Text className="mp-filter-arrow">▾</Text>
            {showCategoryMenu && (
              <View className="mp-dropdown">
                {CATEGORIES.map((item) => (
                  <View key={item} className={`mp-drop-item ${categoryFilter === item ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setCategoryFilter(item); closeMenus() }}>
                    <Text>{t(CATEGORY_LABEL_KEYS[item])}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View className={`mp-filter ${showTimeMenu ? 'active' : ''}`} onClick={onTimeClick}>
            <Text>{t('payments.time')}</Text><Text className="mp-filter-arrow">▾</Text>
            {showTimeMenu && (
              <View className="mp-dropdown">
                {TIME_OPTIONS.map(({ value, key }) => (
                  <View key={value} className={`mp-drop-item ${timeFilter === value ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setTimeFilter(value); closeMenus() }}>
                    <Text>{t(key)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View className="mp-batch-toggle" onClick={toggleBatchMode}>
          <View className={`mp-batch-icon ${batchMode ? 'mp-batch-icon-active' : ''}`} />
        </View>
      </View>

      {(showSortMenu || showCategoryMenu || showTimeMenu) && <View className="mp-dropdown-mask" onClick={closeMenus} />}
    </>
  )
}

export default PaymentsToolbar
