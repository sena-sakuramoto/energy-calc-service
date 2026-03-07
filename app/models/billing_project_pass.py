"""Project-scoped one-off billing grants."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class BillingProjectPass(Base):
    __tablename__ = "billing_project_passes"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(200), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    project_name = Column(String(255), nullable=True)

    status = Column(String(50), nullable=False, default="active", index=True)
    source = Column(String(50), nullable=False, default="stripe_checkout")

    stripe_session_id = Column(String(200), nullable=True, unique=True, index=True)
    stripe_payment_intent_id = Column(String(200), nullable=True, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project")
