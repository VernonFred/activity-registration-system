/**
 * 徽章墙页面 — 探险地图风格
 * 创建时间: 2026年2月26日
 */
import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchCurrentUser } from '../../services/user'
import { mockBadges, mockUserData } from '../profile/mockData'
import type { Badge, UserInfo } from '../profile/types'
import './index.scss'

export default function BadgeWall() {
  const { theme } = useTheme()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [badges, setBadges] = useState<Badge[]>(mockBadges)

  useEffect(() => {
    const load = async () => {
      try {
        const apiUser = await fetchCurrentUser()
        setUser({
          id: apiUser.id,
          name: apiUser.name || apiUser.username || '用户',
          avatar_url: apiUser.avatar_url,
          organization: apiUser.organization,
          title: apiUser.title,
        })
      } catch {
        setUser(mockUserData)
      }
      setBadges(mockBadges)
    }
    load()
  }, [])

  const earnedBadges = useMemo(() => badges.filter(b => b.is_earned), [badges])
  const earnedCount = earnedBadges.length
  const totalCount = badges.length
  const percent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <View className={`badge-wall-page ${theme === 'dark' ? 'theme-dark' : ''}`}>
      {/* 卷轴顶部 */}
      <View className="wall-scroll-edge" />

      {/* 返回 */}
      <View className="wall-nav" onClick={() => Taro.navigateBack()}>
        <Text className="wall-back">←</Text>
        <Text className="wall-title">探险日志</Text>
      </View>

      {/* 用户信息 */}
      <View className="wall-user">
        <Image
          className="wall-avatar"
          src={user?.avatar_url || 'https://i.pravatar.cc/100?img=12'}
          mode="aspectFill"
        />
        <View className="wall-user-info">
          <Text className="wall-name">{user?.name || '探险家'}</Text>
          <Text className="wall-org">{user?.organization}{user?.title}</Text>
        </View>
      </View>

      {/* 统计 */}
      <View className="wall-stats">
        <View className="wall-stat-item">
          <Text className="stat-label">累积发现</Text>
          <View className="stat-val">
            <Text className="stat-big">{earnedCount}</Text>
            <Text className="stat-small">/{totalCount}枚</Text>
          </View>
        </View>
        <View className="wall-stat-divider" />
        <View className="wall-stat-item">
          <Text className="stat-label">超越</Text>
          <View className="stat-val">
            <Text className="stat-big">{percent}%</Text>
            <Text className="stat-small">探险家</Text>
          </View>
        </View>
      </View>

      {/* 分隔路径 */}
      <View className="wall-path-line" />

      {/* 徽章网格 */}
      <View className="wall-grid">
        {earnedBadges.map((badge, idx) => (
          <View
            key={badge.id}
            className="wall-badge-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <View className="wall-badge-glow" />
            <Image className="wall-badge-img" src={badge.icon_url} mode="aspectFit" />
            <Text className="wall-badge-name">{badge.name}</Text>
            <Text className="wall-badge-date">{badge.earned_at}</Text>
          </View>
        ))}
      </View>

      {/* 卷轴底部 */}
      <View className="wall-scroll-edge wall-scroll-bottom" />
    </View>
  )
}
