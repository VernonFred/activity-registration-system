import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import type { TFunction } from 'i18next'
import {
  createInvoiceHeader,
  deleteInvoiceHeader,
  fetchInvoiceHeaderCopyText,
  fetchInvoiceHeaders,
  type InvoiceHeaderItem,
  updateInvoiceHeader,
} from '../../../services/invoice-headers'

const PAGE_SIZE = 4
export const EMPTY_FORM = { name: '', tax_number: '', address: '', phone: '', bank_name: '', bank_account: '' }

export function useInvoiceHeadersPage(t: TFunction) {
  const [headers, setHeaders] = useState<InvoiceHeaderItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [showSheet, setShowSheet] = useState(false)
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [addType, setAddType] = useState<'personal' | 'company'>('personal')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [topPad, setTopPad] = useState(54)
  const [currentPage, setCurrentPage] = useState(1)
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const touchStartX = useRef(0)

  const loadHeaders = useCallback(async (page: number) => {
    try {
      const resp = await fetchInvoiceHeaders({ page, per_page: PAGE_SIZE })
      setHeaders(resp.items)
      setTotalPages(resp.total_pages)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch {}
    void loadHeaders(1)
  }, [loadHeaders])

  useEffect(() => {
    void loadHeaders(currentPage)
  }, [currentPage, loadHeaders])

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
      title: t('invoiceHeaders.deleteConfirmTitle'),
      content: t('invoiceHeaders.deleteConfirmContent'),
      confirmColor: '#e71d36',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await deleteInvoiceHeader(id)
        } catch {}
        setSwipedId(null)
        Taro.showToast({ title: t('common.deleted'), icon: 'success' })
        await loadHeaders(currentPage)
      },
    })
  }, [currentPage, loadHeaders, t])

  const handleCopy = useCallback(async (item: InvoiceHeaderItem) => {
    try {
      const resp = await fetchInvoiceHeaderCopyText(item.id)
      Taro.setClipboardData({ data: resp.text })
      return
    } catch {}

    const lines = [item.name]
    if (item.type === 'company') {
      if (item.tax_number) lines.push(`${t('invoiceHeaders.taxNo')}: ${item.tax_number}`)
      if (item.address) lines.push(`${t('invoiceHeaders.companyAddress')}: ${item.address}`)
      if (item.phone) lines.push(`${t('invoiceHeaders.phoneLabel')}: ${item.phone}`)
      if (item.bank_name) lines.push(`${t('invoiceHeaders.bankName')}: ${item.bank_name}`)
      if (item.bank_account) lines.push(`${t('invoiceHeaders.bankAccount')}: ${item.bank_account}`)
    }
    Taro.setClipboardData({ data: lines.join('\n') })
  }, [t])

  function openAdd() {
    setForm(EMPTY_FORM)
    setAddType('personal')
    setSheetMode('add')
    setEditingId(null)
    setShowSheet(true)
  }

  function openEdit(item: InvoiceHeaderItem) {
    setForm({
      name: item.name,
      tax_number: item.tax_number || '',
      address: item.address || '',
      phone: item.phone || '',
      bank_name: item.bank_name || '',
      bank_account: item.bank_account || '',
    })
    setAddType(item.type)
    setSheetMode('edit')
    setEditingId(item.id)
    setShowSheet(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Taro.showToast({ title: t('invoiceHeaders.enterNameHint'), icon: 'none' })
      return
    }
    setSaving(true)
    try {
      if (sheetMode === 'add') {
        await createInvoiceHeader({
          name: form.name.trim(),
          type: addType,
          ...(addType === 'company'
            ? {
                tax_number: form.tax_number || undefined,
                address: form.address || undefined,
                phone: form.phone || undefined,
                bank_name: form.bank_name || undefined,
                bank_account: form.bank_account || undefined,
              }
            : {}),
        })
        Taro.showToast({ title: t('invoiceHeaders.addSuccess'), icon: 'success' })
      } else if (editingId !== null) {
        const payload: Record<string, string | undefined> = { name: form.name.trim() }
        if (addType === 'company') {
          payload.tax_number = form.tax_number || undefined
          payload.address = form.address || undefined
          payload.phone = form.phone || undefined
          payload.bank_name = form.bank_name || undefined
          payload.bank_account = form.bank_account || undefined
        }
        await updateInvoiceHeader(editingId, payload)
        Taro.showToast({ title: t('invoiceHeaders.saveSuccess'), icon: 'success' })
      }
    } catch {
      Taro.showToast({ title: t('common.failed'), icon: 'none' })
    } finally {
      setSaving(false)
      setShowSheet(false)
      setForm(EMPTY_FORM)
      await loadHeaders(currentPage)
    }
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return {
    addType,
    currentPage,
    editingId,
    form,
    handleCopy,
    handleDelete,
    handleSave,
    handleTouchMove,
    handleTouchStart,
    headers,
    openAdd,
    openEdit,
    saving,
    setAddType,
    setCurrentPage,
    setShowSheet,
    sheetMode,
    showSheet,
    swipedId,
    topPad,
    totalPages,
    updateField,
  }
}
