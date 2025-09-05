// frontend/src/utils/userMigration.js
// 既存ユーザーのパスワードをハッシュ化するマイグレーション
import bcrypt from 'bcryptjs';

export const migrateExistingUsers = async () => {
  if (typeof window === 'undefined') return;

  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  let needsMigration = false;

  console.log('Checking for user migration...');

  for (const user of registeredUsers) {
    // 平文パスワードが存在する場合（古い形式）
    if (user.password && !user.hashedPassword) {
      console.log(`Migrating user: ${user.email}`);
      
      try {
        // パスワードをハッシュ化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // ハッシュ化されたパスワードに置き換え
        user.hashedPassword = hashedPassword;
        delete user.password; // 平文パスワードを削除
        
        needsMigration = true;
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error);
      }
    }
  }

  if (needsMigration) {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    console.log('User migration completed successfully');
    
    // 旧認証方式のデータをクリア
    localStorage.removeItem('currentUser');
  } else {
    console.log('No migration needed');
  }
};

// ユーザー管理画面用の関数
export const getAllUsers = () => {
  if (typeof window === 'undefined') return [];
  
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  return registeredUsers.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    company: user.company,
    registrationDate: user.registrationDate,
    is_active: user.is_active,
    lastLogin: user.lastLogin,
    authType: user.authType || 'email'
  }));
};

// 特定ユーザーの削除
export const deleteUser = (userId) => {
  if (typeof window === 'undefined') return false;
  
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const filteredUsers = registeredUsers.filter(user => user.id !== userId);
  
  if (filteredUsers.length !== registeredUsers.length) {
    localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers));
    console.log(`User ${userId} deleted`);
    return true;
  }
  
  return false;
};

// ユーザーの有効/無効切り替え
export const toggleUserStatus = (userId) => {
  if (typeof window === 'undefined') return false;
  
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const user = registeredUsers.find(u => u.id === userId);
  
  if (user) {
    user.is_active = !user.is_active;
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    console.log(`User ${userId} status toggled to ${user.is_active}`);
    return true;
  }
  
  return false;
};