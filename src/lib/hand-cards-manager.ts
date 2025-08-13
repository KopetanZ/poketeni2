import { supabase } from './supabase';
import { TrainingCard } from '@/types/training-cards';
import { TrainingCardSystem } from './training-card-system';
import { gameProgressManager } from './game-progress-manager';

export interface HandCardRecord {
  id: string;
  school_id: string;
  card_data: TrainingCard;
  created_at: string;
}

export class HandCardsManager {
  private static instance: HandCardsManager;
  private cache: Map<string, TrainingCard[]> = new Map();

  private constructor() {}

  static getInstance(): HandCardsManager {
    if (!HandCardsManager.instance) {
      HandCardsManager.instance = new HandCardsManager();
    }
    return HandCardsManager.instance;
  }

  // 手札カードの取得
  async getHandCards(schoolId: string): Promise<TrainingCard[]> {
    const cacheKey = `hand_cards_${schoolId}`;
    
    // キャッシュから取得
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase
        .from('hand_cards')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cards = data.map(record => record.card_data);
      
      // キャッシュに保存
      this.cache.set(cacheKey, cards);
      
      return cards;
    } catch (error) {
      console.error('Failed to get hand cards:', error);
      return [];
    }
  }

  // 手札カードの保存
  async saveHandCards(schoolId: string, cards: TrainingCard[]): Promise<boolean> {
    try {
      // 既存のカードを削除
      const { error: deleteError } = await supabase
        .from('hand_cards')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) throw deleteError;

      // 新しいカードを挿入
      if (cards.length > 0) {
        const cardRecords = cards.map(card => ({
          school_id: schoolId,
          card_data: card
        }));

        const { error: insertError } = await supabase
          .from('hand_cards')
          .insert(cardRecords);

        if (insertError) throw insertError;
      }

      // ゲーム進行状況の手札枚数を更新
      await gameProgressManager.updateHandCards(schoolId, cards.length);

      // キャッシュを更新
      const cacheKey = `hand_cards_${schoolId}`;
      this.cache.set(cacheKey, cards);

      return true;
    } catch (error) {
      console.error('Failed to save hand cards:', error);
      return false;
    }
  }

  // 日次カードの生成と保存
  async generateAndSaveDailyCards(
    schoolId: string,
    schoolReputation: number,
    playerLevel: number,
    currentYear: number,
    currentMonth: number,
    currentDay: number
  ): Promise<TrainingCard[]> {
    try {
      // 日次リセットが必要かチェック
      const shouldReset = await gameProgressManager.shouldResetDaily(
        schoolId, 
        currentYear, 
        currentMonth, 
        currentDay
      );

      if (!shouldReset) {
        // リセット不要の場合は既存のカードを返す
        return await this.getHandCards(schoolId);
      }

      // 新しいカードを生成
      const cardDrop = TrainingCardSystem.generateCardDrop(
        schoolReputation,
        playerLevel,
        5, // 1日5枚のカード
        'daily_practice'
      );

      // カードを保存
      await this.saveHandCards(schoolId, cardDrop.cards);

      // 日次リセットを実行
      await gameProgressManager.executeDailyReset(
        schoolId, 
        currentYear, 
        currentMonth, 
        currentDay
      );

      return cardDrop.cards;
    } catch (error) {
      console.error('Failed to generate daily cards:', error);
      return [];
    }
  }

  // カードの追加
  async addCard(schoolId: string, card: TrainingCard): Promise<boolean> {
    try {
      const currentCards = await this.getHandCards(schoolId);
      const newCards = [...currentCards, card];

      return await this.saveHandCards(schoolId, newCards);
    } catch (error) {
      console.error('Failed to add card:', error);
      return false;
    }
  }

  // カードの削除
  async removeCard(schoolId: string, cardId: string): Promise<boolean> {
    try {
      const currentCards = await this.getHandCards(schoolId);
      const newCards = currentCards.filter(card => card.id !== cardId);

      return await this.saveHandCards(schoolId, newCards);
    } catch (error) {
      console.error('Failed to remove card:', error);
      return false;
    }
  }

  // カードの使用（削除して履歴に記録）
  async useCard(
    schoolId: string,
    card: TrainingCard,
    playerId: string | undefined,
    usedPosition: number,
    effectsApplied: any
  ): Promise<boolean> {
    try {
      // カードを削除
      const success = await this.removeCard(schoolId, card.id);
      if (!success) return false;

      // 使用履歴を記録
      await gameProgressManager.recordCardUsage(
        schoolId,
        playerId,
        card,
        usedPosition,
        effectsApplied
      );

      return true;
    } catch (error) {
      console.error('Failed to use card:', error);
      return false;
    }
  }

  // 手札のシャッフル
  async shuffleHandCards(schoolId: string): Promise<TrainingCard[]> {
    try {
      const currentCards = await this.getHandCards(schoolId);
      const shuffledCards = [...currentCards].sort(() => Math.random() - 0.5);

      await this.saveHandCards(schoolId, shuffledCards);
      return shuffledCards;
    } catch (error) {
      console.error('Failed to shuffle hand cards:', error);
      return [];
    }
  }

  // 手札のフィルタリング
  async filterHandCards(
    schoolId: string,
    filter: {
      category?: string;
      rarity?: string;
      minNumber?: number;
      maxNumber?: number;
    }
  ): Promise<TrainingCard[]> {
    try {
      const allCards = await this.getHandCards(schoolId);
      
      return allCards.filter(card => {
        if (filter.category && card.category !== filter.category) return false;
        if (filter.rarity && card.rarity !== filter.rarity) return false;
        if (filter.minNumber !== undefined && card.number < filter.minNumber) return false;
        if (filter.maxNumber !== undefined && card.number > filter.maxNumber) return false;
        return true;
      });
    } catch (error) {
      console.error('Failed to filter hand cards:', error);
      return [];
    }
  }

  // 手札の検索
  async searchHandCards(schoolId: string, searchTerm: string): Promise<TrainingCard[]> {
    try {
      const allCards = await this.getHandCards(schoolId);
      const term = searchTerm.toLowerCase();
      
      return allCards.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.description.toLowerCase().includes(term) ||
        card.category.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Failed to search hand cards:', error);
      return [];
    }
  }

  // 手札の統計情報
  async getHandCardsStats(schoolId: string): Promise<{
    totalCards: number;
    categories: Record<string, number>;
    rarities: Record<string, number>;
    averageNumber: number;
  }> {
    try {
      const cards = await this.getHandCards(schoolId);
      
      const categories: Record<string, number> = {};
      const rarities: Record<string, number> = {};
      let totalNumber = 0;

      cards.forEach(card => {
        categories[card.category] = (categories[card.category] || 0) + 1;
        rarities[card.rarity] = (rarities[card.rarity] || 0) + 1;
        totalNumber += card.number;
      });

      return {
        totalCards: cards.length,
        categories,
        rarities,
        averageNumber: cards.length > 0 ? totalNumber / cards.length : 0
      };
    } catch (error) {
      console.error('Failed to get hand cards stats:', error);
      return {
        totalCards: 0,
        categories: {},
        rarities: {},
        averageNumber: 0
      };
    }
  }

  // 手札の完全リセット
  async resetHandCards(schoolId: string): Promise<boolean> {
    try {
      // 既存のカードを削除
      const { error } = await supabase
        .from('hand_cards')
        .delete()
        .eq('school_id', schoolId);

      if (error) throw error;

      // キャッシュをクリア
      const cacheKey = `hand_cards_${schoolId}`;
      this.cache.delete(cacheKey);

      // ゲーム進行状況の手札枚数を更新
      await gameProgressManager.updateHandCards(schoolId, 0);

      return true;
    } catch (error) {
      console.error('Failed to reset hand cards:', error);
      return false;
    }
  }

  // キャッシュのクリア
  clearCache(schoolId?: string): void {
    if (schoolId) {
      this.cache.delete(`hand_cards_${schoolId}`);
    } else {
      this.cache.clear();
    }
  }

  // 手札のバックアップ作成
  async createBackup(schoolId: string): Promise<TrainingCard[]> {
    try {
      const cards = await this.getHandCards(schoolId);
      return [...cards]; // ディープコピー
    } catch (error) {
      console.error('Failed to create backup:', error);
      return [];
    }
  }

  // 手札の復元
  async restoreFromBackup(schoolId: string, backup: TrainingCard[]): Promise<boolean> {
    try {
      return await this.saveHandCards(schoolId, backup);
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const handCardsManager = HandCardsManager.getInstance();
