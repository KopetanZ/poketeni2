// 環境変数の読み込みテスト
require('dotenv').config({ path: '.env.local' });

console.log('🔍 環境変数の読み込みテスト開始...');

// Supabase関連の環境変数を確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n📋 環境変数の状況:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 設定済み' : '❌ 未設定');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 設定済み' : '❌ 未設定');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ 設定済み' : '❌ 未設定');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ 必要な環境変数が設定されていません');
  console.log('SUPABASE_SERVICE_ROLE_KEYを使用してRLSポリシー修正をテストできません');
  process.exit(1);
}

console.log('\n✅ 環境変数が正しく設定されています');
console.log('RLSポリシー修正のテストを開始します...');

// Supabaseクライアントを作成してテスト
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testServiceRoleAccess() {
  try {
    console.log('\n🚀 service_roleキーでのアクセステスト...');
    
    // 1. 現在のRLSポリシー状況を確認
    console.log('📊 現在のRLSポリシー状況を確認中...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'event_history');
    
    if (policiesError) {
      console.log('⚠️ ポリシー状況確認エラー:', policiesError.message);
    } else {
      console.log('📋 テーブル権限情報:', policies);
    }
    
    // 2. event_historyテーブルの構造を確認
    console.log('\n🏗️ event_historyテーブルの構造を確認中...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'event_history')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('⚠️ テーブル構造確認エラー:', tableError.message);
    } else {
      console.log('📋 テーブル構造:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL可' : 'NULL不可'})`);
      });
    }
    
    console.log('\n🎉 service_roleキーでのアクセステスト完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

testServiceRoleAccess();
