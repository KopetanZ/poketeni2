// 統合ゲームフローマネージャー
// カレンダー・カード・分岐選択システムの統合管理

import { CalendarSystem } from './calendar-system';
import { TrainingCardSystem } from './training-card-system';
import { StrategicChoiceSystem, STRATEGIC_CHOICES } from './strategic-choice-system';
import { CalendarDay } from '../types/calendar';
import { TrainingCard, CardUsageResult } from '../types/training-cards';
import { StrategicChoice, ChoiceOutcome, ChoiceRouteType } from '../types/strategic-choice';
import { Player } from '../types/game';

export interface GameState {
  // カレンダー状態
  calendarSystem: CalendarSystem;
  currentDay: CalendarDay;
  
  // プレイヤー・学校情報
  player: Player;
  schoolStats: {
    funds: number;
    reputation: number;
    facilities: number;
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
}

export class IntegratedGameFlow {
  private gameState: GameState;

  constructor(initialPlayer: Player, initialSchoolStats: any) {
    this.gameState = {
      calendarSystem: new CalendarSystem(),
      currentDay: new CalendarSystem().getCurrentState().currentDate,
      player: initialPlayer,
      schoolStats: {
        funds: initialSchoolStats.funds || 50000,
        reputation: initialSchoolStats.reputation || 50,
        facilities: initialSchoolStats.facilities || 50
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
      }
    };

    this.initializeDailyFlow();
  }

  // 日次フロー初期化
  private initializeDailyFlow(): void {
    this.generateDailyCards();
    this.checkForStrategicChoices();
  }

  // 初回日次カード生成
  private generateDailyCards(): void {
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
    this.gameState.currentDay = newDay;
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
    if (this.gameState.currentDay.seasonalEvent) baseCount += 1;
    if (this.gameState.currentDay.hiddenEvent) baseCount += 2;

    return Math.min(baseCount, 10); // 最大10枚
  }

  // カード使用処理（統合）
  public useTrainingCard(card: TrainingCard): CardUsageResult {
    // 環境修正要因の計算
    const environmentModifiers = {
      weather: this.gameState.currentDay.weather || 'sunny',
      courtCondition: this.gameState.currentDay.courtCondition || 'normal',
      teamMorale: this.calculateTeamMorale()
    };

    // カレンダーマス効果の適用
    const squareEffect = this.gameState.calendarSystem.getSquareEffect(
      this.gameState.currentDay.square
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
        Object.keys(result.actualEffects.skillGrowth).forEach(skill => {
          result.actualEffects.skillGrowth![skill] = Math.round(
            result.actualEffects.skillGrowth![skill] * multiplier
          );
        });
      }
    }

    // プレイヤーステータス更新
    this.applyCardEffects(result);
    
    // 統計更新
    this.gameState.stats.totalCardsUsed++;
    this.gameState.cardUsageHistory.push(result);
    
    // 使用したカードを除去
    this.gameState.availableCards = this.gameState.availableCards.filter(
      c => c.id !== card.id
    );

    return result;
  }

  // 戦略的選択実行
  public executeStrategicChoice(
    choice: StrategicChoice,
    selectedRoute: ChoiceRouteType
  ): ChoiceOutcome {
    const modifiers = StrategicChoiceSystem.calculateProbabilityModifiers(
      this.getPlayerStats(),
      this.gameState.schoolStats,
      {
        weather: this.gameState.currentDay.weather,
        courtCondition: this.gameState.currentDay.courtCondition,
        teamMorale: this.calculateTeamMorale(),
        currentMonth: this.gameState.currentDay.month
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
    
    if (this.gameState.currentDay.seasonalEvent) {
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
        weather: this.gameState.currentDay.weather,
        courtCondition: this.gameState.currentDay.courtCondition,
        currentMonth: this.gameState.currentDay.month
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

  // カード効果適用
  private applyCardEffects(result: CardUsageResult): void {
    if (result.success && result.actualEffects.skillGrowth) {
      Object.entries(result.actualEffects.skillGrowth).forEach(([skill, growth]) => {
        this.gameState.player[skill] = (this.gameState.player[skill] || 0) + growth;
      });
    }

    // 体力・やる気の更新
    this.gameState.player.stamina = Math.max(0, 
      (this.gameState.player.stamina || 100) - result.card.costs.stamina
    );

    if (result.actualEffects.statusChanges?.condition) {
      this.gameState.player.condition = Math.max(0, Math.min(100,
        (this.gameState.player.condition || 50) + result.actualEffects.statusChanges.condition
      ));
    }

    // 経験値追加
    this.gameState.player.experience = (this.gameState.player.experience || 0) + result.experienceGained;
    
    // レベルアップ判定
    this.checkLevelUp();
  }

  // 選択結果適用
  private applyChoiceOutcome(outcome: ChoiceOutcome): void {
    // プレイヤー効果
    if (outcome.actualEffects.playerChanges) {
      Object.entries(outcome.actualEffects.playerChanges).forEach(([stat, change]) => {
        this.gameState.player[stat] = (this.gameState.player[stat] || 0) + change;
      });
    }

    // 学校効果
    if (outcome.actualEffects.schoolChanges) {
      Object.entries(outcome.actualEffects.schoolChanges).forEach(([stat, change]) => {
        this.gameState.schoolStats[stat] = (this.gameState.schoolStats[stat] || 0) + change;
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

  // レベルアップ判定
  private checkLevelUp(): void {
    const experienceThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    const currentLevel = this.gameState.player.level || 1;
    
    if (currentLevel < experienceThresholds.length - 1) {
      const nextThreshold = experienceThresholds[currentLevel];
      if (this.gameState.player.experience >= nextThreshold) {
        this.gameState.player.level = currentLevel + 1;
        // レベルアップ時の基本能力向上
        ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'].forEach(skill => {
          this.gameState.player[skill] = (this.gameState.player[skill] || 0) + 2;
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
      motivation: this.gameState.player.condition || 50,
      level: this.gameState.player.level || 1,
      experience: this.gameState.player.experience || 0,
      serve_skill: this.gameState.player.serve_skill || 0,
      return_skill: this.gameState.player.return_skill || 0,
      volley_skill: this.gameState.player.volley_skill || 0,
      stroke_skill: this.gameState.player.stroke_skill || 0,
      mental: this.gameState.player.mental || 0
    };
  }

  private calculateTeamMorale(): number {
    // 学校評判、プレイヤーの調子、最近の成功などからチーム士気を計算
    let morale = 50;
    
    morale += Math.min(this.gameState.schoolStats.reputation / 2, 25);
    morale += Math.min((this.gameState.player.condition || 50) / 2, 25);
    
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

  public getCurrentDay(): CalendarDay {
    return this.gameState.currentDay;
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

  // 緊急事態処理（体力0、資金不足等）
  public handleEmergency(): {
    type: 'stamina_depletion' | 'funds_shortage' | 'reputation_crisis';
    autoActions: string[];
    forcedChoices: StrategicChoice[];
  } {
    const player = this.gameState.player;
    const school = this.gameState.schoolStats;

    if (player.stamina <= 0) {
      // 強制休養
      player.stamina = 20;
      player.condition = Math.max(0, (player.condition || 50) - 10);
      
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
}