import { useState } from 'react'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import PaymentDetailSheet from './components/PaymentDetailSheet'
import PaymentsToolbar from './components/PaymentsToolbar'
import { useMyPaymentsPage } from './hooks/useMyPaymentsPage'
import type { CategoryFilter, SortField, TimeFilter } from './constants'
import './index.scss'

export default function MyPayments() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [sortField, setSortField] = useState<SortField>('default')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showTimeMenu, setShowTimeMenu] = useState(false)
  const {
    batchMode,
    currentPage,
    detailItem,
    handleBulkDelete,
    handleDelete,
    handleTouchMove,
    handleTouchStart,
    payments,
    selectedIds,
    setCurrentPage,
    setDetailItem,
    swipedId,
    toggleBatchMode,
    toggleSelect,
    topPad,
    totalPages,
  } = useMyPaymentsPage(t, categoryFilter, timeFilter, sortField)

  const closeMenus = () => {
    setShowSortMenu(false)
    setShowCategoryMenu(false)
    setShowTimeMenu(false)
  }

  return (
    <View className={`mp-page theme-${theme}`}>
      <View className="mp-back" style={{ paddingTop: `${topPad}px` }} onClick={() => Taro.navigateBack()}>
        <View className="mp-back-circle"><View className="mp-back-arrow" /></View>
      </View>

      <PaymentsToolbar
        batchMode={batchMode}
        categoryFilter={categoryFilter}
        closeMenus={closeMenus}
        onCategoryClick={() => { const next = !showCategoryMenu; closeMenus(); setShowCategoryMenu(next) }}
        onSortClick={() => { const next = !showSortMenu; closeMenus(); setShowSortMenu(next) }}
        onTimeClick={() => { const next = !showTimeMenu; closeMenus(); setShowTimeMenu(next) }}
        setCategoryFilter={setCategoryFilter}
        setSortField={setSortField}
        setTimeFilter={setTimeFilter}
        showCategoryMenu={showCategoryMenu}
        showSortMenu={showSortMenu}
        showTimeMenu={showTimeMenu}
        timeFilter={timeFilter}
        toggleBatchMode={toggleBatchMode}
      />

      <ScrollView scrollY className="mp-scroll">
        <View className="mp-list">
          {payments.map((item) => (
            <View key={item.id} className={`mp-card ${swipedId === item.id ? 'swiped' : ''}`} onTouchStart={handleTouchStart} onTouchMove={(e) => handleTouchMove(e, item.id)}>
              <View className="mp-card-body">
                {batchMode && (
                  <View className={`mp-checkbox ${selectedIds.has(item.id) ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}>
                    {selectedIds.has(item.id) && <Text className="mp-check-mark">✓</Text>}
                  </View>
                )}
                <View className="mp-icon-wrap">
                  <View className="mp-icon-briefcase"><View className="mp-briefcase-top" /><View className="mp-briefcase-body" /></View>
                </View>
                <View className="mp-card-info">
                  <Text className="mp-card-title">{item.activity_title}</Text>
                  <View className="mp-card-tags">
                    <View className="mp-tag"><Text>{item.category}</Text></View>
                    <Text className="mp-link" onClick={(e) => { e.stopPropagation(); setDetailItem(item) }}>{t('payments.viewDetail')}</Text>
                  </View>
                </View>
                <Text className="mp-amount">¥ {item.amount.toFixed(2)}</Text>
                <View className={`mp-status-badge mp-status-${item.status}`}>
                  <Text>{item.status === 'paid' ? t('payments.paid') : t('payments.unpaid')}</Text>
                </View>
              </View>
              <View className="mp-delete-area" onClick={() => handleDelete(item.id)}>
                <View className="mp-trash-icon"><View className="mp-trash-lid" /><View className="mp-trash-body" /></View>
              </View>
            </View>
          ))}
          {payments.length === 0 && <View className="mp-empty"><Text>{t('payments.noRecords')}</Text></View>}
        </View>

        {totalPages > 1 && (
          <View className="mp-pagination">
            {Array.from({ length: totalPages }, (_, i) => <View key={i} className={`mp-page-dot ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)} />)}
            <Text className="mp-page-info">{currentPage}/{totalPages}</Text>
          </View>
        )}
      </ScrollView>

      {batchMode && selectedIds.size > 0 && (
        <View className="mp-batch-bar">
          <Text className="mp-batch-info">{t('common.selected', { count: selectedIds.size })}</Text>
          <View className="mp-batch-del" onClick={handleBulkDelete}><Text>{t('common.delete')}</Text></View>
        </View>
      )}

      <PaymentDetailSheet item={detailItem} onClose={() => setDetailItem(null)} topPad={topPad} />
    </View>
  )
}
