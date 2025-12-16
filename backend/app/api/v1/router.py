"""Primary router for API v1."""

from fastapi import APIRouter

from app.api.v1.endpoints import activities, auth, badges, notifications, signups, feedbacks, audit_logs, reports, engagements, users, badge_rules, scheduler, registrations, wechat

api_router = APIRouter()
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(signups.router, prefix="/signups", tags=["signups"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(wechat.router, prefix="/wechat", tags=["wechat"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(badges.router, prefix="/badges", tags=["badges"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(feedbacks.router, tags=["feedbacks"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(engagements.router, prefix="/activities", tags=["activities"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(badge_rules.router, prefix="/badge-rules", tags=["badges"])
api_router.include_router(scheduler.router, prefix="/scheduler", tags=["scheduler"])
