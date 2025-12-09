/**
 * 报名页面
 * 重构时间: 2025年12月9日
 * 代码行数: 从408行优化至约180行
 */
import { useEffect, useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchActivityDetail } from '../../services/activities'
import { createSignup } from '../../services/signups'
import { StepIndicator, FormFieldRenderer, SuccessModal } from './components'
import { STEPS } from './constants'
import type { FormField } from './types'
import './index.scss'

const SignupPage = () => {
  const router = useRouter()
  const activityId = Number(router.params.activityId)

  const [activity, setActivity] = useState<any>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [signupId, setSignupId] = useState<number | null>(null)

  // 加载活动数据
  useEffect(() => {
    if (!activityId) return
    const load = async () => {
      try {
        const detail = await fetchActivityDetail(activityId)
        setActivity(detail)
        setFields(detail.form_fields || [])
        
        // 设置默认值
        const defaults: Record<string, any> = {}
        ;(detail.form_fields || []).forEach((f: FormField) => {
          if (f.field_type === 'switch') {
            defaults[f.name] = false
          } else if (f.options?.length) {
            const defaultOpt = f.options.find(o => o.is_default)
            if (defaultOpt) defaults[f.name] = defaultOpt.value
          }
        })
        setValues(defaults)
      } catch (error) {
        Taro.showToast({ title: '加载失败', icon: 'error' })
      }
    }
    load()
  }, [activityId])

  // 将字段按步骤分组
  const groupedFields = useMemo(() => {
    const groups: Record<string, FormField[]> = {}
    const usedFieldIds = new Set<number>()

    STEPS.forEach(step => {
      groups[step.key] = fields.filter(f => {
        if (usedFieldIds.has(f.id)) return false
        const matches = step.keywords.some(kw => f.label.includes(kw))
        if (matches) {
          usedFieldIds.add(f.id)
          return true
        }
        return false
      })
    })

    // 未分类的字段放到第一步
    const unclassified = fields.filter(f => !usedFieldIds.has(f.id))
    groups['personal'] = [...groups['personal'], ...unclassified]

    return groups
  }, [fields])

  // 当前步骤的有效步骤（过滤掉没有字段的步骤）
  const activeSteps = useMemo(() => {
    return STEPS.filter(step => (groupedFields[step.key] || []).length > 0)
  }, [groupedFields])

  const currentStepKey = activeSteps[currentStep]?.key || 'personal'
  const currentFields = groupedFields[currentStepKey] || []

  // 表单值变更
  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  // 验证当前步骤
  const validateCurrentStep = () => {
    for (const field of currentFields) {
      if (field.required) {
        const val = values[field.name]
        if (val === undefined || val === null || val === '') {
          Taro.showToast({ title: `请填写${field.label}`, icon: 'none' })
          return false
        }
      }
    }
    return true
  }

  // 下一步/提交
  const handleNext = () => {
    if (!validateCurrentStep()) return
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // 提交报名
  const handleSubmit = async () => {
    if (!activityId) return
    try {
      setSubmitting(true)
      const answers = fields.map(field => ({
        field_id: field.id,
        value_text: typeof values[field.name] === 'boolean' 
          ? (values[field.name] ? '是' : '否')
          : (values[field.name] || ''),
        value_json: Array.isArray(values[field.name]) ? values[field.name] : null
      }))
      const result = await createSignup({ activity_id: activityId, answers })
      setSignupId(result.id)
      setShowSuccess(true)
    } catch (error) {
      // 错误提示在 http 拦截器内统一处理
    } finally {
      setSubmitting(false)
    }
  }

  // 添加同行人员
  const handleAddCompanion = () => {
    if (signupId) {
      Taro.navigateTo({ url: `/pages/companion/index?signupId=${signupId}` })
    }
  }

  // 完成
  const handleFinish = () => {
    Taro.navigateBack()
  }

  // 加载状态
  if (!activity) {
    return (
      <View className="signup-page loading">
        <Text>正在加载...</Text>
      </View>
    )
  }

  // 成功弹窗
  if (showSuccess) {
    return (
      <View className="signup-page">
        <SuccessModal onAddCompanion={handleAddCompanion} onFinish={handleFinish} />
      </View>
    )
  }

  return (
    <View className="signup-page">
      {/* 活动摘要 */}
      <View className="activity-summary">
        <Text className="title">{activity.title}</Text>
        <Text className="meta">时间：{activity.start_time || '待定'}</Text>
        <Text className="meta">地点：{activity.location || '待定'}</Text>
      </View>

      {/* 步骤指示器 */}
      <StepIndicator steps={activeSteps} currentStep={currentStep} />

      {/* 表单区域 */}
      <ScrollView className="form-section" scrollY>
        <View className="section-title">{activeSteps[currentStep]?.title}</View>
        {currentFields.map(field => (
          <View key={field.id} className="form-item">
            <Text className="label">
              {field.label}
              {field.required && <Text className="required">*</Text>}
            </Text>
            <FormFieldRenderer
              field={field}
              value={values[field.name]}
              onChange={handleChange}
            />
          </View>
        ))}
      </ScrollView>

      {/* 底部按钮 */}
      <View className="bottom-actions">
        {currentStep > 0 && (
          <Button className="btn-secondary" onClick={handlePrev}>
            上一步
          </Button>
        )}
        <Button
          className="btn-primary"
          loading={submitting}
          onClick={handleNext}
        >
          {currentStep < activeSteps.length - 1 ? '下一步' : '提交报名'}
        </Button>
      </View>
    </View>
  )
}

export default SignupPage
