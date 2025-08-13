// 種族値→テニススキル変換システム
// 作成日: 2025-01-13
// 目的: ポケモンの6種族値を6テニススキルに自動変換

export interface PokemonBaseStats {
  id: number;
  hp: number;        // HP (45-255)
  attack: number;    // 攻撃 (5-190)
  defense: number;   // 防御 (5-250)
  sp_attack: number; // 特攻 (10-194)
  sp_defense: number; // 特防 (20-250)
  speed: number;     // 素早さ (5-200)
}

export interface TennisSkills {
  serve_skill: number;    // サーブスキル (10-90)
  return_skill: number;   // リターンスキル (10-90)
  volley_skill: number;   // ボレースキル (10-90)
  stroke_skill: number;   // ストロークスキル (10-90)
  mental: number;         // メンタル (10-90)
  stamina: number;        // スタミナ (10-90)
}

export interface TypeBonus {
  type: string;
  skills: Partial<TennisSkills>;
  description: string;
}

// タイプ別補正システム
export const TYPE_BONUSES: TypeBonus[] = [
  {
    type: 'electric',
    skills: { serve_skill: 8, mental: 5 },
    description: '電気タイプ: パワーサーブと反応速度が向上'
  },
  {
    type: 'fighting',
    skills: { serve_skill: 10, stamina: 5 },
    description: '格闘タイプ: パワーと体力が向上'
  },
  {
    type: 'psychic',
    skills: { mental: 12, volley_skill: 5 },
    description: 'エスパータイプ: 判断力と技術が向上'
  },
  {
    type: 'fire',
    skills: { serve_skill: 6, mental: 8 },
    description: '炎タイプ: 攻撃性と気迫が向上'
  },
  {
    type: 'water',
    skills: { return_skill: 8, stamina: 6 },
    description: '水タイプ: 安定性と持久力が向上'
  },
  {
    type: 'grass',
    skills: { stroke_skill: 8, stamina: 4 },
    description: '草タイプ: 安定したストロークと持久力'
  },
  {
    type: 'flying',
    skills: { volley_skill: 10, mental: 3 },
    description: '飛行タイプ: ネットプレー技術が向上'
  },
  {
    type: 'ghost',
    skills: { mental: 15, volley_skill: -5 },
    description: 'ゴーストタイプ: 特殊な戦術理解、ネットプレー苦手'
  },
  {
    type: 'steel',
    skills: { return_skill: 12, stamina: 6 },
    description: '鋼タイプ: 鉄壁の守備力と持久力'
  },
  {
    type: 'dragon',
    skills: { serve_skill: 6, stroke_skill: 6 },
    description: 'ドラゴンタイプ: バランス型エース級'
  },
  {
    type: 'ice',
    skills: { volley_skill: 8, mental: 4 },
    description: '氷タイプ: 冷静な判断と技術'
  },
  {
    type: 'dark',
    skills: { mental: 8, serve_skill: 4 },
    description: '悪タイプ: 戦術理解とパワー'
  },
  {
    type: 'fairy',
    skills: { mental: 6, volley_skill: 6 },
    description: 'フェアリータイプ: 技術と判断力'
  },
  {
    type: 'normal',
    skills: { stroke_skill: 4, stamina: 4 },
    description: 'ノーマルタイプ: バランス型'
  },
  {
    type: 'poison',
    skills: { mental: 5, return_skill: 4 },
    description: '毒タイプ: 戦術理解と守備'
  },
  {
    type: 'ground',
    skills: { stamina: 8, return_skill: 6 },
    description: '地面タイプ: 持久力と守備'
  },
  {
    type: 'rock',
    skills: { return_skill: 8, stamina: 6 },
    description: '岩タイプ: 守備と持久力'
  },
  {
    type: 'bug',
    skills: { mental: 6, volley_skill: 3 },
    description: '虫タイプ: 反応速度と判断'
  }
];

// 値のスケーリング関数
export function scaleValue(
  value: number, 
  minInput: number, 
  maxInput: number, 
  minOutput: number, 
  maxOutput: number
): number {
  const scaled = ((value - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) + minOutput;
  return Math.round(Math.max(minOutput, Math.min(maxOutput, scaled)));
}

// 基本変換ロジック
export function convertStatsToTennisSkills(stats: PokemonBaseStats, types: string[]): TennisSkills {
  // 基本変換（種族値を10-90にスケール）
  const baseSkills: TennisSkills = {
    serve_skill: scaleValue(stats.attack, 5, 190, 10, 90),      // 攻撃力 → サーブ力
    return_skill: scaleValue(stats.defense, 5, 250, 10, 90),    // 防御力 → リターン力  
    volley_skill: scaleValue(stats.sp_attack, 10, 194, 10, 90), // 特攻 → ボレー技術
    stroke_skill: scaleValue(stats.sp_defense, 20, 250, 10, 90), // 特防 → ストローク安定性
    mental: scaleValue(stats.speed, 5, 200, 10, 90),            // 素早さ → 反応・判断力
    stamina: scaleValue(stats.hp, 45, 255, 10, 90)             // HP → 持久力
  };

  // タイプ別補正適用
  return applyTypeBonus(baseSkills, types);
}

// タイプ別補正適用
export function applyTypeBonus(baseSkills: TennisSkills, types: string[]): TennisSkills {
  const adjustedSkills = { ...baseSkills };
  
  types.forEach(type => {
    const bonus = TYPE_BONUSES.find(b => b.type === type);
    if (bonus && bonus.skills) {
      Object.entries(bonus.skills).forEach(([skill, bonusValue]) => {
        const skillKey = skill as keyof TennisSkills;
        if (skillKey in adjustedSkills) {
          adjustedSkills[skillKey] = Math.max(10, Math.min(90, adjustedSkills[skillKey] + bonusValue));
        }
      });
    }
  });
  
  return adjustedSkills;
}

// 個体値適用
export function applyIndividualValues(
  baseSkills: TennisSkills, 
  individualValues: Record<string, number>
): TennisSkills {
  const adjustedSkills = { ...baseSkills };
  
  Object.entries(individualValues).forEach(([skill, iv]) => {
    const skillKey = skill.replace('_iv', '') as keyof TennisSkills;
    if (skillKey in adjustedSkills) {
      adjustedSkills[skillKey] = Math.max(10, Math.min(90, adjustedSkills[skillKey] + iv));
    }
  });
  
  return adjustedSkills;
}

// 成長効率適用
export function applyGrowthEfficiency(
  baseSkills: TennisSkills, 
  growthEfficiency: Record<string, number>
): TennisSkills {
  const adjustedSkills = { ...baseSkills };
  
  Object.entries(growthEfficiency).forEach(([skill, efficiency]) => {
    const skillKey = skill.replace('_efficiency', '') as keyof TennisSkills;
    if (skillKey in adjustedSkills) {
      // 成長効率は将来の成長速度に影響（現在のスキル値には直接影響しない）
      // ここでは計算のみ行い、実際の適用は別途実装
    }
  });
  
  return adjustedSkills;
}

// スキル総合評価
export function calculateTotalSkillRating(skills: TennisSkills): number {
  const values = Object.values(skills);
  const total = values.reduce((sum, skill) => sum + skill, 0);
  return Math.round(total / values.length);
}

// スキルバランス評価
export function evaluateSkillBalance(skills: TennisSkills): {
  balance: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  strengths: string[];
  weaknesses: string[];
} {
  const values = Object.values(skills);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  const average = values.reduce((sum, skill) => sum + skill, 0) / values.length;
  
  let balance: 'excellent' | 'good' | 'fair' | 'poor';
  let description: string;
  
  if (range <= 15 && average >= 70) {
    balance = 'excellent';
    description = '全体的に高水準でバランスの取れたスキル';
  } else if (range <= 20 && average >= 60) {
    balance = 'good';
    description = 'バランスが良く、安定したスキル';
  } else if (range <= 25 && average >= 50) {
    balance = 'fair';
    description = 'やや偏りがあるが、基本的なスキル';
  } else {
    balance = 'poor';
    description = 'スキルに大きな偏りがあり、改善が必要';
  }
  
  // 強み・弱みの分析
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  Object.entries(skills).forEach(([skill, value]) => {
    if (value >= 75) {
      strengths.push(`${skill}: ${value}`);
    } else if (value <= 30) {
      weaknesses.push(`${skill}: ${value}`);
    }
  });
  
  return { balance, description, strengths, weaknesses };
}

// ポケモンタイプ相性による戦術アドバイス
export function generateTacticalAdvice(skills: TennisSkills, types: string[]): string[] {
  const advice: string[] = [];
  
  // スキルベースのアドバイス
  if (skills.serve_skill >= 70) {
    advice.push('サーブを武器とした攻撃的な戦術が有効です');
  }
  
  if (skills.return_skill >= 70) {
    advice.push('リターンでの安定した守備が期待できます');
  }
  
  if (skills.volley_skill >= 70) {
    advice.push('ネットプレーでの積極的な攻撃が可能です');
  }
  
  if (skills.stroke_skill >= 70) {
    advice.push('ストロークでの安定したラリーが期待できます');
  }
  
  if (skills.mental >= 70) {
    advice.push('試合中の冷静な判断と戦術変更が可能です');
  }
  
  if (skills.stamina >= 70) {
    advice.push('長時間の試合でも安定したパフォーマンスが期待できます');
  }
  
  // タイプベースのアドバイス
  types.forEach(type => {
    const bonus = TYPE_BONUSES.find(b => b.type === type);
    if (bonus) {
      advice.push(bonus.description);
    }
  });
  
  return advice;
}

// スキル表示用フォーマット
export function formatSkillDisplay(skills: TennisSkills): Record<string, { value: number; label: string; color: string }> {
  return {
    serve_skill: {
      value: skills.serve_skill,
      label: 'サーブ',
      color: skills.serve_skill >= 70 ? 'text-green-600' : skills.serve_skill >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    return_skill: {
      value: skills.return_skill,
      label: 'リターン',
      color: skills.return_skill >= 70 ? 'text-green-600' : skills.return_skill >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    volley_skill: {
      value: skills.volley_skill,
      label: 'ボレー',
      color: skills.volley_skill >= 70 ? 'text-green-600' : skills.volley_skill >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    stroke_skill: {
      value: skills.stroke_skill,
      label: 'ストローク',
      color: skills.stroke_skill >= 70 ? 'text-green-600' : skills.stroke_skill >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    mental: {
      value: skills.mental,
      label: 'メンタル',
      color: skills.mental >= 70 ? 'text-green-600' : skills.mental >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    stamina: {
      value: skills.stamina,
      label: 'スタミナ',
      color: skills.stamina >= 70 ? 'text-green-600' : skills.stamina >= 50 ? 'text-yellow-600' : 'text-red-600'
    }
  };
}
