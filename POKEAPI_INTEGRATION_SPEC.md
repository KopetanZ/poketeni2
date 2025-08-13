# PokeAPI統合 部員ライブラリー拡張仕様書

**作成日**: 2025-08-13  
**目的**: PokeAPIを活用した部員データベースの大幅拡張とリアルデータ統合  
**対象**: 全1,302種のポケモンデータベース化と自動配属システム実装

---

## 🎯 プロジェクト概要

### 実装目標
1. **PokeAPI連携システム**: 1,302種のポケモンを自動取得・データベース化
2. **種族値→テニススキル変換**: ポケモンの6種族値を6テニススキルに自動変換
3. **進化系統管理**: 進化前のみ配属、進化後データは将来拡張用に保持
4. **ランダム特殊能力**: 配属時に確率による特殊能力付与
5. **個体値システム**: 同種ポケモンでも個体差を表現

---

## 📊 調査結果まとめ

### PokeAPI仕様
- **総ポケモン数**: 1,302種（全世代・全フォーム含む）
- **データ取得**: RESTful API、制限なし（推奨：ローカルキャッシュ）
- **提供データ**: 種族値、タイプ、特性、進化情報、画像など
- **多言語対応**: 日本語名対応（species-dataから取得）

### 既存システム分析
- **現在の部員数**: 約400種（手動登録済み）
- **スキルシステム**: 6種類（serve, return, volley, stroke, mental, stamina）
- **特殊能力システム**: 既存39種類の特殊能力
- **成長システム**: 栄冠ナイン式ゲージシステム実装済み

---

## 🔄 システム設計

### 1. 種族値→テニススキル変換ロジック

```typescript
interface PokemonBaseStats {
  hp: number;        // HP (45-255)
  attack: number;    // 攻撃 (5-190)
  defense: number;   // 防御 (5-250)
  spAttack: number;  // 特攻 (10-194)
  spDefense: number; // 特防 (20-250)
  speed: number;     // 素早さ (5-200)
}

interface TennisSkills {
  serve_skill: number;    // サーブスキル (10-90)
  return_skill: number;   // リターンスキル (10-90)
  volley_skill: number;   // ボレースキル (10-90)
  stroke_skill: number;   // ストロークスキル (10-90)
  mental: number;         // メンタル (10-90)
  stamina: number;        // スタミナ (10-90)
}

// 変換ロジック
function convertStatsToTennisSkills(stats: PokemonBaseStats, types: string[]): TennisSkills {
  // 基本変換（種族値を10-90にスケール）
  const baseConversion = {
    serve_skill: scaleValue(stats.attack, 5, 190, 10, 90),      // 攻撃力 → サーブ力
    return_skill: scaleValue(stats.defense, 5, 250, 10, 90),    // 防御力 → リターン力  
    volley_skill: scaleValue(stats.spAttack, 10, 194, 10, 90),  // 特攻 → ボレー技術
    stroke_skill: scaleValue(stats.spDefense, 20, 250, 10, 90), // 特防 → ストローク安定性
    mental: scaleValue(stats.speed, 5, 200, 10, 90),            // 素早さ → 反応・判断力
    stamina: scaleValue(stats.hp, 45, 255, 10, 90)             // HP → 持久力
  };

  // タイプ別補正適用
  return applyTypeBonus(baseConversion, types);
}

// タイプ別補正システム
const TYPE_BONUSES: Record<string, Partial<TennisSkills>> = {
  electric: { serve_skill: +8, mental: +5 },      // 電気→パワーサーブ、反応
  fighting: { serve_skill: +10, stamina: +5 },    // 格闘→パワー、体力
  psychic: { mental: +12, volley_skill: +5 },     // エスパー→判断力、技術
  fire: { serve_skill: +6, mental: +8 },          // 炎→攻撃性、気迫
  water: { return_skill: +8, stamina: +6 },       // 水→安定性、持久力
  grass: { stroke_skill: +8, stamina: +4 },       // 草→安定したストローク
  flying: { volley_skill: +10, mental: +3 },      // 飛行→ネットプレー
  ghost: { mental: +15, volley_skill: -5 },       // ゴースト→特殊な戦術
  steel: { return_skill: +12, stamina: +6 },      // 鋼→鉄壁守備
  dragon: { serve_skill: +6, stroke_skill: +6 },  // ドラゴン→バランス型エース
};
```

### 2. 進化系統管理システム

```typescript
interface EvolutionChain {
  pokemonId: number;
  japaneseName: string;
  englishName: string;
  stage: number;                    // 1: 基本形, 2: 1進化, 3: 2進化
  evolvesFrom: number | null;       // 進化前のID
  evolvesTo: number[];              // 進化先のID配列
  evolutionConditions?: {
    level?: number;
    item?: string;
    method?: string;
  };
  isRecruitableDirectly: boolean;   // 直接配属可能か
}

// 配属可能ポケモンフィルタリング
function getRecruitablePokemons(): EvolutionChain[] {
  return allPokemons.filter(pokemon => {
    // 基本形（1進化）のみ配属可能
    return pokemon.stage === 1 || 
           // 進化しないポケモンも配属可能
           (pokemon.evolvesTo.length === 0 && pokemon.stage <= 2);
  });
}

// 進化データ取得・管理
async function buildEvolutionDatabase(): Promise<EvolutionChain[]> {
  const evolutions: EvolutionChain[] = [];
  
  for (let i = 1; i <= 1302; i++) {
    try {
      const speciesData = await PokeAPI.fetchSpecies(i);
      const evolutionChainData = await PokeAPI.fetchEvolutionChain(speciesData.evolution_chain.url);
      
      // 進化チェーン解析・データベース構築
      const chain = parseEvolutionChain(evolutionChainData);
      evolutions.push(...chain);
    } catch (error) {
      console.warn(`Failed to process Pokemon ${i}:`, error);
    }
  }
  
  return evolutions;
}
```

### 3. 特殊能力ランダム付与システム

```typescript
interface SpecialAbilityAssignment {
  abilityId: string;
  probability: number;        // 付与確率 (0-100)
  conditions?: {
    minStats?: Partial<TennisSkills>;
    requiredTypes?: string[];
    rarityLevel?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
}

// レアリティ別特殊能力付与確率
const ABILITY_ASSIGNMENT_RATES = {
  common: {
    anyAbility: 15,           // 何か1つ付与される確率
    goldAbility: 0,           // ゴールド能力確率
    blueAbility: 5,           // ブルー能力確率
    redAbility: 8,            // ネガティブ能力確率
  },
  uncommon: {
    anyAbility: 25,
    goldAbility: 0,
    blueAbility: 12,
    redAbility: 5,
  },
  rare: {
    anyAbility: 40,
    goldAbility: 2,
    blueAbility: 20,
    redAbility: 3,
  },
  epic: {
    anyAbility: 60,
    goldAbility: 8,
    blueAbility: 35,
    redAbility: 1,
  },
  legendary: {
    anyAbility: 80,
    goldAbility: 20,
    blueAbility: 50,
    redAbility: 0,
  }
};

// 特殊能力付与ロジック
function assignRandomAbilities(pokemon: PokemonMember, rarity: string): string[] {
  const rates = ABILITY_ASSIGNMENT_RATES[rarity];
  const assignedAbilities: string[] = [];
  
  if (Math.random() * 100 < rates.anyAbility) {
    // 能力タイプ決定
    const abilityType = determineAbilityType(rates);
    
    // 条件に合う能力をフィルタリング
    const eligibleAbilities = TENNIS_SPECIAL_ABILITIES.filter(ability => {
      return ability.color === abilityType && 
             meetsAssignmentConditions(pokemon, ability);
    });
    
    if (eligibleAbilities.length > 0) {
      const randomAbility = eligibleAbilities[Math.floor(Math.random() * eligibleAbilities.length)];
      assignedAbilities.push(randomAbility.id);
    }
  }
  
  // 伝説・エピック級は複数能力の可能性
  if (rarity === 'legendary' && Math.random() < 0.3) {
    // 2つ目の能力付与処理
  }
  
  return assignedAbilities;
}
```

### 4. 部員配属時ランダム性システム

```typescript
interface RecruitmentVariables {
  baseStatRandomness: number;     // 基本ステータスの個体差 (±10%)
  growthEfficiencyVariance: number; // 成長効率の個体差 (±15%) 
  specialAbilityChance: number;   // 特殊能力付与確率
  personalityVariation: boolean;  // 性格ランダム要素
}

// 個体値システム
function generateIndividualValues(): Record<string, number> {
  return {
    serve_iv: randomBetween(-10, 10),      // ±10の個体差
    return_iv: randomBetween(-10, 10),
    volley_iv: randomBetween(-10, 10),  
    stroke_iv: randomBetween(-10, 10),
    mental_iv: randomBetween(-10, 10),
    stamina_iv: randomBetween(-10, 10),
  };
}

// 成長効率の個体差
function generateGrowthEfficiencyVariance(): Record<string, number> {
  return {
    serve_skill_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,     // 0.85-1.15倍
    return_skill_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,
    volley_skill_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,
    stroke_skill_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,
    mental_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,
    stamina_efficiency: 1.0 + (Math.random() - 0.5) * 0.3,
  };
}

// 部員配属メイン処理
async function recruitNewMember(pokemonName: string): Promise<PokemonMember> {
  // 1. PokeAPIからデータ取得
  const pokemonDetails = await PokeAPI.getPokemonDetails(pokemonName);
  
  // 2. 基本ステータス計算
  const baseSkills = convertStatsToTennisSkills(pokemonDetails.stats, pokemonDetails.types);
  
  // 3. 個体値適用
  const individualValues = generateIndividualValues();
  const finalSkills = applyIndividualValues(baseSkills, individualValues);
  
  // 4. 成長効率計算
  const growthEfficiency = generateGrowthEfficiencyVariance();
  
  // 5. 特殊能力付与
  const rarity = determineRarity(pokemonDetails);
  const specialAbilities = assignRandomAbilities({...pokemonDetails, skills: finalSkills}, rarity);
  
  // 6. メンバーオブジェクト作成
  return {
    pokemon_name: pokemonDetails.name,
    pokemon_id: pokemonDetails.id,
    english_name: pokemonDetails.englishName,
    types: pokemonDetails.types,
    ...finalSkills,
    individual_values: individualValues,
    growth_efficiency: growthEfficiency,
    special_abilities: specialAbilities,
    rarity_level: rarity,
    can_evolve: canEvolve(pokemonDetails.id),
    evolution_data: getEvolutionData(pokemonDetails.id),
  };
}
```

---

## 💾 データベース設計

### 1. 拡張テーブル定義

```sql
-- ポケモンマスターデータテーブル
CREATE TABLE pokemon_master_data (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER UNIQUE NOT NULL,
  japanese_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  types TEXT[] NOT NULL,
  base_stats JSONB NOT NULL,          -- 種族値データ
  sprite_urls JSONB NOT NULL,         -- 画像URL集
  rarity_level TEXT NOT NULL,         -- common, uncommon, rare, epic, legendary
  generation INTEGER NOT NULL,
  is_recruitable BOOLEAN DEFAULT true, -- 直接配属可能か
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 進化関係テーブル
CREATE TABLE pokemon_evolution_chains (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER REFERENCES pokemon_master_data(pokemon_id),
  evolution_stage INTEGER NOT NULL,    -- 1: 基本, 2: 1進化, 3: 2進化
  evolves_from INTEGER REFERENCES pokemon_master_data(pokemon_id),
  evolves_to INTEGER[] DEFAULT '{}',   -- 進化先ID配列
  evolution_conditions JSONB,         -- 進化条件
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- playersテーブル拡張
ALTER TABLE players ADD COLUMN IF NOT EXISTS individual_values JSONB DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS evolution_data JSONB DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_abilities TEXT[] DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS rarity_level TEXT DEFAULT 'common';

-- インデックス作成
CREATE INDEX idx_pokemon_master_recruitable ON pokemon_master_data(is_recruitable);
CREATE INDEX idx_pokemon_master_rarity ON pokemon_master_data(rarity_level);
CREATE INDEX idx_evolution_stage ON pokemon_evolution_chains(evolution_stage);
CREATE INDEX idx_players_rarity ON players(rarity_level);
```

### 2. データ初期化SQL

```sql
-- マスターデータ初期化（サンプル）
INSERT INTO pokemon_master_data (pokemon_id, japanese_name, english_name, types, base_stats, sprite_urls, rarity_level, generation, is_recruitable) VALUES
(1, 'フシギダネ', 'bulbasaur', '{"grass","poison"}', '{"hp":45,"attack":49,"defense":49,"sp_attack":65,"sp_defense":65,"speed":45}', '{"default":"url1","official":"url2"}', 'rare', 1, true),
(2, 'フシギソウ', 'ivysaur', '{"grass","poison"}', '{"hp":60,"attack":62,"defense":63,"sp_attack":80,"sp_defense":80,"speed":60}', '{"default":"url3","official":"url4"}', 'epic', 1, false),
(3, 'フシギバナ', 'venusaur', '{"grass","poison"}', '{"hp":80,"attack":82,"defense":83,"sp_attack":100,"sp_defense":100,"speed":80}', '{"default":"url5","official":"url6"}', 'legendary', 1, false);

-- 進化関係初期化
INSERT INTO pokemon_evolution_chains (pokemon_id, evolution_stage, evolves_from, evolves_to, evolution_conditions) VALUES
(1, 1, NULL, '{2}', '{"level":16}'),
(2, 2, 1, '{3}', '{"level":32}'),
(3, 3, 2, '{}', NULL);
```

---

## 🔧 実装ファイル構成

### 1. 新規作成ファイル

```
src/
├── lib/
│   ├── pokeapi-integration.ts       # PokeAPI統合メインロジック
│   ├── pokemon-master-data.ts       # マスターデータ管理
│   ├── stats-conversion.ts          # 種族値→スキル変換
│   ├── evolution-manager.ts         # 進化システム管理
│   ├── recruitment-system.ts        # 部員配属システム
│   └── individual-values.ts         # 個体値システム
├── types/
│   ├── pokemon-master.ts           # マスターデータ型定義
│   └── recruitment.ts              # 配属システム型定義
└── components/
    ├── pokemon/
    │   ├── PokemonMasterDatabase.tsx  # マスターデータ管理UI
    │   ├── RecruitmentInterface.tsx   # 配属インターフェース
    │   └── EvolutionViewer.tsx        # 進化系統表示
    └── admin/
        └── PokeAPISync.tsx           # データ同期管理画面
```

### 2. 修正対象ファイル

```
src/
├── lib/
│   ├── pokemon-api.ts              # 既存API拡張
│   ├── player-generator.ts         # 配属ロジック統合
│   └── scouting-system.ts          # スカウトシステム統合
├── components/
│   ├── members/MemberManager.tsx   # メンバー管理UI更新
│   └── scouting/ScoutingManager.tsx # スカウト画面更新
└── types/
    └── game.ts                     # ゲーム型定義拡張
```

---

## 📋 実装フェーズ計画

### Phase 1: 基盤システム実装 (1-2週間)
1. **PokeAPI統合システム構築**
   - データ取得・キャッシュシステム
   - エラーハンドリング・リトライ機能
   - レート制限対応

2. **データベーススキーマ拡張**
   - マスターデータテーブル作成
   - 進化関係テーブル作成
   - 既存テーブル拡張

3. **種族値変換システム実装**
   - 基本変換ロジック
   - タイプ別補正システム
   - バランス調整機能

### Phase 2: 部員配属システム実装 (1週間)
1. **個体値システム実装**
   - ランダム個体差生成
   - 成長効率バリエーション
   - 表示・管理UI

2. **特殊能力配属システム**
   - 確率ベース付与システム
   - 条件チェック機能
   - 能力管理インターフェース

### Phase 3: 進化システム実装 (1週間)
1. **進化チェーン管理**
   - 進化データ取得・解析
   - 進化可能判定システム
   - 進化実行機能

2. **UI/UX実装**
   - 配属インターフェース
   - ポケモン詳細表示
   - 進化系統ビューア

### Phase 4: 最適化・テスト (1週間)
1. **パフォーマンス最適化**
   - データベースクエリ最適化
   - キャッシュ戦略改善
   - 並列処理実装

2. **バランス調整**
   - スキル変換バランス
   - 特殊能力付与確率
   - レアリティ分布

---

## 🎮 ユーザー体験設計

### 部員配属フロー
1. **配属可能ポケモン表示**: フィルタリング・検索機能
2. **詳細確認**: 種族値、予想スキル、レアリティ表示
3. **配属実行**: ランダム要素適用、結果表示
4. **配属後管理**: 個体値確認、成長計画設定

### 管理者機能
1. **マスターデータ同期**: PokeAPIから最新データ取得
2. **バランス調整**: 変換パラメータ調整画面
3. **統計表示**: 配属状況、レアリティ分布

---

## ⚠️ 注意事項・制限

### PokeAPI使用上の注意
1. **レート制限**: 過度な連続リクエスト避ける
2. **キャッシュ必須**: 同じデータの重複取得防止
3. **エラーハンドリング**: ネットワーク障害への対応

### ゲームバランス
1. **レアリティインフレ回避**: 伝説ポケモンの希少性維持
2. **初心者配慮**: 序盤ポケモンでも楽しめるバランス
3. **長期プレイ対応**: 成長要素の持続性確保

### パフォーマンス
1. **データベース最適化**: 大量データの効率的な管理
2. **UI応答性**: 1,300種データでも快適な操作性
3. **メモリ使用量**: 画像データの効率的なハンドリング

---

## 🚀 将来拡張計画

### 短期拡張 (3ヶ月以内)
1. **フォーム違い対応**: リージョンフォーム、メガ進化
2. **色違いシステム**: レアバリエーション
3. **個体値厳選**: より詳細な個体管理

### 中期拡張 (6ヶ月以内)
1. **交配システム**: 遺伝・技継承システム
2. **特性システム**: ポケモン特性のテニス能力化
3. **持ち物システム**: 道具による能力強化

### 長期拡張 (1年以内)
1. **対戦AI強化**: ポケモンタイプ相性の戦術反映
2. **ランキングシステム**: 全国大会システム
3. **ソーシャル機能**: プレイヤー間交流・対戦

---

このシステムにより、既存の400種から1,300種への大幅拡張と、よりリアルなポケモンデータに基づいた部員管理システムが実現されます。PokeAPIとの統合により、常に最新のポケモンデータを反映できる持続可能なシステムとなります。