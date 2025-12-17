"""Registration API endpoints for frontend form submission."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import UserProfile
from app.schemas.registration import RegistrationFormData, RegistrationResponse
from app.schemas.signup import SignupAnswer, SignupCreate
from app.services.signups import SignupService

router = APIRouter()


def get_signup_service(session: Session = Depends(get_db)) -> SignupService:
    return SignupService(session)


def _convert_registration_to_signup(registration: RegistrationFormData) -> SignupCreate:
    """将前端报名表单数据转换为SignupCreate结构

    这个函数将前端的结构化表单数据（personal、payment、accommodation、transport）
    转换为后端的字段答案数组格式。

    注意：这里使用 preset_key 来标识字段，实际部署时需要确保数据库中的
    ActivityFormField 记录有对应的 preset_key 值。
    """
    answers = []

    # 个人信息字段映射
    personal_mapping = {
        "name": registration.personal.name,
        "school": registration.personal.school,
        "department": registration.personal.department,
        "position": registration.personal.position,
        "phone": registration.personal.phone,
    }

    # 缴费信息字段映射
    payment_mapping = {
        "invoice_title": registration.payment.invoice_title,
        "email": registration.payment.email,
        "payment_screenshot": registration.payment.payment_screenshot,
    }

    # 住宿信息字段映射
    accommodation_mapping = {
        "accommodation_type": registration.accommodation.accommodation_type,
        "hotel": registration.accommodation.hotel,
        "room_type": registration.accommodation.room_type,
        "stay_type": registration.accommodation.stay_type,
    }

    # 交通信息字段映射
    transport_mapping = {
        "pickup_point": registration.transport.pickup_point,
        "arrival_time": registration.transport.arrival_time,
        "flight_train_number": registration.transport.flight_train_number,
        "dropoff_point": registration.transport.dropoff_point,
        "return_time": registration.transport.return_time,
        "return_flight_train_number": registration.transport.return_flight_train_number,
    }

    # 合并所有字段映射
    all_fields = {
        **personal_mapping,
        **payment_mapping,
        **accommodation_mapping,
        **transport_mapping,
    }

    # 创建字段答案列表（使用 field_id = 0 作为占位符）
    # 在Mock开发阶段，我们使用field_id=0，实际数据存储在extra字段中
    for key, value in all_fields.items():
        if value is not None:  # 只添加非空值
            answers.append(
                SignupAnswer(
                    field_id=0,  # Mock阶段使用0，真实环境需要查询实际field_id
                    value_text=str(value),
                    value_json=None,
                )
            )

    # 将完整的表单数据存储在extra字段中，方便后续查询和展示
    extra = {
        "personal": registration.personal.model_dump(),
        "payment": registration.payment.model_dump(),
        "accommodation": registration.accommodation.model_dump(),
        "transport": registration.transport.model_dump(),
    }

    return SignupCreate(
        activity_id=registration.activity_id,
        answers=answers,
        extra=extra,
    )


@router.post("", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def submit_registration(
    registration: RegistrationFormData,
    current_user: UserProfile = Depends(get_current_user),
    service: SignupService = Depends(get_signup_service),
) -> RegistrationResponse:
    """提交报名表单

    接收前端的结构化报名表单数据，转换为后端格式后创建报名记录。

    - **activity_id**: 活动ID
    - **personal**: 个人信息（姓名、学校、部门、职位、手机）
    - **payment**: 缴费信息（发票抬头、邮箱、缴费截图）
    - **accommodation**: 住宿信息（住宿类型、酒店、房型、入住方式）
    - **transport**: 交通信息（接站点、时间、航班等）
    """
    try:
        # 转换前端表单数据为后端SignupCreate格式
        signup_create = _convert_registration_to_signup(registration)

        # 调用SignupService创建报名记录
        signup = service.create(signup_create, user_id=current_user.id)

        return RegistrationResponse(
            success=True,
            signup_id=signup.id,
            message="报名成功",
        )
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
