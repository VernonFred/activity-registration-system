/**
 * 状态标签切换组件
 * 创建时间: 2025年12月09日 12:00
 * 
 * 已开始 | 已结束 | 延期
 */

import { View, Text } from '@tarojs/components'
import { useTheme } from '../../../context/ThemeContext'
import type { ActivityStatus } from '../types'

interface StatusTabsProps {
  activeStatus: ActivityStatus
  onStatusChange: (status: ActivityStatus) => void
}

const STATUS_OPTIONS: { label: string; value: ActivityStatus }[] = [
  { label: '已开始', value: 'started' },
  { label: '已结束', value: 'ended' },
  { label: '延期', value: 'postponed' },
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

