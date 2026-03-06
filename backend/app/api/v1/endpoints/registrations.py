"""Registration API endpoints for frontend form submission."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_activity_service, get_current_user, get_db
from app.models.user import UserProfile
from app.schemas.registration import RegistrationFormData, RegistrationResponse, RegistrationStepPayload
from app.schemas.signup import SignupAnswer, SignupCreate
from app.services.activities import ActivityService
from app.services.signups import SignupService

router = APIRouter()


def get_signup_service(session: Session = Depends(get_db)) -> SignupService:
    return SignupService(session)


def _default_flow(require_payment: bool) -> dict[str, Any]:
    return {
        "steps": [
            {
                "key": "personal",
                "title": "个人信息",
                "description": "报名入口第一步，负责姓名、学校、部门等基础资料。",
                "enabled": True,
                "built_in": True,
                "order": 0,
            },
            {
                "key": "payment",
                "title": "缴费信息",
                "description": "配置缴费凭证、开票信息、支付截图等字段。",
                "enabled": bool(require_payment),
                "built_in": True,
                "order": 1,
            },
            {
                "key": "accommodation",
                "title": "住宿信息",
                "description": "配置酒店、房型、入住意向与住宿补充说明。",
                "enabled": False,
                "built_in": True,
                "order": 2,
            },
            {
                "key": "transport",
                "title": "交通信息",
                "description": "配置到达、返程、车次/航班等交通字段。",
                "enabled": True,
                "built_in": True,
                "order": 3,
            },
        ]
    }


def _normalize_signup_flow(activity_extra: dict | None, require_payment: bool) -> dict[str, Any]:
    flow = deepcopy(_default_flow(require_payment))
    if not isinstance(activity_extra, dict):
        return flow

    configured = activity_extra.get("signup_flow")
    legacy = activity_extra.get("signup_config") if isinstance(activity_extra.get("signup_config"), dict) else {}

    if isinstance(configured, dict) and isinstance(configured.get("steps"), list):
        steps: list[dict[str, Any]] = []
        for index, step in enumerate(configured["steps"]):
            if not isinstance(step, dict):
                continue
            key = str(step.get("key") or f"step_{index + 1}").strip()
            if not key:
                continue
            steps.append(
                {
                    "key": key,
                    "title": str(step.get("title") or key),
                    "description": str(step.get("description") or ""),
                    "enabled": bool(step.get("enabled", True)),
                    "built_in": bool(step.get("built_in", False)),
                    "order": int(step.get("order", index)),
                }
            )
        if steps:
            return {"steps": sorted(steps, key=lambda item: item["order"])}

    if isinstance(configured, dict) and isinstance(configured.get("steps"), dict):
        legacy_order = configured.get("step_order") if isinstance(configured.get("step_order"), list) else [step["key"] for step in flow["steps"]]
        merged_steps = []
        for index, key in enumerate(legacy_order):
            default_step = next((step for step in flow["steps"] if step["key"] == key), None)
            if default_step is None:
                continue
            configured_step = configured["steps"].get(key, {}) if isinstance(configured["steps"].get(key), dict) else {}
            enabled = configured_step.get("enabled")
            if enabled is None:
                if key == "payment":
                    enabled = legacy.get("payment", {}).get("enabled", default_step["enabled"])
                elif key == "accommodation":
                    enabled = legacy.get("accommodation", {}).get("enabled", default_step["enabled"])
                elif key == "transport":
                    enabled = legacy.get("transport", {}).get("enabled", default_step["enabled"])
                else:
                    enabled = default_step["enabled"]
            merged_steps.append({**default_step, "enabled": bool(enabled), "order": index})
        if merged_steps:
            return {"steps": merged_steps}

    for step in flow["steps"]:
        if step["key"] == "payment":
            step["enabled"] = legacy.get("payment", {}).get("enabled", step["enabled"])
        elif step["key"] == "accommodation":
            step["enabled"] = legacy.get("accommodation", {}).get("enabled", step["enabled"])
        elif step["key"] == "transport":
            step["enabled"] = legacy.get("transport", {}).get("enabled", step["enabled"])
    return flow


def _normalize_registration_steps(registration: RegistrationFormData, flow: dict[str, Any]) -> list[RegistrationStepPayload]:
    if registration.steps:
        return registration.steps

    defaults = {step["key"]: step for step in flow.get("steps", [])}
    legacy_steps: list[RegistrationStepPayload] = []
    for key in ["personal", "payment", "accommodation", "transport"]:
        values = getattr(registration, key)
        if values is None:
            continue
        default_step = defaults.get(key, {})
        legacy_steps.append(
            RegistrationStepPayload(
                step_key=key,
                step_title=default_step.get("title", key),
                values=values,
            )
        )
    return legacy_steps


def _infer_field_step(field: Any) -> str:
    config = getattr(field, "config", None) or {}
    if isinstance(config, dict) and config.get("step"):
        return str(config["step"])
    bind = config.get("bind") if isinstance(config, dict) else None
    if isinstance(bind, str) and "." in bind:
        return bind.split(".")[0]
    preset_key = getattr(field, "preset_key", None)
    if isinstance(preset_key, str):
        if preset_key.startswith("payment_") or preset_key in {"invoice_title", "email"}:
            return "payment"
        if preset_key.startswith("accommodation_") or preset_key in {"hotel", "room_type", "stay_type"}:
            return "accommodation"
        if preset_key.startswith("transport_") or preset_key in {"pickup_point", "arrival_time", "flight_train_number", "dropoff_point", "return_time", "return_flight_train_number"}:
            return "transport"
    return "personal"


def _extract_value(field: Any, values: dict[str, Any]) -> Any:
    config = getattr(field, "config", None) or {}
    bind = config.get("bind") if isinstance(config, dict) else None
    candidates = [getattr(field, "name", None), getattr(field, "preset_key", None)]
    if isinstance(bind, str) and bind:
        candidates.insert(0, bind.split(".")[-1])
    for candidate in candidates:
        if isinstance(candidate, str) and candidate in values:
            return values[candidate]
    return None


def _has_value(value: Any) -> bool:
    if isinstance(value, list):
        return len(value) > 0
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip() != ""


def _validate_registration_payload(registration_steps: list[RegistrationStepPayload], flow: dict[str, Any], activity: Any, activity_extra: dict | None) -> None:
    enabled_steps = [step for step in flow.get("steps", []) if step.get("enabled")]
    submitted = {step.step_key: step.values for step in registration_steps}
    payment_config = {}
    if isinstance(activity_extra, dict) and isinstance(activity_extra.get("signup_config"), dict):
        payment_config = activity_extra["signup_config"].get("payment", {}) or {}

    fields_by_step: dict[str, list[Any]] = {}
    for field in getattr(activity, "form_fields", []) or []:
        step_key = _infer_field_step(field)
        fields_by_step.setdefault(step_key, []).append(field)

    for step in enabled_steps:
        step_key = str(step.get("key"))
        step_values = submitted.get(step_key, {})
        for field in fields_by_step.get(step_key, []):
            config = getattr(field, "config", None) or {}
            widget = config.get("widget") if isinstance(config, dict) else None
            upload_required = False
            if isinstance(config, dict) and isinstance(config.get("upload"), dict):
                upload_required = bool(config["upload"].get("required"))
            required = bool(getattr(field, "required", False)) or (widget == "image_upload" and upload_required)
            if required and not _has_value(_extract_value(field, step_values)):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{getattr(field, 'label', step_key)}不能为空")

        if step_key == "personal":
            for key, label in [("name", "姓名"), ("school", "学校"), ("department", "学院/部门"), ("phone", "手机号码")]:
                if not _has_value(step_values.get(key)):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{label}不能为空")
        if step_key == "payment" and payment_config.get("invoice_enabled", True) and not _has_value(step_values.get("invoice_title")):
            if any(_extract_value(field, step_values) is not None for field in fields_by_step.get(step_key, [])):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="发票抬头不能为空")
        if step_key == "payment" and payment_config.get("receipt_required", False) and not _has_value(step_values.get("payment_screenshot")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="缴费步骤要求上传缴费截图")


def _convert_registration_to_signup(registration: RegistrationFormData, flow: dict[str, Any], activity: Any) -> SignupCreate:
    registration_steps = _normalize_registration_steps(registration, flow)
    step_map = {step.step_key: step.values for step in registration_steps}
    answers: list[SignupAnswer] = []

    for field in getattr(activity, "form_fields", []) or []:
        step_key = _infer_field_step(field)
        values = step_map.get(step_key, {})
        value = _extract_value(field, values)
        if not _has_value(value):
            continue
        if isinstance(value, (dict, list)):
            answers.append(SignupAnswer(field_id=field.id, value_json=value))
        else:
            answers.append(SignupAnswer(field_id=field.id, value_text=str(value)))

    extra: dict[str, Any] = {
        "signup_flow": flow,
        "steps": [step.model_dump() for step in registration_steps],
        "step_map": step_map,
    }
    for key in ["personal", "payment", "accommodation", "transport"]:
        if key in step_map:
            extra[key] = step_map[key]

    return SignupCreate(activity_id=registration.activity_id, answers=answers, extra=extra)


@router.post("", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def submit_registration(
    registration: RegistrationFormData,
    current_user: UserProfile = Depends(get_current_user),
    service: SignupService = Depends(get_signup_service),
    activity_service: ActivityService = Depends(get_activity_service),
) -> RegistrationResponse:
    """提交报名表单。"""
    try:
        activity = activity_service.get(registration.activity_id)
        if not activity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="活动不存在")
        flow = _normalize_signup_flow(activity.extra, activity.require_payment)
        registration_steps = _normalize_registration_steps(registration, flow)
        _validate_registration_payload(registration_steps, flow, activity, activity.extra)
        signup_create = _convert_registration_to_signup(registration, flow, activity)
        signup = service.create(signup_create, user_id=current_user.id)
        return RegistrationResponse(success=True, signup_id=signup.id, message="报名成功")
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"报名失败: {str(exc)}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"系统错误: {str(exc)}",
        ) from exc
