// ゲームバランス調整設定
// シミュレーションゲームの面白さを最大化するための設定

import { Player } from '@/types/game';

// ===== プレイヤー成長曲線の設計 =====
export const PLAYER_GROWTH_CONFIG = {
  // フロー理論に基づいた難易度調整
  difficulty_curve: {
    early_game: {
      level_range: [1, 10],
      growth_rate: 1.8,          // 序盤は成長を実感しやすく
      skill_cap: 30,             // 上限を低めに設定
      experience_multiplier: 1.5  // 経験値を多めに
    },
    mid_game: {
      level_range: [11, 30],
      growth_rate: 1.2,          // 中盤は標準的な成長
      skill_cap: 60,
      experience_multiplier: 1.0
    },
    late_game: {
      level_range: [31, 50],
      growth_rate: 0.8,          // 終盤は成長が緩やかに
      skill_cap: 100,
      experience_multiplier: 0.8
    },
    endgame: {
      level_range: [51, 99],
      growth_rate: 0.5,          // 最高レベルは到達困難
      skill_cap: 150,
      experience_multiplier: 0.6
    }
  },
  
  // 能力値の初期設定（低めスタートで成長実感を強化）
  initial_stats: {
    base_stats: {
      serve_skill: { min: 8, max: 15 },      // 従来より大幅に低下
      return_skill: { min: 8, max: 15 },
      volley_skill: { min: 5, max: 12 },     // ボレーは特に難しい技術
      stroke_skill: { min: 10, max: 18 },    // ストロークは比較的習得しやすい
      mental: { min: 15, max: 25 },          // メンタルは個人差大
      stamina: { min: 20, max: 35 }          // スタミナは基礎体力
    },
    
    // エース格の初期ボーナス（やる気を出すため）
    ace_bonus: {
      serve_skill: 8,
      return_skill: 6,
      volley_skill: 4,
      stroke_skill: 7,
      mental: 10,
      stamina: 5
    }
  }
};

// ===== チーム構成の設計 =====
export const TEAM_COMPOSITION_CONFIG = {
  // 初期メンバーを少なくしてわかりやすく
  initial_team_size: 4,        // 従来の半分程度
  
  // 役割分担を明確にしたメンバー構成
  initial_team_roles: [
    {
      role: 'ace',
      name_prefix: 'エース',
      position: 'captain',
      stat_distribution: 'balanced_high',
      personality: 'leader'
    },
    {
      role: 'power_hitter',
      name_prefix: 'パワー',
      position: 'regular',
      stat_distribution: 'power_focused',
      personality: 'aggressive'
    },
    {
      role: 'technical',
      name_prefix: 'テクニカル',
      position: 'regular',
      stat_distribution: 'technique_focused',
      personality: 'calm'
    },
    {
      role: 'rookie',
      name_prefix: '新人',
      position: 'member',
      stat_distribution: 'low_potential',
      personality: 'enthusiastic'
    }
  ],
  
  // 最大チームサイズ（段階的に拡張）
  max_team_size: 8,
  
  // 新メンバー加入条件
  recruitment_conditions: {
    reputation_threshold: [20, 50, 100, 150], // 評判に応じて段階的に
    level_requirement: [5, 15, 25, 35],       // チームレベルも考慮
    facility_requirement: ['basic', 'intermediate', 'advanced', 'pro']
  }
};

// ===== 経済バランス設定 =====
export const ECONOMY_CONFIG = {
  // 初期資金（控えめに設定）
  initial_funds: 5000,
  
  // 収入源
  income_sources: {
    daily_allowance: 100,          // 日当（基本収入）
    tournament_prize: {
      local: 2000,
      regional: 8000,
      national: 25000
    },
    sponsorship: {
      reputation_threshold: 50,
      monthly_amount: 3000
    }
  },
  
  // 支出
  expenses: {
    facility_maintenance: 200,      // 日当
    equipment_repair: 500,         // 週当
    player_care: 300,             // 日当（食事・ケア）
    emergency_fund: 1000          // 緊急時の最低保有額
  }
};

// ===== 学習・成長の可視化設定 =====
export const PROGRESSION_FEEDBACK = {
  // レベルアップ時のフィードバック強化
  levelup_notifications: {
    stat_threshold: 5,         // 5以上のステータス上昇で特別通知
    skill_milestone: [20, 40, 60, 80, 100], // マイルストーンでの祝福
    special_ability_unlock: true
  },
  
  // 成長ログの詳細化
  growth_tracking: {
    daily_progress: true,      // 日々の小さな成長も記録
    comparison_display: true,  // 過去との比較表示
    goal_suggestion: true,     // 次の目標の提案
    celebration_events: true   // 成長達成時のお祝いイベント
  }
};

// ===== 選択による影響の明確化 =====
export const CHOICE_IMPACT_CONFIG = {
  // カード使用効果の可視化
  card_effects: {
    immediate_feedback: true,     // 即座の効果表示
    long_term_tracking: true,     // 長期的な影響追跡
    comparison_mode: true,        // 選択肢の比較表示
    regret_minimization: false    // 後悔を減らすヒント（初期はOFF）
  },
  
  // 練習方針の明確な結果
  training_impact: {
    visible_progress_bar: true,   // 進捗バーで視覚化
    skill_relationship: true,     // スキル間の関係性表示
    efficiency_indicator: true,   // 効率性の指標
    burnout_warning: true        // オーバーワークの警告
  }
};

// ===== ゲーム進行のペース調整 =====
export const PACING_CONFIG = {
  // 時間経過の調整
  time_scale: {
    days_per_real_minute: 0.5,   // リアル1分で半日進行（ゆっくり目）
    auto_pause_events: true,     // 重要イベント時は自動停止
    speed_control: true          // プレイヤーによる速度調整可能
  },
  
  // 重要イベントの頻度
  milestone_events: {
    first_tournament: 30,        // 30日目で最初の大会
    rival_appearance: 45,        // 45日目でライバル登場
    major_tournament: 90,        // 90日目で大きな大会
    year_end_evaluation: 365     // 1年後に総評価
  }
};

// ===== シミュレーションゲームの心理学的要素 =====
export const PSYCHOLOGICAL_ENGAGEMENT = {
  // 達成感の演出
  achievement_system: {
    micro_achievements: true,     // 小さな達成の積み重ね
    visual_celebration: true,     // 視覚的な祝福演出
    social_recognition: true,     // 他のキャラクターからの承認
    progress_persistence: true    // 進歩の永続化
  },
  
  // 自律性の尊重
  player_autonomy: {
    meaningful_choices: true,     // 意味のある選択肢
    multiple_paths: true,         // 複数の成功ルート
    failure_tolerance: true,      // 失敗に対する寛容性
    style_flexibility: true       // プレイスタイルの自由度
  },
  
  // 習熟感の提供
  mastery_progression: {
    skill_tree_visualization: true,  // スキルツリーの可視化
    expertise_recognition: true,     // 専門性の認識
    teaching_opportunities: true,    // 後輩指導による理解深化
    innovation_rewards: true         // 独自戦略の報酬
  }
};

// ===== バランス調整用のデバッグ設定 =====
export const DEBUG_CONFIG = {
  // 開発者用の調整オプション
  developer_mode: false,
  fast_growth: false,             // 高速成長モード
  unlimited_funds: false,         // 資金無制限
  all_events_unlocked: false,     // 全イベント解禁
  
  // バランステスト用
  balance_testing: {
    stat_scaling_test: false,     // ステータススケーリングテスト
    economy_stress_test: false,   // 経済システムストレステスト
    progression_analysis: false   // 進行分析モード
  }
};

// ===== 統合設定オブジェクト =====
export const GAME_BALANCE = {
  player_growth: PLAYER_GROWTH_CONFIG,
  team_composition: TEAM_COMPOSITION_CONFIG,
  economy: ECONOMY_CONFIG,
  progression_feedback: PROGRESSION_FEEDBACK,
  choice_impact: CHOICE_IMPACT_CONFIG,
  pacing: PACING_CONFIG,
  psychological: PSYCHOLOGICAL_ENGAGEMENT,
  debug: DEBUG_CONFIG
};

// ===== 初期データ生成関数 =====
export class GameBalanceManager {
  // 初期プレイヤー生成（バランス調整済み）
  static generateInitialPlayer(role: string, pokemonId: number): Partial<Player> {
    const roleConfig = TEAM_COMPOSITION_CONFIG.initial_team_roles.find(r => r.role === role);
    if (!roleConfig) throw new Error(`Unknown role: ${role}`);
    
    const baseStats = PLAYER_GROWTH_CONFIG.initial_stats.base_stats;
    const aceBonus = role === 'ace' ? PLAYER_GROWTH_CONFIG.initial_stats.ace_bonus : 
                     Object.fromEntries(Object.keys(baseStats).map(key => [key, 0]));
    
    return {
      level: 1,
      grade: Math.floor(Math.random() * 3) + 1, // 1-3年生
      position: roleConfig.position,
      condition: 'good',
      motivation: role === 'ace' ? 85 : Math.floor(Math.random() * 20) + 60, // 60-80 (エースは高め)
      
      // 低めの初期ステータス（成長を実感しやすくするため）
      serve_skill: Math.floor(Math.random() * (baseStats.serve_skill.max - baseStats.serve_skill.min)) + baseStats.serve_skill.min + aceBonus.serve_skill,
      return_skill: Math.floor(Math.random() * (baseStats.return_skill.max - baseStats.return_skill.min)) + baseStats.return_skill.min + aceBonus.return_skill,
      volley_skill: Math.floor(Math.random() * (baseStats.volley_skill.max - baseStats.volley_skill.min)) + baseStats.volley_skill.min + aceBonus.volley_skill,
      stroke_skill: Math.floor(Math.random() * (baseStats.stroke_skill.max - baseStats.stroke_skill.min)) + baseStats.stroke_skill.min + aceBonus.stroke_skill,
      mental: Math.floor(Math.random() * (baseStats.mental.max - baseStats.mental.min)) + baseStats.mental.min + aceBonus.mental,
      stamina: Math.floor(Math.random() * (baseStats.stamina.max - baseStats.stamina.min)) + baseStats.stamina.min + aceBonus.stamina,
      
      matches_played: 0,
      matches_won: 0,
      experience_points: 0
    };
  }
  
  // 成長レート計算
  static calculateGrowthRate(level: number): number {
    const config = PLAYER_GROWTH_CONFIG.difficulty_curve;
    
    if (level <= config.early_game.level_range[1]) {
      return config.early_game.growth_rate;
    } else if (level <= config.mid_game.level_range[1]) {
      return config.mid_game.growth_rate;
    } else if (level <= config.late_game.level_range[1]) {
      return config.late_game.growth_rate;
    } else {
      return config.endgame.growth_rate;
    }
  }
  
  // 経験値必要量計算
  static calculateExperienceRequired(level: number): number {
    const baseExp = 100;
    const growthRate = this.calculateGrowthRate(level);
    return Math.floor(baseExp * Math.pow(level, 1.5) / growthRate);
  }
}

// ===== 経済バランス設定（詳細版） =====
export const ECONOMIC_BALANCE_CONFIG = {
  daily_income: {
    base_amount: 500,              // 基本日当
    reputation_multiplier: 10,      // 評判1につき10円増加
    player_count_penalty: 25       // プレイヤー1人につき25円維持費
  },
  
  item_pricing: {
    equipment_base_multipliers: {
      common: 1.0,
      uncommon: 1.8,
      rare: 3.2,
      epic: 6.0,
      legendary: 12.0
    },
    market_fluctuation: {
      min_multiplier: 0.8,         // 最低価格（20%OFF）
      max_multiplier: 1.3,         // 最高価格（30%UP）
      daily_change_rate: 0.05      // 日次変動率5%
    }
  },
  
  tournament_rewards: {
    local: { prize: 2500, reputation: 5 },
    regional: { prize: 10000, reputation: 15 },
    national: { prize: 40000, reputation: 50 },
    international: { prize: 150000, reputation: 100 }
  }
};

// ===== イベントバランス設定 =====
export const EVENT_BALANCE_CONFIG = {
  event_probabilities: {
    common: 0.25,      // 日常イベント
    uncommon: 0.15,    // 軽微な特別イベント
    rare: 0.08,        // 重要イベント
    epic: 0.03,        // 大型イベント
    legendary: 0.005   // 伝説級イベント
  },
  
  reward_scaling: {
    experience_multiplier: {
      common: 1.0,
      uncommon: 1.5,
      rare: 2.5,
      epic: 4.0,
      legendary: 8.0
    },
    
    item_drop_rates: {
      common: 0.8,     // 80%でアイテムドロップ
      uncommon: 0.6,   // 60%でアイテムドロップ  
      rare: 0.4,       // 40%でアイテムドロップ
      epic: 0.9,       // 90%でアイテムドロップ（レア確定）
      legendary: 1.0   // 100%でアイテムドロップ
    }
  }
};

export default GAME_BALANCE;