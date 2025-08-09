// 拡張アイテムデータベース - 本家ポケモン + 栄冠ナイン + テニプリ要素を統合

import { Equipment, ConsumableItem, FacilityItem, SpecialItem } from '@/types/items';

// ===== ラケット装備（テニプリの必殺技要素を含む） =====
export const RACKET_EQUIPMENT_EXPANDED: Equipment[] = [
  {
    id: 'racket_001',
    name: 'ノーマルラケット',
    description: '標準的なテニスラケット。初心者に優しいバランス型。',
    rarity: 'common',
    price: 800,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🎾',
    effects: {
      serve_skill: 1,
      return_skill: 1,
      volley_skill: 1,
      stroke_skill: 1
    },
    durability: { max: 80, current: 80, degradePerMatch: 4 }
  },
  {
    id: 'racket_002',
    name: 'プロスペックラケット',
    description: 'プロレベルの性能を持つバランス型ラケット。',
    rarity: 'uncommon',
    price: 2500,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🏆',
    effects: {
      serve_skill: 3,
      return_skill: 3,
      volley_skill: 2,
      stroke_skill: 3
    },
    durability: { max: 100, current: 100, degradePerMatch: 3 }
  },
  {
    id: 'racket_003',
    name: 'フレイムラケット',
    description: 'テニプリ風の特殊ラケット。火炎のようなサーブを放つ。',
    rarity: 'rare',
    price: 7500,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🔥',
    effects: {
      serve_skill: 8,
      stroke_skill: 5,
      mental: 2
    },
    specialAbility: 'flame_serve',
    durability: { max: 120, current: 120, degradePerMatch: 2 }
  },
  {
    id: 'racket_004',
    name: 'スピンマスター',
    description: '回転系の技術に特化したテクニカルラケット。',
    rarity: 'rare',
    price: 6800,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '🌪️',
    effects: {
      volley_skill: 7,
      stroke_skill: 6,
      return_skill: 4
    },
    specialAbility: 'tornado_spin',
    durability: { max: 110, current: 110, degradePerMatch: 2 }
  },
  {
    id: 'racket_005',
    name: '雷神ラケット',
    description: '電光石火のボレーを可能にする伝説のラケット。',
    rarity: 'epic',
    price: 15000,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '⚡',
    effects: {
      volley_skill: 12,
      mental: 8,
      stamina: 5
    },
    specialAbility: 'lightning_volley',
    durability: { max: 150, current: 150, degradePerMatch: 1 }
  },
  {
    id: 'racket_006',
    name: 'エターナルブレード',
    description: '全ての技術を極限まで高める究極のラケット。',
    rarity: 'legendary',
    price: 50000,
    category: 'equipment',
    equipmentType: 'racket',
    icon: '👑',
    effects: {
      serve_skill: 10,
      return_skill: 10,
      volley_skill: 10,
      stroke_skill: 10,
      mental: 15,
      stamina: 10
    },
    specialAbility: 'perfect_tennis',
    durability: { max: 300, current: 300, degradePerMatch: 0 }
  }
];

// ===== シューズ装備（スピードと機動力重視） =====
export const SHOES_EQUIPMENT_EXPANDED: Equipment[] = [
  {
    id: 'shoes_001',
    name: 'エントリーシューズ',
    description: '初心者向けの基本的なテニスシューズ。',
    rarity: 'common',
    price: 1200,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '👟',
    effects: {
      stamina: 2,
      return_skill: 1
    },
    durability: { max: 100, current: 100, degradePerMatch: 3 }
  },
  {
    id: 'shoes_002',
    name: 'スピードシューズ',
    description: 'コートでの機動力を向上させる軽量シューズ。',
    rarity: 'uncommon',
    price: 3500,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '💨',
    effects: {
      stamina: 5,
      return_skill: 4,
      volley_skill: 3
    },
    durability: { max: 120, current: 120, degradePerMatch: 2 }
  },
  {
    id: 'shoes_003',
    name: 'エアクッションプロ',
    description: '衝撃吸収に優れた高性能シューズ。怪我防止効果も。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '🏃',
    effects: {
      stamina: 8,
      return_skill: 5,
      volley_skill: 5,
      stroke_skill: 3
    },
    specialAbility: 'injury_resistance',
    durability: { max: 180, current: 180, degradePerMatch: 1 }
  },
  {
    id: 'shoes_004',
    name: 'ウインドウォーカー',
    description: '風のように軽やかな動きを可能にする特殊シューズ。',
    rarity: 'epic',
    price: 18000,
    category: 'equipment',
    equipmentType: 'shoes',
    icon: '🌬️',
    effects: {
      stamina: 12,
      return_skill: 8,
      volley_skill: 8,
      mental: 5
    },
    specialAbility: 'wind_step',
    durability: { max: 200, current: 200, degradePerMatch: 1 }
  }
];

// ===== ポケモンアイテム（本家準拠で大幅拡充） =====
export const POKEMON_ITEMS_EXPANDED: Equipment[] = [
  // 攻撃系アイテム
  {
    id: 'pokemon_001',
    name: 'こだわりハチマキ',
    description: '攻撃が上がるが、同じ技しか出せない。サーブ特化。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🔴',
    effects: {
      serve_skill: 15,
      mental: -3
    }
  },
  {
    id: 'pokemon_002',
    name: 'こだわりメガネ',
    description: '特攻が上がるが、同じ技しか出せない。ストローク特化。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🤓',
    effects: {
      stroke_skill: 15,
      mental: -3
    }
  },
  {
    id: 'pokemon_003',
    name: 'こだわりスカーフ',
    description: '素早さが上がるが、同じ技しか出せない。スタミナ特化。',
    rarity: 'rare',
    price: 8000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🧣',
    effects: {
      stamina: 15,
      mental: -3
    }
  },
  {
    id: 'pokemon_004',
    name: 'いのちのたま',
    description: '技の威力が上がるが、反動で体力を消耗する。',
    rarity: 'epic',
    price: 12000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🔮',
    effects: {
      serve_skill: 8,
      stroke_skill: 8,
      volley_skill: 8,
      stamina: -5
    }
  },
  {
    id: 'pokemon_005',
    name: 'きあいのタスキ',
    description: 'HPが満タンの時、致命的な攻撃を耐える。精神力向上。',
    rarity: 'uncommon',
    price: 5000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '💪',
    effects: {
      mental: 12,
      stamina: 3
    }
  },
  {
    id: 'pokemon_006',
    name: 'たつじんのおび',
    description: '効果抜群の技を使った時の威力が上がる。',
    rarity: 'epic',
    price: 15000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🟤',
    effects: {
      serve_skill: 6,
      return_skill: 6,
      volley_skill: 6,
      stroke_skill: 6
    }
  },
  // 防御・サポート系
  {
    id: 'pokemon_007',
    name: 'たべのこし',
    description: '毎ターンHPが少しずつ回復する。スタミナ継続回復。',
    rarity: 'uncommon',
    price: 4000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🍎',
    effects: {
      stamina: 8,
      experience_boost: 10
    }
  },
  {
    id: 'pokemon_008',
    name: 'きあいのハチマキ',
    description: 'ひるまない。集中力と精神力を大幅に向上させる。',
    rarity: 'uncommon',
    price: 6000,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🟡',
    effects: {
      mental: 10,
      experience_boost: 15
    }
  },
  {
    id: 'pokemon_009',
    name: 'ひかりのねんど',
    description: 'リフレクター・ひかりのかべの効果が延長される。防御向上。',
    rarity: 'uncommon',
    price: 3500,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🟨',
    effects: {
      return_skill: 8,
      mental: 5
    }
  },
  {
    id: 'pokemon_010',
    name: 'あつりょくブーツ',
    description: '場の状態の影響を受けない。コート適応力向上。',
    rarity: 'rare',
    price: 7500,
    category: 'equipment',
    equipmentType: 'pokemon_item',
    icon: '🥾',
    effects: {
      serve_skill: 4,
      return_skill: 4,
      volley_skill: 4,
      stroke_skill: 4,
      stamina: 6
    }
  }
];

// ===== 消耗品（栄冠ナイン式＋ポケモン回復アイテム） =====
export const CONSUMABLE_ITEMS_EXPANDED: ConsumableItem[] = [
  // 基本回復系
  {
    id: 'consumable_001',
    name: 'キズぐすり',
    description: 'HPを20回復。軽い怪我や疲労を回復する。',
    rarity: 'common',
    price: 200,
    category: 'consumable',
    consumableType: 'recovery',
    icon: '💊',
    effects: { condition_change: 'slight_improvement' },
    stackable: true,
    maxStack: 50
  },
  {
    id: 'consumable_002',
    name: 'すごいキズぐすり',
    description: 'HPを50回復。中程度の怪我や疲労を回復する。',
    rarity: 'uncommon',
    price: 700,
    category: 'consumable',
    consumableType: 'recovery',
    icon: '💉',
    effects: { condition_change: 'good' },
    stackable: true,
    maxStack: 30
  },
  {
    id: 'consumable_003',
    name: 'まんたんのくすり',
    description: 'HPを全回復。重度の怪我も完全に治癒する。',
    rarity: 'rare',
    price: 2500,
    category: 'consumable',
    consumableType: 'recovery',
    icon: '🏥',
    effects: { condition_change: 'excellent' },
    stackable: true,
    maxStack: 10
  },
  // ステータス向上系（栄冠ナイン式）
  {
    id: 'consumable_004',
    name: 'プロテイン',
    description: '攻撃の基礎ポイントを上げる。サーブ力が永続的に向上。',
    rarity: 'uncommon',
    price: 9800,
    category: 'consumable',
    consumableType: 'training',
    icon: '🥤',
    effects: {
      permanent_stats: { serve_skill: 1 }
    },
    stackable: true,
    maxStack: 3,
    usageLimit: { per_pokemon: 10 }
  },
  {
    id: 'consumable_005',
    name: 'ブロムヘキシン',
    description: '防御の基礎ポイントを上げる。リターン技術が向上。',
    rarity: 'uncommon',
    price: 9800,
    category: 'consumable',
    consumableType: 'training',
    icon: '🧪',
    effects: {
      permanent_stats: { return_skill: 1 }
    },
    stackable: true,
    maxStack: 3,
    usageLimit: { per_pokemon: 10 }
  },
  {
    id: 'consumable_006',
    name: 'リゾチウム',
    description: '特攻の基礎ポイントを上げる。ストローク技術が向上。',
    rarity: 'uncommon',
    price: 9800,
    category: 'consumable',
    consumableType: 'training',
    icon: '⚗️',
    effects: {
      permanent_stats: { stroke_skill: 1 }
    },
    stackable: true,
    maxStack: 3,
    usageLimit: { per_pokemon: 10 }
  },
  {
    id: 'consumable_007',
    name: 'キトサン',
    description: '特防の基礎ポイントを上げる。メンタル強化。',
    rarity: 'uncommon',
    price: 9800,
    category: 'consumable',
    consumableType: 'training',
    icon: '🍄',
    effects: {
      permanent_stats: { mental: 1 }
    },
    stackable: true,
    maxStack: 3,
    usageLimit: { per_pokemon: 10 }
  },
  {
    id: 'consumable_008',
    name: 'インドメタシン',
    description: '素早さの基礎ポイントを上げる。スタミナとフットワークが向上。',
    rarity: 'uncommon',
    price: 9800,
    category: 'consumable',
    consumableType: 'training',
    icon: '💊',
    effects: {
      permanent_stats: { stamina: 1 }
    },
    stackable: true,
    maxStack: 3,
    usageLimit: { per_pokemon: 10 }
  },
  // やる気・状態異常系
  {
    id: 'consumable_009',
    name: 'げんきのかけら',
    description: 'ひんしから回復。やる気も少し回復する。',
    rarity: 'common',
    price: 1500,
    category: 'consumable',
    consumableType: 'motivation',
    icon: '✨',
    effects: {
      motivation_change: 15,
      condition_change: 'good'
    },
    stackable: true,
    maxStack: 20
  },
  {
    id: 'consumable_010',
    name: 'げんきのかたまり',
    description: 'ひんしから回復し、HPも全回復。やる気も大幅回復。',
    rarity: 'uncommon',
    price: 4000,
    category: 'consumable',
    consumableType: 'motivation',
    icon: '⭐',
    effects: {
      motivation_change: 35,
      condition_change: 'excellent'
    },
    stackable: true,
    maxStack: 10
  },
  // 特殊効果系
  {
    id: 'consumable_011',
    name: 'ポイントマックス',
    description: '技のPPを最大まで回復。練習効率が一時的に大幅向上。',
    rarity: 'rare',
    price: 8000,
    category: 'consumable',
    consumableType: 'training',
    icon: '🎯',
    effects: {
      training_boost: 100,
      duration: 7
    },
    stackable: true,
    maxStack: 5
  }
];

// ===== 施設アイテム（栄冠ナイン準拠で大幅拡充） =====
export const FACILITY_ITEMS_EXPANDED: FacilityItem[] = [
  // 基本練習施設
  {
    id: 'facility_001',
    name: 'サーブマシン',
    description: 'サーブ練習専用マシン。連続でサーブの練習ができる。',
    rarity: 'common',
    price: 8000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🎾',
    effects: {
      training_efficiency: 10,
      serve_training_boost: 25
    },
    durability: { max: 100, current: 100, degradePerDay: 5, repairCost: 1500 },
    level: 1,
    maxLevel: 5,
    upgradeCost: [3000, 6000, 12000, 24000]
  },
  {
    id: 'facility_002',
    name: 'ボール投出マシン',
    description: 'リターン練習用のボールマシン。様々な球種を打ち返せる。',
    rarity: 'uncommon',
    price: 12000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🤖',
    effects: {
      training_efficiency: 15,
      return_training_boost: 30
    },
    durability: { max: 120, current: 120, degradePerDay: 4, repairCost: 2000 },
    level: 1,
    maxLevel: 8,
    upgradeCost: [4000, 8000, 16000, 32000, 64000, 128000, 256000]
  },
  {
    id: 'facility_003',
    name: 'ネット練習台',
    description: 'ボレー練習用の特殊ネット。反復練習でボレー技術向上。',
    rarity: 'uncommon',
    price: 10000,
    category: 'facility',
    facilityType: 'court',
    icon: '🥅',
    effects: {
      training_efficiency: 12,
      volley_training_boost: 35
    },
    durability: { max: 150, current: 150, degradePerDay: 3, repairCost: 1800 },
    level: 1,
    maxLevel: 6,
    upgradeCost: [3500, 7000, 14000, 28000, 56000]
  },
  // 体力・サポート系施設
  {
    id: 'facility_004',
    name: 'トレーニングジム',
    description: '筋力・体力トレーニング施設。基礎能力の底上げが可能。',
    rarity: 'rare',
    price: 25000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🏋️',
    effects: {
      training_efficiency: 20,
      stamina_training_boost: 40,
      injury_prevention: 15
    },
    durability: { max: 200, current: 200, degradePerDay: 3, repairCost: 5000 },
    level: 1,
    maxLevel: 10,
    upgradeCost: [8000, 16000, 32000, 64000, 128000, 256000, 512000, 1024000, 2048000]
  },
  {
    id: 'facility_005',
    name: 'シャワー室',
    description: '栄冠ナインでお馴染みの人気施設。疲労回復とやる気維持。',
    rarity: 'rare',
    price: 30000,
    category: 'facility',
    facilityType: 'support_facility',
    icon: '🚿',
    effects: {
      injury_prevention: 25,
      motivation_maintenance: 20,
      condition_recovery: 15
    },
    durability: { max: 365, current: 365, degradePerDay: 1, repairCost: 8000 },
    level: 1,
    maxLevel: 5,
    upgradeCost: [15000, 30000, 60000, 120000]
  },
  {
    id: 'facility_006',
    name: '医務室',
    description: '怪我の治療と予防を行う医療施設。コンディション管理。',
    rarity: 'epic',
    price: 45000,
    category: 'facility',
    facilityType: 'support_facility',
    icon: '🏥',
    effects: {
      injury_prevention: 40,
      condition_recovery: 30,
      motivation_maintenance: 10
    },
    durability: { max: 300, current: 300, degradePerDay: 2, repairCost: 10000 },
    level: 1,
    maxLevel: 7,
    upgradeCost: [18000, 36000, 72000, 144000, 288000, 576000]
  },
  // 高級・特殊施設
  {
    id: 'facility_007',
    name: 'プロコート',
    description: 'プロ仕様の高級テニスコート。全ての練習効率が向上。',
    rarity: 'legendary',
    price: 100000,
    category: 'facility',
    facilityType: 'court',
    icon: '🎾',
    effects: {
      training_efficiency: 50,
      serve_training_boost: 20,
      return_training_boost: 20,
      volley_training_boost: 20,
      stroke_training_boost: 20
    },
    durability: { max: 1000, current: 1000, degradePerDay: 1, repairCost: 20000 },
    level: 1,
    maxLevel: 3,
    upgradeCost: [50000, 100000]
  },
  {
    id: 'facility_008',
    name: 'メンタルトレーニング室',
    description: 'テニプリ要素。精神力と集中力を鍛える特別な施設。',
    rarity: 'epic',
    price: 60000,
    category: 'facility',
    facilityType: 'training_equipment',
    icon: '🧠',
    effects: {
      training_efficiency: 25,
      mental_training_boost: 60,
      motivation_maintenance: 25
    },
    durability: { max: 250, current: 250, degradePerDay: 2, repairCost: 12000 },
    level: 1,
    maxLevel: 8,
    upgradeCost: [20000, 40000, 80000, 160000, 320000, 640000, 1280000]
  }
];

// ===== 統合データベース =====
export const EXPANDED_ITEMS_DATABASE = {
  equipment: [
    ...RACKET_EQUIPMENT_EXPANDED,
    ...SHOES_EQUIPMENT_EXPANDED,
    ...POKEMON_ITEMS_EXPANDED
  ],
  consumables: CONSUMABLE_ITEMS_EXPANDED,
  facilities: FACILITY_ITEMS_EXPANDED,
  // 既存のspecialsも継承
  specials: [
    {
      id: 'special_001',
      name: 'ショップ呼び出し券',
      description: '栄冠ナインでおなじみ。いつでもショップを呼び出せる。',
      rarity: 'rare',
      price: 10000,
      category: 'special',
      specialType: 'system_unlock',
      icon: '🎫',
      effects: { unlock_feature: 'instant_shop_access' },
      oneTimeUse: true
    },
    {
      id: 'special_002',
      name: 'ダブルカード',
      description: '次に使うカードの効果を2倍にする栄冠ナイン式アイテム。',
      rarity: 'epic',
      price: 15000,
      category: 'special',
      specialType: 'card_modifier',
      icon: '💫',
      effects: { card_effects_boost: 100 },
      oneTimeUse: true
    },
    {
      id: 'special_003',
      name: 'イベント発生装置',
      description: '1週間、特殊イベントの発生率を大幅に上げる。',
      rarity: 'rare',
      price: 12000,
      category: 'special',
      specialType: 'event_trigger',
      icon: '🎪',
      effects: { random_event_chance: 75, duration: 7 },
      oneTimeUse: true
    },
    {
      id: 'special_004',
      name: 'レベルアップカプセル',
      description: '選択したポケモンを即座に1レベル上げる。',
      rarity: 'epic',
      price: 20000,
      category: 'special',
      specialType: 'instant_growth',
      icon: '📈',
      effects: { instant_levelup: 1 },
      oneTimeUse: true
    }
  ]
};

// ===== ゲームバランス調整用パラメータ =====
export const GAME_BALANCE_CONFIG = {
  // 価格調整
  price_multiplier: {
    common: 1.0,
    uncommon: 2.5,
    rare: 5.0,
    epic: 10.0,
    legendary: 25.0
  },
  
  // 効果値調整
  effect_scaling: {
    early_game: 0.7,    // 序盤は効果を抑える
    mid_game: 1.0,      // 中盤は標準
    late_game: 1.3      // 終盤は効果を高める
  },
  
  // ドロップ率調整
  drop_rates: {
    common: 0.5,
    uncommon: 0.25,
    rare: 0.15,
    epic: 0.08,
    legendary: 0.02
  },
  
  // 耐久性調整
  durability_multiplier: {
    training: 0.8,      // 練習での消耗は少なめ
    match: 1.2,         // 試合での消耗は多め
    tournament: 1.5     // 大会での消耗は最も多い
  }
};