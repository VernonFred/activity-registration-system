import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { AddCompanionDialog, StepIndicator, SuccessPage } from './components'
import DynamicStepForm from './components/DynamicStepForm'
import type { SignupSuccessData } from './types'
import { useSignupPage } from './hooks/useSignupPage'
import './index.scss'

import iconClose from '../../assets/icons/x.png'
import iconArrowLeft from '../../assets/icons/arrow-left.png'
import iconArrowRight from '../../assets/icons/arrow-right.png'

const SignupPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const activityId = Number(router.params.activityId || router.params.activity_id)
  const routeSignupId = Number(router.params.signupId || router.params.signup_id || 0)
  const routeMode = String(router.params.mode || '').toLowerCase()
  const { theme } = useTheme()
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  const {
    activity,
    companionCount,
    currentFields,
    currentStep,
    currentStepConfig,
    flowData,
    formData,
    isScopedStepMode,
    setFormData,
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
  } = useSignupPage({ activityId, routeSignupId, routeMode, t })

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  const successData = useMemo<SignupSuccessData | null>(() => {
    if (!activity) return null
    return {
      activity,
      personal: formData.personal || {},
      companionCount: companionCount || undefined,
    }
  }, [activity, formData.personal])

  if (!activity || steps.length === 0 || !currentStepConfig || !flowData) {
    return (
      <View className={`signup-page theme-${theme} loading`}>
        <Text className="loading-text">{t('common.loading')}</Text>
      </View>
    )
  }

  if (showSuccess && successData) {
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
              paymentQrImageUrl={currentStepConfig.key === 'payment' ? flowData.signupConfig.payment.qrImageUrl : undefined}
              paymentInvoiceEnabled={currentStepConfig.key === 'payment' ? flowData.signupConfig.payment.invoiceEnabled : true}
              transportNote={currentStepConfig.key === 'transport' ? flowData.signupConfig.transport.note : undefined}
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
              <View className="action-button outline" onClick={() => void handleSubmit()}>
                <Text className="btn-text">{t('common.laterFill')}</Text>
              </View>
              <View className={`action-button primary ${submitting ? 'loading' : ''}`} onClick={() => void handleSubmit()}>
                <Text className="btn-text">{t('signup.submitSignup')}</Text>
              </View>
            </>
          ) : (
            <View
              className={`action-button primary ${currentStep === 0 ? 'full' : ''}`}
              onClick={() => {
                if (isScopedStepMode && currentStepConfig.key === routeMode) {
                  void handleSubmit()
                  return
                }
                handleNext()
              }}
            >
              <Text className="btn-text">
                {isScopedStepMode && currentStepConfig.key === routeMode
                  ? t('common.save')
                  : isLastStep
                    ? t('signup.submitSignup')
                    : t('common.next')}
              </Text>
              {!(isScopedStepMode && currentStepConfig.key === routeMode) && !isLastStep && (
                <Image src={iconArrowRight} className="btn-icon" mode="aspectFit" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default SignupPage
