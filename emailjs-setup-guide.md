# EmailJS設定ガイド

## 1. EmailJSアカウントでの設定手順

### サービス設定
1. [EmailJS Dashboard](https://dashboard.emailjs.com/admin) にログイン
2. 「Add New Service」→「Gmail」選択
3. **重要:** `rse-support@archi-prisma.co.jp` のGoogleアカウントで認証
   - このグループメールアカウントが送信元になります
   - 問い合わせ受信 & 自動返信の両方でこのアドレスを使用します

### シンプルなメールフロー
```
問い合わせ者 → rse-support@archi-prisma.co.jp (グループメール)
                          ↓
rse-support@archi-prisma.co.jp → 問い合わせ者 (自動返信)
```

### テンプレート設定（メイン用）
**Template ID:** `template_contact_form`

**Settings:**
- Service: 上で作成したGmailサービス
- Template Name: お問い合わせフォーム

**Content:**
```
Subject: 【楽々省エネ計算】{{category}} - {{subject}}

From Name: 楽々省エネ計算サポートチーム
From Email: rse-support@archi-prisma.co.jp
Reply To: {{from_email}}

--- メール本文テンプレート ---
お問い合わせを受信しました。

■ 送信日時: {{timestamp}}
■ お名前: {{from_name}}
■ 会社名: {{company}}
■ メールアドレス: {{from_email}}
■ カテゴリ: {{category}}
■ 件名: {{subject}}

■ お問い合わせ内容:
{{message}}

---
このメールは「楽々省エネ計算サービス」のお問い合わせフォームから送信されました。
サービスURL: https://rakuraku-energy.archi-prisma.co.jp
管理者: {{to_email}}
```

**To Email:** 
- Primary: rse-support@archi-prisma.co.jp (グループメールのみ)

### 自動返信テンプレート設定（オプション）
**Template ID:** `template_auto_reply`

**Content:**
```
Subject: 【楽々省エネ計算】お問い合わせを受付いたしました

From Name: 楽々省エネ計算サポートチーム  
From Email: rse-support@archi-prisma.co.jp
To Email: {{to_email}}

--- 自動返信メール ---
{{user_name}} 様

この度は「楽々省エネ計算サービス」にお問い合わせいただき、誠にありがとうございます。

以下の内容でお問い合わせを受付いたしました。
2営業日以内にご回答させていただきます。

■ 受付日時: {{timestamp}}
■ カテゴリ: {{category}}
■ 件名: {{subject}}
■ お問い合わせ内容:
{{message}}

ご質問やお急ぎの件については、直接下記サポートアドレスまでご連絡ください。

---
楽々省エネ計算サポートチーム
https://rakuraku-energy.archi-prisma.co.jp
サポート: {{support_email}}
運営: Archi-Prisma Design works 株式会社
```

## 2. 正しいメールフロー

### 問い合わせ受信
1. **送信者:** 問い合わせした人
2. **受信者:** `rse-support@archi-prisma.co.jp` (グループメールのみ)

### 自動返信
1. **送信者:** `rse-support@archi-prisma.co.jp` (グループメール)  
2. **受信者:** 問い合わせした人
3. **内容:** 受付確認 + サポート情報

### グループメールの利点
- チーム全体で問い合わせを共有
- 誰でも返信可能
- 一貫したサポート体制

## 3. 環境変数設定

`.env.local` ファイル作成:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_contact_form
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

## 4. GitHub Pages用の設定

環境変数が使えないため、`src/config/emailjs.js`の値を直接編集:
```javascript
SERVICE_ID: 'service_実際の値',
TEMPLATE_ID: 'template_contact_form',
PUBLIC_KEY: '実際のキー値'
```

## 5. テスト手順

1. ローカル環境でフォーム送信テスト
2. コンソールでエラーがないか確認
3. 実際にメールが届くか確認
4. 自動返信メールの確認
5. GitHub Pagesでの動作確認