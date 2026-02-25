/**
 * 用户信息头部组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image } from '@tarojs/components'
import type { UserInfo, ProfileTab } from '../types'
import iconCalendar from '../../../assets/icons/calendar.png'
import iconBookmark from '../../../assets/icons/bookmark.png'
import iconBell from '../../../assets/icons/bell.png'
import iconSettings from '../../../assets/icons/settings.png'
import iconEdit from '../../../assets/icons/edit.png'
import iconCamera from '../../../assets/icons/user-circle.png'
import iconLogout from '../../../assets/icons/x.png'
import './ProfileHeader.scss'

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
  const tabIconMap: Record<ProfileTab, string> = {
    activities: iconCalendar,
    badges: iconBookmark,
    notifications: iconBell,
    settings: iconSettings,
  }

  const orgTitle = [user?.organization, user?.title].filter(Boolean).join('')

  return (
    <>
      <View className="profile-header-v2">
        <View className="profile-header-v2__row">
          <View className="profile-header-v2__user">
            <View className="profile-header-v2__avatar-wrap">
              <Image
                className="profile-header-v2__avatar"
                src={user?.avatar_url || 'https://i.pravatar.cc/100'}
                mode="aspectFill"
              />
              <View className="profile-header-v2__avatar-badge">
                <Image className="profile-header-v2__avatar-badge-icon" src={iconCamera} mode="aspectFit" />
              </View>
            </View>

            <View className="profile-header-v2__meta">
              <Text className="profile-header-v2__name">{user?.name || '未登录'}</Text>
              <Text className="profile-header-v2__org">{orgTitle || '暂无机构信息'}</Text>
            </View>
          </View>

          <View className="profile-header-v2__logout" onClick={onLogout}>
            <Image
              className="profile-header-v2__logout-icon"
              src={iconLogout}
              mode="aspectFit"
            />
            <Text className="profile-header-v2__logout-text">退出登录</Text>
          </View>
        </View>

        <View className="profile-header-v2__bio" onClick={onEditProfile}>
          <Text className="profile-header-v2__bio-text">{user?.bio || '点击编辑个人简介'}</Text>
          <Image className="profile-header-v2__bio-edit" src={iconEdit} mode="aspectFit" />
        </View>
      </View>

      <View className="profile-tab-pill">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`profile-tab-pill__item ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <Image
              className="profile-tab-pill__icon"
              src={tabIconMap[tab.key]}
              mode="aspectFit"
            />
          </View>
        ))}
      </View>
    </>
  )
}

export default ProfileHeader
