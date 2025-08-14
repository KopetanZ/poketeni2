/**
 * 統合マッチシステム - ベースエンジン
 * 全マッチモードで共通使用される基本計算ロジック
 */

import { 
  EnhancedPlayer, 
  MatchContext, 
  MatchPoint, 
  GameResult, 
  SetResult, 
  MatchResult,
  PerformanceStats,
  TacticType,
  MatchConfig
} from './types';

export class BaseMatchEngine {
  
  // ===== 基本能力値計算 =====
  
  /**
   * プレイヤーの基本スキル値を取得（装備効果含む）
   */
  static getBaseSkill(player: EnhancedPlayer, skillType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental'): number {
    let baseValue = 0;
    
    switch (skillType) {
      case 'serve':
        baseValue = player.serve_skill;
        break;
      case 'return':
        baseValue = player.return_skill;
        break;
      case 'volley':
        baseValue = player.volley_skill;
        break;
      case 'stroke':
        baseValue = player.stroke_skill;
        break;
      case 'mental':
        baseValue = player.mental;
        break;
    }
    
    // 装備効果を適用
    if (player.equipment_effects) {
      switch (skillType) {
        case 'serve':
          baseValue += player.equipment_effects.serve_skill_bonus;
          break;
        case 'return':
          baseValue += player.equipment_effects.return_skill_bonus;
          break;
        case 'volley':
          baseValue += player.equipment_effects.volley_skill_bonus;
          break;
        case 'stroke':
          baseValue += player.equipment_effects.stroke_skill_bonus;
          break;
        case 'mental':
          baseValue += player.equipment_effects.mental_bonus;
          break;
      }
    }
    
    return Math.max(1, Math.min(100, baseValue));
  }
  
  /**
   * 戦術によるスキル修正を計算
   */
  static getTacticModifier(tactic: TacticType | undefined, skillType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental'): number {
    if (!tactic) return 0;
    
    const tacticBonuses: Record<TacticType, Record<string, number>> = {
      aggressive: { serve: 15, volley: 10, return: -5, stroke: 0, mental: 5 },
      defensive: { serve: -5, volley: -5, return: 15, stroke: 10, mental: 5 },
      balanced: { serve: 5, volley: 5, return: 5, stroke: 5, mental: 5 },
      technical: { serve: 5, volley: 15, return: 5, stroke: 5, mental: 10 },
      power: { serve: 20, volley: 0, return: 0, stroke: 15, mental: -5 },
      counter: { serve: -10, volley: 0, return: 20, stroke: 5, mental: 15 }
    };
    
    return tacticBonuses[tactic][skillType] || 0;
  }
  
  /**
   * 環境による影響を計算
   */
  static getEnvironmentModifier(context: MatchContext, skillType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental'): number {
    let modifier = 0;
    
    // 天候の影響
    switch (context.weather) {
      case 'rainy':
        if (skillType === 'serve') modifier -= 10;
        if (skillType === 'volley') modifier -= 5;
        break;
      case 'windy':
        if (skillType === 'serve') modifier -= 5;
        if (skillType === 'stroke') modifier -= 5;
        break;
      case 'sunny':
        if (skillType === 'serve') modifier += 5;
        break;
    }
    
    // コート面の影響
    switch (context.court_surface) {
      case 'clay':
        if (skillType === 'stroke') modifier += 5;
        if (skillType === 'volley') modifier -= 5;
        break;
      case 'grass':
        if (skillType === 'serve') modifier += 5;
        if (skillType === 'volley') modifier += 10;
        if (skillType === 'return') modifier -= 5;
        break;
      case 'hard':
        // バランス良し
        break;
      case 'indoor':
        if (skillType === 'mental') modifier += 5;
        break;
    }
    
    // プレッシャーの影響
    const pressureEffect = Math.floor(context.pressure_level / 20);
    if (skillType === 'mental') {
      modifier -= pressureEffect;
    }
    
    return modifier;
  }
  
  /**
   * 最終スキル値を計算（全修正込み）
   */
  static calculateFinalSkill(
    player: EnhancedPlayer, 
    skillType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): number {
    const baseSkill = this.getBaseSkill(player, skillType);
    const tacticModifier = this.getTacticModifier(player.tactic, skillType);
    const environmentModifier = this.getEnvironmentModifier(context, skillType);
    
    let finalSkill = baseSkill + tacticModifier + environmentModifier;
    
    // 現在の体力・メンタル状態の影響
    const staminaFactor = (player.current_stamina || 100) / 100;
    const mentalFactor = (player.current_mental || player.mental) / 100;
    
    finalSkill *= (staminaFactor * 0.3 + mentalFactor * 0.2 + 0.5);
    
    return Math.max(1, Math.min(100, Math.round(finalSkill)));
  }
  
  // ===== ポイント計算 =====
  
  /**
   * 単一ポイントの勝敗を決定
   */
  static simulatePoint(
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): MatchPoint {
    const homeSkill = this.calculateFinalSkill(homePlayer, pointType, context);
    const awaySkill = this.calculateFinalSkill(awayPlayer, pointType, context);
    
    const homeRoll = Math.random() * 100;
    const awayRoll = Math.random() * 100;
    
    const homeTotal = homeSkill + homeRoll;
    const awayTotal = awaySkill + awayRoll;
    
    const winner = homeTotal > awayTotal ? 'home' : 'away';
    
    const point: MatchPoint = {
      type: pointType,
      home_skill: homeSkill,
      away_skill: awaySkill,
      home_roll: homeRoll,
      away_roll: awayRoll,
      winner,
      description: this.generatePointDescription(pointType, winner, homePlayer, awayPlayer)
    };
    
    return point;
  }
  
  /**
   * ポイントの説明文を生成
   */
  static generatePointDescription(
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    winner: 'home' | 'away',
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer
  ): string {
    const winnerName = winner === 'home' ? homePlayer.pokemon_name : awayPlayer.pokemon_name;
    
    const descriptions: Record<string, string[]> = {
      serve: [
        `${winnerName}の強烈なサーブが決まった！`,
        `${winnerName}が絶妙なコースにサーブを打ち込む！`,
        `${winnerName}のサービスエースで得点！`
      ],
      return: [
        `${winnerName}が見事なリターンを決める！`,
        `${winnerName}のカウンター攻撃が成功！`,
        `${winnerName}が相手のサーブを完璧に返した！`
      ],
      volley: [
        `${winnerName}がネット前で決定的なボレー！`,
        `${winnerName}の鋭いボレーが炸裂！`,
        `${winnerName}がネットプレーで主導権を握る！`
      ],
      stroke: [
        `${winnerName}の鋭いストロークが決まった！`,
        `${winnerName}がベースラインから攻撃を仕掛ける！`,
        `${winnerName}の粘り強いストロークで勝利！`
      ],
      mental: [
        `${winnerName}が集中力で相手を上回る！`,
        `${winnerName}の精神力が勝敗を分けた！`,
        `${winnerName}がプレッシャーに負けずに得点！`
      ]
    };
    
    const typeDescriptions = descriptions[pointType] || descriptions.stroke;
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }
  
  // ===== ゲーム・セット・マッチシミュレーション =====
  
  /**
   * 1ゲームをシミュレート（6ポイント先取）
   */
  static simulateGame(
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    context: MatchContext
  ): GameResult {
    const points: MatchPoint[] = [];
    let homeScore = 0;
    let awayScore = 0;
    const targetScore = 6;
    
    while (homeScore < targetScore && awayScore < targetScore) {
      // ランダムなポイントタイプを選択
      const pointTypes: ('serve' | 'return' | 'volley' | 'stroke' | 'mental')[] = 
        ['serve', 'return', 'volley', 'stroke', 'mental'];
      const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)];
      
      const point = this.simulatePoint(homePlayer, awayPlayer, pointType, context);
      points.push(point);
      
      if (point.winner === 'home') {
        homeScore++;
      } else {
        awayScore++;
      }
      
      // ラリー数更新
      context.rally_count++;
    }
    
    return {
      home_score: homeScore,
      away_score: awayScore,
      winner: homeScore > awayScore ? 'home' : 'away',
      points,
      duration_minutes: Math.round(points.length * 1.5) // 1ポイント1.5分の概算
    };
  }
  
  /**
   * 1セットをシミュレート（6ゲーム先取）
   */
  static simulateSet(
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    context: MatchContext
  ): SetResult {
    const games: GameResult[] = [];
    let homeGames = 0;
    let awayGames = 0;
    const targetGames = 6;
    
    while (homeGames < targetGames && awayGames < targetGames) {
      const game = this.simulateGame(homePlayer, awayPlayer, context);
      games.push(game);
      
      if (game.winner === 'home') {
        homeGames++;
      } else {
        awayGames++;
      }
      
      context.game_score = { home: homeGames, away: awayGames };
    }
    
    // パフォーマンス統計を計算
    const allPoints = games.flatMap(g => g.points);
    const homePerformance = this.calculatePerformance(allPoints, 'home');
    const awayPerformance = this.calculatePerformance(allPoints, 'away');
    
    return {
      home_score: homeGames,
      away_score: awayGames,
      winner: homeGames > awayGames ? 'home' : 'away',
      points: allPoints,
      duration_minutes: games.reduce((sum, g) => sum + (g.duration_minutes || 0), 0),
      games,
      home_performance: homePerformance,
      away_performance: awayPerformance
    };
  }
  
  /**
   * フルマッチをシミュレート
   */
  static simulateMatch(config: MatchConfig): MatchResult {
    const context: MatchContext = {
      weather: config.environment?.weather || 'sunny',
      court_surface: config.environment?.court_surface || 'hard',
      pressure_level: config.environment?.pressure_level || 50,
      tournament_level: config.environment?.tournament_level || 'practice',
      rally_count: 0,
      set_score: { home: 0, away: 0 },
      game_score: { home: 0, away: 0 }
    };
    
    // 戦術を設定
    const homePlayer = { ...config.homePlayer, tactic: config.homeTactic };
    const awayPlayer = { ...config.awayPlayer, tactic: config.awayTactic };
    
    const sets: SetResult[] = [];
    let homeSets = 0;
    let awaySets = 0;
    
    const targetSets = config.format === 'best_of_3' ? 2 : 1;
    
    while (homeSets < targetSets && awaySets < targetSets) {
      const set = this.simulateSet(homePlayer, awayPlayer, context);
      sets.push(set);
      
      if (set.winner === 'home') {
        homeSets++;
      } else {
        awaySets++;
      }
      
      context.set_score = { home: homeSets, away: awaySets };
    }
    
    // 総合パフォーマンス統計
    const allPoints = sets.flatMap(s => s.points);
    const totalHomePerformance = this.calculatePerformance(allPoints, 'home');
    const totalAwayPerformance = this.calculatePerformance(allPoints, 'away');
    
    return {
      winner: homeSets > awaySets ? 'home' : 'away',
      sets,
      final_score: { home: homeSets, away: awaySets },
      match_duration_minutes: sets.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      mvp: totalHomePerformance.total_points > totalAwayPerformance.total_points ? 'home' : 'away',
      total_home_performance: totalHomePerformance,
      total_away_performance: totalAwayPerformance
    };
  }
  
  /**
   * パフォーマンス統計を計算
   */
  static calculatePerformance(points: MatchPoint[], side: 'home' | 'away'): PerformanceStats {
    const sidePoints = points.filter(p => p.winner === side);
    
    const stats: PerformanceStats = {
      serve_success: sidePoints.filter(p => p.type === 'serve').length,
      return_success: sidePoints.filter(p => p.type === 'return').length,
      volley_success: sidePoints.filter(p => p.type === 'volley').length,
      stroke_success: sidePoints.filter(p => p.type === 'stroke').length,
      mental_success: sidePoints.filter(p => p.type === 'mental').length,
      total_points: sidePoints.length,
      critical_hits: sidePoints.filter(p => p.is_critical).length,
      errors: points.filter(p => p.winner !== side && p.is_error).length,
      winner_shots: sidePoints.filter(p => !p.is_error).length
    };
    
    return stats;
  }
}