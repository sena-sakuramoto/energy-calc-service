# backend/app/api/api.py
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from app.api.endpoints import users, projects, calc, report # 各エンドポイントモジュールをインポート

api_router = APIRouter()

# 各エンドポイントのルーターを登録
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"]) # tagsをアルファベットに変更
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(calc.router, prefix="/projects", tags=["Calculation"]) # プレフィックスはprojectsと重複する可能性あり注意
api_router.include_router(report.router, prefix="/projects", tags=["Report"]) # プレフィックスはprojectsと重複する可能性あり注意

# 他にもエンドポイントがあればここに追加