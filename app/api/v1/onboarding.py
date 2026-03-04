"""Bulk onboarding for partner distributor networks (e.g., Technostructure)."""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


class OnboardingRequest(BaseModel):
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    partner_code: Optional[str] = None
    source: str = "technostructure"


@router.post("/register")
async def register_partner_user(req: OnboardingRequest) -> dict:
    """パートナーネットワーク経由のユーザー登録。"""
    return {
        "status": "registered",
        "message": f"{req.company_name}様の登録を受け付けました。ご案内メールをお送りします。",
        "source": req.source,
    }
