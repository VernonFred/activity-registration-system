/**
 * 我的缴费页面 — 严格对标设计稿
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

interface PaymentItem {
  id: number
  activity_id: number
  activity_title: string
  amount: number
  category: string
  status: 'paid' | 'unpaid'
  pay_date?: string
  cover_url?: string
  date_range?: string
  time_range?: string
  payer?: string
  order_no?: string
  transaction_no?: string
}

type SortField = 'default' | 'amount_asc' | 'amount_desc'
type CategoryFilter = 'all' | '论坛' | '峰会' | '研讨会' | '培训'
type TimeFilter = 'all' | 'recent' | 'month' | 'year'

const CATEGORIES: CategoryFilter[] = ['all', '论坛', '峰会', '研讨会', '培训']
const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: '全部类型', '论坛': '论坛', '峰会': '峰会', '研讨会': '研讨会', '培训': '培训',
}

const MOCK_PAYMENTS: PaymentItem[] = [
  {
    id: 1, activity_id: 101, activity_title: '暑期培训会议', amount: 63.00,
    category: '论坛', status: 'paid', pay_date: '2025-10-10',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    date_range: '2025年11月10日—13日', time_range: '9:00 AM - 5:00 PM',
    payer: '张三', order_no: '20241026143000123456', transaction_no: 'CONF_884812345678',
  },
  {
    id: 2, activity_id: 102, activity_title: '暑期培训会议', amount: 63.00,
    category: '论坛', status: 'paid', pay_date: '2025-09-15',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    date_range: '2025年9月15日—17日', time_range: '9:00 AM - 5:00 PM',
    payer: '张三', order_no: '20241015093000654321', transaction_no: 'CONF_776543210987',
  },
  {
    id: 3, activity_id: 103, activity_title: '暑期培训会议', amount: 63.00,
    category: '峰会', status: 'paid', pay_date: '2025-08-20',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    date_range: '2025年8月20日—22日', time_range: '9:00 AM - 5:00 PM',
    payer: '张三', order_no: '20240820110000789012', transaction_no: 'CONF_553456789012',
  },
  {
    id: 4, activity_id: 104, activity_title: '秋季学术研讨会', amount: 120.00,
    category: '研讨会', status: 'unpaid',
    cover_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    date_range: '2025年12月5日—7日', time_range: '10:00 AM - 6:00 PM',
    payer: '张三',
  },
]

export default function MyPayments() {
  const { theme } = useTheme()
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const [detailItem, setDetailItem] = useState<PaymentItem | null>(null)
  const touchStartX = useRef(0)
  const [topPad, setTopPad] = useState(54)

  const [sortField, setSortField] = useState<SortField>('default')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showTimeMenu, setShowTimeMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch { /* fallback 54px */ }
    setPayments(MOCK_PAYMENTS)
  }, [])

  const filteredPayments = (() => {
    let list = [...payments]
    if (categoryFilter !== 'all') {
      list = list.filter(p => p.category === categoryFilter)
    }
    if (timeFilter === 'recent') {
      const d = new Date(); d.setDate(d.getDate() - 7)
      list = list.filter(p => p.pay_date && new Date(p.pay_date) >= d)
    } else if (timeFilter === 'month') {
      const d = new Date(); d.setMonth(d.getMonth() - 1)
      list = list.filter(p => p.pay_date && new Date(p.pay_date) >= d)
    } else if (timeFilter === 'year') {
      const d = new Date(); d.setFullYear(d.getFullYear() - 1)
      list = list.filter(p => p.pay_date && new Date(p.pay_date) >= d)
    }
    if (sortField === 'amount_asc') list.sort((a, b) => a.amount - b.amount)
    else if (sortField === 'amount_desc') list.sort((a, b) => b.amount - a.amount)
    return list
  })()

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE))
  const pagedPayments = filteredPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => { setCurrentPage(1) }, [categoryFilter, timeFilter, sortField])

  const handleTouchStart = useCallback((e: any) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: any, id: number) => {
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx < -40) setSwipedId(id)
    else if (dx > 20) setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: number) => {
    Taro.showModal({
      title: '确认删除', content: '确定要删除此缴费记录吗？', confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          setPayments(prev => prev.filter(p => p.id !== id))
          setSwipedId(null)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  }, [])

  const toggleBatchMode = useCallback(() => {
    setBatchMode(prev => { if (prev) setSelectedIds(new Set()); return !prev })
    setSwipedId(null)
  }, [])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const closeMenus = () => { setShowSortMenu(false); setShowCategoryMenu(false); setShowTimeMenu(false) }

  const handleSortClick = () => { const n = !showSortMenu; closeMenus(); setShowSortMenu(n) }
  const handleCategoryClick = () => { const n = !showCategoryMenu; closeMenus(); setShowCategoryMenu(n) }
  const handleTimeClick = () => { const n = !showTimeMenu; closeMenus(); setShowTimeMenu(n) }

  return (
    <View className={`mp-page theme-${theme}`}>
      <View className="mp-back" style={{ paddingTop: `${topPad}px` }} onClick={() => Taro.navigateBack()}>
        <View className="mp-back-circle">
          <View className="mp-back-arrow" />
        </View>
      </View>

      <View className="mp-toolbar">
        <View className="mp-filters">
          <View className={`mp-filter ${showSortMenu ? 'active' : ''}`} onClick={handleSortClick}>
            <Text>排列</Text><Text className="mp-filter-arrow">▾</Text>
            {showSortMenu && (
              <View className="mp-dropdown">
                {(['default', 'amount_asc', 'amount_desc'] as SortField[]).map(f => (
                  <View key={f} className={`mp-drop-item ${sortField === f ? 'selected' : ''}`}
                    onClick={e => { e.stopPropagation(); setSortField(f); setShowSortMenu(false) }}>
                    <Text>{{ default: '默认排序', amount_asc: '金额从低到高', amount_desc: '金额从高到低' }[f]}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View className={`mp-filter ${showCategoryMenu ? 'active' : ''}`} onClick={handleCategoryClick}>
            <Text>类型</Text><Text className="mp-filter-arrow">▾</Text>
            {showCategoryMenu && (
              <View className="mp-dropdown">
                {CATEGORIES.map(c => (
                  <View key={c} className={`mp-drop-item ${categoryFilter === c ? 'selected' : ''}`}
                    onClick={e => { e.stopPropagation(); setCategoryFilter(c); setShowCategoryMenu(false) }}>
                    <Text>{CATEGORY_LABELS[c]}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View className={`mp-filter ${showTimeMenu ? 'active' : ''}`} onClick={handleTimeClick}>
            <Text>时间</Text><Text className="mp-filter-arrow">▾</Text>
            {showTimeMenu && (
              <View className="mp-dropdown">
                {([['all', '全部'], ['recent', '最近7天'], ['month', '最近一个月'], ['year', '最近一年']] as const).map(([v, l]) => (
                  <View key={v} className={`mp-drop-item ${timeFilter === v ? 'selected' : ''}`}
                    onClick={e => { e.stopPropagation(); setTimeFilter(v as TimeFilter); setShowTimeMenu(false) }}>
                    <Text>{l}</Text>
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

      {(showSortMenu || showCategoryMenu || showTimeMenu) && (
        <View className="mp-dropdown-mask" onClick={closeMenus} />
      )}

      <ScrollView scrollY className="mp-scroll">
        <View className="mp-list">
          {pagedPayments.map(item => (
            <View
              key={item.id}
              className={`mp-card ${swipedId === item.id ? 'swiped' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={e => handleTouchMove(e, item.id)}
            >
              <View className="mp-card-body">
                {batchMode && (
                  <View
                    className={`mp-checkbox ${selectedIds.has(item.id) ? 'checked' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleSelect(item.id) }}
                  >
                    {selectedIds.has(item.id) && <Text className="mp-check-mark">✓</Text>}
                  </View>
                )}
                <View className="mp-icon-wrap">
                  <View className="mp-icon-briefcase">
                    <View className="mp-briefcase-top" />
                    <View className="mp-briefcase-body" />
                  </View>
                </View>
                <View className="mp-card-info">
                  <Text className="mp-card-title">{item.activity_title}</Text>
                  <View className="mp-card-tags">
                    <View className="mp-tag"><Text>{item.category}</Text></View>
                    <Text className="mp-link" onClick={e => { e.stopPropagation(); setDetailItem(item) }}>查看详情</Text>
                  </View>
                </View>
                <Text className="mp-amount">¥ {item.amount.toFixed(2)}</Text>
                <View className={`mp-status-badge mp-status-${item.status}`}>
                  <Text>{item.status === 'paid' ? '已缴费' : '待缴费'}</Text>
                </View>
              </View>
              <View className="mp-delete-area" onClick={() => handleDelete(item.id)}>
                <View className="mp-trash-icon">
                  <View className="mp-trash-lid" />
                  <View className="mp-trash-body" />
                </View>
              </View>
            </View>
          ))}
          {filteredPayments.length === 0 && (
            <View className="mp-empty"><Text>暂无缴费记录</Text></View>
          )}
        </View>
        {totalPages > 1 && (
          <View className="mp-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <View
                key={i}
                className={`mp-page-dot ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              />
            ))}
            <Text className="mp-page-info">{currentPage}/{totalPages}</Text>
          </View>
        )}
      </ScrollView>

      {batchMode && selectedIds.size > 0 && (
        <View className="mp-batch-bar">
          <Text className="mp-batch-info">已选择 {selectedIds.size} 项</Text>
          <View className="mp-batch-del" onClick={() => {
            Taro.showModal({
              title: '批量删除',
              content: `确定要删除选中的 ${selectedIds.size} 条记录吗？`,
              confirmColor: '#ef4444',
              success: (res) => {
                if (res.confirm) {
                  setPayments(prev => prev.filter(p => !selectedIds.has(p.id)))
                  setSelectedIds(new Set()); setBatchMode(false)
                  Taro.showToast({ title: '已删除', icon: 'success' })
                }
              },
            })
          }}>
            <Text>删除</Text>
          </View>
        </View>
      )}

      {/* ===== 缴费详情弹窗 — Sketch 设计稿：毛玻璃背景 + 内容直铺 ===== */}
      {detailItem && (
        <View className="mp-detail-mask" onClick={() => setDetailItem(null)}>
          <View className="mp-detail-sheet" style={{ paddingTop: `${topPad + 56}px` }} onClick={e => e.stopPropagation()}>
            <ScrollView scrollY className="mp-detail-scroll">
              {/* 头部卡片 — 仅边框包裹，Sketch: border #e3e7ec 1px, radius 14 */}
              <View className="mp-detail-header-card">
                <View className="mp-detail-header">
                  <Image
                    className="mp-detail-cover"
                    src={detailItem.cover_url || 'https://placehold.co/120x120/e8e8e8/999?text=A'}
                    mode="aspectFill"
                  />
                  <View className="mp-detail-header-info">
                    <Text className="mp-detail-title">{detailItem.activity_title}</Text>
                    <View className="mp-detail-meta-row">
                      <View className="mp-detail-icon-calendar" />
                      <Text className="mp-detail-meta">{detailItem.date_range || '—'}</Text>
                    </View>
                    <View className="mp-detail-meta-row">
                      <View className="mp-detail-icon-clock" />
                      <Text className="mp-detail-meta">{detailItem.time_range || '—'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text className="mp-detail-section-title">信息</Text>
              <View className="mp-detail-row">
                <View className="mp-detail-row-left">
                  <View className="mp-detail-icon-person" />
                  <Text className="mp-detail-row-label">缴费人</Text>
                </View>
                <Text className="mp-detail-row-value">{detailItem.payer || '—'}</Text>
              </View>
              <View className="mp-detail-row">
                <View className="mp-detail-row-left">
                  <View className="mp-detail-icon-date" />
                  <Text className="mp-detail-row-label">缴费时间</Text>
                </View>
                <Text className="mp-detail-row-value">
                  {detailItem.pay_date ? `${detailItem.pay_date} 9:00 AM` : '—'}
                </Text>
              </View>

              <View className="mp-detail-divider" />

              <Text className="mp-detail-section-title">金额</Text>
              <View className="mp-detail-row">
                <Text className="mp-detail-row-label-bold">费用</Text>
                <Text className="mp-detail-row-value-bold">¥ {detailItem.amount.toFixed(2)}</Text>
              </View>
              <View className="mp-detail-row">
                <Text className="mp-detail-row-label-bold">订单号</Text>
                <Text className="mp-detail-row-value-small">{detailItem.order_no || '—'}</Text>
              </View>
              <View className="mp-detail-row">
                <Text className="mp-detail-row-label-bold">交易流水号</Text>
                <Text className="mp-detail-row-value-small">{detailItem.transaction_no || '—'}</Text>
              </View>

              <Text className="mp-detail-section-title-green">缴费截图</Text>
              <View className="mp-detail-upload-area">
                <View className="mp-detail-upload-icon" />
                <Text className="mp-detail-upload-text">缴费凭证</Text>
              </View>

              <View className="mp-detail-footer">
                <View className="mp-detail-confirm-btn" onClick={() => setDetailItem(null)}>
                  <Text>确定</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}
