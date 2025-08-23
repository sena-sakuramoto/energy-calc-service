# backend/app/core/config.py
# -*- coding: utf-8 -*-
import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Energy Calculation Service"
    
    # データベース設定
    # 環境変数 DATABASE_URL が設定されていればそれを使用し、
    # 設定されていなければデフォルト値を使用します。
    DATABASE_URL: str = "postgresql://energy_calc_user:simplepass99@localhost:5432/energy_calc_db"

    # JWTトークン設定
    # 本番では環境変数 SECRET_KEY を必ず設定してください
    SECRET_KEY: str = "dev-secret-key-please-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7日間

    # CORS設定
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://your-frontend-domain.vercel.app",  # 本番フロントエンドURL
    ]

    # APIプレフィックス
    API_PREFIX: str = "/api/v1"
    
    # 本番環境判定
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env", # .env ファイルを読み込む場合
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore' # .env に余計な設定があってもエラーにしない
    )

settings = Settings()

# デバッグ用に設定内容をコンソールに出力 (開発時のみ)
# print("--- Loaded Settings ---")
# print(f"PROJECT_NAME: {settings.PROJECT_NAME}")
# print(f"DATABASE_URL: {settings.DATABASE_URL}")
# print(f"SECRET_KEY: {'*' * len(settings.SECRET_KEY) if settings.SECRET_KEY else None}") # シークレットキーはマスク
# print(f"CORS_ORIGINS: {settings.CORS_ORIGINS}")
# print(f"API_PREFIX: {settings.API_PREFIX}")
# print("-----------------------")