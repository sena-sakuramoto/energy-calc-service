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
    """エネルギー計算実行（バリデーション機能付き）"""
    from app.validators.building_validators import validate_calculation_input, format_validation_report
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="権限がありません")

    # 入力データバリデーション
    try:
        validation_errors, can_calculate = validate_calculation_input(input_data.dict())
        
        # 重要なエラーがある場合は計算を停止
        if not can_calculate:
            validation_report = format_validation_report(validation_errors)
            raise HTTPException(
                status_code=422, 
                detail=f"入力データに問題があります:\n{validation_report}"
            )
        
        # 警告がある場合はログに記録
        if validation_errors:
            import logging
            logger = logging.getLogger(__name__)
            validation_report = format_validation_report(validation_errors)
            logger.warning(f"プロジェクト{project_id}の計算で警告発生:\n{validation_report}")
        
    except Exception as validation_error:
        raise HTTPException(
            status_code=500, 
            detail=f"入力データ検証中にエラーが発生しました: {str(validation_error)}"
        )

    # 計算実行
    try:
        result = perform_energy_calculation(input_data)
        
        # 計算結果をプロジェクトに保存
        project.input_data = input_data.dict()
        project.result_data = result.dict()
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return result
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"計算パラメータエラー: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"計算中にエラーが発生しました: {str(e)}")
