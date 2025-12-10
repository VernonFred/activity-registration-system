/**
 * 议程项卡片组件（重构版）
 * 创建时间: 2025年12月09日
 * 
 * 功能：展示单个议程项（演讲/茶歇/讨论等）
 * 支持：演讲人头像、多种类型、响应式布局
 */
import { View, Text, Image } from '@tarojs/components'
import type { AgendaItem, Speaker } from '../types'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface AgendaItemCardProps {
  item: AgendaItem
  theme: string
  isFirst?: boolean
  isLast?: boolean
}

const AgendaItemCard: React.FC<AgendaItemCardProps> = ({ 
  item, 
  theme, 
  isFirst = false,
  isLast = false 
}) => {
  // 判断 speaker 是对象还是字符串
  const getSpeakerInfo = (): Speaker | null => {
    if (!item.speaker) return null
    if (typeof item.speaker === 'string') {
      return { name: item.speaker, title: '' }
    }
    return item.speaker
  }

  const speaker = getSpeakerInfo()
  const isBreak = item.type === 'break'

  // 茶歇类型：简化样式
  if (isBreak) {
    return (
      <View className={`agenda-item break theme-${theme}`}>
        <View className="break-content">
          <Text className="break-time">{item.time_start}-{item.time_end}</Text>
          <Text className="break-title">{item.title}</Text>
        </View>
      </View>
    )
  }

  // 演讲/讨论类型：完整样式
  return (
    <View className={`agenda-item speech theme-${theme} ${isLast ? 'last' : ''}`}>
      {/* 时间标签 */}
      <View className="item-time-badge">
        <Image src={iconCalendar} className="time-icon" mode="aspectFit" />
        <Text className="time-text">{item.time_start}-{item.time_end}</Text>
      </View>

      {/* 演讲人信息（带头像） */}
      {speaker && (
        <View className="speaker-section">
          {/* 头像（如果有） */}
          {speaker.avatar && (
            <Image 
              src={speaker.avatar} 
              className="speaker-avatar" 
              mode="aspectFill"
            />
          )}
          <View className="speaker-details">
            <Text className="speaker-name">{speaker.name}</Text>
            {speaker.title && (
              <Text className="speaker-title">{speaker.title}</Text>
            )}
          </View>
        </View>
      )}

      {/* 演讲主题 */}
      <Text className="speech-title">{item.title}</Text>

      {/* 地点信息 */}
      {item.location && (
        <View className="location-info">
          <Image src={iconMapPin} className="location-icon" mode="aspectFit" />
          <Text className="location-text">{item.location}</Text>
        </View>
      )}

      {/* 标签 */}
      {item.tag && (
        <View className="item-tag">
          <Text className="tag-text">{item.tag}</Text>
        </View>
      )}
    </View>
  )
}

export default AgendaItemCard

