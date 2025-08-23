// frontend/src/pages/projects/[id]/index.jsx
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthContext } from '../../../contexts/AuthContext';
import { projectsAPI } from '../../../utils/api';
import { useNotification } from '../../../components/ErrorAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FaCalculator, FaEdit, FaTrash, FaArrowLeft, FaEye } from 'react-icons/fa';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const { showError, showSuccess } = useNotification();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchProject();
    }
  }, [id, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      showError('プロジェクトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当にこのプロジェクトを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setDeleting(true);
    try {
      await projectsAPI.delete(id);
      showSuccess('プロジェクトを削除しました');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      showError('プロジェクトの削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ログインが必要です
          </h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ログインページへ
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="large" message="プロジェクトを読み込み中..." />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            プロジェクトが見つかりません
          </h2>
          <Link href="/projects" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            プロジェクト一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link 
            href="/projects" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            プロジェクト一覧に戻る
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-gray-600 text-lg mb-4">
                    {project.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  作成日: {new Date(project.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center"
                >
                  {deleting ? (
                    <>
                      <LoadingSpinner size="small" message="" />
                      <span className="ml-2">削除中...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      削除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* アクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 計算実行 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaCalculator className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">省エネ計算実行</h3>
                <p className="text-gray-600">建物の省エネ性能を計算します</p>
              </div>
            </div>
            <Link 
              href={`/projects/${id}/calculate`}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
            >
              計算を開始
            </Link>
          </div>

          {/* 結果確認 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaEye className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">計算結果確認</h3>
                <p className="text-gray-600">過去の計算結果を確認します</p>
              </div>
            </div>
            <Link 
              href={`/projects/${id}/result`}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
            >
              結果を確認
            </Link>
          </div>
        </div>

        {/* プロジェクト情報 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">プロジェクト情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">プロジェクトID</h3>
              <p className="text-gray-600">{project.id}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">作成者</h3>
              <p className="text-gray-600">あなた</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">最終更新</h3>
              <p className="text-gray-600">
                {project.updated_at ? 
                  new Date(project.updated_at).toLocaleDateString('ja-JP') : 
                  new Date(project.created_at).toLocaleDateString('ja-JP')
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ステータス</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                アクティブ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;