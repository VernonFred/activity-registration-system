/**
 * 状态标签切换组件
 * 创建时间: 2025年12月09日 12:00
 *
 * 未开始 | 进行中 | 已结束
 */

import { View, Text } from '@tarojs/components'
import { useTheme } from '../../../context/ThemeContext'
import type { ActivityStatus } from '../types'

interface StatusTabsProps {
  activeStatus: ActivityStatus
  onStatusChange: (status: ActivityStatus) => void
}

const STATUS_OPTIONS: { label: string; value: ActivityStatus }[] = [
  { label: '未开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' },
]

const StatusTabs = ({ activeStatus, onStatusChange }: StatusTabsProps) => {
  const { theme } = useTheme()

  return (
    <View className={`status-tabs theme-${theme}`}>
      {STATUS_OPTIONS.map((option) => (
        <View
          key={option.value}
          className={`status-tab ${activeStatus === option.value ? 'active' : ''}`}
          onClick={() => onStatusChange(option.value)}
        >
          <Text className="tab-text">{option.label}</Text>
        </View>
      ))}
    </View>
  )
}

export default StatusTabs

