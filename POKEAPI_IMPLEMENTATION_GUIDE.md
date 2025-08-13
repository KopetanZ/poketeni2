# PokeAPI統合 部員ライブラリー拡張 実装ガイド

**作成日**: 2025-01-13  
**目的**: 部員ライブラリーを1,302種に拡張するための実装手順と使用方法

---

## 🚀 実装完了項目

### 1. データベーススキーマ拡張 ✅
- `pokeapi-database-setup.sql`: 新しいテーブルとカラムの作成
- `pokemon_master_data`: ポケモンマスターデータテーブル
- `pokemon_evolution_chains`: 進化関係テーブル
- `players`テーブル拡張: 個体値、進化データ、特殊能力、レアリティ

### 2. 種族値変換システム ✅
- `src/lib/stats-conversion.ts`: 種族値→テニススキル変換ロジック
- タイプ別補正システム
- 個体値・成長効率適用機能
- スキル評価・戦術アドバイス機能

### 3. 部員配属システム ✅
- `src/lib/recruitment-system.ts`: 配属ロジックと個体値生成
- 特殊能力ランダム付与システム
- レアリティ判定システム
- 進化システム管理

### 4. ユーザーインターフェース ✅
- `src/components/pokemon/RecruitmentInterface.tsx`: 配属インターフェース
- ポケモン一覧表示・検索・フィルタリング
- 詳細情報表示・予想スキル表示
- 配属実行・結果表示

### 5. データ同期スクリプト ✅
- `pokeapi-full-sync.js`: 全1,302種のポケモンデータ取得・挿入

---

## 📋 実装手順

### Step 1: データベースセットアップ
```bash
# 1. Supabaseダッシュボードにアクセス
# https://supabase.com/dashboard

# 2. プロジェクトを選択

# 3. SQL Editor → New Query

# 4. pokeapi-database-setup.sqlの内容をコピー&ペースト

# 5. 実行ボタンをクリック
```

### Step 2: 全ポケモンデータ同期
```bash
# 1. 依存関係インストール
npm install @supabase/supabase-js

# 2. 同期スクリプト実行
node pokeapi-full-sync.js

# 注意: 全1,302種の処理には時間がかかります（約10-15分）
```

### Step 3: アプリケーション起動
```bash
# 開発サーバー起動
npm run dev

# 部員配属画面にアクセス
# http://localhost:3000/recruitment
```

---

## 🎯 使用方法

### 1. 部員配属の流れ
1. **配属可能ポケモン一覧表示**
   - 検索・フィルタリング機能
   - レアリティ・世代別表示

2. **ポケモン詳細確認**
   - 種族値表示
   - 予想テニススキル表示
   - 進化情報表示

3. **配属実行**
   - 個体値自動生成
   - 特殊能力ランダム付与
   - データベース登録

### 2. フィルタリング機能
- **検索**: ポケモン名（日本語・英語）
- **レアリティ**: common, uncommon, rare, epic, legendary
- **世代**: 第1世代〜第9世代

### 3. 表示情報
- **基本情報**: 名前、英語名、世代、レアリティ
- **種族値**: HP, 攻撃, 防御, 特攻, 特防, 素早さ
- **予想スキル**: サーブ、リターン、ボレー、ストローク、メンタル、スタミナ
- **個体値**: 配属時のランダム個体差
- **特殊能力**: 確率ベースの能力付与

---

## 🔧 カスタマイズ・調整

### 1. スキル変換バランス調整
```typescript
// src/lib/stats-conversion.ts
// タイプ別補正の調整
export const TYPE_BONUSES: TypeBonus[] = [
  {
    type: 'electric',
    skills: { serve_skill: 8, mental: 5 }, // 数値を調整
    description: '電気タイプ: パワーサーブと反応速度が向上'
  },
  // ... 他のタイプも同様に調整
];
```

### 2. レアリティ判定ロジック調整
```typescript
// src/lib/recruitment-system.ts
export function determineRarity(baseStats: PokemonBaseStats, types: string[]): string {
  const totalStats = Object.values(baseStats).reduce((sum, stat) => sum + stat, 0);
  
  // 閾値の調整
  if (totalStats >= 600) return 'epic';      // 600 → 調整可能
  if (totalStats >= 500) return 'rare';      // 500 → 調整可能
  if (totalStats >= 400) return 'uncommon';  // 400 → 調整可能
  
  return 'common';
}
```

### 3. 特殊能力付与確率調整
```typescript
// src/lib/recruitment-system.ts
const ABILITY_ASSIGNMENT_RATES = {
  common: {
    anyAbility: 15,        // 15% → 調整可能
    goldAbility: 0,        // 0% → 調整可能
    blueAbility: 5,        // 5% → 調整可能
    redAbility: 8,         // 8% → 調整可能
  },
  // ... 他のレアリティも同様に調整
};
```

---

## 📊 データベース構造

### 1. 新規テーブル
```sql
-- ポケモンマスターデータ
pokemon_master_data (
  id, pokemon_id, japanese_name, english_name, types,
  base_stats, sprite_urls, rarity_level, generation, is_recruitable
)

-- 進化関係
pokemon_evolution_chains (
  id, pokemon_id, evolution_stage, evolves_from, evolves_to, evolution_conditions
)
```

### 2. 拡張カラム
```sql
-- playersテーブル拡張
ALTER TABLE players ADD COLUMN individual_values JSONB;
ALTER TABLE players ADD COLUMN evolution_data JSONB;
ALTER TABLE players ADD COLUMN special_abilities TEXT[];
ALTER TABLE players ADD COLUMN rarity_level TEXT;
ALTER TABLE players ADD COLUMN pokemon_master_id INTEGER;
```

### 3. ビュー
```sql
-- 配属可能ポケモン一覧
recruitable_pokemon

-- 統計情報
pokemon_statistics
```

---

## ⚠️ 注意事項・制限

### 1. PokeAPI使用上の注意
- **レート制限**: 過度な連続リクエストを避ける
- **キャッシュ**: 同じデータの重複取得を防ぐ
- **エラーハンドリング**: ネットワーク障害への対応

### 2. パフォーマンス
- **データ量**: 1,302種のデータは大量
- **画像**: スプライト画像の効率的な管理
- **クエリ**: インデックスの適切な設定

### 3. ゲームバランス
- **レアリティ**: 伝説ポケモンの希少性維持
- **スキル分布**: 序盤ポケモンでも楽しめるバランス
- **成長要素**: 長期プレイの持続性確保

---

## 🚀 将来拡張計画

### 短期拡張 (1-2ヶ月)
- [ ] フォーム違い対応（リージョンフォーム、メガ進化）
- [ ] 色違いシステム
- [ ] 個体値厳選機能

### 中期拡張 (3-6ヶ月)
- [ ] 交配システム
- [ ] 特性システム
- [ ] 持ち物システム

### 長期拡張 (6ヶ月以上)
- [ ] 対戦AI強化
- [ ] ランキングシステム
- [ ] ソーシャル機能

---

## 🔍 トラブルシューティング

### 1. データベース接続エラー
```bash
# 環境変数確認
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 接続テスト
node test-db-connection.js
```

### 2. PokeAPI取得エラー
```bash
# ネットワーク接続確認
curl https://pokeapi.co/api/v2/pokemon/1

# レート制限確認
# バッチサイズを小さくする（pokeapi-full-sync.js）
const BATCH_SIZE = 10; // 20 → 10に変更
```

### 3. スキル変換エラー
```typescript
// デバッグログ追加
console.log('Base stats:', baseStats);
console.log('Types:', types);
console.log('Converted skills:', skills);
```

---

## 📞 サポート・問い合わせ

### 実装に関する質問
- GitHub Issues: プロジェクトのIssuesページ
- 技術的な問題: ログとエラーメッセージを添付

### 機能追加・改善提案
- 新機能のアイデア
- UI/UXの改善提案
- ゲームバランスの調整提案

---

このガイドに従って実装することで、既存の400種から1,300種への大幅拡張と、よりリアルなポケモンデータに基づいた部員管理システムが実現されます。

**🎉 実装完了後は、豊富なポケモンデータを活用したテニス部運営をお楽しみください！**
