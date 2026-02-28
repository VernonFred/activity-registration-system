/**
 * 发票抬头页面 — Sketch 设计稿精确对标
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

interface InvoiceHeader {
  id: number
  name: string
  type: 'personal' | 'company'
  tax_number?: string
  address?: string
  phone?: string
  bank_name?: string
  bank_account?: string
}

const MOCK_HEADERS: InvoiceHeader[] = [
  { id: 1, name: '湖南大学', type: 'company', tax_number: '91430000738820X', address: '长沙市岳麓区麓山南路', phone: '0731-88821234', bank_name: '中国银行长沙分行', bank_account: '7328 0000 1234 5678' },
  { id: 2, name: '湖南师范大学', type: 'company', tax_number: '91430000456789Y', address: '长沙市岳麓区麓山路36号', phone: '0731-88872345', bank_name: '工商银行长沙支行', bank_account: '1902 0000 5678 1234' },
  { id: 3, name: '张三', type: 'personal' },
  { id: 4, name: '中南大学', type: 'company', tax_number: '91430000112233Z' },
  { id: 5, name: '李四', type: 'personal' },
  { id: 6, name: '长沙理工大学', type: 'company', tax_number: '91430000998877W' },
]

const PAGE_SIZE = 4
const EMPTY_FORM = { name: '', tax_number: '', address: '', phone: '', bank_name: '', bank_account: '' }

export default function InvoiceHeaders() {
  const { theme } = useTheme()
  const [headers, setHeaders] = useState<InvoiceHeader[]>([])
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

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch { /* fallback */ }
    setHeaders(MOCK_HEADERS)
  }, [])

  const totalPages = Math.max(1, Math.ceil(headers.length / PAGE_SIZE))
  const pagedHeaders = headers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleTouchStart = useCallback((e: any) => { touchStartX.current = e.touches[0].clientX }, [])
  const handleTouchMove = useCallback((e: any, id: number) => {
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx < -40) setSwipedId(id)
    else if (dx > 20) setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: number) => {
    Taro.showModal({
      title: '删除发票抬头', content: '确定要删除该发票抬头吗？', confirmColor: '#e71d36',
      success: (res) => {
        if (res.confirm) {
          setHeaders(prev => prev.filter(h => h.id !== id))
          setSwipedId(null)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  }, [])

  const handleCopy = useCallback((item: InvoiceHeader) => {
    Taro.setClipboardData({ data: item.name + (item.tax_number ? `\n税号: ${item.tax_number}` : '') })
  }, [])

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setAddType('personal')
    setSheetMode('add')
    setEditingId(null)
    setShowSheet(true)
  }, [])

  const openEdit = useCallback((item: InvoiceHeader) => {
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

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    setSaving(true)
    setTimeout(() => {
      if (sheetMode === 'add') {
        const newHeader: InvoiceHeader = {
          id: Date.now(),
          name: form.name.trim(),
          type: addType,
          ...(addType === 'company' ? {
            tax_number: form.tax_number, address: form.address,
            phone: form.phone, bank_name: form.bank_name, bank_account: form.bank_account,
          } : {}),
        }
        setHeaders(prev => [...prev, newHeader])
        Taro.showToast({ title: '添加成功', icon: 'success' })
      } else if (editingId !== null) {
        setHeaders(prev => prev.map(h => h.id === editingId ? {
          ...h,
          name: form.name.trim(),
          ...(h.type === 'company' ? {
            tax_number: form.tax_number, address: form.address,
            phone: form.phone, bank_name: form.bank_name, bank_account: form.bank_account,
          } : {}),
        } : h))
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }
      setSaving(false)
      setShowSheet(false)
      setForm(EMPTY_FORM)
    }, 800)
  }, [form, addType, sheetMode, editingId])

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
          {pagedHeaders.map(item => (
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
              {/* 左滑删除 — 参照缴费列表样式 */}
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
                    <Text className="ih-field-label">开户银行</Text>
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
