// RLSポリシーの状況確認と修正テスト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSPolicies() {
  console.log('🔍 RLSポリシーの状況確認開始...');
  
  try {
    // 1. 現在のポリシー状況を確認
    console.log('\n📊 現在のRLSポリシー状況:');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_info');
    
    if (policiesError) {
      console.log('ポリシー情報の取得に失敗（これは正常）:', policiesError.message);
    } else {
      console.log('ポリシー情報:', policies);
    }

    // 2. テーブルのRLS状況を確認
    console.log('\n🔒 テーブルのRLS状況:');
    
    const tables = ['schools', 'players', 'hand_cards'];
    for (const table of tables) {
      try {
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

    // 3. 認証テスト用のユーザー作成（テスト用）
    console.log('\n👤 認証テスト...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log('❌ 認証テストユーザー作成エラー:', authError.message);
    } else {
      console.log('✅ 認証テストユーザー作成成功:', authData.user?.id);
      
      // テストユーザーでschoolsテーブルに挿入を試行
      console.log('\n🏫 学校データ作成テスト...');
      
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          user_id: authData.user.id,
          name: 'テスト高校',
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
        console.log('エラー詳細:', schoolError);
      } else {
        console.log('✅ 学校データ作成成功:', schoolData);
        
        // テストデータを削除
        await supabase
          .from('schools')
          .delete()
          .eq('id', schoolData.id);
        console.log('🧹 テストデータを削除しました');
      }
      
      // テストユーザーを削除
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('🧹 テストユーザーを削除しました');
    }

    console.log('\n🎉 RLSポリシーテスト完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

testRLSPolicies();
