import { BUILTIN_STEP_DEFAULTS, BUILTIN_STEP_META, DEFAULT_SIGNUP_FLOW } from '../constants'
import type { FormField, SignupDraft, SignupFlow, StepConfig } from '../types'

export interface SignupFlowNormalized {
  flow: SignupFlow
  steps: StepConfig[]
  fieldsByStep: Record<string, FormField[]>
  defaults: SignupDraft
  signupConfig: {
    payment: {
      qrImageUrl?: string
      invoiceEnabled: boolean
      receiptRequired: boolean
    }
    accommodation: {
      hotelOptions: Array<{ value: string; label: string }>
      roomIntentOptions: Array<{ value: string; label: string }>
      occupancyOptions: Array<{ value: string; label: string }>
    }
    transport: {
      note?: string
      pickupOptions: Array<{ value: string; label: string }>
      dropoffOptions: Array<{ value: string; label: string }>
    }
  }
}

function inferStepKey(field: any) {
  if (typeof field?.config?.step === 'string' && field.config.step.trim()) return field.config.step.trim()
  if (typeof field?.step === 'string' && field.step.trim()) return field.step.trim()
  if (typeof field?.config?.bind === 'string' && field.config.bind.includes('.')) {
    return field.config.bind.split('.')[0]
  }
  if (typeof field?.preset_key === 'string') {
    if (field.preset_key.startsWith('payment_') || field.preset_key === 'invoice_title' || field.preset_key === 'email') return 'payment'
    if (field.preset_key.startsWith('accommodation_') || ['hotel', 'room_type', 'stay_type'].includes(field.preset_key)) return 'accommodation'
    if (field.preset_key.startsWith('transport_') || ['pickup_point', 'arrival_time', 'flight_train_number', 'dropoff_point', 'return_time', 'return_flight_train_number'].includes(field.preset_key)) return 'transport'
  }
  return 'personal'
}

function getValueKey(field: FormField) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

function buildFieldDefault(field: FormField) {
  if (field.config?.widget === 'checkboxes') return []
  if (field.config?.widget === 'switch') return false
  if (field.options?.length) {
    const defaultOption = field.options.find((option) => option.is_default) || field.options[0]
    if (field.config?.widget === 'radio' || field.config?.widget === 'select') {
      return defaultOption?.value || ''
    }
  }
  return ''
}

function normalizeFlow(detail: any): SignupFlow {
  const extra = detail?.extra || {}
  const configured = extra.signup_flow
  const legacy = extra.signup_config || {}

  if (Array.isArray(configured?.steps)) {
    return {
      steps: configured.steps
        .map((step: any, index: number) => ({
          key: String(step?.key || `step_${index + 1}`),
          title: String(step?.title || BUILTIN_STEP_META[step?.key]?.title || `步骤 ${index + 1}`),
          description: String(step?.description || BUILTIN_STEP_META[step?.key]?.description || ''),
          enabled: typeof step?.enabled === 'boolean' ? step.enabled : true,
          builtIn: !!step?.built_in,
          order: typeof step?.order === 'number' ? step.order : index,
          icon: BUILTIN_STEP_META[String(step?.key || '')]?.icon,
        }))
        .sort((left: StepConfig, right: StepConfig) => (left.order || 0) - (right.order || 0)),
    }
  }

  if (configured?.steps && typeof configured.steps === 'object') {
    const legacyOrder = Array.isArray(configured.step_order) && configured.step_order.length
      ? configured.step_order
      : DEFAULT_SIGNUP_FLOW.steps.map((step) => step.key)
    return {
      steps: legacyOrder.map((key: string, index: number) => ({
        key,
        title: BUILTIN_STEP_META[key]?.title || `步骤 ${index + 1}`,
        description: BUILTIN_STEP_META[key]?.description || '',
        enabled: typeof configured.steps[key]?.enabled === 'boolean'
          ? configured.steps[key].enabled
          : key === 'payment'
            ? legacy.payment?.enabled ?? true
            : key === 'accommodation'
              ? legacy.accommodation?.enabled ?? false
              : key === 'transport'
                ? legacy.transport?.enabled ?? true
                : true,
        builtIn: true,
        order: index,
        icon: BUILTIN_STEP_META[key]?.icon,
      })),
    }
  }

  return DEFAULT_SIGNUP_FLOW
}

function normalizeFields(detail: any): Record<string, FormField[]> {
  const grouped: Record<string, FormField[]> = {}
  const rawFields = Array.isArray(detail?.form_fields) ? detail.form_fields : []
  rawFields.forEach((field: any) => {
    if (field?.visible === false) return
    const stepKey = inferStepKey(field)
    if (!grouped[stepKey]) grouped[stepKey] = []
    grouped[stepKey].push({
      id: field.id,
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      required: !!field.required,
      placeholder: field.placeholder || '',
      options: Array.isArray(field.options)
        ? field.options.map((option: any) => ({
            value: option.value,
            label: option.label,
            is_default: option.is_default,
          }))
        : [],
      step: stepKey,
      config: {
        step: stepKey,
        bind: field.config?.bind || `${stepKey}.${field.name}`,
        widget: field.config?.widget || (field.field_type === 'textarea' ? 'textarea' : field.field_type === 'select' ? 'select' : field.field_type === 'radio' ? 'radio' : field.field_type === 'checkbox' ? 'checkboxes' : field.field_type === 'switch' ? 'switch' : field.field_type === 'datetime' ? 'dateTime' : 'input'),
        upload: field.config?.upload,
      },
    })
  })
  return grouped
}

function normalizeDefaults(flow: SignupFlow, fieldsByStep: Record<string, FormField[]>): SignupDraft {
  const defaults: SignupDraft = {}
  flow.steps.forEach((step) => {
    const builtinDefaults = BUILTIN_STEP_DEFAULTS[step.key] || {}
    const fieldDefaults = (fieldsByStep[step.key] || []).reduce<Record<string, any>>((acc, field) => {
      acc[getValueKey(field)] = buildFieldDefault(field)
      return acc
    }, {})
    defaults[step.key] = { ...builtinDefaults, ...fieldDefaults }
  })
  return defaults
}

export function normalizeSignupFlowFromActivity(detail: any): SignupFlowNormalized {
  const extra = detail?.extra || {}
  const flow = normalizeFlow(detail)
  const enabledSteps = flow.steps.filter((step) => step.enabled !== false)
  const fieldsByStep = normalizeFields(detail)
  const defaults = normalizeDefaults({ steps: enabledSteps }, fieldsByStep)
  const signupConfig = extra.signup_config || {}

  return {
    flow,
    steps: enabledSteps,
    fieldsByStep,
    defaults,
    signupConfig: {
      payment: {
        qrImageUrl: signupConfig.payment?.qr_image_url,
        invoiceEnabled: signupConfig.payment?.invoice_enabled ?? true,
        receiptRequired: signupConfig.payment?.receipt_required ?? false,
      },
      accommodation: {
        hotelOptions: (signupConfig.accommodation?.hotel_options || []).map((value: string) => ({ value, label: value })),
        roomIntentOptions: (signupConfig.accommodation?.room_intents || []).map((value: string) => ({ value, label: value })),
        occupancyOptions: (signupConfig.accommodation?.occupancy_options || []).map((value: string) => ({ value, label: value })),
      },
      transport: {
        note: signupConfig.transport?.note,
        pickupOptions: (signupConfig.transport?.pickup_points || []).map((value: string) => ({ value, label: value })),
        dropoffOptions: (signupConfig.transport?.dropoff_points || []).map((value: string) => ({ value, label: value })),
      },
    },
  }
}
