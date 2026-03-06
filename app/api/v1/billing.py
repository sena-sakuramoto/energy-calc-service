"""Billing API endpoints for Stripe subscriptions and project passes."""

from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.stripe_billing import (
    BillingConfigurationError,
    billing_public_config,
    check_subscription,
    confirm_checkout_session,
    construct_webhook_event,
    create_checkout_session,
    process_webhook_event,
)

router = APIRouter(prefix="/billing", tags=["Billing"])


class CheckoutRequest(BaseModel):
    email: EmailStr
    plan: Literal["energy_monthly", "project_pass"] = "energy_monthly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class ConfirmCheckoutRequest(BaseModel):
    session_id: str


@router.get("/config")
async def billing_config() -> dict:
    """Return non-secret billing configuration for frontend gating."""
    return billing_public_config()


@router.get("/status")
async def subscription_status(email: EmailStr, db: Session = Depends(get_db)) -> dict:
    """Return paid-access status for a given email."""
    return check_subscription(str(email), db=db)


@router.post("/checkout")
async def create_checkout(req: CheckoutRequest) -> dict:
    """Create a Stripe Checkout session for a supported billing plan."""
    try:
        return create_checkout_session(
            customer_email=str(req.email),
            plan=req.plan,
            success_url=req.success_url,
            cancel_url=req.cancel_url,
        )
    except BillingConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/confirm")
async def confirm_checkout(
    req: ConfirmCheckoutRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Confirm a finished checkout session and grant one-off access if needed."""
    try:
        return confirm_checkout_session(session_id=req.session_id, db=db)
    except BillingConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    """Receive Stripe webhook events for billing synchronization."""
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    try:
        event = construct_webhook_event(payload=payload, signature=signature)
        return process_webhook_event(event=event, db=db)
    except BillingConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
