import Taro from '@tarojs/taro'
import type { SignupRecord, User } from './user-types'

// ============================================================
// Mock 数据
// ============================================================

const MOCK_USER: User = {
  id: 1,
  name: '张三',
  avatar: 'https://i.pravatar.cc/150?img=1',
  phone: '138****0000',
  school: '清华大学',
  department: '计算机科学与技术学院',
  position: '研究生',
  wechat_openid: 'mock_openid_123',
  created_at: '2025-01-01T00:00:00Z'
}

const MOCK_SIGNUPS: SignupRecord[] = [
  {
    id: 1,
    activity: {
      id: 1,
      title: '2025暑期培训会',
      cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      start_time: '2025-08-10T09:00:00Z',
      end_time: '2025-08-12T18:00:00Z',
      location_city: '长沙',
      location_name: '长沙民政职业技术学院'
    },
    status: 'approved',
    created_at: '2026-01-05T10:00:00Z',
    reviewed_at: '2026-01-06T14:00:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    },
    payment: {
      invoice_title: '清华大学',
      email: 'zhangsan@example.com'
    },
    transport: {
      pickup_point: 't2',
      arrival_time: '2025-08-10 09:30',
      flight_train_number: 'MU1234',
      dropoff_point: 't2',
      return_time: '',
      return_flight_train_number: ''
    },
    companions: []
  },
  {
    id: 2,
    activity: {
      id: 2,
      title: '春季学术研讨会',
      cover_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      start_time: '2025-04-15T09:00:00Z',
      end_time: '2025-04-17T18:00:00Z',
      location_city: '北京',
      location_name: '北京大学'
    },
    status: 'approved',
    created_at: '2026-01-03T16:30:00Z',
    reviewed_at: '2026-01-04T09:00:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    },
    payment: {
      invoice_title: '清华大学',
      email: 'zhangsan@example.com'
    },
    companions: [
      {
        id: 201,
        personal: { name: '李四' }
      },
      {
        id: 202,
        personal: { name: '王五' }
      }
    ]
  },
  {
    id: 3,
    activity: {
      id: 3,
      title: '秋季职业教育论坛',
      cover_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      start_time: '2025-10-20T09:00:00Z',
      end_time: '2025-10-22T18:00:00Z',
      location_city: '上海',
      location_name: '上海交通大学'
    },
    status: 'approved',
    created_at: '2025-12-20T10:00:00Z',
    reviewed_at: '2025-12-22T15:30:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    }
  },
  {
    id: 4,
    activity: {
      id: 4,
      title: '冬季教学创新论坛',
      cover_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      start_time: '2025-12-05T09:00:00Z',
      end_time: '2025-12-07T18:00:00Z',
      location_city: '广州',
      location_name: '华南师范大学'
    },
    status: 'approved',
    created_at: '2025-11-20T10:00:00Z',
    reviewed_at: '2025-11-21T10:00:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    },
    payment: {
      invoice_title: '清华大学',
      email: 'zhangsan@example.com'
    },
    transport: {
      pickup_point: 'train',
      arrival_time: '2025-12-05 08:20',
      flight_train_number: 'G6123',
      dropoff_point: 'train',
      return_time: '2025-12-07 19:10',
      return_flight_train_number: 'G6128'
    },
    companions: []
  },
  {
    id: 5,
    activity: {
      id: 5,
      title: '春季产教融合交流会',
      cover_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      start_time: '2026-03-15T09:00:00Z',
      end_time: '2026-03-16T18:00:00Z',
      location_city: '成都',
      location_name: '四川大学'
    },
    status: 'approved',
    created_at: '2026-02-10T10:00:00Z',
    reviewed_at: '2026-02-10T18:00:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    },
    companions: []
  }
]

const MOCK_SIGNUP_FORM_OVERRIDES_KEY = 'mock_signup_form_overrides'

type SignupFormOverride = Partial<Pick<SignupRecord, 'personal' | 'payment' | 'accommodation' | 'transport'>>

const getMockSignupFormOverrides = (): Record<string, SignupFormOverride> => {
  try {
    const raw = Taro.getStorageSync(MOCK_SIGNUP_FORM_OVERRIDES_KEY)
    if (!raw) return {}
    if (typeof raw === 'string') return JSON.parse(raw)
    return raw as Record<string, SignupFormOverride>
  } catch (error) {
    console.error('读取报名表单覆盖数据失败:', error)
    return {}
  }
}

const setMockSignupFormOverride = (signupId: number, override: SignupFormOverride) => {
  try {
    const all = getMockSignupFormOverrides()
    all[String(signupId)] = {
      ...(all[String(signupId)] || {}),
      ...override,
    }
    Taro.setStorageSync(MOCK_SIGNUP_FORM_OVERRIDES_KEY, JSON.stringify(all))
  } catch (error) {
    console.error('写入报名表单覆盖数据失败:', error)
  }
}

const applyMockSignupOverride = (signup: SignupRecord): SignupRecord => {
  const override = getMockSignupFormOverrides()[String(signup.id)]
  if (!override) return signup
  return {
    ...signup,
    personal: {
      ...signup.personal,
      ...(override.personal || {}),
    },
    payment: {
      ...(signup.payment || { invoice_title: '', email: '' }),
      ...(override.payment || {}),
    },
    accommodation: {
      ...(signup.accommodation || {}),
      ...(override.accommodation || {}),
    },
    transport: {
      ...(signup.transport || {}),
      ...(override.transport || {}),
    },
  }
}

export { applyMockSignupOverride, MOCK_SIGNUPS, MOCK_USER, setMockSignupFormOverride }
