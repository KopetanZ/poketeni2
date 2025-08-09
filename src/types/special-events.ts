// 特殊能力習得イベントシステムの型定義

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  type: 'training' | 'match' | 'random' | 'seasonal' | 'achievement';
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // 発生条件
  trigger_conditions: {
    player_level?: { min?: number; max?: number };
    pokemon_types?: string[];
    current_abilities?: string[];        // 既に持っている能力
    excluded_abilities?: string[];       // 持っていてはいけない能力
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    school_reputation?: { min?: number; max?: number };
    match_results?: 'win' | 'loss' | 'any';
    consecutive_wins?: number;
    specific_opponents?: string[];
  };

  // 習得可能な特殊能力
  available_abilities: {
    ability_id: string;
    success_rate: number;              // 基本成功確率
    requirements?: {
      stat_minimums?: { [key: string]: number };  // 必要最低ステータス
      personality_match?: boolean;      // 性格マッチ
      intensive_training?: boolean;     // 集中練習必要
    };
  }[];

  // イベント選択肢
  choices?: EventChoice[];
  
  // 報酬・結果
  rewards?: {
    experience?: number;
    stat_boosts?: { [key: string]: number };
    funds?: number;
    reputation?: number;
  };

  // イベント期間
  duration?: {
    start_date?: { month: number; day: number };
    end_date?: { month: number; day: number };
  };
}

export interface EventChoice {
  id: string;
  text: string;
  description: string;
  effects: {
    success_rate_modifier?: number;    // 成功率への影響
    stat_requirements_modifier?: number;  // 必要ステータスへの影響
    additional_rewards?: {
      experience?: number;
      funds?: number;
      reputation?: number;
    };
  };
  risk?: number;                      // リスク要素（0-1）
}

export interface EventOutcome {
  success: boolean;
  learned_ability?: import('./special-abilities').SpecialAbility;
  message: string;
  rewards_gained: {
    experience?: number;
    stat_boosts?: { [key: string]: number };
    funds?: number;
    reputation?: number;
  };
  side_effects?: {
    injury_risk?: boolean;
    motivation_change?: number;
    condition_change?: string;
  };
}

export interface ActiveEvent {
  event: SpecialEvent;
  target_player: import('./game').Player;
  start_date: { year: number; month: number; day: number };
  end_date: { year: number; month: number; day: number };
  progress: number;                   // 0-1
  selected_choices: string[];
  selected_ability: string;
}

export interface EventHistory {
  event_id: string;
  player_id: string;
  date: { year: number; month: number; day: number };
  outcome: EventOutcome;
  choices_made: string[];
}