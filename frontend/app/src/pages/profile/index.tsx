import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../components/CustomTabBar'
import './index.scss'

// Tab 类型
type ProfileTab = 'activities' | 'badges' | 'notifications' | 'settings'

// 用户信息
interface UserInfo {
  id: number
  name: string
  avatar_url?: string
  organization?: string
  title?: string
  bio?: string
}

// 报名记录
interface SignupRecord {
  id: number
  activity_id: number
  activity_title: string
  activity_desc?: string
  activity_date: string
  status: 'pending' | 'approved' | 'rejected'
  checkin_status: 'not_checked_in' | 'checked_in' | 'no_show'
  payment_status?: 'unpaid' | 'paid'
  likes: number
  comments: number
  favorites: number
  shares: number
  companions?: { id: number; name: string }[]
}

// 通知
interface Notification {
  id: number
  type: 'success' | 'warning' | 'info' | 'badge'
  title: string
  content: string
  time: string
  is_new: boolean
  action_url?: string
  action_text?: string
}

// 徽章
interface Badge {
  id: number
  name: string
  icon_url: string
  category: string
  is_earned: boolean
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('activities')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [signups, setSignups] = useState<SignupRecord[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [notifyTab, setNotifyTab] = useState<'system' | 'mentions' | 'comments'>('system')
  const [expandedSignup, setExpandedSignup] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载用户数据
  useEffect(() => {
    // 模拟加载用户数据
    setTimeout(() => {
      setUser({
        id: 1,
        name: '王小利',
        avatar_url: 'https://i.pravatar.cc/100?img=12',
        organization: '湖南大学信息学院中心',
        title: '主任',
        bio: '这个用户很懒，还没填写个人简介',
      })
      
      setSignups([
        {
          id: 1,
          activity_id: 1,
          activity_title: '高校品牌沙龙·长沙',
          activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
          activity_date: '2025-11-10',
          status: 'approved',
          checkin_status: 'not_checked_in',
          payment_status: 'paid',
          likes: 103,
          comments: 67,
          favorites: 20,
          shares: 105,
          companions: [
            { id: 1, name: '张小三' },
            { id: 2, name: '张小三' },
          ],
        },
        {
          id: 2,
          activity_id: 2,
          activity_title: '高校品牌沙龙·长沙',
          activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
          activity_date: '2025-11-10',
          status: 'approved',
          checkin_status: 'checked_in',
          likes: 103,
          comments: 67,
          favorites: 20,
          shares: 105,
          companions: [
            { id: 3, name: '王小利' },
            { id: 4, name: '张小三' },
          ],
        },
      ])
      
      setNotifications([
        {
          id: 1,
          type: 'success',
          title: '报名成功',
          content: '您的「暑期培训会议」已经报名成功，请准时参加。',
          time: '1小时前',
          is_new: true,
        },
        {
          id: 2,
          type: 'info',
          title: '填写调查问卷',
          content: '「暑期培训会议」已经圆满结束，期待您的真诚建议与反馈。',
          time: '1小时前',
          is_new: true,
          action_url: '/pages/survey/index',
          action_text: '去填写',
        },
        {
          id: 3,
          type: 'warning',
          title: '还未缴费',
          content: '您的「暑期培训会议」还未缴费，请及时缴费。',
          time: '2小时前',
          is_new: false,
        },
        {
          id: 4,
          type: 'badge',
          title: '荣获勋章',
          content: '恭喜您解锁「一周年」勋章',
          time: '2小时前',
          is_new: false,
          action_url: '/pages/badges/index',
          action_text: '查看勋章',
        },
      ])
      
      setBadges([
        { id: 1, name: '周年纪念章', icon_url: 'https://example.com/badge1.png', category: '启程成就', is_earned: true },
        { id: 2, name: '午夜打卡者', icon_url: 'https://example.com/badge2.png', category: '互动成就', is_earned: true },
        { id: 3, name: '周年纪念章', icon_url: 'https://example.com/badge1.png', category: '启程成就', is_earned: true },
        { id: 4, name: '午夜打卡者', icon_url: 'https://example.com/badge2.png', category: '互动成就', is_earned: false },
      ])
      
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
    switch (setting) {
      case 'profile':
        Taro.showToast({ title: '个人简介', icon: 'none' })
        break
      case 'payment':
        Taro.showToast({ title: '我的缴费', icon: 'none' })
        break
      case 'invoice':
        Taro.showToast({ title: '发票抬头', icon: 'none' })
        break
      case 'language':
        Taro.showToast({ title: '多语言', icon: 'none' })
        break
      case 'darkmode':
        Taro.showToast({ title: '暗黑模式', icon: 'none' })
        break
      case 'privacy':
        Taro.showToast({ title: '隐私与政策', icon: 'none' })
        break
      case 'help':
        Taro.showToast({ title: '支持与帮助', icon: 'none' })
        break
    }
  }, [])

  // 查看徽章
  const handleViewBadges = useCallback(() => {
    Taro.showToast({ title: '查看徽章墙', icon: 'none' })
  }, [])

  const tabs: { key: ProfileTab; icon: string; activeIcon: string }[] = [
    { key: 'activities', icon: '📅', activeIcon: '📅' },
    { key: 'badges', icon: '🏆', activeIcon: '🏆' },
    { key: 'notifications', icon: '🔔', activeIcon: '🔔' },
    { key: 'settings', icon: '⚙️', activeIcon: '⚙️' },
  ]

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
      {/* 用户信息头部 */}
      <View className="user-header">
        <View className="user-info">
          <View className="avatar-container">
            <Image
              className="avatar"
              src={user?.avatar_url || 'https://i.pravatar.cc/100'}
              mode="aspectFill"
            />
            <View className="avatar-edit">📷</View>
          </View>
          <View className="user-detail">
            <Text className="user-name">{user?.name || '未登录'}</Text>
            <Text className="user-org">{user?.organization} {user?.title}</Text>
          </View>
          <View className="logout-btn" onClick={handleLogout}>
            <Text className="logout-icon">🚪</Text>
            <Text className="logout-text">退出登录</Text>
          </View>
        </View>
        <View className="user-bio" onClick={() => handleSettingClick('profile')}>
          <Text className="bio-text">{user?.bio || '点击编辑个人简介'}</Text>
          <Text className="bio-edit">✏️</Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="tab-bar">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className="tab-icon">{activeTab === tab.key ? tab.activeIcon : tab.icon}</Text>
          </View>
        ))}
      </View>

      {/* 内容区域 */}
      <ScrollView className="content-area" scrollY>
        {/* 活动列表 Tab */}
        {activeTab === 'activities' && (
          <View className="tab-content activities-content animate-fade-in">
            {signups.map((signup) => (
              <View key={signup.id} className="signup-card glass-card">
                {/* 活动信息 */}
                <View className="signup-header" onClick={() => handleViewActivity(signup.activity_id)}>
                  <View className="activity-info">
                    <Text className="activity-title">{signup.activity_title}</Text>
                    <View className={`status-tag ${signup.status}`}>
                      {signup.status === 'approved' ? '已报名' : signup.status === 'pending' ? '待审核' : '已驳回'}
                    </View>
                  </View>
                  <Text className="activity-desc">{signup.activity_desc}</Text>
                  <Text className="activity-date">{formatDate(signup.activity_date)}</Text>
                  <View className="activity-stats">
                    <View className="stat-item">
                      <Text className="stat-icon">❤️</Text>
                      <Text className="stat-value">{signup.likes} 点赞</Text>
                    </View>
                    <View className="stat-item">
                      <Text className="stat-icon">💬</Text>
                      <Text className="stat-value">{signup.comments} 评论</Text>
                    </View>
                    <View className="stat-item">
                      <Text className="stat-icon">⭐</Text>
                      <Text className="stat-value">{signup.favorites} 收藏</Text>
                    </View>
                    <View className="stat-item">
                      <Text className="stat-icon">↗️</Text>
                      <Text className="stat-value">{signup.shares} 分享</Text>
                    </View>
                  </View>
                </View>

                {/* 展开/收起按钮 */}
                <View className="expand-btn" onClick={() => toggleSignupExpand(signup.id)}>
                  <Text className={`expand-icon ${expandedSignup === signup.id ? 'expanded' : ''}`}>▼</Text>
                </View>

                {/* 展开内容 */}
                {expandedSignup === signup.id && (
                  <View className="signup-detail animate-slide-down">
                    {/* 参与人员列表 */}
                    <View className="participant-list">
                      {/* 主报名人 */}
                      <View className="participant-item main">
                        <Text className="participant-name">{user?.name}</Text>
                        <View className="participant-actions">
                          {signup.checkin_status === 'not_checked_in' && (
                            <>
                              <Text className="action-link" onClick={() => handleSettingClick('payment')}>
                                {signup.payment_status === 'paid' ? '已缴费' : '去缴费'}
                              </Text>
                              <Text className="action-link" onClick={() => handleViewCredential(signup.id)}>
                                去签到
                              </Text>
                            </>
                          )}
                          {signup.checkin_status === 'checked_in' && (
                            <Text className="action-link" onClick={() => handleViewCredential(signup.id)}>查看参会凭证</Text>
                          )}
                          <View className="more-actions" onClick={(e) => { e.stopPropagation() }}>
                            <Text className="more-icon">•••</Text>
                            <View className="dropdown-menu">
                              <View className="menu-item" onClick={() => handleEditSignup(signup.id)}>
                                <Text>✏️ 修改信息</Text>
                              </View>
                              <View className="menu-item danger" onClick={() => handleCancelSignup(signup.id)}>
                                <Text>🗑️ 取消报名</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* 同行人员 */}
                      {signup.companions?.map((companion) => (
                        <View key={companion.id} className="participant-item">
                          <Text className="participant-name">{companion.name}</Text>
                          <View className="participant-actions">
                            {signup.checkin_status === 'checked_in' && (
                              <Text className="action-link" onClick={() => handleViewCredential(signup.id)}>查看参会凭证</Text>
                            )}
                            {signup.checkin_status !== 'checked_in' && (
                              <>
                                <Text className="action-link warning">去缴费</Text>
                                <Text className="action-link warning">去签到</Text>
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* 添加同行人员按钮 */}
                    {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
                      <View className="add-companion-btn" onClick={() => handleAddCompanion(signup.id)}>
                        <Text>添加同行人员</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            {/* 分页 */}
            <View className="pagination">
              <Text className="page-btn disabled">‹</Text>
              <Text className="page-num active">1</Text>
              <Text className="page-num">2</Text>
              <Text className="page-num">3</Text>
              <Text className="page-num">4</Text>
              <Text className="page-btn">›</Text>
            </View>
          </View>
        )}

        {/* 徽章 Tab */}
        {activeTab === 'badges' && (
          <View className="tab-content badges-content animate-fade-in">
            <View className="badges-header">
              <View className="badges-avatar">
                <Image
                  className="avatar"
                  src={user?.avatar_url || 'https://i.pravatar.cc/100'}
                  mode="aspectFill"
                />
              </View>
              <View className="badges-info">
                <Text className="badges-name">{user?.name}</Text>
                <Text className="badges-org">{user?.organization}{user?.title}</Text>
              </View>
              <View className="badges-stats">
                <View className="stat-item">
                  <Text className="stat-label">累积成就</Text>
                  <View className="stat-value">
                    <Text className="value-num">3</Text>
                    <Text className="value-total">/36枚</Text>
                  </View>
                </View>
                <View className="stat-item">
                  <Text className="stat-label">超越</Text>
                  <View className="stat-value">
                    <Text className="value-num">37%</Text>
                    <Text className="value-total">用户</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="badges-grid">
              {badges.map((badge) => (
                <View key={badge.id} className={`badge-item ${badge.is_earned ? '' : 'locked'}`}>
                  <View className="badge-icon">
                    <Text className="badge-emoji">🏅</Text>
                    <View className="badge-ribbon">
                      <Text>{badge.name}</Text>
                    </View>
                  </View>
                  <Text className="badge-name">{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 通知 Tab */}
        {activeTab === 'notifications' && (
          <View className="tab-content notifications-content animate-fade-in">
            {/* 通知子Tab */}
            <View className="notify-tabs">
              <View
                className={`notify-tab ${notifyTab === 'system' ? 'active' : ''}`}
                onClick={() => setNotifyTab('system')}
              >
                系统通知
              </View>
              <View
                className={`notify-tab ${notifyTab === 'mentions' ? 'active' : ''}`}
                onClick={() => setNotifyTab('mentions')}
              >
                @ 我的
              </View>
              <View
                className={`notify-tab ${notifyTab === 'comments' ? 'active' : ''}`}
                onClick={() => setNotifyTab('comments')}
              >
                我的评论
              </View>
            </View>

            {/* 批量操作 */}
            <View className="notify-actions">
              <View className="action-btn">
                <Text>🔘</Text>
              </View>
              <View className="action-btn">
                <Text>批量删除</Text>
              </View>
            </View>

            {/* 通知列表 */}
            <View className="notify-list">
              {notifications.map((notify) => (
                <View key={notify.id} className={`notify-item ${notify.type}`}>
                  <View className="notify-icon">
                    {notify.type === 'success' && <Text>✅</Text>}
                    {notify.type === 'warning' && <Text>⚠️</Text>}
                    {notify.type === 'info' && <Text>ℹ️</Text>}
                    {notify.type === 'badge' && <Text>🏅</Text>}
                  </View>
                  <View className="notify-content">
                    <View className="notify-header">
                      <Text className="notify-title">{notify.title}</Text>
                      {notify.is_new && <View className="new-tag">新</View>}
                    </View>
                    <Text className="notify-text">{notify.content}</Text>
                    {notify.action_url && (
                      <View className="notify-action">
                        <Text className="action-text">→ {notify.action_text}</Text>
                      </View>
        )}
                    <Text className="notify-time">{notify.time}</Text>
                  </View>
                  <View className="notify-delete" onClick={() => handleDeleteNotification(notify.id)}>
                    <Text>🗑️</Text>
                  </View>
                </View>
              ))}
      </View>

            {/* 分页 */}
            <View className="pagination">
              <Text className="page-btn disabled">‹</Text>
              <Text className="page-num active">1</Text>
              <Text className="page-num">2</Text>
              <Text className="page-num">3</Text>
              <Text className="page-num">4</Text>
              <Text className="page-btn">›</Text>
            </View>
          </View>
        )}

        {/* 设置 Tab */}
        {activeTab === 'settings' && (
          <View className="tab-content settings-content animate-fade-in">
            {/* 个人资料 */}
            <View className="settings-section">
              <Text className="section-title">个人资料</Text>
              <View className="settings-list">
                <View className="setting-item" onClick={() => handleSettingClick('profile')}>
                  <Text className="setting-icon">👤</Text>
                  <Text className="setting-label">个人简介</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
                <View className="setting-item" onClick={() => handleSettingClick('payment')}>
                  <Text className="setting-icon">💰</Text>
                  <Text className="setting-label">我的缴费</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
                <View className="setting-item" onClick={() => handleSettingClick('invoice')}>
                  <Text className="setting-icon">🧾</Text>
                  <Text className="setting-label">我的发票抬头</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
              </View>
            </View>

            {/* 界面与显示 */}
            <View className="settings-section">
              <Text className="section-title">界面与显示</Text>
              <View className="settings-list">
                <View className="setting-item" onClick={() => handleSettingClick('language')}>
                  <Text className="setting-icon">🌐</Text>
                  <Text className="setting-label">多语言</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
                <View className="setting-item" onClick={() => handleSettingClick('darkmode')}>
                  <Text className="setting-icon">🌙</Text>
                  <Text className="setting-label">暗黑模式</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
              </View>
      </View>

            {/* 关于 */}
            <View className="settings-section">
              <Text className="section-title">关于</Text>
              <View className="settings-list">
                <View className="setting-item" onClick={() => handleSettingClick('privacy')}>
                  <Text className="setting-icon">🛡️</Text>
                  <Text className="setting-label">隐私与政策</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
                <View className="setting-item" onClick={() => handleSettingClick('help')}>
                  <Text className="setting-icon">❓</Text>
                  <Text className="setting-label">支持与帮助</Text>
                  <Text className="setting-arrow">›</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 自定义TabBar */}
      <CustomTabBar current={2} />
    </View>
  )
}
