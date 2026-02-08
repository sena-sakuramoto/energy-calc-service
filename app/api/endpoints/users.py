# backend/app/api/endpoints/users.py
# -*- coding: utf-8 -*-
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas # schemas/__init__.py でインポートしている場合
# または個別に:
# from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
# from app.schemas.msg import Msg # メッセージ表示用スキーマ (任意)
from app.models.user import User as UserModel # SQLAlchemyモデル
from app.db.session import get_db
from app.core import security
# from app.crud import user as crud_user # CRUD操作用のモジュール (あれば)

router = APIRouter()

@router.post("/", response_model=schemas.user.User) # schemas.user.User のようにアクセス
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.UserCreate # schemas.user.UserCreate のようにアクセス
) -> Any:
    """
    Create new user.
    (新規ユーザーを作成します。)
    """
    # crud_user.create_user を使う方が一般的
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    hashed_password = security.get_password_hash(user_in.password)
    db_user = UserModel(
        email=user_in.email,
        username=user_in.full_name or user_in.email.split("@")[0],
        hashed_password=hashed_password,
        is_active=user_in.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=schemas.user.User)
def read_users_me(
    current_user: UserModel = Depends(security.get_current_active_user)
) -> Any:
    """
    Get current user.
    (現在のユーザーを取得します。)
    """
    return current_user

# 他のユーザー関連エンドポイント (例: ユーザー一覧取得、特定ユーザー取得など)
# @router.get("/", response_model=List[schemas.user.User])
# def read_users(
#     db: Session = Depends(get_db),
#     skip: int = 0,
#     limit: int = 100,
#     # current_user: UserModel = Depends(security.get_current_active_user) # 認証が必要な場合
# ) -> Any:
#     """
#     Retrieve users.
#     (ユーザー一覧を取得します。)
#     """
#     # users = crud_user.get_users(db, skip=skip, limit=limit)
#     users = db.query(UserModel).offset(skip).limit(limit).all()
#     return users