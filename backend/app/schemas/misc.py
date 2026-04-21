from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class NotificationTarget(str, Enum):
    all = "all"
    user = "user"


class NotificationType(str, Enum):
    emi_reminder = "emi_reminder"
    payment_due = "payment_due"
    loan_approved = "loan_approved"
    loan_rejected = "loan_rejected"
    announcement = "announcement"


class NotificationSend(BaseModel):
    title: str = Field(..., min_length=2)
    body: str = Field(..., min_length=2)
    target: NotificationTarget = NotificationTarget.all
    user_id: Optional[int] = None
    type: NotificationType = NotificationType.announcement


class NotificationOut(BaseModel):
    id: int
    title: str
    body: str
    target: str
    user_id: Optional[int]
    type: str
    sent_at: datetime

    class Config:
        from_attributes = True


# ─── Theme Schemas ────────────────────────────────────────────────────────────

class ThemeCreate(BaseModel):
    name: str
    bg_color: str = "#0F1629"
    bg_image: Optional[str] = None
    text_color: str = "#FFFFFF"
    highlight_color: str = "#6C63FF"
    font_bold: bool = False
    title: Optional[str] = None
    subtitle: Optional[str] = None
    shadow_color: Optional[str] = None


class ThemeUpdate(BaseModel):
    name: Optional[str] = None
    bg_color: Optional[str] = None
    bg_image: Optional[str] = None
    text_color: Optional[str] = None
    highlight_color: Optional[str] = None
    font_bold: Optional[bool] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    shadow_color: Optional[str] = None
    is_active: Optional[bool] = None


class ThemeOut(BaseModel):
    id: int
    name: str
    bg_color: str
    bg_image: Optional[str]
    text_color: str
    highlight_color: str
    font_bold: bool
    title: Optional[str]
    subtitle: Optional[str]
    shadow_color: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Banner Schemas ───────────────────────────────────────────────────────────

class BannerOut(BaseModel):
    id: int
    title: str
    image_url: str
    client_name: Optional[str]
    is_active: bool
    cost_per_view: float
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    total_views: Optional[int] = 0
    total_charge: Optional[float] = 0.0

    class Config:
        from_attributes = True


class BannerViewCreate(BaseModel):
    banner_id: int
    session_id: Optional[str] = None
    device_info: Optional[str] = None
