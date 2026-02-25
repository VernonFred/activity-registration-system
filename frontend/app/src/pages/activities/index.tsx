/**
 * 我的活动列表页
 * 参考设计稿: 小程序端设计/我的-活动列表.png
 *
 * 页面结构：
 * 1. 顶部用户信息（头像 / 姓名 / 职位 / 退出登录 / 简介）
 * 2. 功能 Tab 栏（日历 / 记录 / 通知 / 设置）
 * 3. 活动卡片列表（可展开）
 * 4. 底部分页器
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import { useTheme } from '../../context/ThemeContext'
import { ActivityCard } from './components'
import { mockMyActivities } from './mockData'
import type { ActivityItem, FunctionTab } from './types'
import './index.scss'

// 用户信息 Mock
const mockUser = {
  name: '王小利',
  title: '湖南大学信息学院中心主任',
  bio: '这个用户很懒，还没填写个人简介',
  avatar: 'https://i.pravatar.cc/150?img=12',
}

const FUNCTION_TABS: { key: FunctionTab; icon: string; label: string }[] = [
  { key: 'activities',     icon: '📅', label: '活动' },
  { key: 'records',        icon: '📄', label: '记录' },
  { key: 'notifications',  icon: '🔔', label: '通知' },
  { key: 'settings',       icon: '⚙️', label: '设置' },
]

const ActivitiesPage = () => {
  const { theme } = useTheme()
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  const [activeTab, setActiveTab] = useState<FunctionTab>('activities')
  const [activities] = useState<ActivityItem[]>(mockMyActivities)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#1A3A2A',
    }).then(res => {
      if (res.confirm) Taro.showToast({ title: '已退出登录', icon: 'success' })
    })
  }

  const handleEditBio = () => {
    Taro.showToast({ title: '编辑个人简介', icon: 'none' })
  }

  return (
    <View className={`my-activities-page theme-${theme}`}>
      {/* 状态栏占位 */}
      <View style={{ height: `${statusBarHeight}px` }} />

      <ScrollView
        className="page-scroll"
        scrollY
        enhanced
        showScrollbar={false}
      >
        {/* ── 用户信息头部 ── */}
        <View className="user-header">
          <View className="user-info-row">
            <View className="avatar-wrap">
              <Image src={mockUser.avatar} className="user-avatar" mode="aspectFill" />
              <View className="avatar-badge">
                <Text className="avatar-badge-icon">📷</Text>
              </View>
            </View>
            <View className="user-meta">
              <Text className="user-name">{mockUser.name}</Text>
              <Text className="user-title">{mockUser.title}</Text>
            </View>
            <View className="logout-btn" onClick={handleLogout}>
              <Text className="logout-icon">↪</Text>
              <Text className="logout-text">退出登录</Text>
            </View>
          </View>
          <View className="bio-row">
            <Text className="bio-text">{mockUser.bio}</Text>
            <Text className="bio-edit" onClick={handleEditBio}> ✎</Text>
          </View>
        </View>

        {/* ── 功能 Tab 栏 ── */}
        <View className="function-tabs">
          {FUNCTION_TABS.map(tab => (
            <View
              key={tab.key}
              className={`function-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className="function-tab-icon">{tab.icon}</Text>
            </View>
          ))}
        </View>

        {/* ── 活动卡片列表 ── */}
        <View className="activity-list">
          {activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </View>

        {/* ── 分页器 ── */}
        <View className="pagination">
          <Text
            className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
          >
            ‹
          </Text>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Text
              key={p}
              className={`page-num ${currentPage === p ? 'active' : ''}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </Text>
          ))}
          <Text
            className={`page-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
          >
            ›
          </Text>
        </View>

        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部导航 */}
      <CustomTabBar current={1} />
    </View>
  )
}

export default ActivitiesPage
