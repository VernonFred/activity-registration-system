/**
 * 徽章墙页面 — 纯 CSS 徽章设计
 * 创建时间: 2026年2月26日
 * 重构时间: 2026年2月27日 — 使用 CSS 徽章替换 PNG
 */
import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchCurrentUser } from '../../services/user'
import { mockBadges, mockUserData } from '../profile/mockData'
import { getBadgeVisual } from '../profile/components/BadgesTab'
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
          name: apiUser.name || '用户',
          avatar_url: apiUser.avatar,
          organization: [apiUser.school, apiUser.department].filter(Boolean).join(''),
          title: apiUser.position,
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

      {/* 徽章 2列网格 — CSS 徽章 */}
      <View className="bw-grid">
        {earnedBadges.map(badge => {
          const v = getBadgeVisual(badge.name)
          return (
            <View key={badge.id} className="bw-card">
              <View
                className="css-badge css-badge--wall"
                style={{ background: v.gradient, boxShadow: `0 4px 20px ${v.glow}` }}
              >
                <View className="css-badge__ring" />
                <View className="css-badge__inner-ring" />
                <Text className="css-badge__symbol">{v.symbol}</Text>
              </View>
              <Text className="bw-badge-name">{badge.name}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
