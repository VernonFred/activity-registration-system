import type { MockActivity } from './activity-types'

export const ongoingActivities: MockActivity[] = [
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

  
]
