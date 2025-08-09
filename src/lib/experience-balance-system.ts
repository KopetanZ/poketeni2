// 経験値バランスシステム - 栄冠ナイン式バランス調整

import { Player } from '@/types/game';
import { GameBalanceManager } from './game-balance-manager';

export interface ExperienceGainConfig {
  // 試合タイプ別基本経験値
  match_base_exp: {
    practice: number;      // 練習試合
    friendly: number;      // 親善試合
    tournament: number;    // 公式大会
    important: number;     // 重要な試合
  };
  
  // 練習タイプ別基本経験値（少なめ）
  training_base_exp: {
    basic: number;         // 基礎練習
    technical: number;     // 技術練習
    mental: number;        // メンタル練習
    stamina: number;       // 体力練習
    special: number;       // 特別練習
  };
  
  // 制限システム
  daily_limits: {
    practice_matches: number;    // 1日の練習試合制限
    training_sessions: number;   // 1日の練習制限
    max_daily_exp: number;      // 1日の最大経験値
  };
}

const EXPERIENCE_CONFIG: ExperienceGainConfig = {
  match_base_exp: {
    practice: 8,      // 練習試合は控えめ
    friendly: 15,     // 親善試合は標準
    tournament: 25,   // 公式大会は高め
    important: 40     // 重要な試合は最高
  },
  
  training_base_exp: {
    basic: 2,         // 基礎練習は少なめ
    technical: 3,     // 技術練習
    mental: 2,        // メンタル練習
    stamina: 3,       // 体力練習
    special: 5        // 特別練習は効果高い
  },
  
  daily_limits: {
    practice_matches: 3,     // 練習試合は1日3回まで
    training_sessions: 6,    // 練習は1日6回まで
    max_daily_exp: 80       // 1日の経験値上限
  }
};

export interface DailyActivity {
  date: string;
  practice_matches: number;
  training_sessions: number;
  total_exp_gained: number;
  activities: Array<{
    type: 'match' | 'training' | 'event';
    subtype: string;
    exp_gained: number;
    timestamp: Date;
  }>;
}

export class ExperienceBalanceSystem {
  private static dailyActivities: Map<string, DailyActivity> = new Map();
  
  // 試合からの経験値獲得（制限付き）
  static gainExperienceFromMatch(
    player: Player,
    matchType: 'practice' | 'friendly' | 'tournament' | 'important',
    performance: {
      won: boolean;
      performance_rating: number; // 0.0-2.0 (1.0=標準)
    }
  ): {
    exp_gained: number;
    can_gain: boolean;
    reason?: string;
  } {
    const today = new Date().toDateString();
    const dailyData = this.getDailyActivity(today);
    
    // 練習試合の制限チェック
    if (matchType === 'practice' && dailyData.practice_matches >= EXPERIENCE_CONFIG.daily_limits.practice_matches) {
      return {
        exp_gained: 0,
        can_gain: false,
        reason: `今日はもう練習試合を${EXPERIENCE_CONFIG.daily_limits.practice_matches}回行いました`
      };
    }
    
    // 1日の経験値上限チェック
    if (dailyData.total_exp_gained >= EXPERIENCE_CONFIG.daily_limits.max_daily_exp) {
      return {
        exp_gained: 0,
        can_gain: false,
        reason: '今日はもう十分に経験を積みました。明日また頑張りましょう'
      };
    }
    
    // 基本経験値計算
    let baseExp = EXPERIENCE_CONFIG.match_base_exp[matchType];
    
    // パフォーマンス補正
    const performanceMultiplier = 0.5 + performance.performance_rating * 0.5; // 0.5-1.5倍
    
    // 勝利ボーナス
    const winBonus = performance.won ? 1.2 : 1.0;
    
    // レベル補正（高レベルになるほど基本試合からの経験値減少）
    const levelPenalty = Math.max(0.3, 1.0 - (player.level * 0.015));
    
    // 最終経験値計算
    let finalExp = Math.floor(baseExp * performanceMultiplier * winBonus * levelPenalty);
    
    // 1日上限を考慮して調整
    const remainingExp = EXPERIENCE_CONFIG.daily_limits.max_daily_exp - dailyData.total_exp_gained;
    finalExp = Math.min(finalExp, remainingExp);
    
    // 記録更新
    this.recordActivity(today, 'match', matchType, finalExp);
    if (matchType === 'practice') {
      dailyData.practice_matches++;
    }
    
    return {
      exp_gained: finalExp,
      can_gain: true
    };
  }
  
  // トレーニングからの経験値獲得（より制限が緩い）
  static gainExperienceFromTraining(
    player: Player,
    trainingType: 'basic' | 'technical' | 'mental' | 'stamina' | 'special',
    trainingQuality: number = 1.0 // 0.5-2.0 (カード効果等による)
  ): {
    exp_gained: number;
    can_train: boolean;
    reason?: string;
  } {
    const today = new Date().toDateString();
    const dailyData = this.getDailyActivity(today);
    
    // トレーニング回数制限チェック
    if (dailyData.training_sessions >= EXPERIENCE_CONFIG.daily_limits.training_sessions) {
      return {
        exp_gained: 0,
        can_train: false,
        reason: `今日はもう練習を${EXPERIENCE_CONFIG.daily_limits.training_sessions}回行いました`
      };
    }
    
    // 1日の経験値上限チェック
    if (dailyData.total_exp_gained >= EXPERIENCE_CONFIG.daily_limits.max_daily_exp) {
      return {
        exp_gained: 0,
        can_train: false,
        reason: '今日はもう十分に練習しました。休息も大切です'
      };
    }
    
    // 基本経験値
    let baseExp = EXPERIENCE_CONFIG.training_base_exp[trainingType];
    
    // 練習品質補正
    const qualityMultiplier = Math.max(0.5, Math.min(2.0, trainingQuality));
    
    // レベル補正（高レベルでも練習の価値は保たれる）
    const levelMultiplier = Math.max(0.7, 1.0 - (player.level * 0.008));
    
    // モチベーション補正（低モチベーションだと練習効果減少）
    const motivationMultiplier = Math.max(0.5, (player.motivation || 50) / 100);
    
    // 最終経験値計算
    let finalExp = Math.floor(baseExp * qualityMultiplier * levelMultiplier * motivationMultiplier);
    
    // 1日上限を考慮
    const remainingExp = EXPERIENCE_CONFIG.daily_limits.max_daily_exp - dailyData.total_exp_gained;
    finalExp = Math.min(finalExp, remainingExp);
    
    // 記録更新
    this.recordActivity(today, 'training', trainingType, finalExp);
    dailyData.training_sessions++;
    
    return {
      exp_gained: finalExp,
      can_train: true
    };
  }
  
  // 特別イベントからの経験値（制限外）
  static gainExperienceFromEvent(
    player: Player,
    eventType: string,
    expAmount: number
  ): number {
    const today = new Date().toDateString();
    
    // イベント経験値は1日制限の対象外だが、レベル補正は適用
    const levelMultiplier = GameBalanceManager.getGrowthRateForLevel(player.level);
    const finalExp = Math.floor(expAmount * levelMultiplier);
    
    this.recordActivity(today, 'event' as any, eventType, finalExp);
    
    return finalExp;
  }
  
  // プレイヤーの経験値を実際に増加させる
  static applyExperienceGain(player: Player, expGain: number): Player {
    const newPlayer = { ...player };
    newPlayer.experience = (newPlayer.experience || 0) + expGain;
    
    // レベルアップチェック
    const requiredExp = GameBalanceManager.getExperienceRequired(newPlayer.level);
    if (newPlayer.experience >= requiredExp) {
      // レベルアップ処理
      const levelUpGains = GameBalanceManager.calculateLevelUpGains(newPlayer);
      Object.assign(newPlayer, levelUpGains);
      newPlayer.level += 1;
      newPlayer.experience -= requiredExp;
      
      // レベルアップ通知用フラグ
      (newPlayer as any).leveledUp = true;
    }
    
    return newPlayer;
  }
  
  // 今日の活動状況を取得
  static getTodayActivity(): DailyActivity {
    const today = new Date().toDateString();
    return this.getDailyActivity(today);
  }
  
  // 活動制限の残り回数を取得
  static getRemainingActivities(): {
    practice_matches: number;
    training_sessions: number;
    exp_capacity: number;
  } {
    const today = this.getTodayActivity();
    
    return {
      practice_matches: Math.max(0, EXPERIENCE_CONFIG.daily_limits.practice_matches - today.practice_matches),
      training_sessions: Math.max(0, EXPERIENCE_CONFIG.daily_limits.training_sessions - today.training_sessions),
      exp_capacity: Math.max(0, EXPERIENCE_CONFIG.daily_limits.max_daily_exp - today.total_exp_gained)
    };
  }
  
  // 次の日にリセット（日付変更時に呼び出し）
  static resetDailyLimits(): void {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    this.dailyActivities.delete(yesterday);
  }
  
  // プライベートメソッド
  private static getDailyActivity(date: string): DailyActivity {
    if (!this.dailyActivities.has(date)) {
      this.dailyActivities.set(date, {
        date,
        practice_matches: 0,
        training_sessions: 0,
        total_exp_gained: 0,
        activities: []
      });
    }
    return this.dailyActivities.get(date)!;
  }
  
  private static recordActivity(
    date: string,
    type: 'match' | 'training' | 'event',
    subtype: string,
    expGained: number
  ): void {
    const dailyData = this.getDailyActivity(date);
    dailyData.total_exp_gained += expGained;
    dailyData.activities.push({
      type,
      subtype,
      exp_gained: expGained,
      timestamp: new Date()
    });
  }
  
  // バランス分析用
  static analyzeExperienceBalance(days: number = 30): {
    average_daily_exp: number;
    match_vs_training_ratio: number;
    level_progression_rate: number;
    balance_recommendations: string[];
  } {
    const recentDays = Array.from(this.dailyActivities.entries())
      .slice(-days)
      .map(([date, data]) => data);
    
    if (recentDays.length === 0) {
      return {
        average_daily_exp: 0,
        match_vs_training_ratio: 0,
        level_progression_rate: 0,
        balance_recommendations: ['データが不足しています']
      };
    }
    
    const totalExp = recentDays.reduce((sum, day) => sum + day.total_exp_gained, 0);
    const averageDailyExp = totalExp / recentDays.length;
    
    const matchExp = recentDays.reduce((sum, day) => 
      sum + day.activities.filter(a => a.type === 'match').reduce((s, a) => s + a.exp_gained, 0), 0
    );
    const trainingExp = recentDays.reduce((sum, day) => 
      sum + day.activities.filter(a => a.type === 'training').reduce((s, a) => s + a.exp_gained, 0), 0
    );
    
    const recommendations: string[] = [];
    
    if (averageDailyExp < 30) {
      recommendations.push('経験値獲得量が少なすぎます。練習の効果を上げることを検討してください');
    }
    
    if (averageDailyExp > 70) {
      recommendations.push('経験値獲得量が多すぎます。制限を厳しくすることを検討してください');
    }
    
    const matchTrainingRatio = trainingExp > 0 ? matchExp / trainingExp : 0;
    if (matchTrainingRatio > 3) {
      recommendations.push('試合に依存しすぎています。練習の重要性を高めてください');
    }
    
    return {
      average_daily_exp: averageDailyExp,
      match_vs_training_ratio: matchTrainingRatio,
      level_progression_rate: averageDailyExp / 100, // 概算
      balance_recommendations: recommendations
    };
  }
}

// 使いやすいヘルパー関数
export const ExperienceHelpers = {
  // 経験値獲得の可否チェック
  canGainExperience: (type: 'match' | 'training'): boolean => {
    const remaining = ExperienceBalanceSystem.getRemainingActivities();
    
    if (type === 'match') {
      return remaining.practice_matches > 0 && remaining.exp_capacity > 0;
    } else {
      return remaining.training_sessions > 0 && remaining.exp_capacity > 0;
    }
  },
  
  // 今日の進捗表示用データ
  getTodayProgress: () => {
    const today = ExperienceBalanceSystem.getTodayActivity();
    const remaining = ExperienceBalanceSystem.getRemainingActivities();
    
    return {
      練習試合: `${today.practice_matches}/${EXPERIENCE_CONFIG.daily_limits.practice_matches}`,
      練習回数: `${today.training_sessions}/${EXPERIENCE_CONFIG.daily_limits.training_sessions}`,
      経験値: `${today.total_exp_gained}/${EXPERIENCE_CONFIG.daily_limits.max_daily_exp}`,
      remaining
    };
  },
  
  // 経験値の種類別色分け
  getExpTypeColor: (type: string): string => {
    const colors = {
      practice: 'text-blue-600',    // 練習試合
      friendly: 'text-green-600',   // 親善試合
      tournament: 'text-purple-600', // 大会
      important: 'text-red-600',    // 重要試合
      basic: 'text-gray-600',       // 基礎練習
      technical: 'text-indigo-600', // 技術練習
      mental: 'text-pink-600',      // メンタル練習
      stamina: 'text-orange-600',   // 体力練習
      special: 'text-yellow-600'    // 特別練習
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  }
};