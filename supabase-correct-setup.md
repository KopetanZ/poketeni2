# Supabase認証の正しい設定方法

## 問題の根本原因
- Supabaseホスト版ではメール確認がデフォルトで**有効**
- `test@poketeni.com`のような仮想アドレスは無効とされる
- 実在するメールアドレスが必要

## 解決策1: メール確認を無効化（推奨）

### Supabaseダッシュボード設定
1. プロジェクトダッシュボードを開く
2. `Authentication` → `Settings`
3. `User Management`セクション
4. **「Enable email confirmations」のチェックを外す**

### 設定変更のSQL確認
```sql
-- 現在の設定を確認
SELECT * FROM auth.config;

-- メール確認が無効になっているか確認
SELECT email_confirm_required FROM auth.config;
```

## 解決策2: 開発用メールアドレス使用

### 実在するメールアドレスを使用
```typescript
// 開発用の実際のメールアドレス
const DEV_EMAIL = 'your-real-email@gmail.com';
const DEV_PASSWORD = 'your-secure-password';
```

### メールプロバイダーの設定
1. `Authentication` → `Settings` → `SMTP Settings`
2. 開発環境用のSMTP設定（Gmail, SendGrid等）

## 解決策3: 匿名認証の有効化

### ダッシュボード設定
1. `Authentication` → `Settings`
2. `User Management`
3. **「Enable anonymous sign-ins」をチェック**

### 匿名認証の実装
```typescript
const { data, error } = await supabase.auth.signInAnonymously();
```

## 推奨アプローチ

### 開発段階
1. **メール確認を無効化**
2. **匿名認証を有効化**
3. テスト用の実際のメールアドレス使用

### 本番段階
1. メール確認を有効化
2. 匿名認証を無効化
3. 適切なSMTP設定

## 設定確認方法

### Test Query
```sql
-- ユーザー作成テスト
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', 'hashed_password', NOW());
```