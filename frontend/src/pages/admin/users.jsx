// frontend/src/pages/admin/users.jsx
// 旧localStorage版 → Firebase版にリダイレクト
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UsersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/firebase-users');
  }, [router]);
  return null;
}
