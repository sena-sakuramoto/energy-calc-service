// frontend/src/components/ResultCard.jsx
import { FaCopy, FaDownload, FaShare } from 'react-icons/fa';

export default function ResultCard({ 
  title, 
  icon: Icon, 
  children, 
  onCopy, 
  onDownload, 
  onShare,
  className = ""
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          {Icon && <Icon className="mr-3 text-green-600" />}
          {title}
        </h3>
        
        <div className="flex space-x-2">
          {onCopy && (
            <button
              onClick={onCopy}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="結果をコピー"
            >
              <FaCopy />
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="ダウンロード"
            >
              <FaDownload />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="シェア"
            >
              <FaShare />
            </button>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
}