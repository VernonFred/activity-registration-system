import { ScrollView, View, Text } from '@tarojs/components'
import type { StepConfig } from '../types'
import './StepIndicator.scss'

interface StepIndicatorProps {
  steps: StepConfig[]
  currentStep: number
  theme?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, theme = 'light' }) => {
  return (
    <ScrollView scrollX className={`step-indicator-scroll theme-${theme}`} enhanced showScrollbar={false}>
      <View className={`step-indicator theme-${theme}`}>
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <View key={step.key} className="step-item">
              <View className="step-node">
                <View className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <Text className="step-number">{index + 1}</Text>
                </View>
                <Text className={`step-label ${isActive ? 'active' : ''}`}>{step.title}</Text>
              </View>
              {!isLast && <View className={`step-line ${isCompleted ? 'completed' : ''}`} />}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default StepIndicator
