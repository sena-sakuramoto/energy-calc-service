// frontend/next.config.js
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

// カスタムドメイン：CNAMEファイルが存在する場合は常にカスタムドメインとして扱う
const fs = require('fs');
const cnameExists = fs.existsSync('../CNAME');

module.exports = {
    reactStrictMode: true,
    env: {
        API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
    },
    // 本番ビルド最適化
    swcMinify: true,
    
    // GitHub Pages 静的エクスポート設定
    ...(isGitHubActions ? {
        trailingSlash: true,
        output: 'export',
        distDir: 'out',
        images: {
            unoptimized: true
        },
        // CNAMEファイルがある場合はカスタムドメイン（basePath不要）
        // ない場合は通常のGitHub Pages（basePath必要）
        ...(cnameExists ? {} : {
            basePath: '/energy-calc-service',
            assetPrefix: '/energy-calc-service',
        }),
    } : {
        // 開発環境設定
        images: {
            domains: ['lh3.googleusercontent.com'],
        },
    }),
}