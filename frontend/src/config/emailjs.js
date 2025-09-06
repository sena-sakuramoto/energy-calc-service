// EmailJS設定ファイル
export const emailjsConfig = {
  // 本番環境設定（実際のEmailJS値を設定）
  SERVICE_ID: 'service_gmail123', // ← EmailJSで取得したサービスID に置き換え
  TEMPLATE_ID: 'template_contact_form', // ← EmailJSで作成したテンプレートID に置き換え  
  PUBLIC_KEY: 'user_abc123def456', // ← EmailJSで取得したパブリックキー に置き換え
  
  // 送信先設定
  recipients: {
    // 問い合わせ内容の受信先（グループメールのみ）
    primary: 'rse-support@archi-prisma.co.jp' // グループメール
  },
  
  // 送信元設定  
  sender: {
    // 自動返信の送信元（グループメール）
    supportEmail: 'rse-support@archi-prisma.co.jp', // グループメールから返信
    name: '楽々省エネ計算サポートチーム'
  },
  
  // メールテンプレート設定
  template: {
    subject: '【楽々省エネ計算】{{category}} - {{subject}}',
    fromName: '楽々省エネ計算サービス',
    // 自動返信用テンプレートID
    autoReplyTemplate: 'template_auto_reply'
  }
};

// カテゴリーの日本語表示
export const categoryLabels = {
  general: '一般的なお問い合わせ',
  bug: '不具合・バグ報告',
  feature: '機能追加・改善要望',
  support: 'テクニカルサポート',
  business: '導入・契約に関するお問い合わせ'
};