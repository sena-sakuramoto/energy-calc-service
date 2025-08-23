// frontend/src/pages/projects/index.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { projectsAPI } from '../../utils/api';
import Link from 'next/link';
import { FaPlus, FaPencilAlt, FaTrash, FaCalculator } from 'react-icons/fa';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      setError('プロジェクトの取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`プロジェクト「${name}」を削除しますか？`)) {
      try {
        await projectsAPI.delete(id);
        setProjects(projects.filter(project => project.id !== id));
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除中にエラーが発生しました。');
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">プロジェクト一覧</h1>
        <Link
          href="/projects/new"
          className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> 新規プロジェクト
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>プロジェクトを読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-600 mb-4">
            プロジェクトがまだありません。新規プロジェクトを作成してください。
          </p>
          <Link
            href="/projects/new"
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md inline-flex items-center"
          >
            <FaPlus className="mr-2" /> 新規プロジェクト
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">プロジェクト名</th>
                <th className="py-3 px-4 text-left">作成日</th>
                <th className="py-3 px-4 text-left">更新日</th>
                <th className="py-3 px-4 text-left">状態</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/projects/${project.id}`} className="text-primary hover:underline">
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(project.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="py-3 px-4">
                    {project.updated_at
                      ? new Date(project.updated_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {project.result_data ? (
                      <span className="text-green-600 font-medium">計算済み</span>
                    ) : (
                      <span className="text-amber-600">未計算</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/projects/${project.id}/calculate`}
                        className="text-primary hover:text-primary-dark"
                        title="計算実行"
                      >
                        <FaCalculator />
                      </Link>
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                        title="編集"
                      >
                        <FaPencilAlt />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="text-red-600 hover:text-red-800"
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
      )}
    </Layout>
  );
}