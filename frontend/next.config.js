// frontend/next.config.js
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const hasCustomDomain = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === 'true';

// カスタムドメイン検出強化（CNAMEファイルの存在もチェック）
const fs = require('fs');
const path = require('path');
const cnameExists = fs.existsSync(path.join(__dirname, '..', 'CNAME'));
const shouldUseCustomDomain = hasCustomDomain || cnameExists;

// デバッグ用ログ
console.log('🔧 Next.js Config Debug:');
console.log('GITHUB_ACTIONS:', process.env.GITHUB_ACTIONS);
console.log('GITHUB_PAGES_CUSTOM_DOMAIN:', process.env.GITHUB_PAGES_CUSTOM_DOMAIN);
console.log('CNAME file exists:', cnameExists);
console.log('isGitHubActions:', isGitHubActions);
console.log('shouldUseCustomDomain:', shouldUseCustomDomain);

module.exports = {
    reactStrictMode: true,
    env: {
        API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
    },
    // 本番ビルド最適化
    swcMinify: true,
    
    // 条件付き設定：GitHub Pagesの場合のみ静的エクスポート
    ...(isGitHubActions ? {
        // GitHub Pages用静的エクスポート設定
        trailingSlash: true,
        output: 'export',
        distDir: 'out',
        images: {
            unoptimized: true // GitHub Pagesでは画像最適化無効
        },
        // カスタムドメイン使用時はbasePathを無効化
        ...(shouldUseCustomDomain ? {} : {
            basePath: '/energy-calc-service',
            assetPrefix: '/energy-calc-service',
        }),
    } : {
        // 開発・本番サーバー用設定（API Routes有効）
        images: {
            domains: ['lh3.googleusercontent.com'], // Google OAuth用
        },
    }),
}