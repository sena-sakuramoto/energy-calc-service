# Firebase 設定手順

## 設定後に必要な環境変数

Firebase コンソールからコピーした設定を、以下の場所に追加してください：

### GitHub Secrets（本番環境用）
GitHub リポジトリの Settings → Secrets and variables → Actions で以下を追加：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...（あなたのAPIキー）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rakuraku-energy-calc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rakuraku-energy-calc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rakuraku-energy-calc.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### ローカル開発用（オプション）
`frontend/.env.local` ファイルを作成して同じ値を設定

## Firebase コンソールでの設定確認

### 1. Authentication → Sign-in method
- Google: 有効
- メール/パスワード: 無効（LocalStorageを使用）

### 2. Authentication → Settings → 承認済みドメイン
- `rakuraku-energy.archi-prisma.co.jp`
- `sena-sakuramoto.github.io`  
- `localhost`

### 3. Project Settings → General → アプリ
- Web アプリが登録済み
- Firebase SDK設定が取得済み

## 完了後の動作確認

1. サイトにアクセス: https://rakuraku-energy.archi-prisma.co.jp/login
2. 「Googleアカウントでログイン」をクリック
3. Googleアカウント選択画面が表示される
4. ログイン成功でダッシュボードに遷移

## トラブルシューティング

### Google認証が動かない場合
- 承認済みドメインに現在のドメインが含まれているか確認
- ブラウザの開発者ツールでConsoleエラーを確認
- Firebase設定値が正しく設定されているか確認

### 環境変数エラーの場合
- GitHub Secretsに全ての環境変数が設定されているか確認
- 環境変数名が `NEXT_PUBLIC_` で始まっているか確認
- GitHub Actionsを再実行してみる