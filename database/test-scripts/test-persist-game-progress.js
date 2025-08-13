const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testPersistGameProgress() {
  console.log('🧪 persistGameProgress関数の動作テストを開始...');
  
  try {
    // 1. 現在のgame_progressテーブルの状況を確認
    console.log('\n📋 現在のgame_progressテーブルの状況:');
    
    const { data: currentProgress, error: currentError } = await supabase
      .from('game_progress')
      .select('*');
    
    if (currentError) {
      console.error('❌ 現在の状況確認エラー:', currentError);
      return;
    }
    
    console.log('✅ 現在のレコード数:', currentProgress?.length || 0);
    if (currentProgress && currentProgress.length > 0) {
      const firstRecord = currentProgress[0];
      console.log('📊 最初のレコード:');
      console.log('  - ID:', firstRecord.id);
      console.log('  - school_id:', firstRecord.school_id);
      console.log('  - 現在の日付:', `${firstRecord.current_game_date_year}/${firstRecord.current_game_date_month}/${firstRecord.current_game_date_day}`);
      console.log('  - total_days_played:', firstRecord.total_days_played);
      console.log('  - updated_at:', firstRecord.updated_at);
    }
    
    // 2. テスト用のデータで更新を試行
    if (currentProgress && currentProgress.length > 0) {
      const testRecord = currentProgress[0];
      const testSchoolId = testRecord.school_id;
      
      console.log(`\n🧪 school_id "${testSchoolId}" でテスト更新を実行...`);
      
      const testProgressData = {
        school_id: testSchoolId,
        current_position: 5,
        total_progress: 5,
        hand_cards_count: 4,
        max_hand_size: 5,
        cards_used_today: 1,
        total_moves: 5,
        current_game_date_year: 2024,
        current_game_date_month: 4,
        current_game_date_day: 16,
        last_game_date_year: 2024,
        last_game_date_month: 4,
        last_game_date_day: 16,
        total_days_played: 15,
        consecutive_days_played: 15,
        last_play_date: new Date().toISOString()
      };
      
      console.log('📝 テスト用データ:', testProgressData);
      
      // 更新操作を実行
      const { data: updateResult, error: updateError } = await supabase
        .from('game_progress')
        .update(testProgressData)
        .eq('id', testRecord.id)
        .select();
      
      if (updateError) {
        console.error('❌ テスト更新エラー:', updateError);
        console.error('❌ エラーコード:', updateError.code);
        console.error('❌ エラーメッセージ:', updateError.message);
      } else {
        console.log('✅ テスト更新成功:', updateResult);
        
        // 更新後のデータを確認
        const { data: updatedRecord, error: verifyError } = await supabase
          .from('game_progress')
          .select('*')
          .eq('id', testRecord.id)
          .single();
        
        if (verifyError) {
          console.error('❌ 更新確認エラー:', verifyError);
        } else {
          console.log('✅ 更新後のデータ:');
          console.log('  - 現在の日付:', `${updatedRecord.current_game_date_year}/${updatedRecord.current_game_date_month}/${updatedRecord.current_game_date_day}`);
          console.log('  - total_days_played:', updatedRecord.total_days_played);
          console.log('  - updated_at:', updatedRecord.updated_at);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// スクリプト実行
testPersistGameProgress();
