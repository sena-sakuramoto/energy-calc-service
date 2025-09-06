// frontend/src/pages/_app.jsx
import '../styles/globals.css';
import { FirebaseAuthProvider } from '../contexts/FirebaseAuthContext';
import { NotificationProvider } from '../components/ErrorAlert';

function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <FirebaseAuthProvider>
        <Component {...pageProps} />
      </FirebaseAuthProvider>
    </NotificationProvider>
  );
}

export default MyApp;