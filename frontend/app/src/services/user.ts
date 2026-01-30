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
    status: 'pending',
    created_at: '2026-01-03T16:30:00Z',
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
    }
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
    status: 'rejected',
    created_at: '2025-12-20T10:00:00Z',
    reviewed_at: '2025-12-22T15:30:00Z',
    personal: {
      name: '张三',
      phone: '13800138000',
      school: '清华大学',
      department: '计算机科学与技术学院',
      position: '研究生'
    },
    rejection_reason: '该活动已达到报名上限'
  }
]

// ============================================================
// API 方法
// ============================================================

/**
 * 获取当前用户信息
 */
export const fetchCurrentUser = async (): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_USER
  }

  // 真实 API
  const response = await http.get('/users/me')
  return response.data
}

/**
 * 更新用户信息
 * @param data 用户数据
 */
export const updateUser = async (data: Partial<User>): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      ...MOCK_USER,
      ...data
    }
  }

  // 真实 API
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

    let signups = [...MOCK_SIGNUPS]

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

    return signup
  }

  // 真实 API
  const response = await http.get(`/signups/${signupId}`)
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
