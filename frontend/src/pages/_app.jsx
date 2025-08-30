// frontend/src/pages/_app.jsx
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../components/ErrorAlert';

function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default MyApp;