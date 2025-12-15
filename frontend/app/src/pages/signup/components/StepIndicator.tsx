/**
 * 步骤指示器组件 - 圆形数字 + 连接线
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Image } from '@tarojs/components'
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
            <View className={`step-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <View className="tab-icon">
                {step.icon && <Image src={step.icon} className="tab-icon-img" mode="aspectFit" />}
              </View>
              <Text className="tab-label">{step.title}</Text>
            </View>
            
            {!isLast && (
              <View className={`step-connector ${isCompleted ? 'completed' : ''}`}></View>
            )}
          </View>
        )
      })}
    </View>
  )
}

export default StepIndicator
