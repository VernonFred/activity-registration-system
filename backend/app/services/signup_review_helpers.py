from __future__ import annotations

from datetime import datetime, timezone

from app.models.enums import AuditAction, AuditEntity, NotificationChannel, NotificationEvent, SignupStatus
from app.schemas.signup import BulkReviewResult


def apply_review_decision(signup, *, action: str, message: str | None, admin_id: int):
    now = datetime.now(timezone.utc)
    if action == "approve":
        signup.status = SignupStatus.APPROVED
        signup.approval_remark = message
        signup.rejection_reason = None
        signup.approved_at = now
        event = NotificationEvent.SIGNUP_APPROVED
    else:
        signup.status = SignupStatus.REJECTED
        signup.rejection_reason = message
        signup.approval_remark = None
        signup.approved_at = None
        event = NotificationEvent.SIGNUP_REJECTED

    signup.reviewed_by_admin_id = admin_id
    signup.reviewed_at = now
    return event


def perform_bulk_review(*, repo, notifications, audit, auto_award, session, admin, payload):
    signups = repo.get_many(payload.signup_ids)
    signup_map = {signup.id: signup for signup in signups}
    action = payload.action.lower()

    success = 0
    failed = 0
    skipped = 0
    details = []

    for signup_id in payload.signup_ids:
        signup = signup_map.get(signup_id)
        if not signup:
            failed += 1
            details.append({"id": signup_id, "status": "not_found"})
            continue

        if signup.status not in {SignupStatus.PENDING, SignupStatus.WAITLISTED}:
            skipped += 1
            details.append({"id": signup_id, "status": "skipped", "reason": f"current_status_{signup.status.value}"})
            continue

        try:
            event = apply_review_decision(signup, action=action, message=payload.remark, admin_id=admin.id)
            notifications.enqueue(
                user_id=signup.user_id,
                activity_id=signup.activity_id,
                signup_id=signup.id,
                channel=NotificationChannel.WECHAT,
                event=event,
            )
            if signup.status == SignupStatus.APPROVED:
                auto_award(signup)
            success += 1
            details.append({"id": signup_id, "status": "success", "new_status": signup.status.value})
        except Exception as exc:
            failed += 1
            details.append({"id": signup_id, "status": "error", "reason": str(exc)})

    audit.record(
        action=AuditAction.SIGNUP_REVIEWED,
        entity_type=AuditEntity.SIGNUP,
        entity_id=0,
        actor_admin_id=admin.id,
        context={
            "bulk": True,
            "action": action,
            "total": len(payload.signup_ids),
            "success": success,
            "failed": failed,
            "skipped": skipped,
        },
    )
    session.commit()

    return BulkReviewResult(success=success, failed=failed, skipped=skipped, details=details)
