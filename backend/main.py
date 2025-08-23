# backend/main.py
# -*- coding: utf-8 -*-
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 環境変数ファイル読み込み
load_dotenv()

# アプリケーションモジュールからのインポート
from app.core.config import settings
from app.api.api import api_router
from app.middleware.security import SecurityMiddleware, RateLimitMiddleware, LoggingMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    description="建築物省エネ法対応計算サービス API",
    version="1.0.0",
    docs_url=f"{settings.API_PREFIX}/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=f"{settings.API_PREFIX}/redoc" if settings.ENVIRONMENT == "development" else None,
)

# セキュリティミドルウェア追加
app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)  # 1分間に100リクエスト
app.add_middleware(LoggingMiddleware)

# CORSミドルウェア設定
# settings.CORS_ORIGINS がリストであり、中身が存在する場合にのみ設定を適用
if settings.CORS_ORIGINS and isinstance(settings.CORS_ORIGINS, list) and len(settings.CORS_ORIGINS) > 0:
    print(f"INFO: Applying CORS middleware with origins: {settings.CORS_ORIGINS}") # 設定値をログに出力
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip() for origin in settings.CORS_ORIGINS], # 各オリジンを文字列にし、前後の空白を除去
        allow_credentials=True,
        allow_methods=["*"],  # GET, POST, PUT, DELETE, OPTIONSなど全て許可
        allow_headers=["*"],  # Content-Type, Authorizationなど全てのヘッダーを許可
    )
else:
    print("WARNING: No CORS_ORIGINS defined or list is empty. CORS will not be configured.")
    # 開発中、どうしてもCORSがうまくいかない場合の最終手段 (本番では絶対に使用しない)
    # print("WARNING: Applying extremely permissive CORS settings for debugging. DO NOT USE IN PRODUCTION.")
    # app.add_middleware(
    #     CORSMiddleware,
    #     allow_origins=["*"],
    #     allow_credentials=True,
    #     allow_methods=["*"],
    #     allow_headers=["*"],
    # )


# APIルーターをアプリケーションに含める
app.include_router(api_router, prefix=settings.API_PREFIX)

# (オプション) ルートパスへの簡単なレスポンス (動作確認用)
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}


if __name__ == "__main__":
    print(f"Starting Uvicorn server for: {settings.PROJECT_NAME}")
    print(f"Listening on host 0.0.0.0, port 8000")
    # Uvicornをプログラム的に起動
    # reload=True は開発時には便利ですが、main:app の文字列で指定する場合は
    # uvicornコマンドで --reload をつける方が一般的です。
    # ここでは、python main.py で直接実行することを想定し、reload=True を残します。
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")