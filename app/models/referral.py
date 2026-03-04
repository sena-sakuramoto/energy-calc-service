"""Referral tracking model."""

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)

    architect_name = Column(String(200), nullable=False)
    architect_email = Column(String(200), nullable=False)
    architect_company = Column(String(200), nullable=True)
    architect_phone = Column(String(50), nullable=True)

    project_name = Column(String(200), nullable=True)
    building_use = Column(String(100), nullable=True)
    building_zone = Column(Integer, nullable=True)
    floor_area = Column(Float, nullable=True)

    product_category = Column(String(50), nullable=False)
    product_id = Column(String(100), nullable=False)
    product_name = Column(String(200), nullable=False)
    manufacturer = Column(String(100), nullable=False)

    status = Column(String(50), default="pending")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
