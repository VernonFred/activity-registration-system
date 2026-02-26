/**
 * 徽章墙页面 — 对标设计稿
 * 设计稿: 小程序端设计.sketch
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
      {/* 返回 */}
      <View className="bw-nav" onClick={() => Taro.navigateBack()}>
        <Text className="bw-back">←</Text>
      </View>

      {/* 用户信息 + 统计 */}
      <View className="bw-header">
        <Image
          className="bw-avatar"
          src={user?.avatar_url || 'https://i.pravatar.cc/100?img=12'}
          mode="aspectFill"
        />
        <View className="bw-user-info">
          <Text className="bw-name">{user?.name || '用户'}</Text>
          <Text className="bw-org">{user?.organization}{user?.title}</Text>
        </View>
        <View className="bw-stats">
          <View className="bw-stat">
            <Text className="bw-stat-label">累积成就</Text>
            <View className="bw-stat-val">
              <Text className="bw-stat-big">{earnedCount}</Text>
              <Text className="bw-stat-small">/{totalCount}枚</Text>
            </View>
          </View>
          <View className="bw-stat">
            <Text className="bw-stat-label">超越</Text>
            <View className="bw-stat-val">
              <Text className="bw-stat-big">{percent}%</Text>
              <Text className="bw-stat-small">用户</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 徽章 2列网格 */}
      <View className="bw-grid">
        {earnedBadges.map(badge => (
          <View key={badge.id} className="bw-card">
            <Image className="bw-badge-img" src={badge.icon_url} mode="aspectFit" />
            <Text className="bw-badge-name">{badge.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
