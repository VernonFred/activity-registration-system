/**
 * 成功弹窗组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Button } from '@tarojs/components'

interface SuccessModalProps {
  onAddCompanion: () => void
  onFinish: () => void
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onAddCompanion, onFinish }) => {
  return (
    <View className="success-modal">
      <View className="success-icon">✓</View>
      <Text className="success-title">报名成功</Text>
      <Text className="success-subtitle">您已成功提交报名申请</Text>
      <View className="success-actions">
        <Button className="btn-secondary" onClick={onAddCompanion}>
          添加同行人员
        </Button>
        <Button className="btn-primary" onClick={onFinish}>
          完成
        </Button>
      </View>
    </View>
  )
}

export default SuccessModal

