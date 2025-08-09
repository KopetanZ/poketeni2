// 装備管理ライブラリ
import { supabase } from '@/lib/supabase';
import { Equipment, PlayerEquipment } from '@/types/items';
import { ITEMS_DATABASE } from '@/lib/items-database';

export class EquipmentManager {
  // データベーステーブルの存在チェックと初期化
  static async ensureTablesExist(): Promise<void> {
    try {
      // player_equipmentテーブルの存在確認
      const { data, error } = await supabase
        .from('player_equipment')
        .select('id')
        .limit(1);

      // テーブルが存在しない場合のエラー処理は省略し、
      // 実際のアプリでは事前にスキーマを実行することを前提とする
    } catch (error) {
      console.warn('Equipment tables may not exist. Please run items-schema.sql');
    }
  }

  // プレイヤーの現在の装備を取得
  static async loadPlayerEquipment(playerId: string): Promise<PlayerEquipment> {
    try {
      const { data, error } = await supabase
        .from('player_equipment')
        .select('*')
        .eq('player_id', playerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // 装備データが存在しない場合、新規作成
        return await this.createNewPlayerEquipment(playerId);
      }

      // 装備アイテムの詳細情報を取得
      const equipment: PlayerEquipment = {
        player_id: playerId,
        racket: data.racket_item_id ? await this.getEquipmentItemData(data.racket_item_id) : undefined,
        shoes: data.shoes_item_id ? await this.getEquipmentItemData(data.shoes_item_id) : undefined,
        accessory: data.accessory_item_id ? await this.getEquipmentItemData(data.accessory_item_id) : undefined,
        pokemon_item: data.pokemon_item_id ? await this.getEquipmentItemData(data.pokemon_item_id) : undefined
      };

      return equipment;
    } catch (error) {
      console.error('Failed to load player equipment:', error);
      return {
        player_id: playerId,
        racket: undefined,
        shoes: undefined,
        accessory: undefined,
        pokemon_item: undefined
      };
    }
  }

  // 新しいプレイヤー装備データを作成
  static async createNewPlayerEquipment(playerId: string): Promise<PlayerEquipment> {
    try {
      const { data, error } = await supabase
        .from('player_equipment')
        .insert({
          player_id: playerId,
          total_serve_bonus: 0,
          total_return_bonus: 0,
          total_volley_bonus: 0,
          total_stroke_bonus: 0,
          total_mental_bonus: 0,
          total_stamina_bonus: 0,
          experience_boost_percentage: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        player_id: playerId,
        racket: undefined,
        shoes: undefined,
        accessory: undefined,
        pokemon_item: undefined
      };
    } catch (error) {
      console.error('Failed to create player equipment:', error);
      return {
        player_id: playerId,
        racket: undefined,
        shoes: undefined,
        accessory: undefined,
        pokemon_item: undefined
      };
    }
  }

  // 装備アイテムの詳細データを取得
  static async getEquipmentItemData(itemId: string): Promise<Equipment | undefined> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) {
        throw error;
      }

      // item_dataからEquipmentオブジェクトを復元
      return data.item_data as Equipment;
    } catch (error) {
      console.error('Failed to get equipment item data:', error);
      return undefined;
    }
  }

  // プレイヤーの装備を保存
  static async savePlayerEquipment(playerId: string, equipment: PlayerEquipment): Promise<boolean> {
    try {
      // 各装備アイテムをインベントリに保存（まだ存在しない場合）
      const racketId = equipment.racket ? await this.ensureItemInInventory(playerId, equipment.racket) : null;
      const shoesId = equipment.shoes ? await this.ensureItemInInventory(playerId, equipment.shoes) : null;
      const accessoryId = equipment.accessory ? await this.ensureItemInInventory(playerId, equipment.accessory) : null;
      const pokemonItemId = equipment.pokemon_item ? await this.ensureItemInInventory(playerId, equipment.pokemon_item) : null;

      // 装備ボーナスを計算
      const bonus = this.calculateEquipmentBonus(equipment);

      // player_equipmentテーブルを更新
      const { error } = await supabase
        .from('player_equipment')
        .upsert({
          player_id: playerId,
          racket_item_id: racketId,
          shoes_item_id: shoesId,
          accessory_item_id: accessoryId,
          pokemon_item_id: pokemonItemId,
          total_serve_bonus: bonus.serve_skill,
          total_return_bonus: bonus.return_skill,
          total_volley_bonus: bonus.volley_skill,
          total_stroke_bonus: bonus.stroke_skill,
          total_mental_bonus: bonus.mental,
          total_stamina_bonus: bonus.stamina,
          experience_boost_percentage: bonus.experience_boost
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to save player equipment:', error);
      return false;
    }
  }

  // アイテムがインベントリに存在することを確認し、なければ追加
  static async ensureItemInInventory(playerId: string, equipment: Equipment): Promise<string> {
    try {
      // プレイヤーの学校IDを取得
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('school_id')
        .eq('id', playerId)
        .single();

      if (playerError) {
        throw playerError;
      }

      // インベントリIDを取得
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('player_inventories')
        .select('id')
        .eq('school_id', playerData.school_id)
        .single();

      if (inventoryError) {
        throw inventoryError;
      }

      // 既存のアイテムをチェック
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('inventory_id', inventoryData.id)
        .eq('item_id', equipment.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingItem) {
        return existingItem.id;
      }

      // アイテムが存在しない場合、新規作成
      const { data: newItem, error: insertError } = await supabase
        .from('inventory_items')
        .insert({
          inventory_id: inventoryData.id,
          item_id: equipment.id,
          item_data: equipment,
          current_durability: equipment.durability?.max,
          is_equipped: true,
          equipped_to_player_id: playerId
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      return newItem.id;
    } catch (error) {
      console.error('Failed to ensure item in inventory:', error);
      throw error;
    }
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

  // プレイヤーのインベントリを取得（装備可能なアイテム）
  static async getPlayerInventory(playerId: string) {
    try {
      // プレイヤーの学校IDを取得
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('school_id')
        .eq('id', playerId)
        .single();

      if (playerError) {
        throw playerError;
      }

      // インベントリを取得
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('player_inventories')
        .select('id')
        .eq('school_id', playerData.school_id)
        .single();

      if (inventoryError) {
        // インベントリが存在しない場合は作成
        const { data: newInventory, error: createError } = await supabase
          .from('player_inventories')
          .insert({ school_id: playerData.school_id })
          .select('id')
          .single();

        if (createError) {
          throw createError;
        }

        inventoryData.id = newInventory.id;
      }

      // アイテムを取得
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('inventory_id', inventoryData.id);

      if (itemsError) {
        throw itemsError;
      }

      // アイテムを種類別に分類
      const inventory = {
        rackets: [] as Equipment[],
        shoes: [] as Equipment[],
        accessories: [] as Equipment[],
        pokemonItems: [] as Equipment[]
      };

      items?.forEach(item => {
        const equipment = item.item_data as Equipment;
        switch (equipment.equipmentType) {
          case 'racket':
            inventory.rackets.push(equipment);
            break;
          case 'shoes':
            inventory.shoes.push(equipment);
            break;
          case 'accessory':
            inventory.accessories.push(equipment);
            break;
          case 'pokemon_item':
            inventory.pokemonItems.push(equipment);
            break;
        }
      });

      // データベースにないアイテムはデフォルトアイテムとして追加
      if (inventory.rackets.length === 0) {
        inventory.rackets = ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'racket') as Equipment[];
      }
      if (inventory.shoes.length === 0) {
        inventory.shoes = ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'shoes') as Equipment[];
      }
      if (inventory.pokemonItems.length === 0) {
        inventory.pokemonItems = ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'pokemon_item') as Equipment[];
      }

      return inventory;
    } catch (error) {
      console.error('Failed to get player inventory:', error);
      // エラー時はデフォルトインベントリを返す
      return {
        rackets: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'racket') as Equipment[],
        shoes: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'shoes') as Equipment[],
        accessories: [],
        pokemonItems: ITEMS_DATABASE.equipment.filter(item => item.equipmentType === 'pokemon_item') as Equipment[]
      };
    }
  }
}