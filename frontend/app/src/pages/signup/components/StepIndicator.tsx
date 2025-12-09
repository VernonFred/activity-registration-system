/**
 * 步骤指示器组件
 * 创建时间: 2025年12月9日
 */
import { View, Text } from '@tarojs/components'
import type { StepConfig } from '../types'

interface StepIndicatorProps {
  steps: StepConfig[]
  currentStep: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  if (steps.length <= 1) return null

  return (
    <View className="step-indicator">
      {steps.map((step, idx) => (
        <View
          key={step.key}
          className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
        >
          <View className="step-number">
            {idx < currentStep ? '✓' : idx + 1}
          </View>
          <Text className="step-title">{step.title}</Text>
          {idx < steps.length - 1 && <View className="step-line" />}
        </View>
      ))}
    </View>
  )
}

export default StepIndicator

