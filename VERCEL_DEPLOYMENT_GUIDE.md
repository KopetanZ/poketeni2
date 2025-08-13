# 🚀 Vercelデプロイ時のPokeAPIデータベース拡充ガイド

## 📋 概要

このガイドでは、Vercelにデプロイした際のPokeAPIデータベース拡充について説明します。

## ⚠️ 重要なポイント

**PokeAPIデータベース拡充は、Vercelデプロイとは別の手順が必要です。**

### なぜ自動実行されないのか？

1. **Vercelの制限**: ビルド時のみスクリプトが実行される
2. **API制限**: PokeAPIの1,302種データ取得には時間がかかる（10-15分）
3. **データベース操作**: 本番環境での大規模データ操作は慎重に行う必要がある

## 🔄 推奨される手順

### Step 1: Vercelデプロイ
```bash
# 通常のデプロイ手順
git push origin main
# Vercelが自動的にビルド・デプロイを実行
```

### Step 2: 本番環境でのデータ同期
デプロイ完了後、以下のいずれかの方法でデータ同期を実行：

#### オプションA: 最小限の同期（推奨）
```bash
# 本番環境で実行
npm run sync-pokemon
```

#### オプションB: 全データ同期
```bash
# 本番環境で実行
node pokeapi-full-sync.js
```

## 🛠️ 実装された自動化機能

### 1. ビルド時スクリプト
`package.json`に以下のスクリプトが追加されています：

```json
{
  "scripts": {
    "postbuild": "node scripts/sync-pokemon-data.js",
    "sync-pokemon": "node scripts/sync-pokemon-data.js"
  }
}
```

### 2. 自動同期スクリプト
`scripts/sync-pokemon-data.js`が自動的に：
- 環境変数の確認
- データベーススキーマの確認
- 既存データの確認
- 必要に応じて最小限のデータ同期

## 🔧 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

### 必須環境変数
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 環境変数の設定方法
1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 上記の変数を追加

## 📊 データ同期の詳細

### 自動同期（postbuild）
- **実行タイミング**: Vercelビルド完了後
- **処理内容**: 最小限のポケモンデータ（7種）
- **対象**: 御三家、ピカチュウ、イーブイ、ミュウツー、ミュウ
- **処理時間**: 約1-2分

### 手動同期（sync-pokemon）
- **実行タイミング**: 手動実行
- **処理内容**: 最小限のポケモンデータ（7種）
- **対象**: 同上
- **処理時間**: 約1-2分

### 全データ同期（pokeapi-full-sync.js）
- **実行タイミング**: 手動実行
- **処理内容**: 全1,302種のポケモンデータ
- **対象**: 全世代のポケモン
- **処理時間**: 約10-15分

## 🚨 注意事項

### 1. API制限
- PokeAPIには1分間に100リクエストの制限があります
- 全データ同期時は適切な待機時間を設けています

### 2. データベース容量
- 1,302種のポケモンデータは約10-20MB程度
- Supabaseの無料プランでも十分対応可能

### 3. 本番環境での実行
- 初回デプロイ時は必ずデータ同期を実行してください
- データが存在しない場合、部員募集機能が正常に動作しません

## 🔍 トラブルシューティング

### よくある問題

#### 1. 環境変数エラー
```
❌ 必要な環境変数が設定されていません
```
**解決方法**: Vercelダッシュボードで環境変数を設定

#### 2. データベース接続エラー
```
❌ Supabaseクライアント初期化エラー
```
**解決方法**: Supabaseの設定と環境変数を確認

#### 3. スキーマエラー
```
❌ pokemon_master_dataテーブルが存在しません
```
**解決方法**: データベーススキーマを手動でセットアップ

### ログの確認方法
Vercelダッシュボード → Functions → ログで詳細を確認できます。

## 📚 関連ドキュメント

- [POKEAPI_IMPLEMENTATION_GUIDE.md](./POKEAPI_IMPLEMENTATION_GUIDE.md) - 詳細な実装ガイド
- [pokeapi-database-setup.sql](./pokeapi-database-setup.sql) - データベーススキーマ
- [pokeapi-full-sync.js](./pokeapi-full-sync.js) - 全データ同期スクリプト

## 🎯 推奨ワークフロー

1. **開発環境**: `pokeapi-full-sync.js`で全データを同期
2. **Vercelデプロイ**: 自動で最小限のデータ同期
3. **本番環境**: 必要に応じて手動で全データ同期

これにより、開発時は豊富なデータでテストし、本番環境では安全にデプロイできます。
