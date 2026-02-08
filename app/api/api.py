# backend/app/api/api.py
# -*- coding: utf-8 -*-
"""Primary API router for authenticated management endpoints."""

from fastapi import APIRouter

from app.api.endpoints import auth, users, projects, calc, report

api_router = APIRouter()

# Auth endpoints (login / token verification)
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# User management
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Project CRUD + calculation/reporting lives under /projects
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(calc.router, prefix="/projects", tags=["Calculation"])
api_router.include_router(report.router, prefix="/projects", tags=["Report"])
