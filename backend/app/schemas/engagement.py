"""Schemas for activity engagement actions."""

from datetime import datetime
from typing import Optional

from app.schemas.common import ORMModel


class ActivityEngagementSummary(ORMModel):
    activity_id: int
    favorites: int
    likes: int
    shares: int
    comments: int
    is_favorited: bool = False
    is_liked: bool = False


class ActivityShareRequest(ORMModel):
    channel: Optional[str] = None


class ActivityCommentCreate(ORMModel):
    content: str
    parent_id: Optional[int] = None


class ActivityCommentRead(ORMModel):
    id: int
    activity_id: int
    user_id: int
    user_name: Optional[str] = None
    content: str
    parent_id: Optional[int]
    created_at: datetime


class UserEngagementStats(ORMModel):
    user_id: int
    favorites: int
    likes: int
    shares: int
    comments: int


class ActivityFeedItem(ORMModel):
    type: str  # like/favorite/share/comment
    activity_id: int
    user_id: int | None = None
    user_name: str | None = None
    avatar_url: str | None = None
    content: str
    created_at: datetime
