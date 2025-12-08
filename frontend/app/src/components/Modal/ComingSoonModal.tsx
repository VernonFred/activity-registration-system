/**
 * 「敬请期待」弹窗组件
 * 用于即将开始报名的活动
 */
import { View, Text, Image } from '@tarojs/components'
import './ComingSoonModal.scss'

interface ComingSoonModalProps {
  visible: boolean
  activity: {
    id: number
    title: string
    cover_url?: string
    start_time?: string
  } | null
  onClose: () => void
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  visible,
  activity,
  onClose
}) => {
  if (!visible || !activity) return null

  // 阻止背景滚动和点击穿透
  const handleMaskClick = (e: any) => {
    e.stopPropagation()
    onClose()
  }

  const handleContentClick = (e: any) => {
    e.stopPropagation()
  }

  return (
    <View className="coming-soon-modal" onClick={handleMaskClick}>
      {/* 毛玻璃遮罩 */}
      <View className="modal-mask" />
      
      {/* 弹窗容器 - 包含卡片和关闭按钮 */}
      <View className="modal-wrapper" onClick={handleContentClick}>
        {/* 弹窗内容卡片 */}
        <View className="modal-content">
          {/* 活动封面 */}
          <View className="activity-cover">
            {activity.cover_url ? (
              <Image 
                src={activity.cover_url} 
                mode="aspectFill"
                className="cover-image"
              />
            ) : (
              <View className="cover-placeholder">
                <Text className="placeholder-icon">📅</Text>
              </View>
            )}
            {/* 即将开始标签 */}
            <View className="status-badge">
              <Text className="badge-text">即将开始</Text>
            </View>
          </View>

          {/* 活动标题 */}
          <View className="activity-info">
            <Text className="activity-title">{activity.title}</Text>
            {activity.start_time && (
              <Text className="activity-time">
                报名开放时间：{activity.start_time}
              </Text>
            )}
          </View>

          {/* 敬请期待按钮 */}
          <View className="action-btn coming-soon">
            <Text className="btn-text">敬请期待</Text>
          </View>
        </View>

        {/* 关闭按钮 - 放在卡片下方 */}
        <View className="close-btn" onClick={onClose}>
          <Text className="close-icon">×</Text>
        </View>
      </View>
    </View>
  )
}

export default ComingSoonModal
