# backend/app/db/base.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# データベース接続エンジン作成
engine = create_engine(settings.DATABASE_URL)

# セッションファクトリ作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースモデルクラス
Base = declarative_base()

# セッション取得用の関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()