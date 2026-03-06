import Taro from '@tarojs/taro'
import type { Comment, Rating } from './comments-types'

// ============================================================
// Mock 数据
// ============================================================

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: '张三',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    rating: 5,
    content: '活动非常精彩，组织得很好，学到了很多东西！会议议程安排合理，讲师水平都很高。酒店环境也不错，推荐大家参加！',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'],
    created_at: '2026-01-05T14:30:00Z',
    like_count: 28,
    reply_count: 3,
    is_liked: false,
    replies: [
      {
        id: 11,
        comment_id: 1,
        user: {
          id: 2,
          name: '李四'
        },
        content: '同感！这次活动确实很棒',
        created_at: '2026-01-05T15:20:00Z'
      },
      {
        id: 12,
        comment_id: 1,
        user: {
          id: 3,
          name: '王五'
        },
        content: '请问您是参加哪个分论坛的？',
        created_at: '2026-01-05T16:10:00Z',
        reply_to: {
          id: 1,
          name: '张三'
        }
      }
    ]
  },
  {
    id: 2,
    user: {
      id: 4,
      name: '李明',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    rating: 4,
    content: '整体不错，就是会场有点挤。建议下次可以考虑更大的场地。',
    created_at: '2026-01-04T10:15:00Z',
    like_count: 15,
    reply_count: 1,
    is_liked: true
  },
  {
    id: 3,
    user: {
      id: 5,
      name: '王芳',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    rating: 5,
    content: '非常值得参加的活动！',
    created_at: '2026-01-03T18:45:00Z',
    like_count: 42,
    reply_count: 0,
    is_liked: false
  },
  {
    id: 4,
    user: {
      id: 6,
      name: '赵强',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    rating: 5,
    content: '收获满满，期待下次活动！',
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400'
    ],
    created_at: '2026-01-02T20:30:00Z',
    like_count: 8,
    reply_count: 0,
    is_liked: false
  }
]

const MOCK_COMMENTS_BY_ACTIVITY_KEY = 'mock_comments_by_activity'

type MockCommentsByActivity = Record<string, Comment[]>

const getMockCommentsByActivity = (): MockCommentsByActivity => {
  try {
    const raw = Taro.getStorageSync(MOCK_COMMENTS_BY_ACTIVITY_KEY)
    if (!raw) return {}
    if (typeof raw === 'string') return JSON.parse(raw)
    return raw as MockCommentsByActivity
  } catch (error) {
    console.error('读取评论Mock缓存失败:', error)
    return {}
  }
}

const setMockCommentsByActivity = (data: MockCommentsByActivity) => {
  try {
    Taro.setStorageSync(MOCK_COMMENTS_BY_ACTIVITY_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('写入评论Mock缓存失败:', error)
  }
}

const getMockCommentsForActivity = (activityId: number): Comment[] => {
  const cache = getMockCommentsByActivity()
  const key = String(activityId)
  if (!cache[key]) {
    cache[key] = MOCK_COMMENTS.map((item, index) => ({
      ...item,
      id: activityId * 10000 + index + 1
    }))
    setMockCommentsByActivity(cache)
  }
  return cache[key]
}

const MOCK_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: 0,
  distribution: {
    5: 98,
    4: 20,
    3: 6,
    2: 2,
    1: 2
  }
}

export { getMockCommentsByActivity, getMockCommentsForActivity, MOCK_RATING, setMockCommentsByActivity }
