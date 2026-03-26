// frontend/src/pages/projects/index.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { projectsAPI } from '../../utils/api';
import { getProjects as getLocalProjects, deleteProject as deleteLocalProject } from '../../utils/projectStorage';
import Link from 'next/link';
import { FaPlus, FaPencilAlt, FaTrash, FaCalculator, FaFolder, FaArrowRight } from 'react-icons/fa';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // 一時的にLocalStorageから取得（GitHub Pagesモード対応）
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        const localProjects = getLocalProjects();
        setProjects(localProjects);
        setError('');
      } else {
        const response = await projectsAPI.getAll();
        setProjects(response.data);
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      // フォールバックとしてLocalStorageを使用
      const localProjects = getLocalProjects();
      setProjects(localProjects);
      setError(''); // エラーメッセージをクリア（LocalStorageで動作しているため）
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`プロジェクト「${name}」を削除しますか？`)) {
      try {
        // LocalStorage環境での削除
        if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
          deleteLocalProject(id);
          setProjects(projects.filter(project => project.id !== id));
        } else {
          await projectsAPI.delete(id);
          setProjects(projects.filter(project => project.id !== id));
        }
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除中にエラーが発生しました。');
      }
    }
  };

  if (authLoading) {
    return (
      <Layout title="プロジェクト一覧 - 楽々省エネ計算">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-primary-500">認証確認中...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout title="プロジェクト一覧 - 楽々省エネ計算">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-800">プロジェクト一覧</h1>
            <p className="text-primary-400 text-sm mt-1">作成したプロジェクトの管理・計算実行</p>
          </div>
          <Link
            href="/projects/new"
            className="bg-accent-500 hover:bg-accent-600 text-white py-2.5 px-5 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 shadow-sm"
          >
            <FaPlus className="text-sm" /> 新規プロジェクト
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-primary-500">プロジェクトを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-warm-200 rounded-xl shadow-sm p-10 text-center">
            <div className="bg-warm-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFolder className="text-primary-300 text-xl" />
            </div>
            <p className="text-primary-700 font-medium mb-1">プロジェクトがまだありません</p>
            <p className="text-primary-400 text-sm mb-6">新規プロジェクトを作成して省エネ計算を始めましょう</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/tools/official-bei"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                <FaCalculator className="text-xs" /> BEI計算を始める
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-white border border-warm-200 hover:border-primary-300 text-primary-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                <FaPlus className="text-xs" /> プロジェクト作成
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop: テーブル表示 */}
            <div className="hidden md:block bg-white border border-warm-200 rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider">プロジェクト名</th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider">作成日</th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider">更新日</th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider">状態</th>
                    <th className="py-3 px-5 text-center text-xs font-semibold text-primary-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {projects.map(project => (
                    <tr key={project.id} className="hover:bg-warm-50 transition-colors duration-150">
                      <td className="py-3.5 px-5">
                        <Link href={`/projects/${project.id}`} className="text-primary-800 hover:text-accent-500 font-medium transition-colors">
                          {project.projectInfo?.name || project.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-primary-500">
                        {new Date(project.createdAt || project.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-primary-500">
                        {(project.updatedAt || project.updated_at)
                          ? new Date(project.updatedAt || project.updated_at).toLocaleDateString('ja-JP')
                          : '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        {(project.result || project.result_data) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">計算済み</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">未計算</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-center items-center gap-3">
                          <Link
                            href={`/projects/${project.id}/calculate`}
                            className="text-primary-400 hover:text-accent-500 transition-colors"
                            title="計算実行"
                          >
                            <FaCalculator />
                          </Link>
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="text-primary-400 hover:text-accent-500 transition-colors"
                            title="編集"
                          >
                            <FaPencilAlt />
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.projectInfo?.name || project.name)}
                            className="text-primary-400 hover:text-red-500 transition-colors"
                            title="削除"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: カード表示 */}
            <div className="md:hidden space-y-3">
              {projects.map(project => (
                <div key={project.id} className="bg-white border border-warm-200 rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/projects/${project.id}`} className="text-primary-800 hover:text-accent-500 font-medium transition-colors text-sm flex-1 min-w-0 truncate">
                      {project.projectInfo?.name || project.name}
                    </Link>
                    {(project.result || project.result_data) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 flex-shrink-0 ml-2">計算済み</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 flex-shrink-0 ml-2">未計算</span>
                    )}
                  </div>
                  <div className="text-xs text-primary-400 mb-3">
                    作成: {new Date(project.createdAt || project.created_at).toLocaleDateString('ja-JP')}
                    {(project.updatedAt || project.updated_at) && (
                      <span className="ml-3">更新: {new Date(project.updatedAt || project.updated_at).toLocaleDateString('ja-JP')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-warm-100">
                    <Link href={`/projects/${project.id}/calculate`} className="text-primary-400 hover:text-accent-500 transition-colors text-sm flex items-center gap-1">
                      <FaCalculator className="text-xs" /> 計算
                    </Link>
                    <Link href={`/projects/${project.id}/edit`} className="text-primary-400 hover:text-accent-500 transition-colors text-sm flex items-center gap-1">
                      <FaPencilAlt className="text-xs" /> 編集
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.projectInfo?.name || project.name)}
                      className="text-primary-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1 ml-auto"
                    >
                      <FaTrash className="text-xs" /> 削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}