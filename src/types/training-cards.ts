// 栄冠ナイン風進行カードシステムの型定義

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type CardCategory = 'technical' | 'physical' | 'mental' | 'tactical' | 'special';
export type TrainingType = 'serve' | 'return' | 'volley' | 'stroke' | 'stamina' | 'mental' | 'team';

// カード基本情報
export interface TrainingCard {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  category: CardCategory;
  
  // 視覚情報
  icon: string;
  color: string;
  bgGradient: string;
  
  // 基本効果
  baseEffects: TrainingEffect;
  
  // 希少度別の効果倍率
  rarityMultipliers: Record<CardRarity, number>;
  
  // 発動条件
  requirements?: CardRequirements;
  
  // 成功確率（希少度により変動）
  baseSuccessRate: number;
  
  // コスト（体力・資金）
  costs: {
    stamina: number;
    funds?: number;
    motivation?: number; // やる気コスト
  };
  
  // 特殊効果
  specialEffects?: SpecialCardEffect[];
}

// カード効果
export interface TrainingEffect {
  // スキル成長
  skillGrowth?: {
    serve_skill?: number;
    return_skill?: number;
    volley_skill?: number;
    stroke_skill?: number;
    mental?: number;
    stamina?: number;
  };
  
  // 状態変化
  statusChanges?: {
    condition?: number; // 調子
    motivation?: number; // やる気
    injury_risk?: number; // 怪我リスク変動
  };
  
  // 学校効果
  schoolEffects?: {
    reputation?: number;
    funds?: number;
  };
  
  // 特殊能力習得チャンス
  specialAbilityChance?: {
    ability_id: string;
    chance: number; // %
  };
}

// カード使用条件
export interface CardRequirements {
  // プレイヤー条件
  minLevel?: number;
  minStats?: {
    serve_skill?: number;
    return_skill?: number;
    volley_skill?: number;
    stroke_skill?: number;
  };
  
  // 状況条件
  weatherRequired?: string[]; // 特定天候でのみ使用可能
  squadRequired?: number; // 必要メンバー数
  
  // リソース条件
  minFunds?: number;
  minStamina?: number;
  minMotivation?: number;
}

// 特殊効果
export interface SpecialCardEffect {
  type: 'critical_success' | 'chain_combo' | 'inspiration' | 'breakthrough';
  name: string;
  description: string;
  triggerChance: number; // %
  effect: TrainingEffect;
}

// カードの希少度設定
export interface RarityConfig {
  rarity: CardRarity;
  name: string;
  color: string;
  bgColor: string;
  
  // 出現確率（基本）
  baseDropRate: number;
  
  // 効果倍率
  effectMultiplier: number;
  
  // 成功確率ボーナス
  successRateBonus: number;
  
  // 視覚効果
  glowEffect: boolean;
  sparkleEffect: boolean;
}

// カード使用結果
export interface CardUsageResult {
  success: boolean;
  card: TrainingCard;
  actualEffects: TrainingEffect;
  
  // 成功度合い
  successLevel: 'failure' | 'normal' | 'great' | 'perfect' | 'critical';
  
  // 特殊効果発動
  specialEffectsTriggered: SpecialCardEffect[];
  
  // 結果メッセージ
  resultMessage: string;
  flavorText?: string;
  
  // 経験値・成長
  experienceGained: number;
  skillPointsGained: Record<string, number>;
  
  // リスク結果
  injuryOccurred?: boolean;
  fatigueLevel?: number;
}

// カードドロー・入手システム
export interface CardDrop {
  cards: TrainingCard[];
  context: 'daily_practice' | 'event_reward' | 'reputation_bonus' | 'special_training';
  
  // ドロップ修正要因
  modifiers: {
    schoolReputation: number;
    playerLevel: number;
    recentPerformance: number; // 最近の成績
    seasonBonus: number; // 季節ボーナス
  };
}

// カードデッキ管理
export interface PlayerCardDeck {
  playerId: string;
  availableCards: TrainingCard[];
  
  // 使用制限
  dailyUsageLimit: Record<string, number>; // カードID -> 残り使用回数
  cooldownCards: Record<string, Date>; // クールダウン中のカード
  
  // 習得可能カード（条件付き）
  unlockableCards: {
    card: TrainingCard;
    unlockConditions: CardRequirements;
    progress: number; // 解放進度 %
  }[];
}

// 練習セッション情報
export interface TrainingSession {
  date: Date;
  playerId: string;
  
  // 環境要因
  weather: string;
  courtCondition: string;
  
  // 選択したカード
  selectedCards: TrainingCard[];
  
  // セッション結果
  results: CardUsageResult[];
  totalGrowth: TrainingEffect;
  
  // セッション評価
  sessionRating: 'poor' | 'average' | 'good' | 'excellent' | 'legendary';
  
  // 連鎖効果
  comboEffects?: {
    comboName: string;
    bonusEffects: TrainingEffect;
  };
}

// カード戦術システム（将来拡張用）
export interface CardTactic {
  id: string;
  name: string;
  description: string;
  
  // 必要カード組み合わせ
  requiredCards: {
    category: CardCategory;
    rarity?: CardRarity;
    count: number;
  }[];
  
  // 戦術効果
  tacticEffect: TrainingEffect;
  
  // 発動条件
  activationConditions: {
    consecutiveDays?: number; // 連続日数
    teamMorale?: number; // チーム士気
    matchProximity?: number; // 試合までの日数
  };
}