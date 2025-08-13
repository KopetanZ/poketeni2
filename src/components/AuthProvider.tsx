'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { LocalAuth } from '@/lib/local-auth';
import { supabase } from '@/lib/supabase';

interface LocalUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInTest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signInTest: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 古いUUID形式でないユーザーデータをクリア
    LocalAuth.clearOldUserData();
    
    // 初回ロード時の認証状態チェック
    const currentUser = LocalAuth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // メールでサインイン
  const signInWithEmail = async (email: string, password: string) => {
    try {
      if (!LocalAuth.validateEmail(email)) {
        throw new Error('有効なメールアドレスを入力してください');
      }

      const localUser = LocalAuth.signIn(email, password);
      setUser(localUser);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // テストアカウントでサインイン
  const signInTest = async () => {
    try {
      // まずSupabaseに実際のユーザーを作成
      const { data, error } = await supabase.auth.signUp({
        email: 'test@poketeni.com',
        password: 'test123'
      });

      if (error && !error.message.includes('User already registered')) {
        console.error('Supabase signup error:', error);
        // エラーでもローカル認証を使用
      }

      // Supabaseユーザーが存在する場合はそのIDを使用
      let userId;
      if (data?.user?.id) {
        userId = data.user.id;
      } else {
        // 既存ユーザーの場合はサインインして取得
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: 'test@poketeni.com',
          password: 'test123'
        });
        userId = signInData?.user?.id;
      }

      // ローカルユーザーオブジェクトを作成（SupabaseのUUIDを使用）
      const localUser: LocalUser = {
        id: userId || LocalAuth.generateUUID(),
        email: 'test@poketeni.com',
        created_at: new Date().toISOString()
      };

      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem('poketeni_local_user', JSON.stringify(localUser));
      }

      setUser(localUser);
    } catch (error: any) {
      console.error('Test sign in error:', error);
      // フォールバック: 純粋なローカル認証
      const localUser = LocalAuth.signInTest();
      setUser(localUser);
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      LocalAuth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signInTest,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};