// 特殊能力習得イベントシステム

import { SpecialEvent, EventOutcome, ActiveEvent, EventChoice } from '@/types/special-events';
import { Player } from '@/types/game';
import { TENNIS_SPECIAL_ABILITIES, SpecialAbility } from '@/types/special-abilities';
import { DateManager } from './date-manager';

export class SpecialEventsSystem {
  // 特殊能力習得イベント定義
  private static readonly SPECIAL_EVENTS: SpecialEvent[] = [
    // === 基礎練習イベント ===
    {
      id: 'basic_serve_training',
      name: 'サーブ集中練習',
      description: '先輩から特別なサーブ技術を学ぶ機会が訪れました',
      type: 'training',
      icon: '🎾',
      rarity: 'common',
      trigger_conditions: {
        player_level: { min: 5, max: 20 },
        excluded_abilities: ['精密サーブ', 'エースマスター']
      },
      available_abilities: [
        {
          ability_id: 'precise_serve',
          success_rate: 0.7,
          requirements: {
            stat_minimums: { serve_skill: 35 }
          }
        }
      ],
      choices: [
        {
          id: 'intensive',
          text: '集中的に練習する',
          description: '成功率は上がるが、疲労のリスクもある',
          effects: {
            success_rate_modifier: 0.2,
            additional_rewards: { experience: 100 }
          },
          risk: 0.3
        },
        {
          id: 'relaxed',
          text: 'マイペースに練習する',
          description: '安全だが成功率は通常通り',
          effects: {
            success_rate_modifier: 0,
            additional_rewards: { experience: 50 }
          },
          risk: 0.1
        }
      ],
      rewards: {
        experience: 200,
        stat_boosts: { serve_skill: 3 }
      }
    },

    {
      id: 'mental_strength_trial',
      name: '精神力の試練',
      description: 'プレッシャーの中でも冷静さを保つ訓練が始まります',
      type: 'training',
      icon: '🧠',
      rarity: 'uncommon',
      trigger_conditions: {
        player_level: { min: 10 },
        match_results: 'loss'
      },
      available_abilities: [
        {
          ability_id: 'ice_cold',
          success_rate: 0.5,
          requirements: {
            stat_minimums: { mental: 45 }
          }
        },
        {
          ability_id: 'fighting_spirit',
          success_rate: 0.6,
          requirements: {
            stat_minimums: { mental: 40, stamina: 40 }
          }
        }
      ],
      choices: [
        {
          id: 'meditation',
          text: '瞑想で心を鍛える',
          description: '集中力重視のアプローチ',
          effects: {
            success_rate_modifier: 0.1,
            stat_requirements_modifier: -5
          },
          risk: 0.0
        },
        {
          id: 'pressure_training',
          text: 'プレッシャー下での練習',
          description: '実戦的だがハイリスク',
          effects: {
            success_rate_modifier: 0.3
          },
          risk: 0.4
        }
      ],
      rewards: {
        experience: 300,
        stat_boosts: { mental: 5 }
      }
    },

    // === 試合イベント ===
    {
      id: 'rival_encounter',
      name: '強敵との出会い',
      description: 'ライバルとの激戦で新たな力に目覚めるかもしれません',
      type: 'match',
      icon: '⚔️',
      rarity: 'rare',
      trigger_conditions: {
        player_level: { min: 15 },
        consecutive_wins: 3
      },
      available_abilities: [
        {
          ability_id: 'clutch_performer',
          success_rate: 0.4,
          requirements: {
            stat_minimums: { mental: 50, serve_skill: 45 }
          }
        },
        {
          ability_id: 'comeback_king',
          success_rate: 0.3,
          requirements: {
            stat_minimums: { mental: 55, stamina: 50 }
          }
        }
      ],
      choices: [
        {
          id: 'aggressive',
          text: '積極的に攻める',
          description: '攻撃的なプレイスタイル',
          effects: {
            success_rate_modifier: 0.1,
            additional_rewards: { reputation: 10 }
          },
          risk: 0.3
        },
        {
          id: 'defensive',
          text: '守備重視で戦う',
          description: '粘り強く戦う',
          effects: {
            success_rate_modifier: 0.15,
            additional_rewards: { experience: 150 }
          },
          risk: 0.2
        }
      ],
      rewards: {
        experience: 500,
        reputation: 20,
        stat_boosts: { mental: 7 }
      }
    },

    // === 季節イベント ===
    {
      id: 'summer_camp',
      name: '夏合宿特訓',
      description: '厳しい夏の合宿で限界を超える特訓が待っています',
      type: 'seasonal',
      icon: '☀️',
      rarity: 'epic',
      trigger_conditions: {
        season: 'summer',
        player_level: { min: 20 }
      },
      available_abilities: [
        {
          ability_id: 'stamina_monster',
          success_rate: 0.25,
          requirements: {
            stat_minimums: { stamina: 60, mental: 45 }
          }
        },
        {
          ability_id: 'court_magician',
          success_rate: 0.2,
          requirements: {
            stat_minimums: { serve_skill: 55, return_skill: 55, volley_skill: 55, stroke_skill: 55 }
          }
        }
      ],
      choices: [
        {
          id: 'endurance',
          text: 'スタミナ重点特訓',
          description: 'とことん体力を鍛え上げる',
          effects: {
            success_rate_modifier: 0.15,
            additional_rewards: { experience: 300 }
          },
          risk: 0.5
        },
        {
          id: 'technique',
          text: '技術重点特訓',
          description: '技術の精度を徹底的に磨く',
          effects: {
            success_rate_modifier: 0.1,
            stat_requirements_modifier: -10
          },
          risk: 0.3
        },
        {
          id: 'balanced',
          text: 'バランス重視',
          description: '全体的にレベルアップを図る',
          effects: {
            success_rate_modifier: 0.05
          },
          risk: 0.2
        }
      ],
      rewards: {
        experience: 800,
        stat_boosts: { stamina: 10, mental: 8, serve_skill: 5, return_skill: 5 }
      },
      duration: {
        start_date: { month: 7, day: 1 },
        end_date: { month: 8, day: 31 }
      }
    },

    // === レジェンダリーイベント ===
    {
      id: 'legendary_master',
      name: '伝説のマスターとの出会い',
      description: '伝説のテニス名人が現れ、究極の技を伝授してくれるかもしれません',
      type: 'achievement',
      icon: '👑',
      rarity: 'legendary',
      trigger_conditions: {
        player_level: { min: 40 },
        school_reputation: { min: 80 },
        consecutive_wins: 10
      },
      available_abilities: [
        {
          ability_id: 'ace_master',
          success_rate: 0.15,
          requirements: {
            stat_minimums: { serve_skill: 80, mental: 70 },
            intensive_training: true
          }
        },
        {
          ability_id: 'court_magician',
          success_rate: 0.1,
          requirements: {
            stat_minimums: { serve_skill: 75, return_skill: 75, volley_skill: 75, stroke_skill: 75 }
          }
        }
      ],
      choices: [
        {
          id: 'humble_student',
          text: '謙虚に教えを乞う',
          description: '素直に学ぶ姿勢を示す',
          effects: {
            success_rate_modifier: 0.1,
            additional_rewards: { experience: 500, reputation: 30 }
          },
          risk: 0.1
        },
        {
          id: 'challenge_master',
          text: 'マスターに挑戦する',
          description: '実力を示して認められようとする',
          effects: {
            success_rate_modifier: 0.2,
            additional_rewards: { reputation: 50 }
          },
          risk: 0.6
        }
      ],
      rewards: {
        experience: 1500,
        reputation: 100,
        stat_boosts: { serve_skill: 15, return_skill: 15, volley_skill: 15, stroke_skill: 15, mental: 20 }
      }
    },

    // === ランダムイベント ===
    {
      id: 'mysterious_coach',
      name: '謎のコーチ',
      description: '正体不明のコーチが現れ、特別な指導を申し出ています',
      type: 'random',
      icon: '🎭',
      rarity: 'rare',
      trigger_conditions: {
        player_level: { min: 12 }
      },
      available_abilities: [
        {
          ability_id: 'iron_defense',
          success_rate: 0.4,
          requirements: {
            stat_minimums: { return_skill: 40, mental: 35 }
          }
        },
        {
          ability_id: 'power_stroke',
          success_rate: 0.35,
          requirements: {
            stat_minimums: { stroke_skill: 45, stamina: 40 }
          }
        }
      ],
      choices: [
        {
          id: 'trust',
          text: 'コーチを信じる',
          description: '謎のコーチの指導を受け入れる',
          effects: {
            success_rate_modifier: 0.2
          },
          risk: 0.4
        },
        {
          id: 'cautious',
          text: '様子を見る',
          description: '慎重にアプローチする',
          effects: {
            success_rate_modifier: -0.1,
            additional_rewards: { experience: 100 }
          },
          risk: 0.1
        }
      ],
      rewards: {
        experience: 400,
        stat_boosts: { return_skill: 6 }
      }
    }
  ];

  // イベント発生チェック
  static checkEventTriggers(
    player: Player,
    currentDate: { year: number; month: number; day: number },
    recentMatchResult?: 'win' | 'loss',
    consecutiveWins: number = 0,
    schoolReputation: number = 50
  ): SpecialEvent[] {
    const availableEvents: SpecialEvent[] = [];

    for (const event of this.SPECIAL_EVENTS) {
      if (this.isEventTriggered(event, player, currentDate, recentMatchResult, consecutiveWins, schoolReputation)) {
        availableEvents.push(event);
      }
    }

    // レア度に基づく重み付き抽選
    return this.selectEventsByRarity(availableEvents);
  }

  // イベント発生条件チェック
  private static isEventTriggered(
    event: SpecialEvent,
    player: Player,
    currentDate: { year: number; month: number; day: number },
    recentMatchResult?: 'win' | 'loss',
    consecutiveWins: number = 0,
    schoolReputation: number = 50
  ): boolean {
    const conditions = event.trigger_conditions;

    // レベル条件
    if (conditions.player_level) {
      if (conditions.player_level.min && player.level < conditions.player_level.min) return false;
      if (conditions.player_level.max && player.level > conditions.player_level.max) return false;
    }

    // ポケモンタイプ条件
    if (conditions.pokemon_types && !conditions.pokemon_types.some(type => player.types.includes(type))) {
      return false;
    }

    // 既存能力条件
    if (conditions.current_abilities && player.special_abilities) {
      const hasRequired = conditions.current_abilities.some(abilityId =>
        player.special_abilities!.some(ability => ability.id === abilityId)
      );
      if (!hasRequired) return false;
    }

    // 除外能力条件
    if (conditions.excluded_abilities && player.special_abilities) {
      const hasExcluded = conditions.excluded_abilities.some(abilityId =>
        player.special_abilities!.some(ability => ability.id === abilityId)
      );
      if (hasExcluded) return false;
    }

    // 季節条件
    if (conditions.season) {
      const season = this.getCurrentSeason(currentDate.month);
      if (season !== conditions.season) return false;
    }

    // 学校評判条件
    if (conditions.school_reputation) {
      if (conditions.school_reputation.min && schoolReputation < conditions.school_reputation.min) return false;
      if (conditions.school_reputation.max && schoolReputation > conditions.school_reputation.max) return false;
    }

    // 試合結果条件
    if (conditions.match_results && recentMatchResult !== conditions.match_results && conditions.match_results !== 'any') {
      return false;
    }

    // 連勝条件
    if (conditions.consecutive_wins && consecutiveWins < conditions.consecutive_wins) {
      return false;
    }

    // 期間条件
    if (event.duration) {
      if (event.duration.start_date && event.duration.end_date) {
        const isInPeriod = this.isDateInRange(currentDate, event.duration.start_date, event.duration.end_date);
        if (!isInPeriod) return false;
      }
    }

    return true;
  }

  // 現在の季節を取得
  private static getCurrentSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // 日付範囲チェック
  private static isDateInRange(
    currentDate: { year: number; month: number; day: number },
    startDate: { month: number; day: number },
    endDate: { month: number; day: number }
  ): boolean {
    const current = currentDate.month * 100 + currentDate.day;
    const start = startDate.month * 100 + startDate.day;
    const end = endDate.month * 100 + endDate.day;
    
    return current >= start && current <= end;
  }

  // レア度による重み付き選択
  private static selectEventsByRarity(events: SpecialEvent[]): SpecialEvent[] {
    if (events.length === 0) return [];

    const weights = {
      common: 1.0,
      uncommon: 0.7,
      rare: 0.4,
      epic: 0.2,
      legendary: 0.05
    };

    const selectedEvents: SpecialEvent[] = [];

    for (const event of events) {
      const weight = weights[event.rarity];
      if (Math.random() < weight) {
        selectedEvents.push(event);
      }
    }

    // 最低1つのイベントは選択（commonから）
    if (selectedEvents.length === 0 && events.length > 0) {
      const commonEvents = events.filter(e => e.rarity === 'common');
      if (commonEvents.length > 0) {
        selectedEvents.push(commonEvents[Math.floor(Math.random() * commonEvents.length)]);
      } else {
        selectedEvents.push(events[Math.floor(Math.random() * events.length)]);
      }
    }

    return selectedEvents;
  }

  // イベント実行
  static async executeEvent(
    event: SpecialEvent,
    player: Player,
    selectedChoices: string[],
    selectedAbilityId: string
  ): Promise<EventOutcome> {
    const selectedAbility = event.available_abilities.find(a => a.ability_id === selectedAbilityId);
    
    if (!selectedAbility) {
      return {
        success: false,
        message: '選択された特殊能力が見つかりません',
        rewards_gained: {}
      };
    }

    // 成功率計算
    let finalSuccessRate = selectedAbility.success_rate;

    // 選択肢による修正
    for (const choiceId of selectedChoices) {
      const choice = event.choices?.find(c => c.id === choiceId);
      if (choice && choice.effects.success_rate_modifier) {
        finalSuccessRate += choice.effects.success_rate_modifier;
      }
    }

    // 要求ステータスチェック
    if (selectedAbility.requirements?.stat_minimums) {
      const meetRequirements = Object.entries(selectedAbility.requirements.stat_minimums).every(
        ([stat, minimum]) => {
          const playerStat = (player as any)[stat] || 0;
          let adjustedMinimum = minimum;
          
          // 選択肢による要求ステータス修正
          for (const choiceId of selectedChoices) {
            const choice = event.choices?.find(c => c.id === choiceId);
            if (choice && choice.effects.stat_requirements_modifier) {
              adjustedMinimum += choice.effects.stat_requirements_modifier;
            }
          }
          
          return playerStat >= adjustedMinimum;
        }
      );

      if (!meetRequirements) {
        return {
          success: false,
          message: 'ステータスが不足しているため、特殊能力の習得に失敗しました',
          rewards_gained: event.rewards || {}
        };
      }
    }

    // 最終判定
    const success = Math.random() < Math.max(0.05, Math.min(0.95, finalSuccessRate));

    if (success) {
      // 特殊能力を取得
      const learnedAbility = TENNIS_SPECIAL_ABILITIES.find(ability => ability.id === selectedAbilityId);
      
      if (learnedAbility) {
        // 報酬計算
        const rewardsGained = { ...event.rewards };
        
        // 選択肢による追加報酬
        for (const choiceId of selectedChoices) {
          const choice = event.choices?.find(c => c.id === choiceId);
          if (choice?.effects.additional_rewards) {
            Object.entries(choice.effects.additional_rewards).forEach(([key, value]) => {
              (rewardsGained as any)[key] = ((rewardsGained as any)[key] || 0) + value;
            });
          }
        }

        return {
          success: true,
          learned_ability: { ...learnedAbility, isActive: true },
          message: `${player.pokemon_name}が特殊能力「${learnedAbility.name}」を習得しました！`,
          rewards_gained: rewardsGained || {}
        };
      }
    }

    // 失敗時
    const rewardsGained = { ...(event.rewards || {}) };
    
    // 失敗時は報酬半減
    Object.keys(rewardsGained).forEach(key => {
      (rewardsGained as any)[key] = Math.floor(((rewardsGained as any)[key] || 0) / 2);
    });

    return {
      success: false,
      message: `${player.pokemon_name}は特殊能力の習得に失敗しました...でも経験は積めました`,
      rewards_gained: rewardsGained
    };
  }

  // 利用可能なイベント取得
  static getAvailableEvents(): SpecialEvent[] {
    return [...this.SPECIAL_EVENTS];
  }

  // イベントをIDで取得
  static getEventById(eventId: string): SpecialEvent | null {
    return this.SPECIAL_EVENTS.find(event => event.id === eventId) || null;
  }

  // プレイヤーの習得可能な特殊能力チェック
  static getLearnableAbilities(player: Player, event: SpecialEvent): string[] {
    const learnable: string[] = [];

    for (const abilityOption of event.available_abilities) {
      // 既に持っている能力かチェック
      const alreadyHas = player.special_abilities?.some(
        ability => ability.id === abilityOption.ability_id
      );

      if (!alreadyHas) {
        // 基本要求ステータスをチェック（厳密ではなく、可能性として）
        if (abilityOption.requirements?.stat_minimums) {
          const couldLearn = Object.entries(abilityOption.requirements.stat_minimums).some(
            ([stat, minimum]) => {
              const playerStat = (player as any)[stat] || 0;
              return playerStat >= minimum * 0.8; // 80%達成していれば可能性あり
            }
          );
          
          if (couldLearn) {
            learnable.push(abilityOption.ability_id);
          }
        } else {
          learnable.push(abilityOption.ability_id);
        }
      }
    }

    return learnable;
  }
}