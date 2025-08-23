# backend/app/db/base.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# �f�[�^�x�[�X�ڑ��G���W���쐬
engine = create_engine(settings.DATABASE_URL)

# �Z�b�V�����t�@�N�g���쐬
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# �x�[�X���f���N���X
Base = declarative_base()

# �Z�b�V�����擾�p�̊֐�
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()