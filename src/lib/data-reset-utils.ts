// データリセット用ユーティリティ

import { supabase } from './supabase';
import { LocalAuth } from './local-auth';

export interface ResetOptions {
  resetSchool: boolean;      // 学校データをリセット
  resetPlayers: boolean;     // 選手データをリセット  
  resetProgress: boolean;    // 進捗データをリセット
  resetInventory: boolean;   // アイテム・装備をリセット
  resetAll: boolean;         // 全てリセット
}

export class DataResetUtils {
  // サンプルアカウントかどうかチェック
  static isSampleAccount(userEmail: string): boolean {
    return userEmail.includes('sample') || 
           userEmail.includes('demo') || 
           userEmail.includes('test') ||
           userEmail === 'user@example.com';
  }
  
  // 選択的データリセット
  static async resetUserData(userId: string, options: ResetOptions): Promise<{
    success: boolean;
    message: string;
    deletedTables: string[];
  }> {
    const deletedTables: string[] = [];
    
    try {
      // 全リセットの場合は全テーブルを対象にする
      if (options.resetAll) {
        options.resetSchool = true;
        options.resetPlayers = true;
        options.resetProgress = true;
        options.resetInventory = true;
      }
      
      // 学校データのリセット
      if (options.resetSchool) {
        const { error: schoolError } = await supabase
          .from('schools')
          .delete()
          .eq('user_id', userId);
        
        if (schoolError) throw new Error(`学校データリセットエラー: ${schoolError.message}`);
        deletedTables.push('schools');
      }
      
      // 選手データのリセット
      if (options.resetPlayers) {
        const { error: playersError } = await supabase
          .from('players')
          .delete()
          .eq('user_id', userId);
        
        if (playersError) throw new Error(`選手データリセットエラー: ${playersError.message}`);
        deletedTables.push('players');
      }
      
      // 進捗データのリセット（カード使用履歴など）
      if (options.resetProgress) {
        // カード使用履歴
        const { error: cardsError } = await supabase
          .from('card_usage_history')
          .delete()
          .eq('user_id', userId);
        
        if (cardsError) throw new Error(`カード履歴リセットエラー: ${cardsError.message}`);
        deletedTables.push('card_usage_history');
      }
      
      // アイテム・装備データのリセット
      if (options.resetInventory) {
        // プレイヤー装備
        const { error: equipmentError } = await supabase
          .from('player_equipment')
          .delete()
          .eq('user_id', userId);
        
        if (equipmentError) throw new Error(`装備データリセットエラー: ${equipmentError.message}`);
        deletedTables.push('player_equipment');
        
        // アイテム所持
        const { error: inventoryError } = await supabase
          .from('player_inventory')
          .delete()
          .eq('user_id', userId);
        
        if (inventoryError) throw new Error(`所持アイテムリセットエラー: ${inventoryError.message}`);
        deletedTables.push('player_inventory');
      }
      
      return {
        success: true,
        message: `データリセット完了: ${deletedTables.join(', ')} をリセットしました`,
        deletedTables
      };
      
    } catch (error: any) {
      console.error('Data reset error:', error);
      return {
        success: false,
        message: `データリセット失敗: ${error.message}`,
        deletedTables
      };
    }
  }
  
  // 完全リセット（サンプルアカウント専用）
  static async completeSampleReset(userId: string, userEmail: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // サンプルアカウントでない場合は実行拒否
    if (!this.isSampleAccount(userEmail)) {
      return {
        success: false,
        message: 'この機能はサンプルアカウントでのみ利用可能です'
      };
    }
    
    const result = await this.resetUserData(userId, {
      resetSchool: true,
      resetPlayers: true,
      resetProgress: true,
      resetInventory: true,
      resetAll: true
    });
    
    if (result.success) {
      // ローカルストレージもクリア
      this.clearLocalStorage();
      
      return {
        success: true,
        message: 'サンプルアカウントのデータを完全にリセットしました。ページを再読み込みしてオンボーディングから開始できます。'
      };
    }
    
    return result;
  }
  
  // ローカルストレージのクリア
  static clearLocalStorage(): void {
    try {
      // ゲーム関連のキーのみクリア
      const gameKeys = [
        'gameData',
        'playerData',
        'schoolData',
        'currentDate',
        'cards',
        'inventory',
        'equipment',
        'progress'
      ];
      
      gameKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // セッションストレージもクリア
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Local storage clear error:', error);
    }
  }
  
  // データリセット確認ダイアログの内容生成
  static generateResetConfirmation(options: ResetOptions): {
    title: string;
    message: string;
    warning: string;
    items: string[];
  } {
    const items: string[] = [];
    
    if (options.resetAll) {
      return {
        title: '⚠️ 完全データリセット',
        message: '全てのゲームデータを削除します',
        warning: 'この操作は取り消せません！',
        items: ['学校データ', '全選手', 'アイテム・装備', '進捗・履歴']
      };
    }
    
    if (options.resetSchool) items.push('学校データ (資金・評判・名前)');
    if (options.resetPlayers) items.push('全選手データ');
    if (options.resetInventory) items.push('所持アイテム・装備');
    if (options.resetProgress) items.push('進捗・履歴データ');
    
    return {
      title: '🔄 選択データリセット',
      message: '選択されたデータを削除します',
      warning: 'この操作は取り消せません',
      items
    };
  }
  
  // バックアップ作成（JSON形式）
  static async createDataBackup(userId: string): Promise<{
    success: boolean;
    backup?: any;
    message: string;
  }> {
    try {
      const backup: any = {
        timestamp: new Date().toISOString(),
        userId: userId
      };
      
      // 学校データ
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (schoolError) throw schoolError;
      backup.school = school;
      
      // 選手データ
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', userId);
      
      if (playersError) throw playersError;
      backup.players = players;
      
      // その他のデータも同様に取得...
      
      return {
        success: true,
        backup,
        message: 'バックアップを作成しました'
      };
      
    } catch (error: any) {
      console.error('Backup creation error:', error);
      return {
        success: false,
        message: `バックアップ作成失敗: ${error.message}`
      };
    }
  }
}

// 使いやすいヘルパー関数
export const DataResetHelpers = {
  // 簡単な完全リセット（サンプルアカウント用）
  resetSampleAccount: async (): Promise<boolean> => {
    const currentUser = LocalAuth.getCurrentUser();
    if (!currentUser) return false;
    
    const result = await DataResetUtils.completeSampleReset(currentUser.id, currentUser.email);
    
    if (result.success) {
      alert(result.message);
      // ページリロードで初期状態に戻る
      window.location.reload();
      return true;
    } else {
      alert(result.message);
      return false;
    }
  },
  
  // カスタムリセット
  customReset: async (options: ResetOptions): Promise<boolean> => {
    const currentUser = LocalAuth.getCurrentUser();
    if (!currentUser) return false;
    
    const confirmation = DataResetUtils.generateResetConfirmation(options);
    const userConfirmed = confirm(`${confirmation.title}\n\n${confirmation.message}\n\n削除対象:\n${confirmation.items.map(item => `• ${item}`).join('\n')}\n\n${confirmation.warning}`);
    
    if (!userConfirmed) return false;
    
    const result = await DataResetUtils.resetUserData(currentUser.id, options);
    
    if (result.success) {
      alert(result.message);
      window.location.reload();
      return true;
    } else {
      alert(result.message);
      return false;
    }
  }
};