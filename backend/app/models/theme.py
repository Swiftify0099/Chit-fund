from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bg_color = Column(String(20), default="#0F1629")
    bg_image = Column(String(500), nullable=True)
    text_color = Column(String(20), default="#FFFFFF")
    highlight_color = Column(String(20), default="#6C63FF")
    font_bold = Column(Boolean, default=False)
    title = Column(String(200), nullable=True)
    subtitle = Column(String(200), nullable=True)
    shadow_color = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    image_url = Column(String(500), nullable=False)
    client_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    cost_per_view = Column(Float, default=0.0)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    views = relationship("BannerView", back_populates="banner")


class BannerView(Base):
    __tablename__ = "banner_views"

    id = Column(Integer, primary_key=True, index=True)
    banner_id = Column(Integer, ForeignKey("banners.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(200), nullable=True)
    device_info = Column(String(300), nullable=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

    banner = relationship("Banner", back_populates="views", foreign_keys=[banner_id],
                          primaryjoin="BannerView.banner_id == Banner.id")
    user = relationship("User", back_populates="banner_views", foreign_keys=[user_id],
                        primaryjoin="BannerView.user_id == User.id")
