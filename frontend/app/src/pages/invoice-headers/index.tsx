/**
 * 发票抬头页面 — 后端分页 + Sketch 设计稿精确对标
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import {
  fetchInvoiceHeaders,
  fetchInvoiceHeaderCopyText,
  createInvoiceHeader,
  updateInvoiceHeader,
  deleteInvoiceHeader,
  InvoiceHeaderItem,
} from '../../services/invoice-headers'
import './index.scss'

const PAGE_SIZE = 4
const EMPTY_FORM = { name: '', tax_number: '', address: '', phone: '', bank_name: '', bank_account: '' }

export default function InvoiceHeaders() {
  const { theme } = useTheme()
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
  const touchStartX = useRef(0)
  const [swipedId, setSwipedId] = useState<number | null>(null)

  const loadHeaders = useCallback(async (page: number) => {
    try {
      const resp = await fetchInvoiceHeaders({ page, per_page: PAGE_SIZE })
      setHeaders(resp.items)
      setTotalPages(resp.total_pages)
    } catch {
      // API 不可用时保持当前数据
    }
  }, [])

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch { /* fallback */ }
    loadHeaders(1)
  }, [])

  useEffect(() => {
    loadHeaders(currentPage)
  }, [currentPage])

  const handleTouchStart = useCallback((e: any) => { touchStartX.current = e.touches[0].clientX }, [])
  const handleTouchMove = useCallback((e: any, id: number) => {
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx < -40) setSwipedId(id)
    else if (dx > 20) setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: number) => {
    Taro.showModal({
      title: '删除发票抬头', content: '确定要删除该发票抬头吗？', confirmColor: '#e71d36',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteInvoiceHeader(id)
          } catch { /* fallback */ }
          setSwipedId(null)
          Taro.showToast({ title: '已删除', icon: 'success' })
          loadHeaders(currentPage)
        }
      },
    })
  }, [currentPage, loadHeaders])

  const handleCopy = useCallback(async (item: InvoiceHeaderItem) => {
    try {
      const resp = await fetchInvoiceHeaderCopyText(item.id)
      Taro.setClipboardData({ data: resp.text })
    } catch {
      // 后端不可用时使用前端拼接
      const lines = [item.name]
      if (item.type === 'company') {
        if (item.tax_number) lines.push(`税号: ${item.tax_number}`)
        if (item.address) lines.push(`地址: ${item.address}`)
        if (item.phone) lines.push(`电话: ${item.phone}`)
        if (item.bank_name) lines.push(`开户银行: ${item.bank_name}`)
        if (item.bank_account) lines.push(`银行账号: ${item.bank_account}`)
      }
      Taro.setClipboardData({ data: lines.join('\n') })
    }
  }, [])

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setAddType('personal')
    setSheetMode('add')
    setEditingId(null)
    setShowSheet(true)
  }, [])

  const openEdit = useCallback((item: InvoiceHeaderItem) => {
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
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      if (sheetMode === 'add') {
        await createInvoiceHeader({
          name: form.name.trim(),
          type: addType,
          ...(addType === 'company' ? {
            tax_number: form.tax_number || undefined,
            address: form.address || undefined,
            phone: form.phone || undefined,
            bank_name: form.bank_name || undefined,
            bank_account: form.bank_account || undefined,
          } : {}),
        })
        Taro.showToast({ title: '添加成功', icon: 'success' })
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
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setSaving(false)
      setShowSheet(false)
      setForm(EMPTY_FORM)
      loadHeaders(currentPage)
    }
  }, [form, addType, sheetMode, editingId, currentPage, loadHeaders])

  const updateField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <View className={`ih-page theme-${theme}`}>
      <View className="ih-back" style={{ paddingTop: `${topPad}px` }} onClick={() => Taro.navigateBack()}>
        <View className="ih-back-circle">
          <View className="ih-back-arrow" />
        </View>
      </View>

      <View className="ih-add-btn" onClick={openAdd}>
        <View className="ih-add-icon" />
        <Text className="ih-add-text">添加发票抬头</Text>
      </View>

      <ScrollView scrollY className="ih-scroll">
        <View className="ih-list">
          {headers.map(item => (
            <View
              key={item.id}
              className={`ih-card ${swipedId === item.id ? 'swiped' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={e => handleTouchMove(e, item.id)}
            >
              <View className="ih-card-body">
                <View className="ih-card-top">
                  <View className="ih-card-left">
                    <View className="ih-card-avatar">
                      <Text>{item.name[0]}</Text>
                    </View>
                    <View className="ih-card-info">
                      <Text className="ih-card-name">{item.name}</Text>
                      <Text className="ih-card-type">{item.type === 'personal' ? '个人' : '单位'}</Text>
                    </View>
                  </View>
                  <View className="ih-qr-icon" />
                </View>
                <View className="ih-card-divider" />
                <View className="ih-card-actions">
                  <View className="ih-action ih-action-edit" onClick={() => openEdit(item)}>
                    <Text>编辑</Text>
                  </View>
                  <View className="ih-action ih-action-copy" onClick={() => handleCopy(item)}>
                    <Text>复制内容</Text>
                  </View>
                </View>
              </View>
              <View className="ih-delete-area" onClick={() => handleDelete(item.id)}>
                <View className="ih-trash-icon">
                  <View className="ih-trash-lid" />
                  <View className="ih-trash-body" />
                </View>
              </View>
            </View>
          ))}
          {headers.length === 0 && (
            <View className="ih-empty"><Text>暂无发票抬头</Text></View>
          )}
        </View>

        {totalPages > 1 && (
          <View className="ih-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <View
                key={i}
                className={`ih-page-dot ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              />
            ))}
            <Text className="ih-page-info">{currentPage}/{totalPages}</Text>
          </View>
        )}
      </ScrollView>

      {/* ===== 添加/编辑发票抬头 Bottom Sheet ===== */}
      {showSheet && (
        <View className="ih-sheet-mask" onClick={() => { if (!saving) setShowSheet(false) }}>
          <View className="ih-sheet" onClick={e => e.stopPropagation()}>
            <View className="ih-sheet-handle" />
            <Text className="ih-sheet-title">
              {sheetMode === 'add' ? '添加发票抬头' : '编辑发票抬头'}
            </Text>

            {sheetMode === 'add' && (
              <View className="ih-seg-control">
                <View
                  className={`ih-seg-item ${addType === 'personal' ? 'active' : ''}`}
                  onClick={() => setAddType('personal')}
                >
                  <Text>个人</Text>
                </View>
                <View
                  className={`ih-seg-item ${addType === 'company' ? 'active' : ''}`}
                  onClick={() => setAddType('company')}
                >
                  <Text>单位</Text>
                </View>
              </View>
            )}

            <ScrollView scrollY className="ih-form-scroll">
              {addType === 'personal' ? (
                <View className="ih-field">
                  <Text className="ih-field-label">名称</Text>
                  <Input className="ih-field-input" value={form.name} onInput={e => updateField('name', e.detail.value)} placeholder="姓名（必填）" placeholderClass="ih-placeholder" />
                </View>
              ) : (
                <>
                  <View className="ih-field">
                    <Text className="ih-field-label">名称</Text>
                    <Input className="ih-field-input" value={form.name} onInput={e => updateField('name', e.detail.value)} placeholder="单位名称（必填）" placeholderClass="ih-placeholder" />
                  </View>
                  <View className="ih-field">
                    <Text className="ih-field-label">税号</Text>
                    <Input className="ih-field-input" value={form.tax_number} onInput={e => updateField('tax_number', e.detail.value)} placeholder="纳税人识别号" placeholderClass="ih-placeholder" />
                  </View>
                  <View className="ih-field">
                    <Text className="ih-field-label">单位地址</Text>
                    <Input className="ih-field-input" value={form.address} onInput={e => updateField('address', e.detail.value)} placeholder="单位地址信息" placeholderClass="ih-placeholder" />
                  </View>
                  <View className="ih-field">
                    <Text className="ih-field-label">电话</Text>
                    <Input className="ih-field-input" value={form.phone} onInput={e => updateField('phone', e.detail.value)} placeholder="电话号码" placeholderClass="ih-placeholder" />
                  </View>
                  <View className="ih-field">
                    <Text className="ih-field-label">开户银行</Text>
                    <Input className="ih-field-input" value={form.bank_name} onInput={e => updateField('bank_name', e.detail.value)} placeholder="开户银行名称" placeholderClass="ih-placeholder" />
                  </View>
                  <View className="ih-field">
                    <Text className="ih-field-label">银行账号</Text>
                    <Input className="ih-field-input" value={form.bank_account} onInput={e => updateField('bank_account', e.detail.value)} placeholder="银行账户号码" placeholderClass="ih-placeholder" />
                  </View>
                </>
              )}
            </ScrollView>

            <View className="ih-sheet-footer">
              <View className={`ih-save-btn ${form.name.trim() ? 'active' : ''}`} onClick={handleSave}>
                <Text>保存</Text>
              </View>
            </View>

            {saving && (
              <View className="ih-loading-overlay">
                <View className="ih-loading-box">
                  <View className="ih-loading-spinner" />
                  <Text className="ih-loading-text">加载中</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
