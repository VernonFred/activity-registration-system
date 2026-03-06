/**
 * 报名页面类型定义
 */

export interface StepConfig {
  key: string
  title: string
  description?: string
  icon?: string
  enabled?: boolean
  builtIn?: boolean
  order?: number
}

export type StepKey = string

export type FieldType = 'text' | 'phone' | 'select' | 'radio' | 'date' | 'file' | 'qrcode' | 'textarea' | 'checkbox' | 'datetime' | 'switch' | 'number'
export type FieldWidget = 'input' | 'textarea' | 'select' | 'radio' | 'checkboxes' | 'dateTime' | 'switch' | 'image_upload'

export interface FieldOption {
  value: string
  label: string
  is_default?: boolean
}

export interface FormField {
  id?: number
  name: string
  label: string
  field_type: FieldType
  required: boolean
  placeholder?: string
  options?: FieldOption[]
  step?: string
  config?: {
    step?: string
    bind?: string
    widget?: FieldWidget
    upload?: {
      max_count?: number
      required?: boolean
    }
  }
}

export type StepValues = Record<string, any>
export type SignupDraft = Record<string, StepValues>

export interface PersonalFormData extends StepValues {}
export interface PaymentFormData extends StepValues {}
export interface AccommodationFormData extends StepValues {}
export interface TransportFormData extends StepValues {}
export interface SignupFormData extends SignupDraft {}

export interface SignupFlow {
  steps: StepConfig[]
}

export interface ActivityInfo {
  id: number
  title: string
  location?: string
  location_name?: string
  start_time?: string
  end_time?: string
  group_qr_image_url?: string
}

export interface SignupSuccessData {
  activity: ActivityInfo
  personal: {
    name?: string
    school?: string
    department?: string
    phone?: string
  }
  companionCount?: number
}
