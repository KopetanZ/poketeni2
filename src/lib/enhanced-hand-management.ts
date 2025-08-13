// 拡張手札管理システム - Phase 1
import { TrainingCard, CardRarity } from '@/types/training-cards';

// 拡張手札管理インターフェース
export interface EnhancedHandManagement {
  // 基本設定
  baseHandSize: number;
  maxHandSize: number;
  
  // 拡張要素
  bonusSlots: {
    facilityBonus: number;
    reputationBonus: number;
    eventBonus: number;
  };
  
  // カード保持システム
  retention: {
    enabled: boolean;
    maxRetainedCards: number;
    retentionCost: number;
    retainedCards: TrainingCard[];
  };
  
  // デッキ選択
  preferredCategories: string[];
  bannedCards: string[];
}

// 手札拡張計算
export function calculateHandSize(
  baseSize: number,
  facilityLevel: number,
  reputation: number,
  activeEvents: any[]
): number {
  let totalSize = baseSize;
  
  // 施設ボーナス（レベル10毎に+1、最大+2）
  totalSize += Math.min(Math.floor(facilityLevel / 10), 2);
  
  // 評判ボーナス（80以上で+1）
  if (reputation >= 80) totalSize += 1;
  
  // イベントボーナス
  const eventBonus = activeEvents.reduce((bonus, event) => {
    if (event.effects?.handSizeBonus) {
      return bonus + event.effects.handSizeBonus;
    }
    return bonus;
  }, 0);
  
  return Math.min(totalSize + eventBonus, 8); // 最大8枚
}

// カード保持システム
export class CardRetentionSystem {
  private retainedCards: TrainingCard[] = [];
  private maxRetainedCards: number = 3;
  private retentionCost: number = 1000; // 1枚あたりの保持コスト

  // カードを保持する
  retainCard(card: TrainingCard, playerFunds: number): boolean {
    if (this.retainedCards.length >= this.maxRetainedCards) {
      return false; // 最大保持数に達している
    }
    
    if (playerFunds < this.retentionCost) {
      return false; // 資金不足
    }
    
    this.retainedCards.push(card);
    return true;
  }

  // 保持カードを取得
  getRetainedCards(): TrainingCard[] {
    return [...this.retainedCards];
  }

  // 保持カードを解放
  releaseCard(cardId: string): TrainingCard | null {
    const index = this.retainedCards.findIndex(card => card.id === cardId);
    if (index === -1) return null;
    
    return this.retainedCards.splice(index, 1)[0];
  }

  // 保持コストを取得
  getRetentionCost(): number {
    return this.retainedCards.length * this.retentionCost;
  }
}

// 手札最適化システム
export class HandOptimizationSystem {
  // 手札の最適化提案
  suggestOptimization(
    currentHand: TrainingCard[],
    availableCards: TrainingCard[],
    playerStats: any
  ): {
    recommendedDiscards: string[];
    recommendedAdditions: string[];
    reasoning: string;
  } {
    const recommendations = {
      recommendedDiscards: [] as string[],
      recommendedAdditions: [] as string[],
      reasoning: ''
    };

    // 現在の手札を分析
    const handAnalysis = this.analyzeHand(currentHand);
    
    // プレイヤーの状況に基づいて最適化提案
    if (handAnalysis.physicalCards > 3 && playerStats.stamina < 50) {
      recommendations.recommendedDiscards.push(
        ...currentHand
          .filter(card => card.baseEffects.skillGrowth?.stamina)
          .slice(0, 2)
          .map(card => card.id)
      );
      recommendations.reasoning = '体力不足のため、フィジカル系カードを減らすことを推奨';
    }

    if (handAnalysis.mentalCards < 1 && playerStats.mental < 60) {
      const mentalCards = availableCards.filter(card => 
        card.baseEffects.skillGrowth?.mental && 
        !currentHand.some(handCard => handCard.id === card.id)
      );
      recommendations.recommendedAdditions.push(
        ...mentalCards.slice(0, 2).map(card => card.id)
      );
      recommendations.reasoning += 'メンタル強化が必要';
    }

    return recommendations;
  }

  // 手札の分析
  private analyzeHand(hand: TrainingCard[]): {
    physicalCards: number;
    mentalCards: number;
    technicalCards: number;
    tacticalCards: number;
    specialCards: number;
  } {
    return {
      physicalCards: hand.filter(card => 
        card.baseEffects.skillGrowth?.stamina || 
        card.baseEffects.skillGrowth?.strength
      ).length,
      mentalCards: hand.filter(card => 
        card.baseEffects.skillGrowth?.mental
      ).length,
      technicalCards: hand.filter(card => 
        card.baseEffects.skillGrowth?.serve_skill || 
        card.baseEffects.skillGrowth?.return_skill
      ).length,
      tacticalCards: hand.filter(card => 
        card.baseEffects.skillGrowth?.strategy
      ).length,
      specialCards: hand.filter(card => 
        card.rarity === 'epic' || card.rarity === 'legendary'
      ).length
    };
  }
}

// 手札管理の状態管理
export class HandStateManager {
  private handCards: TrainingCard[] = [];
  private retainedCards: TrainingCard[] = [];
  private discardedCards: TrainingCard[] = [];
  private maxHandSize: number = 5;

  // 手札にカードを追加
  addCard(card: TrainingCard): boolean {
    if (this.handCards.length >= this.maxHandSize) {
      return false; // 手札が満杯
    }
    
    this.handCards.push(card);
    return true;
  }

  // 手札からカードを削除
  removeCard(cardId: string): TrainingCard | null {
    const index = this.handCards.findIndex(card => card.id === cardId);
    if (index === -1) return null;
    
    const removedCard = this.handCards.splice(index, 1)[0];
    this.discardedCards.push(removedCard);
    return removedCard;
  }

  // 手札を取得
  getHandCards(): TrainingCard[] {
    return [...this.handCards];
  }

  // 保持カードを取得
  getRetainedCards(): TrainingCard[] {
    return [...this.retainedCards];
  }

  // 破棄カードを取得
  getDiscardedCards(): TrainingCard[] {
    return [...this.discardedCards];
  }

  // 手札サイズを設定
  setMaxHandSize(size: number): void {
    this.maxHandSize = Math.min(Math.max(size, 3), 8); // 3-8の範囲に制限
  }

  // 手札の状態をリセット
  reset(): void {
    this.handCards = [];
    this.retainedCards = [];
    this.discardedCards = [];
  }
}
