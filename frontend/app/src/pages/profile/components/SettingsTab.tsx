/**
 * 设置Tab组件 — 对标设计稿
 * 重构时间: 2026年2月27日
 */
import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

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

const getSections = (t: (key: string) => string): SettingSection[] => [
  {
    title: t('settings.sectionProfile'),
    items: [
      { key: 'profile', label: t('settings.personalInfo'), iconType: 'profile' },
      { key: 'payment', label: t('settings.myPayments'), iconType: 'payment' },
      { key: 'invoice', label: t('settings.myInvoiceHeaders'), iconType: 'invoice' },
    ],
  },
  {
    title: t('settings.sectionInterface'),
    items: [
      { key: 'language', label: t('settings.language'), iconType: 'language' },
      { key: 'darkmode', label: t('settings.darkMode'), iconType: 'darkmode' },
    ],
  },
  {
    title: t('settings.sectionAbout'),
    items: [
      { key: 'privacy', label: t('settings.privacy'), iconType: 'privacy' },
      { key: 'help', label: t('settings.support'), iconType: 'help' },
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
  const { t } = useTranslation()
  const sections = getSections(t)

  return (
    <View className="tab-content settings-content animate-fade-in">
      {sections.map(section => (
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
