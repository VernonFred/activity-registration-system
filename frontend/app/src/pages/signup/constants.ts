/**
 * 报名页面常量配置
 * 按设计稿重构: 2025年12月15日
 */
import type { StepConfig, FieldOption } from './types'

import iconUser from '../../assets/icons/user.png'
import iconCard from '../../assets/icons/credit-card.png'
import iconHotel from '../../assets/icons/hotel.png'
import iconCar from '../../assets/icons/car-front.png'

// 步骤配置
export const STEPS: StepConfig[] = [
  { key: 'personal', number: 1, title: '个人信息', description: '请填写您的基本信息', icon: iconUser },
  { key: 'payment', number: 2, title: '缴费信息', description: '填写发票与缴费资料', icon: iconCard },
  { key: 'accommodation', number: 3, title: '住宿信息', description: '选择住宿及偏好', icon: iconHotel },
  { key: 'transport', number: 4, title: '交通信息', description: '填写行程和到站信息', icon: iconCar },
]

// 住宿安排选项
export const ACCOMMODATION_OPTIONS: FieldOption[] = [
  { value: 'self', label: '自行安排' },
  { value: 'organizer', label: '会务组安排' },
]

// 酒店选项
export const HOTEL_OPTIONS: FieldOption[] = [
  { value: 'sheraton', label: '喜来登', is_default: true },
  { value: 'bubugao', label: '步步高酒店' },
  { value: 'wanda', label: '万达嘉华酒店' },
]

// 房型选项
export const ROOM_TYPE_OPTIONS: FieldOption[] = [
  { value: 'double', label: '大床房', is_default: true },
  { value: 'standard', label: '标准间' },
]

// 户型选项
export const STAY_TYPE_OPTIONS: FieldOption[] = [
  { value: 'single', label: '单住' },
  { value: 'shared', label: '合住', is_default: true },
]

// 接站点选项
export const PICKUP_OPTIONS: FieldOption[] = [
  { value: 't2', label: 'T2航站楼', is_default: true },
  { value: 't1', label: 'T1航站楼' },
  { value: 'train', label: '长沙南站' },
  { value: 'west', label: '长沙西站' },
]

// 表单验证规则
export const VALIDATION_RULES = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

// 默认表单数据
export const DEFAULT_FORM_DATA = {
  personal: {
    name: '',
    school: '',
    department: '',
    position: '',
    phone: '',
  },
  payment: {
    invoice_title: '',
    email: '',
    payment_screenshot: '',
  },
  accommodation: {
    accommodation_type: 'self' as const,
    hotel: 'sheraton',
    room_type: 'double' as const,
    stay_type: 'shared' as const,
  },
  transport: {
    pickup_point: 't2',
    arrival_time: '',
    flight_train_number: '',
  },
}
