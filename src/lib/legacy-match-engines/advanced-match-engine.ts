// 高度な試合シミュレーションエンジン (個体値・特性・戦術対応)

import { Player } from '@/types/game';
import { PokemonStats } from '@/types/pokemon-stats';
import { getAbilityData, calculateAbilityBonus } from '../pokemon-abilities-data';
import { PokemonStatsCalculator } from '../pokemon-stats-calculator';
import { SpecialAbility, SpecialAbilityCalculator, TENNIS_SPECIAL_ABILITIES } from '@/types/special-abilities';

// 戦術システム
export type TacticType = 
  | 'aggressive' // アグレッシブ: サーブ・ボレー重視
  | 'defensive' // 守備的: リターン・ストローク重視  
  | 'balanced' // バランス: 全能力均等
  | 'technical' // 技巧的: ボレー・メンタル重視
  | 'power' // パワー型: サーブ・ストローク重視
  | 'counter'; // カウンター: リターン・メンタル重視

export interface MatchContext {
  weather: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  court_surface: 'hard' | 'clay' | 'grass' | 'indoor';
  pressure_level: number; // 0-100, プレッシャーレベル
  rally_count: number; // 現在のラリー数
  set_score: { home: number; away: number };
  game_score: { home: number; away: number };
  // 緊急指示システム追加
  emergency_instruction?: {
    type: 'aggressive' | 'defensive' | 'balanced' | 'technical' | 'power' | 'counter';
    effect_duration: number; // 効果持続ポイント数
    remaining_effects: number; // 残り効果ポイント数
    bonus_multiplier: number; // 能力値ボーナス倍率
    critical_bonus: number; // クリティカルヒット確率ボーナス
    pressure_reduction: number; // プレッシャー軽減効果
  };
}

export interface EnhancedMatchPoint {
  type: 'serve' | 'return' | 'volley' | 'stroke' | 'mental';
  home_base_skill: number;
  away_base_skill: number;
  home_ability_bonus: number;
  away_ability_bonus: number;
  home_special_ability_bonus: number;
  away_special_ability_bonus: number;
  home_tactic_bonus: number;
  away_tactic_bonus: number;
  home_condition_modifier: number;
  away_condition_modifier: number;
  home_final_skill: number;
  away_final_skill: number;
  home_roll: number;
  away_roll: number;
  winner: 'home' | 'away';
  margin: number; // 勝利マージン
  critical_hit: boolean; // クリティカルヒット
  ability_triggered: string | null; // 発動した特性
  description: string;
  context: MatchContext;
}

export interface AdvancedSetResult {
  home_score: number;
  away_score: number;
  winner: 'home' | 'away';
  match_log: EnhancedMatchPoint[];
  home_statistics: MatchStatistics;
  away_statistics: MatchStatistics;
  turning_points: TurningPoint[]; // 試合のターニングポイント
}

export interface MatchStatistics {
  total_points_won: number;
  service_points_won: number;
  return_points_won: number;
  net_points_won: number;
  baseline_points_won: number;
  pressure_points_won: number;
  ability_activations: number;
  critical_hits: number;
  longest_rally: number;
  average_skill: number;
}

export interface TurningPoint {
  point_index: number;
  type: 'set_point' | 'break_point' | 'ability_activation' | 'critical_moment';
  description: string;
  importance: number; // 1-10
}

export class AdvancedMatchEngine {
  // 戦術による能力値修正
  private static getTacticModifiers(tactic: TacticType): Record<string, number> {
    switch (tactic) {
      case 'aggressive':
        return { serve_skill: 1.3, volley_skill: 1.3, return_skill: 0.8, stroke_skill: 0.8 };
      case 'defensive':
        return { return_skill: 1.3, stroke_skill: 1.3, serve_skill: 0.8, volley_skill: 0.8 };
      case 'balanced':
        return { serve_skill: 1.0, return_skill: 1.0, volley_skill: 1.0, stroke_skill: 1.0 };
      case 'technical':
        return { volley_skill: 1.4, mental: 1.2, serve_skill: 0.9, stroke_skill: 0.9 };
      case 'power':
        return { serve_skill: 1.4, stroke_skill: 1.2, volley_skill: 0.9, mental: 0.9 };
      case 'counter':
        return { return_skill: 1.4, mental: 1.3, serve_skill: 0.8, volley_skill: 0.8 };
      default:
        return { serve_skill: 1.0, return_skill: 1.0, volley_skill: 1.0, stroke_skill: 1.0 };
    }
  }

  // コンディションによる修正
  private static getConditionModifier(condition: string): number {
    switch (condition) {
      case 'excellent': return 1.2;
      case 'good': return 1.1;
      case 'normal': return 1.0;
      case 'poor': return 0.9;
      case 'terrible': return 0.7;
      default: return 1.0;
    }
  }

  // 天候・コート効果
  private static getEnvironmentModifier(
    weather: string, 
    surface: string, 
    skillType: string
  ): number {
    let modifier = 1.0;

    // 天候効果
    switch (weather) {
      case 'sunny':
        if (skillType === 'serve') modifier *= 1.1;
        break;
      case 'windy':
        if (skillType === 'volley') modifier *= 0.9;
        if (skillType === 'serve') modifier *= 0.95;
        break;
      case 'rainy':
        if (skillType === 'stroke') modifier *= 0.9;
        if (skillType === 'mental') modifier *= 0.95;
        break;
    }

    // コート効果
    switch (surface) {
      case 'clay':
        if (skillType === 'stroke') modifier *= 1.1;
        if (skillType === 'serve') modifier *= 0.95;
        break;
      case 'grass':
        if (skillType === 'volley') modifier *= 1.1;
        if (skillType === 'return') modifier *= 0.95;
        break;
      case 'hard':
        // ニュートラル
        break;
      case 'indoor':
        if (skillType === 'mental') modifier *= 1.05;
        break;
    }

    return modifier;
  }

  // 緊急指示適用メソッド
  public static applyEmergencyInstruction(
    context: MatchContext,
    instructionType: TacticType,
    duration: number = 2
  ): void {
    const instructionEffects = {
      aggressive: {
        bonus_multiplier: 1.3,
        critical_bonus: 15,
        pressure_reduction: 5
      },
      defensive: {
        bonus_multiplier: 1.2,
        critical_bonus: 10,
        pressure_reduction: 8
      },
      balanced: {
        bonus_multiplier: 1.15,
        critical_bonus: 8,
        pressure_reduction: 6
      },
      technical: {
        bonus_multiplier: 1.25,
        critical_bonus: 12,
        pressure_reduction: 7
      },
      power: {
        bonus_multiplier: 1.35,
        critical_bonus: 18,
        pressure_reduction: 4
      },
      counter: {
        bonus_multiplier: 1.2,
        critical_bonus: 10,
        pressure_reduction: 9
      }
    };

    const effects = instructionEffects[instructionType];
    
    context.emergency_instruction = {
      type: instructionType,
      effect_duration: duration,
      remaining_effects: duration,
      bonus_multiplier: effects.bonus_multiplier,
      critical_bonus: effects.critical_bonus,
      pressure_reduction: effects.pressure_reduction
    };
  }

  // 高度な1ポイントシミュレーション
  private static simulateEnhancedPoint(
    homePlayer: Player,
    awayPlayer: Player,
    homeTactic: TacticType,
    awayTactic: TacticType,
    context: MatchContext,
    matchLog: EnhancedMatchPoint[]
  ): 'home' | 'away' {
    // ラリータイプをコンテキストに応じて決定
    const rallyType = this.determineRallyType(context, homeTactic, awayTactic);
    
    // 基本スキル値取得
    const homeBaseSkill = this.getSkillValue(homePlayer, rallyType);
    const awayBaseSkill = this.getSkillValue(awayPlayer, rallyType);

    // 特性ボーナス計算
    const homeAbilityBonus = this.calculateAbilityBonus(homePlayer, rallyType, context);
    const awayAbilityBonus = this.calculateAbilityBonus(awayPlayer, rallyType, context);

    // 特殊能力ボーナス計算
    const homeSpecialAbilityBonus = this.calculateSpecialAbilityBonus(homePlayer, rallyType, context);
    const awaySpecialAbilityBonus = this.calculateSpecialAbilityBonus(awayPlayer, rallyType, context);

    // 戦術ボーナス
    const homeTacticModifiers = this.getTacticModifiers(homeTactic);
    const awayTacticModifiers = this.getTacticModifiers(awayTactic);
    const homeTacticBonus = (homeTacticModifiers[`${rallyType}_skill`] || 1.0) - 1.0;
    const awayTacticBonus = (awayTacticModifiers[`${rallyType}_skill`] || 1.0) - 1.0;

    // コンディション修正
    const homeConditionMod = this.getConditionModifier(homePlayer.condition);
    const awayConditionMod = this.getConditionModifier(awayPlayer.condition);

    // 環境修正
    const homeEnvMod = this.getEnvironmentModifier(context.weather, context.court_surface, rallyType);
    const awayEnvMod = this.getEnvironmentModifier(context.weather, context.court_surface, rallyType);

    // 緊急指示効果適用
    let homeFinalSkill = Math.floor(
      (homeBaseSkill + homeAbilityBonus + homeSpecialAbilityBonus) * 
      (1 + homeTacticBonus) * 
      homeConditionMod * 
      homeEnvMod
    );
    
    let awayFinalSkill = Math.floor(
      (awayBaseSkill + awayAbilityBonus + awaySpecialAbilityBonus) * 
      (1 + awayTacticBonus) * 
      awayConditionMod * 
      awayEnvMod
    );

    // 緊急指示効果適用
    if (context.emergency_instruction) {
      const instruction = context.emergency_instruction;
      if (instruction.remaining_effects > 0) {
        homeFinalSkill *= instruction.bonus_multiplier;
        awayFinalSkill *= instruction.bonus_multiplier;
        if (instruction.critical_bonus > 0) {
          homeFinalSkill += instruction.critical_bonus;
          awayFinalSkill += instruction.critical_bonus;
        }
        if (instruction.pressure_reduction > 0) {
          context.pressure_level = Math.max(0, context.pressure_level - instruction.pressure_reduction);
        }
        instruction.remaining_effects--;
      }
    }

    // ランダム要素（プレッシャーに応じて変動）
    const pressureFactor = Math.max(0.5, 1 - (context.pressure_level / 200));
    const homeRoll = Math.floor(Math.random() * 20 * pressureFactor + Math.random() * 10);
    const awayRoll = Math.floor(Math.random() * 20 * pressureFactor + Math.random() * 10);

    // 最終判定
    const homeTotal = homeFinalSkill + homeRoll;
    const awayTotal = awayFinalSkill + awayRoll;
    const winner = homeTotal > awayTotal ? 'home' : 'away';
    const margin = Math.abs(homeTotal - awayTotal);

    // クリティカルヒット判定（特殊能力効果適用）
    const criticalThreshold = this.getCriticalHitRate(winner === 'home' ? homePlayer : awayPlayer, context);
    const criticalHit = Math.random() < criticalThreshold;

    // 特性発動判定
    const abilityTriggered = this.checkAbilityTrigger(
      winner === 'home' ? homePlayer : awayPlayer, 
      rallyType, 
      context, 
      criticalHit
    );

    // マッチポイント記録
    const matchPoint: EnhancedMatchPoint = {
      type: rallyType,
      home_base_skill: homeBaseSkill,
      away_base_skill: awayBaseSkill,
      home_ability_bonus: homeAbilityBonus,
      away_ability_bonus: awayAbilityBonus,
      home_special_ability_bonus: homeSpecialAbilityBonus,
      away_special_ability_bonus: awaySpecialAbilityBonus,
      home_tactic_bonus: homeTacticBonus,
      away_tactic_bonus: awayTacticBonus,
      home_condition_modifier: homeConditionMod,
      away_condition_modifier: awayConditionMod,
      home_final_skill: homeFinalSkill,
      away_final_skill: awayFinalSkill,
      home_roll: homeRoll,
      away_roll: awayRoll,
      winner,
      margin,
      critical_hit: criticalHit,
      ability_triggered: abilityTriggered,
      description: this.generateEnhancedDescription(
        rallyType, winner, homePlayer, awayPlayer, criticalHit, abilityTriggered, margin
      ),
      context: { ...context }
    };

    matchLog.push(matchPoint);
    
    // コンテキスト更新
    context.rally_count++;
    if (criticalHit) {
      context.pressure_level = Math.min(100, context.pressure_level + 10);
    }

    // 緊急指示効果の更新
    if (context.emergency_instruction && context.emergency_instruction.remaining_effects <= 0) {
      // 効果が切れた場合
      context.emergency_instruction = undefined;
    }

    return winner;
  }

  // ラリータイプ決定（戦術とコンテキストに基づく）
  private static determineRallyType(
    context: MatchContext, 
    homeTactic: TacticType, 
    awayTactic: TacticType
  ): 'serve' | 'return' | 'volley' | 'stroke' | 'mental' {
    let weights = {
      serve: 0.2,
      return: 0.2,
      volley: 0.15,
      stroke: 0.3,
      mental: 0.15
    };

    // 戦術による重み調整
    if (homeTactic === 'aggressive' || awayTactic === 'aggressive') {
      weights.serve += 0.1;
      weights.volley += 0.1;
      weights.stroke -= 0.1;
      weights.return -= 0.1;
    }

    if (homeTactic === 'defensive' || awayTactic === 'defensive') {
      weights.return += 0.1;
      weights.stroke += 0.1;
      weights.serve -= 0.1;
      weights.volley -= 0.1;
    }

    // プレッシャーが高い場合はメンタルの重要性増加
    if (context.pressure_level > 70) {
      weights.mental += 0.15;
      weights.serve -= 0.05;
      weights.stroke -= 0.05;
      weights.volley -= 0.05;
    }

    // 重み付き抽選
    const random = Math.random();
    let cumulative = 0;

    for (const [type, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return type as any;
      }
    }

    return 'stroke';
  }

  // スキル値取得（個体値システム対応）
  private static getSkillValue(player: Player, skillType: string): number {
    if (player.pokemon_stats) {
      // 新システム: 個体値による正確な能力値
      switch (skillType) {
        case 'serve': return player.pokemon_stats.final_stats.serve_skill;
        case 'return': return player.pokemon_stats.final_stats.return_skill;
        case 'volley': return player.pokemon_stats.final_stats.volley_skill;
        case 'stroke': return player.pokemon_stats.final_stats.stroke_skill;
        case 'mental': return player.pokemon_stats.final_stats.mental;
        case 'stamina': return player.pokemon_stats.final_stats.stamina;
      }
    } else {
      // 旧システムとの互換性
      switch (skillType) {
        case 'serve': return player.serve_skill;
        case 'return': return player.return_skill;
        case 'volley': return player.volley_skill;
        case 'stroke': return player.stroke_skill;
        case 'mental': return player.mental;
        case 'stamina': return player.stamina;
      }
    }
    return 50;
  }

  // 特性ボーナス計算
  private static calculateAbilityBonus(player: Player, skillType: string, context: MatchContext): number {
    if (!player.pokemon_stats?.ability) return 0;

    const abilityData = getAbilityData(player.pokemon_stats.ability);
    if (!abilityData) return 0;

    const effect = abilityData.tennis_effect;
    let bonus = 0;

    // 直接的なスキルボーナス
    switch (skillType) {
      case 'serve': bonus = effect.serve_boost || 0; break;
      case 'return': bonus = effect.return_boost || 0; break;
      case 'volley': bonus = effect.volley_boost || 0; break;
      case 'stroke': bonus = effect.stroke_boost || 0; break;
      case 'mental': bonus = effect.mental_boost || 0; break;
      case 'stamina': bonus = effect.stamina_boost || 0; break;
    }

    // 特殊発動条件
    if (effect.special_trigger) {
      switch (effect.special_trigger) {
        case 'on_critical':
          if (context.pressure_level > 80) bonus *= 1.5;
          break;
        case 'on_serve':
          if (skillType === 'serve') bonus *= 1.3;
          break;
        case 'on_return':
          if (skillType === 'return') bonus *= 1.3;
          break;
      }
    }

    return Math.floor(bonus);
  }

  // 特殊能力ボーナス計算（新システム）
  private static calculateSpecialAbilityBonus(player: Player, skillType: string, context: MatchContext): number {
    // 安全性チェック
    if (!player || !player.special_abilities || !Array.isArray(player.special_abilities) || player.special_abilities.length === 0) {
      return 0;
    }

    // 状況判定
    const situation = {
      isBehind: context.set_score.home < context.set_score.away || 
                (context.set_score.home === context.set_score.away && context.game_score.home < context.game_score.away),
      isAhead: context.set_score.home > context.set_score.away ||
               (context.set_score.home === context.set_score.away && context.game_score.home > context.game_score.away),
      isTiebreak: context.set_score.home === 6 && context.set_score.away === 6,
      isMatchPoint: (context.set_score.home >= 5 && context.set_score.home >= context.set_score.away + 1) ||
                    (context.set_score.away >= 5 && context.set_score.away >= context.set_score.home + 1),
      opponentType: Math.random() > 0.5 ? 'aggressive' : 'defensive' as 'aggressive' | 'defensive',
      opponentHand: Math.random() > 0.5 ? 'left' : 'right' as 'left' | 'right'
    };

    // スキルタイプに応じたボーナス計算
    const skillMap: { [key: string]: keyof import('@/types/special-abilities').EnhancedSpecialAbilityEffects } = {
      'serve': 'serveBoost',
      'return': 'returnBoost', 
      'volley': 'volleyBoost',
      'stroke': 'strokeBoost',
      'mental': 'mentalBoost',
      'stamina': 'staminaBoost'
    };

    const effectKey = skillMap[skillType];
    if (!effectKey) return 0;

    return SpecialAbilityCalculator.calculateStatBonus(
      player.special_abilities,
      effectKey,
      situation
    );
  }

  // クリティカルヒット率（特殊能力対応）
  private static getCriticalHitRate(player: Player, context?: MatchContext): number {
    let baseRate = 0.05; // 5%基本確率

    // 安全性チェック
    if (!player) {
      return baseRate;
    }

    if (player.pokemon_stats?.ability) {
      const abilityData = getAbilityData(player.pokemon_stats.ability);
      if (abilityData?.tennis_effect.critical_rate) {
        baseRate += abilityData.tennis_effect.critical_rate;
      }
    }

    // 特殊能力からのクリティカル率ボーナス
    if (player.special_abilities && Array.isArray(player.special_abilities) && player.special_abilities.length > 0) {
      const criticalRate = SpecialAbilityCalculator.calculateSpecialEffect(
        player.special_abilities,
        'criticalHitRate'
      );
      baseRate += criticalRate / 100; // パーセントから比率に変換
    }

    // レベルによるボーナス
    baseRate += (player.level - 1) * 0.005;

    return Math.min(baseRate, 0.35); // 最大35%（特殊能力により上限アップ）
  }

  // 特性発動チェック
  private static checkAbilityTrigger(
    player: Player, 
    skillType: string, 
    context: MatchContext,
    criticalHit: boolean
  ): string | null {
    if (!player.pokemon_stats?.ability) return null;

    const abilityData = getAbilityData(player.pokemon_stats.ability);
    if (!abilityData) return null;

    const effect = abilityData.tennis_effect;
    
    // 発動条件チェック
    if (effect.special_trigger === 'on_critical' && criticalHit) {
      return abilityData.name;
    }
    
    if (effect.special_trigger === 'on_serve' && skillType === 'serve') {
      return abilityData.name;
    }
    
    if (effect.special_trigger === 'on_return' && skillType === 'return') {
      return abilityData.name;
    }
    
    if (effect.special_trigger === 'passive' && Math.random() < 0.3) {
      return abilityData.name;
    }

    return null;
  }

  // 詳細説明文生成
  private static generateEnhancedDescription(
    type: string,
    winner: 'home' | 'away',
    homePlayer: Player,
    awayPlayer: Player,
    criticalHit: boolean,
    abilityTriggered: string | null,
    margin: number
  ): string {
    const winnerName = winner === 'home' ? homePlayer.pokemon_name : awayPlayer.pokemon_name;
    const intensity = margin > 15 ? '圧倒的な' : margin > 8 ? '見事な' : '辛勝の';
    
    let description = '';

    // 基本説明
    switch (type) {
      case 'serve':
        description = `${winnerName}の${intensity}サーブ`;
        break;
      case 'return':
        description = `${winnerName}の${intensity}リターン`;
        break;
      case 'volley':
        description = `${winnerName}の${intensity}ネットプレー`;
        break;
      case 'stroke':
        description = `${winnerName}の${intensity}ストローク`;
        break;
      case 'mental':
        description = `${winnerName}の${intensity}集中力`;
        break;
    }

    // クリティカルヒット
    if (criticalHit) {
      description += '⚡(会心の一撃!)';
    }

    // 特性発動
    if (abilityTriggered) {
      description += `✨《${abilityTriggered}》発動!`;
    }

    return description;
  }

  // 高度なセットシミュレーション
  static simulateAdvancedSet(
    homePlayer: Player,
    awayPlayer: Player,
    homeTactic: TacticType = 'balanced',
    awayTactic: TacticType = 'balanced',
    environment?: Partial<MatchContext>
  ): AdvancedSetResult {
    const matchLog: EnhancedMatchPoint[] = [];
    const turningPoints: TurningPoint[] = [];
    
    // 初期コンテキスト
    const context: MatchContext = {
      weather: environment?.weather || 'sunny',
      court_surface: environment?.court_surface || 'hard',
      pressure_level: environment?.pressure_level || 20,
      rally_count: 0,
      set_score: { home: 0, away: 0 },
      game_score: { home: 0, away: 0 }
    };

    let homeScore = 0;
    let awayScore = 0;

    // 統計初期化
    const homeStats: MatchStatistics = {
      total_points_won: 0,
      service_points_won: 0,
      return_points_won: 0,
      net_points_won: 0,
      baseline_points_won: 0,
      pressure_points_won: 0,
      ability_activations: 0,
      critical_hits: 0,
      longest_rally: 0,
      average_skill: 0
    };

    const awayStats: MatchStatistics = { ...homeStats };

    // 6ゲーム先取
    while (homeScore < 6 && awayScore < 6) {
      context.set_score = { home: homeScore, away: awayScore };
      
      const gameWinner = this.simulateAdvancedGame(
        homePlayer, awayPlayer, homeTactic, awayTactic, 
        context, matchLog, homeStats, awayStats, turningPoints
      );
      
      if (gameWinner === 'home') {
        homeScore++;
      } else {
        awayScore++;
      }

      // プレッシャーレベル調整
      const scoreDiff = Math.abs(homeScore - awayScore);
      if (scoreDiff >= 2) {
        context.pressure_level = Math.min(context.pressure_level + 5, 100);
      }
    }

    // タイブレーク
    if (homeScore === 6 && awayScore === 6) {
      context.pressure_level = Math.min(context.pressure_level + 20, 100);
      const tiebreakWinner = this.simulateAdvancedTiebreak(
        homePlayer, awayPlayer, homeTactic, awayTactic,
        context, matchLog, homeStats, awayStats, turningPoints
      );
      
      if (tiebreakWinner === 'home') {
        homeScore = 7;
      } else {
        awayScore = 7;
      }
    }

    return {
      home_score: homeScore,
      away_score: awayScore,
      winner: homeScore > awayScore ? 'home' : 'away',
      match_log: matchLog,
      home_statistics: homeStats,
      away_statistics: awayStats,
      turning_points: turningPoints
    };
  }

  // 高度なゲームシミュレーション
  private static simulateAdvancedGame(
    homePlayer: Player,
    awayPlayer: Player,
    homeTactic: TacticType,
    awayTactic: TacticType,
    context: MatchContext,
    matchLog: EnhancedMatchPoint[],
    homeStats: MatchStatistics,
    awayStats: MatchStatistics,
    turningPoints: TurningPoint[]
  ): 'home' | 'away' {
    let homePoints = 0;
    let awayPoints = 0;
    
    while (homePoints < 4 && awayPoints < 4 || Math.abs(homePoints - awayPoints) < 2) {
      context.game_score = { home: homePoints, away: awayPoints };
      
      const pointWinner = this.simulateEnhancedPoint(
        homePlayer, awayPlayer, homeTactic, awayTactic, context, matchLog
      );
      
      const lastPoint = matchLog[matchLog.length - 1];
      
      // 統計更新
      if (pointWinner === 'home') {
        homePoints++;
        homeStats.total_points_won++;
        if (lastPoint.critical_hit) homeStats.critical_hits++;
        if (lastPoint.ability_triggered) homeStats.ability_activations++;
      } else {
        awayPoints++;
        awayStats.total_points_won++;
        if (lastPoint.critical_hit) awayStats.critical_hits++;
        if (lastPoint.ability_triggered) awayStats.ability_activations++;
      }

      // ターニングポイント検出
      if ((homePoints >= 3 && awayPoints >= 3) || lastPoint.critical_hit || lastPoint.ability_triggered) {
        turningPoints.push({
          point_index: matchLog.length - 1,
          type: lastPoint.critical_hit ? 'critical_moment' : 
                lastPoint.ability_triggered ? 'ability_activation' : 'break_point',
          description: `重要な局面: ${lastPoint.description}`,
          importance: Math.min(10, Math.floor(context.pressure_level / 10) + (lastPoint.critical_hit ? 3 : 0))
        });
      }
    }

    return homePoints > awayPoints ? 'home' : 'away';
  }

  // 高度なタイブレーク
  private static simulateAdvancedTiebreak(
    homePlayer: Player,
    awayPlayer: Player, 
    homeTactic: TacticType,
    awayTactic: TacticType,
    context: MatchContext,
    matchLog: EnhancedMatchPoint[],
    homeStats: MatchStatistics,
    awayStats: MatchStatistics,
    turningPoints: TurningPoint[]
  ): 'home' | 'away' {
    let homePoints = 0;
    let awayPoints = 0;

    while (homePoints < 7 && awayPoints < 7 || Math.abs(homePoints - awayPoints) < 2) {
      const pointWinner = this.simulateEnhancedPoint(
        homePlayer, awayPlayer, homeTactic, awayTactic, context, matchLog
      );
      
      if (pointWinner === 'home') {
        homePoints++;
        homeStats.total_points_won++;
      } else {
        awayPoints++;
        awayStats.total_points_won++;
      }

      // タイブレークでは常に高プレッシャー
      context.pressure_level = Math.max(85, context.pressure_level);
    }

    return homePoints > awayPoints ? 'home' : 'away';
  }
}

// CPU対戦相手生成（個体値システム対応）
export function generateAdvancedCPU(difficulty: 'easy' | 'normal' | 'hard' | 'extreme'): Player {
  // ランダムなポケモン選択
  const cpuPokemon = [6, 9, 3, 25, 133, 143, 130, 131]; // 強力なポケモン
  const pokemonId = cpuPokemon[Math.floor(Math.random() * cpuPokemon.length)];
  
  // 難易度に応じた個体値・レベル設定
  let level = 1;
  let ivModifier = 0;
  
  switch (difficulty) {
    case 'easy':
      level = Math.floor(Math.random() * 5) + 1;
      ivModifier = -10; // 低い個体値
      break;
    case 'normal':
      level = Math.floor(Math.random() * 10) + 5;
      ivModifier = 0; // 普通の個体値
      break;
    case 'hard':
      level = Math.floor(Math.random() * 15) + 10;
      ivModifier = 10; // 高い個体値
      break;
    case 'extreme':
      level = Math.floor(Math.random() * 20) + 20;
      ivModifier = 20; // 非常に高い個体値
      break;
  }

  // CPU用の強化されたポケモンステータス生成
  const pokemonStats = PokemonStatsCalculator.generateNewPokemon(pokemonId, level);
  if (pokemonStats) {
    // 個体値を難易度に応じて調整
    Object.keys(pokemonStats.individual_values).forEach(key => {
      const statKey = key as keyof typeof pokemonStats.individual_values;
      pokemonStats.individual_values[statKey] = Math.max(0, Math.min(31, 
        pokemonStats.individual_values[statKey] + ivModifier + Math.floor(Math.random() * 10)
      ));
    });

    // 能力値再計算
    pokemonStats.final_stats = PokemonStatsCalculator.calculateFinalStats(pokemonStats);
  }

  return {
    id: `cpu_advanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pokemon_name: pokemonStats?.pokemon_name || 'CPU',
    pokemon_id: pokemonId,
    level: level,
    grade: 3,
    position: 'captain',
    
    serve_skill: pokemonStats?.final_stats.serve_skill || 50,
    return_skill: pokemonStats?.final_stats.return_skill || 50,
    volley_skill: pokemonStats?.final_stats.volley_skill || 50,
    stroke_skill: pokemonStats?.final_stats.stroke_skill || 50,
    mental: pokemonStats?.final_stats.mental || 50,
    stamina: pokemonStats?.final_stats.stamina || 50,
    
    condition: difficulty === 'extreme' ? 'excellent' : 'good',
    motivation: Math.floor(Math.random() * 20) + 80,
    experience: level * 100,
    
    matches_played: Math.floor(Math.random() * 20),
    matches_won: Math.floor(Math.random() * 15),
    sets_won: 0,
    sets_lost: 0,
    
    types: ['normal'],
    pokemon_stats: pokemonStats || undefined,
    
    // CPU用特殊能力生成
    special_abilities: generateCPUSpecialAbilities(level, difficulty),
    
    // 必要なPlayer型プロパティ
    enrollmentYear: new Date().getFullYear(),
    personality: 'balanced',
    initialStats: {
      serve_skill: pokemonStats?.final_stats.serve_skill || 50,
      return_skill: pokemonStats?.final_stats.return_skill || 50,
      volley_skill: pokemonStats?.final_stats.volley_skill || 50,
      stroke_skill: pokemonStats?.final_stats.stroke_skill || 50,
      mental: pokemonStats?.final_stats.mental || 50
    }
  } as any;
}

// CPU用特殊能力生成
function generateCPUSpecialAbilities(level: number, difficulty: string): import('@/types/special-abilities').SpecialAbility[] {
  // TENNIS_SPECIAL_ABILITIES is now imported at the top
  const abilities: import('@/types/special-abilities').SpecialAbility[] = [];
  
  // 難易度による特殊能力数と質の調整
  let abilityCount = 0;
  let goldChance = 0;
  let blueChance = 0.7;
  
  switch (difficulty) {
    case 'easy':
      abilityCount = Math.random() < 0.3 ? 1 : 0;
      goldChance = 0;
      blueChance = 0.5;
      break;
    case 'normal':
      abilityCount = Math.random() < 0.6 ? 1 : Math.random() < 0.2 ? 2 : 0;
      goldChance = 0.1;
      blueChance = 0.7;
      break;
    case 'hard':
      abilityCount = Math.random() < 0.8 ? (Math.random() < 0.4 ? 2 : 1) : Math.random() < 0.1 ? 3 : 1;
      goldChance = 0.3;
      blueChance = 0.8;
      break;
    case 'extreme':
      abilityCount = Math.random() < 0.9 ? (Math.random() < 0.6 ? 3 : 2) : 1;
      goldChance = 0.5;
      blueChance = 0.9;
      break;
  }
  
  // レベルボーナス
  abilityCount += Math.floor(level / 15);
  goldChance += level * 0.01;
  
  let candidateAbilities = TENNIS_SPECIAL_ABILITIES.filter(
    (a: import('@/types/special-abilities').SpecialAbility) => a.color !== 'red'
  );
  
  for (let i = 0; i < abilityCount && candidateAbilities.length > 0; i++) {
    // 重み付き抽選
    const filteredAbilities = candidateAbilities.filter(
      (a: import('@/types/special-abilities').SpecialAbility) => {
        if (a.color === 'gold') return Math.random() < goldChance;
        if (a.color === 'blue') return Math.random() < blueChance;
        return Math.random() < 0.5;
      }
    );
    
    if (filteredAbilities.length === 0) break;
    
    const selectedAbility = filteredAbilities[Math.floor(Math.random() * filteredAbilities.length)];
    abilities.push({
      ...selectedAbility,
      isActive: true
    });
    
    // 重複回避
    candidateAbilities = candidateAbilities.filter(
      (a: import('@/types/special-abilities').SpecialAbility) => a.id !== selectedAbility.id
    );
  }
  
  return abilities;
}