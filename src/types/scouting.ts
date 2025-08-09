// スカウトシステムの型定義

export interface ScoutingLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity_weights: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  cost: number;                    // スカウト費用
  time_required: number;           // 必要時間（日数）
  max_encounters: number;          // 最大遭遇数
  special_pokemon?: string[];      // 特別なポケモン（その場所でのみ出現）
  level_range: {
    min: number;
    max: number;
  };
}

export interface ScoutingResult {
  success: boolean;
  pokemon_found?: DiscoveredPokemon[];
  message: string;
  cost_spent: number;
  time_spent: number;
}

export interface DiscoveredPokemon {
  pokemon_name: string;
  pokemon_id: number;
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  };
  special_abilities?: import('./special-abilities').SpecialAbility[];
  recruitment_cost: number;        // 勧誘に必要な費用
  recruitment_difficulty: number;  // 勧誘成功確率（0-1）
  discovered_at: string;          // 発見場所
}

export interface RecruitmentAttempt {
  pokemon: DiscoveredPokemon;
  success: boolean;
  cost_spent: number;
  message: string;
  new_player?: import('./game').Player;
}

export interface ScoutingProgress {
  active_scoutings: ActiveScouting[];
  discovered_pokemon: DiscoveredPokemon[];
  total_scouts_sent: number;
  successful_recruitments: number;
  funds_spent: number;
}

export interface ActiveScouting {
  id: string;
  location: ScoutingLocation;
  start_date: { year: number; month: number; day: number };
  end_date: { year: number; month: number; day: number };
  progress: number;               // 0-1の進捗
  scout_quality: 'basic' | 'advanced' | 'expert'; // スカウトレベル
}

// スカウト報告書
export interface ScoutingReport {
  location: string;
  date: string;
  pokemon_sighted: number;
  pokemon_contacted: number;
  successful_approaches: number;
  rare_encounters: number;
  notes: string[];
}