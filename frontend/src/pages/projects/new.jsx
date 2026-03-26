// frontend/src/pages/projects/new.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { projectsAPI } from '../../utils/api';
import { createProjectData, saveProject } from '../../utils/projectStorage';
import { useNotification } from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';

const NewProject = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('プロジェクト名を入力してください');
      return;
    }

    setLoading(true);
    try {
      // LocalStorage環境での作成（一時的対応）
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        const projectInfo = {
          name: formData.name,
          description: formData.description,
          designer: user?.full_name || user?.name || 'Demo User',
          designFirm: 'Archi-Prisma Design works 株式会社',
          buildingOwner: '',
          location: ''
        };
        
        const projectData = createProjectData(projectInfo, {}, null);
        const savedProject = saveProject(projectData);
        
        console.log('Project created locally:', savedProject);
        showSuccess('プロジェクトを作成しました');
        router.push('/projects');
      } else {
        // API環境での作成
        const response = await projectsAPI.create(formData);
        console.log('Project created:', response.data);
        showSuccess('プロジェクトを作成しました');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Project creation failed:', error);
      showError('プロジェクトの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (authLoading) {
    return (
      <Layout title="新規プロジェクト - 楽々省エネ計算">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-primary-500">認証確認中...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    return null;
  }

  return (
    <Layout title="新規プロジェクト - 楽々省エネ計算">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-accent-500 transition-colors mb-3">
            <FaArrowLeft className="text-xs" /> プロジェクト一覧に戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-800">
            新規プロジェクト作成
          </h1>
          <p className="text-primary-400 text-sm mt-1">
            省エネ法計算の新しいプロジェクトを作成します
          </p>
        </div>

        <div className="bg-white border border-warm-200 rounded-xl shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                プロジェクト名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData?.name || ''}
                onChange={handleChange}
                required
                placeholder="例: オフィスビル A棟 省エネ計算"
                className="w-full px-4 py-3 border border-warm-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                プロジェクト説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData?.description || ''}
                onChange={handleChange}
                rows="4"
                placeholder="プロジェクトの詳細説明を入力してください（任意）"
                className="w-full px-4 py-3 border border-warm-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-colors resize-vertical"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="flex-1 bg-white border border-warm-200 text-primary-700 py-3 px-6 rounded-lg hover:bg-warm-50 hover:border-primary-300 transition-colors font-medium"
                disabled={loading}
              >
                キャンセル
              </button>

              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 bg-accent-500 text-white py-3 px-6 rounded-lg hover:bg-accent-600 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center shadow-sm"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" message="" />
                    <span className="ml-2">作成中...</span>
                  </>
                ) : (
                  'プロジェクトを作成'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewProject;