// 統合ゲームバランス管理システム
// 全システムの数値を一元管理し、科学的なバランス調整を実現

import { Player } from '@/types/game';
import { PLAYER_GROWTH_CONFIG, ECONOMIC_BALANCE_CONFIG, EVENT_BALANCE_CONFIG } from './game-balance-config';

export interface BalanceAnalysis {
  playerPowerLevel: number;
  economicHealthScore: number;
  progressionBalance: number;
  recommendations: string[];
}

export class GameBalanceManager {
  // ===== プレイヤー能力値の動的調整 =====
  
  /**
   * レベル帯に応じた能力値上限を取得
   */
  static getStatCapForLevel(level: number): number {
    const config = PLAYER_GROWTH_CONFIG.difficulty_curve;
    
    if (level <= config.early_game.level_range[1]) {
      return config.early_game.skill_cap;
    } else if (level <= config.mid_game.level_range[1]) {
      return config.mid_game.skill_cap;
    } else if (level <= config.late_game.level_range[1]) {
      return config.late_game.skill_cap;
    } else {
      return config.endgame.skill_cap;
    }
  }

  /**
   * レベル帯に応じた成長率を取得
   */
  static getGrowthRateForLevel(level: number): number {
    const config = PLAYER_GROWTH_CONFIG.difficulty_curve;
    
    if (level <= config.early_game.level_range[1]) {
      return config.early_game.growth_rate;
    } else if (level <= config.mid_game.level_range[1]) {
      return config.mid_game.growth_rate;
    } else if (level <= config.late_game.level_range[1]) {
      return config.late_game.growth_rate;
    } else {
      return config.endgame.growth_rate;
    }
  }

  /**
   * 初期ステータスを調整されたバランスで生成
   */
  static generateBalancedInitialStats(role: 'ace' | 'regular' | 'member' | 'rookie'): {
    serve_skill: number;
    return_skill: number; 
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  } {
    const baseStats = PLAYER_GROWTH_CONFIG.initial_stats.base_stats;
    const aceBonus = PLAYER_GROWTH_CONFIG.initial_stats.ace_bonus;

    // 基本値をランダムに決定
    const stats = {
      serve_skill: this.randomBetween(baseStats.serve_skill.min, baseStats.serve_skill.max),
      return_skill: this.randomBetween(baseStats.return_skill.min, baseStats.return_skill.max),
      volley_skill: this.randomBetween(baseStats.volley_skill.min, baseStats.volley_skill.max),
      stroke_skill: this.randomBetween(baseStats.stroke_skill.min, baseStats.stroke_skill.max),
      mental: this.randomBetween(baseStats.mental.min, baseStats.mental.max),
      stamina: this.randomBetween(baseStats.stamina.min, baseStats.stamina.max)
    };

    // 役割に応じたボーナス適用
    switch (role) {
      case 'ace':
        stats.serve_skill += aceBonus.serve_skill;
        stats.return_skill += aceBonus.return_skill;
        stats.volley_skill += aceBonus.volley_skill;
        stats.stroke_skill += aceBonus.stroke_skill;
        stats.mental += aceBonus.mental;
        stats.stamina += aceBonus.stamina;
        break;
      
      case 'regular':
        // レギュラーは特定分野に特化
        const specialtyBonus = Math.floor(Math.random() * 4);
        switch (specialtyBonus) {
          case 0: stats.serve_skill += 5; break;
          case 1: stats.return_skill += 5; break;
          case 2: stats.volley_skill += 5; break;
          case 3: stats.stroke_skill += 5; break;
        }
        stats.mental += 3;
        break;
      
      case 'member':
        // メンバーは平均的だが成長潜在能力あり
        stats.mental += 2;
        break;
      
      case 'rookie':
        // 新人は低めだが伸びしろ大
        Object.keys(stats).forEach(key => {
          (stats as any)[key] = Math.max(1, (stats as any)[key] - 3);
        });
        break;
    }

    return stats;
  }

  /**
   * レベルアップ時の能力値上昇量を計算（バランス調整済み）
   */
  static calculateLevelUpGains(player: Player): Partial<Player> {
    const currentLevel = player.level;
    const growthRate = this.getGrowthRateForLevel(currentLevel);
    const statCap = this.getStatCapForLevel(currentLevel);

    // 現在の能力値に応じて成長幅を調整
    const calculateGain = (currentStat: number) => {
      if (currentStat >= statCap) return 0; // 上限に達している
      
      // 上限に近づくほど成長率を下げる（非線形成長）
      const progressTowardsCap = currentStat / statCap;
      const diminishingFactor = Math.max(0.2, 1 - progressTowardsCap * 0.8);
      
      const baseGain = Math.floor(Math.random() * 3) + 1; // 1-3の基本成長
      return Math.floor(baseGain * growthRate * diminishingFactor);
    };

    return {
      serve_skill: Math.min(statCap, (player.serve_skill || 0) + calculateGain(player.serve_skill || 0)),
      return_skill: Math.min(statCap, (player.return_skill || 0) + calculateGain(player.return_skill || 0)),
      volley_skill: Math.min(statCap, (player.volley_skill || 0) + calculateGain(player.volley_skill || 0)),
      stroke_skill: Math.min(statCap, (player.stroke_skill || 0) + calculateGain(player.stroke_skill || 0)),
      mental: Math.min(statCap, (player.mental || 0) + calculateGain(player.mental || 0)),
      stamina: Math.min(statCap, (player.stamina || 0) + calculateGain(player.stamina || 0))
    };
  }

  /**
   * 経験値必要量の動的計算
   */
  static getExperienceRequired(currentLevel: number): number {
    const baseExp = 100;
    const levelMultiplier = Math.pow(1.2, currentLevel - 1);
    const difficultyMultiplier = this.getExperienceMultiplierForLevel(currentLevel);
    
    return Math.floor(baseExp * levelMultiplier / difficultyMultiplier);
  }

  private static getExperienceMultiplierForLevel(level: number): number {
    const config = PLAYER_GROWTH_CONFIG.difficulty_curve;
    
    if (level <= config.early_game.level_range[1]) {
      return config.early_game.experience_multiplier;
    } else if (level <= config.mid_game.level_range[1]) {
      return config.mid_game.experience_multiplier;
    } else if (level <= config.late_game.level_range[1]) {
      return config.late_game.experience_multiplier;
    } else {
      return config.endgame.experience_multiplier;
    }
  }

  // ===== 経済システムのバランス調整 =====
  
  /**
   * 評判に応じた収入の動的計算
   */
  static calculateDailyIncome(schoolReputation: number, playerCount: number): number {
    if (!ECONOMIC_BALANCE_CONFIG) return 500; // フォールバック
    
    const baseIncome = ECONOMIC_BALANCE_CONFIG.daily_income.base_amount;
    const reputationBonus = Math.floor(schoolReputation * ECONOMIC_BALANCE_CONFIG.daily_income.reputation_multiplier);
    const playerCostPenalty = playerCount * ECONOMIC_BALANCE_CONFIG.daily_income.player_count_penalty;
    
    return Math.max(100, baseIncome + reputationBonus - playerCostPenalty);
  }

  /**
   * アイテム価格の動的調整
   */
  static adjustItemPrice(basePrice: number, rarity: string, marketDemand: number = 1.0): number {
    const rarityMultipliers = {
      'common': 1.0,
      'uncommon': 1.5,
      'rare': 2.5,
      'epic': 4.0,
      'legendary': 7.0
    };
    
    const rarityMultiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1.0;
    return Math.floor(basePrice * rarityMultiplier * marketDemand);
  }

  // ===== イベント発生確率の動的調整 =====
  
  /**
   * プレイヤーレベルと評判に基づくイベント発生確率
   */
  static calculateEventProbability(
    eventRarity: string,
    playerLevel: number, 
    schoolReputation: number
  ): number {
    const baseRates = EVENT_BALANCE_CONFIG?.event_probabilities || {
      common: 0.3,
      uncommon: 0.2,
      rare: 0.1,
      epic: 0.05,
      legendary: 0.01
    };

    const baseRate = baseRates[eventRarity as keyof typeof baseRates] || 0.1;
    
    // レベルボーナス（高レベルほど希少イベントが起きやすい）
    const levelBonus = Math.min(0.1, playerLevel * 0.002);
    
    // 評判ボーナス（評判が高いほど特別なイベントが起きやすい）
    const reputationBonus = Math.min(0.05, schoolReputation * 0.0005);
    
    return Math.min(0.8, baseRate + levelBonus + reputationBonus);
  }

  // ===== バランス分析システム =====
  
  /**
   * 現在のゲーム状態を分析してバランスの問題を特定
   */
  static analyzeGameBalance(players: Player[], schoolData: {
    funds: number;
    reputation: number;
    level: number;
  }): BalanceAnalysis {
    const playerPowerLevel = this.calculateAveragePlayerPower(players);
    const economicHealthScore = this.calculateEconomicHealth(schoolData.funds, schoolData.reputation);
    const progressionBalance = this.calculateProgressionBalance(players);
    
    const recommendations: string[] = [];
    
    // バランス問題の検出と推奨
    if (playerPowerLevel > 80) {
      recommendations.push('プレイヤーが強くなりすぎています。より困難な挑戦を提供することをお勧めします。');
    } else if (playerPowerLevel < 20) {
      recommendations.push('プレイヤーの成長が遅すぎます。成長率を上げるか、より多くの成長機会を提供してください。');
    }
    
    if (economicHealthScore < 30) {
      recommendations.push('経済状況が厳しすぎます。収入を増やすか、支出を減らすことを検討してください。');
    } else if (economicHealthScore > 80) {
      recommendations.push('資金が余りすぎています。より高価なアイテムや施設を追加することをお勧めします。');
    }
    
    if (progressionBalance < 0.3) {
      recommendations.push('プレイヤー間の成長格差が大きすぎます。弱いメンバーへのサポートを強化してください。');
    }

    return {
      playerPowerLevel,
      economicHealthScore,
      progressionBalance,
      recommendations
    };
  }

  // ===== プライベートヘルパーメソッド =====
  
  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static calculateAveragePlayerPower(players: Player[]): number {
    if (players.length === 0) return 0;
    
    const totalPower = players.reduce((sum, player) => {
      const playerPower = (
        (player.serve_skill || 0) +
        (player.return_skill || 0) +
        (player.volley_skill || 0) +
        (player.stroke_skill || 0) +
        (player.mental || 0) +
        (player.stamina || 0)
      ) / 6;
      return sum + playerPower;
    }, 0);
    
    return totalPower / players.length;
  }

  private static calculateEconomicHealth(funds: number, reputation: number): number {
    // 理想的な資金レベルを評判に基づいて計算
    const idealFunds = 5000 + reputation * 50;
    const fundsRatio = Math.min(1.0, funds / idealFunds);
    
    // 評判も考慮した経済健全性スコア
    const reputationScore = Math.min(1.0, reputation / 100);
    
    return (fundsRatio * 0.7 + reputationScore * 0.3) * 100;
  }

  private static calculateProgressionBalance(players: Player[]): number {
    if (players.length <= 1) return 1.0;
    
    const playerPowers = players.map(player => 
      (player.serve_skill || 0) + (player.return_skill || 0) + 
      (player.volley_skill || 0) + (player.stroke_skill || 0) +
      (player.mental || 0) + (player.stamina || 0)
    );
    
    const maxPower = Math.max(...playerPowers);
    const minPower = Math.min(...playerPowers);
    
    if (maxPower === 0) return 1.0;
    
    // 最強と最弱の差が小さいほどバランスが良い
    return Math.max(0, 1 - ((maxPower - minPower) / maxPower));
  }

  // ===== デバッグ・監視機能 =====
  
  /**
   * 現在のバランス設定をコンソールに出力（デバッグ用）
   */
  static debugCurrentBalance(players: Player[], schoolData: any): void {
    console.group('🎮 ゲームバランス分析');
    
    const analysis = this.analyzeGameBalance(players, schoolData);
    console.log('プレイヤー戦力レベル:', analysis.playerPowerLevel.toFixed(1));
    console.log('経済健全性スコア:', analysis.economicHealthScore.toFixed(1));
    console.log('成長バランススコア:', analysis.progressionBalance.toFixed(2));
    
    if (analysis.recommendations.length > 0) {
      console.group('📋 推奨改善事項:');
      analysis.recommendations.forEach(rec => console.log('•', rec));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// 設定適用用のユーティリティクラス
export class BalanceApplier {
  /**
   * 既存プレイヤーに新バランスを適用（非破壊的）
   */
  static applyNewBalanceToPlayer(player: Player): Player {
    const currentStats = GameBalanceManager.generateBalancedInitialStats(
      player.position === 'captain' ? 'ace' :
      player.position === 'regular' ? 'regular' :
      player.position === 'member' ? 'member' : 'rookie'
    );

    // 既存の成長を考慮して調整
    const levelMultiplier = GameBalanceManager.getGrowthRateForLevel(player.level);
    
    return {
      ...player,
      serve_skill: Math.max(currentStats.serve_skill, Math.floor((player.serve_skill || 0) * levelMultiplier)),
      return_skill: Math.max(currentStats.return_skill, Math.floor((player.return_skill || 0) * levelMultiplier)),
      volley_skill: Math.max(currentStats.volley_skill, Math.floor((player.volley_skill || 0) * levelMultiplier)),
      stroke_skill: Math.max(currentStats.stroke_skill, Math.floor((player.stroke_skill || 0) * levelMultiplier)),
      mental: Math.max(currentStats.mental, Math.floor((player.mental || 0) * levelMultiplier)),
      stamina: Math.max(currentStats.stamina, Math.floor((player.stamina || 0) * levelMultiplier))
    };
  }

  /**
   * 全チームに新バランスを適用
   */
  static applyNewBalanceToTeam(players: Player[]): Player[] {
    return players.map(player => this.applyNewBalanceToPlayer(player));
  }
}