# backend/app/api/endpoints/projects.py
# -*- coding: utf-8 -*-
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas # schemas/__init__.py でインポートしている場合
# または個別に:
# from app.schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate
# from app.schemas.user import User as UserSchema
from app.models.project import Project as ProjectModel # SQLAlchemyモデル
from app.models.user import User as UserModel # SQLAlchemyモデル (オーナー特定用)
from app.db.session import get_db
from app.core import security
# from app.crud import project as crud_project # CRUD操作用のモジュール (あれば)

router = APIRouter()

@router.post("/", response_model=schemas.project.Project) # スキーマ名は適宜調整
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: schemas.project.ProjectCreate, # スキーマ名は適宜調整
    current_user: UserModel = Depends(security.get_current_active_user)
) -> Any:
    """
    Create new project for the current user.
    (現在のユーザーのために新しいプロジェクトを作成します。)
    """
    # project = crud_project.create_project_with_owner(db=db, obj_in=project_in, owner_id=current_user.id)
    # 簡単な例:
    db_project = ProjectModel(**project_in.model_dump(), owner_id=current_user.id) # Pydantic V2: .model_dump(), V1: .dict()
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[schemas.project.Project]) # スキーマ名は適宜調整
def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(security.get_current_active_user)
) -> Any:
    """
    Retrieve projects for the current user.
    (現在のユーザーのプロジェクト一覧を取得します。)
    """
    # projects = crud_project.get_projects_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)
    # 簡単な例:
    projects = db.query(ProjectModel).filter(ProjectModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=schemas.project.Project) # スキーマ名は適宜調整
def read_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user: UserModel = Depends(security.get_current_active_user)
) -> Any:
    """
    Get project by ID for the current user.
    (現在のユーザーのためにIDでプロジェクトを取得します。)
    """
    # project = crud_project.get(db=db, id=project_id)
    # 簡単な例:
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id, ProjectModel.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

# (オプション) プロジェクト更新・削除エンドポイント
# @router.put("/{project_id}", response_model=schemas.project.Project)
# ...
# @router.delete("/{project_id}", response_model=schemas.project.Project) # または Msg スキーマ
# ...