/**
 * 个人信息表单组件
 * 按设计稿实现: 2025年12月15日
 * 更新: 2025年12月16日 - 添加微信一键获取手机号功能
 */
import { View, Text, Input, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { decryptWechatPhone } from '../../../services/wechat'
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
  const handleGetPhoneNumber = async (e: any) => {
    console.log('🔥🔥🔥 PersonalForm: 快速获取号码按钮被点击')
    console.log('🔥 获取手机号结果:', JSON.stringify(e.detail))

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      console.log('✅ 微信授权成功，开始解密手机号')
      // 获取成功，需要将 code 发送到后端解密
      const { code } = e.detail
      console.log('✅ 获取到 code:', code)

      try {
        console.log('📡 开始调用后端 API 解密手机号...')
        Taro.showLoading({ title: '获取中...', mask: true })

        // 调用后端 API 解密手机号
        const result = await decryptWechatPhone(code)
        console.log('📡 后端返回结果:', JSON.stringify(result))

        Taro.hideLoading()

        if (result.success && result.phone_number) {
          console.log('✅ 解密成功，手机号:', result.phone_number)
          // 设置手机号到表单
          onChange({ ...data, phone: result.phone_number })
          Taro.showToast({
            title: '获取成功',
            icon: 'success',
            duration: 1500
          })
        } else {
          console.error('❌ 解密失败:', result.error_message)
          throw new Error(result.error_message || '解密失败')
        }
      } catch (error: any) {
        console.error('❌ 解密手机号失败:', error)
        Taro.hideLoading()
        Taro.showToast({
          title: error?.message || '获取失败，请手动输入',
          icon: 'none',
          duration: 2000
        })
      }
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      console.log('⚠️ 用户取消了授权')
      Taro.showToast({ title: '您取消了授权', icon: 'none' })
    } else {
      console.log('❌ 获取手机号失败, errMsg:', e.detail.errMsg)
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
