/**
 * 我的缴费页面 — 对标设计稿
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

interface PaymentItem {
  id: number
  activity_title: string
  amount: number
  category: string
  status: 'paid' | 'unpaid'
}

const MOCK_PAYMENTS: PaymentItem[] = [
  { id: 1, activity_title: '暑期培训会议', amount: 63.00, category: '论坛', status: 'paid' },
  { id: 2, activity_title: '暑期培训会议', amount: 63.00, category: '论坛', status: 'paid' },
  { id: 3, activity_title: '暑期培训会议', amount: 63.00, category: '峰会', status: 'paid' },
]

export default function MyPayments() {
  const { theme } = useTheme()
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    setPayments(MOCK_PAYMENTS)
  }, [])

  const handleTouchStart = useCallback((e: any) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: any, id: number) => {
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx < -40) setSwipedId(id)
    else if (dx > 20) setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: number) => {
    setPayments(prev => prev.filter(p => p.id !== id))
    setSwipedId(null)
    Taro.showToast({ title: '已删除', icon: 'success' })
  }, [])

  const handleViewDetail = useCallback((item: PaymentItem) => {
    Taro.showToast({ title: `${item.activity_title} 详情`, icon: 'none' })
  }, [])

  const toggleBatchMode = useCallback(() => {
    setBatchMode(prev => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
    setSwipedId(null)
  }, [])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <View className={`mp-page theme-${theme}`}>
      <View className="mp-back" onClick={() => Taro.navigateBack()}>
        <View className="mp-back-arrow" />
      </View>

      <View className="mp-toolbar">
        <View className="mp-filters">
          <View className="mp-filter"><Text>排列</Text><Text className="mp-filter-arrow">▾</Text></View>
          <View className="mp-filter"><Text>类型</Text><Text className="mp-filter-arrow">▾</Text></View>
          <View className="mp-filter"><Text>时间</Text><Text className="mp-filter-arrow">▾</Text></View>
        </View>
        <View className="mp-batch-toggle" onClick={toggleBatchMode}>
          <Text>{batchMode ? '取消' : '批量选择'}</Text>
        </View>
      </View>

      <View className="mp-list">
        {payments.map(item => (
          <View
            key={item.id}
            className={`mp-card ${swipedId === item.id ? 'swiped' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={e => handleTouchMove(e, item.id)}
          >
            <View className="mp-card-body" onClick={() => handleViewDetail(item)}>
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
                  <Text className="mp-link">查看详情</Text>
                </View>
              </View>
              <View className="mp-card-right">
                <Text className="mp-amount">¥ {item.amount.toFixed(2)}</Text>
                <View className={`mp-status mp-status-${item.status}`}>
                  <Text>{item.status === 'paid' ? '已缴费' : '待缴费'}</Text>
                </View>
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
        {payments.length === 0 && (
          <View className="mp-empty"><Text>暂无缴费记录</Text></View>
        )}
      </View>
    </View>
  )
}
