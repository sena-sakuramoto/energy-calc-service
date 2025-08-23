# 🏢 建築物省エネ法対応 計算サービス

[![Deploy Status](https://github.com/sena-sakuramoto/energy-calc-service/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/sena-sakuramoto/energy-calc-service/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org)
[![Next.js](https://img.shields.io/badge/Next.js-v14-black.svg)](https://nextjs.org)

> 建築設計者のための省エネ基準適合性判定計算を **簡単・正確・迅速** に実行できるWebアプリケーション

## 🌟 概要

このアプリケーションは建築物省エネ法に完全準拠した外皮性能（UA値・ηA値）と一次エネルギー消費量の計算を行い、省エネ基準適合性を自動判定します。建築設計の実務で即座に活用でき、申請書類の作成まで支援します。

### ✨ 主な特徴

- 🎯 **高精度計算**: 建築物省エネ法の最新基準に完全準拠
- 🚀 **高速処理**: 複雑な計算を数秒で完了
- 📊 **視覚的結果**: わかりやすいグラフと表で結果表示
- 📋 **レポート自動生成**: PDF・Excel形式で申請書類を出力
- 🔐 **セキュア**: 企業レベルのセキュリティ対策
- 📱 **レスポンシブ**: PC・タブレット・スマートフォン対応

## 🎯 対応範囲

### 計算対象
- **外皮性能**: UA値（外皮平均熱貫流率）、ηA値（平均日射熱取得率）
- **一次エネルギー消費量**: 暖房・冷房・換気・給湯・照明の各用途別計算
- **省エネ適合性判定**: 地域区分・建物用途別基準値との自動比較

### 対応地域区分
- 全国8地域区分に対応
- 各地域の気候特性を反映した基準値設定

### 対応建物用途
- 事務所 / 住宅 / 店舗 / ホテル / 病院 / 学校

## 🏗️ 技術構成

### アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│ (PostgreSQL)    │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Python 3.11   │    │ • User Data     │
│ • Tailwind CSS  │    │ • Pydantic      │    │ • Projects      │
│ • Axios         │    │ • SQLAlchemy    │    │ • Calculations  │
│ • Chart.js      │    │ • JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### フロントエンド
- **フレームワーク**: Next.js 14 (React 18)
- **スタイリング**: Tailwind CSS
- **HTTP クライアント**: Axios
- **チャート**: Chart.js, React-Chart.js-2
- **フォーム**: Formik + Yup
- **アイコン**: React Icons

### バックエンド
- **フレームワーク**: FastAPI (Python 3.11+)
- **データベース**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **認証**: JWT (JSON Web Token)
- **バリデーション**: Pydantic v2
- **ファイル出力**: openpyxl (Excel), reportlab (PDF)

### インフラストラクチャ
- **フロントエンド**: GitHub Pages (静的サイト)
- **バックエンド**: Railway / Render
- **データベース**: PostgreSQL (Railway/Render)
- **CI/CD**: GitHub Actions

## 🚀 デプロイ済みアプリケーション

### 🌐 ライブデモ
**フロントエンド**: https://sena-sakuramoto.github.io/energy-calc-service/

*バックエンドはRailway/Renderでデプロイ後に連携*

## 📦 ローカル開発環境構築

### 前提条件
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 14+
- Git

### 1️⃣ リポジトリクローン
```bash
git clone https://github.com/sena-sakuramoto/energy-calc-service.git
cd energy-calc-service
```

### 2️⃣ バックエンド設定
```bash
cd backend

# 仮想環境作成・有効化
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定

# データベース初期化
python init_db.py

# サーバー起動
uvicorn main:app --reload
```

### 3️⃣ フロントエンド設定
```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localファイルを編集してAPI URLを設定

# 開発サーバー起動
npm run dev
```

### 4️⃣ アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/api/v1/docs

## 📁 プロジェクト構造

```
energy-calc-service/
├── 📂 frontend/                 # Next.js フロントエンド
│   ├── 📂 src/
│   │   ├── 📂 components/       # 再利用可能コンポーネント
│   │   ├── 📂 pages/           # ページコンポーネント
│   │   ├── 📂 contexts/        # React Context (認証など)
│   │   ├── 📂 utils/           # ユーティリティ関数
│   │   └── 📂 styles/          # スタイルシート
│   ├── 📄 package.json
│   └── 📄 next.config.js
├── 📂 backend/                  # FastAPI バックエンド
│   ├── 📂 app/
│   │   ├── 📂 api/             # API エンドポイント
│   │   ├── 📂 core/            # 設定・セキュリティ
│   │   ├── 📂 models/          # データモデル
│   │   ├── 📂 schemas/         # Pydantic スキーマ
│   │   ├── 📂 services/        # ビジネスロジック
│   │   └── 📂 middleware/      # ミドルウェア
│   ├── 📄 main.py              # エントリーポイント
│   ├── 📄 requirements.txt
│   └── 📄 Procfile            # デプロイ用
├── 📂 .github/workflows/       # GitHub Actions CI/CD
├── 📄 README.md
├── 📄 DEPLOY.md                # デプロイ手順詳細
└── 📄 .gitignore
```

## 🔧 API エンドポイント

### 認証
- `POST /api/v1/auth/token` - ログイン
- `POST /api/v1/users/` - ユーザー登録
- `GET /api/v1/users/me` - 現在ユーザー情報

### プロジェクト管理
- `GET /api/v1/projects/` - プロジェクト一覧
- `POST /api/v1/projects/` - プロジェクト作成
- `GET /api/v1/projects/{id}/` - プロジェクト詳細
- `PUT /api/v1/projects/{id}/` - プロジェクト更新

### 計算実行
- `POST /api/v1/projects/{id}/calculate/` - 省エネ計算実行

### レポート生成
- `GET /api/v1/projects/{id}/report/pdf/` - PDF レポート
- `GET /api/v1/projects/{id}/report/excel/` - Excel レポート

## 🛡️ セキュリティ機能

- **認証・認可**: JWT ベースの安全な認証
- **Rate Limiting**: API アクセス制限 (100req/分)
- **CORS 保護**: クロスオリジン制限
- **SQLインジェクション対策**: 入力値検証
- **XSS 防止**: セキュリティヘッダー設定
- **パスワード強度**: 強力なパスワード要求
- **ログ記録**: 詳細なアクセスログ

## 📊 計算仕様

### 外皮性能計算
- **UA値**: 外皮各部位の熱貫流率と面積から加重平均算出
- **ηA値**: 開口部の日射熱取得率から算出
- **基準判定**: 地域区分別基準値との自動比較

### 一次エネルギー消費量計算
- **対象設備**: 暖房・冷房・換気・給湯・照明
- **計算方法**: 建物用途・設備効率を考慮した詳細計算
- **基準比較**: 建物用途別基準値との比較・省エネ率算出

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチ作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエスト作成

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

## 👥 開発者

- **開発者**: [Sena Sakuramoto](https://github.com/sena-sakuramoto)
- **協力**: [Claude Code](https://claude.ai/code) による開発支援

## 📞 サポート・問い合わせ

- **Issues**: [GitHub Issues](https://github.com/sena-sakuramoto/energy-calc-service/issues)
- **ドキュメント**: [デプロイ手順詳細](DEPLOY.md)

## 🎉 謝辞

建築物省エネ法の基準値・計算方法は国土交通省の資料を参考にしています。
このプロジェクトは建築設計の実務効率化を目的として開発されました。

---

<div align="center">
  <p><strong>🌱 持続可能な建築設計を、もっと簡単に</strong></p>
  <p>Made with ❤️ by developers who care about sustainable architecture</p>
</div>