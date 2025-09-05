// frontend/src/pages/admin/users.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { getAllUsers, deleteUser, toggleUserStatus } from '../../utils/userMigration';
import { FaUsers, FaUserCheck, FaUserTimes, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const userList = getAllUsers();
      setUsers(userList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (confirm('このユーザーを削除してもよろしいですか？')) {
      if (deleteUser(userId)) {
        loadUsers(); // リロード
      } else {
        alert('ユーザーの削除に失敗しました');
      }
    }
  };

  const handleToggleStatus = (userId) => {
    if (toggleUserStatus(userId)) {
      loadUsers(); // リロード
    } else {
      alert('ユーザーステータスの変更に失敗しました');
    }
  };

  // 管理者チェック（仮の実装 - 実際は適切な権限管理を実装）
  const isAdmin = user?.email === 's.sakuramoto@archisoft.co.jp' || 
                  user?.email === 'admin@archi-prisma.co.jp';

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">認証が必要です</h1>
          <p className="text-gray-600">この機能を利用するにはログインが必要です。</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600">この機能は管理者のみ利用できます。</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-8">
          <FaUsers className="text-blue-600 mr-3 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">総ユーザー数</p>
                <p className="text-3xl font-bold text-blue-700">{users.length}</p>
              </div>
              <FaUsers className="text-4xl text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">アクティブ</p>
                <p className="text-3xl font-bold text-green-700">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <FaUserCheck className="text-4xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 font-medium">無効</p>
                <p className="text-3xl font-bold text-red-700">
                  {users.filter(u => !u.is_active).length}
                </p>
              </div>
              <FaUserTimes className="text-4xl text-red-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  認証方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userData) => (
                <tr key={userData.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {userData.full_name || '名前未設定'}
                      </div>
                      <div className="text-sm text-gray-500">{userData.email}</div>
                      {userData.company && (
                        <div className="text-xs text-gray-400">{userData.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userData.authType === 'google' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userData.authType === 'google' ? 'Google' : 'Email'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.registrationDate 
                      ? new Date(userData.registrationDate).toLocaleDateString('ja-JP')
                      : '不明'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userData.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userData.is_active ? 'アクティブ' : '無効'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(userData.id)}
                        className={`flex items-center px-3 py-1 rounded text-xs ${
                          userData.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {userData.is_active ? <FaToggleOff className="mr-1" /> : <FaToggleOn className="mr-1" />}
                        {userData.is_active ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userData.id)}
                        className="flex items-center px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <FaTrash className="mr-1" />
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">登録されたユーザーがありません</p>
          </div>
        )}
      </div>
    </Layout>
  );
}