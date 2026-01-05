/**
 * 活动卡片组件 - Lovable 精致风格
 * 创建时间: 2025年12月09日 12:00
 * 更新时间: 2026年1月05日 15:00
 *
 * 更新内容：
 * - 调整"去报名"按钮尺寸，移至右下角
 * - 添加卡片悬浮阴影和橙色边框反馈
 * - 优化整体排版更精致
 * - 2026年1月05日 14:00: 添加收藏、点赞、分享、评论互动按钮
 * - 2026年1月05日 15:00: 添加按钮动画效果和触觉反馈（haptic feedback）
 */

import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useState, useEffect } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import type { ActivityItem } from '../types'
import { toggleFavorite, toggleLike, recordShare } from '../../../services/engagements'
import { getFavorites, getLikes } from '../../../utils/storage'

// 元信息图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

// 互动按钮图标
import iconBookmark from '../../../assets/icons/bookmark.png'
import iconMessageCircle from '../../../assets/icons/message-circle.png'
import iconHeart from '../../../assets/icons/heart.png'
import iconShare from '../../../assets/icons/share-2.png'

interface ActivityCardProps {
  activity: ActivityItem
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { theme } = useTheme()

  // 互动按钮状态
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState({ favorite: false, like: false })
  const [animating, setAnimating] = useState({ favorite: false, like: false })

  // 初始化收藏和点赞状态
  useEffect(() => {
    const favorites = getFavorites()
    const likes = getLikes()
    setIsFavorited(favorites.has(Number(activity.id)))
    setIsLiked(likes.has(Number(activity.id)))
  }, [activity.id])

  // 格式化日期
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startStr = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}`
    const endStr = `${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`
    return `${startStr}-${endStr}`
  }

  // 点击卡片
  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    })
  }

  // 点击报名按钮
  const handleSignupClick = (e: any) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/signup/index?activityId=${activity.id}`
    })
  }

  // 收藏按钮 - 使用乐观更新策略
  const handleFavorite = useCallback(async (e: any) => {
    e.stopPropagation()
    if (loading.favorite) return

    const originalState = isFavorited
    setIsFavorited(!isFavorited) // 乐观更新
    setLoading(prev => ({ ...prev, favorite: true }))

    // 触发动画
    setAnimating(prev => ({ ...prev, favorite: true }))
    setTimeout(() => {
      setAnimating(prev => ({ ...prev, favorite: false }))
    }, 400)

    try {
      await toggleFavorite(Number(activity.id), originalState)
      // 触觉反馈
      Taro.vibrateShort({ type: 'light' })
      Taro.showToast({
        title: originalState ? '已取消收藏' : '已收藏',
        icon: 'none',
        duration: 1500
      })
    } catch (error) {
      // 失败时回滚状态
      setIsFavorited(originalState)
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(prev => ({ ...prev, favorite: false }))
    }
  }, [isFavorited, loading.favorite, activity.id])

  // 点赞按钮 - 使用乐观更新策略
  const handleLike = useCallback(async (e: any) => {
    e.stopPropagation()
    if (loading.like) return

    const originalState = isLiked
    setIsLiked(!isLiked) // 乐观更新
    setLoading(prev => ({ ...prev, like: true }))

    // 触发心形弹跳动画
    setAnimating(prev => ({ ...prev, like: true }))
    setTimeout(() => {
      setAnimating(prev => ({ ...prev, like: false }))
    }, 600)

    try {
      await toggleLike(Number(activity.id), originalState)
      // 触觉反馈
      Taro.vibrateShort({ type: 'light' })
      // 显示点赞反馈
      Taro.showToast({
        title: originalState ? '已取消点赞' : '已点赞',
        icon: 'none',
        duration: 1000
      })
    } catch (error) {
      // 失败时回滚状态
      setIsLiked(originalState)
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(prev => ({ ...prev, like: false }))
    }
  }, [isLiked, loading.like, activity.id])

  // 分享按钮
  const handleShare = useCallback((e: any) => {
    e.stopPropagation()
    Taro.showToast({
      title: '请点击右上角分享',
      icon: 'none',
      duration: 2000
    })
    // 后台记录分享（不阻塞用户操作）
    recordShare(Number(activity.id), 'wechat')
  }, [activity.id])

  // 评论按钮 - 功能开发中
  const handleComment = useCallback((e: any) => {
    e.stopPropagation()
    Taro.showToast({
      title: '评论功能开发中',
      icon: 'none',
      duration: 2000
    })
  }, [activity.id])

  return (
    <View className={`activity-card theme-${theme}`} onClick={handleCardClick}>
      {/* 左侧封面图 */}
      <View className="card-cover">
        <Image src={activity.cover} className="cover-img" mode="aspectFill" />
        {/* 免费标签 */}
        {activity.isFree && (
          <View className="free-badge">
            <Text className="free-text">免费</Text>
          </View>
        )}
      </View>

      {/* 右侧内容区 */}
      <View className="card-body">
        {/* 标题区 */}
        <View className="card-header">
          <Text className="card-title">{activity.title}</Text>
          {/* 评分 */}
          <View className="card-rating">
            <Text className="star-icon">★</Text>
            <Text className="rating-score">{activity.rating}</Text>
            <Text className="rating-count">({activity.ratingCount})</Text>
          </View>
        </View>

        {/* 元信息 */}
        <View className="card-meta-list">
          {/* 日期 */}
          <View className="meta-row">
            <Image src={iconCalendar} className="meta-icon" mode="aspectFit" />
            <Text className="meta-text">{formatDateRange(activity.startDate, activity.endDate)}</Text>
          </View>

          {/* 地点 */}
          <View className="meta-row">
            <Image src={iconMapPin} className="meta-icon" mode="aspectFit" />
            <Text className="meta-text location-text">{activity.city} {activity.location}</Text>
          </View>
        </View>

        {/* 底部操作区 */}
        <View className="card-footer">
          {/* 左侧互动按钮组 */}
          <View className="action-group">
            <View
              className={`action-btn ${isFavorited ? 'active' : ''} ${animating.favorite ? 'animate-bounce' : ''}`}
              onClick={handleFavorite}
            >
              <Image src={iconBookmark} className="action-icon" mode="aspectFit" />
            </View>

            <View className="action-btn" onClick={handleComment}>
              <Image src={iconMessageCircle} className="action-icon" mode="aspectFit" />
            </View>

            <View
              className={`action-btn ${isLiked ? 'active' : ''} ${animating.like ? 'animate-heart' : ''}`}
              onClick={handleLike}
            >
              <Image src={iconHeart} className="action-icon" mode="aspectFit" />
            </View>

            <View className="action-btn" onClick={handleShare}>
              <Image src={iconShare} className="action-icon" mode="aspectFit" />
            </View>
          </View>

          {/* 右侧报名按钮 */}
          <View className="signup-btn" onClick={handleSignupClick}>
            <Text className="btn-text">去报名</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ActivityCard
