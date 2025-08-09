// ポケモン個体値・成長システムの型定義

// 6つの基本ステータス（ポケモン原作準拠）
export interface PokemonBaseStats {
  hp: number;        // → メンタル
  attack: number;    // → サーブ  
  defense: number;   // → リターン
  sp_attack: number; // → ボレー
  sp_defense: number;// → ストローク
  speed: number;     // → スタミナ
}

// 個体値（0-31）
export interface IndividualValues extends PokemonBaseStats {}

// 努力値（0-255、合計最大510）
export interface EffortValues extends PokemonBaseStats {}

// ポケモンの性格
export type PokemonNature = 
  // 攻撃系
  | 'いじっぱり'    // 攻撃↑ 特攻↓
  | 'やんちゃ'      // 攻撃↑ 特防↓
  | 'ゆうかん'      // 攻撃↑ 素早↓
  | 'さみしがり'    // 攻撃↑ 防御↓
  
  // 防御系  
  | 'ずぶとい'      // 防御↑ 攻撃↓
  | 'わんぱく'      // 防御↑ 特攻↓
  | 'のうてんき'    // 防御↑ 特防↓
  | 'のんき'        // 防御↑ 素早↓
  
  // 特攻系
  | 'ひかえめ'      // 特攻↑ 攻撃↓
  | 'おっとり'      // 特攻↑ 防御↓
  | 'うっかりや'    // 特攻↑ 特防↓
  | 'れいせい'      // 特攻↑ 素早↓
  
  // 特防系
  | 'おだやか'      // 特防↑ 攻撃↓
  | 'おとなしい'    // 特防↑ 防御↓
  | 'しんちょう'    // 特防↑ 特攻↓
  | 'なまいき'      // 特防↑ 素早↓
  
  // 素早さ系
  | 'ようき'        // 素早↑ 特攻↓
  | 'むじゃき'      // 素早↑ 特防↓
  | 'せっかち'      // 素早↑ 防御↓
  | 'おくびょう'    // 素早↑ 攻撃↓
  
  // 補正なし
  | 'がんばりや'    // 補正なし
  | 'すなお'        // 補正なし
  | 'てれや'        // 補正なし
  | 'きまぐれ'      // 補正なし
  | 'まじめ'        // 補正なし;

// 性格による能力補正
export interface NatureModifier {
  increased: keyof PokemonBaseStats | null; // 1.1倍
  decreased: keyof PokemonBaseStats | null; // 0.9倍
}

// 種族値データ（ポケモンの種類ごとの基礎値）
export interface SpeciesBaseStats extends PokemonBaseStats {
  total: number; // 合計種族値
}

// ポケモンの完全なステータス情報
export interface PokemonStats {
  // 基本情報
  pokemon_id: number;
  pokemon_name: string;
  level: number;
  experience: number;
  experience_to_next: number;
  
  // 個体値（隠しステータス）
  individual_values: IndividualValues;
  iv_visibility: {
    hp: boolean;
    attack: boolean;
    defense: boolean;
    sp_attack: boolean;
    sp_defense: boolean;
    speed: boolean;
  };
  
  // 努力値（プレイヤーが育成で獲得）
  effort_values: EffortValues;
  effort_total: number; // 現在の努力値合計（最大510）
  
  // 性格・特性
  nature: PokemonNature;
  ability?: string;
  
  // 計算された最終能力値
  final_stats: {
    serve_skill: number;    // サーブ（攻撃ベース）
    return_skill: number;   // リターン（防御ベース）
    volley_skill: number;   // ボレー（特攻ベース）
    stroke_skill: number;   // ストローク（特防ベース）
    mental: number;         // メンタル（HPベース）
    stamina: number;        // スタミナ（素早さベース）
  };
  
  // メタ情報
  is_shiny: boolean;      // 色違い
  iv_judge_unlocked: boolean; // 個体値ジャッジ解放済み
  potential_rank: 'S' | 'A' | 'B' | 'C' | 'D'; // 個体値合計ランク
}

// レベルアップ時の成長情報
export interface GrowthResult {
  level_gained: number;
  stats_increased: {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  };
  total_increase: number;
  new_abilities?: string[];
  evolution_available?: {
    evolve_to: number;
    evolve_name: string;
    requirements_met: boolean;
  };
}

// 個体値ランク判定
export interface IVRankJudgment {
  overall_rank: 'S' | 'A' | 'B' | 'C' | 'D';
  total_ivs: number;
  best_stats: (keyof PokemonBaseStats)[];
  worst_stats: (keyof PokemonBaseStats)[];
  judge_comment: string;
  perfect_ivs: number; // 31の個体値の数
}

// 努力値配分プリセット
export type EVDistribution = 
  | 'balanced'     // 全能力均等
  | 'offensive'    // 攻撃・特攻重点
  | 'defensive'    // 防御・特防重点  
  | 'speedy'       // 素早さ重点
  | 'tank'         // HP・防御重点
  | 'technical'    // 特攻・素早さ重点
  | 'physical'     // 攻撃・素早さ重点
  | 'custom';      // カスタム配分

// 成長履歴
export interface GrowthHistory {
  id: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
  growth_type: 'level_up' | 'evolution' | 'training' | 'battle';
  changes: {
    level_change?: number;
    ev_changes?: Partial<EffortValues>;
    stat_changes?: Partial<PokemonStats['final_stats']>;
  };
  trigger: string; // 'カード使用', 'CPU戦勝利', '進化' など
}