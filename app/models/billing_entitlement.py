"""Billing entitlements granted outside recurring subscriptions."""

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class BillingEntitlement(Base):
    __tablename__ = "billing_entitlements"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(200), nullable=False, index=True)
    entitlement_type = Column(String(50), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    source = Column(String(50), nullable=False, default="stripe_checkout")

    stripe_session_id = Column(String(200), nullable=True, unique=True, index=True)
    stripe_payment_intent_id = Column(String(200), nullable=True, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
