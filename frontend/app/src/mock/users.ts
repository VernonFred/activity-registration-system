/**
 * 用户 Mock 数据
 */

export interface MockUser {
  id: number
  openid: string
  name: string
  school: string // 学校
  department: string // 部门
  position: string // 职位
  phone: string
  email: string
  avatar: string
  created_at: string
}

export const mockCurrentUser: MockUser = {
  id: 1,
  openid: 'mock_openid_001',
  name: '王小利',
  school: '湖南大学',
  department: '计算机学院',
  position: '副教授',
  phone: '138****8888',
  email: 'wangxiaoli@hnu.edu.cn',
  avatar: 'https://via.placeholder.com/200x200/1B5E20/FFFFFF?text=王',
  created_at: '2023-01-15 10:00:00',
}

