/**
 * Profile 页面 Mock 数据
 * 创建时间: 2025年12月9日
 */
import type { UserInfo, SignupRecord, Notification, Badge } from './types'

export const mockUserData: UserInfo = {
  id: 1,
  name: '王小利',
  avatar_url: 'https://i.pravatar.cc/100?img=12',
  organization: '湖南大学信息学院中心',
  title: '主任',
  bio: '这个用户很懒，还没填写个人简介',
}

export const mockSignups: SignupRecord[] = [
  {
    id: 1,
    activity_id: 1,
    activity_title: '高校品牌沙龙·长沙',
    activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
    activity_date: '2025-11-10',
    status: 'approved',
    checkin_status: 'not_checked_in',
    payment_status: 'paid',
    likes: 103,
    comments: 67,
    favorites: 20,
    shares: 105,
    companions: [
      { id: 1, name: '张小三' },
      { id: 2, name: '张小三' },
    ],
  },
  {
    id: 2,
    activity_id: 2,
    activity_title: '春季学术研讨会',
    activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
    activity_date: '2025-04-15',
    activity_location: '北京 | 北京大学',
    status: 'approved',
    checkin_status: 'not_checked_in',
    payment_status: 'unpaid',
    likes: 103,
    comments: 0,
    favorites: 11,
    shares: 33,
    companions: [
      { id: 3, name: '王小利' },
      { id: 4, name: '张小三' },
    ],
  },
  {
    id: 3,
    activity_id: 3,
    activity_title: '冬季教学创新论坛',
    activity_desc: '广州 | 华南师范大学',
    activity_date: '2025-12-05',
    status: 'approved',
    checkin_status: 'checked_in',
    payment_status: 'paid',
    transport_completed: true,
    likes: 55,
    comments: 12,
    favorites: 9,
    shares: 20,
    companions: [],
  },
  {
    id: 4,
    activity_id: 4,
    activity_title: '春季产教融合交流会',
    activity_desc: '成都 | 四川大学',
    activity_date: '2026-03-15',
    status: 'approved',
    checkin_status: 'not_checked_in',
    payment_status: 'unpaid',
    likes: 18,
    comments: 4,
    favorites: 3,
    shares: 7,
    companions: [],
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: '报名成功',
    content: '您的「暑期培训会议」已经报名成功，请准时参加。',
    time: '1小时前',
    is_new: true,
  },
  {
    id: 2,
    type: 'info',
    title: '填写调查问卷',
    content: '「暑期培训会议」已经圆满结束，期待您的真诚建议与反馈。',
    time: '1小时前',
    is_new: true,
    action_url: '/pages/survey/index',
    action_text: '去填写',
  },
  {
    id: 3,
    type: 'warning',
    title: '还未缴费',
    content: '您的「暑期培训会议」还未缴费，请及时缴费。',
    time: '2小时前',
    is_new: false,
  },
  {
    id: 4,
    type: 'badge',
    title: '荣获勋章',
    content: '恭喜您解锁「一周年」勋章',
    time: '2小时前',
    is_new: false,
    action_url: '/pages/badges/index',
    action_text: '查看勋章',
  },
]

export const mockBadges: Badge[] = [
  { id: 1, name: '周年纪念章', icon_url: 'https://example.com/badge1.png', category: '启程成就', is_earned: true },
  { id: 2, name: '午夜打卡者', icon_url: 'https://example.com/badge2.png', category: '互动成就', is_earned: true },
  { id: 3, name: '周年纪念章', icon_url: 'https://example.com/badge1.png', category: '启程成就', is_earned: true },
  { id: 4, name: '午夜打卡者', icon_url: 'https://example.com/badge2.png', category: '互动成就', is_earned: false },
]
