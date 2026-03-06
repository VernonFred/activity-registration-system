import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchActivityDetail } from '../../services/activities'
import { createCompanion, submitRegistration, type RegistrationStepPayload } from '../../services/signups'
import { fetchSignupDetail, updateSignupFormData } from '../../services/user'
import { AddCompanionDialog, StepIndicator, SuccessPage } from './components'
import DynamicStepForm from './components/DynamicStepForm'
import { VALIDATION_RULES } from './constants'
import type { ActivityInfo, SignupDraft, SignupSuccessData, StepConfig, FormField } from './types'
import { normalizeSignupFlowFromActivity, type SignupFlowNormalized } from './adapters/flow'
import './index.scss'

import iconClose from '../../assets/icons/x.png'
import iconArrowLeft from '../../assets/icons/arrow-left.png'
import iconArrowRight from '../../assets/icons/arrow-right.png'

function resolveStepIndexByKey(stepList: StepConfig[], key: string) {
  const idx = stepList.findIndex((step) => step.key === key)
  return idx >= 0 ? idx : 0
}

function getFieldValueKey(field: FormField) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

function buildDraftFromSignup(signUp: any, normalized: SignupFlowNormalized): SignupDraft {
  const next: SignupDraft = JSON.parse(JSON.stringify(normalized.defaults || {}))
  const stepMapFromExtra = signUp?.extra?.step_map || {}
  const stepsFromExtra = Array.isArray(signUp?.extra?.steps) ? signUp.extra.steps : []

  stepsFromExtra.forEach((step: any) => {
    if (!step?.step_key) return
    next[step.step_key] = {
      ...(next[step.step_key] || {}),
      ...(step.values || {}),
    }
  })

  normalized.steps.forEach((step) => {
    const legacyValues = signUp?.[step.key] || signUp?.extra?.[step.key] || stepMapFromExtra[step.key]
    if (legacyValues && typeof legacyValues === 'object') {
      next[step.key] = {
        ...(next[step.key] || {}),
        ...legacyValues,
      }
    }
  })

  return next
}

function hasValue(value: any) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return value
  if (value == null) return false
  return String(value).trim().length > 0
}

function cleanStepValues(values: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(values || {}).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'boolean') return value
      return value != null && String(value).trim() !== ''
    }),
  )
}

const SignupPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const activityId = Number(router.params.activityId || router.params.activity_id)
  const routeSignupId = Number(router.params.signupId || router.params.signup_id || 0)
  const routeMode = String(router.params.mode || '').toLowerCase()
  const { theme } = useTheme()
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  const [activity, setActivity] = useState<ActivityInfo | null>(null)
  const [flowData, setFlowData] = useState<SignupFlowNormalized | null>(null)
  const [steps, setSteps] = useState<StepConfig[]>([])
  const [formData, setFormData] = useState<SignupDraft>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCompanionDialog, setShowCompanionDialog] = useState(false)
  const [isAddingCompanion, setIsAddingCompanion] = useState(false)
  const [companionCount, setCompanionCount] = useState(0)
  const [signupId, setSignupId] = useState<number | null>(null)

  const isRouteEditMode = routeSignupId > 0 && ['edit', 'payment', 'transport'].includes(routeMode)
  const isScopedStepMode = routeSignupId > 0 && steps.some((step) => step.key === routeMode)

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  useEffect(() => {
    if (!activityId) {
      Taro.showToast({ title: t('signup.invalidActivityId'), icon: 'none' })
      return
    }
    loadActivity()
  }, [activityId, routeMode, t])

  useEffect(() => {
    if (!routeSignupId || !flowData) return
    let active = true

    const initFromSignup = async () => {
      try {
        const signup: any = await fetchSignupDetail(routeSignupId)
        if (!active) return

        setSignupId(routeSignupId)
        const draft = buildDraftFromSignup(signup, flowData)
        if (routeMode === 'companion') {
          setIsAddingCompanion(true)
          setFormData(draft)
          setCurrentStep(0)
          return
        }

        if (isRouteEditMode) {
          setFormData(draft)
          if (routeMode) {
            setCurrentStep(resolveStepIndexByKey(steps, routeMode))
          }
        }
      } catch (error) {
        console.error('加载报名详情失败:', error)
        Taro.showToast({ title: t('signup.loadSignupFailed'), icon: 'none' })
      }
    }

    initFromSignup()
    return () => {
      active = false
    }
  }, [routeSignupId, routeMode, isRouteEditMode, steps, flowData, t])

  const loadActivity = async () => {
    try {
      const detail = await fetchActivityDetail(activityId) as any
      const normalizedFlow = normalizeSignupFlowFromActivity(detail)
      setFlowData(normalizedFlow)
      setSteps(normalizedFlow.steps)
      if (!isRouteEditMode) {
        setFormData(normalizedFlow.defaults)
      }
      if (routeMode && normalizedFlow.steps.some((step) => step.key === routeMode)) {
        setCurrentStep(resolveStepIndexByKey(normalizedFlow.steps, routeMode))
      }
      setActivity({
        id: detail.id,
        title: detail.title,
        location: detail.location,
        location_name: detail.location_name || detail.location,
        start_time: detail.start_time,
        end_time: detail.end_time,
        group_qr_image_url: detail.group_qr_image_url,
      })
    } catch (error) {
      console.error('加载活动失败:', error)
      Taro.showToast({ title: t('common.loadFailedShort'), icon: 'none' })
    }
  }

  useEffect(() => {
    if (!steps.length) return
    if (currentStep <= steps.length - 1) return
    setCurrentStep(steps.length - 1)
  }, [currentStep, steps])

  const currentStepConfig = steps[currentStep]
  const currentFields = useMemo(() => {
    if (!flowData || !currentStepConfig) return []
    return flowData.fieldsByStep[currentStepConfig.key] || []
  }, [flowData, currentStepConfig])

  const validateStep = () => {
    if (!currentStepConfig) return false
    const values = formData[currentStepConfig.key] || {}
    for (const field of currentFields) {
      const value = values[getFieldValueKey(field)]
      const required = field.required || (field.config?.widget === 'image_upload' && field.config?.upload?.required)
      if (required && !hasValue(value)) {
        Taro.showToast({ title: `${field.label}不能为空`, icon: 'none' })
        return false
      }
      const valueKey = getFieldValueKey(field)
      if (hasValue(value) && valueKey.includes('phone') && !VALIDATION_RULES.phone.test(String(value))) {
        Taro.showToast({ title: t('signup.invalidPhone'), icon: 'none' })
        return false
      }
      if (hasValue(value) && valueKey.includes('email') && !VALIDATION_RULES.email.test(String(value))) {
        Taro.showToast({ title: t('signup.invalidEmail'), icon: 'none' })
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      return
    }
    handleSubmit()
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  const buildRegistrationPayload = () => {
    const stepPayloads: RegistrationStepPayload[] = steps.map((step) => ({
      step_key: step.key,
      step_title: step.title,
      values: cleanStepValues(formData[step.key] || {}),
    }))

    const payload: any = {
      activity_id: activityId,
      steps: stepPayloads,
    }

    ;['personal', 'payment', 'accommodation', 'transport'].forEach((stepKey) => {
      const found = stepPayloads.find((step) => step.step_key === stepKey)
      if (found) payload[stepKey] = found.values
    })

    return payload
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const submitPayload = buildRegistrationPayload()

      if (isAddingCompanion && signupId) {
        const personal = submitPayload.personal || {}
        await createCompanion(signupId, {
          name: personal.name || '同行人员',
          mobile: personal.phone,
          organization: [personal.school, personal.department].filter(Boolean).join(' / '),
          title: personal.position,
          extra: {
            steps: submitPayload.steps,
            step_map: Object.fromEntries(submitPayload.steps.map((step: RegistrationStepPayload) => [step.step_key, step.values])),
          },
        })
        setCompanionCount((prev) => prev + 1)
        Taro.showToast({ title: t('signup.companionAdded'), icon: 'success', duration: 1500 })
        setShowSuccess(true)
      } else if (isRouteEditMode && routeSignupId) {
        await updateSignupFormData(routeSignupId, {
          personal: submitPayload.personal,
          payment: submitPayload.payment,
          accommodation: submitPayload.accommodation,
          transport: submitPayload.transport,
        })
        Taro.showToast({ title: t('signup.saveSuccess'), icon: 'success', duration: 1500 })
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 }).catch(() => {
            Taro.reLaunch({ url: '/pages/profile/index' })
          })
        }, 300)
      } else {
        const result: any = await submitRegistration(submitPayload)
        setSignupId(result?.registration_id || result?.id)
        setShowSuccess(true)
      }
    } catch (error: any) {
      console.error('提交失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('signup.submitFailed')
      Taro.showToast({ title: errorMessage, icon: 'none', duration: 3000 })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormDirty = () => JSON.stringify(formData || {}) !== JSON.stringify(flowData?.defaults || {})

  const handleClose = () => {
    if (isFormDirty()) {
      Taro.showModal({
        title: t('signup.exitConfirm'),
        content: '',
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        confirmColor: '#1E5A3C',
        cancelColor: '#E74C3C',
        success: (res) => {
          if (res.confirm) Taro.navigateBack()
        },
      })
      return
    }
    Taro.navigateBack()
  }

  const handleFinish = () => setShowCompanionDialog(true)

  const handleAddCompanion = () => {
    setShowCompanionDialog(false)
    setIsAddingCompanion(true)
    setFormData(flowData?.defaults || {})
    setCurrentStep(0)
    setShowSuccess(false)
    Taro.showToast({ title: t('signup.fillCompanionInfo'), icon: 'none', duration: 1500 })
  }

  const handleSkipCompanion = () => {
    setShowCompanionDialog(false)
    setIsAddingCompanion(false)
    setCompanionCount(0)
    setSignupId(null)
    Taro.navigateBack()
  }

  if (!activity || steps.length === 0 || !currentStepConfig) {
    return (
      <View className={`signup-page theme-${theme} loading`}>
        <Text className="loading-text">{t('common.loading')}</Text>
      </View>
    )
  }

  if (showSuccess) {
    const successData: SignupSuccessData = {
      activity,
      personal: formData.personal || {},
      companionCount: isAddingCompanion ? companionCount : undefined,
    }
    return (
      <>
        {!showCompanionDialog && <SuccessPage data={successData} onFinish={handleFinish} theme={theme} />}
        <AddCompanionDialog visible={showCompanionDialog} onAddCompanion={handleAddCompanion} onSkip={handleSkipCompanion} theme={theme} />
      </>
    )
  }

  const isLastStep = currentStep === steps.length - 1
  const isTransportStep = currentStepConfig.key === 'transport'

  return (
    <View className={`signup-page theme-${theme}`}>
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
      <View className="modal-card">
        <View className="card-header">
          <View className="card-header-info">
            <Text className="card-title">{t('signup.pageTitle')}</Text>
            <Text className="card-subtitle">{activity.title}</Text>
          </View>
          <View className="card-close" onClick={handleClose}>
            <Image src={iconClose} className="close-icon" mode="aspectFit" />
          </View>
        </View>

        <View className="step-section">
          <StepIndicator steps={steps} currentStep={currentStep} theme={theme} />
          <Text className="step-title">{currentStepConfig.title}</Text>
        </View>

        <ScrollView className="form-scroll" scrollY enhanced showScrollbar={false}>
          <View className="form-content">
            <DynamicStepForm
              fields={currentFields}
              values={formData[currentStepConfig.key] || {}}
              onChange={(nextValues) => setFormData((prev) => ({ ...prev, [currentStepConfig.key]: nextValues }))}
              theme={theme}
              paymentQrImageUrl={currentStepConfig.key === 'payment' ? flowData?.signupConfig.payment.qrImageUrl : undefined}
              paymentInvoiceEnabled={currentStepConfig.key === 'payment' ? flowData?.signupConfig.payment.invoiceEnabled : true}
              transportNote={currentStepConfig.key === 'transport' ? flowData?.signupConfig.transport.note : undefined}
            />
          </View>
        </ScrollView>

        <View className="card-actions">
          {currentStep > 0 && (
            <View className="action-button secondary" onClick={handlePrev}>
              <Image src={iconArrowLeft} className="btn-icon" mode="aspectFit" />
              <Text className="btn-text">{t('common.prev')}</Text>
            </View>
          )}

          {isTransportStep && !isScopedStepMode ? (
            <>
              <View className="action-button outline" onClick={handleSubmit}>
                <Text className="btn-text">{t('common.laterFill')}</Text>
              </View>
              <View className={`action-button primary ${submitting ? 'loading' : ''}`} onClick={handleSubmit}>
                <Text className="btn-text">{t('signup.submitSignup')}</Text>
              </View>
            </>
          ) : (
            <View
              className={`action-button primary ${currentStep === 0 ? 'full' : ''}`}
              onClick={() => {
                if (isScopedStepMode && currentStepConfig.key === routeMode) {
                  handleSubmit()
                  return
                }
                handleNext()
              }}
            >
              <Text className="btn-text">{(isScopedStepMode && currentStepConfig.key === routeMode) ? t('common.save') : (isLastStep ? t('signup.submitSignup') : t('common.next'))}</Text>
              {!(isScopedStepMode && currentStepConfig.key === routeMode) && !isLastStep && <Image src={iconArrowRight} className="btn-icon" mode="aspectFit" />}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default SignupPage
