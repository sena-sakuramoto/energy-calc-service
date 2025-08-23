// frontend/next.config.js
module.exports = {
    reactStrictMode: true,
    env: {
        API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
    },
    // 本番ビルド最適化
    swcMinify: true,
    // GitHub Pages用静的エクスポート設定
    trailingSlash: true,
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true // GitHub Pagesでは画像最適化無効
    },
    // GitHub Pagesのベースパス設定（リポジトリ名）
    basePath: process.env.GITHUB_ACTIONS === 'true' ? '/energy-calc-service' : '',
    assetPrefix: process.env.GITHUB_ACTIONS === 'true' ? '/energy-calc-service' : '',
}