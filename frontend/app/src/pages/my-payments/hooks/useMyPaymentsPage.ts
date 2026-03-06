import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import type { TFunction } from 'i18next'
import { bulkDeletePayments, deletePayment, fetchPayments, type PaymentItem } from '../../../services/payments'
import { PAGE_SIZE, type CategoryFilter, type SortField, type TimeFilter } from '../constants'

export function useMyPaymentsPage(t: TFunction, categoryFilter: CategoryFilter, timeFilter: TimeFilter, sortField: SortField) {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const [detailItem, setDetailItem] = useState<PaymentItem | null>(null)
  const [topPad, setTopPad] = useState(54)
  const [currentPage, setCurrentPage] = useState(1)
  const touchStartX = useRef(0)

  const loadPayments = useCallback(async (page: number) => {
    try {
      const params: Record<string, unknown> = { page, per_page: PAGE_SIZE }
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (timeFilter !== 'all') params.time_filter = timeFilter
      const resp = await fetchPayments(params)
      setPayments(resp.items)
      setTotalPages(resp.total_pages)
    } catch {
      // ignore API errors here; keep current list
    }
  }, [categoryFilter, timeFilter])

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch {}
    void loadPayments(1)
  }, [loadPayments])

  useEffect(() => {
    setCurrentPage(1)
    void loadPayments(1)
  }, [categoryFilter, timeFilter, sortField, loadPayments])

  useEffect(() => {
    void loadPayments(currentPage)
  }, [currentPage, loadPayments])

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
      title: t('payments.confirmDeleteTitle'),
      content: t('payments.confirmDeleteContent'),
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await deletePayment(id)
          setSwipedId(null)
          Taro.showToast({ title: t('common.deleted'), icon: 'success' })
          await loadPayments(currentPage)
        } catch {
          Taro.showToast({ title: t('common.failed'), icon: 'error' })
        }
      },
    })
  }, [currentPage, loadPayments, t])

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
    setSwipedId(null)
  }, [])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkDelete = useCallback(() => {
    Taro.showModal({
      title: t('common.batchDelete'),
      content: t('common.confirmDeleteSelected', { count: selectedIds.size }),
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await bulkDeletePayments(Array.from(selectedIds))
          setSelectedIds(new Set())
          setBatchMode(false)
          Taro.showToast({ title: t('common.deleted'), icon: 'success' })
          await loadPayments(currentPage)
        } catch {
          Taro.showToast({ title: t('common.failed'), icon: 'error' })
        }
      },
    })
  }, [currentPage, loadPayments, selectedIds, t])

  return {
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
  }
}
