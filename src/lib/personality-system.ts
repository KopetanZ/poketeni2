// 栄冠ナイン風性格システム - 戦略的育成差別化の核心

import { Player, PersonalityType } from '@/types/game';

// 性格特性の定義
export interface PersonalityTraits {
  name: string;
  description: string;
  icon: string;
  
  // 成長ボーナス
  growthBonus: {
    serve_skill?: number;
    return_skill?: number;
    volley_skill?: number;
    stroke_skill?: number;
    mental?: number;
    stamina?: number;
    experience?: number; // 経験値獲得倍率
  };
  
  // 固有戦術（試合時の特殊効果）
  specialTactic: {
    name: string;
    description: string;
    effect: string;
    activationCondition?: string;
  };
  
  // デメリット効果
  drawback?: {
    description: string;
    effect: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
      practiceEfficiency?: number;
      staminaConsumption?: number;
    };
  };
  
  // 適性ポジション
  suitablePositions: Array<'captain' | 'vice_captain' | 'regular' | 'member'>;
  
  // 相性システム用の性格タイプ
  compatibilityType: 'aggressive' | 'technical' | 'support' | 'balanced';
}

// テニス版性格データベース
export const PERSONALITY_DATABASE: Record<PersonalityType, PersonalityTraits> = {
  aggressive: {
    name: 'アグレッシブ',
    description: '攻撃的で積極的なプレースタイル。サーブとストロークで圧倒する',
    icon: '⚡',
    growthBonus: {
      serve_skill: 20, // +20%
      stroke_skill: 15, // +15%
    },
    specialTactic: {
      name: '強気のプレー',
      description: '攻撃時の成功率が上昇する',
      effect: '攻撃系技術の成功率+15%',
      activationCondition: '攻撃的な戦術選択時'
    },
    drawback: {
      description: '攻撃重視のため体力消費が大きく、エラーも多め',
      effect: {
        stamina: -5,
        staminaConsumption: 10 // +10%消費
      }
    },
    suitablePositions: ['captain', 'regular'],
    compatibilityType: 'aggressive'
  },

  technical: {
    name: 'テクニカル',
    description: '技術と戦術を重視する頭脳派。ボレーとコースワークが得意',
    icon: '🎯',
    growthBonus: {
      volley_skill: 20,
      mental: 25 // 戦術理解
    },
    specialTactic: {
      name: '完璧なコース',
      description: '精密性が大幅に向上する',
      effect: '技術系能力の精密性+20%',
      activationCondition: '戦術的なプレー時'
    },
    drawback: {
      description: 'パワー不足でプレッシャーに弱い',
      effect: {
        serve_skill: -10,
        mental: -5 // プレッシャー時
      }
    },
    suitablePositions: ['vice_captain', 'regular'],
    compatibilityType: 'technical'
  },

  stamina: {
    name: 'スタミナ',
    description: '持久力に優れた粘り強いプレースタイル。長期戦に強い',
    icon: '💪',
    growthBonus: {
      stamina: 30,
      mental: 15 // 集中力持続
    },
    specialTactic: {
      name: '粘りのテニス',
      description: '長期戦になるほど能力が向上する',
      effect: '長期戦時能力+20%',
      activationCondition: 'ラリーが長続きした時'
    },
    drawback: {
      description: '瞬発力に欠ける',
      effect: {
        serve_skill: -10,
        volley_skill: -5
      }
    },
    suitablePositions: ['regular', 'member'],
    compatibilityType: 'support'
  },

  genius: {
    name: '天才肌',
    description: 'あらゆる能力が高水準。ひらめきで神プレーを見せる',
    icon: '🧠',
    growthBonus: {
      serve_skill: 10,
      return_skill: 10,
      volley_skill: 10,
      stroke_skill: 10,
      mental: 10,
      stamina: 10
    },
    specialTactic: {
      name: 'ひらめき',
      description: 'ランダムで神プレーが発動する',
      effect: 'ランダムで全能力+30%発動',
      activationCondition: '重要な場面で5%の確率'
    },
    drawback: {
      description: '練習態度にムラがある',
      effect: {
        practiceEfficiency: -10 // 10%の確率で練習効果半減
      }
    },
    suitablePositions: ['captain', 'vice_captain', 'regular', 'member'],
    compatibilityType: 'balanced'
  },

  hardworker: {
    name: '努力家',
    description: '努力を惜しまない真面目なタイプ。経験値獲得に優れる',
    icon: '🔥',
    growthBonus: {
      experience: 25 // +25%経験値獲得
    },
    specialTactic: {
      name: '執念のプレー',
      description: '劣勢時に真の力を発揮する',
      effect: '劣勢時全能力+15%',
      activationCondition: 'セット劣勢時'
    },
    drawback: {
      description: '疲労が蓄積しやすい',
      effect: {
        staminaConsumption: 15 // +15%消費
      }
    },
    suitablePositions: ['captain', 'vice_captain', 'regular', 'member'],
    compatibilityType: 'support'
  },

  cheerful: {
    name: 'お調子者',
    description: '調子の波が激しいが、ノリが良い時は無敵になる',
    icon: '😊',
    growthBonus: {
      // 調子による変動制
    },
    specialTactic: {
      name: 'ノリノリプレー',
      description: '連続成功で効果が倍増する',
      effect: '連続成功時効果倍増(最大3倍)',
      activationCondition: '2回以上連続成功時'
    },
    drawback: {
      description: '調子の波が激しい',
      effect: {
        // 動的に変化する特殊な処理
      }
    },
    suitablePositions: ['regular', 'member'],
    compatibilityType: 'aggressive'
  },

  shy: {
    name: '内気',
    description: '控えめだが基礎練習に集中でき、重要な場面で冷静さを発揮',
    icon: '😌',
    growthBonus: {
      mental: 20, // 基礎練習集中力
      experience: 10 // 基礎練習効率
    },
    specialTactic: {
      name: '集中力',
      description: '重要な場面で冷静さを発揮する',
      effect: '重要場面での精神力+25%',
      activationCondition: 'マッチポイントなど重要場面'
    },
    drawback: {
      description: '大舞台でのプレッシャーに弱い',
      effect: {
        mental: -10 // 大会時
      }
    },
    suitablePositions: ['member', 'regular'],
    compatibilityType: 'support'
  },

  leader: {
    name: 'リーダー',
    description: 'チーム全体を引っ張る統率力。ダブルスで真価を発揮',
    icon: '👑',
    growthBonus: {
      mental: 20 // リーダーシップ
    },
    specialTactic: {
      name: 'チームワーク',
      description: 'ダブルス時にパートナーの能力も向上させる',
      effect: 'ダブルス時ペア全体+20%',
      activationCondition: 'ダブルス出場時'
    },
    drawback: {
      description: '個人練習時の集中力が劣る',
      effect: {
        practiceEfficiency: -5 // 個人練習時
      }
    },
    suitablePositions: ['captain', 'vice_captain'],
    compatibilityType: 'balanced'
  }
};

export class PersonalitySystem {
  // 性格による成長倍率計算
  static calculateGrowthMultiplier(player: Player, skillType: keyof PersonalityTraits['growthBonus']): number {
    const personality = PERSONALITY_DATABASE[player.personality];
    const baseMultiplier = 1.0;
    
    if (personality.growthBonus[skillType]) {
      return baseMultiplier + (personality.growthBonus[skillType]! / 100);
    }
    
    // お調子者の特殊処理
    if (player.personality === 'cheerful') {
      if (player.condition === 'excellent') {
        return baseMultiplier + 0.30; // +30%
      } else if (player.condition === 'poor' || player.condition === 'terrible') {
        return baseMultiplier - 0.20; // -20%
      }
    }
    
    return baseMultiplier;
  }
  
  // 経験値獲得倍率計算
  static calculateExperienceMultiplier(player: Player): number {
    const personality = PERSONALITY_DATABASE[player.personality];
    let multiplier = 1.0;
    
    if (personality.growthBonus.experience) {
      multiplier += personality.growthBonus.experience / 100;
    }
    
    // 内気は基礎練習でボーナス
    if (player.personality === 'shy') {
      multiplier += 0.10;
    }
    
    return multiplier;
  }
  
  // 練習効率への影響
  static calculatePracticeEfficiency(player: Player, practiceType: 'individual' | 'team' | 'match'): number {
    const personality = PERSONALITY_DATABASE[player.personality];
    let efficiency = 1.0;
    
    // デメリット効果の適用
    if (personality.drawback?.effect.practiceEfficiency) {
      efficiency += personality.drawback.effect.practiceEfficiency / 100;
    }
    
    // 天才肌の練習ムラ
    if (player.personality === 'genius' && Math.random() < 0.10) {
      efficiency *= 0.5; // 10%の確率で半減
    }
    
    // リーダーは個人練習で若干劣る
    if (player.personality === 'leader' && practiceType === 'individual') {
      efficiency *= 0.95;
    }
    
    // リーダーはチーム練習で優秀
    if (player.personality === 'leader' && practiceType === 'team') {
      efficiency *= 1.10;
    }
    
    return Math.max(0.3, efficiency); // 最低30%は確保
  }
  
  // 体力消費への影響
  static calculateStaminaConsumption(player: Player, activityType: 'practice' | 'match'): number {
    const personality = PERSONALITY_DATABASE[player.personality];
    let consumption = 1.0;
    
    if (personality.drawback?.effect.staminaConsumption) {
      consumption += personality.drawback.effect.staminaConsumption / 100;
    }
    
    return consumption;
  }
  
  // 相性システム - ダブルスペアの相性計算
  static calculateCompatibility(player1: Player, player2: Player): {
    compatibility: number; // -10 ~ +30
    description: string;
    bonus: number; // パフォーマンスボーナス
  } {
    const personality1 = PERSONALITY_DATABASE[player1.personality];
    const personality2 = PERSONALITY_DATABASE[player2.personality];
    
    // 同じ性格の場合
    if (player1.personality === player2.personality) {
      return {
        compatibility: 0,
        description: '安定した組み合わせ',
        bonus: 0
      };
    }
    
    // 補完関係（推奨組み合わせ）
    const complementaryPairs = {
      'aggressive-technical': 30,
      'genius-hardworker': 25,
      'stamina-cheerful': 20,
      'leader-shy': 25
    };
    
    const pairKey1 = `${player1.personality}-${player2.personality}`;
    const pairKey2 = `${player2.personality}-${player1.personality}`;
    
    if (complementaryPairs[pairKey1 as keyof typeof complementaryPairs]) {
      const bonus = complementaryPairs[pairKey1 as keyof typeof complementaryPairs];
      return {
        compatibility: bonus,
        description: '完璧な組み合わせ！',
        bonus: bonus
      };
    }
    
    if (complementaryPairs[pairKey2 as keyof typeof complementaryPairs]) {
      const bonus = complementaryPairs[pairKey2 as keyof typeof complementaryPairs];
      return {
        compatibility: bonus,
        description: '完璧な組み合わせ！',
        bonus: bonus
      };
    }
    
    // 対立関係
    const conflictPairs = {
      'cheerful-shy': -10,
      'aggressive-stamina': -5
    };
    
    if (conflictPairs[pairKey1 as keyof typeof conflictPairs]) {
      const penalty = conflictPairs[pairKey1 as keyof typeof conflictPairs];
      return {
        compatibility: penalty,
        description: '性格が合わない...',
        bonus: penalty
      };
    }
    
    if (conflictPairs[pairKey2 as keyof typeof conflictPairs]) {
      const penalty = conflictPairs[pairKey2 as keyof typeof conflictPairs];
      return {
        compatibility: penalty,
        description: '性格が合わない...',
        bonus: penalty
      };
    }
    
    // 同じ系統（普通）
    if (personality1.compatibilityType === personality2.compatibilityType) {
      return {
        compatibility: 5,
        description: '似た者同士の組み合わせ',
        bonus: 5
      };
    }
    
    // その他（標準）
    return {
      compatibility: 0,
      description: '普通の組み合わせ',
      bonus: 0
    };
  }
  
  // 性格変更システム（占い師イベント等）
  static changePersonality(player: Player, newPersonality: PersonalityType, reason: 'fortune_teller' | 'mental_coaching' | 'event'): {
    success: boolean;
    player?: Player;
    message: string;
  } {
    // 成功率は理由により異なる
    let successRate = 0.70;
    
    switch (reason) {
      case 'fortune_teller':
        successRate = 0.70;
        break;
      case 'mental_coaching':
        successRate = 0.85;
        break;
      case 'event':
        successRate = 1.0; // イベント性格変更は確実
        break;
    }
    
    // 同じ性格への変更は無効
    if (player.personality === newPersonality) {
      return {
        success: false,
        message: '既に同じ性格です'
      };
    }
    
    if (Math.random() < successRate) {
      const newPlayer = {
        ...player,
        personality: newPersonality
      };
      
      return {
        success: true,
        player: newPlayer,
        message: `性格が「${PERSONALITY_DATABASE[newPersonality].name}」に変化しました！`
      };
    } else {
      return {
        success: false,
        message: '性格の変化に失敗しました...'
      };
    }
  }
  
  // 特殊戦術の発動判定
  static checkSpecialTacticActivation(
    player: Player, 
    situation: 'normal' | 'disadvantage' | 'advantage' | 'important' | 'doubles' | 'consecutive_success'
  ): {
    activated: boolean;
    effect: string;
    message?: string;
  } {
    const personality = PERSONALITY_DATABASE[player.personality];
    
    switch (player.personality) {
      case 'aggressive':
        if (situation === 'normal') {
          return {
            activated: true,
            effect: 'attack_bonus_15',
            message: `${player.pokemon_name}の強気のプレー発動！`
          };
        }
        break;
        
      case 'technical':
        if (situation === 'normal') {
          return {
            activated: true,
            effect: 'precision_bonus_20',
            message: `${player.pokemon_name}の完璧なコース！`
          };
        }
        break;
        
      case 'stamina':
        // 長期戦判定は外部で行う
        return {
          activated: true,
          effect: 'endurance_bonus_20',
          message: `${player.pokemon_name}の粘り強さが発揮される！`
        };
        
      case 'genius':
        if (Math.random() < 0.05) { // 5%の確率
          return {
            activated: true,
            effect: 'all_stats_bonus_30',
            message: `${player.pokemon_name}にひらめきが！`
          };
        }
        break;
        
      case 'hardworker':
        if (situation === 'disadvantage') {
          return {
            activated: true,
            effect: 'all_stats_bonus_15',
            message: `${player.pokemon_name}の執念が炸裂！`
          };
        }
        break;
        
      case 'cheerful':
        if (situation === 'consecutive_success') {
          return {
            activated: true,
            effect: 'multiplier_boost',
            message: `${player.pokemon_name}がノリノリになってきた！`
          };
        }
        break;
        
      case 'shy':
        if (situation === 'important') {
          return {
            activated: true,
            effect: 'mental_bonus_25',
            message: `${player.pokemon_name}が集中力を発揮！`
          };
        }
        break;
        
      case 'leader':
        if (situation === 'doubles') {
          return {
            activated: true,
            effect: 'team_bonus_20',
            message: `${player.pokemon_name}のリーダーシップでペア全体が向上！`
          };
        }
        break;
    }
    
    return {
      activated: false,
      effect: 'none'
    };
  }
}