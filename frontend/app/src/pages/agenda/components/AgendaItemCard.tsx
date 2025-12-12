/**
 * 议程项卡片组件
 * 创建时间: 2025年12月12日
 */
import { View, Text, Image } from '@tarojs/components'
import type { AgendaItem, AgendaItemType } from '../../../pages/activity-detail/types'

// 图标
import iconClock from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface AgendaItemCardProps {
  item: AgendaItem
  index: number
  theme: string
}

// 类型配置
const typeConfig: Record<AgendaItemType, { label: string; emoji: string; className: string }> = {
  speech: {
    label: '演讲',
    emoji: '🎤',
    className: 'badge-speech',
  },
  discussion: {
    label: '讨论',
    emoji: '💬',
    className: 'badge-discussion',
  },
  break: {
    label: '休息',
    emoji: '☕',
    className: 'badge-break',
  },
  activity: {
    label: '活动',
    emoji: '✨',
    className: 'badge-activity',
  },
}

export const AgendaItemCard: React.FC<AgendaItemCardProps> = ({ 
  item, 
  index,
  theme 
}) => {
  const config = item.type ? typeConfig[item.type] : typeConfig.speech
  const isBreak = item.type === 'break'

  // 茶歇/休息特殊样式
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

  // 获取演讲人信息
  const speaker = typeof item.speaker === 'object' ? item.speaker : null

  // 正常议程项
  return (
    <View 
      className="agenda-item-card"
      style={{ animationDelay: `${index * 100 + 200}ms` }}
    >
      {/* 头部：时间 + 类型徽章 */}
      <View className="card-header">
        {/* 时间 */}
        <View className="time-badge">
          <Image src={iconClock} className="time-badge-icon" mode="aspectFit" />
          <Text className="time-text">
            {item.time_start} — {item.time_end}
          </Text>
        </View>
        
        {/* 类型徽章 */}
        <View className={`type-badge ${config.className}`}>
          <Text className="type-emoji">{config.emoji}</Text>
          <Text className="type-label">{config.label}</Text>
        </View>
      </View>

      {/* 标题 */}
      <Text className="item-title">{item.title}</Text>

      {/* 演讲人信息 */}
      {speaker && (
        <View className="speaker-card">
          {/* 头像 */}
          {speaker.avatar ? (
            <Image 
              className="speaker-avatar" 
              src={speaker.avatar} 
              mode="aspectFill" 
            />
          ) : (
            <View className="speaker-avatar-placeholder">
              <Text className="avatar-text">
                {speaker.name.slice(0, 2)}
              </Text>
            </View>
          )}
          
          {/* 演讲人信息 */}
          <View className="speaker-info">
            <Text className="speaker-name">{speaker.name}</Text>
            <Text className="speaker-title">{speaker.title}</Text>
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

