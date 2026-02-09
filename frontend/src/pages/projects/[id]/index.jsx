// frontend/src/pages/projects/[id]/index.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../../contexts/FirebaseAuthContext';
import { projectsAPI } from '../../../utils/api';
import { getProject, deleteProject as deleteLocalProject } from '../../../utils/projectStorage';
import { useNotification } from '../../../components/ErrorAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FaCalculator, FaEdit, FaTrash, FaArrowLeft, FaEye } from 'react-icons/fa';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    if (id && isAuthenticated) {
      fetchProject();
    }
  }, [id, isAuthenticated, authLoading, router]);

  const fetchProject = async () => {
    try {
      setLoading(true);

      // LocalStorage環境での取得
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        const localProject = getProject(id);
        if (localProject) {
          setProject(localProject);
        } else {
          showError('プロジェクトが見つかりません');
        }
      } else {
        const response = await projectsAPI.getById(id);
        setProject(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      // フォールバック
      const localProject = getProject(id);
      if (localProject) {
        setProject(localProject);
      } else {
        showError('プロジェクトの取得に失敗しました');
      }
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
      // LocalStorage環境での削除
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        deleteLocalProject(id);
        showSuccess('プロジェクトを削除しました');
        router.push('/projects');
      } else {
        await projectsAPI.delete(id);
        showSuccess('プロジェクトを削除しました');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      showError('プロジェクトの削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>認証確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="large" message="プロジェクトを読み込み中..." />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">
            プロジェクトが見つかりません
          </h2>
          <Link href="/projects" className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600">
            プロジェクト一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            プロジェクト一覧に戻る
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  {project.projectInfo?.name || project.name}
                </h1>
                {(project.projectInfo?.description || project.description) && (
                  <p className="text-primary-600 text-lg mb-4">
                    {project.projectInfo?.description || project.description}
                  </p>
                )}
                <div className="text-sm text-primary-500">
                  作成日: {new Date(project.createdAt || project.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-primary-400 flex items-center"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 計算実行 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-accent-500">
            <div className="flex items-center mb-4">
              <div className="bg-accent-50 p-3 rounded-full mr-4">
                <FaCalculator className="text-accent-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-900">省エネ計算実行</h3>
                <p className="text-primary-600">建物の省エネ性能を計算</p>
              </div>
            </div>
            <p className="text-sm text-primary-500 mb-4">
              BEI値、外皮性能、一次エネルギー消費量を正確に算出し、省エネ基準適合性を判定します。
            </p>
            <Link
              href={`/projects/${id}/calculate`}
              className="w-full bg-accent-500 text-white py-3 px-6 rounded-lg hover:bg-accent-600 transition-colors font-medium text-center block"
            >
              計算を開始
            </Link>
          </div>

          {/* 結果確認 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-primary-600">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <FaEye className="text-primary-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-900">計算結果確認</h3>
                <p className="text-primary-600">詳細レポートを表示</p>
              </div>
            </div>
            <p className="text-sm text-primary-500 mb-4">
              グラフィカルな結果表示とPDF・Excel形式での出力が可能です。申請資料作成に最適。
            </p>
            <Link
              href={`/projects/${id}/result`}
              className="w-full bg-primary-700 text-white py-3 px-6 rounded-lg hover:bg-primary-800 transition-colors font-medium text-center block"
            >
              結果を確認
            </Link>
          </div>

          {/* クイック計算 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-primary-500">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <FaEdit className="text-primary-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-900">簡易計算ツール</h3>
                <p className="text-primary-600">BEI計算機を使用</p>
              </div>
            </div>
            <p className="text-sm text-primary-500 mb-4">
              基本的な建物情報から概算BEI値を素早く算出。設計初期段階での検討に便利です。
            </p>
            <Link
              href="/tools/bei-calculator"
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center block"
            >
              簡易計算開始
            </Link>
          </div>
        </div>

        {/* プロジェクト情報 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">プロジェクト詳細情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                プロジェクトID
              </h3>
              <p className="text-primary-600 font-mono text-sm">{project.id}</p>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-2"></div>
                設計者
              </h3>
              <p className="text-primary-600">{project.projectInfo?.designer || user?.full_name || user?.name || '設計者'}</p>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                設計事務所
              </h3>
              <p className="text-primary-600">{project.projectInfo?.designFirm || 'Archi-Prisma Design works 株式会社'}</p>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                作成日時
              </h3>
              <p className="text-primary-600">
                {new Date(project.createdAt || project.created_at).toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-2"></div>
                最終更新
              </h3>
              <p className="text-primary-600">
                {project.updatedAt || project.updated_at ?
                  new Date(project.updatedAt || project.updated_at).toLocaleString('ja-JP') :
                  new Date(project.createdAt || project.created_at).toLocaleString('ja-JP')
                }
              </p>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                ステータス
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                アクティブ
              </span>
            </div>
          </div>

          {/* 計算履歴セクション */}
          <div className="mt-8 pt-8 border-t border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">計算履歴</h3>
            {project.result || project.result_data ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-green-500 p-2 rounded-full mr-3">
                    <FaCalculator className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">計算完了済み</p>
                    <p className="text-sm text-green-700">
                      最新の省エネ計算結果が利用可能です。「結果を確認」ボタンから詳細をご覧いただけます。
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-2 rounded-full mr-3">
                    <FaCalculator className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">計算未実行</p>
                    <p className="text-sm text-yellow-700">
                      まだ省エネ計算が実行されていません。「計算を開始」ボタンから建物情報を入力して計算を実行してください。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
