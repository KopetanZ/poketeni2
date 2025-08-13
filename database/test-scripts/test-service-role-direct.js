// service_roleキーを直接テスト（dotenvなし）
const { createClient } = require('@supabase/supabase-js');

// 環境変数から読み込み（手動で設定する場合）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 service_roleキーのテスト開始...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceKey ? '✅ 設定済み' : '❌ 未設定');

if (!supabaseServiceKey) {
  console.log('\n❌ SUPABASE_SERVICE_ROLE_KEYが設定されていません');
  console.log('以下の手順で設定してください：');
  console.log('1. Supabaseダッシュボード → Settings → API');
  console.log('2. service_role secret keyをコピー');
  console.log('3. 環境変数として設定');
  console.log('\nまたは、このスクリプト内で直接設定してください');
  
  // ここで直接キーを設定（テスト用）
  console.log('\n🔄 テスト用に直接キーを設定します...');
  // const testServiceKey = 'your-actual-service-role-key-here';
  // console.log('テスト用キーを設定してください');
  
  process.exit(1);
}

// Supabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testServiceRoleAccess() {
  try {
    console.log('\n🚀 service_roleキーでのアクセステスト...');
    
    // 1. 基本的な接続テスト
    console.log('🔌 接続テスト中...');
    
    // 2. event_historyテーブルのRLSポリシー状況を確認
    console.log('📊 event_historyテーブルのRLSポリシー状況を確認中...');
    
    // 直接SQLクエリでポリシー情報を取得
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'event_history'
          ORDER BY policyname;
        `
      });
    
    if (policiesError) {
      console.log('⚠️ ポリシー状況確認エラー:', policiesError.message);
      console.log('exec_sql関数が利用できない可能性があります');
      
      // 代替方法：テーブル構造を確認
      console.log('\n🔄 代替方法でテーブル構造を確認中...');
      
      const { data: tableInfo, error: tableError } = await supabase
        .from('event_history')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log('⚠️ テーブルアクセスエラー:', tableError.message);
      } else {
        console.log('✅ event_historyテーブルにアクセス可能');
        console.log('テーブル構造:', Object.keys(tableInfo[0] || {}));
      }
    } else {
      console.log('📋 現在のRLSポリシー:');
      console.log(policies);
    }
    
    // 3. テストデータの挿入を試行
    console.log('\n📝 テストデータ挿入テスト...');
    
    const testEventData = {
      school_id: 'test_school_id',
      event_type: 'seasonal',
      event_id: 'test_event_001',
      event_name: 'テストイベント',
      description: 'service_roleキーでのテスト挿入',
      source: 'manual',
      event_date_year: 2024,
      event_date_month: 4,
      event_date_day: 1
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('event_history')
      .insert(testEventData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ テストデータ挿入エラー:', insertError.message);
      console.log('エラーコード:', insertError.code);
      
      if (insertError.code === '42501') {
        console.log('\n🔒 RLSポリシー違反エラーが発生しています');
        console.log('これは、RLSポリシーがまだ適切に設定されていないことを示しています');
      }
    } else {
      console.log('✅ テストデータ挿入成功:', insertResult);
      
      // テストデータを削除
      await supabase.from('event_history').delete().eq('id', insertResult.id);
      console.log('🧹 テストデータを削除しました');
    }
    
    console.log('\n🎉 service_roleキーでのアクセステスト完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

testServiceRoleAccess();
