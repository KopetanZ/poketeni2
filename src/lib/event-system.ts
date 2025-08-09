// イベントシステム - 栄冠ナイン準拠のバランス調整可能なシステム

// イベント発生確率の設定（バランス調整用パラメータ）
export const EVENT_PROBABILITIES = {
  // 基本確率（%）
  good_event: 15,         // 良いイベント（青マス効果）
  bad_event: 10,          // 悪いイベント（赤マス効果）
  practice_boost: 20,     // 練習効率アップ（黄マス効果）
  graduate_visit: 5,      // 卒業生来訪（紫マス効果）
  random_event: 25,       // 完全ランダムイベント（白マス効果）
  
  // 季節による修正値
  seasonal_modifiers: {
    spring: { good_event: 1.2, graduate_visit: 1.5 },  // 春は良いイベントと卒業生来訪が起こりやすい
    summer: { practice_boost: 1.3, bad_event: 1.2 },   // 夏は練習効率アップと疲労イベントが多い
    autumn: { good_event: 1.1, random_event: 1.2 },    // 秋は文化祭等でイベントが多い
    winter: { bad_event: 1.3, practice_boost: 0.8 }    // 冬は体調不良が多く、練習効率は下がる
  },
  
  // 学校評判による修正
  reputation_modifiers: {
    low: { bad_event: 1.3, good_event: 0.7 },          // 評判が低いと悪いことが起こりやすい
    medium: { bad_event: 1.0, good_event: 1.0 },       // 普通
    high: { bad_event: 0.7, good_event: 1.3 }          // 評判が高いと良いことが起こりやすい
  }
};

// イベントデータ定義
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'good' | 'bad' | 'practice' | 'graduate' | 'random' | 'special';
  effects: {
    stats_change?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
    condition_change?: string;
    motivation_change?: number;
    funds_change?: number;
    reputation_change?: number;
    special_ability_chance?: number;
  };
  probability_weight: number;  // 相対的な発生確率
  season_restriction?: 'spring' | 'summer' | 'autumn' | 'winter';
  reputation_requirement?: { min?: number; max?: number };
}

// 良いイベントデータ（青マス効果）
export const GOOD_EVENTS: GameEvent[] = [
  {
    id: 'good_001',
    name: '他校との合同練習',
    description: '強豪校との合同練習でチーム全体が成長',
    type: 'good',
    effects: {
      stats_change: { serve_skill: 2, return_skill: 2, volley_skill: 1, stroke_skill: 2 },
      motivation_change: 10,
      reputation_change: 5
    },
    probability_weight: 30
  },
  {
    id: 'good_002',
    name: '新入部員の加入',
    description: '有望な新入部員が入部してくれた',
    type: 'good',
    effects: {
      motivation_change: 15,
      reputation_change: 8
    },
    probability_weight: 15,
    season_restriction: 'spring'
  },
  {
    id: 'good_003',
    name: 'スポンサー支援',
    description: '地元企業からスポンサー支援を受けた',
    type: 'good',
    effects: {
      funds_change: 5000,
      reputation_change: 10
    },
    probability_weight: 10,
    reputation_requirement: { min: 50 }
  },
  {
    id: 'good_004',
    name: 'メディア取材',
    description: '地方テレビの取材を受け、部の知名度が上がった',
    type: 'good',
    effects: {
      reputation_change: 15,
      motivation_change: 20
    },
    probability_weight: 8,
    reputation_requirement: { min: 80 }
  }
];

// 悪いイベントデータ（赤マス効果）
export const BAD_EVENTS: GameEvent[] = [
  {
    id: 'bad_001',
    name: '風邪が流行',
    description: 'チーム内で風邪が流行し、練習に影響が出た',
    type: 'bad',
    effects: {
      condition_change: 'poor',
      motivation_change: -10,
      stats_change: { stamina: -1 }
    },
    probability_weight: 25,
    season_restriction: 'winter'
  },
  {
    id: 'bad_002',
    name: '部員の怪我',
    description: '主要メンバーが怪我をしてしまった',
    type: 'bad',
    effects: {
      condition_change: 'injured',
      motivation_change: -15,
      stats_change: { mental: -2 }
    },
    probability_weight: 20
  },
  {
    id: 'bad_003',
    name: '猛暑による体調不良',
    description: '連日の猛暑でチーム全体の調子が悪い',
    type: 'bad',
    effects: {
      condition_change: 'tired',
      motivation_change: -8,
      stats_change: { stamina: -2 }
    },
    probability_weight: 30,
    season_restriction: 'summer'
  },
  {
    id: 'bad_004',
    name: '設備の故障',
    description: '練習設備が故障し、修理費がかさんだ',
    type: 'bad',
    effects: {
      funds_change: -3000,
      motivation_change: -5
    },
    probability_weight: 15
  }
];

// 練習効率アップイベント（黄マス効果）
export const PRACTICE_EVENTS: GameEvent[] = [
  {
    id: 'practice_001',
    name: '新しい練習法発見',
    description: '効果的な新しい練習方法を編み出した',
    type: 'practice',
    effects: {
      stats_change: { serve_skill: 3, return_skill: 2, volley_skill: 2, stroke_skill: 3 },
      motivation_change: 12
    },
    probability_weight: 40
  },
  {
    id: 'practice_002',
    name: '集中練習の成果',
    description: '集中的な練習により技術が向上した',
    type: 'practice',
    effects: {
      stats_change: { mental: 4, stamina: 2 },
      motivation_change: 8
    },
    probability_weight: 35
  },
  {
    id: 'practice_003',
    name: 'コーチの特別指導',
    description: '外部コーチから特別指導を受けた',
    type: 'practice',
    effects: {
      stats_change: { serve_skill: 4, stroke_skill: 4, mental: 3 },
      motivation_change: 15,
      special_ability_chance: 20
    },
    probability_weight: 20,
    reputation_requirement: { min: 30 }
  }
];

// 卒業生来訪イベント（紫マス効果）
export const GRADUATE_EVENTS: GameEvent[] = [
  {
    id: 'graduate_001',
    name: 'OB・OGによる指導',
    description: '卒業生が後輩のために指導に来てくれた',
    type: 'graduate',
    effects: {
      stats_change: { serve_skill: 3, return_skill: 3, volley_skill: 3, stroke_skill: 3, mental: 5 },
      motivation_change: 20,
      special_ability_chance: 15
    },
    probability_weight: 50
  },
  {
    id: 'graduate_002',
    name: 'プロ選手の来訪',
    description: 'プロになった卒業生が激励に来てくれた',
    type: 'graduate',
    effects: {
      stats_change: { mental: 10, stamina: 5 },
      motivation_change: 30,
      reputation_change: 20,
      special_ability_chance: 35
    },
    probability_weight: 10,
    reputation_requirement: { min: 100 }
  },
  {
    id: 'graduate_003',
    name: '卒業生からの差し入れ',
    description: '卒業生が栄養ドリンクを差し入れしてくれた',
    type: 'graduate',
    effects: {
      condition_change: 'excellent',
      motivation_change: 15,
      funds_change: 1000
    },
    probability_weight: 30
  }
];

// ランダムイベント（白マス効果）
export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'random_001',
    name: '地域の祭り参加',
    description: '地域の祭りに参加し、地元との繋がりが深まった',
    type: 'random',
    effects: {
      motivation_change: 10,
      reputation_change: 8,
      funds_change: 2000
    },
    probability_weight: 25
  },
  {
    id: 'random_002',
    name: '珍しい来訪者',
    description: '有名人がたまたま学校を見学に来た',
    type: 'random',
    effects: {
      motivation_change: 25,
      reputation_change: 15
    },
    probability_weight: 5
  },
  {
    id: 'random_003',
    name: '部活動予算追加',
    description: '学校から部活動予算の追加支給があった',
    type: 'random',
    effects: {
      funds_change: 8000
    },
    probability_weight: 15
  },
  {
    id: 'random_004',
    name: '古いアルバム発見',
    description: '部室から昔のアルバムが見つかり、伝統を感じた',
    type: 'random',
    effects: {
      motivation_change: 8,
      mental: 3
    },
    probability_weight: 20
  }
];

// イベント発生判定システム
export class EventSystem {
  // 季節判定
  static getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
  
  // 評判レベル判定
  static getReputationLevel(reputation: number): 'low' | 'medium' | 'high' {
    if (reputation < 30) return 'low';
    if (reputation < 80) return 'medium';
    return 'high';
  }
  
  // イベント発生確率計算
  static calculateEventProbability(
    baseType: keyof typeof EVENT_PROBABILITIES,
    month: number,
    reputation: number
  ): number {
    let probability = EVENT_PROBABILITIES[baseType] || 0;
    
    // 季節修正
    const season = this.getSeason(month);
    const seasonalMod = EVENT_PROBABILITIES.seasonal_modifiers[season];
    if (seasonalMod && seasonalMod[baseType]) {
      probability *= seasonalMod[baseType];
    }
    
    // 評判修正
    const reputationLevel = this.getReputationLevel(reputation);
    const reputationMod = EVENT_PROBABILITIES.reputation_modifiers[reputationLevel];
    if (reputationMod && reputationMod[baseType]) {
      probability *= reputationMod[baseType];
    }
    
    return Math.min(probability, 100); // 最大100%
  }
  
  // イベント選択
  static selectEvent(
    eventType: 'good' | 'bad' | 'practice' | 'graduate' | 'random',
    month: number,
    reputation: number
  ): GameEvent | null {
    let events: GameEvent[] = [];
    
    switch (eventType) {
      case 'good': events = GOOD_EVENTS; break;
      case 'bad': events = BAD_EVENTS; break;
      case 'practice': events = PRACTICE_EVENTS; break;
      case 'graduate': events = GRADUATE_EVENTS; break;
      case 'random': events = RANDOM_EVENTS; break;
    }
    
    // 条件に合うイベントをフィルタリング
    const season = this.getSeason(month);
    const validEvents = events.filter(event => {
      // 季節制限チェック
      if (event.season_restriction && event.season_restriction !== season) {
        return false;
      }
      
      // 評判要件チェック
      if (event.reputation_requirement) {
        if (event.reputation_requirement.min && reputation < event.reputation_requirement.min) {
          return false;
        }
        if (event.reputation_requirement.max && reputation > event.reputation_requirement.max) {
          return false;
        }
      }
      
      return true;
    });
    
    if (validEvents.length === 0) return null;
    
    // 重み付きランダム選択
    const totalWeight = validEvents.reduce((sum, event) => sum + event.probability_weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const event of validEvents) {
      currentWeight += event.probability_weight;
      if (random <= currentWeight) {
        return event;
      }
    }
    
    return validEvents[0]; // フォールバック
  }
}

// バランス調整用の設定エクスポート
export const BALANCE_CONFIG = {
  // 全体的なイベント発生率調整（デバッグ・バランス調整用）
  global_event_rate_multiplier: 1.0,
  
  // 特殊イベントの発生率制限（栄冠ナイン準拠）
  max_special_events_per_month: 2,
  
  // 効果の強さ調整
  effect_magnitude_multiplier: 1.0,
  
  // 季節ごとのイベント発生率上限
  seasonal_event_limits: {
    spring: 0.4,   // 40%の確率で何かしらのイベント
    summer: 0.6,   // 60%（夏は大会シーズンで忙しい）
    autumn: 0.5,   // 50%
    winter: 0.3    // 30%（冬は比較的静か）
  }
};