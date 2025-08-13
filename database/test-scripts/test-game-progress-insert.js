require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGameProgressInsert() {
  try {
    console.log('🧪 game_progressテーブルのテスト挿入開始...');
    
    // テスト用のschool_idを生成
    const testSchoolId = `test_school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🧪 テスト用school_id:', testSchoolId);
    
    // まず、テーブルが存在するかを確認
    console.log('📋 テーブルの存在確認...');
    try {
      const { data: testSelect, error: testError } = await supabase
        .from('game_progress')
        .select('*')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        console.error('❌ game_progressテーブルが存在しません');
        return;
      }
      
      console.log('✅ game_progressテーブルが存在します');
    } catch (error) {
      console.error('❌ テーブル確認エラー:', error);
      return;
    }
    
    // テストデータの挿入を試行
    console.log('📝 テストデータの挿入を試行...');
    
    const testData = {
      school_id: testSchoolId,
      current_position: 0,
      total_progress: 0,
      hand_cards_count: 5,
      max_hand_size: 5,
      cards_used_today: 0,
      total_moves: 0,
      current_game_date_year: 2024,
      current_game_date_month: 4,
      current_game_date_day: 14,
      last_game_date_year: 2024,
      last_game_date_month: 4,
      last_game_date_day: 14,
      total_days_played: 0,
      consecutive_days_played: 0,
      last_play_date: new Date().toISOString()
    };
    
    console.log('📝 挿入するデータ:', testData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('game_progress')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ 挿入エラー:', insertError);
      console.error('エラー詳細:', JSON.stringify(insertError, null, 2));
      
      // エラーの詳細を分析
      if (insertError.code === '23505') {
        console.error('❌ 制約違反: 重複キー');
      } else if (insertError.code === '23502') {
        console.error('❌ 制約違反: NOT NULL制約');
      } else if (insertError.code === '23503') {
        console.error('❌ 制約違反: 外部キー制約');
      } else if (insertError.code === '42703') {
        console.error('❌ カラムが存在しません');
      }
      
      return;
    }
    
    console.log('✅ テストデータの挿入に成功しました');
    console.log('📝 挿入されたデータ:', insertResult);
    
    // 挿入されたデータの構造を確認
    if (insertResult && insertResult.length > 0) {
      const insertedRecord = insertResult[0];
      console.log('🔍 挿入されたレコードの構造:');
      Object.keys(insertedRecord).forEach(key => {
        console.log(`  - ${key}: ${insertedRecord[key]} (${typeof insertedRecord[key]})`);
      });
    }
    
    // テストデータを削除
    console.log('🧹 テストデータの削除...');
    const { error: deleteError } = await supabase
      .from('game_progress')
      .delete()
      .eq('school_id', testSchoolId);
    
    if (deleteError) {
      console.error('⚠️ テストデータ削除エラー:', deleteError);
    } else {
      console.log('✅ テストデータ削除完了');
    }
    
    console.log('✅ テスト挿入完了');
    
  } catch (error) {
    console.error('❌ テスト挿入中にエラーが発生:', error);
  }
}

testGameProgressInsert();
