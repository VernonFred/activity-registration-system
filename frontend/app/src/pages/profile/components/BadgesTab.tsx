/**
 * 徽章Tab组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { Badge, UserInfo } from '../types'

interface BadgesTabProps {
  badges: Badge[]
  user: UserInfo | null
}

const BadgesTab: React.FC<BadgesTabProps> = ({ badges, user }) => {
  return (
    <View className="tab-content badges-content animate-fade-in">
      <View className="badges-header">
        <View className="badges-avatar">
          <Image
            className="avatar"
            src={user?.avatar_url || 'https://i.pravatar.cc/100'}
            mode="aspectFill"
          />
        </View>
        <View className="badges-info">
          <Text className="badges-name">{user?.name}</Text>
          <Text className="badges-org">{user?.organization}{user?.title}</Text>
        </View>
        <View className="badges-stats">
          <View className="stat-item">
            <Text className="stat-label">累积成就</Text>
            <View className="stat-value">
              <Text className="value-num">3</Text>
              <Text className="value-total">/36枚</Text>
            </View>
          </View>
          <View className="stat-item">
            <Text className="stat-label">超越</Text>
            <View className="stat-value">
              <Text className="value-num">37%</Text>
              <Text className="value-total">用户</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="badges-grid">
        {badges.map((badge) => (
          <View key={badge.id} className={`badge-item ${badge.is_earned ? '' : 'locked'}`}>
            <View className="badge-icon">
              <Text className="badge-emoji">🏅</Text>
              <View className="badge-ribbon">
                <Text>{badge.name}</Text>
              </View>
            </View>
            <Text className="badge-name">{badge.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default BadgesTab

