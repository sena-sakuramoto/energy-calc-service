// frontend/src/components/LoadingSpinner.jsx
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'medium', message = '読み込み中...' }) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <FaSpinner className={`animate-spin text-accent-600 mx-auto mb-4 ${sizeClasses[size]}`} />
        <p className="text-primary-600">{message}</p>
      </div>
    </div>
  );
};

// フルスクリーンローディング
export const FullScreenLoading = ({ message = 'アプリケーションを読み込んでいます...' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
    <div className="text-center">
      <FaSpinner className="animate-spin text-accent-600 text-6xl mx-auto mb-6" />
      <p className="text-xl text-primary-700 font-medium">{message}</p>
    </div>
  </div>
);

// ボタン内ローディング
export const ButtonLoading = ({ loading, children, ...props }) => (
  <button disabled={loading} {...props}>
    <div className="flex items-center justify-center">
      {loading && <FaSpinner className="animate-spin mr-2" />}
      {children}
    </div>
  </button>
);

export default LoadingSpinner;
