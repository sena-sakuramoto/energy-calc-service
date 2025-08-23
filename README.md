# energy-calc-service
建築物省エネ法対応計算サービス

# 省エネ計算サービス

これは建築物省エネ法に対応した計算を行うためのWebアプリケーションです。

## 主な機能
- 建物情報の入力
- 外皮性能の計算
- 一次エネルギー消費量の計算

## 技術構成
- **フロントエンド**: Next.js + React + Tailwind CSS
- **バックエンド**: FastAPI + PostgreSQL
- **認証**: JWT
- **ファイル出力**: Excel (openpyxl), PDF (reportlab)

## デプロイ方法

### フロントエンド (Vercel推奨)
1. GitHub連携でVercelに接続
2. フロントエンドディレクトリを指定: `frontend`
3. 環境変数設定: `API_URL=https://your-backend-url.com/api/v1`

### バックエンド (Railway/Render推奨)
1. GitHub連携でRailway/Renderに接続
2. バックエンドディレクトリを指定: `backend`
3. PostgreSQLデータベース追加
4. 環境変数設定:
   - `DATABASE_URL`: PostgreSQL接続URL
   - `SECRET_KEY`: JWT用シークレットキー

## ローカル開発

### バックエンド起動
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### フロントエンド起動
```bash
cd frontend
npm install
npm run dev
```