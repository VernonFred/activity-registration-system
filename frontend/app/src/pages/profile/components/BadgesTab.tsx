/**
 * 徽章Tab组件 — 探险地图风格
 * 创建时间: 2026年2月26日
 */
import { useState, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Badge, BadgeCategory, UserInfo } from '../types'

interface BadgesTabProps {
  badges: Badge[]
  user: UserInfo | null
}

const REGIONS: { key: BadgeCategory; label: string; theme: string }[] = [
  { key: 'start', label: '出发港口', theme: 'port' },
  { key: 'interact', label: '社交广场', theme: 'plaza' },
  { key: 'honor', label: '荣誉殿堂', theme: 'hall' },
  { key: 'easter', label: '迷雾秘境', theme: 'mist' },
]

const BadgesTab: React.FC<BadgesTabProps> = ({ badges, user }) => {
  const [activeRegion, setActiveRegion] = useState<BadgeCategory>('start')
  const [fogCleared, setFogCleared] = useState(false)
  const [focusBadge, setFocusBadge] = useState<Badge | null>(null)

  const earnedCount = useMemo(() => badges.filter(b => b.is_earned).length, [badges])
  const totalCount = badges.length

  const featuredBadge = useMemo(
    () => badges.find(b => b.is_featured && b.is_earned) || badges.find(b => b.is_earned),
    [badges]
  )

  const regionBadges = useMemo(
    () => badges.filter(b => b.category === activeRegion),
    [badges, activeRegion]
  )

  const handleBadgeWall = () => {
    Taro.navigateTo({ url: '/pages/badge-wall/index' })
  }

  const handleBadgeTap = (badge: Badge) => {
    setFocusBadge(prev => prev?.id === badge.id ? null : badge)
  }

  return (
    <View className="tab-content badges-map animate-fade-in">
      {/* 羊皮卷装饰边缘 */}
      <View className="map-scroll-edge map-scroll-top" />

      {/* 指南针 Hero */}
      <View className="map-compass">
        <View className="compass-ring">
          <View className="compass-progress" style={{ background: `conic-gradient(#8b6914 0deg, #c9a227 ${(earnedCount / totalCount) * 360}deg, rgba(139,105,20,0.12) ${(earnedCount / totalCount) * 360}deg)` }} />
          <View className="compass-inner">
            <Text className="compass-n">N</Text>
            <Text className="compass-count">{earnedCount}</Text>
            <Text className="compass-total">/{totalCount}</Text>
          </View>
        </View>
        <View className="compass-label">
          <Text className="compass-title">探险进度</Text>
          <Text className="compass-sub">超越 {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}% 探险家</Text>
        </View>
        <View className="map-wall-entry" onClick={handleBadgeWall}>
          <Text className="wall-flag">🏴</Text>
          <Text className="wall-label">徽章墙</Text>
        </View>
      </View>

      {/* 最近获得 Banner */}
      {featuredBadge && (
        <View className="map-latest-find">
          <View className="latest-flag">
            <Text>🚩 最新发现</Text>
          </View>
          <View className="latest-badge">
            <Image className="latest-img" src={featuredBadge.icon_url} mode="aspectFit" />
          </View>
          <View className="latest-info">
            <Text className="latest-name">{featuredBadge.name}</Text>
            <Text className="latest-date">{featuredBadge.earned_at}</Text>
          </View>
        </View>
      )}

      {/* 地图区域选择 */}
      <View className="map-region-tabs">
        {REGIONS.map(region => (
          <View
            key={region.key}
            className={`region-tab ${activeRegion === region.key ? 'is-active' : ''} theme-${region.theme}`}
            onClick={() => setActiveRegion(region.key)}
          >
            <View className="region-dot" />
            <Text>{region.label}</Text>
          </View>
        ))}
      </View>

      {/* 分隔虚线路径 */}
      <View className="map-path-line" />

      {/* 徽章地标区域 */}
      {activeRegion === 'easter' && !fogCleared ? (
        <View className="map-fog-zone">
          <View className="fog-layer fog-1" />
          <View className="fog-layer fog-2" />
          <View className="fog-layer fog-3" />
          <View className="fog-question">
            <Text>?</Text>
          </View>
          <View className="fog-clear-btn" onClick={() => setFogCleared(true)}>
            <Text>拨开迷雾</Text>
          </View>
        </View>
      ) : (
        <View className="map-landmarks">
          {regionBadges.map((badge, idx) => (
            <View
              key={badge.id}
              className={`landmark ${badge.is_earned ? 'is-discovered' : 'is-hidden'} ${focusBadge?.id === badge.id ? 'is-focus' : ''}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
              onClick={() => handleBadgeTap(badge)}
            >
              <View className="landmark-pin">
                {badge.is_earned && <View className="pin-glow" />}
                <View className="landmark-img-wrap">
                  <Image className="landmark-img" src={badge.icon_url} mode="aspectFit" />
                  {!badge.is_earned && <View className="fog-mask" />}
                </View>
                {badge.is_earned && <View className="pin-flag">🏁</View>}
              </View>
              <Text className="landmark-name">{badge.name}</Text>
              {focusBadge?.id === badge.id && (
                <View className="landmark-tooltip">
                  <Text className="tooltip-text">
                    {badge.is_earned
                      ? `已于 ${badge.earned_at || '未知日期'} 解锁`
                      : badge.description || '继续探索以解锁'}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 底部卷轴装饰 */}
      <View className="map-scroll-edge map-scroll-bottom" />
    </View>
  )
}

export default BadgesTab
