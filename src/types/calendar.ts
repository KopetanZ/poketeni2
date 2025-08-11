// 栄冠ナイン風カレンダー・マス目システムの型定義

export type SquareType = 'blue' | 'red' | 'white' | 'green' | 'yellow';
export type MonthType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type WeekType = 1 | 2 | 3 | 4;

// マス目効果の定義
export interface SquareEffect {
  type: SquareType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  effects: {
    // 基本効果
    practiceEfficiency?: number; // 練習効率 (%)
    staminaChange?: number; // 体力増減
    motivationChange?: number; // やる気増減
    
    // 学校ステータス効果
    fundsChange?: number; // 資金増減
    reputationChange?: number; // 評判増減
    
    // 特殊効果
    injuryRisk?: number; // 怪我リスク (%)
    eventTriggerChance?: number; // イベント発生率 (%)
    specialEventOnly?: boolean; // 特殊イベント専用フラグ
    
    // スキル成長ボーナス
    skillBonus?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
  };
}

// カレンダー上の日付情報
export interface CalendarDay {
  year: number;
  month: MonthType;
  week: WeekType;
  day: number;
  dayOfWeek: number; // 0: 日曜 〜 6: 土曜
  
  // マス目情報
  square: SquareType;
  
  // イベント情報
  seasonalEvent?: SeasonalEvent;
  hiddenEvent?: HiddenEvent;
  specialEvent?: SpecialEvent;
  
  // 状況修正
  weather?: WeatherType;
  courtCondition?: CourtCondition;
}

// 季節イベント
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  month: MonthType;
  requiredWeek?: WeekType;
  eventType: 'entrance_ceremony' | 'summer_festival' | 'cultural_festival' | 'graduation';
  effects: {
    schoolReputation?: number;
    funds?: number;
    playerMotivation?: number;
    specialRecruits?: boolean;
  };
}

// 隠しイベント（条件付き）
export interface HiddenEvent {
  id: string;
  name: string;
  description: string;
  month: MonthType;
  week?: WeekType;
  
  // 発生条件
  conditions: {
    schoolReputation?: number;
    playerCount?: number;
    captainLevel?: number;
    seasonWins?: number;
    randomChance?: number;
  };
  
  // 効果
  effects: {
    intensiveTraining?: boolean; // 特訓フラグ
    specialSkillGain?: string; // 特殊スキル
    playerGrowth?: number; // 成長倍率
    fundsCost?: number;
  };
}

// 特殊イベント（ランダム）
export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  
  effects: {
    playerSelection?: boolean; // プレイヤー選択が必要
    multipleChoices?: EventChoice[];
    immediateEffect?: EventEffect;
  };
}

// イベント選択肢
export interface EventChoice {
  id: string;
  text: string;
  description: string;
  
  effects: EventEffect;
  
  // 選択条件
  requirements?: {
    captainPersonality?: string;
    schoolReputation?: number;
    funds?: number;
  };
}

// イベント効果
export interface EventEffect {
  // プレイヤー効果
  playerEffects?: {
    targetType: 'selected' | 'captain' | 'all' | 'random';
    statChanges?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
    conditionChange?: number; // 調子変動
    injuryChance?: number;
    personalityChange?: string; // 性格変化
  };
  
  // 学校効果
  schoolEffects?: {
    reputation?: number;
    funds?: number;
  };
  
  // システム効果
  systemEffects?: {
    nextSquareType?: SquareType; // 次のマス指定
    skipTurns?: number; // ターンスキップ
    extraPractice?: boolean; // 追加練習
  };
}

// 天候システム
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'hot' | 'cold';

export interface WeatherEffect {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
  
  effects: {
    practiceEfficiency: number;
    staminaConsumption: number;
    outdoorPracticeAvailable: boolean;
    injuryRisk: number;
  };
}

// コート状況
export type CourtCondition = 'excellent' | 'good' | 'normal' | 'poor' | 'damaged';

export interface CourtEffect {
  condition: CourtCondition;
  name: string;
  description: string;
  
  effects: {
    practiceEfficiency: number;
    skillFocus: string[]; // 重点的に伸ばせるスキル
    injuryRisk: number;
  };
}

// カレンダー進行の選択肢
export interface CalendarChoice {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // 選択による効果
  effects: {
    targetSquare?: SquareType; // 狙うマス色
    practiceType?: 'individual' | 'team' | 'match';
    restDay?: boolean; // 休息選択
  };
  
  // 必要条件
  requirements?: {
    staminaMin?: number;
    motivationMin?: number;
    funds?: number;
  };
}

// ゲーム進行状態
export interface CalendarState {
  currentDate: CalendarDay;
  
  // 進行情報
  currentYear: number;
  currentSemester: 1 | 2; // 前期・後期
  daysUntilGraduation: number;
  
  // 生成されたカレンダー
  yearCalendar: CalendarDay[];
  
  // 選択中の戦略
  currentStrategy?: CalendarChoice;
  
  // 累積効果
  weeklyEffects: {
    totalPracticeBonus: number;
    totalStaminaUsage: number;
    eventsTriggered: string[];
  };
}