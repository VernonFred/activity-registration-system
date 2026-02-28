"""Pydantic schemas for invoice headers."""

from typing import List, Optional

from pydantic import Field

from app.schemas.common import ORMModel, TimestampedSchema


class InvoiceHeaderCreate(ORMModel):
    name: str = Field(max_length=200)
    type: str = Field(default="personal", max_length=20)
    tax_number: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=300)
    phone: Optional[str] = Field(default=None, max_length=30)
    bank_name: Optional[str] = Field(default=None, max_length=200)
    bank_account: Optional[str] = Field(default=None, max_length=50)


class InvoiceHeaderUpdate(ORMModel):
    name: Optional[str] = Field(default=None, max_length=200)
    tax_number: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=300)
    phone: Optional[str] = Field(default=None, max_length=30)
    bank_name: Optional[str] = Field(default=None, max_length=200)
    bank_account: Optional[str] = Field(default=None, max_length=50)


class InvoiceHeaderRead(TimestampedSchema):
    id: int
    user_id: int
    name: str
    type: str
    tax_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None


class InvoiceHeaderListResponse(ORMModel):
    items: List[InvoiceHeaderRead]
    total: int
    page: int
    per_page: int
    total_pages: int


class InvoiceHeaderCopyText(ORMModel):
    """完整发票文本信息，用于复制到剪贴板."""
    text: str
