"""Seed sample data for local development."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.activity import Activity
from app.models.enums import ActivityStatus, FieldType, SignupStatus
from app.models.form_field import ActivityFormField, ActivityFormFieldOption
from app.models.signup import Signup, SignupFieldAnswer
from app.models.user import UserProfile
from app.services.auth import AuthService

settings = get_settings()


def seed_users(session):
    users = [
        {
            "openid": "dev-user-001",
            "name": "张老师",
            "mobile": "13800000001",
            "email": "teacher1@example.com",
            "organization": "湖南大学",
            "title": "教务处主任",
        },
        {
            "openid": "dev-user-002",
            "name": "李老师",
            "mobile": "13800000002",
            "email": "teacher2@example.com",
            "organization": "中南大学",
            "title": "讲师",
        },
    ]
    created: dict[str, UserProfile] = {}
    for data in users:
        user = session.execute(
            select(UserProfile).where(UserProfile.openid == data["openid"])
        ).scalar_one_or_none()
        if not user:
            user = UserProfile(**data)
            session.add(user)
            session.flush()
        created[data["openid"]] = user
    return created


def create_form_fields(activity: Activity):
    # 行程安排字段
    trip_fields = [
        (
            "arrival_station",
            "接站点",
            FieldType.SELECT,
            [
                ("长沙黄花国际机场 T2", "airport"),
                ("长沙南站高铁", "south_station"),
                ("长沙火车站", "railway"),
            ],
            True,
        ),
        (
            "arrival_time",
            "到会时间",
            FieldType.DATETIME,
            [],
            True,
        ),
        (
            "arrival_flight",
            "到会车次/航班号",
            FieldType.TEXT,
            [],
            False,
        ),
        (
            "departure_station",
            "送站点",
            FieldType.SELECT,
            [
                ("长沙黄花国际机场 T2", "airport"),
                ("长沙南站高铁", "south_station"),
                ("长沙火车站", "railway"),
            ],
            True,
        ),
        (
            "departure_time",
            "返程时间",
            FieldType.DATETIME,
            [],
            True,
        ),
        (
            "departure_flight",
            "返程车次/航班号",
            FieldType.TEXT,
            [],
            False,
        ),
    ]

    lodging_fields = [
        (
            "lodging_arrangement",
            "住宿安排",
            FieldType.RADIO,
            [("自行安排", "self"), ("会务组安排", "organizer")],
            True,
        ),
        (
            "hotel",
            "入住酒店",
            FieldType.SELECT,
            [
                ("长沙瑞吉酒店", "st_regis"),
                ("长沙北辰洲际酒店", "intercontinental"),
                ("长沙尼依格罗酒店", "niccolo"),
            ],
            True,
        ),
        (
            "lodging_preference",
            "住宿意向",
            FieldType.RADIO,
            [("单住", "single"), ("合住", "shared")],
            True,
        ),
        (
            "room_type",
            "户型",
            FieldType.RADIO,
            [("大床房", "king"), ("标准间", "twin")],
            True,
        ),
    ]

    order = 0
    for name, label, field_type, options, required in trip_fields + lodging_fields:
        field = ActivityFormField(
            name=name,
            label=label,
            field_type=field_type,
            required=required,
            display_order=order,
            visible=True,
        )
        for opt_order, (opt_label, opt_value) in enumerate(options):
            field.options.append(
                ActivityFormFieldOption(
                    label=opt_label,
                    value=opt_value,
                    display_order=opt_order,
                    is_default=opt_order == 0,
                )
            )
        activity.form_fields.append(field)
        order += 1


def seed_activities(session):
    now = datetime.now(timezone.utc)
    activities = [
        {
            "code": "forum-2025-spring",
            "title": "2025 春季高校论坛（长沙站）",
            "city": "长沙",
            "location": "湖南国际会展中心",
            "location_detail": "C2 展厅",
            "contact_name": "王老师",
            "contact_phone": "0731-88888888",
            "status": ActivityStatus.PUBLISHED,
            "start_time": now + timedelta(days=7),
            "end_time": now + timedelta(days=7, hours=6),
            "signup_start_time": now - timedelta(days=1),
            "signup_end_time": now + timedelta(days=5),
            "max_participants": 300,
            "approval_required": True,
            "group_qr_image_url": None,
        },
        {
            "code": "salon-2025-april",
            "title": "高校品牌沙龙·长沙",
            "city": "长沙",
            "location": "岳麓书院会议中心",
            "status": ActivityStatus.SCHEDULED,
            "start_time": now + timedelta(days=20),
            "signup_start_time": now + timedelta(days=5),
            "signup_end_time": now + timedelta(days=18),
            "approval_required": False,
            "max_participants": 80,
        },
        {
            "code": "forum-2024-autumn",
            "title": "2024 秋季论坛回顾",
            "city": "长沙",
            "location": "马栏山创新中心",
            "status": ActivityStatus.ARCHIVED,
            "start_time": now - timedelta(days=120),
            "end_time": now - timedelta(days=119, hours=6),
            "signup_start_time": now - timedelta(days=150),
            "signup_end_time": now - timedelta(days=125),
            "approval_required": True,
            "max_participants": 200,
        },
    ]

    created: dict[str, Activity] = {}
    for data in activities:
        activity = session.execute(
            select(Activity).where(Activity.code == data["code"])
        ).scalar_one_or_none()
        if not activity:
            activity = Activity(**data)
            session.add(activity)
            session.flush()
        if activity.status == ActivityStatus.PUBLISHED and not activity.publish_time:
            activity.publish_time = now
            if not activity.form_fields:
                create_form_fields(activity)
        created[data["code"]] = activity
    session.flush()
    return created


def seed_signups(session, activities: dict[str, Activity], users: dict[str, UserProfile]):
    activity = activities["forum-2025-spring"]
    user = users["dev-user-001"]

    existing = session.execute(
        select(Signup).where(Signup.activity_id == activity.id, Signup.user_id == user.id)
    ).scalar_one_or_none()

    if not existing:
        signup = Signup(
            activity_id=activity.id,
            user_id=user.id,
            status=SignupStatus.APPROVED,
            approval_remark="审核通过，请按时参会",
            approved_at=datetime.now(timezone.utc),
            form_snapshot={"name": user.name, "mobile": user.mobile},
        )
        for field in activity.form_fields:
            value = None
            if field.field_type in {FieldType.SELECT, FieldType.RADIO} and field.options:
                value = field.options[0].value
            signup.answers.append(
                SignupFieldAnswer(
                    field_id=field.id,
                    value_text=value if isinstance(value, str) else None,
                    value_json=None,
                )
            )
        session.add(signup)
    session.flush()


def seed_admin(session):
    auth_service = AuthService(session)
    auth_service.ensure_default_admin("admin", "Admin@123")


def main():
    print(f"Using database: {settings.database_url}")
    session = SessionLocal()
    try:
        seed_admin(session)
        users = seed_users(session)
        activities = seed_activities(session)
        seed_signups(session, activities, users)
        session.commit()
        print("Seeding completed.")
    except Exception as exc:  # pragma: no cover - manual script
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":  # pragma: no cover
    main()
