"""Product selection event tracking for manufacturer analytics."""

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class ProductEvent(Base):
    __tablename__ = "product_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    product_id = Column(String(100), nullable=False, index=True)
    product_name = Column(String(200), nullable=False)
    manufacturer = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)

    building_zone = Column(Integer, nullable=True)
    building_use = Column(String(100), nullable=True)
    floor_area = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String(100), nullable=True)
