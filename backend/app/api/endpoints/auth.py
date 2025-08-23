# backend/app/api/endpoints/auth.py
# -*- coding: utf-8 -*-
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # OAuth2PasswordBearerはsecurity.pyから使う
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core import security # securityモジュール
from app.db.session import get_db
from app.models.user import User as UserModel # SQLAlchemyモデルを UserModelとしてインポート
from app.schemas.token import Token
from app.schemas.user import User as UserSchema # Pydanticモデルを UserSchemaとしてインポート

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    (OAuth2互換トークンログイン、将来のリクエストのためのアクセストークンを取得します。)
    """
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/test-token", response_model=UserSchema) # レスポンスモデルをPydanticスキーマに変更
def test_token(current_user: UserModel = Depends(security.get_current_user)): # Dependsで取得するのはSQLAlchemyモデル
    """
    Test access token.
    (アクセストークンをテストします。)
    """
    return current_user # FastAPIが UserModel から UserSchema に変換してくれる