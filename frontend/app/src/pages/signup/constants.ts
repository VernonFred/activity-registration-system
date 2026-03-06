import type { SignupFlow, StepValues } from './types'

import iconUser from '../../assets/icons/user.png'
import iconCard from '../../assets/icons/credit-card.png'
import iconHotel from '../../assets/icons/hotel.png'
import iconCar from '../../assets/icons/car-front.png'

export const BUILTIN_STEP_META: Record<string, { title: string; description: string; icon: string }> = {
  personal: { title: '个人信息', description: '请填写您的基本信息', icon: iconUser },
  payment: { title: '缴费信息', description: '填写发票与缴费资料', icon: iconCard },
  accommodation: { title: '住宿信息', description: '选择住宿及偏好', icon: iconHotel },
  transport: { title: '交通信息', description: '填写行程和到站信息', icon: iconCar },
}

export const DEFAULT_SIGNUP_FLOW: SignupFlow = {
  steps: [
    { key: 'personal', title: '个人信息', description: '请填写您的基本信息', enabled: true, builtIn: true, order: 0, icon: iconUser },
    { key: 'payment', title: '缴费信息', description: '填写发票与缴费资料', enabled: true, builtIn: true, order: 1, icon: iconCard },
    { key: 'accommodation', title: '住宿信息', description: '选择住宿及偏好', enabled: false, builtIn: true, order: 2, icon: iconHotel },
    { key: 'transport', title: '交通信息', description: '填写行程和到站信息', enabled: true, builtIn: true, order: 3, icon: iconCar },
  ],
}

export const VALIDATION_RULES = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

export const BUILTIN_STEP_DEFAULTS: Record<string, StepValues> = {
  personal: {
    name: '',
    school: '',
    department: '',
    position: '',
    phone: '',
    attachment: '',
  },
  payment: {
    invoice_title: '',
    email: '',
    payment_screenshot: '',
  },
  accommodation: {
    accommodation_type: 'self',
    hotel: 'sheraton',
    room_type: 'double',
    stay_type: 'shared',
    attachment: '',
  },
  transport: {
    pickup_point: 't2',
    arrival_time: '',
    flight_train_number: '',
    dropoff_point: 't2',
    return_time: '',
    return_flight_train_number: '',
    attachment: '',
  },
}

export const ACCOMMODATION_OPTIONS = [
  { value: 'self', label: '自行安排' },
  { value: 'organizer', label: '会务组安排' },
]

export const HOTEL_OPTIONS = [
  { value: 'sheraton', label: '喜来登', is_default: true },
  { value: 'bubugao', label: '步步高酒店' },
  { value: 'wanda', label: '万达嘉华酒店' },
]

export const ROOM_TYPE_OPTIONS = [
  { value: 'double', label: '大床房', is_default: true },
  { value: 'standard', label: '标准间' },
]

export const STAY_TYPE_OPTIONS = [
  { value: 'single', label: '单住' },
  { value: 'shared', label: '合住', is_default: true },
]

export const PICKUP_OPTIONS = [
  { value: 't2', label: 'T2航站楼', is_default: true },
  { value: 't1', label: 'T1航站楼' },
  { value: 'train', label: '长沙南站' },
  { value: 'west', label: '长沙西站' },
]
