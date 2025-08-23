# backend/app/api/endpoints/report.py
# -*- coding: utf-8 -*-
from typing import Any, Dict # Dictを追加
import io # io.BytesIO を使うため

from fastapi import APIRouter, Depends, HTTPException, status, Path
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core import security
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
# from app.models.result import ResultDataModel # 計算結果モデル (もしあれば)
# from app.crud import project as crud_project # プロジェクト用CRUD (もしあれば)
# from app.crud import result as crud_result # 結果用CRUD (もしあれば)
from app.services.report import generate_pdf_report, generate_excel_report

router = APIRouter()

# --- Helper function to get project and its result data (dummy implementation) ---
# 実際にはデータベースからプロジェクトと計算結果を取得するロジックに置き換えてください。
# この関数は、このファイル内でのみ使うので、グローバルである必要はありません。
def _get_project_and_result_data_for_report(db: Session, project_id: int, current_user: UserModel) -> tuple[Dict, Dict]:
    """
    Retrieves project details and its calculation result data for reporting.
    (レポート用にプロジェクト詳細とその計算結果データを取得します。)
    This is a placeholder. Replace with actual database queries.
    (これはプレースホルダーです。実際のデータベースクエリに置き換えてください。)
    """
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id, ProjectModel.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or not authorized for the current user.")

    # --- ダミーの計算結果データ ---
    # 実際には、project_id に紐づく計算結果をデータベースから取得するか、
    # 計算サービスを呼び出して結果を取得します。
    # フロントエンドの result.jsx で表示される項目を参考にしています。
    result_data = {
        "overall_conformity": True,
        "energy": {
            "bei": 0.85,
            "design_energy_total": 120.5, # GJ/年
            "standard_energy_total": 150.0, # GJ/年
            "conformity": True, # 一次エネルギー消費量の適合性
            "energy_by_use": {
                "heating": 30.2,
                "cooling": 25.1,
                "ventilation": 15.0,
                "hot_water": 35.2,
                "lighting": 15.0,
            }
        },
        "envelope": {
            "ua_value": 0.55, # W/m²K
            "ua_standard": 0.60, # W/m²K
            "eta_value": 2.5, # ηAC値など
            "eta_standard": 2.8,
        },
        "bels_rating": 5, # 星の数
        "zeb_level": "ZEB Oriented",
        # input_data はプロジェクト情報から取得するか、別途DBに保存
        # "input_data": {
        #     "building": {
        #         "building_type": "事務所",
        #         "total_floor_area": 1000.0,
        #         # ... その他 building 情報
        #     }
        # }
    }
    # --- ダミーの計算結果データここまで ---

    project_data_for_report = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at.isoformat() if project.created_at else None, # 日付はISO形式推奨
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "owner_id": project.owner_id,
        "owner_email": current_user.email, # レポートにオーナー情報も載せる場合
        # フロントエンドの input_data.building に対応する情報もここに入れる
        # 例: "building_type": project.building_type (ProjectModelに属性がある場合)
        "building_type": "事務所ビル (例)", # ダミー
        "total_floor_area": 1234.5, # ダミー
    }

    return project_data_for_report, result_data

# --- Endpoints ---

@router.get(
    "/{project_id}/report/pdf",
    response_class=StreamingResponse,
    summary="Download PDF Report", # OpenAPIドキュメント用の要約
    description="Generates and downloads a PDF report for the specified project.", # 詳細説明
)
async def download_pdf_report_endpoint( # 関数名を変更 (download_pdf_report はサービス関数と被る可能性)
    project_id: int = Path(..., title="Project ID", description="The ID of the project to generate the report for."),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(security.get_current_active_user)
) -> StreamingResponse:
    """
    Download PDF report for a specific project.
    (特定のプロジェクトのPDFレポートをダウンロードします。)
    """
    project_data, result_data = _get_project_and_result_data_for_report(db, project_id, current_user)

    if not result_data: # result_data が取得できなかった場合の処理 (例)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calculation result data not found for this project.")

    pdf_content_buffer = generate_pdf_report(project_data, result_data)

    file_name = f"{project_data.get('name', 'project')}_report.pdf".replace(" ", "_")
    return StreamingResponse(
        iter([pdf_content_buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={file_name}"}
    )

@router.get(
    "/{project_id}/report/excel",
    response_class=StreamingResponse,
    summary="Download Excel Report",
    description="Generates and downloads an Excel report for the specified project.",
)
async def download_excel_report_endpoint( # 関数名を変更
    project_id: int = Path(..., title="Project ID", description="The ID of the project to generate the report for."),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(security.get_current_active_user)
) -> StreamingResponse:
    """
    Download Excel report for a specific project.
    (特定のプロジェクトのExcelレポートをダウンロードします。)
    """
    project_data, result_data = _get_project_and_result_data_for_report(db, project_id, current_user)

    if not result_data: # result_data が取得できなかった場合の処理 (例)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calculation result data not found for this project.")

    excel_content_buffer = generate_excel_report(project_data, result_data)

    file_name = f"{project_data.get('name', 'project')}_report.xlsx".replace(" ", "_")
    return StreamingResponse(
        iter([excel_content_buffer.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={file_name}"}
    )