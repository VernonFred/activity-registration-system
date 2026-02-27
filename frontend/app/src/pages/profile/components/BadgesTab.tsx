/**
 * 徽章Tab组件 — 纯 CSS 徽章设计
 * 每个徽章由渐变圆盘 + 符号 + 装饰环组成，不使用 PNG 图片
 * 重构时间: 2026年2月27日
 */
import { useState, useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Badge, BadgeCategory, UserInfo } from '../types'

interface BadgesTabProps {
  badges: Badge[]
  user: UserInfo | null
  onBadgeSelect?: (badge: Badge | null) => void
}

interface BadgeVisual {
  symbol: string
  gradient: string
  glow: string
}

const BADGE_VISUALS: Record<string, BadgeVisual> = {
  // 启程成就 — 绿色系
  '初次登场': { symbol: '▸',  gradient: 'linear-gradient(145deg, #34d399, #059669)', glow: 'rgba(52, 211, 153, 0.35)' },   // 播放键 = 首次登场/出发
  '成功入选': { symbol: '✓',  gradient: 'linear-gradient(145deg, #4ade80, #16a34a)', glow: 'rgba(74, 222, 128, 0.35)' },   // 勾选 = 入选通过
  '准时到场': { symbol: '⊙',  gradient: 'linear-gradient(145deg, #2dd4bf, #0d9488)', glow: 'rgba(45, 212, 191, 0.35)' },   // 靶心 = 精准到达
  '全勤达人': { symbol: '◆',  gradient: 'linear-gradient(145deg, #a3e635, #65a30d)', glow: 'rgba(163, 230, 53, 0.35)' },   // 实心菱形 = 全满/完美
  // 互动成就 — 多彩色系
  '开口有料': { symbol: '❝',  gradient: 'linear-gradient(145deg, #60a5fa, #2563eb)', glow: 'rgba(96, 165, 250, 0.35)' },   // 引号 = 发言/评论
  '金句制造机': { symbol: '※', gradient: 'linear-gradient(145deg, #a78bfa, #7c3aed)', glow: 'rgba(167, 139, 250, 0.35)' },  // 注释号 = 精选/重要语句
  '人气发言者': { symbol: '❋', gradient: 'linear-gradient(145deg, #fb923c, #ea580c)', glow: 'rgba(251, 146, 60, 0.35)' },   // 放射花 = 人气/光芒四射
  '任务执行者': { symbol: '⊞', gradient: 'linear-gradient(145deg, #38bdf8, #0284c7)', glow: 'rgba(56, 189, 248, 0.35)' },   // 方框加号 = 任务完成
  '连续打卡':  { symbol: '∞',  gradient: 'linear-gradient(145deg, #22d3ee, #0891b2)', glow: 'rgba(34, 211, 238, 0.35)' },   // 无穷 = 连续不断
  '活力不息':  { symbol: '✧',  gradient: 'linear-gradient(145deg, #facc15, #ca8a04)', glow: 'rgba(250, 204, 21, 0.35)' },   // 四角星 = 活力闪耀
  // 荣誉成就 — 金色系
  '徽章收藏家': { symbol: '❖', gradient: 'linear-gradient(145deg, #fbbf24, #b45309)', glow: 'rgba(251, 191, 36, 0.35)' },   // 菱形花 = 珍藏/收集
  '活动助力官': { symbol: '♡', gradient: 'linear-gradient(145deg, #f97316, #c2410c)', glow: 'rgba(249, 115, 22, 0.35)' },   // 空心爱心 = 助人/热心
  '活动之星':  { symbol: '✦',  gradient: 'linear-gradient(145deg, #fde047, #ca8a04)', glow: 'rgba(253, 224, 71, 0.35)' },   // 实心四角星 = 明星
  // 隐藏彩蛋 — 特殊色系
  '闪电报名王': { symbol: '↯', gradient: 'linear-gradient(145deg, #818cf8, #4338ca)', glow: 'rgba(129, 140, 248, 0.35)' },   // 闪电箭头 = 极速
  '午夜打卡者': { symbol: '☽', gradient: 'linear-gradient(145deg, #6366f1, #312e81)', glow: 'rgba(99, 102, 241, 0.35)' },   // 弦月 = 深夜/午夜
  '周年纪念章': { symbol: '◎', gradient: 'linear-gradient(145deg, #f472b6, #be185d)', glow: 'rgba(244, 114, 182, 0.35)' },   // 同心圆 = 周年里程碑
  '沉默观察员': { symbol: '◉', gradient: 'linear-gradient(145deg, #94a3b8, #334155)', glow: 'rgba(148, 163, 184, 0.35)' },   // 鱼眼 = 静默注视
}

const DEFAULT_VISUAL: BadgeVisual = {
  symbol: '◇', gradient: 'linear-gradient(145deg, #6b7280, #374151)', glow: 'rgba(107, 114, 128, 0.35)'
}

export function getBadgeVisual(name: string): BadgeVisual {
  return BADGE_VISUALS[name] || DEFAULT_VISUAL
}

const CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: 'start', label: '启程成就' },
  { key: 'interact', label: '互动成就' },
  { key: 'honor', label: '荣誉成就' },
  { key: 'easter', label: '隐藏彩蛋' },
]

const BadgesTab: React.FC<BadgesTabProps> = ({ badges, onBadgeSelect }) => {
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

  const handleBadgeTap = useCallback((badge: Badge) => {
    if (badge.is_earned && onBadgeSelect) {
      onBadgeSelect(badge)
    }
  }, [onBadgeSelect])

  const renderCssBadge = (badge: Badge, sizeClass: string) => {
    const v = getBadgeVisual(badge.name)
    const locked = !badge.is_earned
    return (
      <View
        className={`css-badge ${sizeClass} ${locked ? 'css-badge--locked' : ''}`}
        style={{ background: v.gradient, boxShadow: locked ? 'none' : `0 4px 20px ${v.glow}` }}
      >
        <View className="css-badge__ring" />
        <View className="css-badge__inner-ring" />
        <Text className="css-badge__symbol">{v.symbol}</Text>
      </View>
    )
  }

  return (
    <View className="tab-content badges-tab animate-fade-in">
      {/* Hero */}
      <View className="bt-hero">
        <View className="bt-wall-btn" onClick={handleBadgeWall}>
          <Text className="bt-wall-icon">◈</Text>
          <Text className="bt-wall-text">徽章墙</Text>
        </View>
        <View className="bt-hero-badge">
          {featuredBadge && <View className="bt-hero-tag"><Text>新获得</Text></View>}
          <View className="bt-hero-shadow" />
          <View className="bt-hero-icon">
            {featuredBadge
              ? renderCssBadge(featuredBadge, 'css-badge--hero')
              : <Text className="bt-hero-placeholder">◇</Text>
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
          <View className="easter-orb">
            <View className="orb-ring orb-ring-outer" />
            <View className="orb-ring orb-ring-inner" />
            <View className="orb-core" />
            <View className="orb-mark"><Text>?</Text></View>
          </View>
          <Text className="easter-hint">隐藏成就等待发现</Text>
          <View className="bt-easter-btn" onClick={() => setEasterRevealed(true)}>
            <Text>期待您的解锁</Text>
          </View>
        </View>
      ) : (
        <View className="bt-grid">
          {categoryBadges.map(badge => (
            <View
              key={badge.id}
              className={`bt-card ${badge.is_earned ? 'is-earned' : 'is-locked'}`}
              onClick={() => handleBadgeTap(badge)}
            >
              <View className="bt-card-img-wrap">
                {renderCssBadge(badge, 'css-badge--sm')}
              </View>
              <Text className="bt-card-name">{badge.name}</Text>
              {badge.description && (
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
