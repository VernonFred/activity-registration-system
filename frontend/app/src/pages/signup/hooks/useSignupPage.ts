import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import type { TFunction } from 'i18next'
import { fetchActivityDetail } from '../../../services/activities'
import { createCompanion, submitRegistration } from '../../../services/signups'
import { fetchSignupDetail, updateSignupFormData } from '../../../services/user'
import { VALIDATION_RULES } from '../constants'
import { normalizeSignupFlowFromActivity, type SignupFlowNormalized } from '../adapters/flow'
import type { ActivityInfo, SignupDraft, StepConfig } from '../types'
import {
  buildDraftFromSignup,
  buildRegistrationPayload,
  isSignupFormDirty,
  resolveStepIndexByKey,
  validateCurrentStep,
} from '../utils'

interface UseSignupPageOptions {
  activityId: number
  routeSignupId: number
  routeMode: string
  t: TFunction
}

export function useSignupPage({ activityId, routeSignupId, routeMode, t }: UseSignupPageOptions) {
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
    if (!activityId) {
      Taro.showToast({ title: t('signup.invalidActivityId'), icon: 'none' })
      return
    }
    void loadActivity()
  }, [activityId, routeMode, t])

  useEffect(() => {
    if (!routeSignupId || !flowData) return undefined
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
          if (routeMode) setCurrentStep(resolveStepIndexByKey(steps, routeMode))
        }
      } catch (error) {
        console.error('加载报名详情失败:', error)
        Taro.showToast({ title: t('signup.loadSignupFailed'), icon: 'none' })
      }
    }

    void initFromSignup()
    return () => {
      active = false
    }
  }, [flowData, isRouteEditMode, routeMode, routeSignupId, steps, t])

  useEffect(() => {
    if (!steps.length || currentStep <= steps.length - 1) return
    setCurrentStep(steps.length - 1)
  }, [currentStep, steps])

  const currentStepConfig = steps[currentStep]
  const currentFields = useMemo(() => {
    if (!flowData || !currentStepConfig) return []
    return flowData.fieldsByStep[currentStepConfig.key] || []
  }, [flowData, currentStepConfig])

  async function loadActivity() {
    try {
      const detail = (await fetchActivityDetail(activityId)) as any
      const normalizedFlow = normalizeSignupFlowFromActivity(detail)
      setFlowData(normalizedFlow)
      setSteps(normalizedFlow.steps)
      if (!isRouteEditMode) setFormData(normalizedFlow.defaults)
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

  function validateStep() {
    if (!currentStepConfig) return false
    const error = validateCurrentStep(currentFields, formData[currentStepConfig.key] || {}, t, VALIDATION_RULES)
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      return false
    }
    return true
  }

  async function handleSubmit() {
    try {
      setSubmitting(true)
      const submitPayload = buildRegistrationPayload(activityId, steps, formData)

      if (isAddingCompanion && signupId) {
        const personal = submitPayload.personal || {}
        await createCompanion(signupId, {
          name: personal.name || '同行人员',
          mobile: personal.phone,
          organization: [personal.school, personal.department].filter(Boolean).join(' / '),
          title: personal.position,
          extra: {
            steps: submitPayload.steps,
            step_map: Object.fromEntries(submitPayload.steps.map((step) => [step.step_key, step.values])),
          },
        })
        setCompanionCount((prev) => prev + 1)
        Taro.showToast({ title: t('signup.companionAdded'), icon: 'success', duration: 1500 })
        setShowSuccess(true)
        return
      }

      if (isRouteEditMode && routeSignupId) {
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
        return
      }

      const result: any = await submitRegistration(submitPayload)
      setSignupId(result?.registration_id || result?.id)
      setShowSuccess(true)
    } catch (error: any) {
      console.error('提交失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('signup.submitFailed')
      Taro.showToast({ title: errorMessage, icon: 'none', duration: 3000 })
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (!validateStep()) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      return
    }
    void handleSubmit()
  }

  function handlePrev() {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  function handleClose() {
    if (isSignupFormDirty(formData, flowData?.defaults)) {
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

  function handleFinish() {
    setShowCompanionDialog(true)
  }

  function handleAddCompanion() {
    setShowCompanionDialog(false)
    setIsAddingCompanion(true)
    setFormData(flowData?.defaults || {})
    setCurrentStep(0)
    setShowSuccess(false)
    Taro.showToast({ title: t('signup.fillCompanionInfo'), icon: 'none', duration: 1500 })
  }

  function handleSkipCompanion() {
    setShowCompanionDialog(false)
    setIsAddingCompanion(false)
    setCompanionCount(0)
    setSignupId(null)
    Taro.navigateBack()
  }

  return {
    activity,
    currentFields,
    currentStep,
    companionCount,
    currentStepConfig,
    flowData,
    formData,
    isAddingCompanion,
    isRouteEditMode,
    isScopedStepMode,
    setFormData,
    setCurrentStep,
    showCompanionDialog,
    showSuccess,
    steps,
    submitting,
    handleAddCompanion,
    handleClose,
    handleFinish,
    handleNext,
    handlePrev,
    handleSkipCompanion,
    handleSubmit,
    setShowCompanionDialog,
  }
}
