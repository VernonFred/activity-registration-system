/**
 * 报名页面 - 按设计稿重构
 * 重构时间: 2025年12月15日
 * 
 * 设计参考: 小程序端设计/立即报名-*.png
 * 分步表单: 个人信息 → 缴费信息 → 住宿信息 → 交通信息 → 成功
 */
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchActivityDetail } from '../../services/activities'
import { submitRegistration } from '../../services/signups'
import {
  StepIndicator,
  PersonalForm,
  PaymentForm,
  AccommodationForm,
  TransportForm,
  SuccessPage,
  AddCompanionDialog
} from './components'
import { STEPS, DEFAULT_FORM_DATA, VALIDATION_RULES } from './constants'
import type { SignupFormData, ActivityInfo, SignupSuccessData } from './types'
import './index.scss'

// 图标
import iconClose from '../../assets/icons/x.png'
import iconArrowLeft from '../../assets/icons/arrow-left.png'
import iconArrowRight from '../../assets/icons/arrow-right.png'

const SignupPage = () => {
  const router = useRouter()
  const activityId = Number(router.params.activityId || router.params.activity_id)
  const { theme } = useTheme()
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  const [navBarHeight, setNavBarHeight] = useState(0)

  const [activity, setActivity] = useState<ActivityInfo | null>(null)
  const [formData, setFormData] = useState<SignupFormData>(DEFAULT_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCompanionDialog, setShowCompanionDialog] = useState(false)

  // 计算导航栏高度
  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync()
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    setStatusBarHeight(systemInfo.statusBarHeight || 0)
    setNavBarHeight((menuButtonInfo.top - (systemInfo.statusBarHeight || 0)) * 2 + menuButtonInfo.height)
  }, [])

  // 加载活动数据
  useEffect(() => {
    if (!activityId) {
      Taro.showToast({ title: '活动ID无效', icon: 'none' })
      return
    }
    loadActivity()
  }, [activityId])

  const loadActivity = async () => {
    try {
      const detail = await fetchActivityDetail(activityId) as any
      setActivity({
        id: detail.id,
        title: detail.title,
        location: detail.location,
        location_name: detail.location_name,
        start_time: detail.start_time,
        end_time: detail.end_time,
      })
    } catch (error) {
      console.error('加载活动失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  // 验证当前步骤
  const validateStep = (): boolean => {
    const step = STEPS[currentStep]
    
    if (step.key === 'personal') {
      const { name, school, department, phone } = formData.personal
      if (!name.trim()) {
        Taro.showToast({ title: '请输入姓名', icon: 'none' })
        return false
      }
      if (!school.trim()) {
        Taro.showToast({ title: '请输入学校', icon: 'none' })
        return false
      }
      if (!department.trim()) {
        Taro.showToast({ title: '请输入学院/部门', icon: 'none' })
        return false
      }
      if (!phone.trim() || !VALIDATION_RULES.phone.test(phone)) {
        Taro.showToast({ title: '请输入正确的手机号码', icon: 'none' })
        return false
      }
    }
    
    if (step.key === 'payment') {
      const { invoice_title, email } = formData.payment
      if (!invoice_title.trim()) {
        Taro.showToast({ title: '请输入发票抬头', icon: 'none' })
        return false
      }
      if (!email.trim() || !VALIDATION_RULES.email.test(email)) {
        Taro.showToast({ title: '请输入正确的邮箱地址', icon: 'none' })
        return false
      }
    }
    
    return true
  }

  // 下一步
  const handleNext = () => {
    if (!validateStep()) return
    
    if (currentStep < STEPS.length - 1) {
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

  // 稍后填写（跳过交通信息）
  const handleSkip = () => {
    handleSubmit()
  }

  // 提交报名
  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // 调用真实API提交报名
      await submitRegistration({
        activity_id: activityId,
        personal: formData.personal,
        payment: formData.payment,
        accommodation: formData.accommodation,
        transport: formData.transport,
      })

      setShowSuccess(true)
    } catch (error: any) {
      console.error('提交失败:', error)

      // 根据错误类型显示不同提示
      const errorMessage = error?.response?.data?.message || error?.message || '提交失败，请重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 关闭页面
  const handleClose = () => {
    Taro.navigateBack()
  }

  // 完成（点击成功页面的完成按钮）
  const handleFinish = () => {
    console.log('✅ handleFinish: 被调用，准备显示弹窗')
    console.log('✅ 当前 showCompanionDialog 状态:', showCompanionDialog)
    // 弹出添加同行人员对话框
    setShowCompanionDialog(true)
    console.log('✅ 已调用 setShowCompanionDialog(true)')
  }

  // 添加同行人员
  const handleAddCompanion = () => {
    setShowCompanionDialog(false)
    // TODO: 跳转到添加同行人员页面
    Taro.showToast({
      title: '同行人员功能开发中',
      icon: 'none',
      duration: 2000
    })
    // 延迟返回
    setTimeout(() => {
      Taro.navigateBack()
    }, 2000)
  }

  // 暂不添加同行人员
  const handleSkipCompanion = () => {
    setShowCompanionDialog(false)
    // 直接返回上一页
    Taro.navigateBack()
  }

  // 加载中
  if (!activity) {
    return (
      <View className={`signup-page theme-${theme} loading`}>
        <Text className="loading-text">正在加载...</Text>
      </View>
    )
  }

  // 成功页面
  if (showSuccess) {
    console.log('✅ 渲染成功页面，showCompanionDialog=', showCompanionDialog)
    const successData: SignupSuccessData = {
      activity,
      personal: formData.personal,
    }
    return (
      <>
        <SuccessPage data={successData} onFinish={handleFinish} theme={theme} />
        <AddCompanionDialog
          visible={showCompanionDialog}
          onAddCompanion={handleAddCompanion}
          onSkip={handleSkipCompanion}
          theme={theme}
        />
      </>
    )
  }

  const currentStepConfig = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const isTransportStep = currentStepConfig.key === 'transport'

  return (
    <View className={`signup-page theme-${theme}`} style={{ paddingTop: `${statusBarHeight + navBarHeight}px` }}>
      <View className="signup-header" style={{ paddingTop: `${statusBarHeight}px`, height: `${navBarHeight}px` }}>
        <View 
          className="header-back" 
          onClick={currentStep === 0 ? handleClose : handlePrev}
        >
          <Image src={iconArrowLeft} className="header-back-icon" mode="aspectFit" />
        </View>
        <View className="header-titles">
          <Text className="header-title">活动报名</Text>
        </View>
      </View>

      <ScrollView className="signup-body" scrollY enhanced showScrollbar={false}>
        <View className="step-wrapper">
          <View className="step-header">
            <Text className="step-tag">填写报名信息</Text>
          </View>
          <StepIndicator steps={STEPS} currentStep={currentStep} theme={theme} />
        </View>

        <View className="section-card">
          <View className="section-card-icon">
            {currentStepConfig.icon && (
              <Image src={currentStepConfig.icon} className="section-icon-img" mode="aspectFit" />
            )}
          </View>
          <View className="section-card-info">
            <Text className="section-card-desc">
              {currentStepConfig.description || '请准确填写，信息将用于审核与通知'}
            </Text>
          </View>
          <View className="section-card-step">
            <Text className="section-card-step-text">{currentStep + 1}/{STEPS.length}</Text>
          </View>
        </View>

        <View className="form-panel">
          {currentStepConfig.key === 'personal' && (
            <PersonalForm
              data={formData.personal}
              onChange={(data) => setFormData(prev => ({ ...prev, personal: data }))}
              theme={theme}
            />
          )}
          {currentStepConfig.key === 'payment' && (
            <PaymentForm
              data={formData.payment}
              onChange={(data) => setFormData(prev => ({ ...prev, payment: data }))}
              theme={theme}
            />
          )}
          {currentStepConfig.key === 'accommodation' && (
            <AccommodationForm
              data={formData.accommodation}
              onChange={(data) => setFormData(prev => ({ ...prev, accommodation: data }))}
              theme={theme}
            />
          )}
          {currentStepConfig.key === 'transport' && (
            <TransportForm
              data={formData.transport}
              onChange={(data) => setFormData(prev => ({ ...prev, transport: data }))}
              theme={theme}
            />
          )}
        </View>
      </ScrollView>

      <View className="bottom-actions">
        {currentStep > 0 && (
          <View className="action-button secondary" onClick={handlePrev}>
            <Image src={iconArrowLeft} className="btn-icon" mode="aspectFit" />
            <Text className="btn-text">上一步</Text>
          </View>
        )}

        {isTransportStep ? (
          <>
            <View className="action-button outline" onClick={handleSkip}>
              <Text className="btn-text">稍后填写</Text>
            </View>
            <View 
              className={`action-button primary ${submitting ? 'loading' : ''}`}
              onClick={handleSubmit}
            >
              <Text className="btn-text">提交报名</Text>
            </View>
          </>
        ) : (
          <View 
            className={`action-button primary ${currentStep === 0 ? 'full' : ''}`}
            onClick={handleNext}
          >
            <Text className="btn-text">{isLastStep ? '提交报名' : '下一步'}</Text>
            {!isLastStep && <Image src={iconArrowRight} className="btn-icon" mode="aspectFit" />}
          </View>
        )}
      </View>
    </View>
  )
}

export default SignupPage
