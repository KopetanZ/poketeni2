// デッキ構築システム - Phase 1
import { TrainingCard, CardRarity } from '@/types/training-cards';

// デッキ構築インターフェース
export interface CustomDeck {
  id: string;
  name: string;
  description: string;
  
  // デッキ構成
  composition: {
    guaranteedCards: string[]; // 確定カード
    preferredCategories: string[]; // 優先カテゴリ
    rarityWeights: Record<CardRarity, number>; // レア度重み
    excludedCards: string[]; // 除外カード
  };
  
  // デッキ効果
  deckEffects: {
    categoryBonus: Record<string, number>; // カテゴリボーナス
    comboChanceBonus: number; // コンボ発生率アップ
    specialDrawChance: number; // 特殊ドロー確率
  };
  
  // 解放条件
  unlockRequirements: {
    playerLevel: number;
    schoolFunds: number;
    completedAchievements: string[];
  };
}

// デッキテンプレート例
export const DECK_TEMPLATES: CustomDeck[] = [
  {
    id: 'balanced_growth',
    name: 'バランス成長デッキ',
    description: '全能力値をバランス良く向上させる',
    composition: {
      guaranteedCards: [],
      preferredCategories: ['technical', 'physical', 'mental'],
      rarityWeights: {
        common: 40,
        uncommon: 35,
        rare: 20,
        epic: 5,
        legendary: 0
      },
      excludedCards: []
    },
    deckEffects: {
      categoryBonus: {
        technical: 1.1,
        physical: 1.1,
        mental: 1.1,
        tactical: 1.0,
        special: 1.0
      },
      comboChanceBonus: 10,
      specialDrawChance: 0
    },
    unlockRequirements: {
      playerLevel: 1,
      schoolFunds: 0,
      completedAchievements: []
    }
  },
  
  {
    id: 'power_specialist',
    name: 'パワー特化デッキ',
    description: 'サーブとボレーに特化した攻撃的なデッキ',
    composition: {
      guaranteedCards: ['power_serve_training'],
      preferredCategories: ['technical', 'physical'],
      rarityWeights: {
        common: 20,
        uncommon: 30,
        rare: 35,
        epic: 10,
        legendary: 5
      },
      excludedCards: ['meditation_focus']
    },
    deckEffects: {
      categoryBonus: {
        technical: 1.3,
        physical: 1.2,
        mental: 0.8,
        tactical: 1.0,
        special: 1.0
      },
      comboChanceBonus: 15,
      specialDrawChance: 5
    },
    unlockRequirements: {
      playerLevel: 8,
      schoolFunds: 50000,
      completedAchievements: ['power_serve_master']
    }
  },
  
  {
    id: 'mental_fortress',
    name: 'メンタル要塞デッキ',
    description: '精神力を極限まで高める防御特化デッキ',
    composition: {
      guaranteedCards: ['zen_meditation', 'mental_focus'],
      preferredCategories: ['mental', 'tactical'],
      rarityWeights: {
        common: 15,
        uncommon: 25,
        rare: 40,
        epic: 15,
        legendary: 5
      },
      excludedCards: ['intensive_physical']
    },
    deckEffects: {
      categoryBonus: {
        technical: 0.9,
        physical: 0.7,
        mental: 1.4,
        tactical: 1.3,
        special: 1.1
      },
      comboChanceBonus: 20,
      specialDrawChance: 8
    },
    unlockRequirements: {
      playerLevel: 12,
      schoolFunds: 80000,
      completedAchievements: ['mental_master', 'zen_achievement']
    }
  }
];

// デッキ構築システム
export class DeckBuilderSystem {
  // 利用可能なデッキテンプレートを取得
  getAvailableDecks(
    playerLevel: number,
    schoolFunds: number,
    completedAchievements: string[]
  ): CustomDeck[] {
    return DECK_TEMPLATES.filter(deck => {
      if (playerLevel < deck.unlockRequirements.playerLevel) return false;
      if (schoolFunds < deck.unlockRequirements.schoolFunds) return false;
      
      const hasAllAchievements = deck.unlockRequirements.completedAchievements.every(
        achievement => completedAchievements.includes(achievement)
      );
      if (!hasAllAchievements) return false;
      
      return true;
    });
  }

  // デッキの効果を計算
  calculateDeckEffects(
    deck: CustomDeck,
    currentHand: TrainingCard[]
  ): {
    categoryBonuses: Record<string, number>;
    comboChance: number;
    specialDrawChance: number;
    overallRating: number;
  } {
    const categoryBonuses: Record<string, number> = {};
    let comboChance = deck.deckEffects.comboChanceBonus;
    let specialDrawChance = deck.deckEffects.specialDrawChance;
    
    // カテゴリボーナスを適用
    Object.entries(deck.deckEffects.categoryBonus).forEach(([category, bonus]) => {
      const categoryCards = currentHand.filter(card => 
        card.category === category || 
        (category === 'technical' && (card.baseEffects.skillGrowth?.serve_skill || card.baseEffects.skillGrowth?.return_skill)) ||
        (category === 'physical' && (card.baseEffects.skillGrowth?.stamina || card.baseEffects.skillGrowth?.strength)) ||
        (category === 'mental' && card.baseEffects.skillGrowth?.mental)
      );
      
      if (categoryCards.length > 0) {
        categoryBonuses[category] = bonus;
        comboChance += categoryCards.length * 2; // カテゴリ一致カードが多いとコンボ確率アップ
      }
    });
    
    // 全体評価を計算
    const overallRating = this.calculateOverallRating(deck, currentHand);
    
    return {
      categoryBonuses,
      comboChance: Math.min(comboChance, 50), // 最大50%
      specialDrawChance: Math.min(specialDrawChance, 20), // 最大20%
      overallRating
    };
  }

  // デッキの全体評価を計算
  private calculateOverallRating(deck: CustomDeck, currentHand: TrainingCard[]): number {
    let rating = 50; // 基本評価
    
    // カテゴリ一致度
    const categoryMatches = currentHand.filter(card => 
      deck.composition.preferredCategories.includes(card.category || 'general')
    ).length;
    rating += categoryMatches * 5;
    
    // レア度分布
    const rarityDistribution = this.analyzeRarityDistribution(currentHand);
    const targetDistribution = deck.composition.rarityWeights;
    
    Object.entries(targetDistribution).forEach(([rarity, targetWeight]) => {
      const actualWeight = rarityDistribution[rarity as CardRarity] || 0;
      const difference = Math.abs(actualWeight - targetWeight);
      rating -= difference * 0.5; // 目標分布との差で減点
    });
    
    // 除外カードの存在チェック
    const hasExcludedCards = currentHand.some(card => 
      deck.composition.excludedCards.includes(card.id)
    );
    if (hasExcludedCards) {
      rating -= 20; // 除外カードがあると大幅減点
    }
    
    return Math.max(Math.min(rating, 100), 0); // 0-100の範囲に制限
  }

  // レア度分布を分析
  private analyzeRarityDistribution(hand: TrainingCard[]): Record<CardRarity, number> {
    const distribution: Record<CardRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };
    
    hand.forEach(card => {
      distribution[card.rarity]++;
    });
    
    // パーセンテージに変換
    const total = hand.length;
    Object.keys(distribution).forEach(rarity => {
      distribution[rarity as CardRarity] = Math.round((distribution[rarity as CardRarity] / total) * 100);
    });
    
    return distribution;
  }

  // デッキ最適化提案
  suggestDeckOptimization(
    currentDeck: CustomDeck,
    currentHand: TrainingCard[],
    availableCards: TrainingCard[]
  ): {
    recommendedChanges: string[];
    priorityActions: string[];
    expectedImprovement: number;
  } {
    const recommendations = {
      recommendedChanges: [] as string[],
      priorityActions: [] as string[],
      expectedImprovement: 0
    };
    
    const currentRating = this.calculateOverallRating(currentDeck, currentHand);
    
    // カテゴリバランスの改善提案
    const categoryAnalysis = this.analyzeCategoryBalance(currentHand, currentDeck);
    if (categoryAnalysis.imbalancedCategories.length > 0) {
      recommendations.recommendedChanges.push(
        `カテゴリバランスの改善: ${categoryAnalysis.imbalancedCategories.join(', ')}`
      );
      recommendations.expectedImprovement += 15;
    }
    
    // レア度分布の最適化
    const rarityAnalysis = this.analyzeRarityOptimization(currentHand, currentDeck);
    if (rarityAnalysis.needsAdjustment) {
      recommendations.recommendedChanges.push(
        `レア度分布の調整: ${rarityAnalysis.suggestions.join(', ')}`
      );
      recommendations.expectedImprovement += 10;
    }
    
    // 除外カードの除去
    const excludedCards = currentHand.filter(card => 
      currentDeck.composition.excludedCards.includes(card.id)
    );
    if (excludedCards.length > 0) {
      recommendations.priorityActions.push(
        `除外カードの除去: ${excludedCards.map(card => card.name).join(', ')}`
      );
      recommendations.expectedImprovement += 20;
    }
    
    return recommendations;
  }

  // カテゴリバランスを分析
  private analyzeCategoryBalance(
    hand: TrainingCard[],
    deck: CustomDeck
  ): {
    imbalancedCategories: string[];
    suggestions: string[];
  } {
    const categoryCounts: Record<string, number> = {};
    deck.composition.preferredCategories.forEach(category => {
      categoryCounts[category] = 0;
    });
    
    hand.forEach(card => {
      const category = card.category || 'general';
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      }
    });
    
    const imbalancedCategories: string[] = [];
    const suggestions: string[] = [];
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count === 0) {
        imbalancedCategories.push(category);
        suggestions.push(`${category}カテゴリのカードを追加`);
      } else if (count > 3) {
        imbalancedCategories.push(category);
        suggestions.push(`${category}カテゴリのカードを減らす`);
      }
    });
    
    return { imbalancedCategories, suggestions };
  }

  // レア度最適化を分析
  private analyzeRarityOptimization(
    hand: TrainingCard[],
    deck: CustomDeck
  ): {
    needsAdjustment: boolean;
    suggestions: string[];
  } {
    const currentDistribution = this.analyzeRarityDistribution(hand);
    const targetDistribution = deck.composition.rarityWeights;
    
    const suggestions: string[] = [];
    let needsAdjustment = false;
    
    Object.entries(targetDistribution).forEach(([rarity, targetWeight]) => {
      const currentWeight = currentDistribution[rarity as CardRarity] || 0;
      const difference = targetWeight - currentWeight;
      
      if (Math.abs(difference) > 10) {
        needsAdjustment = true;
        if (difference > 0) {
          suggestions.push(`${rarity}レア度のカードを増やす`);
        } else {
          suggestions.push(`${rarity}レア度のカードを減らす`);
        }
      }
    });
    
    return { needsAdjustment, suggestions };
  }
}

// デッキ保存・読み込みシステム
export class DeckStorageSystem {
  private readonly STORAGE_KEY = 'poketeni_custom_decks';
  
  // デッキを保存
  saveDeck(deck: CustomDeck): void {
    try {
      const existingDecks = this.loadAllDecks();
      const updatedDecks = existingDecks.filter(d => d.id !== deck.id);
      updatedDecks.push(deck);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedDecks));
    } catch (error) {
      console.error('デッキの保存に失敗しました:', error);
    }
  }
  
  // 全デッキを読み込み
  loadAllDecks(): CustomDeck[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('デッキの読み込みに失敗しました:', error);
      return [];
    }
  }
  
  // 特定のデッキを読み込み
  loadDeck(deckId: string): CustomDeck | null {
    const allDecks = this.loadAllDecks();
    return allDecks.find(deck => deck.id === deckId) || null;
  }
  
  // デッキを削除
  deleteDeck(deckId: string): boolean {
    try {
      const existingDecks = this.loadAllDecks();
      const updatedDecks = existingDecks.filter(d => d.id !== deckId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedDecks));
      return true;
    } catch (error) {
      console.error('デッキの削除に失敗しました:', error);
      return false;
    }
  }
  
  // 全デッキをクリア
  clearAllDecks(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('デッキのクリアに失敗しました:', error);
    }
  }
}
