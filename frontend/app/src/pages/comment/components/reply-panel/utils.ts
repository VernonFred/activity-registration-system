import type { Reply } from '../../types'

export interface ReplyLikeState {
  liked: boolean
  disliked: boolean
  count: number
}

export const deleteReplyRecursive = (replies: Reply[], targetId: number): Reply[] => (
  replies
    .filter((reply) => reply.id !== targetId)
    .map((reply) => ({
      ...reply,
      replies: reply.replies ? deleteReplyRecursive(reply.replies, targetId) : undefined,
    }))
)

export const updateReplyRecursive = (replies: Reply[], targetId: number, newContent: string): Reply[] => (
  replies.map((reply) => {
    if (reply.id === targetId) {
      return { ...reply, content: newContent }
    }
    return {
      ...reply,
      replies: reply.replies ? updateReplyRecursive(reply.replies, targetId, newContent) : undefined,
    }
  })
)

export const getReplyLikeState = (
  reply: Reply,
  replyLikeStates: Record<number, ReplyLikeState>,
): ReplyLikeState => replyLikeStates[reply.id] || {
  liked: reply.is_liked || false,
  disliked: false,
  count: reply.like_count || 0,
}
