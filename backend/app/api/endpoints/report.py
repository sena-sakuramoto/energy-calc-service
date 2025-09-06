# backend/app/api/endpoints/report.py
# -*- coding: utf-8 -*-
from typing import Any, Dict
import io

from fastapi import APIRouter, Depends, HTTPException, status, Path
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core import security
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
from app.services.report import generate_pdf_report, get_official_report_from_api

router = APIRouter()

def _get_project_data_for_report(db: Session, project_id: int, current_user: UserModel) -> Dict:
    """
    Retrieves project details for reporting.
    This is a placeholder. Replace with actual database queries.
    """
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id, ProjectModel.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or not authorized for the current user.")

    # This data structure should match what the frontend sends and what the service expects.
    # The service function `get_official_report_from_api` expects a dictionary
    # with a "building" key.
    project_data_for_report = {
        "building": {
            "name": project.name,
            "description": project.description,
            # These are dummy values. In a real scenario, they should be stored in the ProjectModel.
            "climate_zone": project.input_data.get("building", {}).get("climate_zone", 6), # Default to 6 if not present
            "building_type": project.input_data.get("building", {}).get("building_type", "office"), # Default to office
            "total_floor_area": project.input_data.get("building", {}).get("total_floor_area", 500.0),
        }
        # Add other necessary data for the report here
    }

    return project_data_for_report

@router.get(
    "/{project_id}/report/excel",
    response_class=StreamingResponse,
    summary="Download Official PDF Report",
    description="Generates and downloads an official PDF report for the specified project by calling the external API.",
)
async def download_official_report_endpoint(
    project_id: int = Path(..., title="Project ID", description="The ID of the project to generate the report for."),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(security.get_current_active_user)
) -> StreamingResponse:
    """
    Download official PDF report for a specific project.
    The endpoint is kept as `/excel` for frontend compatibility, but it returns a PDF.
    """
    project_data = _get_project_data_for_report(db, project_id, current_user)

    try:
        pdf_content = get_official_report_from_api(project_data)
        
        file_name = f"{project_data.get('building',{}).get('name', 'project')}_official_report.pdf".replace(" ", "_")
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={file_name}"}
        )

    except Exception as e:
        # Log the error for debugging
        print(f"Error generating official report: {e}")
        # Return a user-friendly error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate the official report. Reason: {e}"
        )

# The old PDF generation endpoint (can be kept or removed)
@router.get(
    "/{project_id}/report/pdf",
    response_class=StreamingResponse,
    summary="Download PDF Report",
    description="Generates and downloads a PDF report for the specified project.",
    deprecated=True
)
async def download_pdf_report_endpoint(
    project_id: int = Path(..., title="Project ID", description="The ID of the project to generate the report for."),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(security.get_current_active_user)
) -> StreamingResponse:
    raise HTTPException(status_code=404, detail="This endpoint is deprecated. Use the /report/excel endpoint to get the official PDF report.")
