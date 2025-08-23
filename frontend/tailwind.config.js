// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // もしApp Routerを使っている場合
  ],
  theme: {
    extend: {
      // ここにカスタムテーマ設定を追加できます (例: 色、フォントなど)
      colors: {
        primary: {
          DEFAULT: '#3490dc', // 例: プライマリーカラー
          dark: '#2779bd',
        },
      },
    },
  },
  plugins: [],
};