# SEO・Google Analytics・Search Console 設定ガイド

## 1. Google Analytics 4 (GA4) 設定

### Step 1: GA4プロパティ作成
1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 「管理」→「プロパティを作成」
3. プロパティ情報入力:
   - プロパティ名: `楽々省エネ計算サービス`
   - タイムゾーン: `日本`
   - 通貨: `日本円`

### Step 2: ウェブストリーム設定
1. 「データストリーム」→「ウェブ」
2. ウェブサイトURL: `https://rakuraku-energy.archi-prisma.co.jp`
3. ストリーム名: `楽々省エネ計算 - メイン`
4. **測定ID** (G-XXXXXXXXXX) をコピー

### Step 3: コードに測定ID設定
`frontend/src/components/SEOHead.jsx` の以下を置き換え:
```javascript
// 変更前
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
gtag('config', 'GA_MEASUREMENT_ID', {

// 変更後（実際の測定IDに置き換え）
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
gtag('config', 'G-XXXXXXXXXX', {
```

## 2. Google Search Console 設定

### Step 1: プロパティ追加
1. [Google Search Console](https://search.google.com/search-console/) にアクセス
2. 「プロパティを追加」→「URLプレフィックス」
3. URL: `https://rakuraku-energy.archi-prisma.co.jp`

### Step 2: 所有権の確認
**方法A: HTMLメタタグ（推奨）**
1. 「HTMLタグ」選択
2. 提供されたメタタグをコピー
3. `SEOHead.jsx` の以下を置き換え:
```javascript
// 変更前
<meta name="google-site-verification" content="GOOGLE_VERIFICATION_CODE" />

// 変更後（実際のコードに置き換え）
<meta name="google-site-verification" content="abcdef123456..." />
```

**方法B: HTMLファイル**
1. 提供されたHTMLファイルをダウンロード
2. `frontend/public/` フォルダに配置
3. GitHubにプッシュしてデプロイ

### Step 3: サイトマップ送信
1. 所有権確認後、「サイトマップ」メニュー
2. サイトマップURL: `https://rakuraku-energy.archi-prisma.co.jp/sitemap.xml`
3. 「送信」クリック

## 3. サイトマップ作成

### 自動生成設定
`frontend/next.config.js` を作成/更新:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async generateSitemap() {
    const pages = [
      '',
      '/about',
      '/contact',
      '/pricing',
      '/register',
      '/login',
      '/calculator',
      '/system/status'
    ];
    
    return pages.map(page => ({
      url: `https://rakuraku-energy.archi-prisma.co.jp${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1 : 0.8
    }));
  }
}

module.exports = nextConfig;
```

## 4. robots.txt 作成

`frontend/public/robots.txt` を作成:
```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://rakuraku-energy.archi-prisma.co.jp/sitemap.xml

# Disallow admin pages
Disallow: /admin/
```

## 5. OGP画像作成

### 推奨サイズ・内容
- **サイズ:** 1200x630px
- **ファイル名:** `og-image.png`
- **配置先:** `frontend/public/images/`
- **内容:**
  - サービスロゴ
  - 「楽々省エネ計算」
  - 「建築設計者向け省エネ計算ツール」
  - Archi-Prismaロゴ

## 6. 構造化データ（JSON-LD）

既に `SEOHead.jsx` に実装済み:
- WebApplicationスキーマ
- 会社情報
- 価格情報（無料）
- 機能一覧

## 7. ページ別SEO設定例

### トップページ
```javascript
<Layout
  title="楽々省エネ計算 - 建築物エネルギー消費性能計算サービス"
  description="建築設計者向けの省エネ法計算サービス。BEI計算、モデル建物法対応で設計業務を効率化。"
  keywords="省エネ計算,BEI計算,建築物エネルギー消費性能,モデル建物法"
  url="https://rakuraku-energy.archi-prisma.co.jp"
>
```

### お問い合わせページ
```javascript
<Layout
  title="お問い合わせ - 楽々省エネ計算"
  description="楽々省エネ計算サービスへのお問い合わせ・サポート。不具合報告、機能要望など。"
  keywords="お問い合わせ,サポート,建築設計サポート"
  url="https://rakuraku-energy.archi-prisma.co.jp/contact"
>
```

## 8. 設定後の確認項目

### Analytics確認
1. リアルタイムユーザー数が表示されるか
2. ページビューがトラッキングされるか
3. イベント（フォーム送信等）が記録されるか

### Search Console確認
1. インデックス登録されているか
2. 検索結果での表示確認
3. サイトマップが正常に読み込まれるか
4. モバイルフレンドリーテスト

### SEOツール確認
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [モバイルフレンドリーテスト](https://search.google.com/test/mobile-friendly)
- [構造化データテストツール](https://search.google.com/structured-data/testing-tool)

## 9. 継続的な改善

### 月次チェック項目
- Analytics レポート確認
- 検索順位チェック
- ページ速度測定
- ユーザビリティ改善
- コンテンツ追加・更新

### キーワード戦略
**メインキーワード:**
- 省エネ計算
- BEI計算
- 建築物エネルギー消費性能

**ロングテールキーワード:**
- 建築 省エネ計算 ツール
- BEI計算 無料
- モデル建物法 計算