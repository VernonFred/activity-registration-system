/**
 * 议程分组卡片组件
 * 创建时间: 2025年12月09日
 * 
 * 功能：展示议程分组（如"开幕仪式"、"主旨报告"）
 * 包含：橙色渐变头部 + 主持人信息 + 议程项列表
 */
import { View, Text } from '@tarojs/components'
import type { AgendaGroup } from '../types'
import AgendaItemCard from './AgendaItemCard'

interface AgendaGroupCardProps {
  group: AgendaGroup
  theme: string
  isFirst?: boolean  // 是否为第一个分组
}

const AgendaGroupCard: React.FC<AgendaGroupCardProps> = ({ group, theme, isFirst = false }) => {
  return (
    <View className={`agenda-group theme-${theme} ${isFirst ? 'first' : ''}`}>
      {/* 分组头部（橙色渐变） */}
      <View className="group-header">
        <View className="header-content">
          <Text className="group-title">{group.title}</Text>
          {group.time_start && group.time_end && (
            <Text className="group-time">{group.time_start}-{group.time_end}</Text>
          )}
        </View>
      </View>

      {/* 主持人信息（可选） */}
      {group.moderator && (
        <View className="moderator-bar">
          <Text className="moderator-label">主持人：</Text>
          <View className="moderator-info">
            <Text className="moderator-name">{group.moderator.name}</Text>
            <Text className="moderator-title">{group.moderator.title}</Text>
          </View>
        </View>
      )}

      {/* 议程项列表 */}
      <View className="group-items">
        {group.items.map((item, index) => (
          <AgendaItemCard
            key={item.id}
            item={item}
            theme={theme}
            isFirst={index === 0}
            isLast={index === group.items.length - 1}
          />
        ))}
      </View>
    </View>
  )
}

export default AgendaGroupCard

