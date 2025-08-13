// 拡張された特殊能力システム統合管理
// 本家パワプロ・栄冠ナインを上回る特殊能力システムの統合管理

import { 
  EnhancedSpecialAbility, 
  EnhancedSpecialAbilityCalculator,
  CombinedAbilityEffect,
  TennisAbilityCategory,
  TennisAbilityColor,
  TennisAbilityRank
} from '../types/special-abilities';
import { 
  ENHANCED_TENNIS_SPECIAL_ABILITIES,
  getAbilitiesByCategory,
  getAbilitiesByColor,
  getAbilitiesByRank,
  getAbilityById
} from './enhanced-special-abilities-database';
import { 
  EnhancedAbilityAcquisitionSystem,
  AcquisitionResult
} from './enhanced-ability-acquisition-system';

export interface PlayerAbilityState {
  playerId: string;
  abilities: EnhancedSpecialAbility[];
  totalPowerLevel: number;
  categoryBreakdown: Record<TennisAbilityCategory, number>;
  colorBreakdown: Record<TennisAbilityColor, number>;
  rankBreakdown: Record<TennisAbilityRank, number>;
  synergyEffects: any[];
  lastUpdated: Date;
}

export interface AbilityRecommendation {
  ability: EnhancedSpecialAbility;
  recommendation: number;
  reason: string;
  acquisitionMethod: string;
  estimatedProbability: number;
}

export class EnhancedSpecialAbilitiesManager {
  
  // プレイヤーの特殊能力状態を取得
  static getPlayerAbilityState(
    playerId: string,
    playerAbilities: EnhancedSpecialAbility[],
    playerStats: any = {}
  ): PlayerAbilityState {
    
    const totalPowerLevel = playerAbilities.reduce((total, ability) => {
      return total + (ability.powerLevel || 0);
    }, 0);

    const categoryBreakdown = this.getCategoryBreakdown(playerAbilities);
    const colorBreakdown = this.getColorBreakdown(playerAbilities);
    const rankBreakdown = this.getRankBreakdown(playerAbilities);
    const synergyEffects = this.calculateSynergyEffects(playerAbilities);

    return {
      playerId,
      abilities: playerAbilities,
      totalPowerLevel,
      categoryBreakdown,
      colorBreakdown,
      rankBreakdown,
      synergyEffects,
      lastUpdated: new Date()
    };
  }

  // カテゴリ別の能力数集計
  private static getCategoryBreakdown(abilities: EnhancedSpecialAbility[]): Record<TennisAbilityCategory, number> {
    const breakdown: Record<TennisAbilityCategory, number> = {
      serve: 0,
      return: 0,
      volley: 0,
      stroke: 0,
      mental: 0,
      physical: 0,
      situational: 0
    };

    abilities.forEach(ability => {
      if (breakdown[ability.category] !== undefined) {
        breakdown[ability.category]++;
      }
    });

    return breakdown;
  }

  // 色別の能力数集計
  private static getColorBreakdown(abilities: EnhancedSpecialAbility[]): Record<TennisAbilityColor, number> {
    const breakdown: Record<TennisAbilityColor, number> = {
      diamond: 0,
      gold: 0,
      blue: 0,
      green: 0,
      purple: 0,
      orange: 0,
      gray: 0,
      red: 0
    };

    abilities.forEach(ability => {
      if (breakdown[ability.color] !== undefined) {
        breakdown[ability.color]++;
      }
    });

    return breakdown;
  }

  // ランク別の能力数集計
  private static getRankBreakdown(abilities: EnhancedSpecialAbility[]): Record<TennisAbilityRank, number> {
    const breakdown: Record<TennisAbilityRank, number> = {
      'SS+': 0,
      'SS': 0,
      'S+': 0,
      'S': 0,
      'A+': 0,
      'A': 0,
      'B+': 0,
      'B': 0,
      'C': 0,
      'D': 0
    };

    abilities.forEach(ability => {
      if (breakdown[ability.rank] !== undefined) {
        breakdown[ability.rank]++;
      }
    });

    return breakdown;
  }

  // 相乗効果の計算
  private static calculateSynergyEffects(abilities: EnhancedSpecialAbility[]): any[] {
    const synergies: any[] = [];

    // 同系統能力の相乗効果
    const serveAbilities = abilities.filter(a => a.category === 'serve');
    if (serveAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'serve',
        multiplier: 1.1 + (serveAbilities.length - 2) * 0.05,
        description: 'サーブ系能力の相乗効果',
        abilities: serveAbilities.map(a => a.id)
      });
    }

    const returnAbilities = abilities.filter(a => a.category === 'return');
    if (returnAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'return',
        multiplier: 1.1 + (returnAbilities.length - 2) * 0.05,
        description: 'リターン系能力の相乗効果',
        abilities: returnAbilities.map(a => a.id)
      });
    }

    const volleyAbilities = abilities.filter(a => a.category === 'volley');
    if (volleyAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'volley',
        multiplier: 1.1 + (volleyAbilities.length - 2) * 0.05,
        description: 'ボレー系能力の相乗効果',
        abilities: volleyAbilities.map(a => a.id)
      });
    }

    const strokeAbilities = abilities.filter(a => a.category === 'stroke');
    if (strokeAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'stroke',
        multiplier: 1.1 + (strokeAbilities.length - 2) * 0.05,
        description: 'ストローク系能力の相乗効果',
        abilities: strokeAbilities.map(a => a.id)
      });
    }

    const mentalAbilities = abilities.filter(a => a.category === 'mental');
    if (mentalAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'mental',
        multiplier: 1.1 + (mentalAbilities.length - 2) * 0.05,
        description: 'メンタル系能力の相乗効果',
        abilities: mentalAbilities.map(a => a.id)
      });
    }

    // 特定組み合わせの相乗効果
    const hasClutch = abilities.some(a => a.id === 'clutch_server');
    const hasPressure = abilities.some(a => a.id === 'pressure_crusher');
    if (hasClutch && hasPressure) {
      synergies.push({
        type: 'specific_combination',
        abilities: ['clutch_server', 'pressure_crusher'],
        effect: { mentalBoost: 5 },
        description: 'クラッチ＋プレッシャークラッシャーの相乗効果'
      });
    }

    return synergies;
  }

  // プレイヤーの能力値に特殊能力の効果を適用
  static applyAbilityEffects(
    playerStats: any,
    abilities: EnhancedSpecialAbility[],
    situation?: any,
    environment?: any
  ): CombinedAbilityEffect {
    
    return EnhancedSpecialAbilityCalculator.calculateCombinedEffects(abilities, situation, environment);
  }

  // 特殊能力の取得推奨を計算
  static getAbilityRecommendations(
    playerId: string,
    playerStats: any = {},
    playerLevel: number = 1,
    currentAbilities: EnhancedSpecialAbility[] = []
  ): AbilityRecommendation[] {
    
    const recommendations: AbilityRecommendation[] = [];
    const currentAbilityIds = currentAbilities.map(a => a.id);

    // 未所持の特殊能力をフィルタリング
    const availableAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(
      ability => !currentAbilityIds.includes(ability.id) && ability.isActive
    );

    // 各能力について推奨度を計算
    for (const ability of availableAbilities) {
      const recommendation = EnhancedAbilityAcquisitionSystem.calculateAcquisitionRecommendation(
        playerId,
        ability,
        playerStats
      );

      // 取得方法と確率の推定
      const acquisitionMethod = this.determineBestAcquisitionMethod(ability, playerStats, playerLevel);
      const estimatedProbability = this.estimateAcquisitionProbability(ability, acquisitionMethod, playerLevel, playerStats);

      // 推奨理由の生成
      const reason = this.generateRecommendationReason(ability, playerStats, currentAbilities);

      recommendations.push({
        ability,
        recommendation,
        reason,
        acquisitionMethod,
        estimatedProbability
      });
    }

    // 推奨度順にソート
    return recommendations.sort((a, b) => b.recommendation - a.recommendation);
  }

  // 最適な取得方法を決定
  private static determineBestAcquisitionMethod(
    ability: EnhancedSpecialAbility,
    playerStats: any,
    playerLevel: number
  ): string {
    
    // 能力の色とランクに基づいて最適な取得方法を決定
    if (ability.color === 'diamond') {
      return 'event'; // ダイヤ級はイベントが最適
    } else if (ability.color === 'gold') {
      if (playerLevel >= 20) return 'evolution';
      else if (playerLevel >= 10) return 'match';
      else return 'training';
    } else if (ability.color === 'blue') {
      if (playerLevel >= 15) return 'match';
      else return 'training';
    } else if (ability.color === 'green') {
      return 'training'; // 緑特は練習が最適
    } else if (ability.color === 'purple') {
      return 'item'; // 紫特はアイテムが最適
    } else if (ability.color === 'orange') {
      return 'coach'; // 橙特はコーチが最適
    } else {
      return 'training'; // デフォルト
    }
  }

  // 取得確率を推定
  private static estimateAcquisitionProbability(
    ability: EnhancedSpecialAbility,
    method: string,
    playerLevel: number,
    playerStats: any
  ): number {
    
    // 基本確率の取得
    let baseProbability = 0;
    
    if (method === 'training') {
      baseProbability = 2.0; // 基本2%
    } else if (method === 'match') {
      baseProbability = 3.0; // 基本3%
    } else if (method === 'event') {
      baseProbability = 5.0; // 基本5%
    } else if (method === 'evolution') {
      baseProbability = 8.0; // 基本8%
    } else if (method === 'item') {
      baseProbability = 15.0; // 基本15%
    } else if (method === 'coach') {
      baseProbability = 10.0; // 基本10%
    }

    // レベル補正
    const levelBonus = Math.min(playerLevel * 0.1, 2.0);
    
    // ステータス補正
    let statsBonus = 0;
    if (ability.category === 'serve' && playerStats.serve_skill) {
      statsBonus = Math.min(playerStats.serve_skill * 0.01, 1.0);
    } else if (ability.category === 'return' && playerStats.return_skill) {
      statsBonus = Math.min(playerStats.return_skill * 0.01, 1.0);
    } else if (ability.category === 'volley' && playerStats.volley_skill) {
      statsBonus = Math.min(playerStats.volley_skill * 0.01, 1.0);
    } else if (ability.category === 'stroke' && playerStats.stroke_skill) {
      statsBonus = Math.min(playerStats.stroke_skill * 0.01, 1.0);
    } else if (ability.category === 'mental' && playerStats.mental) {
      statsBonus = Math.min(playerStats.mental * 0.01, 1.0);
    }

    return Math.min(baseProbability + levelBonus + statsBonus, 50.0);
  }

  // 推奨理由を生成
  private static generateRecommendationReason(
    ability: EnhancedSpecialAbility,
    playerStats: any,
    currentAbilities: EnhancedSpecialAbility[]
  ): string {
    
    const reasons: string[] = [];

    // ステータスに基づく理由
    if (ability.category === 'serve' && playerStats.serve_skill) {
      if (playerStats.serve_skill < 50) {
        reasons.push('サーブスキルが低いため補強が必要');
      } else if (playerStats.serve_skill > 80) {
        reasons.push('サーブスキルが高いため相性が良い');
      }
    }

    if (ability.category === 'return' && playerStats.return_skill) {
      if (playerStats.return_skill < 50) {
        reasons.push('リターンスキルが低いため補強が必要');
      } else if (playerStats.return_skill > 80) {
        reasons.push('リターンスキルが高いため相性が良い');
      }
    }

    if (ability.category === 'volley' && playerStats.volley_skill) {
      if (playerStats.volley_skill < 50) {
        reasons.push('ボレースキルが低いため補強が必要');
      } else if (playerStats.volley_skill > 80) {
        reasons.push('ボレースキルが高いため相性が良い');
      }
    }

    if (ability.category === 'stroke' && playerStats.stroke_skill) {
      if (playerStats.stroke_skill < 50) {
        reasons.push('ストロークスキルが低いため補強が必要');
      } else if (playerStats.stroke_skill > 80) {
        reasons.push('ストロークスキルが高いため相性が良い');
      }
    }

    if (ability.category === 'mental' && playerStats.mental) {
      if (playerStats.mental < 50) {
        reasons.push('メンタルが低いため補強が必要');
      } else if (playerStats.mental > 80) {
        reasons.push('メンタルが高いため相性が良い');
      }
    }

    // レアリティに基づく理由
    if (ability.color === 'diamond') {
      reasons.push('伝説級の超レア能力');
    } else if (ability.color === 'gold') {
      reasons.push('金特級の強力な能力');
    } else if (ability.color === 'blue') {
      reasons.push('青特級の安定した能力');
    } else if (ability.color === 'green') {
      reasons.push('成長を促進する能力');
    }

    // 相乗効果に基づく理由
    const synergyWithCurrent = this.checkSynergyWithCurrent(ability, currentAbilities);
    if (synergyWithCurrent) {
      reasons.push(`既存能力との相乗効果が期待できる`);
    }

    return reasons.length > 0 ? reasons.join('、') : 'バランスの取れた能力';
  }

  // 既存能力との相乗効果をチェック
  private static checkSynergyWithCurrent(
    newAbility: EnhancedSpecialAbility,
    currentAbilities: EnhancedSpecialAbility[]
  ): boolean {
    
    // 同系統の能力があるかチェック
    const sameCategoryAbilities = currentAbilities.filter(a => a.category === newAbility.category);
    if (sameCategoryAbilities.length >= 1) {
      return true;
    }

    // 特定の組み合わせをチェック
    const hasClutch = currentAbilities.some(a => a.id === 'clutch_server');
    const hasPressure = currentAbilities.some(a => a.id === 'pressure_crusher');
    
    if (newAbility.id === 'mental_titan' && hasClutch && hasPressure) {
      return true;
    }

    return false;
  }

  // 特殊能力の組み合わせ可能な組み合わせを取得
  static getAvailableCombinations(
    playerAbilities: EnhancedSpecialAbility[]
  ): any[] {
    
    const availableCombinations: any[] = [];
    const playerAbilityIds = playerAbilities.map(a => a.id);

    // 各組み合わせについて、必要な能力をチェック
    for (const combination of [
      {
        id: 'power_precision_serve',
        requiredAbilities: ['power_serve_elite', 'precision_serve_master'],
        resultAbility: 'perfect_serve_master',
        combinationName: 'パワー＋精密→完璧',
        description: 'パワーと精密性を併せ持つ究極のサーブ',
        successRate: 15
      },
      {
        id: 'defense_counter_absolute',
        requiredAbilities: ['defensive_wall_supreme', 'counter_attack_king'],
        resultAbility: 'absolute_defense_counter',
        combinationName: '鉄壁＋カウンター→絶対',
        description: '守備から反撃への完璧な流れ',
        successRate: 12
      },
      {
        id: 'mental_titan_combination',
        requiredAbilities: ['clutch_server', 'pressure_crusher', 'fighting_spirit'],
        resultAbility: 'mental_titan',
        combinationName: '3大メンタル→巨人',
        description: '3つのメンタル能力が融合した究極の精神力',
        successRate: 5
      }
    ]) {
      const hasAllRequired = combination.requiredAbilities.every(
        requiredId => playerAbilityIds.includes(requiredId)
      );

      if (hasAllRequired) {
        availableCombinations.push({
          ...combination,
          missingAbilities: [],
          ready: true
        });
      } else {
        const missingAbilities = combination.requiredAbilities.filter(
          requiredId => !playerAbilityIds.includes(requiredId)
        );
        
        availableCombinations.push({
          ...combination,
          missingAbilities,
          ready: false
        });
      }
    }

    return availableCombinations;
  }

  // 特殊能力の統計情報を取得
  static getAbilityStatistics(): any {
    const totalAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES.length;
    
    const categoryStats = {
      serve: getAbilitiesByCategory('serve').length,
      return: getAbilitiesByCategory('return').length,
      volley: getAbilitiesByCategory('volley').length,
      stroke: getAbilitiesByCategory('stroke').length,
      mental: getAbilitiesByCategory('mental').length,
      physical: getAbilitiesByCategory('physical').length,
      situational: getAbilitiesByCategory('situational').length
    };

    const colorStats = {
      diamond: getAbilitiesByColor('diamond').length,
      gold: getAbilitiesByColor('gold').length,
      blue: getAbilitiesByColor('blue').length,
      green: getAbilitiesByColor('green').length,
      purple: getAbilitiesByColor('purple').length,
      orange: getAbilitiesByColor('orange').length,
      gray: getAbilitiesByColor('gray').length,
      red: getAbilitiesByColor('red').length
    };

    const rankStats = {
      'SS+': getAbilitiesByRank('SS+').length,
      'SS': getAbilitiesByRank('SS').length,
      'S+': getAbilitiesByRank('S+').length,
      'S': getAbilitiesByRank('S').length,
      'A+': getAbilitiesByRank('A+').length,
      'A': getAbilitiesByRank('A').length,
      'B+': getAbilitiesByRank('B+').length,
      'B': getAbilitiesByRank('B').length,
      'C': getAbilitiesByRank('C').length,
      'D': getAbilitiesByRank('D').length
    };

    return {
      total: totalAbilities,
      byCategory: categoryStats,
      byColor: colorStats,
      byRank: rankStats,
      lastUpdated: new Date()
    };
  }

  // 特殊能力の検索
  static searchAbilities(
    query: string,
    filters?: {
      category?: TennisAbilityCategory;
      color?: TennisAbilityColor;
      rank?: TennisAbilityRank;
      minPowerLevel?: number;
      maxPowerLevel?: number;
    }
  ): EnhancedSpecialAbility[] {
    
    let results = ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(ability => ability.isActive);

    // テキスト検索
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(ability => 
        ability.name.toLowerCase().includes(lowerQuery) ||
        ability.englishName.toLowerCase().includes(lowerQuery) ||
        ability.description.toLowerCase().includes(lowerQuery)
      );
    }

    // フィルタリング
    if (filters) {
      if (filters.category) {
        results = results.filter(ability => ability.category === filters.category);
      }
      
      if (filters.color) {
        results = results.filter(ability => ability.color === filters.color);
      }
      
      if (filters.rank) {
        results = results.filter(ability => ability.rank === filters.rank);
      }
      
      if (filters.minPowerLevel !== undefined) {
        results = results.filter(ability => (ability.powerLevel || 0) >= filters.minPowerLevel!);
      }
      
      if (filters.maxPowerLevel !== undefined) {
        results = results.filter(ability => (ability.powerLevel || 0) <= filters.maxPowerLevel!);
      }
    }

    return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }
}
