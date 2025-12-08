"""Repositories for activity engagement actions and comments."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.activity_engagement import (
    ActivityComment,
    ActivityFavorite,
    ActivityLike,
    ActivityShare,
)


class ActivityEngagementRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    # Favorites
    def is_favorited(self, *, activity_id: int, user_id: int) -> bool:
        query = select(ActivityFavorite).where(
            ActivityFavorite.activity_id == activity_id,
            ActivityFavorite.user_id == user_id,
        )
        return self.session.execute(query).scalar_one_or_none() is not None

    def add_favorite(self, *, activity_id: int, user_id: int) -> ActivityFavorite:
        favorite = ActivityFavorite(activity_id=activity_id, user_id=user_id)
        try:
            self.session.add(favorite)
            self.session.flush()
        except IntegrityError:
            self.session.rollback()
            favorite = self.session.execute(
                select(ActivityFavorite).where(
                    ActivityFavorite.activity_id == activity_id,
                    ActivityFavorite.user_id == user_id,
                )
            ).scalar_one()
        return favorite

    def remove_favorite(self, *, activity_id: int, user_id: int) -> bool:
        favorite = self.session.execute(
            select(ActivityFavorite).where(
                ActivityFavorite.activity_id == activity_id,
                ActivityFavorite.user_id == user_id,
            )
        ).scalar_one_or_none()
        if not favorite:
            return False
        self.session.delete(favorite)
        self.session.flush()
        return True

    def favorite_count(self, activity_id: int) -> int:
        return self.session.execute(
            select(func.count()).select_from(ActivityFavorite).where(ActivityFavorite.activity_id == activity_id)
        ).scalar_one()

    # Likes
    def is_liked(self, *, activity_id: int, user_id: int) -> bool:
        query = select(ActivityLike).where(
            ActivityLike.activity_id == activity_id,
            ActivityLike.user_id == user_id,
        )
        return self.session.execute(query).scalar_one_or_none() is not None

    def add_like(self, *, activity_id: int, user_id: int) -> ActivityLike:
        like = ActivityLike(activity_id=activity_id, user_id=user_id)
        try:
            self.session.add(like)
            self.session.flush()
        except IntegrityError:
            self.session.rollback()
            like = self.session.execute(
                select(ActivityLike).where(
                    ActivityLike.activity_id == activity_id,
                    ActivityLike.user_id == user_id,
                )
            ).scalar_one()
        return like

    def remove_like(self, *, activity_id: int, user_id: int) -> bool:
        like = self.session.execute(
            select(ActivityLike).where(
                ActivityLike.activity_id == activity_id,
                ActivityLike.user_id == user_id,
            )
        ).scalar_one_or_none()
        if not like:
            return False
        self.session.delete(like)
        self.session.flush()
        return True

    def like_count(self, activity_id: int) -> int:
        return self.session.execute(
            select(func.count()).select_from(ActivityLike).where(ActivityLike.activity_id == activity_id)
        ).scalar_one()

    # Shares
    def add_share(self, *, activity_id: int, user_id: Optional[int], channel: Optional[str]) -> ActivityShare:
        share = ActivityShare(activity_id=activity_id, user_id=user_id, channel=channel)
        self.session.add(share)
        self.session.flush()
        return share

    def share_count(self, activity_id: int) -> int:
        return self.session.execute(
            select(func.count()).select_from(ActivityShare).where(ActivityShare.activity_id == activity_id)
        ).scalar_one()

    def list_shares(self, *, activity_id: int) -> Sequence[ActivityShare]:
        query = self.session.execute(
            select(ActivityShare)
            .options(selectinload(ActivityShare.user))
            .where(ActivityShare.activity_id == activity_id)
            .order_by(ActivityShare.created_at.desc())
        )
        return query.scalars().all()

    def user_stats(self, user_id: int) -> dict[str, int]:
        favorites = self.session.execute(
            select(func.count()).select_from(ActivityFavorite).where(ActivityFavorite.user_id == user_id)
        ).scalar_one()
        likes = self.session.execute(
            select(func.count()).select_from(ActivityLike).where(ActivityLike.user_id == user_id)
        ).scalar_one()
        shares = self.session.execute(
            select(func.count()).select_from(ActivityShare).where(ActivityShare.user_id == user_id)
        ).scalar_one()
        comments = self.session.execute(
            select(func.count()).select_from(ActivityComment).where(ActivityComment.user_id == user_id)
        ).scalar_one()
        return {
            "favorites": favorites,
            "likes": likes,
            "shares": shares,
            "comments": comments,
        }

    def engagement_summary(self, activity_id: int) -> dict[str, int]:
        return {
            "favorites": self.favorite_count(activity_id),
            "likes": self.like_count(activity_id),
            "shares": self.share_count(activity_id),
            "comments": self.session.execute(
                select(func.count()).select_from(ActivityComment).where(ActivityComment.activity_id == activity_id)
            ).scalar_one(),
        }

    def user_activity_metrics(self, *, activity_id: int, user_id: int) -> dict[str, int | bool]:
        return {
            "is_favorited": self.is_favorited(activity_id=activity_id, user_id=user_id),
            "is_liked": self.is_liked(activity_id=activity_id, user_id=user_id),
            "share_count": self.session.execute(
                select(func.count())
                .select_from(ActivityShare)
                .where(ActivityShare.activity_id == activity_id, ActivityShare.user_id == user_id)
            ).scalar_one(),
            "comment_count": self.session.execute(
                select(func.count())
                .select_from(ActivityComment)
                .where(ActivityComment.activity_id == activity_id, ActivityComment.user_id == user_id)
            ).scalar_one(),
        }

    def overall_counts(self) -> dict[str, int]:
        favorites = self.session.execute(select(func.count()).select_from(ActivityFavorite)).scalar_one()
        likes = self.session.execute(select(func.count()).select_from(ActivityLike)).scalar_one()
        shares = self.session.execute(select(func.count()).select_from(ActivityShare)).scalar_one()
        comments = self.session.execute(select(func.count()).select_from(ActivityComment)).scalar_one()
        return {
            "favorites": favorites,
            "likes": likes,
            "shares": shares,
            "comments": comments,
        }

    # Recent feed composed from likes/favorites/shares/comments
    def recent_feed(self, *, activity_id: int, limit: int = 20) -> list[dict]:
        likes = self.session.execute(
            select(ActivityLike)
            .options(selectinload(ActivityLike.user))
            .where(ActivityLike.activity_id == activity_id)
            .order_by(ActivityLike.created_at.desc())
            .limit(limit)
        ).scalars().all()
        favorites = self.session.execute(
            select(ActivityFavorite)
            .options(selectinload(ActivityFavorite.user))
            .where(ActivityFavorite.activity_id == activity_id)
            .order_by(ActivityFavorite.created_at.desc())
            .limit(limit)
        ).scalars().all()
        shares = self.session.execute(
            select(ActivityShare)
            .options(selectinload(ActivityShare.user))
            .where(ActivityShare.activity_id == activity_id)
            .order_by(ActivityShare.created_at.desc())
            .limit(limit)
        ).scalars().all()
        comments = self.session.execute(
            select(ActivityComment)
            .options(selectinload(ActivityComment.user))
            .where(ActivityComment.activity_id == activity_id, ActivityComment.deleted_at.is_(None))
            .order_by(ActivityComment.created_at.desc())
            .limit(limit)
        ).scalars().all()

        entries: list[tuple] = []
        for row in likes:
            entries.append((row.created_at, {
                "type": "like",
                "activity_id": row.activity_id,
                "user_id": row.user_id,
                "user_name": row.user.name if row.user else None,
                "avatar_url": row.user.avatar_url if row.user else None,
                "content": "点赞了该活动",
                "created_at": row.created_at,
            }))
        for row in favorites:
            entries.append((row.created_at, {
                "type": "favorite",
                "activity_id": row.activity_id,
                "user_id": row.user_id,
                "user_name": row.user.name if row.user else None,
                "avatar_url": row.user.avatar_url if row.user else None,
                "content": "收藏了该活动",
                "created_at": row.created_at,
            }))
        for row in shares:
            entries.append((row.created_at, {
                "type": "share",
                "activity_id": row.activity_id,
                "user_id": row.user_id,
                "user_name": row.user.name if row.user else None,
                "avatar_url": row.user.avatar_url if row.user else None,
                "content": f"分享了活动（{row.channel or '未标明渠道'}）",
                "created_at": row.created_at,
            }))
        for row in comments:
            entries.append((row.created_at, {
                "type": "comment",
                "activity_id": row.activity_id,
                "user_id": row.user_id,
                "user_name": row.user.name if row.user else None,
                "avatar_url": row.user.avatar_url if row.user else None,
                "content": row.content,
                "created_at": row.created_at,
            }))

        # sort and limit
        entries.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in entries[:limit]]


class ActivityCommentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, payload: dict) -> ActivityComment:
        comment = ActivityComment(**payload)
        self.session.add(comment)
        self.session.flush()
        return comment

    def list(self, *, activity_id: int, limit: int, offset: int) -> Sequence[ActivityComment]:
        query = (
            select(ActivityComment)
            .options(selectinload(ActivityComment.user))
            .where(ActivityComment.activity_id == activity_id, ActivityComment.deleted_at.is_(None))
            .order_by(ActivityComment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return self.session.execute(query).scalars().all()

    def list_all(self, activity_id: int) -> Sequence[ActivityComment]:
        query = (
            select(ActivityComment)
            .options(selectinload(ActivityComment.user))
            .where(ActivityComment.activity_id == activity_id, ActivityComment.deleted_at.is_(None))
            .order_by(ActivityComment.created_at.desc())
        )
        return self.session.execute(query).scalars().all()

    def get(self, comment_id: int) -> ActivityComment | None:
        return self.session.execute(select(ActivityComment).where(ActivityComment.id == comment_id)).scalar_one_or_none()

    def delete(self, comment: ActivityComment) -> None:
        self.session.delete(comment)
        self.session.flush()
