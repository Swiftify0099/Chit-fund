from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class LoanRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LoanStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class LoanRequest(Base):
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_requested = Column(Float, nullable=False)
    status = Column(Enum(LoanRequestStatus), default=LoanRequestStatus.pending)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    repayment_months = Column(Integer, nullable=True)
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="loan_requests")
    admin = relationship("User", foreign_keys=[admin_id])
    loan = relationship("Loan", back_populates="loan_request", uselist=False)


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    principal = Column(Float, nullable=False)
    disbursed_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(LoanStatus), default=LoanStatus.active)
    remaining_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan_request = relationship("LoanRequest", back_populates="loan")
    user = relationship("User", back_populates="loans")
    emi_schedule = relationship("EMISchedule", back_populates="loan")
    payments = relationship("Payment", back_populates="loan")
