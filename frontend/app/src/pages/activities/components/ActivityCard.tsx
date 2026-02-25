/**
 * 活动卡片组件 - 我的活动列表
 * 参考设计稿: 小程序端设计/我的-活动列表.png
 */

import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../../context/ThemeContext'
import type { ActivityItem, Participant } from '../types'

interface ActivityCardProps {
  activity: ActivityItem
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [menuVisible, setMenuVisible] = useState<string | null>(null)

  const isRegistered = activity.status === 'registered'

  const handleMenuToggle = (e: any, participantId: string) => {
    e.stopPropagation()
    setMenuVisible(menuVisible === participantId ? null : participantId)
  }

  const handleEditInfo = (e: any, p: Participant) => {
    e.stopPropagation()
    setMenuVisible(null)
    Taro.showToast({ title: `修改 ${p.name} 的信息`, icon: 'none' })
  }

  const handleCancelSignup = (e: any, p: Participant) => {
    e.stopPropagation()
    setMenuVisible(null)
    Taro.showModal({
      title: '取消报名',
      content: `确定要取消 ${p.name} 的报名吗？`,
      confirmColor: '#D9534F',
    }).then(res => {
      if (res.confirm) Taro.showToast({ title: '已取消报名', icon: 'success' })
    })
  }

  const handlePay = (e: any, p: Participant) => {
    e.stopPropagation()
    Taro.showToast({ title: `去缴费：${p.name}`, icon: 'none' })
  }

  const handleCheckin = (e: any, p: Participant) => {
    e.stopPropagation()
    Taro.showToast({ title: `去签到：${p.name}`, icon: 'none' })
  }

  const handleCompleteTransport = (e: any) => {
    e.stopPropagation()
    Taro.showToast({ title: '完善交通信息', icon: 'none' })
  }

  const handleViewCredential = (e: any, p: Participant) => {
    e.stopPropagation()
    Taro.showToast({ title: `查看 ${p.name} 的参会凭证`, icon: 'none' })
  }

  const handleAddCompanion = () => {
    Taro.showToast({ title: '添加同行人员', icon: 'none' })
  }

  return (
    <View
      className={`my-activity-card theme-${theme}`}
      onClick={menuVisible ? () => setMenuVisible(null) : undefined}
    >
      {/* 卡片主体 */}
      <View className="card-main">
        {/* 标题行 */}
        <View className="card-title-row">
          <Text className="card-title">{activity.title}</Text>
          <View className={`status-badge ${activity.status}`}>
            <Text className="status-badge-text">
              {isRegistered ? '已报名' : '已参加'}
            </Text>
          </View>
        </View>

        {/* 描述 */}
        <Text className="card-desc">{activity.description}</Text>

        {/* 日期 */}
        <Text className="card-date">{activity.date}</Text>

        {/* 互动数据行 + 展开箭头 */}
        <View className="card-stats-row">
          <View className="stats-group">
            <View className="stat-item">
              <Text className="stat-icon liked">♥</Text>
              <Text className="stat-num">{activity.likes} 点赞</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-icon comment">○</Text>
              <Text className="stat-num">{activity.comments} 评论</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-icon fav">★</Text>
              <Text className="stat-num">{activity.favorites} 收藏</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-icon share">↩</Text>
              <Text className="stat-num">{activity.shares} 分享</Text>
            </View>
          </View>
          <View
            className={`expand-btn ${expanded ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            <Text className="expand-icon">∨</Text>
          </View>
        </View>
      </View>

      {/* 展开区域 */}
      {expanded && (
        <View className="card-expand">
          <View className="expand-divider" />

          {activity.participants.map((p) => (
            <View key={p.id} className="participant-row">
              {/* 姓名 + 完善信息链接 */}
              <View className="participant-left">
                <Text className="participant-name">{p.name}</Text>
                {p.isPrimary && p.needsTransportInfo && (
                  <View className="transport-link" onClick={handleCompleteTransport}>
                    <Text className="transport-arrow">→</Text>
                    <Text className="transport-text">完善交通信息</Text>
                  </View>
                )}
              </View>

              {/* 右侧操作 */}
              <View className="participant-actions">
                {isRegistered ? (
                  <>
                    {p.paymentStatus === 'paid' ? (
                      <View className="tag-done"><Text className="tag-text">已缴费</Text></View>
                    ) : (
                      <View className="tag-todo" onClick={(e) => handlePay(e, p)}>
                        <Text className="tag-text-action">去缴费</Text>
                      </View>
                    )}
                    {p.checkinStatus === 'checked' ? (
                      <View className="tag-done"><Text className="tag-text">已签到</Text></View>
                    ) : (
                      <View className="tag-todo" onClick={(e) => handleCheckin(e, p)}>
                        <Text className="tag-text-action">去签到</Text>
                      </View>
                    )}
                    <View className="menu-wrap">
                      <View className="menu-btn" onClick={(e) => handleMenuToggle(e, p.id)}>
                        <Text className="menu-dots">···</Text>
                      </View>
                      {menuVisible === p.id && (
                        <View className="dropdown-menu">
                          <View className="menu-item" onClick={(e) => handleEditInfo(e, p)}>
                            <Text className="menu-item-icon">✎</Text>
                            <Text className="menu-item-text">修改信息</Text>
                          </View>
                          <View className="menu-item danger" onClick={(e) => handleCancelSignup(e, p)}>
                            <Text className="menu-item-icon red">■</Text>
                            <Text className="menu-item-text red">取消报名</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <Text className="credential-link" onClick={(e) => handleViewCredential(e, p)}>
                    查看参会凭证
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* 添加同行人员（仅已报名） */}
          {isRegistered && (
            <View className="add-companion-btn" onClick={handleAddCompanion}>
              <Text className="add-companion-text">添加同行人员</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default ActivityCard
