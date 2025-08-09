// エラーハンドリングとバリデーションシステム

export class GameError extends Error {
  constructor(
    message: string, 
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public context?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class ValidationError extends GameError {
  constructor(message: string, field: string, value: any) {
    super(message, 'VALIDATION_ERROR', 'medium', { field, value });
    this.name = 'ValidationError';
  }
}

// バリデーション関数群
export const Validators = {
  // プレイヤーステータス検証
  validatePlayerStats: (player: any): void => {
    if (!player) {
      throw new ValidationError('プレイヤーデータが不正です', 'player', player);
    }

    // レベル検証
    if (player.level && (player.level < 1 || player.level > 50)) {
      throw new ValidationError('レベルが範囲外です (1-50)', 'level', player.level);
    }

    // スキル値検証
    const skills = ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'];
    skills.forEach(skill => {
      if (player[skill] && (player[skill] < 0 || player[skill] > 200)) {
        throw new ValidationError(`${skill}が範囲外です (0-200)`, skill, player[skill]);
      }
    });

    // 体力検証
    if (player.stamina && (player.stamina < 0 || player.stamina > 100)) {
      throw new ValidationError('体力が範囲外です (0-100)', 'stamina', player.stamina);
    }

    // やる気検証
    if (player.condition && (player.condition < 0 || player.condition > 100)) {
      throw new ValidationError('やる気が範囲外です (0-100)', 'condition', player.condition);
    }
  },

  // 学校ステータス検証
  validateSchoolStats: (school: any): void => {
    if (!school) {
      throw new ValidationError('学校データが不正です', 'school', school);
    }

    // 資金検証
    if (school.funds && school.funds < -100000) {
      throw new ValidationError('負債が限界を超えています', 'funds', school.funds);
    }

    // 評判検証
    if (school.reputation && (school.reputation < 0 || school.reputation > 100)) {
      throw new ValidationError('評判が範囲外です (0-100)', 'reputation', school.reputation);
    }

    // 設備レベル検証
    if (school.facilities && (school.facilities < 0 || school.facilities > 100)) {
      throw new ValidationError('設備レベルが範囲外です (0-100)', 'facilities', school.facilities);
    }
  },

  // カード検証
  validateCard: (card: any): void => {
    if (!card) {
      throw new ValidationError('カードデータが不正です', 'card', card);
    }

    if (!card.id || typeof card.id !== 'string') {
      throw new ValidationError('カードIDが不正です', 'id', card.id);
    }

    if (!['common', 'uncommon', 'rare', 'legendary'].includes(card.rarity)) {
      throw new ValidationError('カード希少度が不正です', 'rarity', card.rarity);
    }

    if (!card.costs || typeof card.costs.stamina !== 'number') {
      throw new ValidationError('カードコストが不正です', 'costs', card.costs);
    }
  },

  // 確率値検証
  validateProbability: (probability: number, fieldName: string): void => {
    if (typeof probability !== 'number' || probability < 0 || probability > 100) {
      throw new ValidationError(`確率値が不正です (0-100)`, fieldName, probability);
    }
  },

  // 日付検証
  validateDate: (date: any): void => {
    if (!date || typeof date.year !== 'number' || typeof date.month !== 'number' || typeof date.day !== 'number') {
      throw new ValidationError('日付データが不正です', 'date', date);
    }

    if (date.month < 1 || date.month > 12) {
      throw new ValidationError('月が範囲外です (1-12)', 'month', date.month);
    }

    if (date.day < 1 || date.day > 31) {
      throw new ValidationError('日が範囲外です (1-31)', 'day', date.day);
    }
  }
};

// エラー回復戦略
export const ErrorRecovery = {
  // プレイヤーステータスの修復
  repairPlayerStats: (player: any): any => {
    const repairedPlayer = { ...player };

    // レベルの修復
    if (!repairedPlayer.level || repairedPlayer.level < 1) {
      repairedPlayer.level = 1;
    } else if (repairedPlayer.level > 50) {
      repairedPlayer.level = 50;
    }

    // スキル値の修復
    const skills = ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'];
    skills.forEach(skill => {
      if (typeof repairedPlayer[skill] !== 'number' || repairedPlayer[skill] < 0) {
        repairedPlayer[skill] = 0;
      } else if (repairedPlayer[skill] > 200) {
        repairedPlayer[skill] = 200;
      }
    });

    // 体力の修復
    if (typeof repairedPlayer.stamina !== 'number' || repairedPlayer.stamina < 0) {
      repairedPlayer.stamina = 0;
    } else if (repairedPlayer.stamina > 100) {
      repairedPlayer.stamina = 100;
    }

    // やる気の修復
    if (typeof repairedPlayer.condition !== 'number') {
      repairedPlayer.condition = 50;
    } else if (repairedPlayer.condition < 0) {
      repairedPlayer.condition = 0;
    } else if (repairedPlayer.condition > 100) {
      repairedPlayer.condition = 100;
    }

    return repairedPlayer;
  },

  // 学校ステータスの修復
  repairSchoolStats: (school: any): any => {
    const repairedSchool = { ...school };

    // 資金の修復（最小限の機能維持のため）
    if (typeof repairedSchool.funds !== 'number') {
      repairedSchool.funds = 10000;
    } else if (repairedSchool.funds < -100000) {
      repairedSchool.funds = -100000; // 破産限界
    }

    // 評判の修復
    if (typeof repairedSchool.reputation !== 'number' || repairedSchool.reputation < 0) {
      repairedSchool.reputation = 1; // 最低限の評判
    } else if (repairedSchool.reputation > 100) {
      repairedSchool.reputation = 100;
    }

    // 設備の修復
    if (typeof repairedSchool.facilities !== 'number' || repairedSchool.facilities < 0) {
      repairedSchool.facilities = 10; // 最低限の設備
    } else if (repairedSchool.facilities > 100) {
      repairedSchool.facilities = 100;
    }

    return repairedSchool;
  },

  // 確率分布の正規化
  normalizeProbabilities: (probabilities: Record<string, number>): Record<string, number> => {
    const total = Object.values(probabilities).reduce((sum, val) => sum + Math.max(0, val), 0);
    
    if (total === 0) {
      // すべて0の場合は均等分布
      const keys = Object.keys(probabilities);
      const evenValue = 100 / keys.length;
      return Object.fromEntries(keys.map(key => [key, evenValue]));
    }

    // 正規化
    const normalized: Record<string, number> = {};
    Object.entries(probabilities).forEach(([key, value]) => {
      normalized[key] = Math.max(0, value) / total * 100;
    });

    return normalized;
  }
};

// セーフ実行ラッパー
export const SafeExecution = {
  // セーフなカード使用
  safeUseCard: (cardUseFunction: () => any, fallbackResult: any): any => {
    try {
      const result = cardUseFunction();
      Validators.validateCard(result.card);
      return result;
    } catch (error) {
      console.warn('カード使用でエラーが発生しました:', error);
      return {
        ...fallbackResult,
        success: false,
        resultMessage: 'エラーが発生しました。安全のため練習を中止します。',
        actualEffects: {
          skillGrowth: {},
          statusChanges: { stamina: -5 } // 最小限の体力消費
        }
      };
    }
  },

  // セーフな確率計算
  safeProbabilityCalculation: (calculationFunction: () => number, defaultValue: number = 50): number => {
    try {
      const result = calculationFunction();
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Invalid probability result');
      }
      return Math.max(0, Math.min(100, result));
    } catch (error) {
      console.warn('確率計算でエラーが発生しました:', error);
      return defaultValue;
    }
  },

  // セーフな状態更新
  safeStateUpdate: (currentState: any, updateFunction: (state: any) => any): any => {
    try {
      const newState = updateFunction({ ...currentState });
      
      // 基本的な検証
      if (newState.player) {
        Validators.validatePlayerStats(newState.player);
      }
      if (newState.schoolStats) {
        Validators.validateSchoolStats(newState.schoolStats);
      }
      
      return newState;
    } catch (error) {
      console.warn('状態更新でエラーが発生しました:', error);
      
      // エラー回復
      const repairedState = { ...currentState };
      if (repairedState.player) {
        repairedState.player = ErrorRecovery.repairPlayerStats(repairedState.player);
      }
      if (repairedState.schoolStats) {
        repairedState.schoolStats = ErrorRecovery.repairSchoolStats(repairedState.schoolStats);
      }
      
      return repairedState;
    }
  }
};

// ログシステム
export class GameLogger {
  private static logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    context?: any;
  }> = [];

  static info(message: string, context?: any): void {
    this.logs.push({
      timestamp: new Date(),
      level: 'info',
      message,
      context
    });
    this.trimLogs();
  }

  static warn(message: string, context?: any): void {
    this.logs.push({
      timestamp: new Date(),
      level: 'warn',
      message,
      context
    });
    console.warn(`[GameLogger] ${message}`, context);
    this.trimLogs();
  }

  static error(message: string, error?: any): void {
    this.logs.push({
      timestamp: new Date(),
      level: 'error',
      message,
      context: error
    });
    console.error(`[GameLogger] ${message}`, error);
    this.trimLogs();
  }

  static getLogs(level?: 'info' | 'warn' | 'error'): typeof this.logs {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  private static trimLogs(): void {
    // 最新1000件のみ保持
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// パフォーマンス監視
export class PerformanceMonitor {
  private static metrics: Map<string, {
    totalTime: number;
    callCount: number;
    averageTime: number;
    maxTime: number;
  }> = new Map();

  static startTiming(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(operation, duration);
    };
  }

  private static recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);
    
    if (existing) {
      existing.totalTime += duration;
      existing.callCount += 1;
      existing.averageTime = existing.totalTime / existing.callCount;
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(operation, {
        totalTime: duration,
        callCount: 1,
        averageTime: duration,
        maxTime: duration
      });
    }
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }

  // 遅い処理の警告
  static wrapFunction<T extends (...args: any[]) => any>(
    fn: T, 
    name: string, 
    warnThreshold: number = 100
  ): T {
    return ((...args: any[]) => {
      const stopTiming = this.startTiming(name);
      
      try {
        const result = fn(...args);
        
        // Promise の場合は別途処理
        if (result instanceof Promise) {
          return result.finally(() => {
            stopTiming();
            const metric = this.metrics.get(name);
            if (metric && metric.averageTime > warnThreshold) {
              GameLogger.warn(`パフォーマンス警告: ${name} の平均実行時間が ${metric.averageTime.toFixed(2)}ms です`);
            }
          });
        } else {
          stopTiming();
          const metric = this.metrics.get(name);
          if (metric && metric.averageTime > warnThreshold) {
            GameLogger.warn(`パフォーマンス警告: ${name} の平均実行時間が ${metric.averageTime.toFixed(2)}ms です`);
          }
          return result;
        }
      } catch (error) {
        stopTiming();
        throw error;
      }
    }) as T;
  }
}