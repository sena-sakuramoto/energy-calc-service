// frontend/src/pages/_app.jsx
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../components/ErrorAlert';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

export default MyApp;