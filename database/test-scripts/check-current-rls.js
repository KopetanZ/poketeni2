// 現在のRLSポリシーの状況を確認
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentRLS() {
  console.log('🔍 現在のRLSポリシーの状況確認開始...');
  
  try {
    // 1. テーブルのRLS状況を確認
    console.log('\n📊 テーブルのRLS状況:');
    
    const tables = ['schools', 'players', 'hand_cards'];
    for (const table of tables) {
      try {
        // 基本的なアクセステスト
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table} テーブルアクセスエラー:`, error.message);
        } else {
          console.log(`✅ ${table} テーブルアクセス成功`);
        }
      } catch (err) {
        console.log(`❌ ${table} テーブルエラー:`, err.message);
      }
    }

    // 2. 認証テスト用のユーザーを作成して、実際のデータ挿入をテスト
    console.log('\n👤 認証テスト用ユーザー作成...');
    
    const testEmail = `test-rls-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log('❌ 認証テストユーザー作成エラー:', authError.message);
      return;
    }
    
    console.log('✅ 認証テストユーザー作成成功:', authData.user?.id);
    
    // 3. 認証されたユーザーでschoolsテーブルに挿入を試行
    console.log('\n🏫 認証ユーザーでの学校データ作成テスト...');
    
    const schoolId = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('生成された学校ID:', schoolId);
    
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        id: schoolId,
        user_id: authData.user.id,
        name: 'RLSテスト高校',
        reputation: 0,
        funds: 1000,
        current_year: 2024,
        current_month: 4,
        current_day: 1
      })
      .select()
      .single();
    
    if (schoolError) {
      console.log('❌ 学校データ作成エラー:', schoolError.message);
      console.log('エラーコード:', schoolError.code);
      console.log('エラー詳細:', schoolError);
      
      // エラーの詳細分析
      if (schoolError.code === '42501') {
        console.log('\n🔒 RLSポリシー違反エラーが発生しています');
        console.log('これは、現在のRLSポリシーが適切に設定されていないことを示しています');
        console.log('RLSポリシーを修正する必要があります');
      }
    } else {
      console.log('✅ 学校データ作成成功:', schoolData);
      
      // 成功した場合は、テストデータを削除
      await supabase.from('schools').delete().eq('id', schoolId);
      console.log('🧹 テストデータを削除しました');
    }
    
    // 4. テストユーザーを削除
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('テストユーザーを削除しました');
    
    console.log('\n🎉 RLS状況確認完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

checkCurrentRLS();
