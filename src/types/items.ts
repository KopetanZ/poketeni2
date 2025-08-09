// アイテム・装備システムの型定義

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  category: 'equipment' | 'consumable' | 'facility' | 'special';
  icon: string;
}

// 選手装備アイテム（ポケモンアイテムベース）
export interface Equipment extends BaseItem {
  category: 'equipment';
  equipmentType: 'racket' | 'shoes' | 'accessory' | 'pokemon_item';
  effects: {
    serve_skill?: number;
    return_skill?: number;
    volley_skill?: number;
    stroke_skill?: number;
    mental?: number;
    stamina?: number;
    experience_boost?: number; // 経験値ボーナス%
  };
  durability?: {
    max: number;
    current: number;
    degradePerMatch: number;
  };
  pokemonCompatible?: number[]; // 特定のポケモンID専用
  // 装備固有の特殊効果（ID）
  specialAbility?: string;
}

// 消耗品アイテム
export interface ConsumableItem extends BaseItem {
  category: 'consumable';
  consumableType: 'recovery' | 'training' | 'motivation' | 'special';
  effects: {
    condition_change?: 'excellent' | 'good' | 'normal' | 'poor' | 'terrible' | 'slight_improvement';
    motivation_change?: number;
    instant_stats?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
    experience_gain?: number;
    // 永続上昇（努力値相当の演出）
    permanent_stats?: {
      serve_skill?: number;
      return_skill?: number;
      volley_skill?: number;
      stroke_skill?: number;
      mental?: number;
      stamina?: number;
    };
    // 一時的な練習効率ボーナス
    training_boost?: number; // %
    duration?: number; // 日数
  };
  stackable: boolean;
  maxStack: number;
  usageLimit?: { per_pokemon?: number };
}

// 施設アイテム（栄冠ナイン式）
export interface FacilityItem extends BaseItem {
  category: 'facility';
  facilityType: 'court' | 'training_equipment' | 'support_facility' | 'environment';
  effects: {
    training_efficiency?: number; // 練習効率向上%
    injury_prevention?: number;   // 怪我予防%
    motivation_maintenance?: number; // モチベーション維持
    special_training_unlock?: string[]; // 特別練習解放
    // 種別ごとの練習ブースト
    serve_training_boost?: number;
    return_training_boost?: number;
    volley_training_boost?: number;
    stroke_training_boost?: number;
    stamina_training_boost?: number;
    mental_training_boost?: number;
    // コンディション回復
    condition_recovery?: number;
  };
  durability: {
    max: number;
    current: number;
    degradePerDay: number;
    repairCost: number;
  };
  level: number;
  maxLevel: number;
  upgradeCost: number[];
}

// 特殊アイテム
export interface SpecialItem extends BaseItem {
  category: 'special';
  specialType: 'card_modifier' | 'event_trigger' | 'system_unlock' | 'cosmetic';
  effects: {
    card_effects_boost?: number;
    random_event_chance?: number;
    unlock_feature?: string;
    cosmetic_effect?: string;
    duration?: number;
    instant_levelup?: number;
  };
  oneTimeUse: boolean;
}

// プレイヤーのアイテムインベントリ
export interface PlayerInventory {
  equipment: { [key: string]: Equipment };
  consumables: { [key: string]: { item: ConsumableItem; quantity: number } };
  facilities: { [key: string]: FacilityItem };
  specials: { [key: string]: SpecialItem };
}

// プレイヤーの装備状態
export interface PlayerEquipment {
  player_id?: string;
  racket?: Equipment;
  shoes?: Equipment;
  accessory?: Equipment;
  pokemon_item?: Equipment;
}

// ショップ商品
export interface ShopItem {
  id: string;
  item: BaseItem;
  stock: number;
  restockDate?: {
    year: number;
    month: number;
    day: number;
  };
  unlockConditions?: {
    reputation_required?: number;
    tournament_wins_required?: number;
    player_level_required?: number;
  };
}

// ショップの種類
export type ShopType = 'general' | 'pokemon_center' | 'pro_shop' | 'black_market';

export interface ShopData {
  id: string;
  name: string;
  type: ShopType;
  description: string;
  items: ShopItem[];
  visitRequirements?: {
    reputation: number;
    tournaments_won: number;
    special_conditions?: string[];
  };
  visitFrequency: 'daily' | 'weekly' | 'after_wins' | 'random';
}

// コート施設レベル（栄冠ナイン式グラウンドレベル）
export interface CourtFacility {
  id: string;
  school_id: string;
  
  // 基本施設
  court_level: number;           // コートレベル（1-99）
  court_surface: 'clay' | 'hard' | 'grass' | 'indoor'; // コート種類
  
  // 練習施設
  training_efficiency: number;   // 全体練習効率（100-150%）
  injury_prevention: number;     // 怪我予防効果
  
  // 設置済み器材
  installed_equipment: {
    [key: string]: FacilityItem;
  };
  
  // 維持費
  maintenance_cost_per_day: number;
  last_maintenance: {
    year: number;
    month: number;
    day: number;
  };
}

// アイテム効果のログ
export interface ItemEffectLog {
  id: string;
  timestamp: Date;
  item_id: string;
  item_name: string;
  target_type: 'player' | 'team' | 'facility';
  target_id: string;
  effects_applied: Record<string, any>;
  success: boolean;
}