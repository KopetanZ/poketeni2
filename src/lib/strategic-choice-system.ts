// 栄冠ナイン風分岐選択システムの実装

import {
  StrategicChoice,
  ChoiceRoute,
  ChoiceOutcome,
  ChoiceRouteType,
  OutcomeType,
  ChoiceContext,
  ChoiceHistory,
  ProbabilityModifiers,
  ChoiceGenerationConfig
} from '../types/strategic-choice';

// 戦略的選択肢のデータベース
export const STRATEGIC_CHOICES: StrategicChoice[] = [
  // 日常練習での選択
  {
    id: 'daily_intensive_training',
    title: '特別強化練習の機会',
    description: '今日は絶好のコンディション。どのような練習アプローチを取るか？',
    context: 'daily_practice',
    situationDescription: 'コート状況も天候も最高。部員のやる気も高い。この機会をどう活かす？',
    routes: {
      aggressive: {
        routeType: 'aggressive',
        name: '限界突破練習',
        description: '体力の限界まで追い込んだ超ハード練習',
        flavorText: '「今日しかない！全力で行くぞ！」',
        icon: '🔥',
        color: '#DC2626',
        successProbabilities: {
          great_success: 15,
          success: 30,
          normal: 25,
          failure: 20,
          disaster: 10
        },
        potentialEffects: {
          playerGrowth: {
            serve_skill: 15,
            return_skill: 15,
            volley_skill: 15,
            stroke_skill: 15,
            stamina: 20,
            mental: 10
          },
          specialRewards: {
            cardBonus: 3,
            experienceMultiplier: 2.0,
            specialAbilityChance: 25
          }
        },
        riskFactors: {
          injuryRisk: 25,
          fatigueIncrease: 40,
          moraleDecrease: 10
        },
        requirements: {
          minStamina: 60,
          minMorale: 50
        }
      },
      balanced: {
        routeType: 'balanced',
        name: '効率重視練習',
        description: 'バランスの取れた計画的な練習メニュー',
        flavorText: '「着実に、でも確実に成長していこう」',
        icon: '⚖️',
        color: '#2563EB',
        successProbabilities: {
          great_success: 5,
          success: 45,
          normal: 40,
          failure: 8,
          disaster: 2
        },
        potentialEffects: {
          playerGrowth: {
            serve_skill: 8,
            return_skill: 8,
            volley_skill: 8,
            stroke_skill: 8,
            mental: 8,
            stamina: 10
          },
          specialRewards: {
            cardBonus: 1,
            experienceMultiplier: 1.2
          }
        },
        riskFactors: {
          injuryRisk: 5,
          fatigueIncrease: 15
        }
      },
      conservative: {
        routeType: 'conservative',
        name: '安全確実練習',
        description: '怪我を避けて基礎を固める練習',
        flavorText: '「焦らず、基礎から確実に」',
        icon: '🛡️',
        color: '#059669',
        successProbabilities: {
          great_success: 2,
          success: 25,
          normal: 60,
          failure: 13,
          disaster: 0
        },
        potentialEffects: {
          playerGrowth: {
            serve_skill: 5,
            return_skill: 5,
            volley_skill: 5,
            stroke_skill: 5,
            mental: 12,
            stamina: 8
          },
          teamEffects: {
            morale: 5,
            cohesion: 8
          }
        },
        riskFactors: {
          injuryRisk: 0,
          fatigueIncrease: 8
        }
      }
    }
  },

  // イベント対応での選択
  {
    id: 'rival_challenge_response',
    title: 'ライバル校からの挑戦状',
    description: '強豪校から突然の練習試合の申し込みが！どう対応する？',
    context: 'event_response',
    situationDescription: 'ライバル校の監督から電話。「今度の練習試合、本気で来いよ」',
    routes: {
      aggressive: {
        routeType: 'aggressive',
        name: '真正面から挑戦',
        description: '最強メンバーで正面から勝負を挑む',
        flavorText: '「やってやる！絶対に勝つ！」',
        icon: '⚔️',
        color: '#DC2626',
        successProbabilities: {
          great_success: 20,
          success: 25,
          normal: 20,
          failure: 25,
          disaster: 10
        },
        potentialEffects: {
          playerGrowth: {
            mental: 20,
            serve_skill: 10,
            return_skill: 10
          },
          schoolEffects: {
            reputation: 15,
            funds: 5000
          },
          specialRewards: {
            cardBonus: 2,
            specialAbilityChance: 30
          }
        },
        riskFactors: {
          reputationLoss: 10,
          moraleDecrease: 15,
          injuryRisk: 15
        }
      },
      balanced: {
        routeType: 'balanced',
        name: '戦略的対応',
        description: 'チーム状況を見極めて臨機応変に対応',
        flavorText: '「相手を研究して、ベストを尽くそう」',
        icon: '🎯',
        color: '#2563EB',
        successProbabilities: {
          great_success: 10,
          success: 40,
          normal: 35,
          failure: 12,
          disaster: 3
        },
        potentialEffects: {
          playerGrowth: {
            mental: 12,
            serve_skill: 6,
            return_skill: 6,
            volley_skill: 6,
            stroke_skill: 6
          },
          schoolEffects: {
            reputation: 8
          },
          teamEffects: {
            cohesion: 10
          }
        },
        riskFactors: {
          reputationLoss: 3,
          moraleDecrease: 5
        }
      },
      conservative: {
        routeType: 'conservative',
        name: '経験重視で参加',
        description: '結果より経験を重視して参加',
        flavorText: '「勝敗より、学ぶことが大事だ」',
        icon: '📚',
        color: '#059669',
        successProbabilities: {
          great_success: 3,
          success: 20,
          normal: 50,
          failure: 25,
          disaster: 2
        },
        potentialEffects: {
          playerGrowth: {
            mental: 15,
            serve_skill: 4,
            return_skill: 4,
            volley_skill: 4,
            stroke_skill: 4
          },
          teamEffects: {
            morale: 8,
            cohesion: 12
          }
        },
        riskFactors: {
          reputationLoss: 2,
          injuryRisk: 5
        }
      }
    },
    triggerConditions: {
      schoolReputation: 30,
      squadSize: 4
    }
  },

  // 試合準備での選択
  {
    id: 'tournament_preparation',
    title: '重要な大会前の最終調整',
    description: '大会まで残り1週間。最後の調整をどうする？',
    context: 'match_preparation',
    situationDescription: '県大会まであと1週間。チームの状況は良好だが、最後の仕上げが重要だ',
    routes: {
      aggressive: {
        routeType: 'aggressive',
        name: '実戦形式の特訓',
        description: '本番さながらの緊張感で最終調整',
        flavorText: '「本番で実力を発揮するために、今が正念場だ！」',
        icon: '🏆',
        color: '#DC2626',
        successProbabilities: {
          great_success: 25,
          success: 35,
          normal: 20,
          failure: 15,
          disaster: 5
        },
        potentialEffects: {
          playerGrowth: {
            mental: 25,
            serve_skill: 8,
            return_skill: 8,
            volley_skill: 8,
            stroke_skill: 8
          },
          teamEffects: {
            cohesion: 15
          },
          specialRewards: {
            cardBonus: 2,
            specialAbilityChance: 35
          }
        },
        riskFactors: {
          injuryRisk: 20,
          fatigueIncrease: 30,
          moraleDecrease: 5
        }
      },
      balanced: {
        routeType: 'balanced',
        name: '調整中心の練習',
        description: '体調管理と技術の微調整を中心に',
        flavorText: '「ベストコンディションで本番を迎えよう」',
        icon: '🎯',
        color: '#2563EB',
        successProbabilities: {
          great_success: 8,
          success: 50,
          normal: 30,
          failure: 10,
          disaster: 2
        },
        potentialEffects: {
          playerGrowth: {
            mental: 15,
            stamina: 5
          },
          teamEffects: {
            morale: 10,
            cohesion: 8
          }
        },
        riskFactors: {
          injuryRisk: 8,
          fatigueIncrease: 12
        }
      },
      conservative: {
        routeType: 'conservative',
        name: '休養重視',
        description: '疲労回復と心身のリフレッシュを優先',
        flavorText: '「コンディション第一。無理は禁物だ」',
        icon: '💤',
        color: '#059669',
        successProbabilities: {
          great_success: 5,
          success: 30,
          normal: 45,
          failure: 18,
          disaster: 2
        },
        potentialEffects: {
          playerGrowth: {
            mental: 10,
            stamina: 15
          },
          teamEffects: {
            morale: 15
          }
        },
        riskFactors: {
          injuryRisk: 0,
          fatigueIncrease: -20 // 疲労回復
        }
      }
    }
  },

  // 危機管理での選択
  {
    id: 'injury_crisis_management',
    title: '主力選手の怪我',
    description: 'エースが練習中に怪我！大会まで時間がない中でどうする？',
    context: 'crisis_management',
    situationDescription: 'チームの要である主力選手が足首を捻挫。軽傷だが大会が近い...',
    routes: {
      aggressive: {
        routeType: 'aggressive',
        name: '強行出場',
        description: '痛み止めで無理矢理でも出場させる',
        flavorText: '「チームのために、今は我慢してくれ！」',
        icon: '💊',
        color: '#DC2626',
        successProbabilities: {
          great_success: 15,
          success: 20,
          normal: 25,
          failure: 25,
          disaster: 15
        },
        potentialEffects: {
          teamEffects: {
            morale: 10 // チーム一丸となる
          },
          specialRewards: {
            specialAbilityChance: 20 // 「不屈の精神」等
          }
        },
        riskFactors: {
          injuryRisk: 50, // 怪我悪化リスク
          moraleDecrease: 20, // 失敗時のチーム士気低下
          reputationLoss: 5
        }
      },
      balanced: {
        routeType: 'balanced',
        name: '代替戦略',
        description: 'フォーメーションを変更して対応',
        flavorText: '「みんなでカバーしよう。これもチームワークだ」',
        icon: '🔄',
        color: '#2563EB',
        successProbabilities: {
          great_success: 8,
          success: 35,
          normal: 40,
          failure: 15,
          disaster: 2
        },
        potentialEffects: {
          teamEffects: {
            cohesion: 15,
            morale: 5
          },
          playerGrowth: {
            mental: 10 // 控え選手の成長
          }
        },
        riskFactors: {
          moraleDecrease: 5
        }
      },
      conservative: {
        routeType: 'conservative',
        name: '完全休養',
        description: '怪我の完治を最優先にする',
        flavorText: '「健康が一番。無理は絶対にダメだ」',
        icon: '🏥',
        color: '#059669',
        successProbabilities: {
          great_success: 3,
          success: 25,
          normal: 50,
          failure: 20,
          disaster: 2
        },
        potentialEffects: {
          teamEffects: {
            morale: -5 // 戦力ダウンによる不安
          },
          playerGrowth: {
            stamina: 20, // 怪我した選手の完全回復
            mental: 5
          }
        },
        riskFactors: {
          injuryRisk: -30 // 怪我リスク大幅減
        }
      }
    }
  }
];

export class StrategicChoiceSystem {

  // 確率修正要因計算
  public static calculateProbabilityModifiers(
    playerStats: any,
    schoolStats: any,
    environmentFactors: any,
    choiceHistory?: ChoiceHistory
  ): ProbabilityModifiers {
    return {
      playerModifiers: {
        levelBonus: Math.min((playerStats.level || 1) * 2, 20),
        staminaModifier: (playerStats.stamina || 50) / 100 * 10,
        mentalStrengthModifier: (playerStats.mental || 50) / 100 * 15,
        experienceBonus: Math.min((playerStats.experience || 0) / 1000 * 5, 15)
      },
      environmentModifiers: {
        weatherModifier: environmentFactors.weather === 'sunny' ? 5 : 
                         environmentFactors.weather === 'rainy' ? -5 : 0,
        courtConditionModifier: environmentFactors.courtCondition === 'excellent' ? 10 :
                               environmentFactors.courtCondition === 'poor' ? -10 : 0,
        teamMoraleModifier: (environmentFactors.teamMorale || 50) / 100 * 10,
        seasonModifier: 0 // TODO: 季節による修正
      },
      schoolModifiers: {
        reputationBonus: Math.min((schoolStats.reputation || 50) / 10, 15),
        facilitiesBonus: Math.min((schoolStats.facilities || 50) / 10, 10),
        fundingLevelModifier: schoolStats.funds > 100000 ? 5 : schoolStats.funds < 10000 ? -5 : 0
      },
      historyModifiers: {
        recentSuccessBonus: 0, // TODO: 最近の成功に基づく修正
        routeExperienceBonus: 0, // TODO: ルート選択経験による修正
        adaptabilityModifier: 0 // TODO: 適応性による修正
      }
    };
  }

  // 選択肢の成功確率調整
  public static adjustSuccessProbabilities(
    baseRoute: ChoiceRoute,
    modifiers: ProbabilityModifiers
  ): ChoiceRoute['successProbabilities'] {
    // 全修正要因の合計
    const totalModifier = 
      Object.values(modifiers.playerModifiers).reduce((sum, val) => sum + val, 0) +
      Object.values(modifiers.environmentModifiers).reduce((sum, val) => sum + val, 0) +
      Object.values(modifiers.schoolModifiers).reduce((sum, val) => sum + val, 0) +
      Object.values(modifiers.historyModifiers).reduce((sum, val) => sum + val, 0);

    // ルートタイプ別の修正
    const routeMultiplier = {
      aggressive: 1.0, // 攻撃的は修正そのまま
      balanced: 0.7,   // バランス型は修正を抑制
      conservative: 0.5 // 保守的は修正を大幅抑制
    }[baseRoute.routeType];

    const adjustedModifier = totalModifier * routeMultiplier;

    // 確率を調整（成功系を上げて失敗系を下げる）
    const baseProbabilities = baseRoute.successProbabilities;
    const adjustment = adjustedModifier; // %

    return {
      great_success: Math.max(0, Math.min(50, baseProbabilities.great_success + adjustment * 0.3)),
      success: Math.max(0, Math.min(60, baseProbabilities.success + adjustment * 0.4)),
      normal: Math.max(0, Math.min(80, baseProbabilities.normal + adjustment * 0.2)),
      failure: Math.max(0, Math.min(50, baseProbabilities.failure - adjustment * 0.5)),
      disaster: Math.max(0, Math.min(30, baseProbabilities.disaster - adjustment * 0.4))
    };
  }

  // 選択実行
  public static executeChoice(
    choice: StrategicChoice,
    selectedRoute: ChoiceRouteType,
    modifiers: ProbabilityModifiers
  ): ChoiceOutcome {
    const route = choice.routes[selectedRoute];
    const adjustedProbabilities = this.adjustSuccessProbabilities(route, modifiers);

    // 結果判定
    const roll = Math.random() * 100;
    let cumulative = 0;
    let outcome: OutcomeType = 'normal';

    for (const [outcomeType, probability] of Object.entries(adjustedProbabilities)) {
      cumulative += probability;
      if (roll <= cumulative) {
        outcome = outcomeType as OutcomeType;
        break;
      }
    }

    // 効果計算
    const outcomeMultipliers = {
      great_success: 1.8,
      success: 1.2,
      normal: 1.0,
      failure: 0.3,
      disaster: 0.0
    };

    const multiplier = outcomeMultipliers[outcome];
    const actualEffects: ChoiceOutcome['actualEffects'] = {};

    // プレイヤー効果適用
    if (route.potentialEffects.playerGrowth) {
      actualEffects.playerChanges = {};
      for (const [stat, value] of Object.entries(route.potentialEffects.playerGrowth)) {
        actualEffects.playerChanges[stat] = Math.round(value * multiplier);
      }
    }

    // チーム効果適用
    if (route.potentialEffects.teamEffects) {
      actualEffects.teamChanges = {};
      for (const [stat, value] of Object.entries(route.potentialEffects.teamEffects)) {
        actualEffects.teamChanges[stat] = Math.round(value * multiplier);
      }
    }

    // 学校効果適用
    if (route.potentialEffects.schoolEffects) {
      actualEffects.schoolChanges = {};
      for (const [stat, value] of Object.entries(route.potentialEffects.schoolEffects)) {
        actualEffects.schoolChanges[stat] = Math.round(value * multiplier);
      }
    }

    // 特別報酬
    if (route.potentialEffects.specialRewards && multiplier > 0.5) {
      actualEffects.specialRewards = {};
      if (route.potentialEffects.specialRewards.cardBonus) {
        actualEffects.specialRewards.extraCards = Math.round(
          route.potentialEffects.specialRewards.cardBonus * multiplier
        );
      }
      if (route.potentialEffects.specialRewards.experienceMultiplier) {
        actualEffects.specialRewards.bonusExperience = Math.round(
          100 * route.potentialEffects.specialRewards.experienceMultiplier * multiplier
        );
      }
    }

    // リスク適用（失敗時）
    if (outcome === 'failure' || outcome === 'disaster') {
      // リスクによるマイナス効果を actualEffects に追加
      if (route.riskFactors.moraleDecrease) {
        actualEffects.teamChanges = actualEffects.teamChanges || {};
        actualEffects.teamChanges.morale = -(route.riskFactors.moraleDecrease);
      }
    }

    // メッセージ生成
    const { resultMessage, detailedDescription } = this.generateResultMessages(
      choice, route, outcome, actualEffects
    );

    return {
      choiceId: choice.id,
      selectedRoute,
      outcome,
      actualEffects,
      resultMessage,
      detailedDescription,
      consequenceText: this.generateConsequenceText(outcome, selectedRoute),
      futureModifiers: this.calculateFutureModifiers(outcome, selectedRoute)
    };
  }

  // 結果メッセージ生成
  private static generateResultMessages(
    choice: StrategicChoice,
    route: ChoiceRoute,
    outcome: OutcomeType,
    effects: any
  ): { resultMessage: string; detailedDescription: string } {
    const outcomeMessages = {
      great_success: [
        '大成功！期待を遥かに上回る結果だ！',
        '素晴らしい！完璧な判断だった！',
        '奇跡的な成果を上げた！'
      ],
      success: [
        '成功だ！良い選択だった',
        '狙い通りの結果が得られた',
        '期待通りの成果だ'
      ],
      normal: [
        '可もなく不可もない結果',
        '平凡な結果に終わった',
        '普通の成果だった'
      ],
      failure: [
        'うまくいかなかった...',
        '期待した結果は得られなかった',
        '失敗に終わった'
      ],
      disaster: [
        '最悪の結果だ...',
        '完全な失敗、大きな代償を払うことに',
        '取り返しのつかないことになった'
      ]
    };

    const baseMessage = outcomeMessages[outcome][Math.floor(Math.random() * outcomeMessages[outcome].length)];
    const detailedDescription = `${route.flavorText}\n\n${choice.situationDescription}\n\n結果: ${baseMessage}`;

    return {
      resultMessage: `${route.name}: ${baseMessage}`,
      detailedDescription
    };
  }

  // 将来への影響計算
  private static calculateFutureModifiers(
    outcome: OutcomeType,
    routeType: ChoiceRouteType
  ): ChoiceOutcome['futureModifiers'] {
    const baseModifier = {
      great_success: 10,
      success: 5,
      normal: 0,
      failure: -3,
      disaster: -10
    }[outcome];

    return {
      nextChoiceBonus: baseModifier,
      relationshipChanges: {},
      unlockConditions: outcome === 'great_success' ? [`${routeType}_mastery`] : []
    };
  }

  // 長期的影響説明生成
  private static generateConsequenceText(
    outcome: OutcomeType,
    routeType: ChoiceRouteType
  ): string {
    if (outcome === 'great_success') {
      return `この成功により、今後の${routeType}的な選択肢で有利になるだろう`;
    } else if (outcome === 'disaster') {
      return 'この失敗の影響は長期間続くことになりそうだ...';
    }
    return '';
  }

  // 利用可能な選択肢フィルタリング
  public static getAvailableChoices(
    context: ChoiceContext,
    playerStats: any,
    schoolStats: any,
    environmentFactors: any
  ): StrategicChoice[] {
    return STRATEGIC_CHOICES.filter(choice => {
      // コンテキストマッチ
      if (choice.context !== context) return false;

      // 発生条件チェック
      if (choice.triggerConditions) {
        const conditions = choice.triggerConditions;
        if (conditions.playerLevel && (playerStats.level || 1) < conditions.playerLevel) return false;
        if (conditions.schoolReputation && (schoolStats.reputation || 0) < conditions.schoolReputation) return false;
        if (conditions.squadSize && (playerStats.squadSize || 1) < conditions.squadSize) return false;
        if (conditions.seasonMonth && conditions.seasonMonth !== environmentFactors.currentMonth) return false;
        if (conditions.weatherCondition && conditions.weatherCondition !== environmentFactors.weather) return false;
      }

      return true;
    });
  }
}