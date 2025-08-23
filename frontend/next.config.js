// frontend/next.config.js
module.exports = {
    reactStrictMode: true,
    env: {
        API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
    },
    // 本番ビルド最適化
    swcMinify: true,
    // 静的エクスポート対応
    trailingSlash: false,
}