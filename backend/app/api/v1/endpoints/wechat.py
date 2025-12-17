"""WeChat API endpoints for mini-program integration."""

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.schemas.wechat import PhoneDecryptRequest, PhoneDecryptResponse

router = APIRouter()


async def _decrypt_phone_real(code: str, settings: Settings) -> PhoneDecryptResponse:
    """调用微信API解密手机号（真实环境）"""
    if not settings.wechat_appid or not settings.wechat_secret:
        return PhoneDecryptResponse(
            success=False,
            phone_number=None,
            error_message="微信配置未设置（appid或secret缺失）",
        )

    try:
        # Step 1: 使用 code 换取 access_token
        auth_url = f"{settings.wechat_api_base}/cgi-bin/token"
        auth_params = {
            "grant_type": "client_credential",
            "appid": settings.wechat_appid,
            "secret": settings.wechat_secret,
        }

        async with httpx.AsyncClient(timeout=settings.wechat_timeout) as client:
            auth_response = await client.get(auth_url, params=auth_params)
            auth_data = auth_response.json()

            if "errcode" in auth_data and auth_data["errcode"] != 0:
                return PhoneDecryptResponse(
                    success=False,
                    phone_number=None,
                    error_message=f"获取access_token失败: {auth_data.get('errmsg', 'unknown error')}",
                )

            access_token = auth_data.get("access_token")
            if not access_token:
                return PhoneDecryptResponse(
                    success=False,
                    phone_number=None,
                    error_message="access_token为空",
                )

            # Step 2: 使用 access_token 和 code 获取手机号
            phone_url = f"{settings.wechat_api_base}/wxa/business/getuserphonenumber"
            phone_params = {"access_token": access_token}
            phone_payload = {"code": code}

            phone_response = await client.post(phone_url, params=phone_params, json=phone_payload)
            phone_data = phone_response.json()

            if phone_data.get("errcode") != 0:
                return PhoneDecryptResponse(
                    success=False,
                    phone_number=None,
                    error_message=f"获取手机号失败: {phone_data.get('errmsg', 'unknown error')}",
                )

            phone_info = phone_data.get("phone_info", {})
            phone_number = phone_info.get("phoneNumber")

            if not phone_number:
                return PhoneDecryptResponse(
                    success=False,
                    phone_number=None,
                    error_message="手机号为空",
                )

            return PhoneDecryptResponse(
                success=True,
                phone_number=phone_number,
                error_message=None,
            )

    except httpx.TimeoutException:
        return PhoneDecryptResponse(
            success=False,
            phone_number=None,
            error_message="微信API请求超时",
        )
    except Exception as exc:
        return PhoneDecryptResponse(
            success=False,
            phone_number=None,
            error_message=f"解密失败: {str(exc)}",
        )


def _decrypt_phone_mock(code: str) -> PhoneDecryptResponse:
    """Mock模式：返回模拟手机号"""
    # Mock模式：根据code生成一个模拟手机号
    # 用于本地开发和测试，无需真实的微信appid/secret
    mock_phone = "13800138000"

    return PhoneDecryptResponse(
        success=True,
        phone_number=mock_phone,
        error_message=None,
    )


@router.post("/decrypt-phone", response_model=PhoneDecryptResponse)
async def decrypt_wechat_phone(
    request: PhoneDecryptRequest,
    settings: Settings = Depends(get_settings),
) -> PhoneDecryptResponse:
    """解密微信手机号

    接收前端传来的微信授权code，调用微信API解密获取用户手机号。

    - **开发模式（Mock）**: 返回模拟手机号 13800138000
    - **生产模式**: 调用真实微信API解密

    配置方式：
    - 在 .env 文件中设置 `WECHAT_MOCK_ENABLED=true` 启用Mock模式
    - 生产环境设置 `WECHAT_MOCK_ENABLED=false`，并配置 `WECHAT_APPID` 和 `WECHAT_SECRET`
    """
    if settings.wechat_mock_enabled:
        # Mock模式：本地开发和测试
        return _decrypt_phone_mock(request.code)
    else:
        # 真实模式：调用微信API
        return await _decrypt_phone_real(request.code, settings)
