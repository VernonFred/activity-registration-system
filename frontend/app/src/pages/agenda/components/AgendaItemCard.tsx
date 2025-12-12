/**
 * 议程项卡片组件 - Lovable 风格
 */
import { View, Text, Image } from '@tarojs/components'
import type { AgendaItem } from '../../activity-detail/types'

// 图标
import iconClock from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface AgendaItemCardProps {
  item: AgendaItem
  index: number
  theme: string
}

// 类型配置
const typeConfig: Record<string, { label: string; emoji: string; badgeClass: string }> = {
  speech: { label: '演讲', emoji: '🎤', badgeClass: 'badge-speech' },
  discussion: { label: '讨论', emoji: '💬', badgeClass: 'badge-discussion' },
  break: { label: '休息', emoji: '☕', badgeClass: '' },
  activity: { label: '活动', emoji: '✨', badgeClass: 'badge-activity' },
}

export function AgendaItemCard({ item, index, theme }: AgendaItemCardProps) {
  const config = typeConfig[item.type || 'speech'] || typeConfig.speech
  const isBreak = item.type === 'break'

  // 茶歇卡片
  if (isBreak) {
    return (
      <View 
        className="agenda-break-card"
        style={{ animationDelay: `${index * 100 + 200}ms` }}
      >
        <View className="break-content">
          <View className="break-icon-wrapper">
            <Text className="break-icon">{config.emoji}</Text>
          </View>
          <View className="break-info">
            <Text className="break-title">{item.title}</Text>
            <Text className="break-time">
              {item.time_start} — {item.time_end}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // 普通议程卡片
  return (
    <View 
      className="agenda-item-card"
      style={{ animationDelay: `${index * 100 + 200}ms` }}
    >
      {/* 头部：时间 + 类型标签 */}
      <View className="card-header">
        <View className="time-badge">
          <Image src={iconClock} className="time-badge-icon" mode="aspectFit" />
          <Text className="time-text">
            {item.time_start} — {item.time_end}
          </Text>
        </View>
        <View className={`type-badge ${config.badgeClass}`}>
          <Text className="type-emoji">{config.emoji}</Text>
          <Text className="type-label">{config.label}</Text>
        </View>
      </View>

      {/* 标题 */}
      <Text className="item-title">{item.title}</Text>

      {/* 演讲人 */}
      {item.speaker && (
        <View className="speaker-card">
          {item.speaker.avatar ? (
            <Image 
              src={item.speaker.avatar} 
              className="speaker-avatar" 
              mode="aspectFill"
            />
          ) : (
            <View className="speaker-avatar-placeholder">
              <Text className="avatar-text">
                {typeof item.speaker === 'string' 
                  ? item.speaker.slice(0, 1) 
                  : item.speaker.name?.slice(0, 1) || '?'}
              </Text>
            </View>
          )}
          <View className="speaker-info">
            <Text className="speaker-name">
              {typeof item.speaker === 'string' ? item.speaker : item.speaker.name}
            </Text>
            {typeof item.speaker !== 'string' && item.speaker.title && (
              <Text className="speaker-title">{item.speaker.title}</Text>
            )}
          </View>
        </View>
      )}

      {/* 地点 */}
      {item.location && (
        <View className="location-row">
          <Image src={iconMapPin} className="location-icon" mode="aspectFit" />
          <Text className="location-text">{item.location}</Text>
        </View>
      )}
    </View>
  )
}

export default AgendaItemCard

