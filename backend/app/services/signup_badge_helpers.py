from __future__ import annotations

from app.models.signup import Signup


def auto_award_on_approval(*, repo, badge_rules, badges, settings, signup: Signup) -> None:
    if not settings.badge_auto_rules_enabled:
        return
    try:
        badge_rules.evaluate_rules(
            event="signup_approved",
            user_id=signup.user_id,
            activity_id=signup.activity_id,
            signup_id=signup.id,
        )
    except Exception:
        pass

    first_badge = getattr(settings, "badge_first_attendance_code", None)
    if first_badge:
        existing = repo.count_user_approved_signups(user_id=signup.user_id, exclude_signup_id=signup.id)
        if existing == 0:
            try:
                badges.award_badge(
                    user_id=signup.user_id,
                    badge_code=first_badge,
                    activity_id=signup.activity_id,
                    notes="auto_award_first_attendance",
                )
            except ValueError:
                pass

    repeat_badge = getattr(settings, "badge_repeat_attendance_code", None)
    threshold = getattr(settings, "badge_repeat_attendance_threshold", 0)
    if repeat_badge and threshold and threshold > 1:
        total = repo.count_user_approved_signups(user_id=signup.user_id, exclude_signup_id=None)
        if total >= threshold:
            try:
                badges.award_badge(
                    user_id=signup.user_id,
                    badge_code=repeat_badge,
                    activity_id=signup.activity_id,
                    notes=f"auto_award_repeat_attendance_{total}",
                )
            except ValueError:
                pass
