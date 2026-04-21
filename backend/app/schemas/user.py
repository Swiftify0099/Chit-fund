from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    user = "user"


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    name: str


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.user


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    fcm_token: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Share Schemas ────────────────────────────────────────────────────────────

class ShareCreate(BaseModel):
    user_id: int
    num_shares: int = Field(..., ge=1)
    amount_per_share: float = Field(..., gt=0)
    multiplier: float = Field(..., gt=0)


class ShareUpdate(BaseModel):
    num_shares: Optional[int] = None
    amount_per_share: Optional[float] = None
    multiplier: Optional[float] = None


class ShareOut(BaseModel):
    id: int
    user_id: int
    num_shares: int
    amount_per_share: float
    multiplier: float
    total_credit_limit: float
    created_at: datetime

    class Config:
        from_attributes = True
