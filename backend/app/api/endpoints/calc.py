# backend/app/api/endpoints/calc.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.calculation import CalculationInput, CalculationResult
from app.services.calculation import perform_energy_calculation

router = APIRouter()

@router.post("/{project_id}/calculate", response_model=CalculationResult)
def calculate_energy(
    project_id: int,
    input_data: CalculationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """エネルギー計算実行"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="権限がありません")

    # ここで計算サービスを呼び出す
    try:
        result = perform_energy_calculation(input_data)
        # 計算結果をプロジェクトに保存
        project.input_data = input_data.dict() # Pydanticモデルをdictに変換して保存
        project.result_data = result.dict()
        db.add(project)
        db.commit()
        db.refresh(project)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"計算中にエラーが発生しました: {str(e)}")
