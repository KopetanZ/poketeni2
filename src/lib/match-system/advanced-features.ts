/**
 * 統合マッチシステム - 高度機能
 * 特殊能力、詳細戦術、Pokemon個体値対応
 */

import { 
  EnhancedPlayer, 
  MatchContext, 
  MatchPoint, 
  EmergencyInstruction,
  TacticType,
  InstructionEffect
} from './types';
import { BaseMatchEngine } from './base-engine';
import { SpecialAbility, SpecialAbilityCalculator } from '@/types/special-abilities';

export class AdvancedMatchFeatures {
  
  // ===== 特殊能力システム =====
  
  /**
   * プレイヤーの特殊能力効果を計算
   */
  static calculateSpecialAbilityBonus(
    player: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): number {
    if (!player.special_abilities || player.special_abilities.length === 0) {
      return 0;
    }
    
    let totalBonus = 0;
    
    for (const abilityName of player.special_abilities) {
      const bonus = this.calculateSingleAbilityBonus(abilityName, pointType, context, player);
      totalBonus += bonus;
    }
    
    return Math.round(totalBonus);
  }
  
  /**
   * 単一特殊能力の効果を計算
   */
  private static calculateSingleAbilityBonus(
    abilityName: string,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext,
    player: EnhancedPlayer
  ): number {
    // 特殊能力データベースから効果を取得
    const abilityData = this.getAbilityData(abilityName);
    if (!abilityData) return 0;
    
    let bonus = 0;
    
    // 基本能力値ボーナス
    if (abilityData.effects[pointType]) {
      bonus += abilityData.effects[pointType];
    }
    
    // 条件付きボーナス
    if (abilityData.conditions) {
      // プレッシャー状況での効果
      if (abilityData.conditions.pressure && context.pressure_level > 70) {
        bonus += abilityData.conditions.pressure[pointType] || 0;
      }
      
      // ラリー数による効果
      if (abilityData.conditions.rally && context.rally_count > 5) {
        bonus += abilityData.conditions.rally[pointType] || 0;
      }
      
      // 天候による効果
      if (abilityData.conditions.weather && abilityData.conditions.weather[context.weather]) {
        bonus += abilityData.conditions.weather[context.weather][pointType] || 0;
      }
      
      // スタミナ状況による効果
      const staminaPercent = (player.current_stamina || 100);
      if (abilityData.conditions.stamina) {
        if (staminaPercent < 30 && abilityData.conditions.stamina.low) {
          bonus += abilityData.conditions.stamina.low[pointType] || 0;
        } else if (staminaPercent > 80 && abilityData.conditions.stamina.high) {
          bonus += abilityData.conditions.stamina.high[pointType] || 0;
        }
      }
    }
    
    return bonus;
  }
  
  /**
   * 特殊能力データを取得（簡易版）
   */
  private static getAbilityData(abilityName: string): any {
    const abilities: Record<string, any> = {
      'エースサーバー': {
        effects: { serve: 15, return: 0, volley: 5, stroke: 0, mental: 5 },
        conditions: {
          pressure: { serve: 10, mental: 10 }
        }
      },
      'リターンマスター': {
        effects: { serve: 0, return: 15, volley: 0, stroke: 5, mental: 5 },
        conditions: {
          pressure: { return: 10, mental: 5 }
        }
      },
      'ネットプレイヤー': {
        effects: { serve: 5, return: 0, volley: 15, stroke: 0, mental: 5 },
        conditions: {
          rally: { volley: 10 }
        }
      },
      'ベースライナー': {
        effects: { serve: 0, return: 5, volley: 0, stroke: 15, mental: 5 },
        conditions: {
          rally: { stroke: 10, mental: 5 }
        }
      },
      'メンタルタフネス': {
        effects: { serve: 0, return: 0, volley: 0, stroke: 0, mental: 20 },
        conditions: {
          pressure: { serve: 5, return: 5, volley: 5, stroke: 5, mental: 15 }
        }
      },
      '天候マスター': {
        effects: { serve: 2, return: 2, volley: 2, stroke: 2, mental: 2 },
        conditions: {
          weather: {
            rainy: { serve: 8, return: 5, volley: 3, stroke: 5, mental: 10 },
            windy: { serve: 5, return: 8, volley: 5, stroke: 8, mental: 5 }
          }
        }
      }
    };
    
    return abilities[abilityName];
  }
  
  // ===== 緊急指示システム =====
  
  /**
   * 緊急指示効果を適用
   */
  static applyEmergencyInstruction(
    player: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): number {
    if (!context.emergency_instruction || context.emergency_instruction.remaining_effects <= 0) {
      return 0;
    }
    
    const instruction = context.emergency_instruction;
    let bonus = 0;
    
    // 戦術タイプによる基本ボーナス
    const tacticBonus = BaseMatchEngine.getTacticModifier(instruction.type, pointType);
    bonus += tacticBonus * instruction.bonus_multiplier;
    
    // プレッシャー軽減効果
    if (context.pressure_level > 50) {
      const pressureReduction = Math.min(instruction.pressure_reduction, context.pressure_level);
      if (pointType === 'mental') {
        bonus += pressureReduction * 0.3;
      } else {
        bonus += pressureReduction * 0.1;
      }
    }
    
    return Math.round(bonus);
  }
  
  /**
   * 緊急指示の効果を減らす
   */
  static consumeEmergencyInstruction(context: MatchContext): void {
    if (context.emergency_instruction && context.emergency_instruction.remaining_effects > 0) {
      context.emergency_instruction.remaining_effects--;
    }
  }
  
  // ===== クリティカルヒット・エラーシステム =====
  
  /**
   * クリティカルヒットの判定
   */
  static checkCriticalHit(
    player: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): boolean {
    let criticalRate = 0.05; // 基本5%
    
    // 特殊能力による影響
    const abilityBonus = this.getCriticalRateFromAbilities(player, pointType);
    criticalRate += abilityBonus;
    
    // 緊急指示による影響
    if (context.emergency_instruction) {
      criticalRate += context.emergency_instruction.critical_bonus;
    }
    
    // レベル・スキルによる影響
    const skillLevel = BaseMatchEngine.getBaseSkill(player, pointType);
    criticalRate += (skillLevel - 50) * 0.001; // スキル50以上で少しずつ上昇
    
    // 戦術による影響
    if (player.tactic === 'aggressive') {
      criticalRate += 0.03;
    } else if (player.tactic === 'technical') {
      criticalRate += 0.02;
    }
    
    return Math.random() < Math.min(0.3, Math.max(0, criticalRate));
  }
  
  /**
   * エラーの判定
   */
  static checkError(
    player: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): boolean {
    let errorRate = 0.05; // 基本5%
    
    // プレッシャーによる影響
    if (context.pressure_level > 70) {
      errorRate += (context.pressure_level - 70) * 0.002;
    }
    
    // スタミナによる影響
    const staminaPercent = (player.current_stamina || 100);
    if (staminaPercent < 30) {
      errorRate += (30 - staminaPercent) * 0.003;
    }
    
    // 天候による影響
    if (context.weather === 'rainy' && (pointType === 'serve' || pointType === 'volley')) {
      errorRate += 0.03;
    }
    if (context.weather === 'windy' && (pointType === 'serve' || pointType === 'stroke')) {
      errorRate += 0.02;
    }
    
    // 戦術による影響
    if (player.tactic === 'aggressive') {
      errorRate += 0.02; // リスクとリターン
    } else if (player.tactic === 'defensive') {
      errorRate -= 0.01; // 安定性重視
    }
    
    return Math.random() < Math.min(0.3, Math.max(0, errorRate));
  }
  
  /**
   * 特殊能力からクリティカル率を取得
   */
  private static getCriticalRateFromAbilities(
    player: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental'
  ): number {
    if (!player.special_abilities) return 0;
    
    let bonus = 0;
    
    // 各特殊能力のクリティカル率ボーナス
    const criticalAbilities: Record<string, Record<string, number>> = {
      'エースサーバー': { serve: 0.1, volley: 0.03 },
      'リターンマスター': { return: 0.1, stroke: 0.03 },
      'ネットプレイヤー': { volley: 0.1, serve: 0.02 },
      'ベースライナー': { stroke: 0.1, return: 0.02 },
      'メンタルタフネス': { mental: 0.08 },
      'パワーヒッター': { serve: 0.05, stroke: 0.08 },
      'テクニシャン': { volley: 0.08, mental: 0.05 }
    };
    
    for (const ability of player.special_abilities) {
      if (criticalAbilities[ability] && criticalAbilities[ability][pointType]) {
        bonus += criticalAbilities[ability][pointType];
      }
    }
    
    return bonus;
  }
  
  // ===== 高度ポイントシミュレーション =====
  
  /**
   * 高度なポイントシミュレーション（全効果込み）
   */
  static simulateAdvancedPoint(
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): MatchPoint {
    // 基本スキル値
    const homeBaseSkill = BaseMatchEngine.calculateFinalSkill(homePlayer, pointType, context);
    const awayBaseSkill = BaseMatchEngine.calculateFinalSkill(awayPlayer, pointType, context);
    
    // 特殊能力ボーナス
    const homeAbilityBonus = this.calculateSpecialAbilityBonus(homePlayer, pointType, context);
    const awayAbilityBonus = this.calculateSpecialAbilityBonus(awayPlayer, pointType, context);
    
    // 緊急指示ボーナス
    const homeInstructionBonus = this.applyEmergencyInstruction(homePlayer, pointType, context);
    const awayInstructionBonus = this.applyEmergencyInstruction(awayPlayer, pointType, context);
    
    // 最終スキル値
    const homeFinalSkill = homeBaseSkill + homeAbilityBonus + homeInstructionBonus;
    const awayFinalSkill = awayBaseSkill + awayAbilityBonus + awayInstructionBonus;
    
    // ダイスロール
    const homeRoll = Math.random() * 100;
    const awayRoll = Math.random() * 100;
    
    // クリティカル・エラー判定
    const homeCritical = this.checkCriticalHit(homePlayer, pointType, context);
    const awayCritical = this.checkCriticalHit(awayPlayer, pointType, context);
    const homeError = this.checkError(homePlayer, pointType, context);
    const awayError = this.checkError(awayPlayer, pointType, context);
    
    // 最終計算
    let homeTotal = homeFinalSkill + homeRoll;
    let awayTotal = awayFinalSkill + awayRoll;
    
    if (homeCritical) homeTotal += 50;
    if (awayCritical) awayTotal += 50;
    if (homeError) homeTotal -= 30;
    if (awayError) awayTotal -= 30;
    
    const winner = homeTotal > awayTotal ? 'home' : 'away';
    
    // 緊急指示効果を消費
    this.consumeEmergencyInstruction(context);
    
    const point: MatchPoint = {
      type: pointType,
      home_skill: homeFinalSkill,
      away_skill: awayFinalSkill,
      home_roll: homeRoll,
      away_roll: awayRoll,
      
      // 詳細情報
      home_base_skill: homeBaseSkill,
      away_base_skill: awayBaseSkill,
      home_ability_bonus: homeAbilityBonus,
      away_ability_bonus: awayAbilityBonus,
      home_special_ability_bonus: homeInstructionBonus,
      away_special_ability_bonus: awayInstructionBonus,
      home_tactic_bonus: BaseMatchEngine.getTacticModifier(homePlayer.tactic, pointType),
      away_tactic_bonus: BaseMatchEngine.getTacticModifier(awayPlayer.tactic, pointType),
      
      winner,
      is_critical: winner === 'home' ? homeCritical : awayCritical,
      is_error: winner === 'home' ? awayError : homeError,
      description: this.generateAdvancedDescription(
        pointType, winner, homePlayer, awayPlayer, 
        winner === 'home' ? homeCritical : awayCritical,
        winner === 'home' ? awayError : homeError
      )
    };
    
    return point;
  }
  
  /**
   * 高度な説明文生成
   */
  private static generateAdvancedDescription(
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    winner: 'home' | 'away',
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    isCritical: boolean,
    isError: boolean
  ): string {
    const winnerName = winner === 'home' ? homePlayer.pokemon_name : awayPlayer.pokemon_name;
    const loserName = winner === 'home' ? awayPlayer.pokemon_name : homePlayer.pokemon_name;
    
    if (isError) {
      return `${loserName}のミスで${winnerName}がポイントを獲得！`;
    }
    
    if (isCritical) {
      const criticalDescriptions: Record<string, string[]> = {
        serve: [
          `${winnerName}の完璧なサービスエース！！`,
          `${winnerName}の渾身のサーブが炸裂！！`,
          `${winnerName}の驚異的なサーブで得点！！`
        ],
        return: [
          `${winnerName}の見事なリターンエース！！`,
          `${winnerName}が完璧にサーブを打ち返す！！`,
          `${winnerName}の絶妙なリターンが決まった！！`
        ],
        volley: [
          `${winnerName}のスーパーボレーが炸裂！！`,
          `${winnerName}がネット前で驚異的なプレー！！`,
          `${winnerName}の神業ボレーで得点！！`
        ],
        stroke: [
          `${winnerName}の渾身のストロークが決まった！！`,
          `${winnerName}がコートを駆け回る素晴らしいストローク！！`,
          `${winnerName}の完璧なベースラインショット！！`
        ],
        mental: [
          `${winnerName}の集中力が相手を圧倒！！`,
          `${winnerName}の精神力が試合を決定づけた！！`,
          `${winnerName}がプレッシャーを跳ね除けて得点！！`
        ]
      };
      
      const descriptions = criticalDescriptions[pointType];
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
    
    // 通常の説明文
    return BaseMatchEngine.generatePointDescription(pointType, winner, homePlayer, awayPlayer);
  }
}