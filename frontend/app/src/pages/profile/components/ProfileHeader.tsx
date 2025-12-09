/**
 * 用户信息头部组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { UserInfo, ProfileTab } from '../types'

interface ProfileHeaderProps {
  user: UserInfo | null
  activeTab: ProfileTab
  tabs: { key: ProfileTab; icon: string; activeIcon: string }[]
  onTabChange: (tab: ProfileTab) => void
  onLogout: () => void
  onEditProfile: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  activeTab,
  tabs,
  onTabChange,
  onLogout,
  onEditProfile,
}) => {
  return (
    <>
      {/* 用户信息头部 */}
      <View className="user-header">
        <View className="user-info">
          <View className="avatar-container">
            <Image
              className="avatar"
              src={user?.avatar_url || 'https://i.pravatar.cc/100'}
              mode="aspectFill"
            />
            <View className="avatar-edit">📷</View>
          </View>
          <View className="user-detail">
            <Text className="user-name">{user?.name || '未登录'}</Text>
            <Text className="user-org">{user?.organization} {user?.title}</Text>
          </View>
          <View className="logout-btn" onClick={onLogout}>
            <Text className="logout-icon">🚪</Text>
            <Text className="logout-text">退出登录</Text>
          </View>
        </View>
        <View className="user-bio" onClick={onEditProfile}>
          <Text className="bio-text">{user?.bio || '点击编辑个人简介'}</Text>
          <Text className="bio-edit">✏️</Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="tab-bar">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <Text className="tab-icon">{activeTab === tab.key ? tab.activeIcon : tab.icon}</Text>
          </View>
        ))}
      </View>
    </>
  )
}

export default ProfileHeader

