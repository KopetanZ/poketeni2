// 栄冠ナイン風分岐選択システムの型定義

export type ChoiceRouteType = 'aggressive' | 'balanced' | 'conservative';
export type ChoiceContext = 'daily_practice' | 'event_response' | 'match_preparation' | 'crisis_management';
export type OutcomeType = 'great_success' | 'success' | 'normal' | 'failure' | 'disaster';

// 戦略的選択肢
export interface StrategicChoice {
  id: string;
  title: string;
  description: string;
  context: ChoiceContext;
  
  // 3つのルート選択肢
  routes: {
    aggressive: ChoiceRoute;
    balanced: ChoiceRoute;
    conservative: ChoiceRoute;
  };
  
  // 選択の背景情報
  situationDescription: string;
  
  // 発生条件
  triggerConditions?: {
    playerLevel?: number;
    schoolReputation?: number;
    squadSize?: number;
    seasonMonth?: number;
    weatherCondition?: string;
  };
}

// 個別ルート定義
export interface ChoiceRoute {
  routeType: ChoiceRouteType;
  name: string;
  description: string;
  flavorText: string;
  icon: string;
  color: string;
  
  // 成功確率分布
  successProbabilities: {
    great_success: number;
    success: number;
    normal: number;
    failure: number;
    disaster: number;
  };
  
  // 潜在的効果（成功時）
  potentialEffects: {
    playerGrowth?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
    
    teamEffects?: {
      morale?: number;
      cohesion?: number;
      reputation?: number;
    };
    
    schoolEffects?: {
      funds?: number;
      reputation?: number;
      facilities?: number;
    };
    
    specialRewards?: {
      cardBonus?: number; // 追加カード枚数
      experienceMultiplier?: number;
      specialAbilityChance?: number;
    };
  };
  
  // リスク要因（失敗時）
  riskFactors: {
    injuryRisk?: number;
    fatigueIncrease?: number;
    moraleDecrease?: number;
    fundsCost?: number;
    reputationLoss?: number;
  };
  
  // 必要条件
  requirements?: {
    minStamina?: number;
    minMorale?: number;
    minFunds?: number;
    specificSkillLevel?: {
      skill: string;
      level: number;
    };
  };
}

// 選択結果
export interface ChoiceOutcome {
  choiceId: string;
  selectedRoute: ChoiceRouteType;
  outcome: OutcomeType;
  
  // 実際に発生した効果
  actualEffects: {
    playerChanges?: Record<string, number>;
    teamChanges?: Record<string, number>;
    schoolChanges?: Record<string, number>;
    specialRewards?: {
      extraCards?: number;
      bonusExperience?: number;
      unlockedAbilities?: string[];
    };
  };
  
  // 結果詳細
  resultMessage: string;
  detailedDescription: string;
  consequenceText?: string; // 長期的影響の説明
  
  // 次への影響
  futureModifiers?: {
    nextChoiceBonus?: number; // 次回選択への影響
    relationshipChanges?: Record<string, number>; // NPCとの関係変化
    unlockConditions?: string[]; // 解放された条件
  };
}

// 分岐選択の履歴管理
export interface ChoiceHistory {
  playerId: string;
  choices: {
    choiceId: string;
    selectedRoute: ChoiceRouteType;
    outcome: OutcomeType;
    date: Date;
  }[];
  
  // 傾向分析
  routePreferences: {
    aggressive: number;
    balanced: number;
    conservative: number;
  };
  
  // 成功率統計
  successRates: Record<ChoiceRouteType, {
    total: number;
    successes: number;
    rate: number;
  }>;
}

// 動的確率調整要因
export interface ProbabilityModifiers {
  // プレイヤー特性による修正
  playerModifiers: {
    levelBonus: number;
    staminaModifier: number;
    mentalStrengthModifier: number;
    experienceBonus: number;
  };
  
  // 環境による修正
  environmentModifiers: {
    weatherModifier: number;
    courtConditionModifier: number;
    teamMoraleModifier: number;
    seasonModifier: number;
  };
  
  // 学校状況による修正
  schoolModifiers: {
    reputationBonus: number;
    facilitiesBonus: number;
    fundingLevelModifier: number;
  };
  
  // 履歴による修正
  historyModifiers: {
    recentSuccessBonus: number;
    routeExperienceBonus: number;
    adaptabilityModifier: number;
  };
}

// 選択肢生成設定
export interface ChoiceGenerationConfig {
  // 基本設定
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert';
  storyPhase: 'early' | 'middle' | 'late' | 'climax';
  
  // 確率調整
  baseSuccessRate: number;
  riskRewardBalance: number; // リスクとリターンのバランス
  
  // 特別な状況
  specialEvents?: {
    tournamentSeason?: boolean;
    rivalryMatch?: boolean;
    graduationApproaching?: boolean;
    crisisMode?: boolean;
  };
}