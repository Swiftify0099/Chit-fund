from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class EMIStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    late = "late"


class EMISchedule(Base):
    __tablename__ = "emi_schedule"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(EMIStatus), default=EMIStatus.pending)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    penalty_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan = relationship("Loan", back_populates="emi_schedule")
    payment = relationship("Payment", back_populates="emi", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    emi_id = Column(Integer, ForeignKey("emi_schedule.id"), nullable=True)
    amount_paid = Column(Float, nullable=False)
    paid_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_by_admin = Column(Boolean, default=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan = relationship("Loan", back_populates="payments")
    emi = relationship("EMISchedule", back_populates="payment")
