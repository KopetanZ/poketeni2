// 統合対戦システム - 3つのモードを統合
// 1. 基本対戦システム（自動シミュレーション）
// 2. 高度対戦システム（詳細計算・自動）
// 3. インタラクティブ対戦システム（栄冠ナイン風・ユーザー介入）

import { Player } from '@/types/game';
import { MatchEngine, MatchResult } from './match-engine';
import { AdvancedMatchEngine, AdvancedSetResult, TacticType } from './advanced-match-engine';
import { 
  InteractiveMatchEngine, 
  InteractiveMatchState, 
  MatchChoice, 
  MatchEvent,
  UserChoice 
} from './interactive-match-engine';

export type UnifiedMatchMode = 
  | 'basic'       // 基本システム（高速・シンプル）
  | 'advanced'    // 高度システム（詳細・自動）
  | 'interactive' // インタラクティブ（栄冠ナイン風）
  | 'debug';      // デバッグモード

export type UnifiedMatchFormat = 
  | 'single_set'     // 1セットマッチ
  | 'best_of_3'      // 3セットマッチ（2セット先取）
  | 'team_match';    // 団体戦（5試合）

// 統合試合設定
export interface UnifiedMatchConfig {
  mode: UnifiedMatchMode;
  format: UnifiedMatchFormat;
  
  // 基本設定
  homePlayer: Player;
  awayPlayer: Player;
  
  // 戦術設定（advanced/interactive用）
  homeTactic?: TacticType;
  awayTactic?: TacticType;
  
  // 環境設定
  environment?: {
    weather: 'sunny' | 'cloudy' | 'rainy' | 'windy';
    court_surface: 'hard' | 'clay' | 'grass' | 'indoor';
    pressure_level?: number;
    tournament_level?: 'practice' | 'prefectural' | 'regional' | 'national';
  };
  
  // インタラクティブモード設定
  interactiveConfig?: {
    enableDirectorInstructions: boolean;    // 監督指示システム
    enableTacticCards: boolean;             // 戦術カードシステム
    enableSpecialMoves: boolean;            // 特殊作戦システム
    instructionFrequency: 'critical_only' | 'frequent' | 'every_point';
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert';
  };
  
  // コールバック関数
  onMatchUpdate?: (state: UnifiedMatchState) => void;
  onUserChoiceRequired?: (choices: MatchChoice[]) => Promise<MatchChoice>;
  onMatchEvent?: (event: MatchEvent) => void;
}

// 統合試合状態
export interface UnifiedMatchState {
  mode: UnifiedMatchMode;
  format: UnifiedMatchFormat;
  
  // 基本状態
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'pre_match' | 'in_progress' | 'user_choice' | 'post_match';
  
  // スコア情報
  score: {
    home: { sets: number; games: number; points: number; };
    away: { sets: number; games: number; points: number; };
  };
  
  // 試合進行
  currentSet: number;
  totalSets: number;
  server: 'home' | 'away';
  
  // モード別状態
  basicResult?: MatchResult;
  advancedResult?: AdvancedSetResult;
  interactiveState?: InteractiveMatchState;
  
  // 統計情報
  statistics: {
    totalPoints: { home: number; away: number; };
    winners: { home: number; away: number; };
    errors: { home: number; away: number; };
    aces: { home: number; away: number; };
    doubleFaults: { home: number; away: number; };
    breakPoints: { converted: { home: number; away: number; }; opportunities: { home: number; away: number; }; };
  };
  
  // イベントログ
  events: MatchEvent[];
  
  // 待機中のユーザー選択
  pendingChoice?: {
    situation: string;
    choices: MatchChoice[];
    timeLimit?: number;
  };
}

export class UnifiedMatchSystem {
  private config: UnifiedMatchConfig;
  private state: UnifiedMatchState;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: UnifiedMatchConfig) {
    this.config = config;
    this.state = this.initializeMatchState(config);
  }

  // 試合状態初期化
  private initializeMatchState(config: UnifiedMatchConfig): UnifiedMatchState {
    return {
      mode: config.mode,
      format: config.format,
      isActive: false,
      isPaused: false,
      currentPhase: 'pre_match',
      
      score: {
        home: { sets: 0, games: 0, points: 0 },
        away: { sets: 0, games: 0, points: 0 }
      },
      
      currentSet: 1,
      totalSets: config.format === 'single_set' ? 1 : 3,
      server: Math.random() > 0.5 ? 'home' : 'away',
      
      statistics: {
        totalPoints: { home: 0, away: 0 },
        winners: { home: 0, away: 0 },
        errors: { home: 0, away: 0 },
        aces: { home: 0, away: 0 },
        doubleFaults: { home: 0, away: 0 },
        breakPoints: { 
          converted: { home: 0, away: 0 }, 
          opportunities: { home: 0, away: 0 } 
        }
      },
      
      events: [],
      
      // インタラクティブモード用状態初期化
      interactiveState: config.mode === 'interactive' ? {
        currentSet: 1,
        currentGame: 1,
        homeScore: 0,
        awayScore: 0,
        homeGames: 0,
        awayGames: 0,
        homeSets: 0,
        awaySets: 0,
        server: Math.random() > 0.5 ? 'home' : 'away',
        situation: 'serve',
        momentum: 0,
        pressure: 30,
        fatigue: { home: 0, away: 0 },
        activeEffects: { home: [], away: [] },
        availableChoices: []
      } : undefined
    };
  }

  // 試合開始
  async startMatch(): Promise<void> {
    this.state.isActive = true;
    this.state.currentPhase = 'in_progress';
    
    this.emitEvent('match_start', { config: this.config });
    
    try {
      switch (this.config.mode) {
        case 'basic':
          await this.runBasicMatch();
          break;
        case 'advanced':
          await this.runAdvancedMatch();
          break;
        case 'interactive':
          await this.runInteractiveMatch();
          break;
        case 'debug':
          await this.runDebugMatch();
          break;
      }
    } catch (error) {
      console.error('Match execution error:', error);
      this.emitEvent('match_error', { error });
    }
  }

  // 基本システムでの試合実行
  private async runBasicMatch(): Promise<void> {
    const cpuPlayer = {
      id: this.config.awayPlayer.id,
      pokemon_name: this.config.awayPlayer.pokemon_name,
      pokemon_id: this.config.awayPlayer.pokemon_id,
      level: this.config.awayPlayer.level,
      grade: this.config.awayPlayer.grade,
      position: this.config.awayPlayer.position,
      serve_skill: this.config.awayPlayer.serve_skill,
      return_skill: this.config.awayPlayer.return_skill,
      volley_skill: this.config.awayPlayer.volley_skill,
      stroke_skill: this.config.awayPlayer.stroke_skill,
      mental: this.config.awayPlayer.mental,
      stamina: this.config.awayPlayer.stamina,
      ai_personality: 'balanced' as const
    };

    const result = MatchEngine.simulateMatch(this.config.homePlayer, cpuPlayer);
    
    this.state.basicResult = result;
    this.state.score.home.sets = result.home_sets_won;
    this.state.score.away.sets = result.away_sets_won;
    
    this.state.currentPhase = 'post_match';
    this.state.isActive = false;
    
    this.emitEvent('match_complete', { result });
  }

  // 高度システムでの試合実行
  private async runAdvancedMatch(): Promise<void> {
    const result = AdvancedMatchEngine.simulateAdvancedSet(
      this.config.homePlayer,
      this.config.awayPlayer,
      this.config.homeTactic || 'balanced',
      this.config.awayTactic || 'balanced',
      this.config.environment
    );
    
    this.state.advancedResult = result;
    this.state.score.home.sets = result.winner === 'home' ? 1 : 0;
    this.state.score.away.sets = result.winner === 'away' ? 1 : 0;
    this.state.score.home.games = result.home_score;
    this.state.score.away.games = result.away_score;
    
    // 統計情報の更新
    this.state.statistics.totalPoints.home = result.home_statistics.total_points_won;
    this.state.statistics.totalPoints.away = result.away_statistics.total_points_won;
    
    this.state.currentPhase = 'post_match';
    this.state.isActive = false;
    
    this.emitEvent('match_complete', { result });
  }

  // インタラクティブシステムでの試合実行
  private async runInteractiveMatch(): Promise<void> {
    if (!this.state.interactiveState) {
      throw new Error('Interactive state not initialized');
    }

    while (this.state.isActive && this.isMatchOngoing()) {
      // 現在の状況を分析
      const situation = InteractiveMatchEngine.analyzeSituation(this.state.interactiveState);
      this.state.interactiveState.situation = situation;

      // ユーザー選択が必要な状況か判定
      if (this.shouldRequestUserChoice(situation)) {
        await this.handleUserChoice();
      } else {
        // 自動進行 - より確実にポイントを進行
        await this.simulateAutomaticPoint();
        
        // 状況変化を待つ
        await this.sleep(1000);
      }

      // 状態更新
      this.updateMatchState();
      this.emitEvent('match_update', { state: this.state });

      // 小休止（リアルタイム感の演出）
      await this.sleep(500);
    }

    this.state.currentPhase = 'post_match';
    this.state.isActive = false;
    this.emitEvent('match_complete', { state: this.state });
  }

  // ユーザー選択が必要かどうか判定
  private shouldRequestUserChoice(situation: string): boolean {
    const config = this.config.interactiveConfig;
    if (!config?.enableDirectorInstructions) return false;

    switch (config.instructionFrequency) {
      case 'every_point':
        return true;
      case 'frequent':
        return ['serve', 'return', 'break_point', 'set_point', 'match_point', 'pressure'].includes(situation);
      case 'critical_only':
        return ['break_point', 'set_point', 'match_point'].includes(situation);
      default:
        return false;
    }
  }

  // ユーザー選択処理
  private async handleUserChoice(): Promise<void> {
    if (!this.state.interactiveState) return;

    const availableChoices = InteractiveMatchEngine.getAvailableChoices(
      this.state.interactiveState.situation,
      this.state.interactiveState
    );

    this.state.pendingChoice = {
      situation: this.state.interactiveState.situation,
      choices: availableChoices,
      timeLimit: 15000 // 15秒
    };

    this.state.currentPhase = 'user_choice';
    this.emitEvent('user_choice_required', { choices: availableChoices });

    // ユーザー選択を待機
    if (this.config.onUserChoiceRequired) {
      try {
        const selectedChoice = await this.config.onUserChoiceRequired(availableChoices);
        await this.executeUserChoice(selectedChoice);
      } catch (error) {
        console.error('User choice error:', error);
        // デフォルト選択肢を適用
        await this.executeUserChoice(availableChoices[0]);
      }
    }

    this.state.currentPhase = 'in_progress';
    this.state.pendingChoice = undefined;
  }

  // ユーザー選択実行
  private async executeUserChoice(choice: MatchChoice): Promise<void> {
    if (!this.state.interactiveState) return;

    const result = InteractiveMatchEngine.executeChoice(choice, this.state.interactiveState);
    
    this.state.interactiveState = result.newState;
    
    // 緊急指示を高度対戦システムに適用
    if ((choice.type === 'aggressive' || choice.type === 'defensive' || choice.type === 'mental') && this.config.homeTactic) {
      // 高度対戦システムのコンテキストに緊急指示を適用
      const matchContext = this.getMatchContext();
      if (matchContext) {
        // UserChoiceをTacticTypeにマッピング
        const tacticTypeMap: Record<string, TacticType> = {
          'aggressive': 'aggressive',
          'defensive': 'defensive',
          'mental': 'technical'
        };
        
        const mappedTactic = tacticTypeMap[choice.type] || this.config.homeTactic;
        
        AdvancedMatchEngine.applyEmergencyInstruction(
          matchContext,
          mappedTactic,
          choice.effect.duration || 2
        );
      }
    }
    
    // 結果イベントの発生
    const event: MatchEvent = {
      id: `choice_${Date.now()}`,
      type: 'choice_result',
      title: result.success ? '指示成功！' : '指示失敗...',
      description: result.result,
      impact: result.success ? 'positive' : 'negative',
      effectOnMatch: {}
    };
    
    this.state.events.push(event);
    
    if (result.event) {
      this.state.events.push(result.event);
      this.emitEvent('special_event', { event: result.event });
    }

    this.emitEvent('choice_executed', { choice, result });
    
    // ユーザー選択後に確実にポイントを進行
    await this.simulateAutomaticPoint();
  }

  // 自動ポイント進行
  private async simulateAutomaticPoint(): Promise<void> {
    if (!this.state.interactiveState) return;

    // ユーザー選択の効果を反映したポイント計算
    let homeAdvantage = 0;
    let awayAdvantage = 0;
    
    // 勢いによる調整
    if (this.state.interactiveState.momentum > 20) {
      homeAdvantage += 0.2;
    } else if (this.state.interactiveState.momentum < -20) {
      awayAdvantage += 0.2;
    }
    
    // プレッシャーによる調整
    if (this.state.interactiveState.pressure > 70) {
      awayAdvantage += 0.1; // 高プレッシャー時は相手有利
    }
    
    // 基本確率（50-50）に調整値を加算
    const homeProbability = 0.5 + homeAdvantage - awayAdvantage;
    const pointWinner = Math.random() < homeProbability ? 'home' : 'away';
    
    if (pointWinner === 'home') {
      this.state.interactiveState.homeScore++;
      this.state.statistics.totalPoints.home++;
      // 勢いを少し調整
      this.state.interactiveState.momentum = Math.min(100, this.state.interactiveState.momentum + 5);
    } else {
      this.state.interactiveState.awayScore++;
      this.state.statistics.totalPoints.away++;
      // 勢いを少し調整
      this.state.interactiveState.momentum = Math.max(-100, this.state.interactiveState.momentum - 5);
    }

    // ゲーム終了チェック
    this.checkGameComplete();
    
    // 状態更新を通知
    this.updateMatchState();
    this.emitEvent('match_update', { state: this.state });
  }

  // ゲーム完了チェック
  private checkGameComplete(): void {
    if (!this.state.interactiveState) return;

    const homeScore = this.state.interactiveState.homeScore;
    const awayScore = this.state.interactiveState.awayScore;

    // 4ポイント先取、2ポイント差
    if ((homeScore >= 4 || awayScore >= 4) && Math.abs(homeScore - awayScore) >= 2) {
      // ゲーム完了
      if (homeScore > awayScore) {
        this.state.interactiveState.homeGames++;
      } else {
        this.state.interactiveState.awayGames++;
      }

      // スコアリセット
      this.state.interactiveState.homeScore = 0;
      this.state.interactiveState.awayScore = 0;
      
      // サーバー交代
      this.state.interactiveState.server = this.state.interactiveState.server === 'home' ? 'away' : 'home';
      
      this.checkSetComplete();
    }
  }

  // セット完了チェック
  private checkSetComplete(): void {
    if (!this.state.interactiveState) return;

    const homeGames = this.state.interactiveState.homeGames;
    const awayGames = this.state.interactiveState.awayGames;

    // 6ゲーム先取、2ゲーム差
    if ((homeGames >= 6 || awayGames >= 6) && Math.abs(homeGames - awayGames) >= 2) {
      // セット完了
      if (homeGames > awayGames) {
        this.state.interactiveState.homeSets++;
      } else {
        this.state.interactiveState.awaySets++;
      }

      // ゲームカウントリセット
      this.state.interactiveState.homeGames = 0;
      this.state.interactiveState.awayGames = 0;
      this.state.interactiveState.currentSet++;

      this.emitEvent('set_complete', {
        set: this.state.interactiveState.currentSet - 1,
        winner: homeGames > awayGames ? 'home' : 'away'
      });
    }
  }

  // デバッグモード実行
  private async runDebugMatch(): Promise<void> {
    // デバッグモードでは全システムを順番に実行して比較
    console.log('🧪 Debug Mode: Running all systems for comparison');
    
    // 基本システム
    await this.runBasicMatch();
    
    // 状態リセット
    this.state = this.initializeMatchState(this.config);
    this.state.isActive = true;
    
    // 高度システム
    await this.runAdvancedMatch();
    
    this.emitEvent('debug_complete', {
      basic: this.state.basicResult,
      advanced: this.state.advancedResult
    });
  }

  // 試合継続判定
  private isMatchOngoing(): boolean {
    if (!this.state.interactiveState) return false;
    
    // 2セット先取で終了
    return this.state.interactiveState.homeSets < 2 && this.state.interactiveState.awaySets < 2;
  }

  // 試合状態更新
  private updateMatchState(): void {
    if (!this.state.interactiveState) return;
    
    this.state.score.home.sets = this.state.interactiveState.homeSets;
    this.state.score.away.sets = this.state.interactiveState.awaySets;
    this.state.score.home.games = this.state.interactiveState.homeGames;
    this.state.score.away.games = this.state.interactiveState.awayGames;
    this.state.score.home.points = this.state.interactiveState.homeScore;
    this.state.score.away.points = this.state.interactiveState.awayScore;
    
    this.state.currentSet = this.state.interactiveState.currentSet;
    this.state.server = this.state.interactiveState.server;
  }

  // イベント発生
  private emitEvent(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => handler(data));
  }

  // イベントハンドラ登録
  public addEventListener(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  // イベントハンドラ削除
  public removeEventListener(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 高度対戦システムのコンテキスト取得
  private getMatchContext(): any {
    if (this.state.advancedResult) {
      // 高度対戦システムの結果からコンテキストを取得
      return {
        weather: this.config.environment?.weather || 'sunny',
        court_surface: this.config.environment?.court_surface || 'hard',
        pressure_level: this.config.environment?.pressure_level || 20,
        rally_count: 0,
        set_score: { home: 0, away: 0 },
        game_score: { home: 0, away: 0 }
      };
    }
    return null;
  }

  // ユーザー選択をシステムに送信
  public submitUserChoice(choice: MatchChoice): void {
    if (this.state.currentPhase === 'user_choice' && this.config.onUserChoiceRequired) {
      this.executeUserChoice(choice);
    }
  }

  // 試合一時停止
  public pauseMatch(): void {
    this.state.isPaused = true;
    this.emitEvent('match_paused', {});
  }

  // 試合再開
  public resumeMatch(): void {
    this.state.isPaused = false;
    this.emitEvent('match_resumed', {});
  }

  // 現在の状態取得
  public getState(): UnifiedMatchState {
    return { ...this.state };
  }

  // 設定取得
  public getConfig(): UnifiedMatchConfig {
    return { ...this.config };
  }

  // ユーティリティ: sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}