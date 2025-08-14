/**
 * 統合マッチシステム - メインエクスポート
 * 全マッチエンジンを統合した完全なマッチシステム
 */

import { 
  MatchConfig, 
  MatchResult, 
  MatchMode, 
  InteractiveMatchState,
  MatchEvent,
  MatchChoice,
  UserChoice,
  MatchSituation
} from './types';
import { BaseMatchEngine } from './base-engine';
import { AdvancedMatchFeatures } from './advanced-features';
import { InteractiveMatchFeatures } from './interactive-features';

export * from './types';
export { BaseMatchEngine } from './base-engine';
export { AdvancedMatchFeatures } from './advanced-features';
export { InteractiveMatchFeatures } from './interactive-features';

/**
 * 統合マッチエンジン - 全機能統合クラス
 */
export class UnifiedMatchEngine {
  private config: MatchConfig;
  private interactiveState?: InteractiveMatchState;
  private events: MatchEvent[] = [];
  private onEventCallback?: (event: MatchEvent) => void;
  private onChoiceRequestCallback?: (choices: MatchChoice[], situation: MatchSituation) => Promise<UserChoice>;
  
  constructor(config: MatchConfig) {
    this.config = config;
    
    // インタラクティブモード用の状態初期化
    if (config.mode === 'interactive') {
      this.interactiveState = {
        homeScore: 0,
        awayScore: 0,
        currentServer: 'home',
        momentum: 0,
        pressure: 50,
        situation: 'serve',
        availableChoices: [],
        ralliesWon: { home: 0, away: 0 },
        timeouts: { home: 0, away: 0 }
      };
    }
  }
  
  /**
   * イベントリスナーを設定
   */
  setEventListener(callback: (event: MatchEvent) => void): void {
    this.onEventCallback = callback;
  }
  
  /**
   * 選択要求リスナーを設定（インタラクティブモード用）
   */
  setChoiceRequestListener(callback: (choices: MatchChoice[], situation: MatchSituation) => Promise<UserChoice>): void {
    this.onChoiceRequestCallback = callback;
  }
  
  /**
   * 試合を実行
   */
  async simulateMatch(): Promise<MatchResult> {
    switch (this.config.mode) {
      case 'basic':
        return this.simulateBasicMatch();
      case 'advanced':
        return this.simulateAdvancedMatch();
      case 'interactive':
        return await this.simulateInteractiveMatch();
      case 'debug':
        return this.simulateDebugMatch();
      default:
        throw new Error(`Unknown match mode: ${this.config.mode}`);
    }
  }
  
  /**
   * 基本モード - 高速シンプル実行
   */
  private simulateBasicMatch(): MatchResult {
    return BaseMatchEngine.simulateMatch(this.config);
  }
  
  /**
   * 高度モード - 詳細計算・特殊能力対応
   */
  private simulateAdvancedMatch(): MatchResult {
    // 基本エンジンをベースに高度機能を適用
    const result = BaseMatchEngine.simulateMatch(this.config);
    
    // 各ポイントを高度機能で再計算
    for (const set of result.sets) {
      for (let i = 0; i < set.points.length; i++) {
        const point = set.points[i];
        const context = this.createMatchContext(set, point);
        
        // 高度ポイントシミュレーションで置き換え
        const enhancedPoint = AdvancedMatchFeatures.simulateAdvancedPoint(
          this.config.homePlayer,
          this.config.awayPlayer,
          point.type,
          context
        );
        
        set.points[i] = enhancedPoint;
      }
    }
    
    return result;
  }
  
  /**
   * インタラクティブモード - ユーザー選択対応
   */
  private async simulateInteractiveMatch(): Promise<MatchResult> {
    if (!this.interactiveState) {
      throw new Error('Interactive state not initialized');
    }
    
    const context = this.createInitialContext();
    const result: MatchResult = {
      winner: 'home',
      sets: [],
      final_score: { home: 0, away: 0 },
      match_duration_minutes: 0,
      total_home_performance: this.createEmptyPerformance(),
      total_away_performance: this.createEmptyPerformance()
    };
    
    let homeSets = 0;
    let awaySets = 0;
    const targetSets = this.config.format === 'best_of_3' ? 2 : 1;
    
    while (homeSets < targetSets && awaySets < targetSets) {
      const set = await this.simulateInteractiveSet(context);
      result.sets.push(set);
      
      if (set.winner === 'home') {
        homeSets++;
      } else {
        awaySets++;
      }
      
      context.set_score = { home: homeSets, away: awaySets };
      
      // セット間のイベント
      this.emitEvent({
        id: `set_completed_${Date.now()}`,
        type: 'set_won',
        player: set.winner,
        description: `${set.winner === 'home' ? this.config.homePlayer.pokemon_name : this.config.awayPlayer.pokemon_name}がセットを取った！`,
        timestamp: Date.now()
      });
    }
    
    result.winner = homeSets > awaySets ? 'home' : 'away';
    result.final_score = { home: homeSets, away: awaySets };
    result.match_duration_minutes = result.sets.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    // 総合パフォーマンス計算
    const allPoints = result.sets.flatMap(s => s.points);
    result.total_home_performance = BaseMatchEngine.calculatePerformance(allPoints, 'home');
    result.total_away_performance = BaseMatchEngine.calculatePerformance(allPoints, 'away');
    
    return result;
  }
  
  /**
   * インタラクティブセットシミュレーション
   */
  private async simulateInteractiveSet(context: any): Promise<any> {
    const games = [];
    let homeGames = 0;
    let awayGames = 0;
    const targetGames = 6;
    
    while (homeGames < targetGames && awayGames < targetGames) {
      const game = await this.simulateInteractiveGame(context);
      games.push(game);
      
      if (game.winner === 'home') {
        homeGames++;
      } else {
        awayGames++;
      }
      
      context.game_score = { home: homeGames, away: awayGames };
    }
    
    const allPoints = games.flatMap(g => g.points);
    return {
      home_score: homeGames,
      away_score: awayGames,
      winner: homeGames > awayGames ? 'home' : 'away',
      points: allPoints,
      duration_minutes: games.reduce((sum, g) => sum + (g.duration_minutes || 0), 0),
      games,
      home_performance: BaseMatchEngine.calculatePerformance(allPoints, 'home'),
      away_performance: BaseMatchEngine.calculatePerformance(allPoints, 'away')
    };
  }
  
  /**
   * インタラクティブゲームシミュレーション
   */
  private async simulateInteractiveGame(context: any): Promise<any> {
    const points = [];
    let homeScore = 0;
    let awayScore = 0;
    const targetScore = 6;
    
    this.interactiveState!.homeScore = 0;
    this.interactiveState!.awayScore = 0;
    
    while (homeScore < targetScore && awayScore < targetScore) {
      // 状況分析
      const situation = InteractiveMatchFeatures.analyzeSituation(
        this.config.homePlayer,
        this.config.awayPlayer,
        context,
        this.interactiveState!
      );
      
      this.interactiveState!.situation = situation;
      
      // 選択肢生成
      const choices = InteractiveMatchFeatures.generateChoices(
        situation,
        this.config.homePlayer,
        context,
        this.interactiveState!
      );
      
      this.interactiveState!.availableChoices = choices;
      
      // ユーザー選択要求（ホームプレイヤー）
      let homeChoice: UserChoice = 'maintain';
      if (this.onChoiceRequestCallback && choices.length > 0) {
        try {
          homeChoice = await this.onChoiceRequestCallback(choices, situation);
        } catch (error) {
          console.warn('Choice request failed, using default choice:', error);
          homeChoice = 'maintain';
        }
      }
      
      // CPU選択（アウェイプレイヤー）
      const awayChoice = InteractiveMatchFeatures.decideCPUChoice(
        situation,
        this.config.awayPlayer,
        context,
        this.interactiveState!
      );
      
      // 選択効果を適用
      const homeChoiceData = choices.find(c => c.choice === homeChoice);
      if (homeChoiceData) {
        const result = InteractiveMatchFeatures.executeChoice(
          homeChoiceData,
          this.config.homePlayer,
          context,
          this.interactiveState!
        );
        
        if (result.event) {
          this.emitEvent(result.event);
        }
      }
      
      // ポイントシミュレーション
      const pointTypes: ('serve' | 'return' | 'volley' | 'stroke' | 'mental')[] = 
        ['serve', 'return', 'volley', 'stroke', 'mental'];
      const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)];
      
      const point = AdvancedMatchFeatures.simulateAdvancedPoint(
        this.config.homePlayer,
        this.config.awayPlayer,
        pointType,
        context
      );
      
      points.push(point);
      
      if (point.winner === 'home') {
        homeScore++;
        this.interactiveState!.homeScore++;
        this.interactiveState!.ralliesWon.home++;
      } else {
        awayScore++;
        this.interactiveState!.awayScore++;
        this.interactiveState!.ralliesWon.away++;
      }
      
      // 勢い・プレッシャー更新
      InteractiveMatchFeatures.updateMomentum(
        this.interactiveState!,
        point.winner,
        pointType,
        point.is_critical || false,
        point.is_error || false
      );
      
      InteractiveMatchFeatures.updatePressure(
        context,
        situation,
        homeScore - awayScore
      );
      
      // ポイントイベント
      this.emitEvent({
        id: `point_won_${Date.now()}`,
        type: 'point_won',
        player: point.winner,
        description: point.description,
        timestamp: Date.now(),
        data: { point, choices: [homeChoice, awayChoice] }
      });
      
      context.rally_count++;
    }
    
    return {
      home_score: homeScore,
      away_score: awayScore,
      winner: homeScore > awayScore ? 'home' : 'away',
      points,
      duration_minutes: Math.round(points.length * 1.5)
    };
  }
  
  /**
   * デバッグモード - 詳細ログ付き実行
   */
  private simulateDebugMatch(): MatchResult {
    console.log('=== DEBUG MATCH START ===');
    console.log('Config:', this.config);
    
    const result = this.simulateAdvancedMatch();
    
    console.log('=== DEBUG MATCH RESULT ===');
    console.log('Winner:', result.winner);
    console.log('Final Score:', result.final_score);
    console.log('Sets:', result.sets.length);
    console.log('Duration:', result.match_duration_minutes, 'minutes');
    console.log('Events:', this.events.length);
    
    return result;
  }
  
  // ===== ヘルパーメソッド =====
  
  private createMatchContext(set: any, point: any): any {
    return {
      weather: this.config.environment?.weather || 'sunny',
      court_surface: this.config.environment?.court_surface || 'hard',
      pressure_level: this.config.environment?.pressure_level || 50,
      tournament_level: this.config.environment?.tournament_level || 'practice',
      rally_count: 0,
      set_score: { home: 0, away: 0 },
      game_score: { home: 0, away: 0 }
    };
  }
  
  private createInitialContext(): any {
    return {
      weather: this.config.environment?.weather || 'sunny',
      court_surface: this.config.environment?.court_surface || 'hard',
      pressure_level: this.config.environment?.pressure_level || 50,
      tournament_level: this.config.environment?.tournament_level || 'practice',
      rally_count: 0,
      set_score: { home: 0, away: 0 },
      game_score: { home: 0, away: 0 }
    };
  }
  
  private createEmptyPerformance(): any {
    return {
      serve_success: 0,
      return_success: 0,
      volley_success: 0,
      stroke_success: 0,
      mental_success: 0,
      total_points: 0,
      critical_hits: 0,
      errors: 0,
      winner_shots: 0
    };
  }
  
  private emitEvent(event: MatchEvent): void {
    this.events.push(event);
    if (this.onEventCallback) {
      this.onEventCallback(event);
    }
  }
  
  /**
   * 現在のインタラクティブ状態を取得
   */
  getInteractiveState(): InteractiveMatchState | undefined {
    return this.interactiveState;
  }
  
  /**
   * 発生したイベント一覧を取得
   */
  getEvents(): MatchEvent[] {
    return [...this.events];
  }
  
  /**
   * イベント履歴をクリア
   */
  clearEvents(): void {
    this.events = [];
  }
}

// ===== 便利な関数エクスポート =====

/**
 * 簡単な基本マッチ実行
 */
export function simulateBasicMatch(config: MatchConfig): MatchResult {
  const engine = new UnifiedMatchEngine({ ...config, mode: 'basic' });
  return engine.simulateMatch() as MatchResult;
}

/**
 * 高度マッチ実行
 */
export function simulateAdvancedMatch(config: MatchConfig): MatchResult {
  const engine = new UnifiedMatchEngine({ ...config, mode: 'advanced' });
  return engine.simulateMatch() as MatchResult;
}

/**
 * インタラクティブマッチ実行
 */
export async function simulateInteractiveMatch(
  config: MatchConfig,
  onEvent?: (event: MatchEvent) => void,
  onChoiceRequest?: (choices: MatchChoice[], situation: MatchSituation) => Promise<UserChoice>
): Promise<MatchResult> {
  const engine = new UnifiedMatchEngine({ ...config, mode: 'interactive' });
  
  if (onEvent) {
    engine.setEventListener(onEvent);
  }
  
  if (onChoiceRequest) {
    engine.setChoiceRequestListener(onChoiceRequest);
  }
  
  return await engine.simulateMatch();
}

/**
 * デバッグマッチ実行
 */
export function simulateDebugMatch(config: MatchConfig): MatchResult {
  const engine = new UnifiedMatchEngine({ ...config, mode: 'debug' });
  return engine.simulateMatch() as MatchResult;
}