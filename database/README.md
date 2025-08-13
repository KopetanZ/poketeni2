# Database Organization

このディレクトリには、ポケテニマスタープロジェクトのデータベース関連ファイルが整理されています。

## ディレクトリ構造

### `/schemas/` - メインスキーマファイル
- `01-core-schema.sql` - 基本テーブル（schools, players等）
- `02-pokemon-integration.sql` - Pokemon API統合
- `03-items-equipment.sql` - アイテム・装備システム
- `04-tournament-system.sql` - トーナメントシステム
- `05-rival-schools.sql` - ライバル校システム
- `06-event-history.sql` - イベント履歴
- `07-game-progress.sql` - ゲーム進行管理

### `/migrations/` - データベース変更管理
- `add-*.sql` - カラム追加系
- `complete-schema-fix.sql` - 包括的スキーマ修正
- `create-missing-tables.sql` - 不足テーブル作成
- `insert-enhanced-special-abilities.sql` - データ挿入系
- `remove-foreign-key-constraints.sql` - 制約削除

### `/rls-policies/` - Row Level Security設定
- `fix-rls-policies-correct.sql` - 正しいRLSポリシー設定
- `fix-event-history-rls-simple.sql` - イベント履歴RLS
- `fix-game-progress-rls.sql` - ゲーム進行RLS

### `/test-scripts/` - テスト・検証スクリプト
開発時のテスト、データ確認、スキーマ検証に使用

### `/utilities/` - ユーティリティスクリプト
データベース操作の自動化、セットアップスクリプトなど

## セットアップ手順

1. **基本スキーマの作成** (順番通りに実行)
   ```bash
   # schemas/ディレクトリ内のファイルを01から順番に実行
   psql -f database/schemas/01-core-schema.sql
   psql -f database/schemas/02-pokemon-integration.sql
   # ... 以下同様
   ```

2. **RLSポリシーの設定**
   ```bash
   psql -f database/rls-policies/fix-rls-policies-correct.sql
   ```

3. **必要に応じてマイグレーション実行**
   ```bash
   psql -f database/migrations/[必要なファイル].sql
   ```

## 注意事項

- スキーマファイルは依存関係順に番号付けされています
- 本番環境では適切なRLSポリシーを設定してください
- test-scriptsは開発環境でのみ使用してください
- マイグレーションは本番データのバックアップ後に実行してください

## クリーンアップについて

このリファクタリングにより以下が改善されました：
- 44個のルートレベルファイルが5つのカテゴリに整理
- 重複ファイルの除去（7個削除）
- 明確な実行順序とファイル命名規則
- 開発・本番環境の分離