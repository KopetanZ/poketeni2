const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExistingGameProgress() {
  console.log('🔍 既存のgame_progressテーブルの構造確認開始...');
  
  try {
    // テーブルの存在確認
    const { data: existingTable, error: checkError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(1);
    
    if (checkError) {
      if (checkError.code === '42P01') {
        console.log('❌ game_progressテーブルが存在しません');
        return;
      } else {
        console.error('❌ テーブル確認エラー:', checkError);
        return;
      }
    }
    
    console.log('✅ game_progressテーブルが存在します');
    
    // 最小限のデータで挿入テスト
    console.log('\n📊 最小限のデータで挿入テスト...');
    
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testSchoolId = `test_school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 基本的なフィールドのみでテスト
    const { data: insertData, error: insertError } = await supabase
      .from('game_progress')
      .insert({
        id: testId,
        school_id: testSchoolId
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ 最小限データ挿入エラー:', insertError);
      console.error('エラー詳細:', JSON.stringify(insertError, null, 2));
      
      // エラーメッセージから必要なカラムを推測
      if (insertError.message.includes('column')) {
        console.log('\n💡 エラーメッセージから、以下のカラムが必要かもしれません:');
        console.log('- id (PRIMARY KEY)');
        console.log('- school_id (NOT NULL)');
        console.log('- その他の必須カラム');
      }
    } else {
      console.log('✅ 最小限データ挿入成功');
      console.log('挿入されたデータ:', insertData);
      
      // テストデータを削除
      const { error: deleteError } = await supabase
        .from('game_progress')
        .delete()
        .eq('id', testId);
      
      if (deleteError) {
        console.error('⚠️ テストデータ削除エラー:', deleteError);
      } else {
        console.log('✅ テストデータ削除完了');
      }
    }
    
    // 既存のレコード数を確認
    const { count, error: countError } = await supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ レコード数確認エラー:', countError);
    } else {
      console.log(`📊 現在のレコード数: ${count || 0}`);
    }
    
    console.log('\n💡 既存のテーブル構造に合わせて、コードを修正する必要があります');
    
  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error);
  }
}

// スクリプト実行
checkExistingGameProgress()
  .then(() => {
    console.log('\n🎉 既存テーブル構造確認完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  });
