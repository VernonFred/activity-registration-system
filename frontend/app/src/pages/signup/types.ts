/**
 * 报名页面类型定义
 * 按设计稿重构: 2025年12月15日
 */

// 步骤配置
export interface StepConfig {
  key: StepKey
  number: number
  title: string
  description?: string
  icon?: string
}

export type StepKey = 'personal' | 'payment' | 'accommodation' | 'transport'

// 表单字段类型
export type FieldType = 'text' | 'phone' | 'select' | 'radio' | 'date' | 'file' | 'qrcode'

// 表单字段定义
export interface FormField {
  id: number
  name: string
  label: string
  field_type: FieldType
  required: boolean
  placeholder?: string
  options?: FieldOption[]
  step?: StepKey
}

// 字段选项
export interface FieldOption {
  value: string
  label: string
  is_default?: boolean
}

// 个人信息表单数据
export interface PersonalFormData {
  name: string
  school: string
  department: string
  position?: string
  phone: string
}

// 缴费信息表单数据
export interface PaymentFormData {
  invoice_title: string
  email: string
  payment_screenshot?: string
}

// 住宿信息表单数据
export interface AccommodationFormData {
  accommodation_type: 'self' | 'organizer'
  hotel: string
  room_type: 'double' | 'standard'
  stay_type: 'single' | 'shared'
}

// 交通信息表单数据
export interface TransportFormData {
  pickup_point?: string
  arrival_time?: string
  flight_train_number?: string
  dropoff_point?: string
  return_time?: string
  return_flight_train_number?: string
}

// 完整报名表单数据
export interface SignupFormData {
  personal: PersonalFormData
  payment: PaymentFormData
  accommodation: AccommodationFormData
  transport: TransportFormData
}

// 活动信息（用于报名页面展示）
export interface ActivityInfo {
  id: number
  title: string
  location?: string
  location_name?: string
  start_time?: string
  end_time?: string
}

// 报名成功数据
export interface SignupSuccessData {
  activity: ActivityInfo
  personal: PersonalFormData
  companionCount?: number  // 已添加的同行人员数量
}
