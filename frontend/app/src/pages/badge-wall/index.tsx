/**
 * 徽章墙页面
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

const BADGE_EMOJIS: Record<string, string> = {
  '初次登场': '🎯',
  '成功入选': '🎫',
  '准时到场': '⏰',
  '全勤达人': '✅',
  '开口有料': '💬',
  '金句制造机': '✨',
  '人气发言者': '🔥',
  '任务执行者': '📋',
  '连续打卡': '📆',
  '活力不息': '⚡',
  '徽章收藏家': '🏅',
  '活动助力官': '🤝',
  '活动之星': '🏆',
  '闪电报名王': '⚡',
  '午夜打卡者': '🌙',
  '周年纪念章': '🎂',
  '沉默观察员': '👀',
}

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
      <View className="wall-nav" onClick={() => Taro.navigateBack()}>
        <Text className="wall-back">←</Text>
      </View>

      {/* 用户信息 */}
      <View className="wall-user">
        <Image
          className="wall-avatar"
          src={user?.avatar_url || 'https://i.pravatar.cc/100?img=12'}
          mode="aspectFill"
        />
        <View className="wall-user-info">
          <Text className="wall-name">{user?.name || '用户'}</Text>
          <Text className="wall-org">{user?.organization}{user?.title}</Text>
        </View>
        <View className="wall-stats-row">
          <View className="wall-stat">
            <Text className="stat-label">累积成就</Text>
            <View className="stat-val">
              <Text className="stat-big">{earnedCount}</Text>
              <Text className="stat-small">/{totalCount}枚</Text>
            </View>
          </View>
          <View className="wall-stat">
            <Text className="stat-label">超越</Text>
            <View className="stat-val">
              <Text className="stat-big">{percent}%</Text>
              <Text className="stat-small">用户</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 徽章网格 */}
      <View className="wall-grid">
        {earnedBadges.map(badge => (
          <View key={badge.id} className="wall-badge-card">
            <View className="wall-badge-icon">
              <Text className="wall-emoji">{BADGE_EMOJIS[badge.name] || '🏅'}</Text>
            </View>
            <Text className="wall-badge-name">{badge.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
