"""Product catalog model for PostgreSQL storage."""

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.sql import func

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    manufacturer = Column(String(100), nullable=False, index=True)
    series = Column(String(100), nullable=True)
    name = Column(String(200), nullable=False)
    partner = Column(Boolean, default=False, index=True)
    catalog_url = Column(String(500), nullable=True)

    specs = Column(JSON, nullable=False, default=dict)
    recommended_zones = Column(JSON, nullable=True)
    recommended_uses = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    source = Column(String(200), nullable=True)
