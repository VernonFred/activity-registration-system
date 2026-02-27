/**
 * 设置Tab组件 — 对标设计稿
 * 重构时间: 2026年2月27日
 */
import { View, Text } from '@tarojs/components'

interface SettingsTabProps {
  onSettingClick: (setting: string) => void
}

interface SettingItem {
  key: string
  label: string
  iconType: 'profile' | 'payment' | 'invoice' | 'language' | 'darkmode' | 'privacy' | 'help'
}

interface SettingSection {
  title: string
  items: SettingItem[]
}

const SECTIONS: SettingSection[] = [
  {
    title: '个人资料',
    items: [
      { key: 'profile', label: '个人简介', iconType: 'profile' },
      { key: 'payment', label: '我的缴费', iconType: 'payment' },
      { key: 'invoice', label: '我的发票抬头', iconType: 'invoice' },
    ],
  },
  {
    title: '界面与显示',
    items: [
      { key: 'language', label: '多语言', iconType: 'language' },
      { key: 'darkmode', label: '暗黑模式', iconType: 'darkmode' },
    ],
  },
  {
    title: '关于',
    items: [
      { key: 'privacy', label: '隐私与政策', iconType: 'privacy' },
      { key: 'help', label: '支持与帮助', iconType: 'help' },
    ],
  },
]

const renderIcon = (type: string) => {
  switch (type) {
    case 'profile':
      return (
        <View className="st-icon">
          <View className="st-icon-profile">
            <View className="st-icon-profile-head" />
            <View className="st-icon-profile-body" />
          </View>
        </View>
      )
    case 'payment':
      return (
        <View className="st-icon">
          <View className="st-icon-circle">
            <Text className="st-icon-symbol">¥</Text>
          </View>
        </View>
      )
    case 'invoice':
      return (
        <View className="st-icon">
          <View className="st-icon-circle">
            <View className="st-icon-doc">
              <View className="st-icon-doc-line" />
              <View className="st-icon-doc-line st-short" />
            </View>
          </View>
        </View>
      )
    case 'language':
      return (
        <View className="st-icon">
          <View className="st-icon-circle">
            <View className="st-icon-globe-h" />
            <View className="st-icon-globe-v" />
          </View>
        </View>
      )
    case 'darkmode':
      return (
        <View className="st-icon">
          <View className="st-icon-circle">
            <Text className="st-icon-symbol">+</Text>
          </View>
        </View>
      )
    case 'privacy':
      return (
        <View className="st-icon">
          <View className="st-icon-shield" />
        </View>
      )
    case 'help':
      return (
        <View className="st-icon">
          <View className="st-icon-circle">
            <Text className="st-icon-symbol">?</Text>
          </View>
        </View>
      )
    default:
      return <View className="st-icon" />
  }
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onSettingClick }) => {
  return (
    <View className="tab-content settings-content animate-fade-in">
      {SECTIONS.map(section => (
        <View key={section.title} className="st-section">
          <Text className="st-section-title">{section.title}</Text>
          <View className="st-list">
            {section.items.map(item => (
              <View
                key={item.key}
                className="st-item"
                onClick={() => onSettingClick(item.key)}
              >
                {renderIcon(item.iconType)}
                <Text className="st-item-label">{item.label}</Text>
                <View className="st-chevron" />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

export default SettingsTab
