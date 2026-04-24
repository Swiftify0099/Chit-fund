from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    fcm_token = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    shares = relationship("Share", back_populates="user", uselist=False)
    loan_requests = relationship("LoanRequest", back_populates="user", primaryjoin="User.id == LoanRequest.user_id")
    loans = relationship("Loan", back_populates="user")
    banner_views = relationship("BannerView", back_populates="user")
    notifications = relationship("Notification", back_populates="user", primaryjoin="User.id == Notification.user_id")
