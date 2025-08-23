# backend/app/models/project.py
from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ���̓f�[�^�ƌv�Z���ʂ�JSON�`���ŕۑ�
    input_data = Column(JSON)
    result_data = Column(JSON)
    
    # ���[�U�[�Ƃ̃����[�V����
    owner = relationship("User", back_populates="projects")