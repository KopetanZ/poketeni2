# Supabase認証設定ガイド

## 問題の原因
1. **匿名認証が無効**: Anonymous sign-ins are disabled
2. **メール認証が厳しすぎる**: test@poketeni.comが無効とされる

## Supabase設定の修正手順

### 1. Supabaseダッシュボードにアクセス
- https://supabase.com/dashboard にログイン
- プロジェクト `oijhrdkbttuitkiwbigg` を選択

### 2. Authentication設定を確認・修正

#### A. 匿名認証を有効化（推奨）
```
Authentication → Settings → User Management
□ Enable anonymous sign-ins ← これをチェック
```

#### B. メール確認を無効化（開発環境用）
```
Authentication → Settings → User Management
□ Enable email confirmations ← これをチェック外す（開発時のみ）
```

#### C. セキュリティレベルを調整
```
Authentication → Settings → Security
Validation level: Relaxed ← より緩い設定に変更
```

### 3. 代替案：テストドメインの追加
```
Authentication → Settings → Advanced
Add allowed domains:
- localhost
- 127.0.0.1
- *.vercel.app
```

### 4. RLSポリシーの確認
```sql
-- テーブルのRLSポリシーが正しく設定されているか確認
SELECT * FROM pg_policies WHERE tablename IN ('schools', 'players', 'hand_cards');
```

## 設定後の確認

### テスト用SQLクエリ
```sql
-- 認証設定の確認
SELECT 
  raw_user_meta_data,
  email,
  phone,
  confirmed_at,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## 推奨設定（開発環境）

1. **匿名認証**: 有効 ✅
2. **メール確認**: 無効（開発時）
3. **セキュリティ**: Relaxed
4. **許可ドメイン**: localhost, vercel.app

## 推奨設定（本番環境）

1. **匿名認証**: 無効
2. **メール確認**: 有効
3. **セキュリティ**: Strict
4. **許可ドメイン**: 本番ドメインのみ

## 緊急回避策

以下の設定でも動作しない場合は、一時的にローカル認証システムを使用し、後でSupabase設定を調整してください。