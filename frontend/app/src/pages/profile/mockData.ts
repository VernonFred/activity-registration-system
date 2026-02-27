/**
 * Profile 页面 Mock 数据
 * 创建时间: 2025年12月9日
 */
import type { UserInfo, SignupRecord, Notification, Badge, MentionItem, MyCommentItem } from './types'

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

// 徽章图片 import
import badge初次登场 from '../../assets/badges/初次登场.png'
import badge成功入选 from '../../assets/badges/成功入选.png'
import badge准时到场 from '../../assets/badges/准时到场.png'
import badge全勤达人 from '../../assets/badges/全勤达人.png'
import badge开口有料 from '../../assets/badges/开口有料.png'
import badge金句制造机 from '../../assets/badges/金句制造机.png'
import badge人气发言者 from '../../assets/badges/人气发言者.png'
import badge任务执行者 from '../../assets/badges/任务执行者.png'
import badge连续打卡 from '../../assets/badges/连续打卡.png'
import badge活力不息 from '../../assets/badges/活力不息.png'
import badge徽章收藏家 from '../../assets/badges/徽章收藏家.png'
import badge活动助力官 from '../../assets/badges/活动助力官.png'
import badge活动之星 from '../../assets/badges/活动之星.png'
import badge闪电报名王 from '../../assets/badges/闪电报名王.png'
import badge午夜打卡者 from '../../assets/badges/午夜打卡者.png'
import badge周年纪念章 from '../../assets/badges/周年纪念章.png'
import badge沉默观察员 from '../../assets/badges/沉默观察员.png'

export const mockBadges: Badge[] = [
  // 启程成就
  { id: 1, name: '初次登场', icon_url: badge初次登场, category: 'start', is_earned: true, is_featured: true, earned_at: '2025-12-01', description: '首次报名活动', slogan: '你的第一场活动，正式启程！' },
  { id: 2, name: '成功入选', icon_url: badge成功入选, category: 'start', is_earned: false, description: '需要完成一次报名', slogan: '恭喜加入活动名单' },
  { id: 3, name: '准时到场', icon_url: badge准时到场, category: 'start', is_earned: false, description: '第一次签到成功', slogan: '守时是你的闪光点！' },
  { id: 4, name: '全勤达人', icon_url: badge全勤达人, category: 'start', is_earned: false, description: '报名的所有活动均签到成功', slogan: '全勤出席，完美表现！' },
  // 互动成就
  { id: 5, name: '开口有料', icon_url: badge开口有料, category: 'interact', is_earned: true, earned_at: '2025-12-05', description: '首次评分或发布评论', slogan: '第一次互动，就很精彩！' },
  { id: 6, name: '金句制造机', icon_url: badge金句制造机, category: 'interact', is_earned: false, description: '首次发布长评论或评论被官方精选', slogan: '你的观点，被全场记住！' },
  { id: 7, name: '人气发言者', icon_url: badge人气发言者, category: 'interact', is_earned: false, description: '评论点赞或回复数进入前10%', slogan: '讨论因为你而更热烈！' },
  { id: 8, name: '任务执行者', icon_url: badge任务执行者, category: 'interact', is_earned: false, description: '完成活动测评或调查问卷', slogan: '任务完成，认真态度值得肯定！' },
  { id: 9, name: '连续打卡', icon_url: badge连续打卡, category: 'interact', is_earned: false, description: '连续参与2场及以上活动', slogan: '保持热度，精彩延续！' },
  { id: 10, name: '活力不息', icon_url: badge活力不息, category: 'interact', is_earned: false, description: '连续参与4场活动', slogan: '活力常在，你是活动的常青树！' },
  // 荣誉成就
  { id: 11, name: '徽章收藏家', icon_url: badge徽章收藏家, category: 'honor', is_earned: true, earned_at: '2025-12-10', description: '获得3枚徽章', slogan: '恭喜成为小小收藏家' },
  { id: 12, name: '活动助力官', icon_url: badge活动助力官, category: 'honor', is_earned: false, description: '主动帮助他人报名', slogan: '你的热心，让活动更温暖！' },
  { id: 13, name: '活动之星', icon_url: badge活动之星, category: 'honor', is_earned: false, description: '获得10枚徽章', slogan: '徽章墙上的闪光记忆属于你！' },
  // 隐藏彩蛋
  { id: 14, name: '闪电报名王', icon_url: badge闪电报名王, category: 'easter', is_earned: false, is_hidden: false, description: '报名用时小于5分钟', slogan: '手速无敌，报名第一！' },
  { id: 15, name: '午夜打卡者', icon_url: badge午夜打卡者, category: 'easter', is_earned: false, is_hidden: false, description: '晚上10点之后报名', slogan: '终于想起报名了' },
  { id: 16, name: '周年纪念章', icon_url: badge周年纪念章, category: 'easter', is_earned: false, is_hidden: false, description: '注册满1年自动解锁', slogan: '感谢一路同行，一周年快乐！' },
  { id: 17, name: '沉默观察员', icon_url: badge沉默观察员, category: 'easter', is_earned: false, is_hidden: false, description: '参与2次活动但未发布评论', slogan: '沉默不语，但你始终在场。' },
]

export const mockMentions: MentionItem[] = [
  {
    id: 1,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/100?img=15',
    user_org: '湖南大学信息学院中心主任',
    comment_text: '说得太对了，特别是关于未来AI伦理的部分，非常有启发性！期待下次活动还能有这么深入的讨论。',
    my_original_text: '这次大会的内容质量真的很高，收获满满！主讲嘉宾的分享干货十足...',
    time: '2小时前',
    activity_id: 1,
  },
  {
    id: 2,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/100?img=18',
    user_org: '中南大学信息学院中心主任',
    comment_text: '完全同意！现场的互动环节也做得很好，希望主办方能把PPT分享出来。',
    my_original_text: '这次大会的内容质量真的很高，收获满满！主讲嘉宾的分享干货十足...',
    time: '2小时前',
    activity_id: 1,
  },
  {
    id: 3,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/100?img=15',
    user_org: '湖南大学信息学院中心主任',
    comment_text: '这个观点我不太认同，我觉得AIGC在设计领域的应用还有很长的路要走，目前的模型生成结果还是太模板化了。',
    my_original_text: 'AIGC绝对是未来的趋势，对于设计行业来说是颠覆性的.....',
    time: '2小时前',
    activity_id: 2,
  },
]

export const mockMyComments: MyCommentItem[] = [
  {
    id: 1,
    activity_id: 1,
    activity_category: '论坛',
    activity_title: '高校品牌沙龙·长沙',
    activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
    rating: 3,
    stats: { likes: 103, comments: 67, favorites: 20, shares: 105 },
    comment_text: '这次大会的内容质量真的很高，收获满满！主讲嘉宾的分享干货十足...',
    user_avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 2,
    activity_id: 2,
    activity_category: '论坛',
    activity_title: '高校品牌沙龙·长沙',
    activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
    rating: 3,
    stats: { likes: 103, comments: 67, favorites: 20, shares: 105 },
    comment_text: '这次大会的内容质量真的很高，收获满满！主讲嘉宾的分享干货十足...',
    user_avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 3,
    activity_id: 3,
    activity_category: '论坛',
    activity_title: '高校品牌沙龙·长沙',
    activity_desc: 'It looks great I think it will really make it easier to work with illustrations.',
    rating: 3,
    stats: { likes: 103, comments: 67, favorites: 20, shares: 105 },
    comment_text: '这次大会的内容质量真的很高，收获满满！主讲嘉宾的分享干货十足...',
    user_avatar: 'https://i.pravatar.cc/100?img=12',
  },
]
