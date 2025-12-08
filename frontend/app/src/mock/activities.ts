/**
 * 活动 Mock 数据
 * 包含：20+ 条活动数据，覆盖各种状态和场景
 */

export interface MockActivity {
  id: number
  title: string
  location: string // 城市
  venue: string // 具体地点
  cover: string // 封面图
  status: 'signup' | 'upcoming' | 'ongoing' | 'finished' // 状态
  start_time: string
  end_time: string
  signup_deadline: string
  is_free: boolean
  rating: number // 评分
  rating_count: number // 评分人数
  signup_count: number // 报名人数
  max_attendees: number // 最大人数
  description: string // 简介
  tags: string[] // 标签
  created_at: string
  article_url?: string // 微信文章链接（已结束的活动）
}

export const mockActivities: MockActivity[] = [
  // === 报名中的活动（5 个，用于热门精选轮播）===
  {
    id: 1,
    title: '第八届中国高等教育博览会',
    location: '长沙',
    venue: '湖南国际会展中心',
    cover: 'https://picsum.photos/seed/event1/750/400',
    status: 'signup',
    start_time: '2024-12-20T09:00:00',
    end_time: '2024-12-22T18:00:00',
    signup_deadline: '2024-12-18T23:59:59',
    is_free: true,
    rating: 4.8,
    rating_count: 532,
    signup_count: 1234,
    max_attendees: 2000,
    description: '汇聚全国高等教育领域的专家学者，共同探讨高等教育改革发展新路径。',
    tags: ['论坛', '高等教育', '学术交流'],
    created_at: '2024-11-20T10:00:00',
  },
  {
    id: 2,
    title: '2024 湘江教育论坛',
    location: '长沙',
    venue: '岳麓书院',
    cover: 'https://picsum.photos/seed/event2/750/400',
    status: 'signup',
    start_time: '2024-12-25T09:00:00',
    end_time: '2024-12-26T18:00:00',
    signup_deadline: '2024-12-23T23:59:59',
    is_free: false,
    rating: 4.6,
    rating_count: 328,
    signup_count: 856,
    max_attendees: 1000,
    description: '聚焦教育创新与人才培养，探讨新时代教育发展新模式。',
    tags: ['论坛', '教育创新', '人才培养'],
    created_at: '2024-11-15T10:00:00',
  },
  {
    id: 3,
    title: '智慧校园建设研讨会',
    location: '上海',
    venue: '上海国际会议中心',
    cover: 'https://picsum.photos/seed/event3/750/400',
    status: 'signup',
    start_time: '2024-12-28T09:00:00',
    end_time: '2024-12-29T18:00:00',
    signup_deadline: '2024-12-26T23:59:59',
    is_free: true,
    rating: 4.7,
    rating_count: 412,
    signup_count: 923,
    max_attendees: 1500,
    description: '探讨信息化时代智慧校园建设的经验与挑战。',
    tags: ['研讨会', '智慧校园', '信息化'],
    created_at: '2024-11-18T10:00:00',
  },
  {
    id: 4,
    title: '新工科教育峰会 2024',
    location: '北京',
    venue: '国家会议中心',
    cover: 'https://picsum.photos/seed/event4/750/400',
    status: 'signup',
    start_time: '2025-01-05T09:00:00',
    end_time: '2025-01-07T18:00:00',
    signup_deadline: '2025-01-03T23:59:59',
    is_free: false,
    rating: 4.9,
    rating_count: 678,
    signup_count: 1567,
    max_attendees: 2500,
    description: '聚焦新工科教育改革，推动工程教育创新发展。',
    tags: ['峰会', '新工科', '工程教育'],
    created_at: '2024-11-22T10:00:00',
  },
  {
    id: 5,
    title: '职业教育创新发展论坛',
    location: '深圳',
    venue: '深圳会展中心',
    cover: 'https://picsum.photos/seed/event5/750/400',
    status: 'signup',
    start_time: '2025-01-10T09:00:00',
    end_time: '2025-01-11T18:00:00',
    signup_deadline: '2025-01-08T23:59:59',
    is_free: true,
    rating: 4.5,
    rating_count: 289,
    signup_count: 645,
    max_attendees: 1200,
    description: '探讨职业教育改革创新路径，促进产教融合发展。',
    tags: ['论坛', '职业教育', '产教融合'],
    created_at: '2024-11-25T10:00:00',
  },

  // === 即将开始的活动（3 个）===
  {
    id: 6,
    title: '高校教师教学能力提升工作坊',
    location: '杭州',
    venue: '浙江大学',
    cover: 'https://picsum.photos/seed/event6/750/400',
    status: 'upcoming',
    start_time: '2025-01-15T09:00:00',
    end_time: '2025-01-16T18:00:00',
    signup_deadline: '2025-01-13T23:59:59',
    is_free: false,
    rating: 4.4,
    rating_count: 156,
    signup_count: 0,
    max_attendees: 500,
    description: '提升高校教师教学能力，分享优秀教学经验。',
    tags: ['工作坊', '教师培训', '教学能力'],
    created_at: '2024-11-28T10:00:00',
  },
  {
    id: 7,
    title: '大学生创新创业大赛',
    location: '成都',
    venue: '四川大学',
    cover: 'https://picsum.photos/seed/event7/750/400',
    status: 'upcoming',
    start_time: '2025-01-20T09:00:00',
    end_time: '2025-01-21T18:00:00',
    signup_deadline: '2025-01-18T23:59:59',
    is_free: true,
    rating: 4.6,
    rating_count: 234,
    signup_count: 0,
    max_attendees: 800,
    description: '激发大学生创新创业热情，展示优秀创业项目。',
    tags: ['大赛', '创新创业', '大学生'],
    created_at: '2024-11-30T10:00:00',
  },
  {
    id: 8,
    title: '教育数字化转型研讨会',
    location: '武汉',
    venue: '武汉光谷国际会展中心',
    cover: 'https://picsum.photos/seed/event8/750/400',
    status: 'upcoming',
    start_time: '2025-01-25T09:00:00',
    end_time: '2025-01-26T18:00:00',
    signup_deadline: '2025-01-23T23:59:59',
    is_free: false,
    rating: 4.7,
    rating_count: 345,
    signup_count: 0,
    max_attendees: 1000,
    description: '探讨教育数字化转型的实践与挑战，分享成功案例。',
    tags: ['研讨会', '数字化', '教育转型'],
    created_at: '2024-12-01T10:00:00',
  },

  // === 进行中的活动（2 个）===
  {
    id: 9,
    title: '全国高校思政课教学改革论坛',
    location: '长沙',
    venue: '湖南师范大学',
    cover: 'https://picsum.photos/seed/event9/750/400',
    status: 'ongoing',
    start_time: '2024-12-01T09:00:00',
    end_time: '2024-12-03T18:00:00',
    signup_deadline: '2024-11-28T23:59:59',
    is_free: true,
    rating: 4.5,
    rating_count: 267,
    signup_count: 654,
    max_attendees: 800,
    description: '推动高校思政课教学改革创新，提升育人质量。',
    tags: ['论坛', '思政课', '教学改革'],
    created_at: '2024-11-10T10:00:00',
  },
  {
    id: 10,
    title: '中国大学生计算机设计大赛',
    location: '上海',
    venue: '上海交通大学',
    cover: 'https://picsum.photos/seed/event10/750/400',
    status: 'ongoing',
    start_time: '2024-12-02T09:00:00',
    end_time: '2024-12-04T18:00:00',
    signup_deadline: '2024-11-29T23:59:59',
    is_free: false,
    rating: 4.8,
    rating_count: 456,
    signup_count: 1123,
    max_attendees: 1500,
    description: '展示大学生计算机应用创新成果，促进学科交流。',
    tags: ['大赛', '计算机', '技能竞赛'],
    created_at: '2024-11-12T10:00:00',
  },

  // === 已结束的活动（10 个，用于历史活动列表）===
  {
    id: 11,
    title: '2024 年全国教育工作会议',
    location: '北京',
    venue: '人民大会堂',
    cover: 'https://picsum.photos/seed/event11/750/400',
    status: 'finished',
    start_time: '2024-11-01T09:00:00',
    end_time: '2024-11-03T18:00:00',
    signup_deadline: '2024-10-29T23:59:59',
    is_free: true,
    rating: 4.9,
    rating_count: 789,
    signup_count: 2345,
    max_attendees: 3000,
    description: '总结全国教育工作经验，部署下一年度教育工作重点。',
    tags: ['会议', '教育政策', '工作部署'],
    created_at: '2024-10-01T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-1',
  },
  {
    id: 12,
    title: '高等教育质量保障体系建设研讨会',
    location: '南京',
    venue: '南京大学',
    cover: 'https://picsum.photos/seed/event12/750/400',
    status: 'finished',
    start_time: '2024-10-15T09:00:00',
    end_time: '2024-10-16T18:00:00',
    signup_deadline: '2024-10-13T23:59:59',
    is_free: false,
    rating: 4.6,
    rating_count: 345,
    signup_count: 876,
    max_attendees: 1000,
    description: '探讨高等教育质量保障体系建设的理论与实践。',
    tags: ['研讨会', '质量保障', '体系建设'],
    created_at: '2024-09-15T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-2',
  },
  {
    id: 13,
    title: '全国大学生数学建模竞赛颁奖典礼',
    location: '天津',
    venue: '天津大学',
    cover: 'https://picsum.photos/seed/event13/750/400',
    status: 'finished',
    start_time: '2024-10-20T14:00:00',
    end_time: '2024-10-20T18:00:00',
    signup_deadline: '2024-10-18T23:59:59',
    is_free: true,
    rating: 4.7,
    rating_count: 567,
    signup_count: 1234,
    max_attendees: 1500,
    description: '表彰全国大学生数学建模竞赛优秀团队和个人。',
    tags: ['颁奖典礼', '数学建模', '大学生竞赛'],
    created_at: '2024-09-20T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-3',
  },
  {
    id: 14,
    title: '中国高校创新创业教育联盟年会',
    location: '深圳',
    venue: '深圳大学',
    cover: 'https://picsum.photos/seed/event14/750/400',
    status: 'finished',
    start_time: '2024-10-25T09:00:00',
    end_time: '2024-10-27T18:00:00',
    signup_deadline: '2024-10-23T23:59:59',
    is_free: false,
    rating: 4.8,
    rating_count: 456,
    signup_count: 1567,
    max_attendees: 2000,
    description: '总结高校创新创业教育成果，交流先进经验。',
    tags: ['年会', '创新创业', '教育联盟'],
    created_at: '2024-09-25T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-4',
  },
  {
    id: 15,
    title: '全国高校辅导员工作研讨会',
    location: '西安',
    venue: '西安交通大学',
    cover: 'https://picsum.photos/seed/event15/750/400',
    status: 'finished',
    start_time: '2024-11-05T09:00:00',
    end_time: '2024-11-06T18:00:00',
    signup_deadline: '2024-11-03T23:59:59',
    is_free: true,
    rating: 4.5,
    rating_count: 234,
    signup_count: 678,
    max_attendees: 800,
    description: '探讨新时代高校辅导员工作的新理念、新方法。',
    tags: ['研讨会', '辅导员', '学生工作'],
    created_at: '2024-10-05T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-5',
  },
  {
    id: 16,
    title: '教育信息化应用成果展',
    location: '广州',
    venue: '广州琶洲会展中心',
    cover: 'https://picsum.photos/seed/event16/750/400',
    status: 'finished',
    start_time: '2024-11-10T09:00:00',
    end_time: '2024-11-12T18:00:00',
    signup_deadline: '2024-11-08T23:59:59',
    is_free: false,
    rating: 4.6,
    rating_count: 389,
    signup_count: 945,
    max_attendees: 1200,
    description: '展示教育信息化应用优秀案例和创新成果。',
    tags: ['成果展', '信息化', '应用案例'],
    created_at: '2024-10-10T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-6',
  },
  {
    id: 17,
    title: '高校图书馆数字化建设论坛',
    location: '杭州',
    venue: '浙江图书馆',
    cover: 'https://picsum.photos/seed/event17/750/400',
    status: 'finished',
    start_time: '2024-11-15T09:00:00',
    end_time: '2024-11-16T18:00:00',
    signup_deadline: '2024-11-13T23:59:59',
    is_free: true,
    rating: 4.4,
    rating_count: 178,
    signup_count: 456,
    max_attendees: 600,
    description: '探讨高校图书馆数字化建设的路径与实践。',
    tags: ['论坛', '图书馆', '数字化建设'],
    created_at: '2024-10-15T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-7',
  },
  {
    id: 18,
    title: '全国大学生英语演讲比赛总决赛',
    location: '上海',
    venue: '复旦大学',
    cover: 'https://picsum.photos/seed/event18/750/400',
    status: 'finished',
    start_time: '2024-11-20T14:00:00',
    end_time: '2024-11-20T18:00:00',
    signup_deadline: '2024-11-18T23:59:59',
    is_free: false,
    rating: 4.7,
    rating_count: 456,
    signup_count: 823,
    max_attendees: 1000,
    description: '展示全国大学生英语演讲风采，促进语言交流。',
    tags: ['比赛', '英语演讲', '大学生'],
    created_at: '2024-10-20T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-8',
  },
  {
    id: 19,
    title: '高校后勤管理创新论坛',
    location: '成都',
    venue: '电子科技大学',
    cover: 'https://picsum.photos/seed/event19/750/400',
    status: 'finished',
    start_time: '2024-11-22T09:00:00',
    end_time: '2024-11-23T18:00:00',
    signup_deadline: '2024-11-20T23:59:59',
    is_free: true,
    rating: 4.3,
    rating_count: 123,
    signup_count: 345,
    max_attendees: 500,
    description: '探讨高校后勤管理创新模式，提升服务质量。',
    tags: ['论坛', '后勤管理', '服务创新'],
    created_at: '2024-10-22T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-9',
  },
  {
    id: 20,
    title: '大学生心理健康教育工作坊',
    location: '武汉',
    venue: '华中师范大学',
    cover: 'https://picsum.photos/seed/event20/750/400',
    status: 'finished',
    start_time: '2024-11-25T09:00:00',
    end_time: '2024-11-26T18:00:00',
    signup_deadline: '2024-11-23T23:59:59',
    is_free: false,
    rating: 4.6,
    rating_count: 267,
    signup_count: 567,
    max_attendees: 700,
    description: '提升大学生心理健康教育工作者的专业能力。',
    tags: ['工作坊', '心理健康', '教育工作'],
    created_at: '2024-10-25T10:00:00',
    article_url: 'https://mp.weixin.qq.com/s/mock-article-10',
  },
]

/**
 * 根据筛选条件获取活动列表
 */
export const getFilteredActivities = (filters: {
  status?: string
  city?: string
  keyword?: string
  page?: number
  per_page?: number
}) => {
  let result = [...mockActivities]

  // 按状态筛选
  if (filters.status && filters.status !== 'all') {
    result = result.filter(a => a.status === filters.status)
  }

  // 按城市筛选
  if (filters.city && filters.city !== 'all') {
    result = result.filter(a => a.location === filters.city)
  }

  // 按关键词搜索
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(
      a =>
        a.title.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword) ||
        a.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 分页
  const page = filters.page || 1
  const per_page = filters.per_page || 10
  const start = (page - 1) * per_page
  const end = start + per_page

  return {
    items: result.slice(start, end),
    total: result.length,
    page,
    per_page,
    has_more: end < result.length,
  }
}

/**
 * 获取热门精选（报名中的活动，取前 5 个）
 */
export const getFeaturedActivities = () => {
  return mockActivities
    .filter(a => a.status === 'signup')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
}

/**
 * 获取历史活动（已结束的活动）
 */
export const getHistoricalActivities = () => {
  return mockActivities
    .filter(a => a.status === 'finished')
    .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
}

/**
 * 根据 ID 获取活动详情
 */
export const getActivityById = (id: number) => {
  return mockActivities.find(a => a.id === id)
}

