import { useEffect } from 'react'
import { fetchCurrentUser } from '../../../services/user'
import { fetchComments as fetchCommentsApi, fetchRating as fetchRatingApi } from '../../../services/comments'
import { DEFAULT_AVATAR } from '../constants'
import type { Comment, Rating } from '../types'
import { mapApiCommentToPageComment } from '../utils'

interface BootstrapHandlers {
  setCurrentUser: (updater: any) => void
  setRating: (updater: any) => void
  setComments: (updater: any) => void
}

export function useCommentPageBootstrap(activityId: number, handlers: BootstrapHandlers) {
  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [userRes, ratingRes, commentsRes] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          activityId ? fetchRatingApi(activityId).catch(() => null) : Promise.resolve(null),
          activityId ? fetchCommentsApi(activityId, { page: 1, per_page: 50, sort_by: 'newest' }).catch(() => null) : Promise.resolve(null),
        ])

        if (!active) return

        if (userRes) {
          handlers.setCurrentUser({
            id: userRes.id,
            name: userRes.name,
            avatar: userRes.avatar || DEFAULT_AVATAR,
            organization: [userRes.school, userRes.department].filter(Boolean).join(''),
          })
        }
        if (ratingRes) {
          handlers.setRating((prev: Rating) => ({ ...prev, ...ratingRes }))
        }
        if (commentsRes?.items) {
          handlers.setComments(commentsRes.items.map(mapApiCommentToPageComment) as Comment[])
        }
      } catch (error) {
        console.error('加载评论页数据失败，使用本地Mock:', error)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [activityId, handlers])
}
