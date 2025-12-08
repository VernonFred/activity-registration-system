import { useEffect, useState, useMemo } from 'react'
import { View, Text, Button, Input, Picker, Textarea, Switch, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchActivityDetail } from '../../services/activities'
import { createSignup } from '../../services/signups'
import './index.scss'

interface FormFieldOption {
  id: number
  label: string
  value: string
  is_default?: boolean
}

interface FormField {
  id: number
  label: string
  field_type: string
  required: boolean
  options?: FormFieldOption[]
  name: string
  placeholder?: string
  display_order?: number
}

// 步骤定义
const STEPS = [
  { key: 'personal', title: '个人信息', keywords: ['姓名', '学校', '学院', '部门', '职位', '手机', '电话', '邮箱'] },
  { key: 'payment', title: '缴费信息', keywords: ['缴费', '发票', '抬头', '税号'] },
  { key: 'accommodation', title: '住宿信息', keywords: ['住宿', '酒店', '房型', '入住'] },
  { key: 'transport', title: '交通信息', keywords: ['接站', '送站', '车次', '航班', '到达', '返程', '交通'] },
]

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

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

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

  const handleNext = () => {
    if (!validateCurrentStep()) return
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

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

  const handleAddCompanion = () => {
    if (signupId) {
      Taro.navigateTo({ url: `/pages/companion/index?signupId=${signupId}` })
    }
  }

  const handleFinish = () => {
    Taro.navigateBack()
  }

  // 渲染字段
  const renderField = (field: FormField) => {
    const value = values[field.name]

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            className="textarea-input"
            value={value || ''}
            placeholder={field.placeholder || `请输入${field.label}`}
            onInput={e => handleChange(field.name, e.detail.value)}
            maxlength={500}
          />
        )

      case 'number':
        return (
          <Input
            className="input"
            type="number"
            value={value || ''}
            placeholder={field.placeholder || `请输入${field.label}`}
            onInput={e => handleChange(field.name, e.detail.value)}
          />
        )

      case 'select':
      case 'radio':
        return (
          <Picker
            mode="selector"
            range={field.options?.map(opt => opt.label) || []}
            value={field.options?.findIndex(opt => opt.value === value) ?? -1}
            onChange={e => {
              const selectedValue = field.options?.[Number(e.detail.value)]?.value || ''
              handleChange(field.name, selectedValue)
            }}
          >
            <View className="picker-value">
              {field.options?.find(opt => opt.value === value)?.label || '请选择'}
              <Text className="picker-arrow">▼</Text>
            </View>
          </Picker>
        )

      case 'multi_select':
      case 'checkbox':
        return (
          <View className="checkbox-group">
            {field.options?.map(opt => (
              <View
                key={opt.id}
                className={`checkbox-item ${(value || []).includes(opt.value) ? 'checked' : ''}`}
                onClick={() => {
                  const current = value || []
                  const newVal = current.includes(opt.value)
                    ? current.filter((v: string) => v !== opt.value)
                    : [...current, opt.value]
                  handleChange(field.name, newVal)
                }}
              >
                <View className="checkbox-box">
                  {(value || []).includes(opt.value) && <Text className="checkbox-check">✓</Text>}
                </View>
                <Text className="checkbox-label">{opt.label}</Text>
              </View>
            ))}
          </View>
        )

      case 'date':
        return (
          <Picker
            mode="date"
            value={value || ''}
            onChange={e => handleChange(field.name, e.detail.value)}
          >
            <View className="picker-value">
              {value || '请选择日期'}
              <Text className="picker-arrow">▼</Text>
            </View>
          </Picker>
        )

      case 'time':
        return (
          <Picker
            mode="time"
            value={value || ''}
            onChange={e => handleChange(field.name, e.detail.value)}
          >
            <View className="picker-value">
              {value || '请选择时间'}
              <Text className="picker-arrow">▼</Text>
            </View>
          </Picker>
        )

      case 'datetime':
        return (
          <View className="datetime-picker">
            <Picker
              mode="date"
              value={value?.split(' ')[0] || ''}
              onChange={e => {
                const time = value?.split(' ')[1] || '09:00'
                handleChange(field.name, `${e.detail.value} ${time}`)
              }}
            >
              <View className="picker-value half">
                {value?.split(' ')[0] || '选择日期'}
              </View>
            </Picker>
            <Picker
              mode="time"
              value={value?.split(' ')[1] || '09:00'}
              onChange={e => {
                const date = value?.split(' ')[0] || ''
                handleChange(field.name, `${date} ${e.detail.value}`)
              }}
            >
              <View className="picker-value half">
                {value?.split(' ')[1] || '选择时间'}
              </View>
            </Picker>
          </View>
        )

      case 'switch':
        return (
          <View className="switch-wrapper">
            <Switch
              checked={!!value}
              onChange={e => handleChange(field.name, e.detail.value)}
              color="#0052d9"
            />
            <Text className="switch-label">{value ? '是' : '否'}</Text>
          </View>
        )

      default: // text
        return (
          <Input
            className="input"
            value={value || ''}
            placeholder={field.placeholder || `请输入${field.label}`}
            onInput={e => handleChange(field.name, e.detail.value)}
          />
        )
    }
  }

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
        <View className="success-modal">
          <View className="success-icon">✓</View>
          <Text className="success-title">报名成功</Text>
          <Text className="success-subtitle">您已成功提交报名申请</Text>
          <View className="success-actions">
            <Button className="btn-secondary" onClick={handleAddCompanion}>
              添加同行人员
            </Button>
            <Button className="btn-primary" onClick={handleFinish}>
              完成
            </Button>
          </View>
        </View>
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
      {activeSteps.length > 1 && (
        <View className="step-indicator">
          {activeSteps.map((step, idx) => (
            <View
              key={step.key}
              className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            >
              <View className="step-number">
                {idx < currentStep ? '✓' : idx + 1}
              </View>
              <Text className="step-title">{step.title}</Text>
              {idx < activeSteps.length - 1 && <View className="step-line" />}
            </View>
          ))}
        </View>
      )}

      {/* 表单区域 */}
      <ScrollView className="form-section" scrollY>
        <View className="section-title">{activeSteps[currentStep]?.title}</View>
        {currentFields.map(field => (
          <View key={field.id} className="form-item">
            <Text className="label">
              {field.label}
              {field.required && <Text className="required">*</Text>}
            </Text>
            {renderField(field)}
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
