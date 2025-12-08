from app.models.activity import Activity
from app.models.enums import ActivityStatus
from app.models.user import UserProfile
from app.schemas.engagement import ActivityShareRequest, ActivityCommentCreate
from app.services.engagements import ActivityEngagementService


def setup_activity_user(session):
    activity = Activity(title="互动活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="engage-user", name="互动用户")
    session.add_all([activity, user])
    session.flush()
    return activity, user


def test_favorite_and_like_flow(session):
    activity, user = setup_activity_user(session)
    service = ActivityEngagementService(session)

    summary = service.favorite(activity_id=activity.id, user_id=user.id)
    assert summary.favorites == 1
    assert summary.is_favorited is True

    summary = service.like(activity_id=activity.id, user_id=user.id)
    assert summary.likes == 1
    assert summary.is_liked is True

    summary = service.unfavorite(activity_id=activity.id, user_id=user.id)
    assert summary.favorites == 0
    assert summary.is_favorited is False


def test_share_records_event(session):
    activity, user = setup_activity_user(session)
    service = ActivityEngagementService(session)

    summary = service.share(
        activity_id=activity.id,
        user_id=user.id,
        payload=ActivityShareRequest(channel="wechat"),
    )

    assert summary.shares == 1


def test_user_stats(session):
    activity, user = setup_activity_user(session)
    service = ActivityEngagementService(session)

    service.favorite(activity_id=activity.id, user_id=user.id)
    service.like(activity_id=activity.id, user_id=user.id)
    service.share(activity_id=activity.id, user_id=user.id, payload=ActivityShareRequest(channel=None))
    service.create_comment(activity_id=activity.id, user_id=user.id, payload=ActivityCommentCreate(content="不错"))

    stats = service.get_user_stats(user.id)
    assert stats.favorites == 1
    assert stats.likes == 1
    assert stats.shares == 1
    assert stats.comments == 1
