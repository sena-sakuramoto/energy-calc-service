# デプロイメント手順

## フロントエンド (GitHub Pages)

### 自動デプロイ
1. コードをmainブランチにプッシュ
2. GitHub Actionsが自動実行
3. `https://sena-sakuramoto.github.io/energy-calc-service/` で公開

### 手動設定（初回のみ）
1. GitHubリポジトリ → Settings → Pages
2. Source: `GitHub Actions` を選択
3. 保存

## バックエンド (Railway)

### 1. Railway プロジェクト作成
```bash
# Railway CLI インストール（オプション）
npm install -g @railway/cli

# またはWebコンソールから
# https://railway.app/new
```

### 2. GitHub連携でデプロイ
1. Railway コンソール → New Project
2. Deploy from GitHub repo を選択
3. `sena-sakuramoto/energy-calc-service` を選択
4. Root Directory: `backend`

### 3. 環境変数設定
Railway の Variables タブで以下を設定：

```env
# データベース（Railway PostgreSQL自動生成）
DATABASE_URL=${{ Postgres.DATABASE_URL }}

# JWT設定
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS設定
CORS_ORIGINS=https://sena-sakuramoto.github.io,http://localhost:3000

# 環境
ENVIRONMENT=production

# アプリケーション設定
PROJECT_NAME=Energy Calculation Service
API_PREFIX=/api/v1
```

### 4. PostgreSQL追加
1. Railway コンソール → Add Service → PostgreSQL
2. 自動的に `DATABASE_URL` が設定される

### 5. デプロイ設定確認
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## フロントエンドとバックエンドの接続

### フロントエンド設定更新
デプロイ後のRailway URLを取得して、`frontend/next.config.js` を更新：

```javascript
// 本番環境のAPI URL
env: {
    API_URL: 'https://your-app-name.up.railway.app/api/v1',
},
```

### CORS設定
バックエンドの環境変数 `CORS_ORIGINS` にフロントエンドURLを追加：
```
CORS_ORIGINS=https://sena-sakuramoto.github.io,https://your-frontend-domain.com
```

## データベース初期化

### 1. Railway Console でSQLを実行
```sql
-- ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトテーブル  
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 初期データ投入（オプション）
```sql
-- テスト用ユーザー
INSERT INTO users (email, username, hashed_password) VALUES 
('test@example.com', 'testuser', '$2b$12$hashedpassword');
```

## 確認とテスト

### 1. バックエンドAPI確認
```bash
curl https://your-app-name.up.railway.app/
curl https://your-app-name.up.railway.app/api/v1/
```

### 2. フロントエンド確認
- `https://sena-sakuramoto.github.io/energy-calc-service/`
- ユーザー登録・ログイン機能
- API通信テスト

### 3. 統合テスト
- フロントエンドからバックエンドAPI呼び出し
- データベース読み書き
- 認証フロー

## トラブルシューティング

### よくある問題
1. **CORS エラー**: `CORS_ORIGINS` 環境変数を確認
2. **データベース接続エラー**: `DATABASE_URL` を確認
3. **認証エラー**: `SECRET_KEY` を確認
4. **ビルドエラー**: `requirements.txt` の依存関係を確認

### ログ確認
```bash
# Railway CLI
railway logs

# または Railway Web Console の Logs タブ
```