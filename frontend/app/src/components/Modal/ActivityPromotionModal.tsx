/**
 * 「活动推广」弹窗组件
 * 用于首次打开小程序时，推广正在报名中的活动
 */
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './ActivityPromotionModal.scss'

interface ActivityPromotionModalProps {
  visible: boolean
  activity: {
    id: number
    title: string
    cover_url?: string
    signup_deadline?: string  // 报名截止时间
    location?: string
  } | null
  onClose: () => void
}

const ActivityPromotionModal: React.FC<ActivityPromotionModalProps> = ({
  visible,
  activity,
  onClose
}) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // 计算倒计时
  useEffect(() => {
    if (!visible || !activity?.signup_deadline) return

    const calculateCountdown = () => {
      const now = new Date().getTime()
      const deadline = new Date(activity.signup_deadline!).getTime()
      const diff = deadline - now

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)

    return () => clearInterval(timer)
  }, [visible, activity?.signup_deadline])

  if (!visible || !activity) return null

  // 阻止背景点击穿透
  const handleMaskClick = (e: any) => {
    e.stopPropagation()
    onClose()
  }

  const handleContentClick = (e: any) => {
    e.stopPropagation()
  }

  // 立即报名
  const handleSignup = () => {
    onClose()
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    })
  }

  return (
    <View className="promotion-modal" onClick={handleMaskClick}>
      {/* 毛玻璃遮罩 */}
      <View className="modal-mask" />
      
      {/* 弹窗容器 - 包含卡片和关闭按钮 */}
      <View className="modal-wrapper" onClick={handleContentClick}>
        {/* 弹窗内容卡片 */}
        <View className="modal-content">
          {/* 活动封面 */}
          <View className="activity-cover">
            {activity.cover_url ? (
              <Image 
                src={activity.cover_url} 
                mode="aspectFill"
                className="cover-image"
              />
            ) : (
              <View className="cover-placeholder">
                <Text className="placeholder-icon">🎉</Text>
              </View>
            )}
            {/* 报名中标签 */}
            <View className="status-badge">
              <View className="pulse-dot" />
              <Text className="badge-text">报名中</Text>
            </View>
          </View>

          {/* 活动信息 */}
          <View className="activity-info">
            <Text className="activity-title">{activity.title}</Text>
            {activity.location && (
              <View className="location-row">
                <Text className="location-icon">📍</Text>
                <Text className="location-text">{activity.location}</Text>
              </View>
            )}
          </View>

          {/* 倒计时 */}
          {activity.signup_deadline && (
            <View className="countdown-section">
              <Text className="countdown-label">报名截止倒计时</Text>
              <View className="countdown-timer">
                <View className="time-block">
                  <Text className="time-value">{String(countdown.days).padStart(2, '0')}</Text>
                  <Text className="time-unit">天</Text>
                </View>
                <Text className="time-separator">:</Text>
                <View className="time-block">
                  <Text className="time-value">{String(countdown.hours).padStart(2, '0')}</Text>
                  <Text className="time-unit">时</Text>
                </View>
                <Text className="time-separator">:</Text>
                <View className="time-block">
                  <Text className="time-value">{String(countdown.minutes).padStart(2, '0')}</Text>
                  <Text className="time-unit">分</Text>
                </View>
                <Text className="time-separator">:</Text>
                <View className="time-block">
                  <Text className="time-value">{String(countdown.seconds).padStart(2, '0')}</Text>
                  <Text className="time-unit">秒</Text>
                </View>
              </View>
            </View>
          )}

          {/* 立即报名按钮 */}
          <View className="action-btn signup-now" onClick={handleSignup}>
            <Text className="btn-text">立即报名</Text>
            <Text className="btn-arrow">→</Text>
          </View>
        </View>

        {/* 关闭按钮 - 放在卡片下方 */}
        <View className="close-btn" onClick={onClose}>
          <Text className="close-icon">×</Text>
        </View>
      </View>
    </View>
  )
}

export default ActivityPromotionModal
