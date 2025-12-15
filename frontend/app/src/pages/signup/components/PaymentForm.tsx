/**
 * 缴费信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { PaymentFormData } from '../types'
import './FormStyles.scss'

interface PaymentFormProps {
  data: PaymentFormData
  onChange: (data: PaymentFormData) => void
  theme?: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({ data, onChange, theme = 'light' }) => {
  const handleChange = (field: keyof PaymentFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      handleChange('payment_screenshot', res.tempFilePaths[0])
    }).catch(() => {})
  }

  return (
    <View className={`form-container theme-${theme}`}>
      {/* 二维码区域 */}
      <View className="qrcode-section">
        <View className="qrcode-wrapper">
          {/* 这里可以放置实际的收款二维码 */}
          <View className="qrcode-placeholder">
            <Text className="qrcode-text">收款二维码</Text>
          </View>
        </View>
        <Text className="qrcode-tip">请扫码或识别二维码进行缴费</Text>
      </View>

      {/* 发票抬头 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">发票抬头</Text>
          <Text className="required">*</Text>
        </View>
        <Input
          className="form-input"
          placeholder="请输入您的开票单位"
          placeholderClass="placeholder"
          value={data.invoice_title}
          onInput={(e) => handleChange('invoice_title', e.detail.value)}
        />
      </View>

      {/* 电子邮箱 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">电子邮箱</Text>
          <Text className="required">*</Text>
        </View>
        <Input
          className="form-input"
          placeholder="请输入您的接收发票的邮箱地址"
          placeholderClass="placeholder"
          value={data.email}
          onInput={(e) => handleChange('email', e.detail.value)}
        />
      </View>

      {/* 缴费截图 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">缴费截图</Text>
        </View>
        <View className="file-upload" onClick={handleChooseImage}>
          {data.payment_screenshot ? (
            <Image src={data.payment_screenshot} className="upload-preview" mode="aspectFit" />
          ) : (
            <Text className="upload-text">选择文件  未选择任何文件</Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default PaymentForm

