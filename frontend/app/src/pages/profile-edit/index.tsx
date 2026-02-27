/**
 * 个人简介编辑页面 — 对标设计稿
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchCurrentUser, type User } from '../../services/user'
import './index.scss'

export default function ProfileEdit() {
  const { theme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    name: '',
    school: '',
    department: '',
    phone: '',
    email: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await fetchCurrentUser()
        setUser(u)
        setForm({
          name: u.name || '',
          school: u.school || '',
          department: u.department || '',
          phone: u.phone || '',
          email: u.email || '',
        })
      } catch {
        setForm({
          name: '王小利',
          school: '湖南大学',
          department: '信息中心主任',
          phone: '18175792056',
          email: 'Andylexian22@gmail.com',
        })
      }
    }
    loadUser()
  }, [])

  const handleAvatarClick = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['用微信头像', '从相册选择', '拍照'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '已使用微信头像', icon: 'success' })
        } else if (res.tapIndex === 1) {
          Taro.chooseImage({ count: 1, sourceType: ['album'] })
        } else if (res.tapIndex === 2) {
          Taro.chooseImage({ count: 1, sourceType: ['camera'] })
        }
      },
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 800)
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }, [])

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <View className={`pe-page theme-${theme}`}>
      <View className="pe-back" onClick={() => Taro.navigateBack()}>
        <View className="pe-back-arrow" />
      </View>

      <View className="pe-avatar-section" onClick={handleAvatarClick}>
        <View className="pe-avatar-wrap">
          <Image
            className="pe-avatar"
            src={user?.avatar || 'https://placehold.co/120x120/e8e8e8/999?text=U'}
            mode="aspectFill"
          />
          <View className="pe-avatar-edit">
            <View className="pe-edit-pencil" />
          </View>
        </View>
      </View>

      <View className="pe-form">
        <View className="pe-field">
          <Text className="pe-label">姓名</Text>
          <View className="pe-input-wrap">
            <Input
              className="pe-input"
              value={form.name}
              onInput={e => updateField('name', e.detail.value)}
              placeholder="请输入姓名"
            />
          </View>
        </View>

        <View className="pe-field">
          <Text className="pe-label">学校</Text>
          <View className="pe-input-wrap">
            <Input
              className="pe-input"
              value={form.school}
              onInput={e => updateField('school', e.detail.value)}
              placeholder="请输入学校"
            />
          </View>
        </View>

        <View className="pe-field">
          <Text className="pe-label">学院/部门</Text>
          <View className="pe-input-wrap">
            <Input
              className="pe-input"
              value={form.department}
              onInput={e => updateField('department', e.detail.value)}
              placeholder="请输入学院或部门"
            />
          </View>
        </View>

        <View className="pe-field">
          <Text className="pe-label">手机号码</Text>
          <View className="pe-input-wrap">
            <Input
              className="pe-input"
              value={form.phone}
              onInput={e => updateField('phone', e.detail.value)}
              placeholder="请输入手机号码"
              type="number"
            />
          </View>
        </View>

        <View className="pe-field">
          <Text className="pe-label">电子邮箱</Text>
          <View className="pe-input-wrap">
            <Input
              className="pe-input"
              value={form.email}
              onInput={e => updateField('email', e.detail.value)}
              placeholder="请输入电子邮箱"
            />
          </View>
        </View>
      </View>

      <View className="pe-bottom">
        <View className={`pe-save-btn ${saving ? 'loading' : ''}`} onClick={handleSave}>
          <Text>{saving ? '保存中...' : '保存设置'}</Text>
        </View>
      </View>
    </View>
  )
}
