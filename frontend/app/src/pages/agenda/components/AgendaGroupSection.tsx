/**
 * 议程分组组件 - Lovable 风格
 */
import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import type { AgendaGroup } from '../../activity-detail/types'
import { AgendaItemCard } from './AgendaItemCard'

// 图标
import iconClock from '../../../assets/icons/calendar.png'
import iconUser from '../../../assets/icons/user.png'
import iconChevronDown from '../../../assets/icons/arrow-right.png'

interface AgendaGroupSectionProps {
  group: AgendaGroup
  isExpanded: boolean
  onToggle: () => void
  index: number
  theme: string
}

export function AgendaGroupSection({ 
  group, 
  isExpanded, 
  onToggle, 
  index, 
  theme 
}: AgendaGroupSectionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (isExpanded) {
      setShouldAnimate(true)
    }
  }, [isExpanded])

  return (
    <View 
      className="group-section"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* 分组头部 */}
      <View className="group-header" onClick={onToggle}>
        <View className="header-left">
          {/* 时间线指示器 */}
          <View className="timeline-indicator">
            <View className="timeline-dot" />
            {!isExpanded && <View className="timeline-line" />}
          </View>
          
          <View className="header-content">
            <Text className="group-title">{group.title}</Text>
            <View className="group-time-row">
              <Image src={iconClock} className="time-icon" mode="aspectFit" />
              <Text className="group-time">
                {group.time_start} — {group.time_end}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="header-right">
          <View className="sessions-badge">
            <Text className="badge-text">{group.items?.length || 0} 场</Text>
          </View>
          <Image 
            src={iconChevronDown} 
            className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
            mode="aspectFit"
          />
        </View>
      </View>

      {/* 主持人信息 */}
      {group.moderator && (
        <View className={`moderator-bar ${isExpanded ? 'visible' : 'hidden'}`}>
          <View className="moderator-icon-wrapper">
            <Image src={iconUser} className="moderator-icon" mode="aspectFit" />
          </View>
          <View className="moderator-info">
            <Text className="moderator-label">主持人</Text>
            <View className="moderator-divider" />
            <Text className="moderator-name">{group.moderator.name}</Text>
            <Text className="moderator-title">{group.moderator.title}</Text>
          </View>
        </View>
      )}

      {/* 议程项列表 */}
      <View className={`items-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <View className="items-wrapper">
          <View className="items-list">
            {group.items?.map((item, itemIndex) => (
              <AgendaItemCard 
                key={item.id} 
                item={item} 
                index={shouldAnimate ? itemIndex : 0}
                theme={theme}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default AgendaGroupSection

