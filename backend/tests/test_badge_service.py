import pytest

from app.models.activity import Activity
from app.models.enums import ActivityStatus
from app.models.user import UserProfile
from app.services.badges import BadgeService


@pytest.fixture()
def badge_service(session):
    return BadgeService(session)


def test_award_badge_success(session, badge_service):
    user = UserProfile(openid="user-1", name="测试用户")
    activity = Activity(title="活动", status=ActivityStatus.PUBLISHED)
    session.add_all([user, activity])
    session.flush()

    badge_service.create_badge(code="first_signup", name="首次参会")

    awarded = badge_service.award_badge(
        user_id=user.id,
        badge_code="first_signup",
        activity_id=activity.id,
        notes="欢迎加入",
    )

    assert awarded.user_id == user.id
    assert awarded.badge.code == "first_signup"
    assert awarded.notes == "欢迎加入"

    user_badges = badge_service.list_user_badges(user.id)
    assert len(user_badges) == 1
    assert user_badges[0].badge.code == "first_signup"


def test_award_badge_rejects_duplicates(session, badge_service):
    user = UserProfile(openid="user-dup", name="测试用户2")
    session.add(user)
    session.flush()

    badge_service.create_badge(code="unique_badge", name="唯一徽章")
    badge_service.award_badge(user_id=user.id, badge_code="unique_badge")

    with pytest.raises(ValueError, match="badge_already_awarded"):
        badge_service.award_badge(user_id=user.id, badge_code="unique_badge")


def test_award_badge_checks_status_and_relations(session, badge_service):
    user = UserProfile(openid="inactive", name="已停用用户", is_active=False)
    session.add(user)
    session.flush()

    badge_service.create_badge(code="inactive_badge", name="停用徽章", is_active=False)

    with pytest.raises(ValueError, match="badge_inactive"):
        badge_service.award_badge(user_id=user.id, badge_code="inactive_badge")

    # 激活徽章后验证用户状态
    badge = badge_service.create_badge(code="active_badge", name="正常徽章")
    with pytest.raises(ValueError, match="user_inactive"):
        badge_service.award_badge(user_id=user.id, badge_code=badge.code)

    # 启用用户再测试缺失活动
    user.is_active = True
    session.add(user)
    session.flush()

    with pytest.raises(ValueError, match="activity_not_found"):
        badge_service.award_badge(user_id=user.id, badge_code=badge.code, activity_id=999)


def test_create_badge_rejects_duplicate_code(badge_service):
    badge_service.create_badge(code="dup_code", name="重复")
    with pytest.raises(ValueError, match="badge_code_exists"):
        badge_service.create_badge(code="dup_code", name="再次创建")
