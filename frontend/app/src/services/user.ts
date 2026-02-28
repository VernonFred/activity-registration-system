/**
 * 用户相关 API 服务
 * 创建时间: 2026年1月7日
 *
 * 接口列表:
 * - GET  /api/v1/users/me - 获取当前用户信息
 * - GET  /api/v1/users/me/signups - 我的报名列表
 * - GET  /api/v1/signups/:id - 报名详情
 * - PUT  /api/v1/users/me - 更新用户信息
 */

import { http } from './http'
import { CONFIG } from '../config'
import Taro from '@tarojs/taro'

// ============================================================
// 类型定义
// ============================================================

export interface User {
  id: number
  name: string
  avatar?: string
  phone?: string
  school?: string
  department?: string
  position?: string
  wechat_openid?: string
  created_at: string
}

export interface SignupRecord {
  id: number
  activity: {
    id: number
    title: string
    cover_url?: string
    start_time: string
    end_time: string
    location_city?: string
    location_name?: string
  }
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  personal: {
    name: string
    phone: string
    school: string
    department: string
    position?: string
  }
  payment?: {
    invoice_title: string
    email: string
    payment_screenshot?: string
  }
  accommodation?: any
  transport?: any
  companions?: any[]
  rejection_reason?: string
}

export interface SignupsResponse {
  items: SignupRecord[]
  total: number
  page: number
  per_page: number
}

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

// ============================================================
// API 方法
// ============================================================

/**
 * 获取当前用户信息
 */
export const fetchCurrentUser = async (): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const stored = Taro.getStorageSync('mock_user_overrides')
    return stored ? { ...MOCK_USER, ...stored } : MOCK_USER
  }

  const response = await http.get('/users/me')
  return response.data
}

/**
 * 更新用户信息
 * @param data 用户数据
 */
export const updateUser = async (data: Partial<User>): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const stored = Taro.getStorageSync('mock_user_overrides') || {}
    const merged = { ...stored, ...data }
    Taro.setStorageSync('mock_user_overrides', merged)
    return { ...MOCK_USER, ...merged }
  }

  const response = await http.put('/users/me', data)
  return response.data
}

/**
 * 获取我的报名列表
 * @param params 查询参数
 */
export const fetchMySignups = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  page?: number
  per_page?: number
  keyword?: string
}): Promise<SignupsResponse> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    let signups = MOCK_SIGNUPS.map(applyMockSignupOverride)

    // 状态筛选
    if (params?.status && params.status !== 'all') {
      signups = signups.filter(s => s.status === params.status)
    }

    // 关键词搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      signups = signups.filter(s =>
        s.activity.title.toLowerCase().includes(keyword) ||
        s.activity.location_city?.toLowerCase().includes(keyword) ||
        s.activity.location_name?.toLowerCase().includes(keyword)
      )
    }

    // 分页
    const page = params?.page || 1
    const per_page = params?.per_page || 10
    const start = (page - 1) * per_page
    const end = start + per_page
    const items = signups.slice(start, end)

    return {
      items,
      total: signups.length,
      page,
      per_page
    }
  }

  // 真实 API
  const response = await http.get('/users/me/signups', {
    params: {
      status: params?.status === 'all' ? undefined : params?.status,
      page: params?.page || 1,
      per_page: params?.per_page || 10,
      keyword: params?.keyword
    }
  })
  return response.data
}

/**
 * 获取报名详情
 * @param signupId 报名ID
 */
export const fetchSignupDetail = async (signupId: number): Promise<SignupRecord> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const signup = MOCK_SIGNUPS.find(s => s.id === signupId)
    if (!signup) {
      throw new Error('报名记录不存在')
    }

    return applyMockSignupOverride(signup)
  }

  // 真实 API
  const response = await http.get(`/signups/${signupId}`)
  return response.data
}

/**
 * 更新报名表单数据（用于“修改报名信息/完善交通信息/去缴费”流程）
 */
export const updateSignupFormData = async (
  signupId: number,
  data: SignupFormOverride
): Promise<SignupRecord> => {
  if (CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    setMockSignupFormOverride(signupId, data)
    const target = MOCK_SIGNUPS.find(s => s.id === signupId)
    if (!target) {
      throw new Error('报名记录不存在')
    }
    return applyMockSignupOverride(target)
  }

  // 真实 API: 当前后端 schema 为通用 SignupUpdate，先将业务表单数据放入 extra 以兼容落库
  const response = await http.patch(`/signups/${signupId}`, {
    extra: {
      personal: data.personal,
      payment: data.payment,
      accommodation: data.accommodation,
      transport: data.transport,
    },
  })
  return response.data
}

/**
 * 取消报名
 * @param signupId 报名ID
 */
export const cancelSignup = async (signupId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    return
  }

  // 真实 API
  await http.delete(`/signups/${signupId}`)
}
