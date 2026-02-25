/**
 * 我的活动列表 - Mock 数据
 * 参考设计稿: 小程序端设计/我的-活动列表.png
 */

import type { ActivityItem } from './types'

export const mockMyActivities: ActivityItem[] = [
  {
    id: '1',
    title: '高校品牌沙龙·长沙',
    description: 'It looks great I think it will really make it easier to work with illustrations.',
    date: '2025-11-10',
    status: 'registered',
    likes: 103,
    comments: 67,
    favorites: 20,
    shares: 105,
    participants: [
      {
        id: 'p1',
        name: '王小利',
        isPrimary: true,
        paymentStatus: 'paid',
        checkinStatus: 'checked',
        needsTransportInfo: true,
      },
      {
        id: 'p2',
        name: '张小三',
        isPrimary: false,
        paymentStatus: 'paid',
        checkinStatus: 'checked',
        needsTransportInfo: false,
      },
      {
        id: 'p3',
        name: '张小三',
        isPrimary: false,
        paymentStatus: 'unpaid',
        checkinStatus: 'unchecked',
        needsTransportInfo: false,
      },
    ],
  },
  {
    id: '2',
    title: '高校品牌沙龙·长沙',
    description: 'It looks great I think it will really make it easier to work with illustrations.',
    date: '2025-11-10',
    status: 'participated',
    likes: 103,
    comments: 67,
    favorites: 20,
    shares: 105,
    participants: [
      {
        id: 'p1',
        name: '王小利',
        isPrimary: true,
        paymentStatus: 'paid',
        checkinStatus: 'checked',
        needsTransportInfo: false,
      },
      {
        id: 'p2',
        name: '张小三',
        isPrimary: false,
        paymentStatus: 'paid',
        checkinStatus: 'checked',
        needsTransportInfo: false,
      },
    ],
  },
]
