# backend/app/schemas/user.py
# -*- coding: utf-8 -*-
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """
    Base Pydantic model for User, containing common attributes.
    (ユーザーの基本Pydanticモデル、共通属性を含む。)
    """
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    username: Optional[str] = None

class UserCreate(UserBase):
    """
    Pydantic model for creating a new user. Expects a password.
    (新規ユーザー作成用のPydanticモデル。パスワードを期待する。)
    """
    password: str

class UserUpdate(UserBase):
    """
    Pydantic model for updating an existing user. Password is optional.
    (既存ユーザー更新用のPydanticモデル。パスワードはオプション。)
    """
    password: Optional[str] = None

# This Pydantic model is intended for API responses.
# It inherits from UserBase and adds the id.
# It explicitly does NOT include sensitive information like hashed_password.
class User(UserBase):
    """
    Pydantic model representing a User for API responses.
    (APIレスポンス用のユーザーを表すPydanticモデル。)
    """
    id: int

    model_config = {"from_attributes": True}

# This Pydantic model represents a user as stored in the database,
# including the hashed_password. It's typically used internally.
class UserInDBBase(UserBase):
    """
    Base Pydantic model for User data as stored in the database.
    (データベースに保存されるユーザーデータの基本Pydanticモデル。)
    """
    id: Optional[int] = None
    hashed_password: str

    model_config = {"from_attributes": True}

class UserInDB(UserInDBBase):
    """
    Pydantic model representing a User as stored in the database.
    (データベースに保存されるユーザーを表すPydanticモデル。)
    """
    pass