// 装備効果計算システム

import { Player } from '@/types/game';
import { Equipment, PlayerEquipment } from '@/types/items';
import { GameBalanceManager } from './game-balance-manager';

export class EquipmentEffectsCalculator {
  // プレイヤーの装備から総合効果を計算
  static calculateTotalEffects(equipment: PlayerEquipment) {
    const totalEffects = {
      serve_skill: 0,
      return_skill: 0,
      volley_skill: 0,
      stroke_skill: 0,
      mental: 0,
      stamina: 0,
      experience_boost: 0,
      special_abilities: [] as string[]
    };

    // 各装備スロットをチェック
    Object.values(equipment).forEach(item => {
      if (item && item.effects) {
        // 基本ステータス効果
        Object.entries(item.effects).forEach(([stat, value]) => {
          if (typeof value === 'number' && stat in totalEffects) {
            (totalEffects as any)[stat] += value;
          }
        });

        // 特殊能力効果
        if ('specialAbility' in item && item.specialAbility) {
          totalEffects.special_abilities.push(item.specialAbility);
        }
      }
    });

    return totalEffects;
  }

  // プレイヤーの最終ステータスを計算（基本ステータス + 装備効果 + バランス制限）
  static calculateFinalStats(player: Player, equipment?: PlayerEquipment) {
    const baseStats = {
      serve_skill: player.serve_skill || 0,
      return_skill: player.return_skill || 0,
      volley_skill: player.volley_skill || 0,
      stroke_skill: player.stroke_skill || 0,
      mental: player.mental || 0,
      stamina: player.stamina || 0
    };

    if (!equipment) {
      return baseStats;
    }

    const equipmentEffects = this.calculateTotalEffects(equipment);
    
    // 新バランスシステムの上限値を適用
    const statCap = GameBalanceManager.getStatCapForLevel(player.level);

    return {
      serve_skill: Math.min(baseStats.serve_skill + equipmentEffects.serve_skill, statCap),
      return_skill: Math.min(baseStats.return_skill + equipmentEffects.return_skill, statCap),
      volley_skill: Math.min(baseStats.volley_skill + equipmentEffects.volley_skill, statCap),
      stroke_skill: Math.min(baseStats.stroke_skill + equipmentEffects.stroke_skill, statCap),
      mental: Math.min(baseStats.mental + equipmentEffects.mental, statCap),
      stamina: Math.min(baseStats.stamina + equipmentEffects.stamina, statCap),
      experience_boost: equipmentEffects.experience_boost,
      special_abilities: equipmentEffects.special_abilities
    };
  }

  // 装備の耐久性を減少させる
  static degradeEquipmentDurability(equipment: PlayerEquipment, degradeAmount: number = 1): PlayerEquipment {
    const newEquipment = { ...equipment };

    Object.keys(newEquipment).forEach(slot => {
      const item = newEquipment[slot as keyof PlayerEquipment];
      if (item && (item as Equipment).durability) {
        const newDurability = Math.max(0, ((item as Equipment).durability?.current || 100) - (((item as Equipment).durability?.degradePerMatch || 1) * degradeAmount));
        newEquipment[slot as keyof PlayerEquipment] = {
          ...(item as any),
          durability: {
            ...(item as Equipment).durability,
            current: newDurability
          }
        };
      }
    });

    return newEquipment;
  }

  // 装備の修理費用を計算
  static calculateRepairCost(equipment: Equipment): number {
    if (!equipment.durability) return 0;

    const damagePercentage = 1 - (equipment.durability.current / equipment.durability.max);
    const baseCost = equipment.price * 0.1; // 購入価格の10%をベースに
    return Math.floor(baseCost * damagePercentage);
  }

  // 装備を修理
  static repairEquipment(equipment: Equipment, repairAmount?: number): Equipment {
    if (!equipment.durability) return equipment;

    const newCurrent = repairAmount 
      ? Math.min(equipment.durability.max, equipment.durability.current + repairAmount)
      : equipment.durability.max;

    return {
      ...equipment,
      durability: {
        ...equipment.durability,
        current: newCurrent
      }
    };
  }

  // 装備の状態評価
  static getEquipmentCondition(equipment: Equipment): { 
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
    color: string;
    description: string;
  } {
    if (!equipment.durability) {
      return { condition: 'excellent', color: 'text-green-600', description: '完璧' };
    }

    const percentage = equipment.durability.current / equipment.durability.max;

    if (percentage <= 0) {
      return { condition: 'broken', color: 'text-red-600', description: '故障' };
    } else if (percentage <= 0.25) {
      return { condition: 'poor', color: 'text-red-500', description: '劣悪' };
    } else if (percentage <= 0.5) {
      return { condition: 'fair', color: 'text-yellow-500', description: '普通' };
    } else if (percentage <= 0.8) {
      return { condition: 'good', color: 'text-blue-500', description: '良好' };
    } else {
      return { condition: 'excellent', color: 'text-green-600', description: '完璧' };
    }
  }

  // 装備の組み合わせボーナス効果
  static calculateSetBonus(equipment: PlayerEquipment) {
    const setBonuses = {
      // プロ仕様セット
      pro_set: {
        items: ['racket_002', 'shoes_002', 'accessory_002'],
        bonus: { experience_boost: 15, mental: 3 },
        name: 'プロ仕様セット',
        description: '全体的にプロフェッショナルな装備'
      },
      // フレイムセット
      flame_set: {
        items: ['racket_003', 'shoes_003'],
        bonus: { serve_skill: 5, stroke_skill: 3 },
        name: 'フレイムセット',
        description: '炎の力を宿す装備'
      },
      // 雷神セット
      thunder_set: {
        items: ['racket_005', 'accessory_005'],
        bonus: { volley_skill: 8, mental: 5 },
        name: '雷神セット',
        description: '電光石火の反応速度'
      }
    };

    const equippedItemIds = Object.values(equipment)
      .filter(item => item !== null)
      .map(item => item!.id);

    const activeSets = [];
    
    for (const [setId, setData] of Object.entries(setBonuses)) {
      const hasAllItems = setData.items.every(itemId => equippedItemIds.includes(itemId));
      if (hasAllItems) {
        activeSets.push({
          id: setId,
          ...setData
        });
      }
    }

    return activeSets;
  }

  // 経験値ボーナスを適用
  static applyExperienceBonus(baseExperience: number, equipment: PlayerEquipment): number {
    const effects = this.calculateTotalEffects(equipment);
    const bonusPercentage = effects.experience_boost / 100;
    return Math.floor(baseExperience * (1 + bonusPercentage));
  }

  // 装備の総合評価値を計算（レベル依存調整）
  static calculateEquipmentPower(equipment: PlayerEquipment, playerLevel: number = 1): number {
    const effects = this.calculateTotalEffects(equipment);
    const statCap = GameBalanceManager.getStatCapForLevel(playerLevel);
    
    // レベルが低い場合、装備効果の価値を相対的に高く評価
    const levelMultiplier = Math.max(0.5, 1.5 - (playerLevel / 50)); // レベル1で1.5倍、レベル50で1.0倍
    
    const basePower = (
      Math.min(effects.serve_skill, statCap * 0.3) +
      Math.min(effects.return_skill, statCap * 0.3) +
      Math.min(effects.volley_skill, statCap * 0.3) +
      Math.min(effects.stroke_skill, statCap * 0.3) +
      Math.min(effects.mental, statCap * 0.3) +
      Math.min(effects.stamina, statCap * 0.3) +
      (effects.experience_boost / 5) + // 経験値ボーナスは5で割る
      (effects.special_abilities.length * 10) // 特殊能力は1つあたり10ポイント
    );
    
    return Math.floor(basePower * levelMultiplier);
  }

  // レベル範囲に適した装備の推奨
  static filterEquipmentByLevelRange(
    availableEquipment: Equipment[],
    playerLevel: number
  ): Equipment[] {
    const levelRanges = {
      beginner: { min: 1, max: 10 },    // 初心者用
      intermediate: { min: 8, max: 25 }, // 中級者用
      advanced: { min: 20, max: 40 },    // 上級者用
      expert: { min: 35, max: 99 }       // エキスパート用
    };

    return availableEquipment.filter(equipment => {
      const power = this.calculateEquipmentPower({ player_id: 'dummy', racket: equipment, shoes: undefined, accessory: undefined, pokemon_item: undefined }, playerLevel);
      
      if (playerLevel <= 10) {
        return power <= 50; // 初心者は効果控えめ
      } else if (playerLevel <= 25) {
        return power <= 100; // 中級者は中程度
      } else if (playerLevel <= 40) {
        return power <= 200; // 上級者は高効果
      } else {
        return true; // エキスパートは制限なし
      }
    });
  }

  // 装備効果の成長曲線調整
  static adjustEquipmentEffectsForBalance(
    equipment: PlayerEquipment,
    playerLevel: number
  ): PlayerEquipment {
    const adjustedEquipment = { ...equipment };
    const growthRate = GameBalanceManager.getGrowthRateForLevel(playerLevel);
    
    // 各装備の効果をプレイヤーレベルに応じて調整
    Object.keys(adjustedEquipment).forEach(slot => {
      const item = adjustedEquipment[slot as keyof PlayerEquipment];
      if (item && item.effects) {
        const adjustedEffects = { ...item.effects };
        
        // 基本ステータス効果をレベルに応じて調整
        Object.keys(adjustedEffects).forEach(stat => {
          if (typeof adjustedEffects[stat as keyof typeof adjustedEffects] === 'number') {
            const originalValue = adjustedEffects[stat as keyof typeof adjustedEffects] as number;
            // 低レベル時は装備効果を少し抑制、高レベル時は効果を向上
            const levelAdjustment = 0.8 + (playerLevel / 100); // 0.8〜1.8の範囲
            (adjustedEffects as any)[stat] = Math.floor(originalValue * levelAdjustment * growthRate);
          }
        });
        
        (adjustedEquipment[slot as keyof PlayerEquipment] as any) = {
          ...item,
          effects: adjustedEffects
        };
      }
    });
    
    return adjustedEquipment;
  }

  // おすすめ装備の提案
  static suggestBestEquipment(
    availableEquipment: Equipment[], 
    playerStyle: 'offensive' | 'defensive' | 'balanced' | 'technical'
  ): Equipment[] {
    const styleWeights = {
      offensive: { serve_skill: 2, stroke_skill: 2, mental: 1, stamina: 1 },
      defensive: { return_skill: 2, volley_skill: 1, mental: 2, stamina: 1 },
      balanced: { serve_skill: 1, return_skill: 1, volley_skill: 1, stroke_skill: 1, mental: 1, stamina: 1 },
      technical: { volley_skill: 2, stroke_skill: 1, mental: 2, serve_skill: 1 }
    };

    const weights = styleWeights[playerStyle];

    return availableEquipment
      .map(equipment => {
        let score = 0;
        Object.entries(equipment.effects).forEach(([stat, value]) => {
          if (typeof value === 'number' && stat in weights) {
            score += value * (weights as any)[stat];
          }
        });
        return { equipment, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.equipment);
  }
}

// 装備効果の表示用ヘルパー関数
export const EquipmentDisplayHelpers = {
  // ステータス名の日本語変換
  getStatName: (stat: string): string => {
    const statNames: { [key: string]: string } = {
      serve_skill: 'サーブ',
      return_skill: 'リターン',
      volley_skill: 'ボレー', 
      stroke_skill: 'ストローク',
      mental: 'メンタル',
      stamina: 'スタミナ',
      experience_boost: '経験値ボーナス'
    };
    return statNames[stat] || stat;
  },

  // レア度の色とアイコン
  getRarityInfo: (rarity: string) => {
    const rarityInfo: { [key: string]: { color: string; icon: string; name: string } } = {
      common: { color: 'text-gray-600', icon: '⚪', name: 'コモン' },
      uncommon: { color: 'text-green-600', icon: '🟢', name: 'アンコモン' },
      rare: { color: 'text-blue-600', icon: '🔵', name: 'レア' },
      epic: { color: 'text-purple-600', icon: '🟣', name: 'エピック' },
      legendary: { color: 'text-yellow-600', icon: '🟨', name: 'レジェンダリー' }
    };
    return rarityInfo[rarity] || rarityInfo.common;
  },

  // 効果値の表示フォーマット
  formatEffectValue: (stat: string, value: number): string => {
    if (stat === 'experience_boost') {
      return `+${value}%`;
    }
    return `+${value}`;
  }
};