# backend/app/schemas/project.py
# -*- coding: utf-8 -*-
from typing import Optional, List
from pydantic import BaseModel

# from .item import Item # プロジェクトがアイテムを持つ場合など (例)
# from .user import User # オーナー情報をネストする場合 (例)

class ProjectBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    # 他のプロジェクト属性

class ProjectCreate(ProjectBase):
    name: str # 作成時は名前を必須にするなど

class ProjectUpdate(ProjectBase):
    pass # 更新時は全てオプション

class ProjectInDBBase(ProjectBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True # Pydantic V2

# APIレスポンス用
class Project(ProjectInDBBase):
    # items: List[Item] = [] # ネストされたアイテムリスト (例)
    # owner: Optional[User] = None # オーナー情報 (例)
    pass

class ProjectInDB(ProjectInDBBase):
    pass