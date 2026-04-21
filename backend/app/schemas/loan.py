from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LoanRequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LoanStatus(str, Enum):
    active = "active"
    completed = "completed"


class EMIStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    late = "late"


# ─── Loan Request ─────────────────────────────────────────────────────────────

class LoanRequestCreate(BaseModel):
    amount_requested: float = Field(..., gt=0)
    note: Optional[str] = None


class LoanRequestApprove(BaseModel):
    repayment_months: int = Field(..., ge=1, le=120)


class LoanRequestReject(BaseModel):
    rejection_reason: str = Field(..., min_length=5)


class LoanRequestOut(BaseModel):
    id: int
    user_id: int
    amount_requested: float
    status: str
    repayment_months: Optional[int]
    rejection_reason: Optional[str]
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Loan ─────────────────────────────────────────────────────────────────────

class LoanOut(BaseModel):
    id: int
    loan_request_id: int
    user_id: int
    principal: float
    remaining_amount: float
    status: str
    disbursed_at: datetime

    class Config:
        from_attributes = True


# ─── EMI ─────────────────────────────────────────────────────────────────────

class EMIOut(BaseModel):
    id: int
    loan_id: int
    due_date: datetime
    amount: float
    status: str
    paid_at: Optional[datetime]
    penalty_amount: float

    class Config:
        from_attributes = True


# ─── Payment ─────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    loan_id: int
    emi_id: Optional[int] = None
    amount_paid: float = Field(..., gt=0)


class PaymentOut(BaseModel):
    id: int
    loan_id: int
    emi_id: Optional[int]
    amount_paid: float
    paid_at: datetime
    confirmed_by_admin: bool

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class UserDashboardOut(BaseModel):
    user_id: int
    name: str
    num_shares: int
    amount_per_share: float
    multiplier: float
    total_credit_limit: float
    used_credit: float
    available_credit: float
    active_loans: List[LoanOut]
