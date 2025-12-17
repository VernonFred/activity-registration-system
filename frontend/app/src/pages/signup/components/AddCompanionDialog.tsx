/**
 * 添加同行人员弹窗组件
 * 设计稿: 小程序端设计/立即报名-添加同行人员.png
 */
import { View, Text, Image } from '@tarojs/components'
import './AddCompanionDialog.scss'

// 图标
import iconUserPlus from '../../../assets/icons/users.png'

interface AddCompanionDialogProps {
  visible: boolean
  onAddCompanion: () => void
  onSkip: () => void
  theme?: string
}

const AddCompanionDialog: React.FC<AddCompanionDialogProps> = ({
  visible,
  onAddCompanion,
  onSkip,
  theme = 'light'
}) => {
  console.log('✅ AddCompanionDialog 渲染，visible=', visible, 'theme=', theme)

  if (!visible) {
    console.log('⚠️ AddCompanionDialog: visible=false，返回 null')
    return null
  }

  console.log('✅ AddCompanionDialog: 正在渲染弹窗')

  return (
    <View className={`companion-dialog-overlay theme-${theme}`}>
      <View className="companion-dialog">
        {/* 图标 */}
        <View className="dialog-icon">
          <View className="icon-circle">
            <Image src={iconUserPlus} className="user-icon" mode="aspectFit" />
            <View className="plus-sign">+</View>
          </View>
        </View>

        {/* 标题 */}
        <Text className="dialog-title">是否需要添加同行人员</Text>

        {/* 副标题 */}
        <Text className="dialog-desc">
          如果您需要为其他人填写报名信息，可以继续添加同行人员
        </Text>

        {/* 按钮组 */}
        <View className="dialog-actions">
          {/* 添加同行人员按钮 */}
          <View className="action-button primary" onClick={onAddCompanion}>
            <Text className="button-text">添加同行人员</Text>
          </View>

          {/* 暂不添加按钮 */}
          <View className="action-button secondary" onClick={onSkip}>
            <Text className="button-text">暂不添加</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AddCompanionDialog
