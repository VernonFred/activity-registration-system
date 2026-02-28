"""Pydantic schemas for payments."""

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ORMModel, TimestampedSchema


class PaymentCreate(ORMModel):
    activity_id: int
    activity_title: str = Field(max_length=200)
    amount: float = 0.0
    category: str = Field(default="", max_length=50)
    status: str = Field(default="unpaid", max_length=20)
    pay_date: Optional[str] = None
    cover_url: Optional[str] = None
    date_range: Optional[str] = None
    time_range: Optional[str] = None
    payer: Optional[str] = None
    order_no: Optional[str] = None
    transaction_no: Optional[str] = None
    payment_screenshot: Optional[str] = None


class PaymentUpdate(ORMModel):
    status: Optional[str] = None
    pay_date: Optional[str] = None
    order_no: Optional[str] = None
    transaction_no: Optional[str] = None
    payment_screenshot: Optional[str] = None
    amount: Optional[float] = None


class PaymentRead(TimestampedSchema):
    id: int
    user_id: int
    activity_id: int
    activity_title: str
    amount: float
    category: str
    status: str
    pay_date: Optional[str] = None
    cover_url: Optional[str] = None
    date_range: Optional[str] = None
    time_range: Optional[str] = None
    payer: Optional[str] = None
    order_no: Optional[str] = None
    transaction_no: Optional[str] = None
    payment_screenshot: Optional[str] = None


class PaymentListResponse(ORMModel):
    items: List[PaymentRead]
    total: int
    page: int
    per_page: int
    total_pages: int
