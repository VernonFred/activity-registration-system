"""Service layer for activity engagement actions and comments."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.activity_engagement import ActivityComment
from app.repositories.engagements import ActivityCommentRepository, ActivityEngagementRepository
from app.schemas.engagement import (
    ActivityCommentCreate,
    ActivityCommentRead,
    ActivityEngagementSummary,
    ActivityFeedItem,
    ActivityShareRequest,
    UserEngagementStats,
)


class ActivityEngagementService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = ActivityEngagementRepository(session)
        self.comments_repo = ActivityCommentRepository(session)

    # Favorites and likes
    def favorite(self, *, activity_id: int, user_id: int) -> ActivityEngagementSummary:
        self.repo.add_favorite(activity_id=activity_id, user_id=user_id)
        self.session.commit()
        return self.get_summary(activity_id, user_id=user_id)

    def unfavorite(self, *, activity_id: int, user_id: int) -> ActivityEngagementSummary:
        self.repo.remove_favorite(activity_id=activity_id, user_id=user_id)
        self.session.commit()
        return self.get_summary(activity_id, user_id=user_id)

    def like(self, *, activity_id: int, user_id: int) -> ActivityEngagementSummary:
        self.repo.add_like(activity_id=activity_id, user_id=user_id)
        self.session.commit()
        return self.get_summary(activity_id, user_id=user_id)

    def unlike(self, *, activity_id: int, user_id: int) -> ActivityEngagementSummary:
        self.repo.remove_like(activity_id=activity_id, user_id=user_id)
        self.session.commit()
        return self.get_summary(activity_id, user_id=user_id)

    def share(self, *, activity_id: int, user_id: Optional[int], payload: ActivityShareRequest) -> ActivityEngagementSummary:
        self.repo.add_share(activity_id=activity_id, user_id=user_id, channel=payload.channel)
        self.session.commit()
        return self.get_summary(activity_id, user_id=user_id)

    def get_summary(self, activity_id: int, *, user_id: Optional[int]) -> ActivityEngagementSummary:
        counts = self.repo.engagement_summary(activity_id)
        user_state = {
            "is_favorited": False,
            "is_liked": False,
        }
        if user_id is not None:
            user_state["is_favorited"] = self.repo.is_favorited(activity_id=activity_id, user_id=user_id)
            user_state["is_liked"] = self.repo.is_liked(activity_id=activity_id, user_id=user_id)
        return ActivityEngagementSummary(
            activity_id=activity_id,
            favorites=counts["favorites"],
            likes=counts["likes"],
            shares=counts["shares"],
            comments=counts["comments"],
            is_favorited=user_state["is_favorited"],
            is_liked=user_state["is_liked"],
        )

    def get_user_stats(self, user_id: int) -> UserEngagementStats:
        stats = self.repo.user_stats(user_id)
        return UserEngagementStats(user_id=user_id, **stats)

    def recent_feed(self, *, activity_id: int, limit: int = 20) -> list[ActivityFeedItem]:
        data = self.repo.recent_feed(activity_id=activity_id, limit=limit)
        return [ActivityFeedItem(**item) for item in data]

    # Comments
    def list_comments(self, *, activity_id: int, limit: int, offset: int) -> Sequence[ActivityCommentRead]:
        comments = self.comments_repo.list(activity_id=activity_id, limit=limit, offset=offset)
        return [self._to_comment_schema(comment) for comment in comments]

    def create_comment(
        self,
        *,
        activity_id: int,
        user_id: int,
        payload: ActivityCommentCreate,
    ) -> ActivityCommentRead:
        comment = self.comments_repo.create(
            {
                "activity_id": activity_id,
                "user_id": user_id,
                "content": payload.content,
                "parent_id": payload.parent_id,
            }
        )
        self.session.commit()
        self.session.refresh(comment)
        return self._to_comment_schema(comment)

    def delete_comment(
        self,
        *,
        comment_id: int,
        actor_user_id: Optional[int],
        actor_admin_id: Optional[int],
    ) -> bool:
        comment = self.comments_repo.get(comment_id)
        if not comment:
            return False
        if actor_admin_id is None and actor_user_id is None:
            return False
        if actor_admin_id is None and comment.user_id != actor_user_id:
            return False
        self.comments_repo.delete(comment)
        self.session.commit()
        return True

    def _to_comment_schema(self, comment: ActivityComment) -> ActivityCommentRead:
        user = comment.user
        return ActivityCommentRead(
            id=comment.id,
            activity_id=comment.activity_id,
            user_id=comment.user_id,
            user_name=user.name if user else None,
            content=comment.content,
            parent_id=comment.parent_id,
            created_at=comment.created_at,
        )
