/**
 * 活动议程Tab组件 - 重构版（支持分组结构 + 折叠展开 + 多天会议）
 * 创建时间: 2025年12月9日
 * 更新时间: 2025年12月10日 09:05
 */
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { AgendaItem, AgendaGroup, AgendaDay } from '../types'
import AgendaGroupCard from './AgendaGroupCard'
import AgendaItemCard from './AgendaItemCard'

interface AgendaTabProps {
  agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]
  theme: string
  activityId?: number  // 用于本地存储
}

// 类型守卫：判断是否为分组数组
const isAgendaGroups = (agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]): agenda is AgendaGroup[] => {
  return agenda.length > 0 && 'items' in agenda[0] && !('groups' in agenda[0])
}

// 类型守卫：判断是否为多天数组
const isAgendaDays = (agenda: AgendaItem[] | AgendaGroup[] | AgendaDay[]): agenda is AgendaDay[] => {
  return agenda.length > 0 && 'groups' in agenda[0]
}

const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, theme, activityId }) => {
  // 展开的分组 ID 集合
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  // 当前选中的日期索引（用于多天会议）
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  
  // 初始化：从本地存储恢复或默认展开第一个
  useEffect(() => {
    // 获取当前实际的分组数组
    let actualGroups: AgendaGroup[] = []
    
    if (isAgendaDays(agenda)) {
      // 多天会议：取当前日期的分组
      actualGroups = agenda[currentDayIndex]?.groups || []
    } else if (isAgendaGroups(agenda)) {
      // 单天分组
      actualGroups = agenda
    }
    
    if (actualGroups.length === 0) return
    
    try {
      // 尝试从本地存储恢复
      const storageKey = `agenda_expanded_${activityId || 'default'}_${currentDayIndex}`
      const stored = Taro.getStorageSync(storageKey)
      
      if (stored && Array.isArray(stored)) {
        setExpandedGroups(new Set(stored))
      } else {
        // 默认只展开第一个分组
        setExpandedGroups(new Set([actualGroups[0].id]))
      }
    } catch (error) {
      // 本地存储失败，使用默认值
      setExpandedGroups(new Set([actualGroups[0]?.id]))
    }
  }, [agenda, activityId, currentDayIndex])
  
  // 保存到本地存储
  useEffect(() => {
    if (!activityId || expandedGroups.size === 0) return
    
    try {
      const storageKey = `agenda_expanded_${activityId}_${currentDayIndex}`
      Taro.setStorageSync(storageKey, Array.from(expandedGroups))
    } catch (error) {
      console.error('保存折叠状态失败:', error)
    }
  }, [expandedGroups, activityId, currentDayIndex])
  
  // 切换单个分组
  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }
  
  // 全部展开/折叠
  const toggleAll = () => {
    // 获取当前实际的分组数组
    let actualGroups: AgendaGroup[] = []
    
    if (isAgendaDays(agenda)) {
      // 多天会议：取当前日期的分组
      actualGroups = agenda[currentDayIndex]?.groups || []
    } else if (isAgendaGroups(agenda)) {
      // 单天分组
      actualGroups = agenda
    } else {
      return
    }
    
    if (expandedGroups.size === actualGroups.length) {
      // 当前全部展开 → 全部折叠
      setExpandedGroups(new Set())
    } else {
      // 当前部分展开或全部折叠 → 全部展开
      setExpandedGroups(new Set(actualGroups.map(g => g.id)))
    }
  }
  
  // 渲染分组内容的通用函数
  const renderGroupedContent = (groups: AgendaGroup[]) => {
    const isAllExpanded = expandedGroups.size === groups.length
    
    return (
      <>
        {/* 全部展开/折叠按钮 */}
        {groups.length > 1 && (
          <View className="agenda-toolbar">
            <View className="toolbar-btn" onClick={toggleAll}>
              <Text className="toolbar-text">
                {isAllExpanded ? '全部折叠' : '全部展开'}
              </Text>
              <Text className="toolbar-icon">{isAllExpanded ? '▲' : '▼'}</Text>
            </View>
          </View>
        )}
        
        {/* 分组列表 */}
        {groups.map((group, index) => (
          <AgendaGroupCard
            key={group.id}
            group={group}
            theme={theme}
            isFirst={index === 0}
            isExpanded={expandedGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </>
    )
  }
  
  // 如果是多天会议结构
  if (isAgendaDays(agenda)) {
    return (
      <View className={`tab-content agenda agenda-multi-day theme-${theme}`}>
        {/* 日期Tab */}
        <View className="day-tabs">
          {agenda.map((day, index) => (
            <View
              key={day.id}
              className={`day-tab ${currentDayIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentDayIndex(index)}
            >
              <Text className="day-tab-text">{day.display_date}</Text>
            </View>
          ))}
        </View>
        
        {/* 当前日期的议程 */}
        <View className="day-content">
          {renderGroupedContent(agenda[currentDayIndex]?.groups || [])}
        </View>
      </View>
    )
  }
  
  // 如果是单天分组结构，渲染分组卡片
  if (isAgendaGroups(agenda)) {
    return (
      <View className={`tab-content agenda agenda-grouped theme-${theme}`}>
        {renderGroupedContent(agenda)}
      </View>
    )
  }

  // 如果是扁平结构，渲染普通列表（兼容旧数据）
  return (
    <View className={`tab-content agenda agenda-flat theme-${theme}`}>
      {agenda.map((item, index) => (
        <AgendaItemCard
          key={item.id}
          item={item}
          theme={theme}
          isFirst={index === 0}
          isLast={index === agenda.length - 1}
        />
      ))}
    </View>
  )
}

export default AgendaTab
