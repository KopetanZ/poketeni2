// 装備情報のローカルストレージ管理（データベーステーブル作成前の一時的な解決策）
import { Equipment, PlayerEquipment } from '@/types/items';
import { ITEMS_DATABASE } from '@/lib/items-database';

const STORAGE_KEYS = {
  PLAYER_EQUIPMENT: 'poketeni_player_equipment',
  PLAYER_INVENTORY: 'poketeni_player_inventory'
};

export class EquipmentStorage {
  // プレイヤーの装備を保存
  static savePlayerEquipment(playerId: string, equipment: PlayerEquipment): void {
    try {
      const allEquipment = this.getAllPlayerEquipment();
      allEquipment[playerId] = equipment;
      localStorage.setItem(STORAGE_KEYS.PLAYER_EQUIPMENT, JSON.stringify(allEquipment));
      console.log('Equipment saved to localStorage:', equipment);
    } catch (error) {
      console.error('Failed to save equipment to localStorage:', error);
    }
  }

  // プレイヤーの装備を読み込み
  static loadPlayerEquipment(playerId: string): PlayerEquipment {
    try {
      const allEquipment = this.getAllPlayerEquipment();
      const equipment = allEquipment[playerId];
      
      if (equipment) {
        console.log('Equipment loaded from localStorage:', equipment);
        return equipment;
      }
      
      // デフォルト装備を返す
      const defaultEquipment: PlayerEquipment = {
        player_id: playerId,
        racket: undefined,
        shoes: undefined,
        accessory: undefined,
        pokemon_item: undefined
      };
      
      console.log('No saved equipment found, returning default');
      return defaultEquipment;
    } catch (error) {
      console.error('Failed to load equipment from localStorage:', error);
      return {
        player_id: playerId,
        racket: undefined,
        shoes: undefined,
        accessory: undefined,
        pokemon_item: undefined
      };
    }
  }

  // すべてのプレイヤー装備を取得
  private static getAllPlayerEquipment(): Record<string, PlayerEquipment> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_EQUIPMENT);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored equipment:', error);
      return {};
    }
  }

  // プレイヤーのインベントリを取得（サンプルデータ）
  static getPlayerInventory(playerId: string) {
    // 現在はサンプルインベントリを返す
    return {
      rackets: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'racket') as Equipment[],
      shoes: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'shoes') as Equipment[],
      accessories: [],
      pokemonItems: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'pokemon_item') as Equipment[]
    };
  }

  // 装備ボーナスを計算
  static calculateEquipmentBonus(equipment: PlayerEquipment) {
    const bonus = {
      serve_skill: 0,
      return_skill: 0,
      volley_skill: 0,
      stroke_skill: 0,
      mental: 0,
      stamina: 0,
      experience_boost: 0
    };

    [equipment.racket, equipment.shoes, equipment.accessory, equipment.pokemon_item]
      .filter(Boolean)
      .forEach(item => {
        if (item && item.effects) {
          Object.entries(item.effects).forEach(([key, value]) => {
            if (key in bonus && typeof value === 'number') {
              (bonus as any)[key] += value;
            }
          });
        }
      });

    return bonus;
  }

  // 装備データをクリア（デバッグ用）
  static clearAllEquipment(): void {
    localStorage.removeItem(STORAGE_KEYS.PLAYER_EQUIPMENT);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_INVENTORY);
    console.log('All equipment data cleared');
  }
}