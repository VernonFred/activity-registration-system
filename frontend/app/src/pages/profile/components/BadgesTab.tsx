/**
 * 徽章Tab组件 — 重构版
 * 设计稿: 小程序端设计.sketch
 * 重构时间: 2026年2月26日
 */
import { useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Badge, BadgeCategory, UserInfo } from '../types'

interface BadgesTabProps {
  badges: Badge[]
  user: UserInfo | null
}

const BADGE_CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: 'start', label: '启程成就' },
  { key: 'interact', label: '互动成就' },
  { key: 'honor', label: '荣誉成就' },
  { key: 'easter', label: '隐藏彩蛋' },
]

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

const BadgesTab: React.FC<BadgesTabProps> = ({ badges, user }) => {
  const [activeCategory, setActiveCategory] = useState<BadgeCategory>('start')
  const [easterRevealed, setEasterRevealed] = useState(false)

  const earnedCount = useMemo(() => badges.filter(b => b.is_earned).length, [badges])
  const totalCount = badges.length

  const featuredBadge = useMemo(
    () => badges.find(b => b.is_featured && b.is_earned) || badges.find(b => b.is_earned),
    [badges]
  )

  const filteredBadges = useMemo(
    () => badges.filter(b => b.category === activeCategory),
    [badges, activeCategory]
  )

  const handleBadgeWall = () => {
    Taro.navigateTo({ url: '/pages/badge-wall/index' })
  }

  return (
    <View className="tab-content badges-content-v2 animate-fade-in">
      {/* Hero: 最近获得的徽章 */}
      <View className="badge-hero">
        <View className="hero-badge-wrap">
          {featuredBadge && (
            <View className="hero-badge-tag">
              <Text>新获得</Text>
            </View>
          )}
          <View className="hero-badge-icon">
            <Text className="hero-badge-emoji">{featuredBadge ? BADGE_EMOJIS[featuredBadge.name] || '🏅' : '🔒'}</Text>
            {featuredBadge && <Text className="hero-badge-label">{featuredBadge.name}</Text>}
          </View>
        </View>

        <View className="hero-stats">
          <Text className="stats-label">累积成就</Text>
          <View className="stats-value">
            <Text className="stats-num">{earnedCount}</Text>
            <Text className="stats-total">/{totalCount}枚</Text>
          </View>
        </View>

        <View className="hero-wall-btn" onClick={handleBadgeWall}>
          <Text className="wall-icon">🏆</Text>
          <Text className="wall-text">徽章墙</Text>
        </View>
      </View>

      {/* 分类Tab */}
      <View className="badge-category-tabs">
        {BADGE_CATEGORIES.map(cat => (
          <View
            key={cat.key}
            className={`category-tab ${activeCategory === cat.key ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text>{cat.label}</Text>
            {activeCategory === cat.key && <View className="tab-underline" />}
          </View>
        ))}
      </View>

      {/* 徽章列表 */}
      {activeCategory === 'easter' && !easterRevealed && filteredBadges.every(b => !b.is_earned) ? (
        <View className="easter-hidden">
          <View className="easter-pyramid">
            <View className="pyramid-shape" />
            <View className="pyramid-glow" />
          </View>
          <View className="easter-unlock-btn" onClick={() => setEasterRevealed(true)}>
            <Text>期待您的解锁</Text>
          </View>
        </View>
      ) : (
        <View className="badge-grid-v2">
          {filteredBadges.map(badge => (
            <View key={badge.id} className={`badge-card ${badge.is_earned ? 'is-earned' : 'is-locked'}`}>
              <View className="badge-card-icon">
                <Text className="card-emoji">{BADGE_EMOJIS[badge.name] || '🏅'}</Text>
                {badge.is_earned && <View className="earned-ring" />}
              </View>
              <Text className="badge-card-name">{badge.name}</Text>
              {!badge.is_earned && badge.description && (
                <Text className="badge-card-desc">{badge.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default BadgesTab
