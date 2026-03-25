const ADMIN_EMAILS = Object.freeze([
    'k.suzuki@archi-prisma.co.jp',
  's.sakuramoto@archi-prisma.co.jp',
  'admin@archi-prisma.co.jp',
]);

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const isAdminEmail = (email = '') =>
  ADMIN_EMAILS.includes(normalizeEmail(email));

export const getAdminEmails = () => [...ADMIN_EMAILS];
