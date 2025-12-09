/**
 * 报名列表页 - Mock 数据
 * 创建时间: 2025年12月09日 12:00
 * 
 * 注：此文件用于前端开发阶段，后续对接真实 API 后可删除
 */

import type { ActivityItem } from './types'

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    title: '上海｜沉浸式奔跑赛事，嘟嘟(艺术中心首发）',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    rating: 4.4,
    ratingCount: 532,
    startDate: '2023-03-11',
    endDate: '2023-06-10',
    city: '上海',
    location: 'WWAC奇观艺术中心',
    status: 'started',
    isFree: true,
  },
  {
    id: '2',
    title: '第八届中国高等教育博览会',
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    rating: 4.8,
    ratingCount: 1234,
    startDate: '2023-12-20',
    endDate: '2023-12-22',
    city: '长沙',
    location: '长沙国际会展中心',
    status: 'started',
    isFree: false,
    price: 299,
  },
  {
    id: '3',
    title: '2024全球人工智能开发者大会',
    cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    rating: 4.9,
    ratingCount: 2156,
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    city: '北京',
    location: '国家会议中心',
    status: 'started',
    isFree: false,
    price: 599,
  },
  {
    id: '4',
    title: '春季户外徒步挑战赛',
    cover: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
    rating: 4.6,
    ratingCount: 876,
    startDate: '2024-03-20',
    endDate: '2024-03-21',
    city: '杭州',
    location: '西湖风景区',
    status: 'ended',
    isFree: true,
  },
  {
    id: '5',
    title: '2024数字营销峰会',
    cover: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    rating: 4.3,
    ratingCount: 456,
    startDate: '2024-04-10',
    endDate: '2024-04-12',
    city: '深圳',
    location: '深圳会展中心',
    status: 'postponed',
    isFree: false,
    price: 399,
  },
  {
    id: '6',
    title: '暑期老客户培训会议',
    cover: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=400',
    rating: 4.7,
    ratingCount: 215,
    startDate: '2024-07-15',
    endDate: '2024-07-18',
    city: '长沙',
    location: '喜来登大酒店',
    status: 'started',
    isFree: true,
  },
]

