#!/usr/bin/env python3
"""
データベース初期化スクリプト
"""
import asyncio
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.user import User
from app.models.project import Project
from app.db.base import Base

def create_tables():
    """テーブル作成"""
    engine = create_engine(settings.DATABASE_URL)
    
    # すべてのテーブルを作成
    Base.metadata.create_all(bind=engine)
    print("✅ データベーステーブルを作成しました")
    
    return engine

def create_sample_data(engine):
    """サンプルデータ作成"""
    from sqlalchemy.orm import sessionmaker
    from app.core.security import get_password_hash
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # テストユーザーの確認
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if not existing_user:
            # テストユーザー作成
            test_user = User(
                email="test@example.com",
                username="testuser",
                hashed_password=get_password_hash("password123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print("✅ テストユーザーを作成しました: test@example.com / password123")
            
            # サンプルプロジェクト作成
            sample_project = Project(
                name="サンプル建物計算",
                description="省エネ法に基づく計算のサンプルプロジェクト",
                owner_id=test_user.id
            )
            db.add(sample_project)
            db.commit()
            print("✅ サンプルプロジェクトを作成しました")
        else:
            print("ℹ️ テストユーザーは既に存在します")
            
    except Exception as e:
        print(f"❌ サンプルデータ作成エラー: {e}")
        db.rollback()
    finally:
        db.close()

def verify_connection():
    """データベース接続確認"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ データベース接続成功: {version}")
        return True
    except Exception as e:
        print(f"❌ データベース接続失敗: {e}")
        return False

def main():
    """メイン処理"""
    print("🚀 データベース初期化を開始します...")
    print(f"📊 接続先: {settings.DATABASE_URL[:50]}...")
    
    # 1. 接続確認
    if not verify_connection():
        return
    
    # 2. テーブル作成
    engine = create_tables()
    
    # 3. サンプルデータ作成
    create_sample_data(engine)
    
    print("🎉 データベース初期化が完了しました!")
    print("\n📝 次のステップ:")
    print("1. アプリケーションを起動: uvicorn main:app --reload")
    print("2. ブラウザで確認: http://localhost:8000")
    print("3. API ドキュメント: http://localhost:8000/api/v1/docs")

if __name__ == "__main__":
    main()