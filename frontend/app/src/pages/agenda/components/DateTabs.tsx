/**
 * 日期切换Tab组件
 * 创建时间: 2025年12月12日
 */
import { View, ScrollView, Text } from '@tarojs/components'
import type { AgendaDay } from '../../../pages/activity-detail/types'

interface DateTabsProps {
  days: AgendaDay[]
  activeDay: string
  onDayChange: (dayId: string) => void
  theme: string
}

export const DateTabs: React.FC<DateTabsProps> = ({ 
  days, 
  activeDay, 
  onDayChange,
  theme 
}) => {
  return (
    <ScrollView 
      className="date-tabs-scroll" 
      scrollX 
      scrollWithAnimation
      enhanced 
      showScrollbar={false}
    >
      <View className="date-tabs-container">
        {days.map((day, index) => {
          const isActive = activeDay === day.id.toString()
          const dayNum = index + 1
          
          return (
            <View
              key={day.id}
              className={`date-tab ${isActive ? 'active' : ''}`}
              onClick={() => onDayChange(day.id.toString())}
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <Text className="day-label">Day {dayNum}</Text>
              <Text className="day-text">{day.display_date}</Text>
              
              {/* 激活指示点 */}
              {isActive && <View className="active-dot" />}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

