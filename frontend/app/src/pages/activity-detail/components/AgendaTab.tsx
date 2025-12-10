/**
 * 活动议程Tab组件 - 重构版（支持分组结构）
 * 创建时间: 2025年12月9日
 * 更新时间: 2025年12月09日 18:30
 */
import { View } from '@tarojs/components'
import type { AgendaItem, AgendaGroup } from '../types'
import AgendaGroupCard from './AgendaGroupCard'
import AgendaItemCard from './AgendaItemCard'

interface AgendaTabProps {
  agenda: AgendaItem[] | AgendaGroup[]
  theme: string
}

// 类型守卫：判断是否为分组数组
const isAgendaGroups = (agenda: AgendaItem[] | AgendaGroup[]): agenda is AgendaGroup[] => {
  return agenda.length > 0 && 'items' in agenda[0]
}

const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, theme }) => {
  // 如果是分组结构，渲染分组卡片
  if (isAgendaGroups(agenda)) {
    return (
      <View className={`tab-content agenda agenda-grouped theme-${theme}`}>
        {agenda.map((group, index) => (
          <AgendaGroupCard
            key={group.id}
            group={group}
            theme={theme}
            isFirst={index === 0}
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
