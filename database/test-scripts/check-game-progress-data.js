const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGameProgressData() {
  try {
    console.log('🔍 game_progressテーブルのデータ調査開始...');
    
    // 1. 現在のレコード数を確認
    const { count, error: countError } = await supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ レコード数の確認に失敗:', countError);
      return;
    }
    
    console.log(`📊 現在のレコード数: ${count || 0}`);
    
    // 2. 実際のデータを取得
    if (count > 0) {
      const { data: records, error: recordsError } = await supabase
        .from('game_progress')
        .select('*');
      
      if (recordsError) {
        console.error('❌ データの取得に失敗:', recordsError);
        return;
      }
      
      console.log('\n📋 実際のデータ:');
      records.forEach((record, index) => {
        console.log(`\n--- レコード ${index + 1} ---`);
        console.log(JSON.stringify(record, null, 2));
      });
    }
    
    // 3. schoolsテーブルのデータも確認
    console.log('\n🔗 schoolsテーブルのデータ確認...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    if (schoolsError) {
      console.error('❌ schoolsテーブルのデータ取得に失敗:', schoolsError);
    } else if (schools && schools.length > 0) {
      console.log(`📋 schoolsテーブルのレコード数: ${schools.length}`);
      schools.forEach((school, index) => {
        console.log(`\n--- 学校 ${index + 1} ---`);
        console.log(JSON.stringify(school, null, 2));
      });
    } else {
      console.log('⚠️ schoolsテーブルにデータがありません');
    }
    
    // 4. upsertのテスト（school_idでの競合をテスト）
    console.log('\n🧪 upsertのテスト開始...');
    
    // テスト用のschool_idを取得
    let testSchoolId = null;
    if (schools && schools.length > 0) {
      testSchoolId = schools[0].id;
      console.log(`テスト用のschool_id: ${testSchoolId}`);
      
      // テストデータを挿入
      const testData = {
        school_id: testSchoolId,
        current_position: 999,
        total_progress: 999,
        hand_cards_count: 999,
        max_hand_size: 999,
        cards_used_today: 999,
        total_moves: 999,
        current_game_date_year: 9999,
        current_game_date_month: 99,
        current_game_date_day: 99,
        last_game_date_year: 9999,
        last_game_date_month: 99,
        last_game_date_day: 99,
        total_days_played: 999,
        consecutive_days_played: 999,
        last_play_date: new Date().toISOString()
      };
      
      console.log('テストデータを挿入中...');
      const { data: insertData, error: insertError } = await supabase
        .from('game_progress')
        .insert(testData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ テストデータの挿入に失敗:', insertError);
        console.log('エラー詳細:', JSON.stringify(insertError, null, 2));
      } else {
        console.log('✅ テストデータの挿入成功');
        console.log('挿入されたデータ:', JSON.stringify(insertData, null, 2));
        
        // 同じschool_idでupsertを試行
        console.log('\n同じschool_idでupsertを試行...');
        const upsertData = {
          ...testData,
          current_position: 888,
          total_days_played: 888
        };
        
        const { data: upsertResult, error: upsertError } = await supabase
          .from('game_progress')
          .upsert(upsertData, {
            onConflict: 'school_id'
          })
          .select()
          .single();
        
        if (upsertError) {
          console.error('❌ upsertに失敗:', upsertError);
          console.log('エラー詳細:', JSON.stringify(upsertError, null, 2));
        } else {
          console.log('✅ upsert成功');
          console.log('結果:', JSON.stringify(upsertResult, null, 2));
        }
        
        // テストデータを削除
        console.log('\nテストデータを削除中...');
        const { error: deleteError } = await supabase
          .from('game_progress')
          .delete()
          .eq('id', insertData.id);
        
        if (deleteError) {
          console.error('⚠️ テストデータの削除に失敗:', deleteError);
        } else {
          console.log('✅ テストデータの削除完了');
        }
      }
    } else {
      console.log('⚠️ テスト用のschool_idが取得できません');
    }
    
  } catch (error) {
    console.error('❌ データ調査エラー:', error);
  }
}

// スクリプト実行
checkGameProgressData()
  .then(() => {
    console.log('\n✅ データ調査完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  });
