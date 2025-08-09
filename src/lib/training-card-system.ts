// 栄冠ナイン風進行カードシステムの実装

import { 
  TrainingCard, 
  CardRarity, 
  CardCategory,
  TrainingEffect,
  RarityConfig,
  CardUsageResult,
  CardDrop,
  PlayerCardDeck,
  TrainingSession,
  SpecialCardEffect
} from '../types/training-cards';

// 希少度設定
export const RARITY_CONFIGS: Record<CardRarity, RarityConfig> = {
  common: {
    rarity: 'common',
    name: 'コモン',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    baseDropRate: 60,
    effectMultiplier: 1.0,
    successRateBonus: 0,
    glowEffect: false,
    sparkleEffect: false
  },
  uncommon: {
    rarity: 'uncommon',
    name: 'アンコモン',
    color: '#059669',
    bgColor: '#ECFDF5',
    baseDropRate: 25,
    effectMultiplier: 1.3,
    successRateBonus: 10,
    glowEffect: false,
    sparkleEffect: false
  },
  rare: {
    rarity: 'rare',
    name: 'レア',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    baseDropRate: 12,
    effectMultiplier: 1.7,
    successRateBonus: 20,
    glowEffect: true,
    sparkleEffect: false
  },
  legendary: {
    rarity: 'legendary',
    name: 'レジェンド',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    baseDropRate: 3,
    effectMultiplier: 2.5,
    successRateBonus: 35,
    glowEffect: true,
    sparkleEffect: true
  }
};

// カードデータベース（栄冠ナインのカード体系を参考に構築）
export const TRAINING_CARDS: TrainingCard[] = [
  // === テクニカル系カード ===
  {
    id: 'serve_basics',
    name: 'サーブ基礎練習',
    description: '基本的なサーブフォームを徹底的に練習',
    rarity: 'common',
    category: 'technical',
    icon: '🎾',
    color: '#059669',
    bgGradient: 'from-green-400 to-green-600',
    baseEffects: {
      skillGrowth: {
        serve_skill: 8,
        stamina: 2
      },
      statusChanges: {
        condition: 5
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    baseSuccessRate: 85,
    costs: {
      stamina: 15
    }
  },
  
  {
    id: 'power_serve_training',
    name: '強力サーブ特訓',
    description: '威力重視のパワーサーブを習得',
    rarity: 'rare',
    category: 'technical',
    icon: '💥',
    color: '#DC2626',
    bgGradient: 'from-red-500 to-orange-600',
    baseEffects: {
      skillGrowth: {
        serve_skill: 15,
        stamina: 5
      },
      statusChanges: {
        condition: -5,
        injury_risk: 10
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    requirements: {
      minStats: {
        serve_skill: 30
      },
      minStamina: 30
    },
    baseSuccessRate: 65,
    costs: {
      stamina: 25,
      motivation: 5
    },
    specialEffects: [
      {
        type: 'critical_success',
        name: '完璧なフォーム',
        description: 'サーブフォームが完璧に決まった！',
        triggerChance: 15,
        effect: {
          specialAbilityChance: {
            ability_id: 'power_serve',
            chance: 20
          }
        }
      }
    ]
  },

  // === フィジカル系カード ===
  {
    id: 'endurance_run',
    name: '持久走トレーニング',
    description: '長距離走でスタミナを大幅強化',
    rarity: 'common',
    category: 'physical',
    icon: '🏃',
    color: '#2563EB',
    bgGradient: 'from-blue-400 to-blue-600',
    baseEffects: {
      skillGrowth: {
        stamina: 12,
        mental: 3
      },
      statusChanges: {
        condition: -10,
        motivation: -3
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    baseSuccessRate: 90,
    costs: {
      stamina: 20,
      motivation: 8
    }
  },

  {
    id: 'explosive_training',
    name: '爆発的筋力強化',
    description: 'ウェイトとプライオメトリクスの組み合わせ',
    rarity: 'uncommon',
    category: 'physical',
    icon: '💪',
    color: '#7C2D12',
    bgGradient: 'from-orange-500 to-red-600',
    baseEffects: {
      skillGrowth: {
        serve_skill: 5,
        volley_skill: 8,
        stamina: 10
      },
      statusChanges: {
        condition: -8,
        injury_risk: 15
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    requirements: {
      minLevel: 2,
      minStamina: 40
    },
    baseSuccessRate: 70,
    costs: {
      stamina: 30,
      funds: 2000
    },
    specialEffects: [
      {
        type: 'breakthrough',
        name: '限界突破',
        description: '自分の限界を超えた！',
        triggerChance: 10,
        effect: {
          skillGrowth: {
            stamina: 20,
            mental: 10
          }
        }
      }
    ]
  },

  // === メンタル系カード ===
  {
    id: 'meditation_focus',
    name: '瞑想・集中練習',
    description: '静寂の中で心を鍛える',
    rarity: 'uncommon',
    category: 'mental',
    icon: '🧘',
    color: '#7C3AED',
    bgGradient: 'from-purple-400 to-indigo-600',
    baseEffects: {
      skillGrowth: {
        mental: 15,
        serve_skill: 3,
        return_skill: 3
      },
      statusChanges: {
        condition: 10,
        motivation: 5
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    baseSuccessRate: 80,
    costs: {
      stamina: 10,
      motivation: -5 // やる気回復
    },
    specialEffects: [
      {
        type: 'inspiration',
        name: '精神的覚醒',
        description: '心の奥底からパワーが湧いてきた！',
        triggerChance: 12,
        effect: {
          specialAbilityChance: {
            ability_id: 'concentration',
            chance: 25
          }
        }
      }
    ]
  },

  // === 戦術系カード ===
  {
    id: 'match_strategy',
    name: '戦術研究',
    description: '相手を分析し戦略を練る',
    rarity: 'rare',
    category: 'tactical',
    icon: '📊',
    color: '#059669',
    bgGradient: 'from-emerald-400 to-teal-600',
    baseEffects: {
      skillGrowth: {
        mental: 10,
        return_skill: 8,
        volley_skill: 6
      },
      schoolEffects: {
        reputation: 3
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    requirements: {
      minLevel: 3,
      minStats: {
        mental: 25
      }
    },
    baseSuccessRate: 75,
    costs: {
      stamina: 15,
      funds: 3000
    }
  },

  // === スペシャル系カード ===
  {
    id: 'champions_spirit',
    name: 'チャンピオンの魂',
    description: '伝説的な選手の精神を学ぶ',
    rarity: 'legendary',
    category: 'special',
    icon: '👑',
    color: '#DC2626',
    bgGradient: 'from-yellow-400 via-red-500 to-pink-600',
    baseEffects: {
      skillGrowth: {
        serve_skill: 12,
        return_skill: 12,
        volley_skill: 12,
        stroke_skill: 12,
        mental: 20,
        stamina: 8
      },
      statusChanges: {
        condition: 15,
        motivation: 20
      },
      schoolEffects: {
        reputation: 10
      }
    },
    rarityMultipliers: {
      common: 1.0,
      uncommon: 1.3,
      rare: 1.7,
      legendary: 2.5
    },
    requirements: {
      minLevel: 5,
      minStats: {
        mental: 50
      },
      minFunds: 10000
    },
    baseSuccessRate: 50,
    costs: {
      stamina: 40,
      funds: 15000,
      motivation: 10
    },
    specialEffects: [
      {
        type: 'critical_success',
        name: '伝説の覚醒',
        description: '伝説的な力が覚醒した！',
        triggerChance: 20,
        effect: {
          specialAbilityChance: {
            ability_id: 'champions_aura',
            chance: 50
          },
          skillGrowth: {
            mental: 30,
            serve_skill: 20,
            return_skill: 20,
            volley_skill: 20,
            stroke_skill: 20
          }
        }
      }
    ]
  }
];

export class TrainingCardSystem {
  
  // カードドロップ確率計算（評判・レベル・季節による修正）
  public static calculateDropRates(
    baseRates: Record<CardRarity, number>,
    schoolReputation: number,
    playerLevel: number,
    seasonBonus: number = 1
  ): Record<CardRarity, number> {
    // 評判修正（高評判ほど良いカードが出やすい）
    const reputationMultiplier = Math.min(1 + (schoolReputation / 200), 2.0);
    
    // レベル修正
    const levelMultiplier = Math.min(1 + (playerLevel / 20), 1.5);
    
    const modifiedRates = {
      common: baseRates.common * (1 / reputationMultiplier) * (1 / levelMultiplier),
      uncommon: baseRates.uncommon * reputationMultiplier * levelMultiplier * 0.8,
      rare: baseRates.rare * reputationMultiplier * levelMultiplier * seasonBonus,
      legendary: baseRates.legendary * reputationMultiplier * levelMultiplier * seasonBonus * 1.2
    };

    // 正規化して100%にする
    const total = Object.values(modifiedRates).reduce((sum, rate) => sum + rate, 0);
    const normalizedRates = Object.fromEntries(
      Object.entries(modifiedRates).map(([rarity, rate]) => [rarity, (rate / total) * 100])
    ) as Record<CardRarity, number>;

    return normalizedRates;
  }

  // カードドロップ実行
  public static generateCardDrop(
    schoolReputation: number,
    playerLevel: number,
    cardCount: number = 3,
    context: 'daily_practice' | 'event_reward' | 'reputation_bonus' | 'special_training' = 'daily_practice'
  ): CardDrop {
    const baseRates = {
      common: RARITY_CONFIGS.common.baseDropRate,
      uncommon: RARITY_CONFIGS.uncommon.baseDropRate,
      rare: RARITY_CONFIGS.rare.baseDropRate,
      legendary: RARITY_CONFIGS.legendary.baseDropRate
    };

    // コンテキスト別ボーナス
    let seasonBonus = 1;
    if (context === 'event_reward') seasonBonus = 1.5;
    if (context === 'reputation_bonus') seasonBonus = 2.0;
    if (context === 'special_training') seasonBonus = 1.8;

    const dropRates = this.calculateDropRates(baseRates, schoolReputation, playerLevel, seasonBonus);
    const droppedCards: TrainingCard[] = [];

    for (let i = 0; i < cardCount; i++) {
      const rarity = this.selectRarityByProbability(dropRates);
      const availableCards = TRAINING_CARDS.filter(card => card.rarity === rarity);
      
      if (availableCards.length > 0) {
        const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        droppedCards.push(selectedCard);
      }
    }

    return {
      cards: droppedCards,
      context,
      modifiers: {
        schoolReputation,
        playerLevel,
        recentPerformance: 0, // TODO: 実装
        seasonBonus
      }
    };
  }

  // 確率による希少度選択
  private static selectRarityByProbability(rates: Record<CardRarity, number>): CardRarity {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (random <= cumulative) {
        return rarity as CardRarity;
      }
    }

    return 'common'; // フォールバック
  }

  // カード使用処理
  public static useCard(
    card: TrainingCard,
    playerStats: any, // Player型から必要な部分を抽出
    environmentModifiers: {
      weather?: string;
      courtCondition?: string;
      teamMorale?: number;
    } = {}
  ): CardUsageResult {
    // 成功確率計算
    let successRate = card.baseSuccessRate;
    
    // 希少度ボーナス
    const rarityConfig = RARITY_CONFIGS[card.rarity];
    successRate += rarityConfig.successRateBonus;
    
    // 環境修正
    if (environmentModifiers.weather === 'rainy' && card.category === 'physical') {
      successRate -= 15; // 雨天でフィジカル系は成功率低下
    }
    if (environmentModifiers.courtCondition === 'excellent') {
      successRate += 10; // 最高のコート状況でボーナス
    }

    // 成功判定
    const roll = Math.random() * 100;
    const success = roll <= successRate;

    // 成功度合い判定
    let successLevel: CardUsageResult['successLevel'] = 'failure';
    if (success) {
      if (roll <= successRate * 0.1) successLevel = 'critical';
      else if (roll <= successRate * 0.3) successLevel = 'perfect';
      else if (roll <= successRate * 0.6) successLevel = 'great';
      else successLevel = 'normal';
    }

    // 効果計算
    const effectMultiplier = success ? rarityConfig.effectMultiplier : 0.3; // 失敗でも少し成長
    const actualEffects: TrainingEffect = {
      skillGrowth: {},
      statusChanges: {},
      schoolEffects: {}
    };

    // スキル成長適用
    if (card.baseEffects.skillGrowth) {
      for (const [skill, value] of Object.entries(card.baseEffects.skillGrowth)) {
        actualEffects.skillGrowth![skill] = Math.round(value * effectMultiplier);
      }
    }

    // ステータス変化適用
    if (card.baseEffects.statusChanges) {
      for (const [status, value] of Object.entries(card.baseEffects.statusChanges)) {
        actualEffects.statusChanges![status] = Math.round(value * (success ? 1 : 0.5));
      }
    }

    // 特殊効果判定
    const triggeredEffects: SpecialCardEffect[] = [];
    if (success && card.specialEffects) {
      for (const specialEffect of card.specialEffects) {
        if (Math.random() * 100 <= specialEffect.triggerChance) {
          triggeredEffects.push(specialEffect);
        }
      }
    }

    // 結果メッセージ生成
    const resultMessage = this.generateResultMessage(card, successLevel, triggeredEffects);

    return {
      success,
      card,
      actualEffects,
      successLevel,
      specialEffectsTriggered: triggeredEffects,
      resultMessage,
      experienceGained: Math.round(10 * effectMultiplier),
      skillPointsGained: actualEffects.skillGrowth || {},
      injuryOccurred: success ? false : Math.random() < 0.05, // 失敗時5%で怪我
      fatigueLevel: card.costs.stamina
    };
  }

  // 結果メッセージ生成
  private static generateResultMessage(
    card: TrainingCard,
    successLevel: CardUsageResult['successLevel'],
    specialEffects: SpecialCardEffect[]
  ): string {
    const messages = {
      failure: [
        `${card.name}は失敗に終わった...`,
        `うまくいかなかったが、経験にはなった`,
        `今日は調子が悪いようだ...`
      ],
      normal: [
        `${card.name}が成功した`,
        `順調に練習できた`,
        `着実に成長している`
      ],
      great: [
        `${card.name}が大成功！`,
        `素晴らしい練習だった！`,
        `調子がいいぞ！`
      ],
      perfect: [
        `${card.name}が完璧に決まった！`,
        `完璧な練習ができた！`,
        `これぞ理想的な練習だ！`
      ],
      critical: [
        `${card.name}が奇跡的な成功を収めた！`,
        `信じられない完成度だ！`,
        `伝説的な練習になった！`
      ]
    };

    let message = messages[successLevel][Math.floor(Math.random() * messages[successLevel].length)];

    if (specialEffects.length > 0) {
      const specialNames = specialEffects.map(effect => effect.name).join('、');
      message += ` さらに「${specialNames}」が発動した！`;
    }

    return message;
  }

  // プレイヤー用カードデッキ初期化
  public static initializePlayerDeck(playerId: string): PlayerCardDeck {
    // 基本カードセット
    const basicCards = TRAINING_CARDS.filter(card => 
      card.rarity === 'common' && !card.requirements
    );

    return {
      playerId,
      availableCards: basicCards,
      dailyUsageLimit: {},
      cooldownCards: {},
      unlockableCards: TRAINING_CARDS
        .filter(card => card.requirements)
        .map(card => ({
          card,
          unlockConditions: card.requirements!,
          progress: 0
        }))
    };
  }
}