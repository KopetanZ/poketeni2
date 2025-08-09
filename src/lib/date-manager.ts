// 統一日付管理システム - 日付同期問題の完全解決

import { GameDate } from '@/types/game';
import { supabase } from './supabase';

export class DateManager {
  // 日付を文字列に変換
  static formatDate(date: GameDate): string {
    return `${date.year}/${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}`;
  }

  // 文字列から日付に変換
  static parseDate(dateString: string): GameDate {
    const [year, month, day] = dateString.split('/').map(Number);
    return { year, month, day };
  }

  // 日付を進める
  static advanceDate(currentDate: GameDate, days: number): GameDate {
    const date = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    date.setDate(date.getDate() + days);
    
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  // データベースの学校日付を更新（単一の真実の情報源）
  static async updateSchoolDate(userId: string, newDate: GameDate): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          current_year: newDate.year,
          current_month: newDate.month,
          current_day: newDate.day
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Date update error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Date update failed:', error);
      return false;
    }
  }

  // 現在の学校日付を取得
  static async getCurrentSchoolDate(userId: string): Promise<GameDate | null> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('current_year, current_month, current_day')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Failed to fetch school date:', error);
        return null;
      }

      return {
        year: data.current_year,
        month: data.current_month,
        day: data.current_day
      };
    } catch (error) {
      console.error('Date fetch failed:', error);
      return null;
    }
  }

  // カード使用時の日付進行（最重要メソッド）
  static async progressDateWithCard(
    userId: string, 
    cardDays: number
  ): Promise<GameDate | null> {
    try {
      // 1. 現在の日付を取得
      const currentDate = await this.getCurrentSchoolDate(userId);
      if (!currentDate) return null;

      // 2. 新しい日付を計算
      const newDate = this.advanceDate(currentDate, cardDays);

      // 3. データベースを更新
      const success = await this.updateSchoolDate(userId, newDate);
      if (!success) return null;

      // 4. 新しい日付を返す
      return newDate;
    } catch (error) {
      console.error('Date progression failed:', error);
      return null;
    }
  }

  // 年度判定
  static getSchoolYear(date: GameDate): number {
    // 4月1日から翌年3月31日が1学年
    return date.month >= 4 ? date.year : date.year - 1;
  }

  // 月名取得
  static getMonthName(month: number): string {
    const monthNames = [
      '', '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month] || '';
  }
}