// アイテムデータベース - ポケモンアイテムベース + テニス装備

import { Equipment, ConsumableItem, FacilityItem, SpecialItem } from '@/types/items';

// ラケット装備（ポケモンの道具をベースに）
export const RACKET_EQUIPMENT: Equipment[] = [
  {
    id: 'racket_001',
    name: 'ノーマルラケット',
    description: '標準的なテニスラケット。バランスが取れている。',
    rarity: 'common',
    price: 1000,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🎾',
    effects: {
      serve_skill: 2,
      return_skill: 2,
      volley_skill: 2,
      stroke_skill: 2
    },
    durability: {
      max: 100,
      current: 100,
      degradePerMatch: 3
    }
  },
  {
    id: 'racket_002',
    name: 'パワーラケット',
    description: '攻撃力を高めるラケット。サーブとストロークが向上する。',
    rarity: 'uncommon',
    price: 3000,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🏆',
    effects: {
      serve_skill: 5,
      stroke_skill: 4,
      mental: 1
    },
    durability: {
      max: 80,
      current: 80,
      degradePerMatch: 4
    }
  },
  {
    id: 'racket_003',
    name: 'テクニカルラケット',
    description: '技巧派向けのラケット。ボレーと精神力が大幅に向上。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '⚡',
    effects: {
      volley_skill: 7,
      mental: 5,
      return_skill: 3
    },
    durability: {
      max: 120,
      current: 120,
      degradePerMatch: 2
    }
  }
];

// シューズ装備
export const SHOES_EQUIPMENT: Equipment[] = [
  {
    id: 'shoes_001',
    name: 'ランニングシューズ',
    description: 'スタミナと機動力を向上させるシューズ。',
    rarity: 'common',
    price: 2000,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '👟',
    effects: {
      stamina: 4,
      return_skill: 2,
      volley_skill: 2
    },
    durability: {
      max: 150,
      current: 150,
      degradePerMatch: 2
    }
  },
  {
    id: 'shoes_002',
    name: 'プロテニスシューズ',
    description: 'プロ仕様のテニスシューズ。全体的な能力が向上する。',
    rarity: 'rare',
    price: 12000,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '🌟',
    effects: {
      serve_skill: 3,
      return_skill: 4,
      volley_skill: 4,
      stroke_skill: 3,
      stamina: 6
    },
    durability: {
      max: 200,
      current: 200,
      degradePerMatch: 1
    }
  }
];

// ポケモンアイテム（原作ベース）
export const POKEMON_ITEMS: Equipment[] = [
  {
    id: 'pokemon_item_001',
    name: 'きあいのハチマキ',
    description: 'ポケモン原作の道具。精神力と集中力を高める。',
    rarity: 'uncommon',
    price: 5000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🟡',
    effects: {
      mental: 8,
      experience_boost: 10
    }
  },
  {
    id: 'pokemon_item_002',
    name: 'たつじんのおび',
    description: '効果抜群の技を使った時の威力が上がる。全スキルにボーナス。',
    rarity: 'epic',
    price: 15000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🟤',
    effects: {
      serve_skill: 5,
      return_skill: 5,
      volley_skill: 5,
      stroke_skill: 5,
      experience_boost: 20
    }
  },
  {
    id: 'pokemon_item_003',
    name: 'こだわりメガネ',
    description: '特攻が上がるが、同じ技しか出せない。ストローク特化。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🤓',
    effects: {
      stroke_skill: 12,
      mental: -2 // デメリット
    },
    pokemonCompatible: [25, 133, 448] // ピカチュウ、イーブイ、ルカリオなど
  }
];

// 回復・強化アイテム（消耗品）
export const CONSUMABLE_ITEMS: ConsumableItem[] = [
  {
    id: 'consumable_001',
    name: 'キズぐすり',
    description: 'ポケモンのHPを20回復する。コンディションを改善。',
    rarity: 'common',
    price: 200,
    category: 'consumable',
    consumableType: 'recovery',
    icon: '💊',
    effects: {
      condition_change: 'good'
    },
    stackable: true,
    maxStack: 20
  },
  {
    id: 'consumable_002',
    name: 'すごいキズぐすり',
    description: 'ポケモンのHPを50回復する。コンディションを大幅改善。',
    rarity: 'uncommon',
    price: 700,
    category: 'consumable',
    consumableType: 'recovery',
    icon: '💉',
    effects: {
      condition_change: 'excellent'
    },
    stackable: true,
    maxStack: 10
  },
  {
    id: 'consumable_003',
    name: 'ポイントアップ',
    description: 'ポケモンの能力を永続的に少し上げる。',
    rarity: 'rare',
    price: 3000,
    category: 'consumable',
    consumableType: 'training',
    icon: '📈',
    effects: {
      instant_stats: {
        serve_skill: 1,
        return_skill: 1,
        volley_skill: 1,
        stroke_skill: 1,
        mental: 1,
        stamina: 1
      }
    },
    stackable: true,
    maxStack: 5
  },
  {
    id: 'consumable_004',
    name: 'げんきのかけら',
    description: 'やる気を回復し、モチベーションを上げる。',
    rarity: 'common',
    price: 500,
    category: 'consumable',
    consumableType: 'motivation',
    icon: '✨',
    effects: {
      motivation_change: 20
    },
    stackable: true,
    maxStack: 15
  }
];

// 施設・器材アイテム（栄冠ナイン式）
export const FACILITY_ITEMS: FacilityItem[] = [
  {
    id: 'facility_001',
    name: 'ボール投出マシン',
    description: 'リターン練習用のマシン。リターンスキルの練習効率が向上。',
    rarity: 'uncommon',
    price: 5000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🤖',
    effects: {
      training_efficiency: 15,
      special_training_unlock: ['return_intensive']
    },
    durability: {
      max: 100,
      current: 100,
      degradePerDay: 4,
      repairCost: 1000
    },
    level: 1,
    maxLevel: 5,
    upgradeCost: [2000, 4000, 8000, 16000]
  },
  {
    id: 'facility_002',
    name: 'プロ仕様ネット',
    description: 'ボレー練習に最適な高級ネット。ボレー技術の向上。',
    rarity: 'rare',
    price: 12000,
    category: 'facility',
    facilityType: 'court',
    icon: '🥅',
    effects: {
      training_efficiency: 25,
      special_training_unlock: ['volley_master']
    },
    durability: {
      max: 200,
      current: 200,
      degradePerDay: 2,
      repairCost: 2000
    },
    level: 1,
    maxLevel: 10,
    upgradeCost: [3000, 6000, 12000, 24000, 48000, 96000, 192000, 384000, 768000]
  },
  {
    id: 'facility_003',
    name: 'シャワー室',
    description: '栄冠ナインでも人気の施設。疲労回復とモチベーション維持。',
    rarity: 'epic',
    price: 25000,
    category: 'facility',
    facilityType: 'support_facility',
    icon: '🚿',
    effects: {
      injury_prevention: 30,
      motivation_maintenance: 20
    },
    durability: {
      max: 365,
      current: 365,
      degradePerDay: 1,
      repairCost: 5000
    },
    level: 1,
    maxLevel: 3,
    upgradeCost: [15000, 30000]
  },
  {
    id: 'facility_004',
    name: 'トレーニングジム',
    description: '筋力トレーニング施設。スタミナと全体的な能力が向上。',
    rarity: 'legendary',
    price: 50000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🏋️',
    effects: {
      training_efficiency: 50,
      injury_prevention: 20,
      special_training_unlock: ['strength_training', 'endurance_training']
    },
    durability: {
      max: 500,
      current: 500,
      degradePerDay: 3,
      repairCost: 10000
    },
    level: 1,
    maxLevel: 8,
    upgradeCost: [20000, 40000, 80000, 160000, 320000, 640000, 1280000]
  }
];

// 特殊アイテム
export const SPECIAL_ITEMS: SpecialItem[] = [
  {
    id: 'special_001',
    name: 'ショップ呼び出し券',
    description: '栄冠ナインでおなじみ。いつでもショップを呼び出せる。',
    rarity: 'rare',
    price: 10000,
    category: 'special',
    specialType: 'system_unlock',
    icon: '🎫',
    effects: {
      unlock_feature: 'instant_shop_access'
    },
    oneTimeUse: true
  },
  {
    id: 'special_002',
    name: 'カード効果増強剤',
    description: '次に使う練習カードの効果を2倍にする。',
    rarity: 'epic',
    price: 8000,
    category: 'special',
    specialType: 'card_modifier',
    icon: '💫',
    effects: {
      card_effects_boost: 100
    },
    oneTimeUse: true
  },
  {
    id: 'special_003',
    name: 'イベント発生装置',
    description: 'ランダムイベントの発生確率を1週間高める。',
    rarity: 'uncommon',
    price: 5000,
    category: 'special',
    specialType: 'event_trigger',
    icon: '🎪',
    effects: {
      random_event_chance: 50
    },
    oneTimeUse: true
  }
];

// アイテムの全データベース
export const ITEMS_DATABASE = {
  equipment: [...RACKET_EQUIPMENT, ...SHOES_EQUIPMENT, ...POKEMON_ITEMS],
  consumables: CONSUMABLE_ITEMS,
  facilities: FACILITY_ITEMS,
  specials: SPECIAL_ITEMS
};

// レアリティごとの色設定
export const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  uncommon: 'bg-green-100 text-green-800 border-green-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

// アイテム効果のテキスト変換
export const EFFECT_TRANSLATIONS = {
  serve_skill: 'サーブ',
  return_skill: 'リターン',
  volley_skill: 'ボレー',
  stroke_skill: 'ストローク',
  mental: 'メンタル',
  stamina: 'スタミナ',
  experience_boost: '経験値ボーナス',
  training_efficiency: '練習効率',
  injury_prevention: '怪我予防',
  motivation_maintenance: 'やる気維持'
};