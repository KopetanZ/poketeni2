// event_historyテーブルのRLSポリシーを確認し、データ挿入テストを行う
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6Im9ub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEventHistoryRLS() {
  console.log('🔍 event_historyテーブルのRLSポリシー確認開始...');
  
  try {
    // 1. 認証テスト用ユーザーを作成
    console.log('\n👤 認証テスト用ユーザー作成...');
    
    const testEmail = `test-event-${Date.now()}@example.com`;
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
    
    // 2. 学校データを作成
    console.log('\n🏫 学校データ作成...');
    
    const schoolId = `school_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('生成された学校ID:', schoolId);
    
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        id: schoolId,
        user_id: authData.user.id,
        name: 'イベント履歴テスト高校',
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
      return;
    }
    
    console.log('✅ 学校データ作成成功:', schoolData);
    
    // 3. event_historyテーブルにデータ挿入を試行
    console.log('\n📝 event_historyテーブルへのデータ挿入テスト...');
    
    const eventData = {
      school_id: schoolId,
      event_type: 'seasonal',
      event_id: 'test_event_001',
      event_name: 'テストイベント',
      description: 'RLSポリシーテスト用のイベント',
      source: 'manual',
      event_date_year: 2024,
      event_date_month: 4,
      event_date_day: 1
    };
    
    console.log('挿入しようとしているデータ:', eventData);
    
    const { data: eventDataResult, error: eventError } = await supabase
      .from('event_history')
      .insert(eventData)
      .select()
      .single();
    
    if (eventError) {
      console.log('❌ event_historyデータ挿入エラー:', eventError.message);
      console.log('エラーコード:', eventError.code);
      console.log('エラー詳細:', eventError);
      
      if (eventError.code === '42501') {
        console.log('\n🔒 RLSポリシー違反エラーが発生しています');
        console.log('event_historyテーブルのRLSポリシーを修正する必要があります');
      }
    } else {
      console.log('✅ event_historyデータ挿入成功:', eventDataResult);
    }
    
    // 4. テストデータを削除
    console.log('\n🧹 テストデータを削除...');
    
    if (eventDataResult) {
      await supabase.from('event_history').delete().eq('id', eventDataResult.id);
      console.log('event_historyテストデータを削除しました');
    }
    
    await supabase.from('schools').delete().eq('id', schoolId);
    console.log('学校テストデータを削除しました');
    
    // 5. テストユーザーを削除
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('テストユーザーを削除しました');
    
    console.log('\n🎉 event_history RLS確認完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

checkEventHistoryRLS();
