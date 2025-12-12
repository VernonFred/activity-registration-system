/**
 * 议程预览卡片组件
 * 创建时间: 2025年12月12日
 * 
 * 功能：
 * - 显示第一天的前2-3个议程项
 * - 显示议程总数统计
 * - 提供"查看完整议程"按钮
 */
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { AgendaDay, AgendaItem } from '../types'

// 图标
import iconCalendar from '../../../assets/icons/calendar.png'

interface AgendaPreviewCardProps {
  agenda: AgendaDay[]
  theme: string
  activityId: number
}

const AgendaPreviewCard: React.FC<AgendaPreviewCardProps> = ({ 
  agenda, 
  theme,
  activityId 
}) => {
  // 获取第一天的议程
  const firstDay = agenda[0]
  
  // 获取第一天的前2-3个议程项
  const previewItems: AgendaItem[] = []
  if (firstDay?.groups) {
    for (const group of firstDay.groups) {
      if (group.items) {
        for (const item of group.items) {
          if (previewItems.length < 3) {
            previewItems.push({
              ...item,
              groupTitle: group.title // 添加分组标题
            })
          }
        }
      }
    }
  }

  // 统计总议程项数
  let totalItems = 0
  let totalGroups = 0
  agenda.forEach(day => {
    if (day.groups) {
      totalGroups += day.groups.length
      day.groups.forEach(group => {
        if (group.items) {
          totalItems += group.items.length
        }
      })
    }
  })

  const handleViewFullAgenda = () => {
    // TODO: 跳转到独立议程页面
    Taro.navigateTo({ 
      url: `/pages/agenda/index?activity_id=${activityId}` 
    }).catch(() => {
      Taro.showToast({ 
        title: '议程页面开发中...', 
        icon: 'none' 
      })
    })
  }

  if (!firstDay || previewItems.length === 0) {
    return (
      <View className={`agenda-preview-empty theme-${theme}`}>
        <Text className="empty-text">暂无议程信息</Text>
      </View>
    )
  }

  return (
    <View className={`agenda-preview-wrapper theme-${theme}`}>
      {/* 日期标题 */}
      <View className="preview-header">
        <Text className="preview-date">
          {firstDay.display_date || firstDay.date}
        </Text>
      </View>

      {/* 议程项列表 */}
      <View className="preview-items">
        {previewItems.map((item) => (
          <View key={item.id} className="preview-item">
            <View className="item-time">
              <Text className="time-text">
                {item.time_start}-{item.time_end}
              </Text>
            </View>
            <View className="item-content">
              <Text className="item-group">{item.groupTitle}</Text>
              <Text className="item-title">{item.title}</Text>
              {item.speaker && (
                <Text className="item-speaker">
                  {item.speaker.name} {item.speaker.title}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* 统计信息 */}
      <View className="preview-stats">
        <Text className="stats-text">
          共 {agenda.length} 天议程，{totalGroups} 个分组，{totalItems} 个议程项
        </Text>
      </View>

      {/* 查看完整议程按钮 */}
      <View 
        className="view-full-btn" 
        onClick={handleViewFullAgenda}
      >
        <Text className="btn-text">查看完整议程</Text>
        <Text className="btn-arrow">→</Text>
      </View>
    </View>
  )
}

export default AgendaPreviewCard

