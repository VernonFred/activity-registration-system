"""Backend i18n utility for translating API response messages."""

from typing import Optional

MESSAGES = {
    "zh-CN": {
        "request_failed": "请求失败，请稍后重试",
        "not_found": "资源不存在",
        "invalid_token": "无效的令牌",
        "inactive_user": "用户已被禁用",
        "inactive_admin": "管理员已被禁用",
        "invalid_credentials": "凭证无效",
        "unauthorized": "未授权",
        "forbidden": "无权限",
        "signup_not_found": "报名记录不存在",
        "activity_not_found": "活动不存在",
        "invoice_not_found": "发票抬头不存在",
        "payment_not_found": "缴费记录不存在",
        "delete_success": "已删除",
        "save_success": "保存成功",
        "create_success": "创建成功",
        "update_success": "更新成功",
        "operation_failed": "操作失败",
        "checkin_success": "签到成功",
        "checkin_failed": "签到失败",
        "already_checked_in": "您已签到",
        "invalid_code": "签到码无效",
        "copy_text_name": "名称",
        "copy_text_tax_no": "税号",
        "copy_text_address": "地址",
        "copy_text_phone": "电话",
        "copy_text_bank": "开户银行",
        "copy_text_account": "银行账号",
    },
    "en": {
        "request_failed": "Request failed, please try again",
        "not_found": "Resource not found",
        "invalid_token": "Invalid token",
        "inactive_user": "User is inactive",
        "inactive_admin": "Admin is inactive",
        "invalid_credentials": "Invalid credentials",
        "unauthorized": "Unauthorized",
        "forbidden": "Forbidden",
        "signup_not_found": "Registration not found",
        "activity_not_found": "Event not found",
        "invoice_not_found": "Invoice header not found",
        "payment_not_found": "Payment not found",
        "delete_success": "Deleted",
        "save_success": "Saved",
        "create_success": "Created",
        "update_success": "Updated",
        "operation_failed": "Operation failed",
        "checkin_success": "Checked in",
        "checkin_failed": "Check-in failed",
        "already_checked_in": "Already checked in",
        "invalid_code": "Invalid check-in code",
        "copy_text_name": "Name",
        "copy_text_tax_no": "Tax ID",
        "copy_text_address": "Address",
        "copy_text_phone": "Phone",
        "copy_text_bank": "Bank",
        "copy_text_account": "Account",
    },
}

DEFAULT_LOCALE = "zh-CN"


def parse_locale(accept_language: Optional[str] = None) -> str:
    """Extract locale from Accept-Language header. Returns 'zh-CN' or 'en'."""
    if not accept_language:
        return DEFAULT_LOCALE
    lang = accept_language.strip().split(",")[0].split(";")[0].strip().lower()
    if lang.startswith("en"):
        return "en"
    return "zh-CN"


def t(key: str, locale: Optional[str] = None) -> str:
    """Translate a message key to the given locale."""
    loc = locale or DEFAULT_LOCALE
    msgs = MESSAGES.get(loc, MESSAGES[DEFAULT_LOCALE])
    return msgs.get(key, MESSAGES[DEFAULT_LOCALE].get(key, key))
