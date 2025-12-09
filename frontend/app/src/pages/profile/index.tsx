/**
 * 个人中心页面
 * 重构时间: 2025年12月9日
 * 代码行数: 从640行优化至约180行
 */
import { useState, useEffect, useCallback } from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import {
  ProfileHeader,
  ActivitiesTab,
  BadgesTab,
  NotificationsTab,
  SettingsTab,
} from './components'
import type { ProfileTab, NotifyTab, UserInfo, SignupRecord, Notification, Badge } from './types'
import { mockUserData, mockSignups, mockNotifications, mockBadges } from './mockData'
import './index.scss'

// Tab 配置
const TABS: { key: ProfileTab; icon: string; activeIcon: string }[] = [
  { key: 'activities', icon: '📅', activeIcon: '📅' },
  { key: 'badges', icon: '🏆', activeIcon: '🏆' },
  { key: 'notifications', icon: '🔔', activeIcon: '🔔' },
  { key: 'settings', icon: '⚙️', activeIcon: '⚙️' },
]

export default function Profile() {
  // 状态
  const [activeTab, setActiveTab] = useState<ProfileTab>('activities')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [signups, setSignups] = useState<SignupRecord[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [notifyTab, setNotifyTab] = useState<NotifyTab>('system')
  const [expandedSignup, setExpandedSignup] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载用户数据
  useEffect(() => {
    setTimeout(() => {
      setUser(mockUserData)
      setSignups(mockSignups)
      setNotifications(mockNotifications)
      setBadges(mockBadges)
      setLoading(false)
    }, 500)
  }, [])

  // 切换Tab
  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab)
  }, [])

  // 退出登录
  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorage()
          Taro.reLaunch({ url: '/pages/index/index' })
        }
      },
    })
  }, [])

  // 展开/收起报名详情
  const toggleSignupExpand = useCallback((id: number) => {
    setExpandedSignup(expandedSignup === id ? null : id)
  }, [expandedSignup])

  // 查看活动详情
  const handleViewActivity = useCallback((activityId: number) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` })
  }, [])

  // 修改报名信息
  const handleEditSignup = useCallback((signupId: number) => {
    Taro.showToast({ title: '修改报名信息', icon: 'none' })
  }, [])

  // 取消报名
  const handleCancelSignup = useCallback((signupId: number) => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消报名', icon: 'none' })
        }
      },
    })
  }, [])

  // 添加同行人员
  const handleAddCompanion = useCallback((signupId: number) => {
    Taro.showToast({ title: '添加同行人员', icon: 'none' })
  }, [])

  // 查看参会凭证
  const handleViewCredential = useCallback((signupId: number) => {
    Taro.showToast({ title: '查看参会凭证', icon: 'none' })
  }, [])

  // 删除通知
  const handleDeleteNotification = useCallback((id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
    Taro.showToast({ title: '已删除', icon: 'none' })
  }, [notifications])

  // 设置项点击
  const handleSettingClick = useCallback((setting: string) => {
    const messages: Record<string, string> = {
      profile: '个人简介',
      payment: '我的缴费',
      invoice: '发票抬头',
      language: '多语言',
      darkmode: '暗黑模式',
      privacy: '隐私与政策',
      help: '支持与帮助',
    }
    Taro.showToast({ title: messages[setting] || setting, icon: 'none' })
  }, [])

  // 加载状态
  if (loading) {
    return (
      <View className="profile-page loading">
        <View className="skeleton-header" />
        <View className="skeleton-tabs" />
        <View className="skeleton-content" />
      </View>
    )
  }

  return (
    <View className="profile-page">
      <ProfileHeader
        user={user}
        activeTab={activeTab}
        tabs={TABS}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onEditProfile={() => handleSettingClick('profile')}
      />

      <ScrollView className="content-area" scrollY>
        {activeTab === 'activities' && (
          <ActivitiesTab
            signups={signups}
            user={user}
            expandedSignup={expandedSignup}
            onToggleExpand={toggleSignupExpand}
            onViewActivity={handleViewActivity}
            onEditSignup={handleEditSignup}
            onCancelSignup={handleCancelSignup}
            onAddCompanion={handleAddCompanion}
            onViewCredential={handleViewCredential}
            onPayment={() => handleSettingClick('payment')}
          />
        )}

        {activeTab === 'badges' && (
          <BadgesTab badges={badges} user={user} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            notifyTab={notifyTab}
            onNotifyTabChange={setNotifyTab}
            onDeleteNotification={handleDeleteNotification}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab onSettingClick={handleSettingClick} />
        )}
      </ScrollView>

      <CustomTabBar current={2} />
    </View>
  )
}
