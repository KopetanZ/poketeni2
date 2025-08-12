// 栄冠ナイン風カレンダー・マス目システムの実装

import { 
  CalendarDay, 
  CalendarState, 
  SquareType, 
  SquareEffect, 
  WeatherType, 
  WeatherEffect,
  CourtCondition,
  CourtEffect,
  SeasonalEvent,
  HiddenEvent,
  SpecialEvent,
  CalendarChoice,
  MonthType,
  WeekType
} from '../types/calendar';

// 5色マス基本効果定義
export const SQUARE_EFFECTS: Record<SquareType, SquareEffect> = {
  blue: {
    type: 'blue',
    name: '良練習',
    description: '練習効率が大幅アップ！成長率150%',
    icon: '💙',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    effects: {
      practiceEfficiency: 150,
      motivationChange: 5,
      fundsChange: 1000, // 資金獲得
      reputationChange: 1, // 評判向上
      skillBonus: {
        serve_skill: 1.5,
        return_skill: 1.5,
        volley_skill: 1.5,
        stroke_skill: 1.5,
        mental: 1.5,
        stamina: 1.2
      }
    }
  },
  red: {
    type: 'red',
    name: '悪練習',
    description: '練習効率ダウン...怪我のリスクも',
    icon: '❤️',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    effects: {
      practiceEfficiency: 70,
      staminaChange: -10,
      motivationChange: -3,
      injuryRisk: 15,
      fundsChange: -500, // 資金減少
      reputationChange: -1, // 評判低下
      skillBonus: {
        serve_skill: 0.7,
        return_skill: 0.7,
        volley_skill: 0.7,
        stroke_skill: 0.7,
        mental: 0.8,
        stamina: 0.6
      }
    }
  },
  white: {
    type: 'white',
    name: 'ランダム',
    description: '何が起こるかわからない...運次第',
    icon: '🤍',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    effects: {
      practiceEfficiency: 100,
      eventTriggerChance: 30,
      specialEventOnly: true,
      // ランダム効果（50%の確率で青または赤マス効果）
      fundsChange: Math.random() > 0.5 ? 500 : -300,
      reputationChange: Math.random() > 0.5 ? 1 : -1
    }
  },
  green: {
    type: 'green',
    name: '回復',
    description: '体力回復＆やる気アップ',
    icon: '💚',
    color: '#10B981',
    bgColor: '#ECFDF5',
    effects: {
      practiceEfficiency: 90,
      staminaChange: 20,
      motivationChange: 8,
      injuryRisk: -5,
      skillBonus: {
        mental: 1.3,
        stamina: 1.4
      }
    }
  },
  yellow: {
    type: 'yellow',
    name: '効率',
    description: '練習効率120%！バランス良い成長',
    icon: '💛',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    effects: {
      practiceEfficiency: 120,
      motivationChange: 3,
      // 特殊能力習得確率+20%（実装予定）
      skillBonus: {
        serve_skill: 1.2,
        return_skill: 1.2,
        volley_skill: 1.2,
        stroke_skill: 1.2,
        mental: 1.2,
        stamina: 1.1
      }
    }
  }
};

// 天候効果定義
export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect> = {
  sunny: {
    type: 'sunny',
    name: '晴れ',
    icon: '☀️',
    description: '絶好の練習日和',
    effects: {
      practiceEfficiency: 110,
      staminaConsumption: 100,
      outdoorPracticeAvailable: true,
      injuryRisk: 90
    }
  },
  cloudy: {
    type: 'cloudy',
    name: '曇り',
    icon: '☁️',
    description: '普通の天気',
    effects: {
      practiceEfficiency: 100,
      staminaConsumption: 100,
      outdoorPracticeAvailable: true,
      injuryRisk: 100
    }
  },
  rainy: {
    type: 'rainy',
    name: '雨',
    icon: '🌧️',
    description: '屋外練習不可',
    effects: {
      practiceEfficiency: 80,
      staminaConsumption: 90,
      outdoorPracticeAvailable: false,
      injuryRisk: 110
    }
  },
  stormy: {
    type: 'stormy',
    name: '嵐',
    icon: '⛈️',
    description: '練習中止も考慮',
    effects: {
      practiceEfficiency: 60,
      staminaConsumption: 120,
      outdoorPracticeAvailable: false,
      injuryRisk: 150
    }
  },
  hot: {
    type: 'hot',
    name: '猛暑',
    icon: '🔥',
    description: '熱中症注意',
    effects: {
      practiceEfficiency: 85,
      staminaConsumption: 130,
      outdoorPracticeAvailable: true,
      injuryRisk: 120
    }
  },
  cold: {
    type: 'cold',
    name: '寒波',
    icon: '❄️',
    description: 'ウォーミングアップ重要',
    effects: {
      practiceEfficiency: 95,
      staminaConsumption: 110,
      outdoorPracticeAvailable: true,
      injuryRisk: 115
    }
  }
};

// コート状況効果
export const COURT_EFFECTS: Record<CourtCondition, CourtEffect> = {
  excellent: {
    condition: 'excellent',
    name: '最高',
    description: 'プロレベルのコート状況',
    effects: {
      practiceEfficiency: 120,
      skillFocus: ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill'],
      injuryRisk: 80
    }
  },
  good: {
    condition: 'good',
    name: '良好',
    description: '良いコンディション',
    effects: {
      practiceEfficiency: 110,
      skillFocus: ['serve_skill', 'stroke_skill'],
      injuryRisk: 90
    }
  },
  normal: {
    condition: 'normal',
    name: '普通',
    description: '標準的なコート',
    effects: {
      practiceEfficiency: 100,
      skillFocus: [],
      injuryRisk: 100
    }
  },
  poor: {
    condition: 'poor',
    name: '悪い',
    description: 'メンテナンスが必要',
    effects: {
      practiceEfficiency: 85,
      skillFocus: [],
      injuryRisk: 120
    }
  },
  damaged: {
    condition: 'damaged',
    name: '損傷',
    description: '危険な状態',
    effects: {
      practiceEfficiency: 70,
      skillFocus: [],
      injuryRisk: 150
    }
  }
};

// 季節イベント定義
export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'entrance_ceremony',
    name: '入学式',
    description: '新入生が入部！期待の新戦力',
    month: 4,
    requiredWeek: 1,
    eventType: 'entrance_ceremony',
    effects: {
      schoolReputation: 5,
      playerMotivation: 10,
      specialRecruits: true
    }
  },
  {
    id: 'summer_festival',
    name: '夏祭り',
    description: '地域との交流で部の知名度アップ',
    month: 7,
    requiredWeek: 3,
    eventType: 'summer_festival',
    effects: {
      schoolReputation: 8,
      funds: 5000,
      playerMotivation: 8
    }
  },
  {
    id: 'cultural_festival',
    name: '文化祭',
    description: '部活紹介で新入部員獲得チャンス',
    month: 10,
    requiredWeek: 2,
    eventType: 'cultural_festival',
    effects: {
      schoolReputation: 10,
      funds: 8000,
      specialRecruits: true
    }
  },
  {
    id: 'graduation',
    name: '卒業式',
    description: '3年生の旅立ち...感動の瞬間',
    month: 3,
    requiredWeek: 2,
    eventType: 'graduation',
    effects: {
      schoolReputation: 3,
      playerMotivation: -5 // 寂しさ
    }
  }
];

export class CalendarSystem {
  private currentState: CalendarState;
  private isInitialized: boolean = false;

  constructor(startYear: number = 1) {
    // まず基本的な状態を作成
    const initialDate = {
      year: startYear,
      month: 4 as MonthType,
      week: 1 as WeekType,
      day: 1,
      dayOfWeek: 1,
      square: 'white' as SquareType,
      weather: 'sunny' as WeatherType,
      courtCondition: 'normal' as CourtCondition,
      seasonalEvent: undefined,
      hiddenEvent: undefined
    };

    this.currentState = {
      currentDate: initialDate,
      currentYear: startYear,
      currentSemester: 1,
      daysUntilGraduation: 365 * 3, // 3年間
      yearCalendar: [],
      weeklyEffects: {
        totalPracticeBonus: 0,
        totalStaminaUsage: 0,
        eventsTriggered: []
      }
    };

    // 状態が初期化された後で、完全な日付情報を生成
    this.currentState.currentDate = this.generateDay(startYear, 4, 1, 1);
    this.generateYearCalendar();
    this.isInitialized = true;
  }

  // 既存の状態から復元するためのメソッド
  public restoreFromState(state: CalendarState): void {
    this.currentState = { ...state };
    this.isInitialized = true;
  }

  // 初期化状態の確認
  public get isReady(): boolean {
    return this.isInitialized;
  }

  // 年間カレンダー生成
  private generateYearCalendar(): void {
    const calendar: CalendarDay[] = [];
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= monthDays[month - 1]; day++) {
        const calendarDay = this.generateDay(
          this.currentState.currentYear,
          month as MonthType,
          Math.ceil(day / 7) as WeekType,
          day
        );
        calendar.push(calendarDay);
      }
    }

    this.currentState.yearCalendar = calendar;
  }

  // 個別日付生成（マス色決定ロジック含む）
  private generateDay(year: number, month: MonthType, week: WeekType, day: number): CalendarDay {
    const date = new Date(2024, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // マス色決定（戦略的確率分布）
    const square = this.determineSquareType(month, week, dayOfWeek);
    
    // 天候生成
    const weather = this.generateWeather(month);
    
    // コート状況
    const courtCondition = this.generateCourtCondition(month, day);
    
    // イベント判定
    const seasonalEvent = this.checkSeasonalEvent(month, week);
    const hiddenEvent = this.checkHiddenEvent(month, week);

    return {
      year,
      month,
      week,
      day,
      dayOfWeek,
      square,
      weather,
      courtCondition,
      seasonalEvent,
      hiddenEvent
    };
  }

  // マス色決定ロジック（栄冠ナイン風確率分布）
  private determineSquareType(month: MonthType, week: WeekType, dayOfWeek: number): SquareType {
    // 基本確率（バランス調整済み）
    let probabilities = {
      blue: 20,   // 良練習（20%）
      yellow: 25, // 効率（25%）
      white: 15,  // ランダム（15%）
      green: 15,  // 回復（15%）
      red: 25     // 悪練習（25%）
    };

    // 月別補正（季節効果）
    if ([6, 7, 8].includes(month)) { // 夏季
      probabilities.red += 10; // 暑さで悪練習増加
      probabilities.blue -= 5;
    } else if ([12, 1, 2].includes(month)) { // 冬季
      probabilities.green += 5; // 体調管理重要
      probabilities.yellow += 5;
    }

    // 曜日補正
    if (dayOfWeek === 1) { // 月曜日
      probabilities.red += 5; // 月曜病
    } else if (dayOfWeek === 5) { // 金曜日
      probabilities.blue += 5; // 週末前の頑張り
    }

    // 確率に基づく選択（確定的な疑似乱数を使用）
    const seed = month * 1000 + week * 100 + dayOfWeek;
    const random = this.deterministicRandom(seed);
    const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
    const randomValue = random * total;
    let current = 0;

    for (const [square, prob] of Object.entries(probabilities)) {
      current += prob;
      if (randomValue <= current) {
        return square as SquareType;
      }
    }

    return 'white'; // フォールバック
  }

  // 確定的な疑似乱数生成（同じ入力に対して同じ結果を返す）
  private deterministicRandom(seed: number): number {
    // シンプルな線形合同法
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // シードを32ビット整数に変換
    let x = (seed * a + c) % m;
    x = (x * a + c) % m; // もう一度適用してより良い分布に
    
    return x / m; // 0-1の範囲に正規化
  }

  // 天候生成
  private generateWeather(month: MonthType): WeatherType {
    const seasonalWeather: Record<number, WeatherType[]> = {
      1: ['cold', 'cloudy', 'sunny'],
      2: ['cold', 'cloudy', 'sunny'],
      3: ['cloudy', 'sunny', 'rainy'],
      4: ['sunny', 'cloudy', 'rainy'],
      5: ['sunny', 'cloudy'],
      6: ['rainy', 'cloudy', 'hot'],
      7: ['hot', 'sunny', 'stormy'],
      8: ['hot', 'sunny', 'stormy'],
      9: ['cloudy', 'sunny', 'rainy'],
      10: ['sunny', 'cloudy'],
      11: ['cloudy', 'cold'],
      12: ['cold', 'cloudy', 'sunny']
    };

    const options = seasonalWeather[month] || ['sunny', 'cloudy'];
    // 確定的な選択（月と週に基づく）
    const seed = month * 100 + Math.ceil(month / 2);
    const random = this.deterministicRandom(seed);
    const index = Math.floor(random * options.length);
    return options[index];
  }

  // コート状況生成
  private generateCourtCondition(month?: number, day?: number): CourtCondition {
    // 確定的な疑似乱数を使用（日付に基づく）
    let seed: number;
    
    if (month !== undefined && day !== undefined) {
      // 引数から日付情報を取得
      seed = month * 100 + day;
    } else if (this.currentState?.currentDate) {
      // 既存の状態から日付情報を取得
      seed = this.currentState.currentDate.month * 100 + this.currentState.currentDate.day;
    } else {
      // フォールバック: 現在の日時を使用
      const now = new Date();
      seed = (now.getMonth() + 1) * 100 + now.getDate();
    }
    
    const random = this.deterministicRandom(seed);
    
    if (random < 0.1) return 'excellent';
    if (random < 0.3) return 'good';
    if (random < 0.7) return 'normal';
    if (random < 0.9) return 'poor';
    return 'damaged';
  }

  // 季節イベント判定
  private checkSeasonalEvent(month: MonthType, week: WeekType): SeasonalEvent | undefined {
    return SEASONAL_EVENTS.find(event => 
      event.month === month && 
      (!event.requiredWeek || event.requiredWeek === week)
    );
  }

  // 隠しイベント判定（条件チェック）
  private checkHiddenEvent(month: MonthType, week: WeekType): HiddenEvent | undefined {
    // 8月特訓イベント
    if (month === 8 && week === 2) {
      return {
        id: 'august_training',
        name: '夏季特訓',
        description: '猛暑の中での特別練習！大きく成長するチャンス',
        month: 8,
        week: 2,
        conditions: {
          randomChance: 70
        },
        effects: {
          intensiveTraining: true,
          playerGrowth: 150,
          fundsCost: 10000
        }
      };
    }

    // 12月クリスマスイベント
    if (month === 12 && week === 3) {
      return {
        id: 'christmas_party',
        name: 'クリスマス会',
        description: '部員との絆を深める特別な時間',
        month: 12,
        week: 3,
        conditions: {
          randomChance: 50
        },
        effects: {
          specialSkillGain: 'team_spirit',
          fundsCost: 5000
        }
      };
    }

    return undefined;
  }

  // カレンダー進行
  public advanceDay(): CalendarDay {
    const nextDayIndex = this.currentState.yearCalendar.findIndex(
      day => day.month === this.currentState.currentDate.month && 
             day.day === this.currentState.currentDate.day
    ) + 1;

    if (nextDayIndex >= this.currentState.yearCalendar.length) {
      // 年末 -> 次の年へ
      this.currentState.currentYear++;
      this.currentState.daysUntilGraduation -= 365;
      this.generateYearCalendar();
      this.currentState.currentDate = this.currentState.yearCalendar[0];
    } else {
      this.currentState.currentDate = this.currentState.yearCalendar[nextDayIndex];
    }

    // 学期判定更新
    this.currentState.currentSemester = this.currentState.currentDate.month <= 9 ? 1 : 2;

    return this.currentState.currentDate;
  }

  // 現在の状態取得
  public getCurrentState(): CalendarState {
    return this.currentState;
  }

  // 先読み: 現在日付から count 日分の CalendarDay を返す（状態は進めない）
  public peekDays(count: number): CalendarDay[] {
    const days: CalendarDay[] = [];
    const currentIndex = this.currentState.yearCalendar.findIndex(
      day => day.month === this.currentState.currentDate.month &&
             day.day === this.currentState.currentDate.day
    );

    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % this.currentState.yearCalendar.length;
      days.push(this.currentState.yearCalendar[idx]);
    }
    return days;
  }

  // 特定日付のマス効果取得
  public getSquareEffect(squareType: SquareType): SquareEffect {
    return SQUARE_EFFECTS[squareType];
  }

  // 天候効果取得
  public getWeatherEffect(weather: WeatherType): WeatherEffect {
    return WEATHER_EFFECTS[weather];
  }

  // コート効果取得
  public getCourtEffect(condition: CourtCondition): CourtEffect {
    return COURT_EFFECTS[condition];
  }

  // 週間効果リセット
  public resetWeeklyEffects(): void {
    this.currentState.weeklyEffects = {
      totalPracticeBonus: 0,
      totalStaminaUsage: 0,
      eventsTriggered: []
    };
  }

  // 効果累積追加
  public addWeeklyEffect(practiceBonus: number, staminaUsage: number, eventId?: string): void {
    this.currentState.weeklyEffects.totalPracticeBonus += practiceBonus;
    this.currentState.weeklyEffects.totalStaminaUsage += staminaUsage;
    
    if (eventId) {
      this.currentState.weeklyEffects.eventsTriggered.push(eventId);
    }
  }
}