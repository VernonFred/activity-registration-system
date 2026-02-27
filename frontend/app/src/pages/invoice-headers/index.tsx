/**
 * 发票抬头页面 — 对标设计稿
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

interface InvoiceHeader {
  id: number
  name: string
  type: 'personal' | 'company'
  avatar?: string
  tax_number?: string
}

const MOCK_HEADERS: InvoiceHeader[] = [
  { id: 1, name: '湖南大学', type: 'company', avatar: '' },
  { id: 2, name: '湖南师范大学', type: 'company', avatar: '' },
]

export default function InvoiceHeaders() {
  const { theme } = useTheme()
  const [headers, setHeaders] = useState<InvoiceHeader[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState<'personal' | 'company'>('personal')
  const [addName, setAddName] = useState('')

  useEffect(() => {
    setHeaders(MOCK_HEADERS)
  }, [])

  const handleDelete = useCallback((id: number) => {
    Taro.showModal({
      title: '删除发票抬头',
      content: '确定要删除该发票抬头吗？',
      success: (res) => {
        if (res.confirm) {
          setHeaders(prev => prev.filter(h => h.id !== id))
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  }, [])

  const handleCopy = useCallback((item: InvoiceHeader) => {
    Taro.setClipboardData({ data: item.name })
  }, [])

  const handleEdit = useCallback((item: InvoiceHeader) => {
    Taro.showToast({ title: `编辑: ${item.name}`, icon: 'none' })
  }, [])

  const handleSaveAdd = useCallback(() => {
    if (!addName.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    const newHeader: InvoiceHeader = {
      id: Date.now(),
      name: addName.trim(),
      type: addType,
    }
    setHeaders(prev => [...prev, newHeader])
    setShowAdd(false)
    setAddName('')
    Taro.showToast({ title: '添加成功', icon: 'success' })
  }, [addName, addType])

  return (
    <View className={`ih-page theme-${theme}`}>
      <View className="ih-back" onClick={() => Taro.navigateBack()}>
        <View className="ih-back-arrow" />
      </View>

      <View className="ih-add-btn" onClick={() => setShowAdd(true)}>
        <View className="ih-add-icon">
          <View className="ih-plus-h" />
          <View className="ih-plus-v" />
        </View>
        <Text className="ih-add-text">添加发票抬头</Text>
      </View>

      <View className="ih-list">
        {headers.map(item => (
          <View key={item.id} className="ih-card">
            <View className="ih-card-top">
              <View className="ih-card-left">
                <View className="ih-card-avatar">
                  {item.avatar ? (
                    <Image className="ih-avatar-img" src={item.avatar} mode="aspectFill" />
                  ) : (
                    <View className="ih-avatar-placeholder">
                      <Text>{item.name[0]}</Text>
                    </View>
                  )}
                </View>
                <View className="ih-card-info">
                  <Text className="ih-card-name">{item.name}</Text>
                  <Text className="ih-card-type">{item.type === 'personal' ? '个人' : '单位'}</Text>
                </View>
              </View>
              <View className="ih-qr-icon">
                <View className="ih-qr-grid">
                  <View className="ih-qr-cell" /><View className="ih-qr-cell" /><View className="ih-qr-cell" />
                  <View className="ih-qr-cell ih-qr-empty" /><View className="ih-qr-cell" /><View className="ih-qr-cell ih-qr-empty" />
                  <View className="ih-qr-cell" /><View className="ih-qr-cell" /><View className="ih-qr-cell" />
                </View>
              </View>
            </View>
            <View className="ih-card-actions">
              <View className="ih-action" onClick={() => handleEdit(item)}>
                <Text className="ih-action-icon">✎</Text>
                <Text className="ih-action-text">编辑</Text>
              </View>
              <View className="ih-action" onClick={() => handleCopy(item)}>
                <Text className="ih-action-icon ih-action-copy">◫</Text>
                <Text className="ih-action-text">复制内容</Text>
              </View>
              <View className="ih-action ih-action-danger" onClick={() => handleDelete(item.id)}>
                <Text className="ih-action-icon">●</Text>
                <Text className="ih-action-text">删除</Text>
              </View>
            </View>
          </View>
        ))}
        {headers.length === 0 && (
          <View className="ih-empty"><Text>暂无发票抬头</Text></View>
        )}
      </View>

      {showAdd && (
        <View className="ih-sheet-mask" onClick={() => setShowAdd(false)}>
          <View className="ih-sheet" onClick={e => e.stopPropagation()}>
            <View className="ih-sheet-handle" />
            <Text className="ih-sheet-title">添加发票抬头</Text>
            <View className="ih-type-switch">
              <View
                className={`ih-type-btn ${addType === 'personal' ? 'active' : ''}`}
                onClick={() => setAddType('personal')}
              >
                <Text>个人</Text>
              </View>
              <View
                className={`ih-type-btn ${addType === 'company' ? 'active' : ''}`}
                onClick={() => setAddType('company')}
              >
                <Text>单位</Text>
              </View>
            </View>
            <View className="ih-sheet-field">
              <Text className="ih-sheet-label">名称</Text>
              <Input
                className="ih-sheet-input"
                value={addName}
                onInput={e => setAddName(e.detail.value)}
                placeholder="姓名（必填）"
              />
            </View>
            <View className="ih-sheet-save" onClick={handleSaveAdd}>
              <Text>保存</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
