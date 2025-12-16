"""Pydantic schemas for frontend registration form data."""

from typing import Optional

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel


class PersonalInfo(ORMModel):
    """个人信息"""
    name: str = Field(..., min_length=1, max_length=50, description="姓名")
    school: str = Field(..., min_length=1, max_length=100, description="学校")
    department: str = Field(..., min_length=1, max_length=100, description="学院/部门")
    position: Optional[str] = Field(None, max_length=100, description="职位")
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$", description="手机号码")


class PaymentInfo(ORMModel):
    """缴费信息"""
    invoice_title: str = Field(..., min_length=1, max_length=200, description="发票抬头")
    email: EmailStr = Field(..., description="电子邮箱")
    payment_screenshot: Optional[str] = Field(None, description="缴费截图URL")


class AccommodationInfo(ORMModel):
    """住宿信息"""
    accommodation_type: str = Field(..., pattern="^(self|organizer)$", description="住宿安排类型")
    hotel: str = Field(..., min_length=1, max_length=100, description="酒店名称")
    room_type: str = Field(..., pattern="^(double|standard)$", description="房型")
    stay_type: str = Field(..., pattern="^(single|shared)$", description="入住方式")


class TransportInfo(ORMModel):
    """交通信息"""
    pickup_point: Optional[str] = Field(None, max_length=100, description="接站点")
    arrival_time: Optional[str] = Field(None, description="到达时间")
    flight_train_number: Optional[str] = Field(None, max_length=50, description="到达车次/航班号")
    dropoff_point: Optional[str] = Field(None, max_length=100, description="送站点")
    return_time: Optional[str] = Field(None, description="返程时间")
    return_flight_train_number: Optional[str] = Field(None, max_length=50, description="返程车次/航班号")


class RegistrationFormData(ORMModel):
    """前端报名表单完整数据结构"""
    activity_id: int = Field(..., gt=0, description="活动ID")
    personal: PersonalInfo = Field(..., description="个人信息")
    payment: PaymentInfo = Field(..., description="缴费信息")
    accommodation: AccommodationInfo = Field(..., description="住宿信息")
    transport: TransportInfo = Field(..., description="交通信息")


class RegistrationResponse(ORMModel):
    """报名成功响应"""
    success: bool = Field(True, description="是否成功")
    signup_id: int = Field(..., description="报名ID")
    message: str = Field(default="报名成功", description="提示信息")
