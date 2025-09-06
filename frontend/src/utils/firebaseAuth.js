// frontend/src/utils/firebaseAuth.js
// Firebase Authentication完全版
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

// ユーザープロフィール取得・作成
export const createUserProfile = async (userAuth, additionalData = {}) => {
  if (!userAuth) return;

  const userRef = doc(db, 'users', userAuth.uid);
  const snapShot = await getDoc(userRef);

  if (!snapShot.exists()) {
    const { displayName, email, photoURL } = userAuth;
    const createdAt = serverTimestamp();
    const authType = additionalData.authType || 'google';

    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.full_name || '',
        email,
        photoURL: photoURL || '',
        createdAt,
        authType,
        isActive: true,
        isAdmin: email === 's.sakuramoto@archi-prisma.co.jp' || email === 'admin@archi-prisma.co.jp',
        company: additionalData.company || '',
        lastLoginAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  } else {
    // 既存ユーザーのログイン時間更新
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });
  }

  return userRef;
};

// メール・パスワードでのユーザー登録
export const registerWithEmail = async (email, password, additionalData = {}) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // プロフィール名前更新
    if (additionalData.full_name) {
      await updateProfile(user, {
        displayName: additionalData.full_name
      });
    }
    
    // Firestoreにユーザープロフィール作成
    await createUserProfile(user, { 
      ...additionalData, 
      authType: 'email',
      full_name: additionalData.full_name
    });
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// メール・パスワードでのログイン
export const signInWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    
    // ログイン時間更新
    await createUserProfile(user);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Googleでのログイン
export const signInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    
    // Googleユーザープロフィール作成・更新
    await createUserProfile(user, { authType: 'google' });
    
    return user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// ログアウト
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// 管理者用: 全ユーザー取得
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      lastLoginAt: doc.data().lastLoginAt?.toDate?.() || null
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// 管理者用: ユーザー状態更新
export const updateUserStatus = async (userId, isActive) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// 管理者用: ユーザー削除
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// 認証状態変更リスナー
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 現在のユーザー情報取得
export const getCurrentUser = () => {
  return auth.currentUser;
};

// ユーザー詳細情報取得
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.() || null,
        lastLoginAt: snapshot.data().lastLoginAt?.toDate?.() || null
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};