"""Services for exporting data snapshots (CSV/XLSX)."""

from __future__ import annotations

import csv
import io
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import AuditAction, AuditEntity
from app.repositories.activities import ActivityRepository
from app.repositories.signups import SignupRepository
from app.repositories.feedbacks import ActivityFeedbackRepository
from app.repositories.engagements import ActivityEngagementRepository, ActivityCommentRepository
from app.services.audit import AuditLogService


class ExportService:
    """Provide structured exports for administrative use."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.activities = ActivityRepository(session)
        self.signups = SignupRepository(session)
        self.feedbacks = ActivityFeedbackRepository(session)
        self.engagements = ActivityEngagementRepository(session)
        self.comments_repo = ActivityCommentRepository(session)
        self.audit = AuditLogService(session)

    def _xlsx_available(self) -> bool:
        try:
            import openpyxl  # type: ignore  # noqa: F401
            return True
        except Exception:
            return False

    def _to_xlsx(self, headers: list[str], rows: list[list], filename: str) -> tuple[str, bytes]:
        from openpyxl import Workbook  # type: ignore
        wb = Workbook()
        ws = wb.active
        ws.append(headers)
        for row in rows:
            ws.append(row)
        output = io.BytesIO()
        wb.save(output)
        return filename, output.getvalue()

    def activity_signups_export(self, activity_id: int, *, actor_admin_id: int | None = None, fmt: str = "csv", ids: list[int] | None = None) -> tuple[str, bytes] | None:
        activity: Activity | None = self.activities.get(activity_id)
        if not activity:
            return None

        signups = self.signups.list(activity_id=activity_id)
        if ids:
            signups = [s for s in signups if s.id in set(ids)]

        headers = [
            "signup_id",
            "user_id",
            "user_name",
            "status",
            "checkin_status",
            "approved_at",
            "checkin_time",
            "created_at",
            "feedback_rating",
            "feedback_comment",
            "is_favorited",
            "is_liked",
            "user_share_count",
            "user_comment_count",
        ]
        rows: list[list] = []
        for signup in signups:
            user = signup.user
            feedback = self.feedbacks.get_by_user_activity(activity_id=activity_id, user_id=signup.user_id)
            engagement = self.engagements.user_activity_metrics(activity_id=activity_id, user_id=signup.user_id)
            rows.append(
                [
                    signup.id,
                    signup.user_id,
                    user.name if user else "",
                    signup.status.value,
                    signup.checkin_status.value,
                    signup.approved_at.isoformat() if signup.approved_at else "",
                    signup.checkin_time.isoformat() if signup.checkin_time else "",
                    signup.created_at.isoformat() if isinstance(signup.created_at, datetime) else "",
                    feedback.rating if feedback else "",
                    feedback.comment if feedback else "",
                    "yes" if engagement["is_favorited"] else "no",
                    "yes" if engagement["is_liked"] else "no",
                    engagement["share_count"],
                    engagement["comment_count"],
                ]
            )

        if fmt == "xlsx" and self._xlsx_available():
            filename = f"activity_{activity_id}_signups.xlsx"
            filename, content = self._to_xlsx(headers, rows, filename)
        else:
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            writer.writerows(rows)
            filename = f"activity_{activity_id}_signups.csv"
            content = buffer.getvalue().encode("utf-8-sig")

        engagement_summary = self.engagements.engagement_summary(activity_id)
        feedback_totals = self.feedbacks.aggregate_for_activity(activity_id)
        self.audit.record(
            action=AuditAction.EXPORT_SIGNUPS,
            entity_type=AuditEntity.ACTIVITY,
            entity_id=activity_id,
            actor_admin_id=actor_admin_id,
            context={
                "count": len(signups),
                "favorites": engagement_summary["favorites"],
                "likes": engagement_summary["likes"],
                "shares": engagement_summary["shares"],
                "comments": engagement_summary["comments"],
                "feedbacks": feedback_totals["total_feedbacks"],
            },
        )
        self.session.flush()

        return filename, content

    def activity_shares_export(self, activity_id: int, *, actor_admin_id: int | None = None, fmt: str = "csv") -> tuple[str, bytes] | None:
        activity: Activity | None = self.activities.get(activity_id)
        if not activity:
            return None

        shares = self.engagements.list_shares(activity_id=activity_id)
        headers = ["share_id", "user_id", "user_name", "channel", "created_at"]
        rows = []
        for share in shares:
            user = share.user
            rows.append([
                share.id,
                share.user_id or "",
                user.name if user else "",
                share.channel or "",
                share.created_at.isoformat() if isinstance(share.created_at, datetime) else "",
            ])

        if fmt == "xlsx" and self._xlsx_available():
            filename, content = self._to_xlsx(headers, rows, f"activity_{activity_id}_shares.xlsx")
        else:
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            writer.writerows(rows)
            filename = f"activity_{activity_id}_shares.csv"
            content = buffer.getvalue().encode("utf-8-sig")
        self.audit.record(
            action=AuditAction.EXPORT_SIGNUPS,
            entity_type=AuditEntity.ACTIVITY,
            entity_id=activity_id,
            actor_admin_id=actor_admin_id,
            context={"shares": len(shares)},
        )
        self.session.flush()
        return filename, content

    def activity_comments_export(self, activity_id: int, *, actor_admin_id: int | None = None, fmt: str = "csv") -> tuple[str, bytes] | None:
        activity: Activity | None = self.activities.get(activity_id)
        if not activity:
            return None

        comments = self.comments_repo.list_all(activity_id)
        headers = ["comment_id", "user_id", "user_name", "content", "parent_id", "created_at", "is_pinned"]
        rows = []
        for comment in comments:
            user = comment.user
            rows.append([
                comment.id,
                comment.user_id,
                user.name if user else "",
                comment.content,
                comment.parent_id or "",
                comment.created_at.isoformat() if isinstance(comment.created_at, datetime) else "",
                "yes" if comment.is_pinned else "no",
            ])

        if fmt == "xlsx" and self._xlsx_available():
            filename, content = self._to_xlsx(headers, rows, f"activity_{activity_id}_comments.xlsx")
        else:
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            writer.writerows(rows)
            filename = f"activity_{activity_id}_comments.csv"
            content = buffer.getvalue().encode("utf-8-sig")
        self.audit.record(
            action=AuditAction.EXPORT_SIGNUPS,
            entity_type=AuditEntity.ACTIVITY,
            entity_id=activity_id,
            actor_admin_id=actor_admin_id,
            context={"comments": len(comments)},
        )
        self.session.flush()
        return filename, content

    # Backward-compatible CSV helpers (used by existing tests)
    def activity_signups_csv(self, activity_id: int, *, actor_admin_id: int | None = None) -> tuple[str, bytes] | None:
        return self.activity_signups_export(activity_id, actor_admin_id=actor_admin_id, fmt="csv")

    def activity_comments_csv(self, activity_id: int, *, actor_admin_id: int | None = None) -> tuple[str, bytes] | None:
        return self.activity_comments_export(activity_id, actor_admin_id=actor_admin_id, fmt="csv")

    def activity_shares_csv(self, activity_id: int, *, actor_admin_id: int | None = None) -> tuple[str, bytes] | None:
        return self.activity_shares_export(activity_id, actor_admin_id=actor_admin_id, fmt="csv")
