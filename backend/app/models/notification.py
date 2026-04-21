from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class NotificationTarget(str, enum.Enum):
    all = "all"
    user = "user"


class NotificationType(str, enum.Enum):
    emi_reminder = "emi_reminder"
    payment_due = "payment_due"
    loan_approved = "loan_approved"
    loan_rejected = "loan_rejected"
    announcement = "announcement"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(String(1000), nullable=False)
    target = Column(Enum(NotificationTarget), default=NotificationTarget.all)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(Enum(NotificationType), default=NotificationType.announcement)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])
