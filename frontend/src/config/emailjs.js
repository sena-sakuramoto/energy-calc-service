// EmailJS設定ファイル
export const emailjsConfig = {
  // GitHub Pages用の設定（本番環境で実際の値に置き換え）
  SERVICE_ID: 'service_contact_form', // EmailJSで作成したサービスID
  TEMPLATE_ID: 'template_contact_form', // EmailJSで作成したテンプレートID  
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY', // EmailJSの実際のパブリックキー
  
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