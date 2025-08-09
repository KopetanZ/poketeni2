// 直接データベースに学校を作成してテストする
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectInsert() {
  console.log('🔍 直接INSERT テスト開始...');
  
  // テスト用のUUID生成
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const testUserId = generateUUID();
  console.log('テスト用ユーザーID:', testUserId);

  try {
    // 1. RLSポリシーの状態確認
    const { data: policies, error: policyError } = await supabase
      .from('schools')
      .select('*')
      .limit(0);

    console.log('RLS確認結果:', { policies, policyError });

    // 2. 直接INSERT
    console.log('学校データ挿入中...');
    const { data: newSchool, error: createError } = await supabase
      .from('schools')
      .insert({
        user_id: testUserId,
        name: 'テスト高校',
        reputation: 0,
        funds: 1000,
        current_year: 2024,
        current_month: 4,
        current_day: 1
      })
      .select()
      .single();

    console.log('挿入結果:', { newSchool, createError });

    if (createError) {
      console.error('❌ 挿入エラー:', createError);
      console.error('エラー詳細:', JSON.stringify(createError, null, 2));
      return;
    }

    console.log('✅ 学校作成成功:', newSchool);

    // 3. クリーンアップ
    const { error: deleteError } = await supabase
      .from('schools')
      .delete()
      .eq('id', newSchool.id);

    if (deleteError) {
      console.error('⚠️ クリーンアップエラー:', deleteError);
    } else {
      console.log('✅ テストデータ削除完了');
    }

  } catch (err) {
    console.error('💥 予期しないエラー:', err);
  }
}

testDirectInsert();