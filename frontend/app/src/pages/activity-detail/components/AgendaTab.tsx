/**
 * 活动议程Tab组件 - 预览卡片形式
 * 更新时间: 2025年12月12日
 * 
 * 功能：
 * - 显示议程预览（前几个议程项）
 * - 显示统计信息
 * - 跳转到独立议程页面
 */
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { AgendaItem, AgendaGroup, AgendaDay } from '../types'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'
import iconArrowRight from '../../../assets/icons/arrow-right.png'

interface AgendaTabProps {
  agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]
  theme: string
  activityId?: number
}

// 类型守卫：判断是否为多天数组
const isAgendaDays = (agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]): agenda is AgendaDay[] => {
  return agenda.length > 0 && 'groups' in agenda[0]
}

// 类型守卫：判断是否为分组数组
const isAgendaGroups = (agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]): agenda is AgendaGroup[] => {
  return agenda.length > 0 && 'items' in agenda[0] && !('groups' in agenda[0])
}

const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, theme, activityId }) => {
  // 获取预览数据
  const getPreviewData = () => {
    let days = 0
    let groups = 0
    let items = 0
    let previewItems: { time: string; group: string; title: string; speaker?: string }[] = []
    let firstDayTitle = ''

    if (isAgendaDays(agenda)) {
      // 多天会议
      days = agenda.length
      firstDayTitle = agenda[0]?.display_date || agenda[0]?.date || ''
      
      agenda.forEach(day => {
        if (day.groups) {
          groups += day.groups.length
          day.groups.forEach(group => {
            if (group.items) {
              items += group.items.length
            }
          })
        }
      })

      // 获取第一天前3个议程项作为预览
      const firstDay = agenda[0]
      if (firstDay?.groups) {
        for (const group of firstDay.groups) {
          if (group.items) {
            for (const item of group.items) {
              if (previewItems.length < 3 && item.type !== 'break') {
                previewItems.push({
                  time: `${item.time_start}-${item.time_end}`,
                  group: group.title,
                  title: item.title,
                  speaker: typeof item.speaker === 'string' 
                    ? item.speaker 
                    : item.speaker?.name
                })
              }
            }
          }
        }
      }
    } else if (isAgendaGroups(agenda)) {
      // 单天分组
      days = 1
      groups = agenda.length
      
      agenda.forEach(group => {
        if (group.items) {
          items += group.items.length
        }
      })

      // 获取前3个议程项
      for (const group of agenda) {
        if (group.items) {
          for (const item of group.items) {
            if (previewItems.length < 3 && item.type !== 'break') {
              previewItems.push({
                time: `${item.time_start}-${item.time_end}`,
                group: group.title,
                title: item.title,
                speaker: typeof item.speaker === 'string' 
                  ? item.speaker 
                  : item.speaker?.name
              })
            }
          }
        }
      }
    } else {
      // 扁平数组
      days = 1
      items = agenda.length
      
      for (const item of agenda) {
        if (previewItems.length < 3) {
          previewItems.push({
            time: `${item.time_start}-${item.time_end}`,
            group: '',
            title: item.title,
            speaker: typeof item.speaker === 'string' 
              ? item.speaker 
              : item.speaker?.name
          })
        }
      }
    }

    return { days, groups, items, previewItems, firstDayTitle }
  }

  const { days, groups, items, previewItems, firstDayTitle } = getPreviewData()

  // 跳转到完整议程页
  const handleViewFullAgenda = () => {
    try {
      // 存储议程数据供独立页面使用
      Taro.setStorageSync('current_agenda_data', JSON.stringify(agenda))
      Taro.navigateTo({ 
        url: `/pages/agenda/index?activity_id=${activityId}` 
      })
    } catch (e) {
      console.error('跳转失败', e)
      Taro.showToast({ title: '跳转失败', icon: 'none' })
    }
  }

  if (!agenda || agenda.length === 0) {
    return (
      <View className={`tab-content agenda-preview theme-${theme}`}>
        <View className="preview-empty">
          <Text className="empty-text">暂无议程信息</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`tab-content agenda-preview theme-${theme}`}>
      {/* 预览卡片 */}
      <View className="preview-card">
        {/* 日期标题 */}
        {firstDayTitle && (
          <View className="preview-header">
            <Image src={iconCalendar} className="header-icon" mode="aspectFit" />
            <Text className="header-date">{firstDayTitle}</Text>
          </View>
        )}

        {/* 议程项预览列表 */}
        <View className="preview-items">
          {previewItems.map((item, index) => (
            <View key={index} className="preview-item">
              <View className="item-time">
                <Text className="time-text">{item.time}</Text>
              </View>
              <View className="item-content">
                {item.group && <Text className="item-group">{item.group}</Text>}
                <Text className="item-title">{item.title}</Text>
                {item.speaker && (
                  <Text className="item-speaker">{item.speaker}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 统计信息 */}
        <View className="preview-stats">
          <Text className="stats-text">
            共 {days} 天议程
            {groups > 0 && `，${groups} 个分组`}
            ，{items} 个议程项
          </Text>
        </View>

        {/* 查看完整议程按钮 */}
        <View className="view-full-btn" onClick={handleViewFullAgenda}>
          <Text className="btn-text">查看完整议程</Text>
          <Image src={iconArrowRight} className="btn-icon" mode="aspectFit" />
        </View>
      </View>
    </View>
  )
}

export default AgendaTab
