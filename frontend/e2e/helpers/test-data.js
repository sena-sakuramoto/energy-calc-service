// e2e/helpers/test-data.js
// テスト用定数

exports.TEST_USER = {
  email: 'e2e-test@example.com',
  password: 'TestPass1234',
  fullName: 'E2E テストユーザー',
  company: 'テスト株式会社',
};

exports.TEST_PROJECT = {
  name: 'E2Eテストプロジェクト',
  description: 'Playwright E2Eテスト用のプロジェクト',
};

exports.PUBLIC_PAGES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/campaign',
  '/demo-guide',
  '/legal',
  '/privacy',
  '/setup-guide',
  '/system/status',
  '/guide/model-building-method',
];

exports.PROTECTED_PAGES = [
  '/projects',
  '/projects/new',
];
