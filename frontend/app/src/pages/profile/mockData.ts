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
  // 启程成就
  { id: 1, name: '初次登场', icon_url: '', category: 'start', is_earned: true, is_featured: true, earned_at: '2025-12-01' },
  { id: 2, name: '成功入选', icon_url: '', category: 'start', is_earned: false, description: '需要完成一次报名' },
  { id: 3, name: '准时到场', icon_url: '', category: 'start', is_earned: false, description: '第一次签到成功' },
  { id: 4, name: '全勤达人', icon_url: '', category: 'start', is_earned: false, description: '连续参与3场活动全勤' },
  // 互动成就
  { id: 5, name: '开口有料', icon_url: '', category: 'interact', is_earned: true, earned_at: '2025-12-05' },
  { id: 6, name: '金句制造机', icon_url: '', category: 'interact', is_earned: false, description: '首次发布长评论或者评论被官方精选' },
  { id: 7, name: '人气发言者', icon_url: '', category: 'interact', is_earned: false },
  { id: 8, name: '任务执行者', icon_url: '', category: 'interact', is_earned: false, description: '完成活动测评或调查问卷' },
  { id: 9, name: '连续打卡', icon_url: '', category: 'interact', is_earned: false, description: '连续参与2场及以上活动' },
  { id: 10, name: '活力不息', icon_url: '', category: 'interact', is_earned: false, description: '连续参与4场活动' },
  // 荣誉成就
  { id: 11, name: '徽章收藏家', icon_url: '', category: 'honor', is_earned: true, earned_at: '2025-12-10', description: '获得3枚徽章' },
  { id: 12, name: '活动助力官', icon_url: '', category: 'honor', is_earned: false, description: '主动帮助他人报名' },
  { id: 13, name: '活动之星', icon_url: '', category: 'honor', is_earned: false, description: '获得10枚徽章' },
  // 隐藏彩蛋
  { id: 14, name: '闪电报名王', icon_url: '', category: 'easter', is_earned: false, is_hidden: false, description: '报名用时小于5分钟' },
  { id: 15, name: '午夜打卡者', icon_url: '', category: 'easter', is_earned: false, is_hidden: false, description: '晚上10点之后报名' },
  { id: 16, name: '周年纪念章', icon_url: '', category: 'easter', is_earned: false, is_hidden: false, description: '注册满1年自动解锁' },
  { id: 17, name: '沉默观察员', icon_url: '', category: 'easter', is_earned: false, is_hidden: false, description: '参与2次活动但未发布评论' },
]
