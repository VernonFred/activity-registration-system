/**
 * 日期切换 Tab 组件 - Lovable 风格
 */
import { View, Text, ScrollView } from '@tarojs/components'
import type { AgendaDay } from '../../activity-detail/types'

interface DateTabsProps {
  days: AgendaDay[]
  activeDay: string
  onDayChange: (dayId: string) => void
  theme: string
}

// 格式化日期为简洁形式：11月12日 周五
const formatShortDate = (dateStr: string, displayDate?: string): string => {
  // 尝试从 display_date 提取简洁格式
  if (displayDate) {
    // 从 "2025年11月12日（第一天）" 提取 "11月12日"
    const match = displayDate.match(/(\d+)月(\d+)日/)
    if (match) {
      const month = match[1]
      const day = match[2]
      // 计算星期
      const dateMatch = displayDate.match(/(\d{4})年(\d+)月(\d+)日/)
      if (dateMatch) {
        const date = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]))
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const weekDay = weekDays[date.getDay()]
        return `${month}月${day}日 ${weekDay}`
      }
      return `${month}月${day}日`
    }
  }
  
  // 从日期字符串解析
  if (dateStr) {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[date.getDay()]
      return `${month}月${day}日 ${weekDay}`
    }
  }
  
  return dateStr || ''
}

export function DateTabs({ days, activeDay, onDayChange, theme }: DateTabsProps) {
  return (
    <ScrollView 
      className="date-tabs-scroll" 
      scrollX 
      showScrollbar={false}
      enhanced
    >
      <View className="date-tabs-container">
        {days.map((day, index) => {
          const isActive = activeDay === day.id.toString()
          const dayNum = index + 1
          const shortDate = formatShortDate(day.date, day.display_date)
          
          return (
            <View
              key={day.id}
              className={`date-tab ${isActive ? 'active' : ''}`}
              onClick={() => onDayChange(day.id.toString())}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Text className="day-label">Day {dayNum}</Text>
              <Text className="day-text">{shortDate}</Text>
              {isActive && <View className="active-dot" />}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default DateTabs

