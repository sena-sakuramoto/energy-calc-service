"""Contact inquiry persistence model."""

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    company = Column(String(200), nullable=True)
    category = Column(String(50), nullable=True)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    page_url = Column(String(500), nullable=True)
    user_agent = Column(String(500), nullable=True)

    status = Column(String(50), nullable=False, default="received")
    notification_sent_at = Column(DateTime(timezone=True), nullable=True)
    notification_error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
