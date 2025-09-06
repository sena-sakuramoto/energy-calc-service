# 緊急時ロールバック手順

## サイトダウンの場合

### 1. 最新コミットをロールバック
```bash
git revert HEAD --no-edit
git push
```

### 2. 特定コミットをロールバック（Firebase移行）
```bash
git revert 831222c --no-edit
git push
```

### 3. 安全な最終動作バージョン
- コミット: 464145f "Remove demo account information from login page"
- この時点では認証は動作していた

### 4. 強制リセット（最終手段）
```bash
git reset --hard 464145f
git push --force
```

## 緊急連絡先
- Firebase Console: https://console.firebase.google.com/
- GitHub Actions: https://github.com/sena-sakuramoto/energy-calc-service/actions