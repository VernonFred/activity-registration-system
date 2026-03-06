import type { Comment, Rating } from '../../types'

export const DEFAULT_CURRENT_USER = {
  id: 1,
  name: '王小利',
  avatar: 'https://i.pravatar.cc/150?img=12',
  organization: '湖南大学信息学院中心',
  title: '主任',
}

export const DEFAULT_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: undefined,
  distribution: {
    5: 98,
    4: 20,
    3: 6,
    2: 2,
    1: 2,
  },
}

export const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 1,
    user_name: '张三',
    user_avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    content: '活动非常精彩，组织得很好，学到了很多东西！会议议程安排合理，讲师水平都很高。酒店环境也不错，推荐大家参加！',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'],
    created_at: '2026-01-05 14:30:00',
    like_count: 28,
    reply_count: 3,
    is_liked: false,
    replies: [
      {
        id: 11,
        comment_id: 1,
        user_name: '李四',
        content: '同感！这次活动确实很棒',
        created_at: '2026-01-05 15:20:00',
      },
      {
        id: 12,
        comment_id: 1,
        user_name: '王五',
        reply_to: '张三',
        content: '请问您是参加哪个分论坛的？',
        created_at: '2026-01-05 16:10:00',
      },
    ],
  },
  {
    id: 2,
    user_name: '李明',
    user_avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    content: '整体不错，就是会场有点挤。建议下次可以考虑更大的场地。',
    created_at: '2026-01-04 10:15:00',
    like_count: 15,
    reply_count: 1,
    is_liked: true,
    replies: [],
  },
  {
    id: 3,
    user_name: '王芳',
    user_avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    content: '非常值得参加的活动！',
    created_at: '2026-01-03 18:45:00',
    like_count: 42,
    reply_count: 0,
    is_liked: false,
    replies: [],
  },
  {
    id: 4,
    user_name: '赵强',
    user_avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    content: '收获满满，期待下次活动！',
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    ],
    created_at: '2026-01-02 20:30:00',
    like_count: 8,
    reply_count: 0,
    is_liked: false,
    replies: [],
  },
]
