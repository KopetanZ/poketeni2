import { supabase } from './supabase';
import { TrainingCard } from '@/types/training-cards';

export interface GameProgress {
  id: string;
  school_id: string;
  current_position: number;
  total_progress: number;
  hand_cards_count: number;
  max_hand_size: number;
  last_save_date: string;
  game_version: string;
  total_cards_used: number;
  total_events_triggered: number;
  created_at: string;
  updated_at: string;
}

export interface DailyResetManagement {
  id: string;
  school_id: string;
  last_reset_date_year: number;
  last_reset_date_month: number;
  last_reset_date_day: number;
  daily_cards_generated: boolean;
  cards_generated_count: number;
  next_reset_date_year: number;
  next_reset_date_month: number;
  next_reset_date_day: number;
  created_at: string;
  updated_at: string;
}

export interface CardUsageHistory {
  id: string;
  school_id: string;
  player_id?: string;
  card_id: string;
  card_name: string;
  card_category: string;
  used_at: string;
  used_position: number;
  effects_applied: any;
  success: boolean;
  notes?: string;
  created_at: string;
}

export interface SquareEventHistory {
  id: string;
  school_id: string;
  square_position: number;
  square_type: string;
  event_name?: string;
  event_description?: string;
  event_effects?: any;
  occurred_at: string;
  game_date_year: number;
  game_date_month: number;
  game_date_day: number;
  created_at: string;
}

export class GameProgressManager {
  private static instance: GameProgressManager;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): GameProgressManager {
    if (!GameProgressManager.instance) {
      GameProgressManager.instance = new GameProgressManager();
    }
    return GameProgressManager.instance;
  }

  // ゲーム進行状況の取得
  async getGameProgress(schoolId: string): Promise<GameProgress | null> {
    const cacheKey = `game_progress_${schoolId}`;
    
    // キャッシュから取得
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが存在しない場合は初期化
          return await this.initializeGameProgress(schoolId);
        }
        throw error;
      }

      // キャッシュに保存
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get game progress:', error);
      return null;
    }
  }

  // ゲーム進行状況の初期化
  async initializeGameProgress(schoolId: string): Promise<GameProgress | null> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .insert({
          school_id: schoolId,
          current_position: 0,
          total_progress: 0,
          hand_cards_count: 5,
          max_hand_size: 5,
          total_cards_used: 0,
          total_events_triggered: 0
        })
        .select()
        .single();

      if (error) throw error;

      // 日次リセット管理も初期化
      await this.initializeDailyResetManagement(schoolId);

      // キャッシュに保存
      const cacheKey = `game_progress_${schoolId}`;
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Failed to initialize game progress:', error);
      return null;
    }
  }

  // ゲーム進行状況の更新
  async updateGameProgress(
    schoolId: string, 
    updates: Partial<GameProgress>
  ): Promise<GameProgress | null> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw error;

      // キャッシュを更新
      const cacheKey = `game_progress_${schoolId}`;
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error('Failed to update game progress:', error);
      return null;
    }
  }

  // すごろく位置の更新
  async updatePosition(schoolId: string, newPosition: number): Promise<boolean> {
    try {
      const currentProgress = await this.getGameProgress(schoolId);
      if (!currentProgress) return false;

      const totalProgress = currentProgress.total_progress + newPosition;
      
      await this.updateGameProgress(schoolId, {
        current_position: newPosition % 24,
        total_progress: totalProgress
      });

      return true;
    } catch (error) {
      console.error('Failed to update position:', error);
      return false;
    }
  }

  // 手札の状態を更新
  async updateHandCards(schoolId: string, handCardsCount: number): Promise<boolean> {
    try {
      await this.updateGameProgress(schoolId, {
        hand_cards_count: handCardsCount
      });
      return true;
    } catch (error) {
      console.error('Failed to update hand cards:', error);
      return false;
    }
  }

  // 日次リセット管理の取得
  async getDailyResetManagement(schoolId: string): Promise<DailyResetManagement | null> {
    const cacheKey = `daily_reset_${schoolId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase
        .from('daily_reset_management')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return await this.initializeDailyResetManagement(schoolId);
        }
        throw error;
      }

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get daily reset management:', error);
      return null;
    }
  }

  // 日次リセット管理の初期化
  async initializeDailyResetManagement(schoolId: string): Promise<DailyResetManagement | null> {
    try {
      const { data, error } = await supabase
        .from('daily_reset_management')
        .insert({
          school_id: schoolId,
          last_reset_date_year: 2024,
          last_reset_date_month: 4,
          last_reset_date_day: 1,
          daily_cards_generated: false,
          cards_generated_count: 0,
          next_reset_date_year: 2024,
          next_reset_date_month: 4,
          next_reset_date_day: 2
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `daily_reset_${schoolId}`;
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Failed to initialize daily reset management:', error);
      return null;
    }
  }

  // 日次リセットが必要かチェック
  async shouldResetDaily(schoolId: string, currentYear: number, currentMonth: number, currentDay: number): Promise<boolean> {
    try {
      const resetManagement = await this.getDailyResetManagement(schoolId);
      if (!resetManagement) return true;

      return (
        resetManagement.last_reset_date_year !== currentYear ||
        resetManagement.last_reset_date_month !== currentMonth ||
        resetManagement.last_reset_date_day !== currentDay
      );
    } catch (error) {
      console.error('Failed to check daily reset:', error);
      return true;
    }
  }

  // 日次リセットの実行
  async executeDailyReset(
    schoolId: string, 
    currentYear: number, 
    currentMonth: number, 
    currentDay: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_reset_management')
        .update({
          last_reset_date_year: currentYear,
          last_reset_date_month: currentMonth,
          last_reset_date_day: currentDay,
          daily_cards_generated: false,
          cards_generated_count: 0,
          next_reset_date_year: currentYear,
          next_reset_date_month: currentMonth,
          next_reset_date_day: currentDay + 1
        })
        .eq('school_id', schoolId);

      if (error) throw error;

      // キャッシュをクリア
      const cacheKey = `daily_reset_${schoolId}`;
      this.cache.delete(cacheKey);

      return true;
    } catch (error) {
      console.error('Failed to execute daily reset:', error);
      return false;
    }
  }

  // カード使用履歴の記録
  async recordCardUsage(
    schoolId: string,
    playerId: string | undefined,
    card: TrainingCard,
    usedPosition: number,
    effectsApplied: any,
    success: boolean = true,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('card_usage_history')
        .insert({
          school_id: schoolId,
          player_id: playerId,
          card_id: card.id,
          card_name: card.name,
          card_category: card.category,
          used_position: usedPosition,
          effects_applied: effectsApplied,
          success,
          notes
        });

      if (error) throw error;

      // ゲーム進行状況の統計を更新
      const currentProgress = await this.getGameProgress(schoolId);
      if (currentProgress) {
        await this.updateGameProgress(schoolId, {
          total_cards_used: currentProgress.total_cards_used + 1
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to record card usage:', error);
      return false;
    }
  }

  // マス効果履歴の記録
  async recordSquareEvent(
    schoolId: string,
    squarePosition: number,
    squareType: string,
    eventName?: string,
    eventDescription?: string,
    eventEffects?: any,
    gameDateYear?: number,
    gameDateMonth?: number,
    gameDateDay?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('square_event_history')
        .insert({
          school_id: schoolId,
          square_position: squarePosition,
          square_type: squareType,
          event_name: eventName,
          event_description: eventDescription,
          event_effects: eventEffects,
          game_date_year: gameDateYear || 2024,
          game_date_month: gameDateMonth || 4,
          game_date_day: gameDateDay || 1
        });

      if (error) throw error;

      // ゲーム進行状況の統計を更新
      const currentProgress = await this.getGameProgress(schoolId);
      if (currentProgress) {
        await this.updateGameProgress(schoolId, {
          total_events_triggered: currentProgress.total_events_triggered + 1
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to record square event:', error);
      return false;
    }
  }

  // キャッシュのクリア
  clearCache(schoolId?: string): void {
    if (schoolId) {
      this.cache.delete(`game_progress_${schoolId}`);
      this.cache.delete(`daily_reset_${schoolId}`);
    } else {
      this.cache.clear();
    }
  }

  // ゲーム進行状況の完全リセット
  async resetGameProgress(schoolId: string): Promise<boolean> {
    try {
      // 関連テーブルのデータを削除
      await supabase
        .from('card_usage_history')
        .delete()
        .eq('school_id', schoolId);

      await supabase
        .from('square_event_history')
        .delete()
        .eq('school_id', schoolId);

      // ゲーム進行状況を初期化
      await this.updateGameProgress(schoolId, {
        current_position: 0,
        total_progress: 0,
        hand_cards_count: 5,
        max_hand_size: 5,
        total_cards_used: 0,
        total_events_triggered: 0
      });

      // 日次リセット管理も初期化
      await this.executeDailyReset(schoolId, 2024, 4, 1);

      // キャッシュをクリア
      this.clearCache(schoolId);

      return true;
    } catch (error) {
      console.error('Failed to reset game progress:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const gameProgressManager = GameProgressManager.getInstance();
