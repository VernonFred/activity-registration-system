/**
 * 活动议程Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { AgendaItem } from '../types'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconMapPin from '../../../assets/icons/map-pin.png'

interface AgendaTabProps {
  agenda: AgendaItem[]
  theme: string
}

const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, theme }) => {
  return (
    <View className={`tab-content agenda theme-${theme}`}>
      <View className="agenda-timeline">
        {agenda.map((item, index) => (
          <View key={item.id} className="agenda-item" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* 时间线 */}
            <View className="timeline-col">
              <View className={`timeline-dot ${index === 0 ? 'active' : ''}`} />
              {index < agenda.length - 1 && <View className="timeline-line" />}
            </View>
            
            {/* 议程卡片 */}
            <View className="agenda-card">
              <View className="agenda-time">
                <Image src={iconCalendar} className="time-icon" mode="aspectFit" />
                <Text className="time-text">{item.time_start} - {item.time_end}</Text>
              </View>
              <Text className="agenda-title">{item.title}</Text>
              {item.speaker && (
                <View className="agenda-info">
                  <Text className="info-label">主讲人：</Text>
                  <Text className="info-text">{item.speaker}</Text>
                </View>
              )}
              {item.location && (
                <View className="agenda-info">
                  <Image src={iconMapPin} className="info-icon" mode="aspectFit" />
                  <Text className="info-text">{item.location}</Text>
                </View>
              )}
              {item.tag && (
                <View className="agenda-tag">
                  <Text className="tag-text">{item.tag}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default AgendaTab
