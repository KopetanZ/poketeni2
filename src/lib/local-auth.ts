// ローカル開発用の簡易認証システム
// 本番環境ではSupabase認証を使用する予定

interface LocalUser {
  id: string;
  email: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'poketeni_local_user';

export class LocalAuth {
  // ローカルユーザーを取得
  static getCurrentUser(): LocalUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // ローカルユーザーを作成・保存
  static createUser(email: string): LocalUser {
    const user: LocalUser = {
      id: this.generateUUID(), // UUID形式のIDを使用
      email,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  }

  // UUID v4形式のIDを生成
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // サインイン（既存ユーザーまたは新規作成）
  static signIn(email: string, password: string): LocalUser {
    // パスワードのバリデーション（最低限）
    if (password.length < 6) {
      throw new Error('パスワードは6文字以上で入力してください');
    }

    // 既存ユーザーをチェック
    const existingUser = this.getCurrentUser();
    if (existingUser && existingUser.email === email) {
      return existingUser;
    }

    // 新規ユーザーを作成（UUID形式のIDを使用）
    return this.createUser(email);
  }

  // テストアカウントでサインイン
  static signInTest(): LocalUser {
    return this.signIn('test@poketeni.com', 'test123');
  }

  // サインアウト
  static signOut(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  // 古いID形式のユーザーデータをクリア（UUID形式でない場合）
  static clearOldUserData(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser && !this.isValidUUID(currentUser.id)) {
      console.log('Clearing old user data with invalid UUID format:', currentUser.id);
      this.signOut();
    }
  }

  // UUID形式かどうかをチェック
  static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // メールアドレスのバリデーション
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}