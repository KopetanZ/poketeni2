// テニス特化型特殊能力システム（パワプロ・栄冠ナイン風）

export type SpecialAbilityType = 
  | 'serve'      // サーブ系
  | 'return'     // リターン系
  | 'volley'     // ボレー系
  | 'stroke'     // ストローク系
  | 'mental'     // メンタル系
  | 'physical'   // フィジカル系
  | 'tactical'   // 戦術系
  | 'situational'; // シチュエーション系

export type SpecialAbilityRank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type SpecialAbilityColor = 'gold' | 'blue' | 'red' | 'green' | 'changeable';

export interface SpecialAbility {
  id: string;
  name: string;
  englishName: string;
  type: SpecialAbilityType;
  color: SpecialAbilityColor;
  rank: SpecialAbilityRank;
  description: string;
  effects: SpecialAbilityEffects;
  isActive: boolean;
  prerequisites?: {
    level?: number;
    baseStats?: { [key: string]: number };
    requiredAbilities?: string[];
  };
}

// 特殊能力の効果（数値的な影響）
export interface SpecialAbilityEffects {
  // 基本能力値への影響
  serveBoost?: number;
  returnBoost?: number;
  volleyBoost?: number;
  strokeBoost?: number;
  mentalBoost?: number;
  staminaBoost?: number;

  // 状況別効果
  tiebreakBonus?: number;        // タイブレークでのボーナス
  matchPointBonus?: number;      // マッチポイントでのボーナス
  behindBonus?: number;          // 劣勢時のボーナス
  leadBonus?: number;            // 優勢時のボーナス
  fatiguePenaltyReduction?: number; // 疲労ペナルティ軽減

  // 特殊効果
  criticalHitRate?: number;      // 決定的なショット率
  errorReduction?: number;       // エラー率軽減
  staminaConsumptionReduction?: number; // スタミナ消費軽減
  injuryResistance?: number;     // 怪我耐性
  consistencyBoost?: number;     // 安定性向上

  // 対戦相手タイプ別効果
  vsLeftHandedBonus?: number;    // 左利き相手へのボーナス
  vsRightHandedBonus?: number;   // 右利き相手へのボーナス
  vsAggressive?: number;         // アグレッシブ相手への対応
  vsDefensive?: number;          // 守備的相手への対応
}

// 特殊能力データベース（テニス版）
export const TENNIS_SPECIAL_ABILITIES: SpecialAbility[] = [
  // ゴールド級サーブ系特殊能力
  {
    id: 'ace_master',
    name: 'エースマスター',
    englishName: 'Ace Master',
    type: 'serve',
    color: 'gold',
    rank: 'A',
    description: 'サービスエースを決める確率が大幅に上昇',
    effects: {
      serveBoost: 15,
      criticalHitRate: 25,
      tiebreakBonus: 10
    },
    isActive: true
  },
  {
    id: 'power_serve',
    name: 'パワーサーブ',
    englishName: 'Power Serve',
    type: 'serve',
    color: 'gold',
    rank: 'A',
    description: '強力なサーブで相手を圧倒',
    effects: {
      serveBoost: 20,
      staminaConsumptionReduction: -5
    },
    isActive: true
  },
  {
    id: 'precision_serve',
    name: '精密サーブ',
    englishName: 'Precision Serve',
    type: 'serve',
    color: 'blue',
    rank: 'B',
    description: 'コーナーを狙った正確なサーブ',
    effects: {
      serveBoost: 12,
      errorReduction: 15,
      consistencyBoost: 10
    },
    isActive: true
  },

  // リターン系
  {
    id: 'return_ace',
    name: 'リターンエース',
    englishName: 'Return Ace',
    type: 'return',
    color: 'gold',
    rank: 'A',
    description: 'リターンゲームで圧倒的な強さを発揮',
    effects: {
      returnBoost: 18,
      criticalHitRate: 20,
      vsAggressive: 15
    },
    isActive: true
  },
  {
    id: 'defensive_wall',
    name: '鉄壁ディフェンス',
    englishName: 'Defensive Wall',
    type: 'return',
    color: 'blue',
    rank: 'B',
    description: 'どんな攻撃も跳ね返す守備力',
    effects: {
      returnBoost: 10,
      staminaBoost: 8,
      errorReduction: 20,
      vsAggressive: 12
    },
    isActive: true
  },

  // ボレー系
  {
    id: 'net_dominator',
    name: 'ネット支配者',
    englishName: 'Net Dominator',
    type: 'volley',
    color: 'gold',
    rank: 'A',
    description: 'ネットプレーで圧倒的な存在感',
    effects: {
      volleyBoost: 20,
      criticalHitRate: 18,
      leadBonus: 10
    },
    isActive: true
  },
  {
    id: 'soft_touch',
    name: 'ソフトタッチ',
    englishName: 'Soft Touch',
    type: 'volley',
    color: 'blue',
    rank: 'B',
    description: '繊細なタッチでボールを操る',
    effects: {
      volleyBoost: 12,
      errorReduction: 18,
      consistencyBoost: 12
    },
    isActive: true
  },

  // ストローク系
  {
    id: 'power_stroke',
    name: 'パワーストローク',
    englishName: 'Power Stroke',
    type: 'stroke',
    color: 'gold',
    rank: 'A',
    description: '強烈なストロークで相手を圧倒',
    effects: {
      strokeBoost: 18,
      criticalHitRate: 15,
      behindBonus: 12
    },
    isActive: true
  },
  {
    id: 'spin_master',
    name: 'スピンマスター',
    englishName: 'Spin Master',
    type: 'stroke',
    color: 'blue',
    rank: 'B',
    description: '多彩なスピンで相手を翻弄',
    effects: {
      strokeBoost: 12,
      vsDefensive: 15,
      consistencyBoost: 8
    },
    isActive: true
  },

  // メンタル系
  {
    id: 'clutch_performer',
    name: 'クラッチパフォーマー',
    englishName: 'Clutch Performer',
    type: 'mental',
    color: 'gold',
    rank: 'S',
    description: '重要な場面で真価を発揮',
    effects: {
      mentalBoost: 15,
      matchPointBonus: 25,
      tiebreakBonus: 20,
      behindBonus: 15
    },
    isActive: true
  },
  {
    id: 'ice_cold',
    name: 'アイスコールド',
    englishName: 'Ice Cold',
    type: 'mental',
    color: 'blue',
    rank: 'A',
    description: '冷静沈着で決してパニックにならない',
    effects: {
      mentalBoost: 12,
      errorReduction: 15,
      consistencyBoost: 18,
      tiebreakBonus: 10
    },
    isActive: true
  },
  {
    id: 'fighting_spirit',
    name: '闘志',
    englishName: 'Fighting Spirit',
    type: 'mental',
    color: 'blue',
    rank: 'B',
    description: '不屈の闘志で立ち向かう',
    effects: {
      mentalBoost: 8,
      behindBonus: 18,
      staminaBoost: 5
    },
    isActive: true
  },

  // フィジカル系
  {
    id: 'stamina_monster',
    name: 'スタミナモンスター',
    englishName: 'Stamina Monster',
    type: 'physical',
    color: 'gold',
    rank: 'A',
    description: '異次元のスタミナで長期戦も平気',
    effects: {
      staminaBoost: 25,
      fatiguePenaltyReduction: 30,
      staminaConsumptionReduction: 20
    },
    isActive: true
  },
  {
    id: 'injury_resistant',
    name: '怪我耐性',
    englishName: 'Injury Resistant',
    type: 'physical',
    color: 'blue',
    rank: 'B',
    description: '怪我をしにくい丈夫な体',
    effects: {
      injuryResistance: 25,
      staminaBoost: 8,
      consistencyBoost: 5
    },
    isActive: true
  },

  // 戦術系
  {
    id: 'court_wizard',
    name: 'コートの魔術師',
    englishName: 'Court Wizard',
    type: 'tactical',
    color: 'gold',
    rank: 'S',
    description: 'あらゆる戦術を駆使する天才',
    effects: {
      serveBoost: 8,
      returnBoost: 8,
      volleyBoost: 8,
      strokeBoost: 8,
      vsLeftHandedBonus: 10,
      vsRightHandedBonus: 10
    },
    isActive: true
  },
  {
    id: 'adaptable',
    name: '適応力',
    englishName: 'Adaptable',
    type: 'tactical',
    color: 'blue',
    rank: 'A',
    description: 'どんな相手にも対応できる柔軟性',
    effects: {
      vsAggressive: 12,
      vsDefensive: 12,
      consistencyBoost: 10
    },
    isActive: true
  },

  // 状況系
  {
    id: 'comeback_king',
    name: '逆転王',
    englishName: 'Comeback King',
    type: 'situational',
    color: 'gold',
    rank: 'S',
    description: '劣勢からの逆転劇を演出',
    effects: {
      behindBonus: 30,
      matchPointBonus: 15,
      mentalBoost: 10
    },
    isActive: true
  },
  {
    id: 'pressure_relief',
    name: 'プレッシャー無効',
    englishName: 'Pressure Relief',
    type: 'situational',
    color: 'blue',
    rank: 'A',
    description: 'プレッシャーを感じない鋼のメンタル',
    effects: {
      mentalBoost: 15,
      tiebreakBonus: 15,
      matchPointBonus: 10,
      errorReduction: 10
    },
    isActive: true
  },

  // 赤色特殊能力（ネガティブ効果）
  {
    id: 'nervous',
    name: '緊張',
    englishName: 'Nervous',
    type: 'mental',
    color: 'red',
    rank: 'D',
    description: '重要な場面で緊張してしまう',
    effects: {
      mentalBoost: -10,
      tiebreakBonus: -15,
      matchPointBonus: -12,
      errorReduction: -8
    },
    isActive: true
  },
  {
    id: 'injury_prone',
    name: '怪我しやすい',
    englishName: 'Injury Prone',
    type: 'physical',
    color: 'red',
    rank: 'E',
    description: '怪我をしやすい体質',
    effects: {
      injuryResistance: -20,
      staminaBoost: -5,
      fatiguePenaltyReduction: -10
    },
    isActive: true
  }
];

// 特殊能力の効果計算ユーティリティ
export class SpecialAbilityCalculator {
  // 特殊能力による能力値補正を計算
  static calculateStatBonus(
    abilities: SpecialAbility[], 
    statType: keyof SpecialAbilityEffects,
    situation?: {
      isBehind?: boolean;
      isAhead?: boolean;
      isTiebreak?: boolean;
      isMatchPoint?: boolean;
      opponentType?: 'aggressive' | 'defensive';
      opponentHand?: 'left' | 'right';
    }
  ): number {
    let totalBonus = 0;

    abilities.forEach(ability => {
      if (!ability.isActive) return;

      const effects = ability.effects;
      
      // 基本ボーナス
      if (effects[statType]) {
        totalBonus += effects[statType] as number;
      }

      // 状況別ボーナス
      if (situation) {
        if (situation.isBehind && effects.behindBonus) {
          totalBonus += effects.behindBonus;
        }
        if (situation.isAhead && effects.leadBonus) {
          totalBonus += effects.leadBonus;
        }
        if (situation.isTiebreak && effects.tiebreakBonus) {
          totalBonus += effects.tiebreakBonus;
        }
        if (situation.isMatchPoint && effects.matchPointBonus) {
          totalBonus += effects.matchPointBonus;
        }
        if (situation.opponentType === 'aggressive' && effects.vsAggressive) {
          totalBonus += effects.vsAggressive;
        }
        if (situation.opponentType === 'defensive' && effects.vsDefensive) {
          totalBonus += effects.vsDefensive;
        }
        if (situation.opponentHand === 'left' && effects.vsLeftHandedBonus) {
          totalBonus += effects.vsLeftHandedBonus;
        }
        if (situation.opponentHand === 'right' && effects.vsRightHandedBonus) {
          totalBonus += effects.vsRightHandedBonus;
        }
      }
    });

    return totalBonus;
  }

  // 特殊効果の計算（クリティカル率、エラー軽減率など）
  static calculateSpecialEffect(
    abilities: SpecialAbility[],
    effectType: keyof SpecialAbilityEffects
  ): number {
    return abilities
      .filter(ability => ability.isActive)
      .reduce((total, ability) => {
        const effect = ability.effects[effectType];
        return total + (effect || 0);
      }, 0);
  }

  // ID で特殊能力を取得
  static getAbilityById(id: string): SpecialAbility | undefined {
    return TENNIS_SPECIAL_ABILITIES.find(ability => ability.id === id);
  }

  // タイプ別特殊能力を取得
  static getAbilitiesByType(type: SpecialAbilityType): SpecialAbility[] {
    return TENNIS_SPECIAL_ABILITIES.filter(ability => ability.type === type);
  }

  // 色別特殊能力を取得
  static getAbilitiesByColor(color: SpecialAbilityColor): SpecialAbility[] {
    return TENNIS_SPECIAL_ABILITIES.filter(ability => ability.color === color);
  }
}