"""Partner onboarding registration model."""

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class OnboardingRegistration(Base):
    __tablename__ = "onboarding_registrations"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    partner_code = Column(String(100), nullable=True)
    source = Column(String(100), nullable=False, index=True, default="technostructure")

    status = Column(String(50), nullable=False, default="pending")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
