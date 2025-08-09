# 🚀 デプロイチェックリスト

## ❌ 現在未実装の機能（READMEの修正が必要）

### 🧬 進化機能
- [ ] ポケモンの段階的進化システム
- [ ] 進化条件（レベル・アイテム・友情度）
- [ ] 進化前後の能力値変化
- [ ] 進化演出とUI

### 📅 カレンダー・すごろく機能
- [ ] カレンダーからすごろくへの遷移機能
- [ ] すごろく盤上の移動システム
- [ ] マス効果の詳細実装
- [ ] 日付進行とすごろく進行の同期

## 🗄️ Supabaseデータベース設定

### 必須スキーマ更新
```sql
-- 1. 基本テーブル作成
psql -f database-setup.sql

-- 2. 特殊能力対応カラム追加  
psql -f add-special-abilities-columns.sql

-- 3. 必要に応じて追加
psql -f tournament-schema.sql
psql -f items-schema.sql
```

### Row Level Security (RLS) 設定
```sql
-- 既にdatabase-setup.sqlに含まれているが、確認要：

-- schools テーブル
CREATE POLICY "Users can manage their own school" ON schools
  FOR ALL USING (auth.uid() = user_id);

-- players テーブル  
CREATE POLICY "Users can manage their school's players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = players.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- hand_cards テーブル
CREATE POLICY "Users can manage their school's cards" ON hand_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = hand_cards.school_id 
      AND schools.user_id = auth.uid()
    )
  );
```

### 必要な環境変数
```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 本番環境用（必要に応じて）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
```

### データベース権限・設定確認事項
- [ ] Authentication有効化
- [ ] RLS (Row Level Security) 有効化  
- [ ] 必要なテーブル・カラムの存在確認
- [ ] 適切なインデックス設定
- [ ] JSONB型カラムの性能確認

## 📁 Git除外設定

### 既に適切に設定済み (.gitignore)
- ✅ `node_modules/` - 依存関係
- ✅ `.env*` - 環境変数ファイル
- ✅ `/.next/` - Next.jsビルドファイル
- ✅ `/out/` - 静的エクスポート
- ✅ `.vercel` - Vercelデプロイ設定
- ✅ `*.tsbuildinfo` - TypeScriptキャッシュ

### 追加で除外すべき要素（必要に応じて）
```gitignore
# 開発用一時ファイル
*.log
.DS_Store
*~

# データベースダンプ
*.sql.backup
*.dump

# IDEファイル
.vscode/
.idea/
*.swp
*.swo
```

## 🔧 本番デプロイ前の最終確認

### ビルド・テスト
- [x] `npm run build` 成功確認
- [ ] `npm run lint` ワーニング数確認
- [ ] 本番環境でのテスト実行
- [ ] パフォーマンス測定

### セキュリティ
- [ ] 環境変数の適切な設定
- [ ] API率制限の設定
- [ ] CORS設定の確認
- [ ] Supabase RLSポリシーの検証

### 機能
- [ ] 認証フロー動作確認
- [ ] データベース読み書き確認
- [ ] エラーハンドリング動作確認
- [ ] レスポンシブデザイン確認

## ⚠️ 既知の制限事項

1. **進化システム未実装**: ポケモンの進化は現在未対応
2. **世代交代未実装**: 3年生の卒業・新入生システム未完成
3. **すごろく機能部分実装**: カレンダーとの連携が不完全
4. **マルチプレイヤー未対応**: 現在は単人プレイのみ

## 📋 デプロイ後の確認事項

- [ ] 本番URL動作確認
- [ ] データベース接続確認  
- [ ] 認証機能動作確認
- [ ] モバイル表示確認
- [ ] パフォーマンス確認
- [ ] エラーログ確認