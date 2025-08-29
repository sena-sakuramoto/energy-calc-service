// frontend/next.config.js
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

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
        // GitHub Pagesのベースパス設定（リポジトリ名）
        basePath: '/energy-calc-service',
        assetPrefix: '/energy-calc-service',
    } : {
        // 開発・本番サーバー用設定（API Routes有効）
        images: {
            domains: ['lh3.googleusercontent.com'], // Google OAuth用
        },
    }),
}