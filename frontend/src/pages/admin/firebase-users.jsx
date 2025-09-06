// frontend/src/pages/admin/firebase-users.jsx
// Firebase/Firestore対応のユーザー管理画面
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import Layout from '../../components/Layout';
import { getAllUsers, updateUserStatus, deleteUser } from '../../utils/firebaseAuth';
import { FaUsers, FaUserCheck, FaUserTimes, FaTrash, FaToggleOn, FaToggleOff, FaGoogle, FaEnvelope, FaSync } from 'react-icons/fa';

export default function FirebaseUserManagement() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('ユーザー情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      await updateUserStatus(userId, !currentStatus);
      await loadUsers(); // リロード
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('ユーザーステータスの変更に失敗しました');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (confirm(`ユーザー「${userEmail}」を削除してもよろしいですか？`)) {
      try {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        await deleteUser(userId);
        await loadUsers(); // リロード
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('ユーザーの削除に失敗しました');
      } finally {
        setActionLoading(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  // アクセス制御
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
          <p>Firebase からユーザー情報を読み込み中...</p>
        </div>
      </Layout>
    );
  }

  const activeUsers = users.filter(u => u.isActive !== false);
  const inactiveUsers = users.filter(u => u.isActive === false);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FaUsers className="text-blue-600 mr-3 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">Firebase ユーザー管理</h1>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            更新
          </button>
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
                <p className="text-3xl font-bold text-green-700">{activeUsers.length}</p>
              </div>
              <FaUserCheck className="text-4xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 font-medium">無効</p>
                <p className="text-3xl font-bold text-red-700">{inactiveUsers.length}</p>
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
                  登録日・最終ログイン
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
                    <div className="flex items-center">
                      {userData.photoURL && (
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={userData.photoURL} 
                          alt="Profile" 
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {userData.displayName || userData.full_name || '名前未設定'}
                          {userData.isAdmin && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              管理者
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                        {userData.company && (
                          <div className="text-xs text-gray-400">{userData.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      userData.authType === 'google' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userData.authType === 'google' ? (
                        <><FaGoogle className="mr-1" /> Google</>
                      ) : (
                        <><FaEnvelope className="mr-1" /> Email</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>登録: {userData.createdAt ? userData.createdAt.toLocaleDateString('ja-JP') : '不明'}</div>
                      <div className="text-xs">
                        最終: {userData.lastLoginAt ? userData.lastLoginAt.toLocaleDateString('ja-JP') : '未ログイン'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userData.isActive !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userData.isActive !== false ? 'アクティブ' : '無効'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(userData.id, userData.isActive)}
                        disabled={actionLoading[userData.id]}
                        className={`flex items-center px-3 py-1 rounded text-xs disabled:opacity-50 ${
                          userData.isActive !== false
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {actionLoading[userData.id] ? (
                          '処理中...'
                        ) : (
                          <>
                            {userData.isActive !== false ? <FaToggleOff className="mr-1" /> : <FaToggleOn className="mr-1" />}
                            {userData.isActive !== false ? '無効化' : '有効化'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userData.id, userData.email)}
                        disabled={actionLoading[userData.id]}
                        className="flex items-center px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
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

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📊 Firebase統合完了</h3>
          <p className="text-sm text-blue-700">
            この管理画面はFirestore Databaseからリアルタイムでユーザーデータを取得します。
            全デバイス・ブラウザでの登録ユーザーが一元管理されています。
          </p>
        </div>
      </div>
    </Layout>
  );
}