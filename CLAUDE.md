# CLAUDE.md — 楽々省エネ計算

## What
BEI（建築物エネルギー指標）計算・省エネ適合性判定と関連料金提示サービス。

## Tech Stack
- Frontend: Next.js 14 + React 18 + Tailwind CSS
- Backend: FastAPI (Python) + PostgreSQL
- PDF: jsPDF + jsPDF-autotable
- Testing: Playwright (E2E), pytest
- Deploy: GitHub Pages (frontend) + Render (backend)

## Commands
```bash
# Frontend
cd frontend && npm run dev && npm run build && npm run test:e2e
# Backend
cd backend && pytest && uvicorn app.main:app --reload
```

## Status
MVP完了、本番運用中。BEI計算完全実装（建築物省エネ法準拠）。
