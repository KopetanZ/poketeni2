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
  MonthType
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
    eventType: 'graduation',
    effects: {
      schoolReputation: 3,
      playerMotivation: -5 // 寂しさ
    }
  }
];

export class CalendarSystem {
  private currentState: CalendarState;
  private eventListeners: Map<string, Function[]> = new Map();
  private isCalendarGenerated: boolean = false; // カレンダー生成済みフラグ

  constructor(
    initialDate: CalendarDay = {
      year: 2024,
      month: 4,
      day: 1,
      dayOfWeek: 1,
      square: 'blue'
    }
  ) {
    // 年が2024未満の場合は2024に修正
    if (initialDate.year < 2024) {
      console.log('calendar-system: 年を修正中:', initialDate.year, '→ 2024');
      initialDate.year = 2024;
    }
    
    this.currentState = {
      currentDate: initialDate,
      currentYear: initialDate.year,
      currentSemester: 1,
      daysUntilGraduation: 365 * 3, // 3年間
      yearCalendar: [],
      weeklyEffects: {
        totalPracticeBonus: 0,
        totalStaminaUsage: 0,
        eventsTriggered: []
      }
    };
    
    this.generateYearCalendar();
    console.log('calendar-system: カレンダーシステム初期化完了:', this.currentState.currentDate);
  }

  // 詳細な診断ログを生成するメソッド
  public generateDiagnosticLog(): string[] {
    const logs: string[] = [];
    const timestamp = new Date().toISOString();

    logs.push(`=== カレンダーシステム診断ログ (${timestamp}) ===`);
    logs.push('');

    // 現在の状態
    logs.push('【現在の状態】');
    logs.push(`現在の日付: ${this.currentState.currentDate.year}年${this.currentState.currentDate.month}月${this.currentState.currentDate.day}日`);
    logs.push(`カレンダー年: ${this.currentState.currentYear}`);
    logs.push(`カレンダー生成済み: ${this.isCalendarGenerated}`);
    logs.push(`年カレンダーサイズ: ${this.currentState.yearCalendar.length}`);
    logs.push('');

    // 年カレンダーの詳細
    logs.push('【年カレンダー詳細】');
    if (this.currentState.yearCalendar.length > 0) {
      const calendarEntries = Array.from(this.currentState.yearCalendar.entries());
      logs.push(`登録されている日付数: ${calendarEntries.length}`);
      
      // 最初と最後の日付を表示
      if (calendarEntries.length > 0) {
        const firstDate = calendarEntries[0][0];
        const lastDate = calendarEntries[calendarEntries.length - 1][0];
        logs.push(`最初の日付: ${firstDate}`);
        logs.push(`最後の日付: ${lastDate}`);
      }

      // 現在の日付が年カレンダーに存在するかチェック
      const currentDateKey = `${this.currentState.currentDate.year}-${this.currentState.currentDate.month}-${this.currentState.currentDate.day}`;
      const currentDateExists = this.currentState.yearCalendar.find(day => 
        day.year === this.currentState.currentDate.year &&
        day.month === this.currentState.currentDate.month &&
        day.day === this.currentState.currentDate.day
      );
      logs.push(`現在の日付が年カレンダーに存在: ${currentDateExists ? '✅' : '❌'}`);
      
      if (!currentDateExists) {
        logs.push(`❌ 問題: 現在の日付(${currentDateKey})が年カレンダーに見つかりません`);
      }
    } else {
      logs.push('❌ 年カレンダーが空です');
    }
    logs.push('');

    // 期待される日数との比較
    logs.push('【期待される日数との比較】');
    const expectedDayCount = this.calculateExpectedDayCount();
    const actualDayCount = this.calculateActualDayCount();
    logs.push(`期待される日数: ${expectedDayCount}日`);
    logs.push(`実際の日数: ${actualDayCount}日`);
    
    if (expectedDayCount !== actualDayCount) {
      logs.push(`⚠️ 不一致: ${Math.abs(expectedDayCount - actualDayCount)}日の差があります`);
    } else {
      logs.push('✅ 日数は一致しています');
    }
    logs.push('');

    // 状態の妥当性チェック
    logs.push('【状態妥当性チェック】');
    const validationResult = this.validateCalendarState();
    logs.push(`状態検証結果: ${validationResult ? '✅ 正常' : '❌ 異常'}`);
    
    if (!validationResult) {
      logs.push('❌ カレンダー状態に問題があります');
      logs.push('推奨アクション: recoverCalendarState()を実行してください');
    }
    logs.push('');

    // 推奨アクション
    logs.push('【推奨アクション】');
    if (!validationResult) {
      logs.push('1. recoverCalendarState()を実行');
      logs.push('2. 必要に応じてresetCalendar()を実行');
      logs.push('3. ゲーム状態の再初期化を検討');
    } else {
      logs.push('1. 現在の状態を維持');
      logs.push('2. 定期的な状態検証を実行');
    }
    logs.push('');

    logs.push('=== 診断完了 ===');
    return logs;
  }

  // 期待される日数を計算
  private calculateExpectedDayCount(): number {
    const startDate = new Date(2024, 3, 1); // 4月1日から開始
    const currentDateObj = new Date(
      this.currentState.currentDate.year,
      this.currentState.currentDate.month - 1,
      this.currentState.currentDate.day
    );
    
    const diffTime = currentDateObj.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // 実際の日数を計算
  private calculateActualDayCount(): number {
    return this.currentState.yearCalendar.length;
  }

  // 年間カレンダー生成
  private generateYearCalendar(): void {
    console.log('=== generateYearCalendar 開始 ===');
    const calendar: CalendarDay[] = [];
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= monthDays[month - 1]; day++) {
        const calendarDay = this.generateDay(
          this.currentState.currentYear,
          month as MonthType,
          day
        );
        calendar.push(calendarDay);
      }
    }

    this.currentState.yearCalendar = calendar;
    this.isCalendarGenerated = true; // 生成済みフラグを設定
    
    console.log('生成されたカレンダー長さ:', calendar.length);
    console.log('最初の日:', calendar[0]);
    console.log('最後の日:', calendar[calendar.length - 1]);
    console.log('=== generateYearCalendar 終了 ===');
  }

  // 年間カレンダー生成（年が変わった場合に呼び出す）
  private generateYearCalendarForYear(year: number): void {
    console.log(`📅 ${year}年のカレンダーを生成中...`);
    const startDate = new Date(year, 3, 1); // 4月1日から開始
    const endDate = new Date(year + 1, 2, 31); // 翌年3月31日まで
    
    let currentDate = new Date(startDate);
    let dayCount = 0;
    
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1 as MonthType;
      const day = currentDate.getDate();
      
      const calendarDay: CalendarDay = {
        year: year,
        month: month,
        day: day,
        dayOfWeek: (currentDate.getDay() + 6) % 7, // 0を月曜日に変換
        square: this.getRandomSquareType() // ランダムなマス目タイプを設定
      };
      
      const key = `${year}-${month}-${day}`;
      this.currentState.yearCalendar.push(calendarDay);
      dayCount++;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.currentState.currentYear = year;
    this.isCalendarGenerated = true; // 生成済みフラグを設定
    console.log(`📅 ${year}年のカレンダー生成完了: ${dayCount}日分`);
  }

  // 個別日付生成（マス色決定ロジック含む）
  private generateDay(year: number, month: MonthType, day: number): CalendarDay {
    // ハードコードされた年（2024）を修正し、正しい年を使用
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // マス色決定（戦略的確率分布）
    const square = this.determineSquareType(month, dayOfWeek);
    
    // 天候生成
    const weather = this.generateWeather(month);
    
    // コート状況
    const courtCondition = this.generateCourtCondition(month, day);
    
    // イベント判定
    const seasonalEvent = this.checkSeasonalEvent(month);
    const hiddenEvent = this.checkHiddenEvent(month);

    return {
      year,
      month,
      day,
      dayOfWeek,
      square,
      weather,
      courtCondition,
      seasonalEvent,
      hiddenEvent
    };
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

  // マス色決定ロジック（栄冠ナイン風確率分布）
  private determineSquareType(month: MonthType, dayOfWeek: number): SquareType {
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
    const seed = month * 1000 + dayOfWeek;
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
  private checkSeasonalEvent(month: MonthType): SeasonalEvent | undefined {
    return SEASONAL_EVENTS.find(event => 
      event.month === month
    );
  }

  // 隠しイベント判定（条件チェック）
  private checkHiddenEvent(month: MonthType): HiddenEvent | undefined {
    // 8月特訓イベント
    if (month === 8) {
      return {
        id: 'august_training',
        name: '夏季特訓',
        description: '猛暑の中での特別練習！大きく成長するチャンス',
        month: 8,
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
    if (month === 12) {
      return {
        id: 'christmas_party',
        name: 'クリスマス会',
        description: '部員との絆を深める特別な時間',
        month: 12,
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
    const currentDate = this.currentState.currentDate;
    console.log(`📅 日付を進める: ${currentDate.year}年${currentDate.month}月${currentDate.day}日 → `);
    
    let nextMonth = currentDate.month;
    let nextYear = currentDate.year;
    let nextDay = currentDate.day + 1;
    
    // 月の最終日をチェック
    const daysInMonth = this.getDaysInMonth(currentDate.month, currentDate.year);
    if (nextDay > daysInMonth) {
      nextDay = 1;
      nextMonth = (currentDate.month % 12) + 1;
      
      if (nextMonth === 1) {
        nextYear = currentDate.year + 1;
        console.log(`📅 年が変わりました: ${nextYear}年`);
      }
    }
    
    const nextDate: CalendarDay = {
      year: nextYear,
      month: nextMonth as MonthType,
      day: nextDay,
      dayOfWeek: (new Date(nextYear, nextMonth - 1, nextDay).getDay() + 6) % 7,
      square: this.getRandomSquareType()
    };
    
    // 新しい年の場合は年カレンダーを再生成
    if (nextYear !== this.currentState.currentYear) {
      console.log(`📅 新しい年(${nextYear})のカレンダーを生成します`);
      this.generateYearCalendarForYear(nextYear);
    }
    
    this.currentState.currentDate = nextDate;
    console.log(`📅 日付が進みました: ${nextDate.year}年${nextDate.month}月${nextDate.day}日`);
    
    // 状態の検証
    if (!this.validateCalendarState()) {
      console.warn('⚠️ 日付進行後の状態検証に失敗しました');
    }
    
    return nextDate;
  }

  // 現在の状態取得
  public getCurrentState(): CalendarState {
    return this.currentState;
  }

  // 現在の日付を設定（外部からの状態復元用）
  public setCurrentDate(year: number, month: MonthType, day: number): void {
    // 年が変わった場合、新しい年のカレンダーを生成
    if (year !== this.currentState.currentYear) {
      console.log('setCurrentDate: 年が変わりました。新しい年のカレンダーを生成します:', year);
      this.generateYearCalendarForYear(year);
    }
    
    // 既存のカレンダーから該当する日付を取得
    const existingDay = this.getExistingDay(year, month, day);
    
    if (existingDay) {
      // 既存のカレンダーから日付情報を取得
      this.currentState.currentDate = existingDay;
      this.currentState.currentYear = year;
      this.currentState.currentSemester = month <= 9 ? 1 : 2;
      
      console.log('CalendarSystem: 既存カレンダーから日付を設定しました:', existingDay);
    } else {
      // フォールバック: 新しい日付を生成
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      const newDate = this.generateDay(year, month, day);
      
      this.currentState.currentDate = newDate;
      this.currentState.currentYear = year;
      this.currentState.currentSemester = month <= 9 ? 1 : 2;
      
      console.log('CalendarSystem: 新規生成で日付を設定しました:', { year, month, day, dayOfWeek });
    }
  }

  // 既存のカレンダーから特定の日付を取得
  public getExistingDay(year: number, month: MonthType, day: number): CalendarDay | null {
    const key = `${year}-${month}-${day}`;
    const currentCalendarYear = this.currentState.currentYear;
    
    console.log(`🔍 日付を検索: ${key} (現在のカレンダー年: ${currentCalendarYear})`);
    
    // 年が一致しない場合は早期リターン
    if (currentCalendarYear !== year) {
      console.warn(`⚠️ 年が一致しません: 要求された年(${year}) vs 現在のカレンダー年(${currentCalendarYear})`);
      return null;
    }
    
    const existingDay = this.currentState.yearCalendar.find(
      calendarDay => calendarDay.year === year && 
                     calendarDay.month === month && 
                     calendarDay.day === day
    );
    
    if (!existingDay) {
      console.warn(`❌ 日付が見つかりません: ${key}`);
      console.warn(`現在の年カレンダーサイズ: ${this.currentState.yearCalendar.length}`);
      console.warn(`年カレンダーの年: ${this.currentState.currentYear}`);
    }
    
    return existingDay || null;
  }

  // カレンダーの状態をリセット（デバッグ用）
  public resetCalendar(): void {
    this.isCalendarGenerated = false;
    this.currentState.yearCalendar = [];
    console.log('CalendarSystem: カレンダー状態をリセットしました');
  }

  // カレンダーの生成状態を確認
  public isCalendarReady(): boolean {
    return this.isCalendarGenerated && this.currentState.yearCalendar.length > 0;
  }

  // カレンダー状態の検証
  public validateCalendarState(): boolean {
    console.log('🔍 カレンダー状態の検証を開始...');
    
    if (!this.isCalendarGenerated) {
      console.error('❌ カレンダーが生成されていません');
      return false;
    }
    
    const currentDate = this.currentState.currentDate;
    const key = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;
    const existingDay = this.currentState.yearCalendar.find(
      calendarDay => calendarDay.year === currentDate.year && 
                     calendarDay.month === currentDate.month && 
                     calendarDay.day === currentDate.day
    );
    
    if (!existingDay) {
      console.error('❌ 現在の日付が年カレンダーに見つかりません');
      console.error(`現在の日付: ${currentDate.year}年${currentDate.month}月${currentDate.day}日`);
      console.error(`期待されるキー: ${key}`);
      console.error(`年カレンダーサイズ: ${this.currentState.yearCalendar.length}`);
      console.error(`年カレンダーの年: ${this.currentState.currentYear}`);
      return false;
    }
    
    console.log('✅ カレンダー状態の検証に成功しました');
    return true;
  }

  // 状態復旧関数
  public recoverCalendarState(): boolean {
    console.log('🔄 カレンダー状態の復旧を開始...');
    
    const currentDate = this.currentState.currentDate;
    const currentCalendarYear = this.currentState.currentYear;
    
    console.log(`現在の日付: ${currentDate.year}年${currentDate.month}月${currentDate.day}日`);
    console.log(`現在のカレンダー年: ${currentCalendarYear}`);
    
    // 年が一致しない場合は年カレンダーを再生成
    if (currentDate.year !== currentCalendarYear) {
      console.log(`年が一致しないため、${currentDate.year}年のカレンダーを再生成します`);
      this.generateYearCalendarForYear(currentDate.year);
    }
    
    // 復旧後の検証
    const isValid = this.validateCalendarState();
    if (isValid) {
      console.log('✅ カレンダー状態の復旧に成功しました');
    } else {
      console.error('❌ カレンダー状態の復旧に失敗しました');
    }
    
    return isValid;
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

  // 月の日数を取得
  private getDaysInMonth(month: MonthType, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  // 曜日を取得
  private getDayOfWeek(date: Date): number {
    const dayOfWeek = date.getDay();
    return (dayOfWeek + 6) % 7 + 1; // 0を月曜日に変換
  }

  // ランダムなマス目タイプを取得
  private getRandomSquareType(): SquareType {
    const squareTypes: SquareType[] = ['blue', 'red', 'white', 'green', 'yellow'];
    const randomIndex = Math.floor(Math.random() * squareTypes.length);
    return squareTypes[randomIndex];
  }
 }