import type { TFunction } from 'i18next'
import type { RegistrationStepPayload } from '../../services/signups'
import type { FormField, SignupDraft, StepConfig } from './types'
import type { SignupFlowNormalized } from './adapters/flow'

export function resolveStepIndexByKey(stepList: StepConfig[], key: string) {
  const idx = stepList.findIndex((step) => step.key === key)
  return idx >= 0 ? idx : 0
}

export function getFieldValueKey(field: FormField) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

export function buildDraftFromSignup(signUp: any, normalized: SignupFlowNormalized): SignupDraft {
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

export function hasValue(value: any) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return value
  if (value == null) return false
  return String(value).trim().length > 0
}

export function cleanStepValues(values: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(values || {}).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'boolean') return value
      return value != null && String(value).trim() !== ''
    }),
  )
}

export function validateCurrentStep(
  fields: FormField[],
  values: Record<string, any>,
  t: TFunction,
  validationRules: { phone: RegExp; email: RegExp },
) {
  for (const field of fields) {
    const value = values[getFieldValueKey(field)]
    const required = field.required || (field.config?.widget === 'image_upload' && field.config?.upload?.required)
    if (required && !hasValue(value)) {
      return `${field.label}不能为空`
    }
    const valueKey = getFieldValueKey(field)
    if (hasValue(value) && valueKey.includes('phone') && !validationRules.phone.test(String(value))) {
      return t('signup.invalidPhone')
    }
    if (hasValue(value) && valueKey.includes('email') && !validationRules.email.test(String(value))) {
      return t('signup.invalidEmail')
    }
  }
  return ''
}

export function buildRegistrationPayload(activityId: number, steps: StepConfig[], formData: SignupDraft) {
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

export function isSignupFormDirty(formData: SignupDraft, defaults?: SignupDraft) {
  return JSON.stringify(formData || {}) !== JSON.stringify(defaults || {})
}
