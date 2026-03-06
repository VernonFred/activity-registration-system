export interface Comment {
  id: number
  user: {
    id: number
    name: string
    avatar?: string
  }
  rating: number
  content: string
  images?: string[]
  created_at: string
  like_count: number
  reply_count: number
  is_liked: boolean
  replies?: CommentReply[]
}

export interface CommentReply {
  id: number
  comment_id: number
  user: {
    id: number
    name: string
    avatar?: string
  }
  content: string
  created_at: string
  reply_to?: {
    id: number
    name: string
  }
}

export interface Rating {
  average: number
  total_count: number
  user_rating?: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface CommentsResponse {
  items: Comment[]
  total: number
  page: number
  per_page: number
  avg_rating?: number
}
