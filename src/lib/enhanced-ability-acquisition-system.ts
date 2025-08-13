// 拡張された特殊能力取得システム
// 本家パワプロ・栄冠ナインを上回る多様な取得方法を提供

import { 
  EnhancedSpecialAbility, 
  AbilityCombination, 
  AbilityAcquisitionHistory,
  TennisAbilityCategory,
  TennisAbilityColor,
  TennisAbilityRank
} from '../types/special-abilities';
import { 
  ENHANCED_TENNIS_SPECIAL_ABILITIES, 
  ABILITY_COMBINATIONS,
  calculateAcquisitionProbability 
} from './enhanced-special-abilities-database';

export interface AcquisitionAttempt {
  playerId: string;
  abilityId: string;
  method: 'training' | 'match' | 'event' | 'evolution' | 'item' | 'coach' | 'combination';
  success: boolean;
  probability: number;
  timestamp: Date;
  additionalData?: any;
}

export interface AcquisitionResult {
  success: boolean;
  acquiredAbility?: EnhancedSpecialAbility;
  message: string;
  probability: number;
  method: string;
  combinationUsed?: AbilityCombination;
}

export class EnhancedAbilityAcquisitionSystem {
  
  // 特殊能力取得の試行
  static async attemptAcquisition(
    playerId: string,
    abilityId: string,
    method: 'training' | 'match' | 'event' | 'evolution' | 'item' | 'coach' | 'combination',
    playerLevel: number = 1,
    playerStats: any = {},
    additionalData?: any
  ): Promise<AcquisitionResult> {
    
    const ability = getAbilityById(abilityId);
    if (!ability) {
      return {
        success: false,
        message: '指定された特殊能力が見つかりません',
        probability: 0,
        method
      };
    }

    // 取得確率の計算
    const probability = calculateAcquisitionProbability(ability, method, playerLevel, playerStats);
    
    // 成功判定
    const success = Math.random() < (probability / 100);
    
    // 取得履歴の記録
    const attempt: AcquisitionAttempt = {
      playerId,
      abilityId,
      method,
      success,
      probability,
      timestamp: new Date(),
      additionalData
    };
    
    // 履歴を保存（実際の実装ではデータベースに保存）
    await this.saveAcquisitionAttempt(attempt);
    
    if (success) {
      // 成功時の処理
      const history: AbilityAcquisitionHistory = {
        id: this.generateId(),
        playerId,
        abilityId,
        acquisitionMethod: method,
        acquisitionDate: new Date(),
        successRateUsed: probability,
        wasCombination: false,
        createdAt: new Date()
      };
      
      await this.saveAcquisitionHistory(history);
      
      return {
        success: true,
        acquiredAbility: ability,
        message: `${ability.name}を習得しました！`,
        probability,
        method
      };
    } else {
      // 失敗時の処理
      return {
        success: false,
        message: `${ability.name}の習得に失敗しました。確率: ${probability.toFixed(1)}%`,
        probability,
        method
      };
    }
  }

  // 特殊能力の組み合わせによる取得
  static async attemptCombination(
    playerId: string,
    combinationId: string,
    playerLevel: number = 1,
    playerStats: any = {}
  ): Promise<AcquisitionResult> {
    
    const combination = ABILITY_COMBINATIONS.find(c => c.id === combinationId);
    if (!combination) {
      return {
        success: false,
        message: '指定された組み合わせが見つかりません',
        probability: 0,
        method: 'combination'
      };
    }

    // 組み合わせに必要な能力をチェック
    const hasRequiredAbilities = await this.checkRequiredAbilities(playerId, combination.requiredAbilities);
    if (!hasRequiredAbilities) {
      return {
        success: false,
        message: '組み合わせに必要な特殊能力が不足しています',
        probability: 0,
        method: 'combination'
      };
    }

    // 結果の特殊能力を取得
    const resultAbility = getAbilityById(combination.resultAbility);
    if (!resultAbility) {
      return {
        success: false,
        message: '組み合わせ結果の特殊能力が見つかりません',
        probability: 0,
        method: 'combination'
      };
    }

    // 組み合わせ確率の計算
    const baseProbability = combination.successRate;
    const levelBonus = Math.min(playerLevel * 0.2, 5.0);
    const finalProbability = Math.min(baseProbability + levelBonus, 50.0);

    // 成功判定
    const success = Math.random() < (finalProbability / 100);

    if (success) {
      // 成功時の処理
      const history: AbilityAcquisitionHistory = {
        id: this.generateId(),
        playerId,
        abilityId: combination.resultAbility,
        acquisitionMethod: 'combination',
        acquisitionDate: new Date(),
        successRateUsed: finalProbability,
        wasCombination: true,
        combinationId: combination.id,
        createdAt: new Date()
      };
      
      await this.saveAcquisitionHistory(history);
      
      return {
        success: true,
        acquiredAbility: resultAbility,
        message: `組み合わせ成功！${resultAbility.name}を習得しました！`,
        probability: finalProbability,
        method: 'combination',
        combinationUsed: combination
      };
    } else {
      // 失敗時の処理
      return {
        success: false,
        message: `組み合わせに失敗しました。確率: ${finalProbability.toFixed(1)}%`,
        probability: finalProbability,
        method: 'combination'
      };
    }
  }

  // 練習による特殊能力取得
  static async attemptTrainingAcquisition(
    playerId: string,
    trainingType: TennisAbilityCategory,
    playerLevel: number = 1,
    playerStats: any = {},
    trainingIntensity: number = 1.0
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // 練習タイプに応じた特殊能力をフィルタリング
    const applicableAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(
      ability => ability.category === trainingType && ability.isActive
    );

    // 各能力について取得を試行
    for (const ability of applicableAbilities) {
      // 練習強度による確率調整
      const adjustedProbability = calculateAcquisitionProbability(
        ability, 
        'training', 
        playerLevel, 
        playerStats
      ) * trainingIntensity;

      if (Math.random() < (adjustedProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'training',
          acquisitionDate: new Date(),
          successRateUsed: adjustedProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `練習中に${ability.name}を習得しました！`,
          probability: adjustedProbability,
          method: 'training'
        });
      }
    }

    return results;
  }

  // 試合による特殊能力取得
  static async attemptMatchAcquisition(
    playerId: string,
    matchResult: 'win' | 'loss' | 'draw',
    matchType: 'practice' | 'tournament' | 'championship',
    playerLevel: number = 1,
    playerStats: any = {},
    opponentStrength: number = 1.0
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // 試合結果による確率調整
    let matchMultiplier = 1.0;
    if (matchResult === 'win') {
      matchMultiplier = 2.0;
      if (matchType === 'tournament') matchMultiplier = 3.0;
      if (matchType === 'championship') matchMultiplier = 5.0;
    } else if (matchResult === 'draw') {
      matchMultiplier = 0.5;
    } else {
      matchMultiplier = 0.1; // 負けの場合
    }

    // 相手の強さによる調整
    const strengthMultiplier = Math.min(opponentStrength, 3.0);

    // 全特殊能力について取得を試行
    for (const ability of ENHANCED_TENNIS_SPECIAL_ABILITIES) {
      if (!ability.isActive) continue;

      const baseProbability = calculateAcquisitionProbability(
        ability, 
        'match', 
        playerLevel, 
        playerStats
      );

      const finalProbability = baseProbability * matchMultiplier * strengthMultiplier;

      if (Math.random() < (finalProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'match',
          acquisitionDate: new Date(),
          successRateUsed: finalProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `試合中に${ability.name}を習得しました！`,
          probability: finalProbability,
          method: 'match'
        });
      }
    }

    return results;
  }

  // イベントによる特殊能力取得
  static async attemptEventAcquisition(
    playerId: string,
    eventType: 'seasonal' | 'special' | 'achievement' | 'random',
    playerLevel: number = 1,
    playerStats: any = {},
    eventRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common'
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // イベントのレアリティによる確率調整
    const rarityMultipliers = {
      common: 1.0,
      uncommon: 2.0,
      rare: 5.0,
      epic: 10.0,
      legendary: 25.0
    };

    const eventMultiplier = rarityMultipliers[eventRarity];

    // 全特殊能力について取得を試行
    for (const ability of ENHANCED_TENNIS_SPECIAL_ABILITIES) {
      if (!ability.isActive) continue;

      const baseProbability = calculateAcquisitionProbability(
        ability, 
        'event', 
        playerLevel, 
        playerStats
      );

      const finalProbability = baseProbability * eventMultiplier;

      if (Math.random() < (finalProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'event',
          acquisitionDate: new Date(),
          successRateUsed: finalProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `イベント中に${ability.name}を習得しました！`,
          probability: finalProbability,
          method: 'event'
        });
      }
    }

    return results;
  }

  // 進化による特殊能力取得
  static async attemptEvolutionAcquisition(
    playerId: string,
    evolutionType: 'level_up' | 'skill_mastery' | 'personality_change',
    playerLevel: number = 1,
    playerStats: any = {}
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // 進化タイプによる確率調整
    let evolutionMultiplier = 1.0;
    if (evolutionType === 'level_up') evolutionMultiplier = 2.0;
    else if (evolutionType === 'skill_mastery') evolutionMultiplier = 3.0;
    else if (evolutionType === 'personality_change') evolutionMultiplier = 5.0;

    // 全特殊能力について取得を試行
    for (const ability of ENHANCED_TENNIS_SPECIAL_ABILITIES) {
      if (!ability.isActive) continue;

      const baseProbability = calculateAcquisitionProbability(
        ability, 
        'evolution', 
        playerLevel, 
        playerStats
      );

      const finalProbability = baseProbability * evolutionMultiplier;

      if (Math.random() < (finalProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'evolution',
          acquisitionDate: new Date(),
          successRateUsed: finalProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `進化により${ability.name}を習得しました！`,
          probability: finalProbability,
          method: 'evolution'
        });
      }
    }

    return results;
  }

  // アイテムによる特殊能力取得
  static async attemptItemAcquisition(
    playerId: string,
    itemType: 'ability_book' | 'training_manual' | 'mysterious_scroll',
    itemRarity: TennisAbilityColor,
    playerLevel: number = 1,
    playerStats: any = {}
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // アイテムのレアリティによる確率調整
    const rarityMultipliers = {
      diamond: 10.0,
      gold: 5.0,
      blue: 3.0,
      green: 2.0,
      purple: 4.0,
      orange: 2.5,
      gray: 1.5,
      red: 1.0
    };

    const itemMultiplier = rarityMultipliers[itemRarity] || 1.0;

    // アイテムタイプに応じた特殊能力をフィルタリング
    let applicableAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(ability => ability.isActive);
    
    if (itemType === 'ability_book') {
      // 能力書は特定のカテゴリに特化
      applicableAbilities = applicableAbilities.filter(ability => 
        ability.color === itemRarity || ability.rank === 'S' || ability.rank === 'SS' || ability.rank === 'SS+'
      );
    } else if (itemType === 'training_manual') {
      // 練習マニュアルは成長系能力に特化
      applicableAbilities = applicableAbilities.filter(ability => 
        ability.color === 'green' || ability.effects.growthEffects
      );
    }

    // 各能力について取得を試行
    for (const ability of applicableAbilities) {
      const baseProbability = calculateAcquisitionProbability(
        ability, 
        'item', 
        playerLevel, 
        playerStats
      );

      const finalProbability = baseProbability * itemMultiplier;

      if (Math.random() < (finalProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'item',
          acquisitionDate: new Date(),
          successRateUsed: finalProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `アイテムにより${ability.name}を習得しました！`,
          probability: finalProbability,
          method: 'item'
        });
      }
    }

    return results;
  }

  // コーチによる特殊能力取得
  static async attemptCoachAcquisition(
    playerId: string,
    coachType: 'serve_coach' | 'return_coach' | 'volley_coach' | 'stroke_coach' | 'mental_coach',
    coachLevel: number = 1,
    playerLevel: number = 1,
    playerStats: any = {}
  ): Promise<AcquisitionResult[]> {
    
    const results: AcquisitionResult[] = [];
    
    // コーチタイプに応じた特殊能力をフィルタリング
    const coachCategoryMap = {
      serve_coach: 'serve',
      return_coach: 'return',
      volley_coach: 'volley',
      stroke_coach: 'stroke',
      mental_coach: 'mental'
    } as const;

    const targetCategory = coachCategoryMap[coachType];
    const applicableAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(
      ability => ability.category === targetCategory && ability.isActive
    );

    // コーチレベルによる確率調整
    const coachMultiplier = 1.0 + (coachLevel * 0.5);

    // 各能力について取得を試行
    for (const ability of applicableAbilities) {
      const baseProbability = calculateAcquisitionProbability(
        ability, 
        'coach', 
        playerLevel, 
        playerStats
      );

      const finalProbability = baseProbability * coachMultiplier;

      if (Math.random() < (finalProbability / 100)) {
        // 成功時の処理
        const history: AbilityAcquisitionHistory = {
          id: this.generateId(),
          playerId,
          abilityId: ability.id,
          acquisitionMethod: 'coach',
          acquisitionDate: new Date(),
          successRateUsed: finalProbability,
          wasCombination: false,
          createdAt: new Date()
        };
        
        await this.saveAcquisitionHistory(history);
        
        results.push({
          success: true,
          acquiredAbility: ability,
          message: `コーチの指導により${ability.name}を習得しました！`,
          probability: finalProbability,
          method: 'coach'
        });
      }
    }

    return results;
  }

  // 必要な特殊能力のチェック
  private static async checkRequiredAbilities(
    playerId: string, 
    requiredAbilityIds: string[]
  ): Promise<boolean> {
    // 実際の実装ではプレイヤーの所持特殊能力をデータベースから取得
    // ここでは仮の実装
    return true;
  }

  // 取得試行の保存
  private static async saveAcquisitionAttempt(attempt: AcquisitionAttempt): Promise<void> {
    // 実際の実装ではデータベースに保存
    console.log('Acquisition attempt saved:', attempt);
  }

  // 取得履歴の保存
  private static async saveAcquisitionHistory(history: AbilityAcquisitionHistory): Promise<void> {
    // 実際の実装ではデータベースに保存
    console.log('Acquisition history saved:', history);
  }

  // ID生成
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // プレイヤーの特殊能力取得履歴を取得
  static async getPlayerAcquisitionHistory(playerId: string): Promise<AbilityAcquisitionHistory[]> {
    // 実際の実装ではデータベースから取得
    return [];
  }

  // 特殊能力の組み合わせ可能な組み合わせを取得
  static async getAvailableCombinations(playerId: string): Promise<AbilityCombination[]> {
    // 実際の実装ではプレイヤーの所持特殊能力をチェック
    return ABILITY_COMBINATIONS.filter(combination => combination.isActive);
  }

  // 特殊能力の取得推奨度を計算
  static calculateAcquisitionRecommendation(
    playerId: string,
    ability: EnhancedSpecialAbility,
    playerStats: any = {}
  ): number {
    let recommendation = 0;

    // プレイヤーのステータスと能力の相性をチェック
    if (ability.category === 'serve' && playerStats.serve_skill) {
      if (playerStats.serve_skill < 50) recommendation += 20; // 低い場合は推奨
      else if (playerStats.serve_skill > 80) recommendation += 10; // 高い場合も推奨
    }

    if (ability.category === 'return' && playerStats.return_skill) {
      if (playerStats.return_skill < 50) recommendation += 20;
      else if (playerStats.return_skill > 80) recommendation += 10;
    }

    if (ability.category === 'volley' && playerStats.volley_skill) {
      if (playerStats.volley_skill < 50) recommendation += 20;
      else if (playerStats.volley_skill > 80) recommendation += 10;
    }

    if (ability.category === 'stroke' && playerStats.stroke_skill) {
      if (playerStats.stroke_skill < 50) recommendation += 20;
      else if (playerStats.stroke_skill > 80) recommendation += 10;
    }

    if (ability.category === 'mental' && playerStats.mental) {
      if (playerStats.mental < 50) recommendation += 20;
      else if (playerStats.mental > 80) recommendation += 10;
    }

    // レアリティによる調整
    if (ability.color === 'diamond') recommendation += 30;
    else if (ability.color === 'gold') recommendation += 20;
    else if (ability.color === 'blue') recommendation += 15;
    else if (ability.color === 'green') recommendation += 10;

    return Math.min(recommendation, 100);
  }
}
