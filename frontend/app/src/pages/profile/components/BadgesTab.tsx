/**
 * 徽章Tab组件 — 严格对标设计稿
 * 设计稿: 小程序端设计.sketch
 * 重构时间: 2026年2月26日
 */
import { useState, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Badge, BadgeCategory, UserInfo } from '../types'

interface BadgesTabProps {
  badges: Badge[]
  user: UserInfo | null
}

const CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: 'start', label: '启程成就' },
  { key: 'interact', label: '互动成就' },
  { key: 'honor', label: '荣誉成就' },
  { key: 'easter', label: '隐藏彩蛋' },
]

const BadgesTab: React.FC<BadgesTabProps> = ({ badges }) => {
  const [activeCat, setActiveCat] = useState<BadgeCategory>('start')
  const [easterRevealed, setEasterRevealed] = useState(false)

  const earnedCount = useMemo(() => badges.filter(b => b.is_earned).length, [badges])
  const totalCount = badges.length

  const featuredBadge = useMemo(
    () => badges.find(b => b.is_featured && b.is_earned) || badges.find(b => b.is_earned),
    [badges]
  )

  const categoryBadges = useMemo(
    () => badges.filter(b => b.category === activeCat),
    [badges, activeCat]
  )

  const handleBadgeWall = () => {
    Taro.navigateTo({ url: '/pages/badge-wall/index' })
  }

  return (
    <View className="tab-content badges-tab animate-fade-in">
      {/* Hero: 最近获得 + 统计 + 徽章墙 */}
      <View className="bt-hero">
        <View className="bt-hero-badge">
          {featuredBadge && <View className="bt-hero-tag"><Text>新获得</Text></View>}
          <View className="bt-hero-icon">
            {featuredBadge
              ? <Image className="bt-hero-img" src={featuredBadge.icon_url} mode="aspectFit" />
              : <Text className="bt-hero-placeholder">🔒</Text>
            }
          </View>
        </View>
        <View className="bt-hero-stats">
          <Text className="bt-stats-label">累积成就</Text>
          <View className="bt-stats-row">
            <Text className="bt-stats-num">{earnedCount}</Text>
            <Text className="bt-stats-total">/{totalCount}枚</Text>
          </View>
        </View>
        <View className="bt-wall-btn" onClick={handleBadgeWall}>
          <Text className="bt-wall-icon">🏆</Text>
          <Text className="bt-wall-text">徽章墙</Text>
        </View>
      </View>

      {/* 分类Tab */}
      <View className="bt-cat-tabs">
        {CATEGORIES.map(cat => (
          <View
            key={cat.key}
            className={`bt-cat-item ${activeCat === cat.key ? 'is-active' : ''}`}
            onClick={() => setActiveCat(cat.key)}
          >
            <Text>{cat.label}</Text>
            {activeCat === cat.key && <View className="bt-cat-line" />}
          </View>
        ))}
      </View>

      {/* 徽章列表 */}
      {activeCat === 'easter' && !easterRevealed && categoryBadges.every(b => !b.is_earned) ? (
        <View className="bt-easter-locked">
          <View className="bt-easter-shape">
            <View className="easter-tri" />
            <View className="easter-shadow" />
          </View>
          <View className="bt-easter-btn" onClick={() => setEasterRevealed(true)}>
            <Text>期待您的解锁</Text>
          </View>
        </View>
      ) : (
        <View className="bt-grid">
          {categoryBadges.map(badge => (
            <View key={badge.id} className={`bt-card ${badge.is_earned ? 'is-earned' : 'is-locked'}`}>
              <View className="bt-card-img-wrap">
                <Image className="bt-card-img" src={badge.icon_url} mode="aspectFit" />
              </View>
              <Text className="bt-card-name">{badge.name}</Text>
              {!badge.is_earned && badge.description && (
                <Text className="bt-card-desc">{badge.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default BadgesTab
