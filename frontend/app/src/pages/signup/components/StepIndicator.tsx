/**
 * 步骤指示器组件 - 圆形数字 + 连接线
 * 按设计稿重构: 2026年1月6日
 *
 * 设计参考: 小程序端设计/立即报名-*.png
 * 样式: 圆形数字 1-2-3-4，当前步骤高亮，连接线
 */
import { View, Text } from '@tarojs/components'
import type { StepConfig } from '../types'
import './StepIndicator.scss'

interface StepIndicatorProps {
  steps: StepConfig[]
  currentStep: number
  theme?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, theme = 'light' }) => {
  return (
    <View className={`step-indicator theme-${theme}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isLast = index === steps.length - 1

        return (
          <View key={step.key} className="step-item">
            {/* 步骤圆圈 */}
            <View
              className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <Text className="step-number">{step.number}</Text>
            </View>

            {/* 连接线 */}
            {!isLast && (
              <View className={`step-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </View>
        )
      })}
    </View>
  )
}

export default StepIndicator
