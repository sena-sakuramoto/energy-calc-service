// SEO用のHeadコンポーネント
import Head from 'next/head';

export default function SEOHead({
  title = '楽々省エネ計算 - 建築物エネルギー消費性能計算サービス',
  description = '建築設計者向けの省エネ法計算サービス。BEI計算、モデル建物法対応で設計業務を効率化。Archi-Prisma Design works株式会社が提供する無料ツール。',
  keywords = '省エネ計算,BEI計算,建築物エネルギー消費性能,モデル建物法,建築設計,省エネ法,設計支援,建築,エネルギー計算',
  url = 'https://rakuraku-energy.archi-prisma.co.jp',
  image = 'https://rakuraku-energy.archi-prisma.co.jp/images/og-image.png'
}) {
  return (
    <Head>
      {/* 基本メタタグ */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Archi-Prisma Design works 株式会社" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="楽々省エネ計算" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* 検索エンジン向け */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* アプリアイコン */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* JSON-LD 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "楽々省エネ計算",
            "description": description,
            "url": url,
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web Browser",
            "author": {
              "@type": "Organization",
              "name": "Archi-Prisma Design works 株式会社",
              "url": "https://archi-prisma.co.jp"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "JPY"
            },
            "featureList": [
              "BEI計算機能",
              "モデル建物法対応",
              "省エネ法準拠計算",
              "建築設計支援"
            ]
          })
        }}
      />

      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-8R1NSSH8KP" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8R1NSSH8KP', {
              page_title: '${title}',
              page_location: '${url}'
            });
          `
        }}
      />

      {/* Google Search Console - 実際の確認コードに置き換えてください */}
      <meta name="google-site-verification" content="abcdef123456_REPLACE_WITH_ACTUAL_CODE" />
    </Head>
  );
}