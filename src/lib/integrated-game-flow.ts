// 統合ゲームフローマネージャー
// カレンダー・カード・分岐選択システムの統合管理

import { CalendarSystem } from './calendar-system';
import { TrainingCardSystem } from './training-card-system';
import { StrategicChoiceSystem, STRATEGIC_CHOICES } from './strategic-choice-system';
import { StrategicChoice, ChoiceOutcome, ChoiceRouteType } from '../types/strategic-choice';
import { Player } from '../types/game';
import { SquareEffect, SeasonalEvent, HiddenEvent, CalendarDay, MonthType } from '../types/calendar';
import { TrainingCard, CardUsageResult } from '../types/training-cards';

export interface GameState {
  // カレンダー状態
  calendarSystem: CalendarSystem;
  // currentDayを削除（CalendarSystemから直接取得）
  
  // プレイヤー・学校情報
  player: Player; // メインプレイヤー（キャプテン）
  allPlayers?: Player[]; // 全部員（オプション）
  schoolStats: {
    name: string;
    funds: number;
    reputation: number;
    facilities: number;
    totalMatches: number;
    totalWins: number;
    totalTournaments: number;
    founded: string;
  };
  
  // カードシステム状態
  availableCards: TrainingCard[];
  dailyCardGenerated: boolean;
  cardUsageHistory: CardUsageResult[];
  
  // 分岐選択状態
  activeChoice: StrategicChoice | null;
  choiceHistory: ChoiceOutcome[];
  
  // ゲーム進行状態
  gamePhase: 'early' | 'middle' | 'late' | 'climax';
  dayCount: number;
  weekCount: number;
  
  // 統計情報
  stats: {
    totalChoicesMade: number;
    totalCardsUsed: number;
    successfulChoices: number;
    legendaryCardsObtained: number;
  };

  // イベント履歴
  eventHistory?: {
    id: string;
    eventType: 'seasonal' | 'hidden' | 'square_effect' | 'card_effect';
    eventId: string;
    eventName: string;
    description: string;
    eventDate: {
      year: number;
      month: number;
      day: number;
    };
    source: string;
    createdAt: Date;
  }[];
}

export class IntegratedGameFlow {
  private gameState: GameState;
  private schoolId: string;
  
  constructor(
    initialPlayer: Player,
    initialSchoolStats: {
      name: string;
      funds: number;
      reputation: number;
      facilities: number;
      current_year: number;
      current_month: number;
      current_day: number;
      totalMatches: number;
      totalWins: number;
      totalTournaments: number;
      founded: string;
    },
    schoolId: string,
    allPlayers: Player[]
  ) {
    // 年が2024未満の場合は2024に修正
    if (initialSchoolStats.current_year < 2024) {
      console.log('integrated-game-flow: 年を修正中:', initialSchoolStats.current_year, '→ 2024');
      initialSchoolStats.current_year = 2024;
    }

    this.schoolId = schoolId; // schoolIdを初期化
    
    this.gameState = {
      calendarSystem: new CalendarSystem({
        year: initialSchoolStats.current_year,
        month: initialSchoolStats.current_month as MonthType,
        day: initialSchoolStats.current_day,
        week: 1,
        dayOfWeek: 1,
        square: 'blue'
      }),
      // currentDayを削除
      player: initialPlayer,
      allPlayers: allPlayers,
      schoolStats: {
        name: initialSchoolStats.name,
        funds: initialSchoolStats.funds || 50000,
        reputation: initialSchoolStats.reputation || 50,
        facilities: initialSchoolStats.facilities || 50,
        totalMatches: initialSchoolStats.totalMatches,
        totalWins: initialSchoolStats.totalWins,
        totalTournaments: initialSchoolStats.totalTournaments,
        founded: initialSchoolStats.founded
      },
      availableCards: [],
      dailyCardGenerated: false,
      cardUsageHistory: [],
      activeChoice: null,
      choiceHistory: [],
      gamePhase: 'early',
      dayCount: 0,
      weekCount: 0,
      stats: {
        totalChoicesMade: 0,
        totalCardsUsed: 0,
        successfulChoices: 0,
        legendaryCardsObtained: 0
      },
      eventHistory: []
    };

    console.log(`IntegratedGameFlow: 初期化完了 - 学校: ${initialSchoolStats.name}, 日付: ${initialSchoolStats.current_year}年${initialSchoolStats.current_month}月${initialSchoolStats.current_day}日`);

    this.initializeDailyFlow();
  }

  // データベースから読み取った日付でカレンダーシステムを初期化
  public initializeCalendarWithDate(year: number, month: number, day: number): void {
    if (this.gameState.calendarSystem) {
      // MonthTypeの型制約に合わせて型キャスト
      const monthType = month as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
      
      // カレンダーの準備状態を確認
      const isReady = this.gameState.calendarSystem.isCalendarReady();
      console.log('IntegratedGameFlow: カレンダー準備状態:', isReady);
      
      this.gameState.calendarSystem.setCurrentDate(year, monthType, day);
      
      console.log('IntegratedGameFlow: カレンダーを日付で初期化しました:', { year, month, day });
      console.log('IntegratedGameFlow: 現在のカレンダー状態:', this.gameState.calendarSystem.getCurrentState().currentDate);
    }
  }

  // 初期化処理
  private initializeDailyFlow(): void {
    this.generateInitialCards();
    this.checkForStrategicChoices();
  }

  // 初回カード生成（手札として配る）
  private generateInitialCards(): void {
    const cardDrop = TrainingCardSystem.generateCardDrop(
      this.gameState.schoolStats.reputation,
      this.gameState.player.level || 1,
      5, // 初期手札は5枚
      'daily_practice'
    );

    this.gameState.availableCards = cardDrop.cards;
    this.gameState.dailyCardGenerated = true;

    // レジェンダリーカードの統計更新
    const legendaryCards = cardDrop.cards.filter(card => card.rarity === 'legendary');
    this.gameState.stats.legendaryCardsObtained += legendaryCards.length;
  }

  // 手札補充（カードが少なくなった時のみ）
  public replenishCards(): void {
    if (this.gameState.availableCards.length < 3) {
      const newCardsNeeded = 5 - this.gameState.availableCards.length;
      const cardDrop = TrainingCardSystem.generateCardDrop(
        this.gameState.schoolStats.reputation,
        this.gameState.player.level || 1,
        newCardsNeeded,
        'daily_practice'
      );

      this.gameState.availableCards.push(...cardDrop.cards);

      // レジェンダリーカードの統計更新
      const legendaryCards = cardDrop.cards.filter(card => card.rarity === 'legendary');
      this.gameState.stats.legendaryCardsObtained += legendaryCards.length;
    }
  }

  // 日付進行メインフロー
  public async advanceDay(): Promise<{
    newDay: CalendarDay;
    triggeredEvents: string[];
    availableChoices: StrategicChoice[];
    cardChanges: {
      newCards: TrainingCard[];
      expiredCards: TrainingCard[];
    };
  }> {
    // カレンダー進行
    const newDay = this.gameState.calendarSystem.advanceDay();
    this.gameState.dayCount++;
    
    if (this.gameState.dayCount % 7 === 0) {
      this.gameState.weekCount++;
    }

    const triggeredEvents: string[] = [];
    
    // 季節イベントの処理
    if (newDay.seasonalEvent) {
      triggeredEvents.push(`seasonal_event:${newDay.seasonalEvent.id}`);
    }
    
    // 隠しイベントの処理
    if (newDay.hiddenEvent) {
      triggeredEvents.push(`hidden_event:${newDay.hiddenEvent.id}`);
    }

    // 新しい日のカード生成
    const cardChanges = await this.updateDailyCards();
    
    // 手札が少い場合は補充
    if (this.gameState.availableCards.length < 3) {
      this.replenishCards();
    }
    
    // 戦略的選択肢の判定
    const availableChoices = this.checkForStrategicChoices();
    
    // ゲームフェーズの更新
    this.updateGamePhase();
    
    // 週末効果のリセット
    if (this.gameState.dayCount % 7 === 0) {
      this.gameState.calendarSystem.resetWeeklyEffects();
    }

    return {
      newDay,
      triggeredEvents,
      availableChoices,
      cardChanges
    };
  }

  // 日次カード更新
  private async updateDailyCards(): Promise<{
    newCards: TrainingCard[];
    expiredCards: TrainingCard[];
  }> {
    const expiredCards = [...this.gameState.availableCards];
    
    // 新しいカードを生成
    const cardDrop = TrainingCardSystem.generateCardDrop(
      this.gameState.schoolStats.reputation,
      this.gameState.player.level || 1,
      this.calculateDailyCardCount(),
      'daily_practice'
    );

    this.gameState.availableCards = cardDrop.cards;
    this.gameState.dailyCardGenerated = true;

    // レジェンダリーカードの統計更新
    const legendaryCards = cardDrop.cards.filter(card => card.rarity === 'legendary');
    this.gameState.stats.legendaryCardsObtained += legendaryCards.length;

    return {
      newCards: cardDrop.cards,
      expiredCards
    };
  }

  // 日次カード枚数計算
  private calculateDailyCardCount(): number {
    let baseCount = 5;
    
    // 学校評判による修正
    if (this.gameState.schoolStats.reputation > 80) baseCount += 2;
    else if (this.gameState.schoolStats.reputation > 60) baseCount += 1;
    
    // 施設レベルによる修正
    if (this.gameState.schoolStats.facilities > 70) baseCount += 1;
    
    // 特別な日による修正
    const currentDay = this.getCurrentDay();
    if (currentDay.seasonalEvent) baseCount += 1;
    if (currentDay.hiddenEvent) baseCount += 2;

    return Math.min(baseCount, 10); // 最大10枚
  }

  // カード使用処理（統合 + すごろく進行）
  public useTrainingCard(card: TrainingCard): CardUsageResult & { 
    daysProgressed: number;
    newDays: CalendarDay[];
    triggeredEvents: string[];
  } {
    // 環境修正要因の計算
    const currentDay = this.getCurrentDay();
    const environmentModifiers = {
      weather: currentDay.weather || 'sunny',
      courtCondition: currentDay.courtCondition || 'normal',
      teamMorale: this.calculateTeamMorale()
    };

    // カレンダーマス効果の適用
    const squareEffect = this.gameState.calendarSystem.getSquareEffect(
      currentDay.square
    );
    
    // カード使用実行
    const result = TrainingCardSystem.useCard(
      card,
      this.getPlayerStats(),
      environmentModifiers
    );

    // マス効果をカード効果に統合
    if (result.success && squareEffect.effects.practiceEfficiency) {
      const multiplier = squareEffect.effects.practiceEfficiency / 100;
      
      if (result.actualEffects.skillGrowth) {
        const skillGrowth = result.actualEffects.skillGrowth;
        const keys = ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'] as const;
        keys.forEach(key => {
          const current = skillGrowth[key];
          if (typeof current === 'number') {
            skillGrowth[key] = Math.round(current * multiplier);
          }
        });
      }
    }

    // プレイヤーステータス更新
    this.applyCardEffects(result);
    
    // === すごろく進行処理 ===
    const daysToProgress = card.number; // カードの数字分だけ日数を進める
    const newDays: CalendarDay[] = [];
    const triggeredEvents: string[] = [];
    
    console.log('=== カード使用による日付進行開始 ===');
    console.log('進行前の日付:', currentDay);
    console.log('進行する日数:', daysToProgress);
    
    // カレンダー進行を完全に分離（状態変更のみ）
    for (let i = 0; i < daysToProgress; i++) {
      const dayResult = this.gameState.calendarSystem.advanceDay();
      newDays.push(dayResult);
      
      // 日付カウントの更新のみ（効果適用は後で）
      this.gameState.dayCount++;
      if (this.gameState.dayCount % 7 === 0) {
        this.gameState.weekCount++;
      }
    }
    
    // 進行完了後にまとめて効果を適用
    console.log('=== マス目効果・イベント効果の適用開始 ===');
    newDays.forEach((dayResult, index) => {
      console.log(`日${index + 1}の効果適用:`, dayResult.square);
      
      // マス目効果の適用
      const landedSquareEffect = this.gameState.calendarSystem.getSquareEffect(dayResult.square);
      this.applySquareEffects(landedSquareEffect, dayResult);
      
      // 各日でのイベント判定
      if (dayResult.seasonalEvent) {
        triggeredEvents.push(`seasonal_event:${dayResult.seasonalEvent.id}`);
        this.applySeasonalEvent(dayResult.seasonalEvent);
      }
      if (dayResult.hiddenEvent) {
        triggeredEvents.push(`hidden_event:${dayResult.hiddenEvent.id}`);
        this.applyHiddenEvent(dayResult.hiddenEvent);
      }
    });
    console.log('=== マス目効果・イベント効果の適用完了 ===');
    
    // 進行完了後の状態整合性チェック
    const finalDay = this.gameState.calendarSystem.getCurrentState().currentDate;
    console.log('進行完了後の最終日付:', finalDay);
    console.log('=== カード使用による日付進行終了 ===');
    
    // 統計更新
    this.gameState.stats.totalCardsUsed++;
    this.gameState.cardUsageHistory.push(result);
    
    // 使用したカードを除去
    this.gameState.availableCards = this.gameState.availableCards.filter(
      c => c.id !== card.id
    );

    // カード補充処理（毎回1枚補充）
    // 使用したカードを補充して手札数を維持
    this.replenishCardsAfterUsage();

    return {
      ...result,
      daysProgressed: daysToProgress,
      newDays,
      triggeredEvents
    };
  }

  // カード使用後の補充処理
  private replenishCardsAfterUsage(): void {
    console.log('=== 手札補充処理開始 ===');
    
    // 毎回1枚だけ補充（使用したカードの補充）
    const cardsNeeded = 1;
    console.log('補充するカード数:', cardsNeeded);
    
    // 使用したカードのみを補充（既存カードは保持）
    const newCards = TrainingCardSystem.generateCardDrop(
      this.gameState.schoolStats.reputation,
      this.gameState.player.level || 1,
      cardsNeeded,
      'daily_practice'
    );
    
    console.log('生成されたカード:', newCards.cards);
    
    // 新しいカードを既存のカードに追加（置き換えではない）
    this.gameState.availableCards.push(...newCards.cards);
    
    // レジェンドカードの統計更新
    const legendaryCards = newCards.cards.filter(card => card.rarity === 'legendary');
    this.gameState.stats.legendaryCardsObtained += legendaryCards.length;
    
    console.log('補充後のカード数:', this.gameState.availableCards.length);
    console.log('=== 手札補充処理終了 ===');
  }

  // マス目効果の適用（独立した処理）
  private applySquareEffects(squareEffect: SquareEffect, dayResult: CalendarDay): void {
    const effects = squareEffect.effects;
    
    // 練習効率によるスキル成長調整（既存の処理と重複しないよう注意）
    
    // スタミナ変化
    if (effects.staminaChange !== undefined && this.gameState.allPlayers) {
      this.gameState.allPlayers.forEach(player => {
        player.stamina = Math.max(0, Math.min(100, player.stamina + effects.staminaChange!));
      });
    }
    
    // やる気変化
    if (effects.motivationChange !== undefined && this.gameState.allPlayers) {
      this.gameState.allPlayers.forEach(player => {
        player.motivation = Math.max(0, Math.min(100, player.motivation + effects.motivationChange!));
      });
    }
    
    // 怪我リスク処理
    if (effects.injuryRisk !== undefined && this.gameState.allPlayers) {
      this.gameState.allPlayers.forEach(player => {
        if (Math.random() < effects.injuryRisk! / 100) {
          player.condition = 'poor';
          player.stamina = Math.max(0, player.stamina - 10);
        }
      });
    }
    
    // 学校ステータス変化
    if (effects.fundsChange !== undefined) {
      this.gameState.schoolStats.funds = Math.max(0, this.gameState.schoolStats.funds + effects.fundsChange);
    }
    
    if (effects.reputationChange !== undefined) {
      this.gameState.schoolStats.reputation = Math.max(0, Math.min(100, this.gameState.schoolStats.reputation + effects.reputationChange));
    }

    // イベント履歴に記録（マス目効果）
    this.recordEventHistory('square_effect', squareEffect.type, squareEffect.name, dayResult);
  }

  // 季節イベント効果の適用
  private applySeasonalEvent(event: SeasonalEvent): void {
    // 季節イベントの効果を実装
    // 資金、評判、プレイヤー状態等の変化
    if (event.effects.funds) {
      this.gameState.schoolStats.funds = Math.max(0, this.gameState.schoolStats.funds + event.effects.funds);
    }
    if (event.effects.schoolReputation) {
      this.gameState.schoolStats.reputation = Math.max(0, Math.min(100, this.gameState.schoolStats.reputation + event.effects.schoolReputation));
    }
    if (event.effects.playerMotivation && this.gameState.allPlayers) {
      this.gameState.allPlayers.forEach(player => {
        player.motivation = Math.max(0, Math.min(100, player.motivation + event.effects.playerMotivation!));
      });
    }
    
    console.log('Seasonal event applied:', event.name);
    
    // イベント履歴に記録
    this.recordEventHistory('seasonal', event.id, event.name, this.getCurrentDay());
  }

  // 隠しイベント効果の適用
  private applyHiddenEvent(event: HiddenEvent): void {
    // 隠しイベントの効果を実装
    // ランダムな効果や特別な報酬
    if (event.effects.intensiveTraining && this.gameState.allPlayers) {
      // 特訓効果の適用
      this.gameState.allPlayers.forEach(player => {
        if (Math.random() < 0.3) { // 30%の確率で特訓成功
          player.experience += 50;
          player.motivation += 10;
        }
      });
    }
    
    console.log('Hidden event applied:', event.name);
    
    // イベント履歴に記録
    this.recordEventHistory('hidden', event.id, event.name, this.getCurrentDay());
  }

  // イベント履歴の記録
  private recordEventHistory(
    eventType: 'seasonal' | 'hidden' | 'square_effect' | 'card_effect',
    eventId: string,
    eventName: string,
    eventDate: CalendarDay
  ): void {
    // イベント履歴をメモリに保存（後でデータベースに永続化）
    if (!this.gameState.eventHistory) {
      this.gameState.eventHistory = [];
    }
    
    this.gameState.eventHistory.push({
      id: crypto.randomUUID(),
      eventType,
      eventId,
      eventName,
      description: `${eventType === 'square_effect' ? 'マス目効果' : eventType === 'seasonal' ? '季節イベント' : '隠しイベント'}: ${eventName}`,
      eventDate: {
        year: eventDate.year,
        month: eventDate.month,
        day: eventDate.day
      },
      source: 'card_progress',
      createdAt: new Date()
    });

    // データベースへの永続化（非同期）
    this.persistEventHistoryToDatabase(
      eventType,
      eventId,
      eventName,
      eventDate
    );
  }

  // イベント履歴をデータベースに永続化
  private async persistEventHistoryToDatabase(
    eventType: 'seasonal' | 'hidden' | 'square_effect' | 'card_effect',
    eventId: string,
    eventName: string,
    eventDate: CalendarDay
  ): Promise<void> {
    try {
      // Supabaseクライアントのインポート（必要に応じて）
      const { supabase } = await import('./supabase');
      
      const { error } = await supabase
        .from('event_history')
        .insert({
          school_id: this.schoolId, // school_idを追加
          event_type: eventType,
          event_id: eventId,
          event_name: eventName,
          description: `${eventType === 'square_effect' ? 'マス目効果' : eventType === 'seasonal' ? '季節イベント' : '隠しイベント'}: ${eventName}`,
          event_date_year: eventDate.year,
          event_date_month: eventDate.month,
          event_date_day: eventDate.day,
          source: 'card_progress'
        });

      if (error) {
        console.error('Failed to persist event history:', error);
      }
    } catch (error) {
      console.error('Error persisting event history:', error);
    }
  }

  // 戦略的選択実行
  public executeStrategicChoice(
    choice: StrategicChoice,
    selectedRoute: ChoiceRouteType
  ): ChoiceOutcome {
    const currentDay = this.getCurrentDay();
    const modifiers = StrategicChoiceSystem.calculateProbabilityModifiers(
      this.getPlayerStats(),
      this.gameState.schoolStats,
      {
        weather: currentDay.weather,
        courtCondition: currentDay.courtCondition,
        teamMorale: this.calculateTeamMorale(),
        currentMonth: currentDay.month
      }
    );

    const outcome = StrategicChoiceSystem.executeChoice(
      choice,
      selectedRoute,
      modifiers
    );

    // 結果の適用
    this.applyChoiceOutcome(outcome);
    
    // 統計更新
    this.gameState.stats.totalChoicesMade++;
    if (outcome.outcome === 'great_success' || outcome.outcome === 'success') {
      this.gameState.stats.successfulChoices++;
    }
    
    this.gameState.choiceHistory.push(outcome);
    this.gameState.activeChoice = null;

    return outcome;
  }

  // 戦略的選択肢の判定
  private checkForStrategicChoices(): StrategicChoice[] {
    // コンテキスト判定
    let context: any = 'daily_practice';
    const currentDay = this.getCurrentDay();
    
    if (currentDay.seasonalEvent) {
      context = 'event_response';
    } else if (this.gameState.dayCount % 30 === 0) { // 月末は試合準備
      context = 'match_preparation';
    } else if (this.gameState.player.stamina < 30) { // 低体力時は危機管理
      context = 'crisis_management';
    }

    const availableChoices = StrategicChoiceSystem.getAvailableChoices(
      context,
      this.getPlayerStats(),
      this.gameState.schoolStats,
      {
        weather: currentDay.weather,
        courtCondition: currentDay.courtCondition,
        currentMonth: currentDay.month
      }
    );

    // 選択肢が複数ある場合、ランダムで1つを選択
    if (availableChoices.length > 0) {
      const selectedChoice = availableChoices[Math.floor(Math.random() * availableChoices.length)];
      this.gameState.activeChoice = selectedChoice;
      return [selectedChoice];
    }

    return [];
  }

  // カード効果適用（全部員対象）
  private applyCardEffects(result: CardUsageResult): void {
    const playersToUpdate = this.gameState.allPlayers || [this.gameState.player];

    playersToUpdate.forEach(player => {
      if (result.success && result.actualEffects.skillGrowth) {
        Object.entries(result.actualEffects.skillGrowth).forEach(([skill, growth]) => {
          (player as any)[skill] = ((player as any)[skill] || 0) + growth;
        });
      }

      // 体力・やる気の更新
      player.stamina = Math.max(0, 
        (player.stamina || 100) - Math.floor(result.card.costs.stamina / playersToUpdate.length)
      );

      if (result.actualEffects.statusChanges?.condition) {
        const currentScore = this.getConditionScore(player.condition);
        const newScore = currentScore + result.actualEffects.statusChanges.condition;
        player.condition = this.scoreToCondition(newScore);
      }

      // 経験値追加（全員に同じ量）
      player.experience = (player.experience || 0) + result.experienceGained;
    });
    
    // レベルアップ判定（全員）
    this.checkLevelUpForAllPlayers();
  }

  // 選択結果適用
  private applyChoiceOutcome(outcome: ChoiceOutcome): void {
    // プレイヤー効果
    if (outcome.actualEffects.playerChanges) {
      const numericPlayerKeys = [
        'serve_skill',
        'return_skill',
        'volley_skill',
        'stroke_skill',
        'mental',
        'stamina',
        'motivation',
        'experience',
        'level'
      ] as const;
      type NumericPlayerKey = typeof numericPlayerKeys[number];
      Object.entries(outcome.actualEffects.playerChanges).forEach(([stat, change]) => {
        if ((numericPlayerKeys as readonly string[]).includes(stat)) {
          const key = stat as NumericPlayerKey;
          const current = (this.gameState.player[key] ?? 0) as number;
          this.gameState.player[key] = current + change as any;
        }
      });
    }

    // 学校効果
    if (outcome.actualEffects.schoolChanges) {
      const schoolKeys = ['funds', 'reputation', 'facilities'] as const;
      type SchoolKey = typeof schoolKeys[number];
      Object.entries(outcome.actualEffects.schoolChanges).forEach(([stat, change]) => {
        if ((schoolKeys as readonly string[]).includes(stat)) {
          const key = stat as SchoolKey;
          const current = (this.gameState.schoolStats[key] ?? 0) as number;
          this.gameState.schoolStats[key] = current + change;
        }
      });
    }

    // 特別報酬
    if (outcome.actualEffects.specialRewards?.extraCards) {
      const bonusCards = TrainingCardSystem.generateCardDrop(
        this.gameState.schoolStats.reputation,
        this.gameState.player.level || 1,
        outcome.actualEffects.specialRewards.extraCards,
        'event_reward'
      );
      this.gameState.availableCards.push(...bonusCards.cards);
    }
  }

  // レベルアップチェック（全部員対象）
  private checkLevelUpForAllPlayers(): void {
    if (!this.gameState.allPlayers) return;
    
    this.gameState.allPlayers.forEach(player => {
      const currentLevel = player.level || 1;
      const requiredExp = currentLevel * 100; // レベルアップに必要な経験値
      
      if (player.experience >= requiredExp) {
        // レベルアップ処理
        player.level = currentLevel + 1;
        player.experience -= requiredExp;
        
        // スキル成長（レベルアップボーナス）
        const skillBonus = 5; // レベルアップ時のスキルボーナス
        player.serve_skill = Math.min(100, player.serve_skill + skillBonus);
        player.return_skill = Math.min(100, player.return_skill + skillBonus);
        player.volley_skill = Math.min(100, player.volley_skill + skillBonus);
        player.stroke_skill = Math.min(100, player.stroke_skill + skillBonus);
        player.mental = Math.min(100, player.mental + skillBonus);
        player.stamina = Math.min(100, player.stamina + skillBonus);
        
        // 進化チェック
        this.checkEvolutionPossibility(player);
      }
    });
  }

  // 進化可能性チェック
  private checkEvolutionPossibility(player: Player): void {
    // 進化条件のチェック
    const canEvolve = this.checkEvolutionConditions(player);
    
    if (canEvolve) {
      // 進化可能な状態を設定（awakeningシステムを使用）
      if (!player.awakening) {
        player.awakening = {
          isEligible: true,
          hasAwakened: false,
          awakeningChance: 1.0,
          matchesPlayed: 0
        };
      } else {
        player.awakening.isEligible = true;
        player.awakening.awakeningChance = 1.0;
      }
    }
  }

  // 進化条件チェック
  private checkEvolutionConditions(player: Player): boolean {
    // レベル条件
    const levelCondition = (player.level || 1) >= 20;
    
    // スキル条件（平均スキルが一定以上）
    const avgSkill = (
      (player.serve_skill + player.return_skill + player.volley_skill + 
       player.stroke_skill + player.mental + player.stamina) / 6
    );
    const skillCondition = avgSkill >= 60;
    
    // 経験値条件
    const expCondition = (player.experience || 0) >= 500;
    
    // やる気条件
    const motivationCondition = (player.motivation || 0) >= 70;
    
    return levelCondition && skillCondition && expCondition && motivationCondition;
  }

  // レベルアップ判定（単体プレイヤー用・後方互換）
  private checkLevelUp(): void {
    const experienceThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    const currentLevel = this.gameState.player.level || 1;
    
    if (currentLevel < experienceThresholds.length - 1) {
      const nextThreshold = experienceThresholds[currentLevel];
      if (this.gameState.player.experience >= nextThreshold) {
        this.gameState.player.level = currentLevel + 1;
        // レベルアップ時の基本能力向上
        ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'].forEach(skill => {
          (this.gameState.player as any)[skill] = ((this.gameState.player as any)[skill] || 0) + 2;
        });
      }
    }
  }

  // ゲームフェーズ更新
  private updateGamePhase(): void {
    if (this.gameState.weekCount < 10) {
      this.gameState.gamePhase = 'early';
    } else if (this.gameState.weekCount < 25) {
      this.gameState.gamePhase = 'middle';
    } else if (this.gameState.weekCount < 40) {
      this.gameState.gamePhase = 'late';
    } else {
      this.gameState.gamePhase = 'climax';
    }
  }

  // ヘルパーメソッド
  private getPlayerStats(): any {
    return {
      stamina: this.gameState.player.stamina || 100,
      motivation: this.gameState.player.motivation || 50,
      level: this.gameState.player.level || 1,
      experience: this.gameState.player.experience || 0,
      serve_skill: this.gameState.player.serve_skill || 0,
      return_skill: this.gameState.player.return_skill || 0,
      volley_skill: this.gameState.player.volley_skill || 0,
      stroke_skill: this.gameState.player.stroke_skill || 0,
      mental: this.gameState.player.mental || 0
    };
  }

  private getConditionScore(condition: Player['condition'] | undefined): number {
    switch (condition) {
      case 'excellent':
        return 100;
      case 'good':
        return 75;
      case 'normal':
        return 50;
      case 'poor':
        return 25;
      case 'terrible':
        return 10;
      default:
        return 50;
    }
  }

  private scoreToCondition(score: number): Player['condition'] {
    const clamped = Math.max(0, Math.min(100, score));
    if (clamped >= 85) return 'excellent';
    if (clamped >= 65) return 'good';
    if (clamped >= 45) return 'normal';
    if (clamped >= 25) return 'poor';
    return 'terrible';
  }

  private calculateTeamMorale(): number {
    // 学校評判、プレイヤーの調子、最近の成功などからチーム士気を計算
    let morale = 50;
    
    morale += Math.min(this.gameState.schoolStats.reputation / 2, 25);
    morale += Math.min(this.getConditionScore(this.gameState.player.condition) / 2, 25);
    
    // 最近の成功による修正
    const recentSuccesses = this.gameState.choiceHistory
      .slice(-5)
      .filter(choice => choice.outcome === 'great_success' || choice.outcome === 'success')
      .length;
    
    morale += recentSuccesses * 5;
    
    return Math.max(0, Math.min(100, morale));
  }

  // 外部アクセス用メソッド
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  // 全部員データ更新
  public updateAllPlayers(players: Player[]): void {
    this.gameState.allPlayers = players;
    // メインプレイヤーも更新（キャプテンまたは最初のプレイヤー）
    const captain = players.find(p => p.position === 'captain') || players[0];
    if (captain) {
      this.gameState.player = captain;
    }
  }

  public getCurrentDay(): CalendarDay {
    return this.gameState.calendarSystem.getCurrentState().currentDate;
  }

  public getAvailableCards(): TrainingCard[] {
    return [...this.gameState.availableCards];
  }

  public getActiveChoice(): StrategicChoice | null {
    return this.gameState.activeChoice;
  }

  public getGameStats(): GameState['stats'] {
    return { ...this.gameState.stats };
  }

  // 先読みしてカレンダーデイを取得（状態は進めない）
  public peekDays(count: number): CalendarDay[] {
    return this.gameState.calendarSystem.peekDays(count);
  }

  // 状態整合性チェック関数
  public validateGameState(): boolean {
    const calendarState = this.gameState.calendarSystem.getCurrentState();
    const currentDay = this.gameState.calendarSystem.getCurrentState().currentDate;
    
    // カレンダー状態の検証
    if (!this.gameState.calendarSystem.validateCalendarState()) {
      console.error('Calendar state validation failed');
      return false;
    }
    
    // 日付カウントの整合性チェック
    const expectedDayCount = this.calculateExpectedDayCount(currentDay);
    if (this.gameState.dayCount !== expectedDayCount) {
      console.error('Day count mismatch:', { 
        expected: expectedDayCount, 
        actual: this.gameState.dayCount 
      });
      return false;
    }
    
    return true;
  }

  // 期待される日付カウントを計算
  private calculateExpectedDayCount(currentDate: CalendarDay): number {
    // 開始日（4月1日）からの経過日数を計算
    // ハードコードされた年（2024）を修正し、正しい年を使用
    const startDate = new Date(currentDate.year, 3, 1); // 4月1日
    const currentDateObj = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    const diffTime = currentDateObj.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // 緊急事態処理（体力0、資金不足等）
  public handleEmergency(): {
    type: 'stamina_depletion' | 'funds_shortage' | 'reputation_crisis';
    autoActions: string[];
    forcedChoices: StrategicChoice[];
  } | null {
    const player = this.gameState.player;
    const school = this.gameState.schoolStats;

    if (player.stamina <= 0) {
      // 強制休養
      player.stamina = 20;
      const newCondScore = this.getConditionScore(player.condition) - 10;
      player.condition = this.scoreToCondition(newCondScore);
      
      return {
        type: 'stamina_depletion',
        autoActions: ['forced_rest', 'stamina_recovery'],
        forcedChoices: []
      };
    }

    if (school.funds < 0) {
      return {
        type: 'funds_shortage',
        autoActions: ['budget_cut', 'facility_downgrade'],
        forcedChoices: STRATEGIC_CHOICES.filter(choice => 
          choice.context === 'crisis_management'
        )
      };
    }

    if (school.reputation < 10) {
      return {
        type: 'reputation_crisis',
        autoActions: ['reputation_recovery_mode'],
        forcedChoices: STRATEGIC_CHOICES.filter(choice => 
          choice.routes.conservative.potentialEffects.schoolEffects?.reputation
        )
      };
    }

    return null;
  }

  // 詳細な診断ログを生成するメソッド
  public generateDiagnosticLog(): string[] {
    const logs: string[] = [];
    const timestamp = new Date().toISOString();

    logs.push(`=== 統合ゲームフロー診断ログ (${timestamp}) ===`);
    logs.push('');

    // ゲーム状態の基本情報
    logs.push('【ゲーム状態基本情報】');
    logs.push(`現在の日付: ${this.gameState.calendarSystem.getCurrentState().currentDate?.year || 'N/A'}年${this.gameState.calendarSystem.getCurrentState().currentDate?.month || 'N/A'}月${this.gameState.calendarSystem.getCurrentState().currentDate?.day || 'N/A'}日`);
    logs.push(`学校名: ${this.gameState.schoolStats.funds || 0}円`);
    logs.push(`プレイヤー数: ${this.gameState.allPlayers?.length || 0}人`);
    logs.push(`カード数: ${this.gameState.availableCards.length}枚`);
    logs.push(`資金: ${this.gameState.schoolStats.funds || 0}円`);
    logs.push(`評判: ${this.gameState.schoolStats.reputation || 0}`);
    logs.push('');

    // カレンダーシステムの状態
    logs.push('【カレンダーシステム状態】');
    if (this.gameState.calendarSystem) {
      const calendarLogs = this.gameState.calendarSystem.generateDiagnosticLog();
      logs.push(...calendarLogs);
    } else {
      logs.push('❌ カレンダーシステムが初期化されていません');
    }
    logs.push('');

    // カードシステムの状態
    logs.push('【カードシステム状態】');
    logs.push(`利用可能カード数: ${this.gameState.availableCards.length}`);
    logs.push(`使用済みカード数: ${this.gameState.cardUsageHistory.length}枚`); // 使用済みカード数を追加
    logs.push(`カード効果の累積: ${this.gameState.cardUsageHistory.reduce((sum, card) => sum + (card.actualEffects.skillGrowth ? Object.values(card.actualEffects.skillGrowth).reduce((s, v) => s + v, 0) : 0), 0)}`); // 累積スキル成長を追加
    logs.push('');

    // イベントシステムの状態
    logs.push('【イベントシステム状態】');
    logs.push(`アクティブイベント数: ${this.gameState.eventHistory?.filter(e => e.eventType === 'seasonal' || e.eventType === 'hidden').length || 0}`); // アクティブイベント数を追加
    logs.push(`完了イベント数: ${this.gameState.eventHistory?.filter(e => e.eventType === 'seasonal' || e.eventType === 'hidden').length || 0}`); // 完了イベント数を追加
    logs.push(`イベント履歴: ${this.gameState.eventHistory?.length || 0}件`);
    logs.push('');

    // 戦略選択システムの状態
    logs.push('【戦略選択システム状態】');
    logs.push(`現在の戦略: ${this.gameState.activeChoice ? this.gameState.activeChoice.title : 'なし'}`);
    logs.push(`選択可能な戦略数: ${this.gameState.activeChoice ? 1 : 0}`); // 選択可能な戦略数を追加
    logs.push('');

    // データ整合性チェック
    logs.push('【データ整合性チェック】');
    const gameStateValid = this.validateGameState();
    logs.push(`ゲーム状態検証: ${gameStateValid ? '✅ 正常' : '❌ 異常'}`);
    
    if (!gameStateValid) {
      logs.push('❌ ゲーム状態に問題があります');
      logs.push('推奨アクション: ゲーム状態の復旧を実行してください');
    }
    logs.push('');

    // 推奨アクション
    logs.push('【推奨アクション】');
    if (!gameStateValid) {
      logs.push('1. カレンダー状態の復旧を実行');
      logs.push('2. ゲーム状態の再初期化を検討');
      logs.push('3. データベースとの同期を確認');
    } else {
      logs.push('1. 現在の状態を維持');
      logs.push('2. 定期的な状態検証を実行');
      logs.push('3. バックアップの作成を検討');
    }
    logs.push('');

    logs.push('=== 診断完了 ===');
    return logs;
  }
}