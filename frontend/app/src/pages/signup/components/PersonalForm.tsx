/**
 * 个人信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { PersonalFormData } from '../types'
import './FormStyles.scss'

// 图标
import iconPhone from '../../../assets/icons/phone.png'

interface PersonalFormProps {
  data: PersonalFormData
  onChange: (data: PersonalFormData) => void
  theme?: string
}

const PersonalForm: React.FC<PersonalFormProps> = ({ data, onChange, theme = 'light' }) => {
  const handleChange = (field: keyof PersonalFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleGetPhoneNumber = () => {
    // 微信小程序快速获取手机号
    Taro.showToast({ title: '请手动输入手机号', icon: 'none' })
  }

  return (
    <View className={`form-container theme-${theme}`}>
      {/* 姓名 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">姓名</Text>
          <Text className="required">*</Text>
        </View>
        <Input
          className="form-input"
          placeholder="请输入您的姓名"
          placeholderClass="placeholder"
          value={data.name}
          onInput={(e) => handleChange('name', e.detail.value)}
        />
      </View>

      <View className="form-grid">
        {/* 学校 */}
        <View className="form-item half">
          <View className="form-label">
            <Text className="label-text">学校</Text>
            <Text className="required">*</Text>
          </View>
          <Input
            className="form-input"
            placeholder="请输入您的学校"
            placeholderClass="placeholder"
            value={data.school}
            onInput={(e) => handleChange('school', e.detail.value)}
          />
        </View>

        {/* 学院/部门 */}
        <View className="form-item half">
          <View className="form-label">
            <Text className="label-text">学院/部门</Text>
            <Text className="required">*</Text>
          </View>
          <Input
            className="form-input"
            placeholder="请输入您的学院和部门"
            placeholderClass="placeholder"
            value={data.department}
            onInput={(e) => handleChange('department', e.detail.value)}
          />
        </View>
      </View>

      {/* 职位 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">职位</Text>
        </View>
        <Input
          className="form-input"
          placeholder="请输入您的职位"
          placeholderClass="placeholder"
          value={data.position || ''}
          onInput={(e) => handleChange('position', e.detail.value)}
        />
      </View>

      {/* 手机号码 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">手机号码</Text>
          <Text className="required">*</Text>
        </View>
        <View className="input-with-button">
          <Input
            className="form-input flex-1"
            type="number"
            placeholder="请输入您的手机号码"
            placeholderClass="placeholder"
            maxlength={11}
            value={data.phone}
            onInput={(e) => handleChange('phone', e.detail.value)}
          />
          <View className="quick-button" onClick={handleGetPhoneNumber}>
            <Text className="quick-text">快速获取号码</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PersonalForm
