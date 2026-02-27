/**
 * 个人简介编辑页面 — 对标设计稿 + 前后端打通
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchCurrentUser, updateUser, type User } from '../../services/user'
import { CONFIG } from '../../config'
import { http } from '../../services/http'
import './index.scss'

const uploadAvatar = async (filePath: string): Promise<string> => {
  if (CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 500))
    return filePath
  }
  const res = await Taro.uploadFile({
    url: `${CONFIG.API_BASE_URL}/users/me/avatar`,
    filePath,
    name: 'file',
    header: { Authorization: `Bearer ${Taro.getStorageSync('token')}` },
  })
  const data = JSON.parse(res.data)
  return data.avatar_url
}

export default function ProfileEdit() {
  const { theme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
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
        setAvatarUrl(u.avatar || '')
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
      success: async (res) => {
        try {
          if (res.tapIndex === 0) {
            const wxUser = await Taro.getUserProfile({ desc: '获取头像' }).catch(() => null)
            if (wxUser?.userInfo?.avatarUrl) {
              const url = await uploadAvatar(wxUser.userInfo.avatarUrl)
              setAvatarUrl(url)
              Taro.showToast({ title: '头像已更新', icon: 'success' })
            }
          } else {
            const sourceType: Array<'album' | 'camera'> = res.tapIndex === 1 ? ['album'] : ['camera']
            const imgRes = await Taro.chooseImage({ count: 1, sourceType, sizeType: ['compressed'] })
            if (imgRes.tempFilePaths?.[0]) {
              Taro.showLoading({ title: '上传中...' })
              const url = await uploadAvatar(imgRes.tempFilePaths[0])
              setAvatarUrl(url)
              Taro.hideLoading()
              Taro.showToast({ title: '头像已更新', icon: 'success' })
            }
          }
        } catch {
          Taro.hideLoading()
          Taro.showToast({ title: '头像更新失败', icon: 'none' })
        }
      },
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      const updated = await updateUser({
        name: form.name.trim(),
        school: form.school.trim(),
        department: form.department.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ...(avatarUrl && avatarUrl !== user?.avatar ? { avatar: avatarUrl } : {}),
      })
      setUser(updated)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 800)
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }, [form, avatarUrl, user])

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <View className={`pe-page theme-${theme}`}>
      <View className="pe-back" onClick={() => Taro.navigateBack()}>
        <View className="pe-back-circle">
          <View className="pe-back-arrow" />
        </View>
      </View>

      <View className="pe-avatar-section" onClick={handleAvatarClick}>
        <View className="pe-avatar-wrap">
          <Image
            className="pe-avatar"
            src={avatarUrl || 'https://placehold.co/120x120/e8e8e8/999?text=U'}
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
