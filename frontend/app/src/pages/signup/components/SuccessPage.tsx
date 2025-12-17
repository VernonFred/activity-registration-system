/**
 * 报名成功页面组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Image } from '@tarojs/components'
import type { SignupSuccessData } from '../types'
import './SuccessPage.scss'

// 图标
import iconMapPin from '../../../assets/icons/map-pin.png'
import iconCheck from '../../../assets/icons/check.png'

interface SuccessPageProps {
  data: SignupSuccessData
  onFinish: () => void
  onAddCompanion?: () => void
  theme?: string
}

const SuccessPage: React.FC<SuccessPageProps> = ({ data, onFinish, onAddCompanion, theme = 'light' }) => {
  const { activity, personal } = data

  // 格式化日期
  const formatDateRange = () => {
    if (!activity.start_time || !activity.end_time) return ''
    const start = activity.start_time.split('T')[0].replace(/-/g, '.')
    const end = activity.end_time.split('T')[0].replace(/-/g, '.')
    return `${start}-${end}`
  }

  // 处理完成按钮点击
  const handleFinishClick = () => {
    console.log('✅ SuccessPage: 完成按钮被点击')
    onFinish()
  }

  return (
    <View className={`success-page theme-${theme}`}>
      <View className="success-card">
        {/* 成功图标 */}
        <View className="success-icon">
          <View className="icon-circle">
            <Image src={iconCheck} className="check-icon" mode="aspectFit" />
          </View>
        </View>

        {/* 标题 */}
        <Text className="success-title">报名成功！</Text>

        {/* 活动信息 */}
        <Text className="activity-title">{activity.title}</Text>
        
        <View className="activity-info">
          <Image src={iconMapPin} className="info-icon" mode="aspectFit" />
          <Text className="info-text">
            {activity.location_name || activity.location || '待定'}
          </Text>
        </View>
        
        <Text className="activity-date">{formatDateRange()}</Text>

        {/* 分隔线 */}
        <View className="divider" />

        {/* 报名信息 */}
        <View className="signup-info">
          <View className="info-row">
            <Text className="info-label">姓名：</Text>
            <Text className="info-value">{personal.name}</Text>
          </View>
          <View className="info-row">
            <Text className="info-label">学校：</Text>
            <Text className="info-value">{personal.school}</Text>
          </View>
          <View className="info-row">
            <Text className="info-label">手机号码：</Text>
            <Text className="info-value">{personal.phone}</Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View className="divider dashed" />

        {/* 提示文字 */}
        <Text className="tip-title">我们已收到您的报名信息</Text>
        <Text className="tip-desc">您可以随时在个人中心查看和修改报名信息</Text>

        {/* 完成按钮 */}
        <View className="finish-button" onClick={handleFinishClick}>
          <Text className="finish-text">完成</Text>
        </View>
      </View>
    </View>
  )
}

export default SuccessPage

