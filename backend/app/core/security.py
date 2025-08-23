# backend/app/core/security.py
# -*- coding: utf-8 -*-
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.db.session import get_db # データベースセッション取得用
from sqlalchemy.orm import Session
from app.models.user import User # Userモデル
from app.schemas.token import TokenData # TokenDataスキーマ (トークンペイロード用)

# パスワードハッシュ化のコンテキスト設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearerインスタンス (トークンURLはsettingsから取得)
# tokenUrlは、アクセストークンを取得するためのエンドポイントの相対パスです。
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY # settings.SECRET_KEY を使用
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a new access token.
    (新しいアクセストークンを作成します。)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed password.
    (平文パスワードをハッシュ化されたパスワードと照合します。)
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain password.
    (平文パスワードをハッシュ化します。)
    """
    return pwd_context.hash(password)


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Decodes the access token and returns the current user.
    Raises HTTPException if the token is invalid or the user is not found.
    (アクセストークンをデコードし、現在のユーザーを返します。
     トークンが無効かユーザーが見つからない場合はHTTPExceptionを発生させます。)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", # エラーメッセージ (アルファベット)
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username) # usernameをTokenDataにセット
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.username).first()
    # もしCRUD操作を使うなら:
    # from app.crud import user as crud_user
    # user = crud_user.get_user_by_email(db, email=token_data.username)

    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Checks if the current user is active.
    Raises HTTPException if the user is inactive.
    (現在のユーザーがアクティブかどうかを確認します。
     ユーザーが非アクティブな場合はHTTPExceptionを発生させます。)
    """
    if not hasattr(current_user, 'is_active') or not current_user.is_active: # Userモデルにis_active属性があることを想定
        # is_active属性がない、またはFalseの場合
        # ここではis_activeがない場合も考慮してエラーにしていますが、
        # Userモデルにis_activeが必ずあるなら hasattr のチェックは不要です。
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user") # エラーメッセージ (アルファベット)
    return current_user