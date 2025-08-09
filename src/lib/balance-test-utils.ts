// ゲームバランステスト・デバッグ用ユーティリティ

import { Player } from '@/types/game';
import { GameBalanceManager, BalanceAnalysis } from './game-balance-manager';
import { PlayerGenerator } from './player-generator';

export interface BalanceTestResults {
  player_progression: {
    initial_stats: any;
    level_10_projection: any;
    level_30_projection: any;
    growth_rate_analysis: string[];
  };
  economy_simulation: {
    daily_income_progression: number[];
    sustainability_score: number;
    recommendations: string[];
  };
  equipment_balance: {
    power_scaling_analysis: any[];
    level_appropriateness: string[];
  };
  overall_health: BalanceAnalysis;
}

export class BalanceTestUtils {
  // 成長曲線のテスト
  static testPlayerProgression(initialPlayer: Player): any {
    const projections = [];
    let currentPlayer = { ...initialPlayer };
    
    // レベル1から50まで成長をシミュレート
    for (let level = 1; level <= 50; level++) {
      const gains = GameBalanceManager.calculateLevelUpGains(currentPlayer);
      const expRequired = GameBalanceManager.getExperienceRequired(level);
      const statCap = GameBalanceManager.getStatCapForLevel(level);
      
      projections.push({
        level,
        stats: {
          serve_skill: gains.serve_skill,
          return_skill: gains.return_skill,
          volley_skill: gains.volley_skill,
          stroke_skill: gains.stroke_skill,
          mental: gains.mental,
          stamina: gains.stamina
        },
        stat_cap: statCap,
        experience_required: expRequired,
        growth_rate: GameBalanceManager.getGrowthRateForLevel(level)
      });
      
      // 次のレベルへ
      currentPlayer = {
        ...currentPlayer,
        ...gains,
        level: level + 1,
        experience: expRequired
      };
    }
    
    return projections;
  }

  // 経済バランスのテスト
  static testEconomicProgression(maxDays: number = 365): any {
    const results = [];
    let reputation = 10;
    let playerCount = 6;
    
    for (let day = 1; day <= maxDays; day++) {
      const dailyIncome = GameBalanceManager.calculateDailyIncome(reputation, playerCount);
      
      // 評判とプレイヤー数の自然な変化をシミュレート
      if (day % 30 === 0 && Math.random() > 0.5) {
        reputation += Math.floor(Math.random() * 3) + 1;
      }
      
      if (day % 60 === 0 && playerCount < 10 && reputation > 20) {
        playerCount += 1;
      }
      
      results.push({
        day,
        reputation,
        player_count: playerCount,
        daily_income: dailyIncome,
        monthly_income: day % 30 === 0 ? dailyIncome * 30 : null
      });
    }
    
    return results;
  }

  // イベント確率のテスト
  static testEventProbabilities(iterations: number = 1000): any {
    const eventTypes = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const results: { [key: string]: number } = {};
    
    // 初期化
    eventTypes.forEach(type => results[type] = 0);
    
    for (let i = 0; i < iterations; i++) {
      const playerLevel = Math.floor(Math.random() * 50) + 1;
      const schoolReputation = Math.floor(Math.random() * 100) + 1;
      
      eventTypes.forEach(eventType => {
        const probability = GameBalanceManager.calculateEventProbability(
          eventType, 
          playerLevel, 
          schoolReputation
        );
        
        if (Math.random() < probability) {
          results[eventType]++;
        }
      });
    }
    
    // パーセンテージに変換
    eventTypes.forEach(type => {
      results[type] = (results[type] / iterations) * 100;
    });
    
    return results;
  }

  // 総合バランステスト
  static runComprehensiveBalanceTest(): BalanceTestResults {
    console.log('🎮 包括的ゲームバランステストを開始...');
    
    // テスト用のプレイヤーチームを生成
    const testPlayers = PlayerGenerator.generateBalancedInitialTeam();
    const testSchoolData = {
      funds: 10000,
      reputation: 25,
      level: 5
    };
    
    // 1. プレイヤー成長テスト
    const progressionTest = this.testPlayerProgression(testPlayers[0]);
    const growthAnalysis = this.analyzeGrowthProgression(progressionTest);
    
    // 2. 経済シミュレーション
    const economyTest = this.testEconomicProgression(180); // 半年間
    const economyAnalysis = this.analyzeEconomicProgression(economyTest);
    
    // 3. イベント確率テスト
    const eventTest = this.testEventProbabilities(1000);
    
    // 4. 総合バランス分析
    const overallAnalysis = GameBalanceManager.analyzeGameBalance(testPlayers, testSchoolData);
    
    return {
      player_progression: {
        initial_stats: progressionTest[0],
        level_10_projection: progressionTest[9],
        level_30_projection: progressionTest[29],
        growth_rate_analysis: growthAnalysis
      },
      economy_simulation: {
        daily_income_progression: economyTest.map((day: any) => day.daily_income),
        sustainability_score: economyAnalysis.sustainability_score,
        recommendations: economyAnalysis.recommendations
      },
      equipment_balance: {
        power_scaling_analysis: [],
        level_appropriateness: ['装備バランステストは実装中...']
      },
      overall_health: overallAnalysis
    };
  }

  // 成長進行の分析
  private static analyzeGrowthProgression(progressions: any[]): string[] {
    const analysis: string[] = [];
    
    // 成長率の一貫性をチェック
    const earlyGrowth = progressions.slice(0, 10);
    const midGrowth = progressions.slice(10, 30);
    const lateGrowth = progressions.slice(30, 50);
    
    const earlyAvgGrowth = this.calculateAverageGrowthRate(earlyGrowth);
    const midAvgGrowth = this.calculateAverageGrowthRate(midGrowth);
    const lateAvgGrowth = this.calculateAverageGrowthRate(lateGrowth);
    
    analysis.push(`序盤成長率: ${earlyAvgGrowth.toFixed(2)}`);
    analysis.push(`中盤成長率: ${midAvgGrowth.toFixed(2)}`);
    analysis.push(`終盤成長率: ${lateAvgGrowth.toFixed(2)}`);
    
    if (earlyAvgGrowth > midAvgGrowth && midAvgGrowth > lateAvgGrowth) {
      analysis.push('✅ 成長曲線は適切な減少傾向を示している');
    } else {
      analysis.push('⚠️  成長曲線に不自然な変動がある');
    }
    
    return analysis;
  }

  // 経済進行の分析
  private static analyzeEconomicProgression(economyData: any[]): any {
    const totalDays = economyData.length;
    const finalData = economyData[totalDays - 1];
    const averageIncome = economyData.reduce((sum, day) => sum + day.daily_income, 0) / totalDays;
    
    const sustainability_score = this.calculateEconomicSustainability(economyData);
    const recommendations: string[] = [];
    
    if (averageIncome < 300) {
      recommendations.push('収入が低すぎます。基本収入を増加させることを推奨します');
    }
    
    if (finalData.reputation < 30) {
      recommendations.push('評判の上昇が遅すぎます。イベント報酬を調整してください');
    }
    
    if (sustainability_score < 0.6) {
      recommendations.push('経済システムの持続可能性が低いです');
    }
    
    return {
      sustainability_score,
      recommendations,
      average_income: averageIncome,
      final_reputation: finalData.reputation
    };
  }

  // ヘルパーメソッド
  private static calculateAverageGrowthRate(progressions: any[]): number {
    if (progressions.length === 0) return 0;
    
    const totalGrowth = progressions.reduce((sum, progression) => {
      return sum + progression.growth_rate;
    }, 0);
    
    return totalGrowth / progressions.length;
  }

  private static calculateEconomicSustainability(economyData: any[]): number {
    // 収入の安定性と成長性を評価
    const incomeGrowth = (economyData[economyData.length - 1].daily_income - economyData[0].daily_income) / economyData[0].daily_income;
    const incomeVariability = this.calculateVariability(economyData.map(d => d.daily_income));
    
    // 0-1のスコアで返す
    return Math.max(0, Math.min(1, incomeGrowth * 0.7 + (1 - incomeVariability) * 0.3));
  }

  private static calculateVariability(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean; // 変動係数
  }

  // デバッグ用：バランステスト結果をコンソールに出力
  static printBalanceTestResults(results: BalanceTestResults): void {
    console.group('🎮 ゲームバランステスト結果');
    
    console.group('📈 プレイヤー成長分析');
    console.log('初期ステータス:', results.player_progression.initial_stats);
    console.log('レベル10予測:', results.player_progression.level_10_projection);
    console.log('レベル30予測:', results.player_progression.level_30_projection);
    results.player_progression.growth_rate_analysis.forEach(analysis => console.log(analysis));
    console.groupEnd();
    
    console.group('💰 経済システム分析');
    console.log('持続可能性スコア:', results.economy_simulation.sustainability_score);
    results.economy_simulation.recommendations.forEach(rec => console.log('💡', rec));
    console.groupEnd();
    
    console.group('🎯 総合バランス評価');
    console.log('プレイヤー戦力レベル:', results.overall_health.playerPowerLevel);
    console.log('経済健全性:', results.overall_health.economicHealthScore);
    console.log('成長バランス:', results.overall_health.progressionBalance);
    results.overall_health.recommendations.forEach(rec => console.log('📋', rec));
    console.groupEnd();
    
    console.groupEnd();
  }
}

// 自動テスト実行用（開発時のみ）
export const runBalanceTests = () => {
  if (process.env.NODE_ENV === 'development') {
    const results = BalanceTestUtils.runComprehensiveBalanceTest();
    BalanceTestUtils.printBalanceTestResults(results);
    return results;
  }
};