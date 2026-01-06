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
import { submitRegistration, createCompanion } from '../../services/signups'
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
  const [windowWidth, setWindowWidth] = useState(375)
  const [menuButtonRect, setMenuButtonRect] = useState({ left: 0, top: 0, width: 0, height: 0 })

  const [activity, setActivity] = useState<ActivityInfo | null>(null)
  const [formData, setFormData] = useState<SignupFormData>(DEFAULT_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCompanionDialog, setShowCompanionDialog] = useState(false)

  // 同行人员状态
  const [isAddingCompanion, setIsAddingCompanion] = useState(false)
  const [companionCount, setCompanionCount] = useState(0)
  const [signupId, setSignupId] = useState<number | null>(null)

  // 计算导航栏高度和胶囊按钮位置
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
    setWindowWidth(sysInfo.windowWidth || 375)

    // 获取微信胶囊按钮位置（用于避免退出按钮重叠）
    try {
      const rect = Taro.getMenuButtonBoundingClientRect()
      setMenuButtonRect(rect)
    } catch (error) {
      console.error('获取胶囊按钮位置失败:', error)
      // 降级方案：使用默认值
      setMenuButtonRect({
        left: sysInfo.windowWidth - 87,
        top: sysInfo.statusBarHeight || 44,
        width: 87,
        height: 32
      })
    }
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

      if (isAddingCompanion && signupId) {
        // 同行人员模式：提交同行人员
        await createCompanion(signupId, {
          personal: formData.personal,
          payment: formData.payment,
          accommodation: formData.accommodation,
          transport: formData.transport,
        })

        // 增加同行人员计数
        setCompanionCount(prev => prev + 1)

        Taro.showToast({
          title: '已添加同行人员',
          icon: 'success',
          duration: 1500
        })

        // 显示成功页面
        setShowSuccess(true)
      } else {
        // 主报名模式：提交主报名
        const result: any = await submitRegistration({
          activity_id: activityId,
          personal: formData.personal,
          payment: formData.payment,
          accommodation: formData.accommodation,
          transport: formData.transport,
        })

        // 保存报名ID，用于后续添加同行人员
        setSignupId(result?.registration_id || result?.id)

        setShowSuccess(true)
      }
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

  // 检查表单是否有填写内容（对比当前表单和默认表单）
  const isFormDirty = (): boolean => {
    // 检查个人信息
    if (formData.personal.name.trim() !== '') return true
    if (formData.personal.school.trim() !== '') return true
    if (formData.personal.department.trim() !== '') return true
    if (formData.personal.position?.trim() !== '') return true
    if (formData.personal.phone.trim() !== '') return true

    // 检查缴费信息
    if (formData.payment.invoice_title.trim() !== '') return true
    if (formData.payment.email.trim() !== '') return true
    if (formData.payment.payment_screenshot?.trim() !== '') return true

    // 检查住宿信息（对比默认值）
    if (formData.accommodation.accommodation_type !== DEFAULT_FORM_DATA.accommodation.accommodation_type) return true
    if (formData.accommodation.hotel !== DEFAULT_FORM_DATA.accommodation.hotel) return true
    if (formData.accommodation.room_type !== DEFAULT_FORM_DATA.accommodation.room_type) return true
    if (formData.accommodation.stay_type !== DEFAULT_FORM_DATA.accommodation.stay_type) return true

    // 检查交通信息（对比默认值）
    if (formData.transport.pickup_point !== DEFAULT_FORM_DATA.transport.pickup_point) return true
    if (formData.transport.arrival_time?.trim() !== '') return true
    if (formData.transport.flight_train_number?.trim() !== '') return true
    if (formData.transport.dropoff_point !== DEFAULT_FORM_DATA.transport.dropoff_point) return true
    if (formData.transport.return_time?.trim() !== '') return true
    if (formData.transport.return_flight_train_number?.trim() !== '') return true

    return false
  }

  // 关闭页面（右上角 ✕ 按钮）
  const handleClose = () => {
    // 智能退出逻辑
    if (isFormDirty()) {
      // 表单有内容，显示确认弹窗
      Taro.showModal({
        title: '您确定要退出报名填写的页面吗？',
        content: '',
        confirmText: '确定',
        cancelText: '取消',
        confirmColor: '#1E5A3C',
        cancelColor: '#E74C3C',
        success: (res) => {
          if (res.confirm) {
            // 用户确认退出
            Taro.navigateBack()
          }
          // 用户取消，不做任何操作
        }
      })
    } else {
      // 表单为空，直接退出
      Taro.navigateBack()
    }
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
    console.log('✅ handleAddCompanion: 进入同行人员模式')
    setShowCompanionDialog(false)

    // 进入同行人员模式
    setIsAddingCompanion(true)

    // 重置表单数据
    setFormData(DEFAULT_FORM_DATA)

    // 重置到第一步
    setCurrentStep(0)

    // 隐藏成功页面，显示表单
    setShowSuccess(false)

    Taro.showToast({
      title: '请填写同行人员信息',
      icon: 'none',
      duration: 1500
    })
  }

  // 暂不添加同行人员
  const handleSkipCompanion = () => {
    console.log('✅ handleSkipCompanion: 用户选择暂不添加')
    setShowCompanionDialog(false)

    // 重置同行人员状态
    setIsAddingCompanion(false)
    setCompanionCount(0)
    setSignupId(null)

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
      companionCount: isAddingCompanion ? companionCount : undefined,
    }
    return (
      <>
        {/* 当弹窗显示时，隐藏成功页面，避免重叠 */}
        {!showCompanionDialog && (
          <SuccessPage data={successData} onFinish={handleFinish} theme={theme} />
        )}
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
    <View className={`signup-page theme-${theme}`}>
      {/* 状态栏占位 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />

      <View className="signup-header">
        <View
          className="header-back"
          onClick={currentStep === 0 ? handleClose : handlePrev}
        >
          <Image src={iconArrowLeft} className="header-back-icon" mode="aspectFit" />
        </View>
        <View className="header-titles">
          <Text className="header-title">活动报名</Text>
        </View>
        <View
          className="header-close"
          onClick={handleClose}
          style={{
            right: menuButtonRect.left > 0 ? `${windowWidth - menuButtonRect.left + 16}px` : '100px'
          }}
        >
          <Image src={iconClose} className="close-icon" mode="aspectFit" />
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
