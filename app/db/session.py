# backend/app/db/session.py
# -*- coding: utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session # Sessionをインポート
from typing import Generator # Generatorをインポート

from app.core.config import settings # データベースURLをconfigから取得

# データベースエンジンを作成
# connect_args は SQLite を使う場合にのみ必要となることがあります。
# PostgreSQL の場合は通常不要ですが、特定のSSL設定などが必要な場合は指定します。
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, connect_args=_connect_args)
# PostgreSQLでSSLモードが必要な場合の例:
# engine = create_engine(
#     settings.DATABASE_URL,
#     pool_pre_ping=True,
#     connect_args={"sslmode": "require"} # 例
# )


# セッションローカルを作成 (データベースセッションのファクトリ)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get a database session.
    Ensures the session is closed after the request.
    (データベースセッションを取得するための依存関係。
     リクエスト後にセッションが確実に閉じられるようにします。)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()