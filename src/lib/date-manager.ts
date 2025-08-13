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

  // データベースの学校日付を更新（単一の真実の情報源・改善版）
  static async updateSchoolDate(userId: string, newDate: GameDate): Promise<boolean> {
    try {
      // 日付の妥当性チェック
      if (!this.isValidDate(newDate)) {
        console.error('Invalid date provided:', newDate);
        return false;
      }

      const { error } = await supabase
        .from('schools')
        .update({
          current_year: newDate.year,
          current_month: newDate.month,
          current_day: newDate.day
          // updated_atはトリガーで自動更新されるため削除
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Date update error:', error);
        return false;
      }
      
      console.log('✅ 学校日付を更新しました:', newDate);
      return true;
    } catch (error) {
      console.error('Date update failed:', error);
      return false;
    }
  }

  // 日付の妥当性チェック
  static isValidDate(date: GameDate): boolean {
    if (!date || typeof date.year !== 'number' || typeof date.month !== 'number' || typeof date.day !== 'number') {
      return false;
    }
    
    if (date.year < 2020 || date.year > 2030) {
      return false;
    }
    
    if (date.month < 1 || date.month > 12) {
      return false;
    }
    
    const daysInMonth = new Date(date.year, date.month, 0).getDate();
    if (date.day < 1 || date.day > daysInMonth) {
      return false;
    }
    
    return true;
  }

  // 日付の整合性チェック（データベースとゲーム状態の比較）
  static async validateDateConsistency(userId: string, gameDate: GameDate): Promise<{
    isConsistent: boolean;
    databaseDate: GameDate | null;
    differences: string[];
  }> {
    try {
      const dbDate = await this.getCurrentSchoolDate(userId);
      
      if (!dbDate) {
        return {
          isConsistent: false,
          databaseDate: null,
          differences: ['データベースから日付を取得できませんでした']
        };
      }
      
      const differences: string[] = [];
      
      if (dbDate.year !== gameDate.year) {
        differences.push(`年: データベース(${dbDate.year}) vs ゲーム(${gameDate.year})`);
      }
      
      if (dbDate.month !== gameDate.month) {
        differences.push(`月: データベース(${dbDate.month}) vs ゲーム(${gameDate.month})`);
      }
      
      if (dbDate.day !== gameDate.day) {
        differences.push(`日: データベース(${dbDate.day}) vs ゲーム(${gameDate.day})`);
      }
      
      return {
        isConsistent: differences.length === 0,
        databaseDate: dbDate,
        differences
      };
      
    } catch (error) {
      console.error('Date consistency validation failed:', error);
      return {
        isConsistent: false,
        databaseDate: null,
        differences: [`検証エラー: ${error}`]
      };
    }
  }

  // 日付の強制同期（データベースの日付でゲーム状態を上書き）
  static async forceDateSync(userId: string, targetDate: GameDate): Promise<boolean> {
    try {
      // まず日付の妥当性をチェック
      if (!this.isValidDate(targetDate)) {
        console.error('Invalid target date for force sync:', targetDate);
        return false;
      }
      
      // データベースを更新
      const updateSuccess = await this.updateSchoolDate(userId, targetDate);
      if (!updateSuccess) {
        return false;
      }
      
      console.log('✅ 日付の強制同期が完了しました:', targetDate);
      return true;
      
    } catch (error) {
      console.error('Force date sync failed:', error);
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

  // 追加: 現在日付の簡易文字列 (YYYY/MM/DD)
  static getCurrentDateString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
}