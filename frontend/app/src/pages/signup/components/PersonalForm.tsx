/**
 * 个人信息表单组件
 * 按设计稿实现: 2025年12月15日
 * 更新: 2025年12月16日 - 添加微信一键获取手机号功能
 */
import { View, Text, Input, Image, Button } from '@tarojs/components'
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

  // 微信一键获取手机号
  const handleGetPhoneNumber = (e: any) => {
    console.log('获取手机号结果:', e.detail)

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 获取成功，需要将 code 发送到后端解密
      const { code } = e.detail

      // TODO: 调用后端 API 解密手机号
      // 临时方案：提示用户手动输入
      Taro.showModal({
        title: '提示',
        content: '获取手机号成功！请联系后端开发配置解密接口',
        showCancel: false
      })

      // 示例：如果后端返回了手机号，可以这样设置
      // onChange({ ...data, phone: decryptedPhoneNumber })
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      Taro.showToast({ title: '您取消了授权', icon: 'none' })
    } else {
      Taro.showToast({ title: '获取失败，请手动输入', icon: 'none' })
    }
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
          <Button
            className="quick-button"
            openType="getPhoneNumber"
            onGetPhoneNumber={handleGetPhoneNumber}
          >
            <Text className="quick-text">快速获取号码</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default PersonalForm
