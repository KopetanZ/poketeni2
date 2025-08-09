// 装備効果を試合システムに統合するユーティリティ

import { Player } from '@/types/game';
import { PlayerEquipment } from '@/types/items';
import { EquipmentEffectsCalculator } from './equipment-effects';
import { MatchContext } from './advanced-match-engine';

export interface EquipmentEnhancedPlayer extends Player {
  equipment?: PlayerEquipment;
  equipment_effects?: {
    serve_skill_bonus: number;
    return_skill_bonus: number;
    volley_skill_bonus: number;
    stroke_skill_bonus: number;
    mental_bonus: number;
    stamina_bonus: number;
    experience_boost: number;
    special_abilities: string[];
  };
}

export class MatchEquipmentIntegrator {
  // プレイヤーに装備効果を適用
  static enhancePlayerWithEquipment(player: Player, equipment?: PlayerEquipment): EquipmentEnhancedPlayer {
    if (!equipment) {
      return {
        ...player,
        equipment_effects: {
          serve_skill_bonus: 0,
          return_skill_bonus: 0,
          volley_skill_bonus: 0,
          stroke_skill_bonus: 0,
          mental_bonus: 0,
          stamina_bonus: 0,
          experience_boost: 0,
          special_abilities: []
        }
      };
    }

    const equipmentEffects = EquipmentEffectsCalculator.calculateTotalEffects(equipment);
    
    return {
      ...player,
      equipment,
      equipment_effects: {
        serve_skill_bonus: equipmentEffects.serve_skill,
        return_skill_bonus: equipmentEffects.return_skill,
        volley_skill_bonus: equipmentEffects.volley_skill,
        stroke_skill_bonus: equipmentEffects.stroke_skill,
        mental_bonus: equipmentEffects.mental,
        stamina_bonus: equipmentEffects.stamina,
        experience_boost: equipmentEffects.experience_boost,
        special_abilities: equipmentEffects.special_abilities
      },
      // 装備効果を基本ステータスに反映
      serve_skill: (player.serve_skill || 0) + equipmentEffects.serve_skill,
      return_skill: (player.return_skill || 0) + equipmentEffects.return_skill,
      volley_skill: (player.volley_skill || 0) + equipmentEffects.volley_skill,
      stroke_skill: (player.stroke_skill || 0) + equipmentEffects.stroke_skill,
      mental: (player.mental || 0) + equipmentEffects.mental,
      stamina: (player.stamina || 0) + equipmentEffects.stamina
    };
  }

  // 装備の特殊効果を試合中に適用
  static applyEquipmentSpecialEffects(
    player: EquipmentEnhancedPlayer,
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    context: MatchContext
  ): number {
    if (!player.equipment_effects) return 0;

    let bonusMultiplier = 1.0;
    const specialAbilities = player.equipment_effects.special_abilities;

    // 装備固有の特殊効果を適用
    specialAbilities.forEach(abilityId => {
      switch (abilityId) {
        case 'flame_serve':
          if (pointType === 'serve' && context.weather === 'sunny') {
            bonusMultiplier += 0.3; // 晴天時サーブ30%アップ
          }
          break;
        
        case 'lightning_volley':
          if (pointType === 'volley' && context.pressure_level > 70) {
            bonusMultiplier += 0.25; // 高プレッシャー時ボレー25%アップ
          }
          break;
        
        case 'tornado_spin':
          if (pointType === 'stroke' && context.rally_count > 5) {
            bonusMultiplier += 0.2; // 長いラリー時ストローク20%アップ
          }
          break;
        
        case 'ice_defense':
          if (pointType === 'return' && context.weather === 'rainy') {
            bonusMultiplier += 0.15; // 雨天時リターン15%アップ
          }
          break;
        
        case 'storm_power':
          if (pointType === 'serve' && context.weather === 'windy') {
            bonusMultiplier += 0.35; // 風の強い日サーブ35%アップ
          }
          break;
      }
    });

    return bonusMultiplier - 1.0; // ボーナス分のみを返す
  }

  // 装備の耐久性を試合後に減少させる
  static degradeEquipmentAfterMatch(
    equipment: PlayerEquipment,
    matchIntensity: 'practice' | 'official' | 'tournament' = 'official'
  ): PlayerEquipment {
    const degradeMultiplier = {
      practice: 0.5,
      official: 1.0,
      tournament: 1.5
    };

    return EquipmentEffectsCalculator.degradeEquipmentDurability(
      equipment,
      degradeMultiplier[matchIntensity]
    );
  }

  // 装備効果を考慮した経験値計算
  static calculateEquipmentBoostedExperience(
    baseExperience: number,
    player: EquipmentEnhancedPlayer
  ): number {
    if (!player.equipment_effects) return baseExperience;

    const boostPercentage = player.equipment_effects.experience_boost / 100;
    return Math.floor(baseExperience * (1 + boostPercentage));
  }

  // 装備の状態チェック（試合前の警告システム）
  static checkEquipmentCondition(equipment: PlayerEquipment): {
    canPlay: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let canPlay = true;

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item && item.durability) {
        const condition = EquipmentEffectsCalculator.getEquipmentCondition(item);
        
        if (condition.condition === 'broken') {
          canPlay = false;
          warnings.push(`${item.name}が故障しています！試合に参加できません。`);
        } else if (condition.condition === 'poor') {
          warnings.push(`${item.name}の状態が悪く、性能が大幅に低下しています。`);
          suggestions.push(`${item.name}を修理することをお勧めします。`);
        } else if (condition.condition === 'fair') {
          suggestions.push(`${item.name}の状態が普通です。修理を検討してください。`);
        }
      }
    });

    return { canPlay, warnings, suggestions };
  }

  // セットボーナス効果の試合への適用
  static applySetBonuses(player: EquipmentEnhancedPlayer, context: MatchContext): number {
    if (!player.equipment) return 0;

    const setBonuses = EquipmentEffectsCalculator.calculateSetBonus(player.equipment);
    let totalBonus = 0;

    setBonuses.forEach(setBonus => {
      // セットボーナスは特定の条件下で追加効果を発揮
      switch (setBonus.id) {
        case 'pro_set':
          // プロセットは全体的な安定性向上
          totalBonus += 0.1;
          break;
        
        case 'flame_set':
          // フレイムセットは攻撃的なプレイで威力発揮
          if (context.pressure_level > 50) {
            totalBonus += 0.15;
          }
          break;
        
        case 'thunder_set':
          // 雷神セットは重要なポイントで威力発揮
          if (context.game_score.home >= 4 || context.game_score.away >= 4) {
            totalBonus += 0.2;
          }
          break;
      }
    });

    return totalBonus;
  }

  // 装備レコメンデーション（対戦相手に応じた最適装備の提案）
  static recommendEquipmentForMatch(
    availableEquipment: PlayerEquipment[],
    opponent: Player,
    matchType: 'practice' | 'official' | 'tournament',
    context: Partial<MatchContext>
  ): {
    recommended: PlayerEquipment;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    
    // 基本的な推奨装備（実装は簡略化）
    const recommended: PlayerEquipment = {
      racket: null,
      shoes: null,
      accessory: null,
      pokemon_item: null
    };

    // 対戦相手の特徴に基づく推奨
    if (opponent.serve_skill > 70) {
      reasoning.push('相手のサーブが強力です。リターン特化装備がおすすめです。');
    }
    
    if (opponent.mental > 65) {
      reasoning.push('相手のメンタルが強いです。プレッシャー耐性装備がおすすめです。');
    }

    // 天候に基づく推奨
    if (context.weather === 'rainy') {
      reasoning.push('雨天のため、滑りにくいシューズと安定性重視の装備がおすすめです。');
    }

    // 試合の重要度に基づく推奨
    if (matchType === 'tournament') {
      reasoning.push('トーナメントなので、耐久性の高い装備と経験値ボーナス装備がおすすめです。');
    }

    return { recommended, reasoning };
  }
}

// 装備効果の可視化ヘルパー
export class EquipmentMatchVisualization {
  // 装備効果のリアルタイム表示データ
  static getEquipmentEffectDisplay(player: EquipmentEnhancedPlayer) {
    if (!player.equipment_effects) return null;

    return {
      totalPowerIncrease: Object.values(player.equipment_effects)
        .filter((value, index) => index < 6) // 最初の6つのステータスボーナス
        .reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0),
      
      experienceBoost: player.equipment_effects.experience_boost,
      
      specialAbilities: player.equipment_effects.special_abilities,
      
      strengthAreas: [
        player.equipment_effects.serve_skill_bonus > 5 ? 'サーブ' : null,
        player.equipment_effects.return_skill_bonus > 5 ? 'リターン' : null,
        player.equipment_effects.volley_skill_bonus > 5 ? 'ボレー' : null,
        player.equipment_effects.stroke_skill_bonus > 5 ? 'ストローク' : null,
      ].filter(Boolean)
    };
  }

  // 装備の試合中パフォーマンス記録
  static trackEquipmentPerformance(
    equipment: PlayerEquipment,
    matchResults: {
      points_won: number;
      points_lost: number;
      special_effects_triggered: string[];
    }
  ) {
    // 装備のパフォーマンス履歴を記録
    // 実装は今後のアップデートで追加
    return {
      effectiveness_rating: matchResults.points_won / (matchResults.points_won + matchResults.points_lost),
      special_effects_count: matchResults.special_effects_triggered.length,
      performance_trend: 'improving' // 'improving' | 'stable' | 'declining'
    };
  }
}