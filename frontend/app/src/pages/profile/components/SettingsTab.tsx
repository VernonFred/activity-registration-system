/**
 * 设置Tab组件
 * 创建时间: 2025年12月9日
 */
import { View, Text } from '@tarojs/components'

interface SettingsTabProps {
  onSettingClick: (setting: string) => void
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onSettingClick }) => {
  return (
    <View className="tab-content settings-content animate-fade-in">
      {/* 个人资料 */}
      <View className="settings-section">
        <Text className="section-title">个人资料</Text>
        <View className="settings-list">
          <View className="setting-item" onClick={() => onSettingClick('profile')}>
            <Text className="setting-icon">👤</Text>
            <Text className="setting-label">个人简介</Text>
            <Text className="setting-arrow">›</Text>
          </View>
          <View className="setting-item" onClick={() => onSettingClick('payment')}>
            <Text className="setting-icon">💰</Text>
            <Text className="setting-label">我的缴费</Text>
            <Text className="setting-arrow">›</Text>
          </View>
          <View className="setting-item" onClick={() => onSettingClick('invoice')}>
            <Text className="setting-icon">🧾</Text>
            <Text className="setting-label">我的发票抬头</Text>
            <Text className="setting-arrow">›</Text>
          </View>
        </View>
      </View>

      {/* 界面与显示 */}
      <View className="settings-section">
        <Text className="section-title">界面与显示</Text>
        <View className="settings-list">
          <View className="setting-item" onClick={() => onSettingClick('language')}>
            <Text className="setting-icon">🌐</Text>
            <Text className="setting-label">多语言</Text>
            <Text className="setting-arrow">›</Text>
          </View>
          <View className="setting-item" onClick={() => onSettingClick('darkmode')}>
            <Text className="setting-icon">🌙</Text>
            <Text className="setting-label">暗黑模式</Text>
            <Text className="setting-arrow">›</Text>
          </View>
        </View>
      </View>

      {/* 关于 */}
      <View className="settings-section">
        <Text className="section-title">关于</Text>
        <View className="settings-list">
          <View className="setting-item" onClick={() => onSettingClick('privacy')}>
            <Text className="setting-icon">🛡️</Text>
            <Text className="setting-label">隐私与政策</Text>
            <Text className="setting-arrow">›</Text>
          </View>
          <View className="setting-item" onClick={() => onSettingClick('help')}>
            <Text className="setting-icon">❓</Text>
            <Text className="setting-label">支持与帮助</Text>
            <Text className="setting-arrow">›</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SettingsTab

