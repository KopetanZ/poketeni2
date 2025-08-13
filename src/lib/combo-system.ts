// カードコンボシステム - Phase 1
import { TrainingCard, CardRarity } from '@/types/training-cards';

// カードコンボ定義
export interface CardCombo {
  id: string;
  name: string;
  description: string;
  
  // 必要カード
  requiredCards: {
    cardIds?: string[]; // 特定カード指定
    categories?: string[]; // カテゴリ指定
    rarities?: CardRarity[]; // レア度指定
    minCards: number; // 最小枚数
  };
  
  // コンボ効果
  effects: {
    bonusMultiplier: number; // 効果倍率
    specialEffects?: SpecialComboEffect[]; // 特殊効果
    progressBonus?: number; // 進行マス数ボーナス
    costReduction?: number; // コスト軽減
  };
  
  // 解放条件
  unlockConditions: {
    playerLevel?: number;
    schoolReputation?: number;
    completedCombos?: string[]; // 前提コンボ
    specialAchievement?: string;
  };
}

// 特殊コンボ効果
export interface SpecialComboEffect {
  type: 'special_ability_unlock' | 'all_stats_boost' | 'special_event_trigger' | 'team_bonus';
  abilityId?: string;
  chance?: number;
  value?: number;
  eventId?: string;
}

// 具体的コンボ例
export const CARD_COMBOS: CardCombo[] = [
  {
    id: 'perfect_serve_combo',
    name: 'パーフェクトサーブ',
    description: 'サーブ系カードの組み合わせで完璧なサーブを習得',
    requiredCards: {
      categories: ['technical'],
      minCards: 2,
    },
    effects: {
      bonusMultiplier: 1.5,
      specialEffects: [
        {
          type: 'special_ability_unlock',
          abilityId: 'ace_serve',
          chance: 30
        }
      ]
    },
    unlockConditions: {
      playerLevel: 5
    }
  },
  
  {
    id: 'endurance_master',
    name: 'エンデュランスマスター',
    description: 'フィジカル系カードで究極の持久力を獲得',
    requiredCards: {
      categories: ['physical'],
      minCards: 3
    },
    effects: {
      bonusMultiplier: 2.0,
      progressBonus: 1, // +1マス進行
      costReduction: 0.3 // スタミナコスト30%軽減
    },
    unlockConditions: {
      playerLevel: 10,
      schoolReputation: 60
    }
  },
  
  {
    id: 'legendary_awakening',
    name: '伝説の覚醒',
    description: 'レジェンドカード3枚で伝説的な力を解放',
    requiredCards: {
      rarities: ['legendary'],
      minCards: 3
    },
    effects: {
      bonusMultiplier: 3.0,
      specialEffects: [
        {
          type: 'all_stats_boost',
          value: 20
        },
        {
          type: 'special_event_trigger',
          eventId: 'legendary_breakthrough'
        }
      ]
    },
    unlockConditions: {
      playerLevel: 20,
      completedCombos: ['perfect_serve_combo', 'endurance_master']
    }
  }
];

// コンボ判定システム
export class ComboDetectionSystem {
  // 手札から利用可能なコンボを検出
  detectAvailableCombos(
    handCards: TrainingCard[],
    playerLevel: number,
    schoolReputation: number,
    completedCombos: string[]
  ): CardCombo[] {
    return CARD_COMBOS.filter(combo => {
      // 解放条件チェック
      if (!this.checkUnlockConditions(combo, playerLevel, schoolReputation, completedCombos)) {
        return false;
      }
      
      // 必要カードチェック
      return this.checkRequiredCards(combo, handCards);
    });
  }

  // 解放条件をチェック
  private checkUnlockConditions(
    combo: CardCombo,
    playerLevel: number,
    schoolReputation: number,
    completedCombos: string[]
  ): boolean {
    if (combo.unlockConditions.playerLevel && playerLevel < combo.unlockConditions.playerLevel) {
      return false;
    }
    
    if (combo.unlockConditions.schoolReputation && schoolReputation < combo.unlockConditions.schoolReputation) {
      return false;
    }
    
    if (combo.unlockConditions.completedCombos) {
      const hasAllPrerequisites = combo.unlockConditions.completedCombos.every(
        prerequisiteId => completedCombos.includes(prerequisiteId)
      );
      if (!hasAllPrerequisites) {
        return false;
      }
    }
    
    return true;
  }

  // 必要カードをチェック
  private checkRequiredCards(combo: CardCombo, handCards: TrainingCard[]): boolean {
    const { requiredCards } = combo;
    
    // 特定カードIDのチェック
    if (requiredCards.cardIds) {
      const hasAllRequiredCards = requiredCards.cardIds.every(
        cardId => handCards.some(card => card.id === cardId)
      );
      if (!hasAllRequiredCards) {
        return false;
      }
    }
    
    // カテゴリのチェック
    if (requiredCards.categories) {
      const categoryMatches = handCards.filter(card => 
        requiredCards.categories!.includes(card.category || 'general')
      );
      if (categoryMatches.length < requiredCards.minCards) {
        return false;
      }
    }
    
    // レア度のチェック
    if (requiredCards.rarities) {
      const rarityMatches = handCards.filter(card => 
        requiredCards.rarities!.includes(card.rarity)
      );
      if (rarityMatches.length < requiredCards.minCards) {
        return false;
      }
    }
    
    // 最小枚数チェック
    if (handCards.length < requiredCards.minCards) {
      return false;
    }
    
    return true;
  }
}

// コンボ効果適用システム
export class ComboEffectSystem {
  // コンボ効果を適用
  applyComboEffects(
    combo: CardCombo,
    baseEffects: Record<string, number>,
    playerStats: any
  ): {
    modifiedEffects: Record<string, number>;
    specialEffects: SpecialComboEffect[];
    progressBonus: number;
  } {
    const modifiedEffects = { ...baseEffects };
    const specialEffects: SpecialComboEffect[] = [];
    let progressBonus = 0;
    
    // 効果倍率を適用
    Object.keys(modifiedEffects).forEach(key => {
      if (typeof modifiedEffects[key] === 'number') {
        modifiedEffects[key] = Math.round(modifiedEffects[key] * combo.effects.bonusMultiplier);
      }
    });
    
    // 特殊効果を収集
    if (combo.effects.specialEffects) {
      specialEffects.push(...combo.effects.specialEffects);
    }
    
    // 進行ボーナス
    if (combo.effects.progressBonus) {
      progressBonus = combo.effects.progressBonus;
    }
    
    return {
      modifiedEffects,
      specialEffects,
      progressBonus
    };
  }

  // コンボの成功率を計算
  calculateComboSuccessRate(
    combo: CardCombo,
    handCards: TrainingCard[],
    playerStats: any
  ): number {
    let baseRate = 70; // 基本成功率
    
    // プレイヤーレベルによる補正
    if (combo.unlockConditions.playerLevel) {
      const levelBonus = Math.min(
        (playerStats.level - combo.unlockConditions.playerLevel) * 5,
        20
      );
      baseRate += levelBonus;
    }
    
        // カードの質による補正
    const highRarityCards = handCards.filter(card =>
      card.rarity === 'rare' || card.rarity === 'legendary'
    );
    baseRate += highRarityCards.length * 10;
    
    // 手札サイズによる補正
    if (handCards.length >= 6) {
      baseRate += 15; // 手札が多いと成功率アップ
    }
    
    return Math.min(Math.max(baseRate, 10), 95); // 10-95%の範囲に制限
  }
}

// コンボ履歴管理
export class ComboHistoryManager {
  private comboHistory: Array<{
    comboId: string;
    usedCards: string[];
    timestamp: Date;
    success: boolean;
    effects: any;
  }> = [];

  // コンボ使用を記録
  recordComboUsage(
    comboId: string,
    usedCards: string[],
    success: boolean,
    effects: any
  ): void {
    this.comboHistory.push({
      comboId,
      usedCards,
      timestamp: new Date(),
      success,
      effects
    });
  }

  // コンボ履歴を取得
  getComboHistory(): typeof this.comboHistory {
    return [...this.comboHistory];
  }

  // 特定のコンボの使用回数を取得
  getComboUsageCount(comboId: string): number {
    return this.comboHistory.filter(record => record.comboId === comboId).length;
  }

  // 成功したコンボの履歴を取得
  getSuccessfulCombos(): typeof this.comboHistory {
    return this.comboHistory.filter(record => record.success);
  }

  // コンボ履歴をクリア
  clearHistory(): void {
    this.comboHistory = [];
  }
}
