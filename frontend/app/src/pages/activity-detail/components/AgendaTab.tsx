/**
 * 活动议程Tab组件 - 重构版（支持分组结构 + 折叠展开）
 * 创建时间: 2025年12月9日
 * 更新时间: 2025年12月09日 19:45
 */
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { AgendaItem, AgendaGroup } from '../types'
import AgendaGroupCard from './AgendaGroupCard'
import AgendaItemCard from './AgendaItemCard'

interface AgendaTabProps {
  agenda: AgendaItem[] | AgendaGroup[]
  theme: string
  activityId?: number  // 用于本地存储
}

// 类型守卫：判断是否为分组数组
const isAgendaGroups = (agenda: AgendaItem[] | AgendaGroup[]): agenda is AgendaGroup[] => {
  return agenda.length > 0 && 'items' in agenda[0]
}

const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, theme, activityId }) => {
  // 展开的分组 ID 集合
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  
  // 初始化：从本地存储恢复或默认展开第一个
  useEffect(() => {
    if (!isAgendaGroups(agenda) || agenda.length === 0) return
    
    try {
      // 尝试从本地存储恢复
      const storageKey = `agenda_expanded_${activityId || 'default'}`
      const stored = Taro.getStorageSync(storageKey)
      
      if (stored && Array.isArray(stored)) {
        setExpandedGroups(new Set(stored))
      } else {
        // 默认只展开第一个分组
        setExpandedGroups(new Set([agenda[0].id]))
      }
    } catch (error) {
      // 本地存储失败，使用默认值
      setExpandedGroups(new Set([agenda[0].id]))
    }
  }, [agenda, activityId])
  
  // 保存到本地存储
  useEffect(() => {
    if (!activityId || expandedGroups.size === 0) return
    
    try {
      const storageKey = `agenda_expanded_${activityId}`
      Taro.setStorageSync(storageKey, Array.from(expandedGroups))
    } catch (error) {
      console.error('保存折叠状态失败:', error)
    }
  }, [expandedGroups, activityId])
  
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
    if (!isAgendaGroups(agenda)) return
    
    if (expandedGroups.size === agenda.length) {
      // 当前全部展开 → 全部折叠
      setExpandedGroups(new Set())
    } else {
      // 当前部分展开或全部折叠 → 全部展开
      setExpandedGroups(new Set(agenda.map(g => g.id)))
    }
  }
  
  // 如果是分组结构，渲染分组卡片
  if (isAgendaGroups(agenda)) {
    const isAllExpanded = expandedGroups.size === agenda.length
    
    return (
      <View className={`tab-content agenda agenda-grouped theme-${theme}`}>
        {/* 全部展开/折叠按钮 */}
        {agenda.length > 1 && (
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
        {agenda.map((group, index) => (
          <AgendaGroupCard
            key={group.id}
            group={group}
            theme={theme}
            isFirst={index === 0}
            isExpanded={expandedGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
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
