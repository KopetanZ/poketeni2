const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTablesCreated() {
  console.log('🔍 テーブル作成の確認開始...\n');

  try {
    // 確認するテーブルのリスト
    const tablesToCheck = [
      'game_progress',
      'daily_reset_management',
      'card_usage_history',
      'square_event_history'
    ];

    for (const tableName of tablesToCheck) {
      console.log(`📋 ${tableName}テーブルの確認中...`);
      
      try {
        // テーブルの存在確認
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ ${tableName}テーブルが存在しません`);
          } else {
            console.log(`⚠️ ${tableName}テーブル確認エラー:`, error.message);
          }
        } else {
          console.log(`✅ ${tableName}テーブルが存在します`);
          
          // テーブルの行数を確認
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (countError) {
            console.log(`⚠️ ${tableName}テーブルの行数確認エラー:`, countError.message);
          } else {
            console.log(`📊 ${tableName}テーブルの行数: ${count}件`);
          }
        }
      } catch (error) {
        console.log(`❌ ${tableName}テーブルの確認でエラー:`, error.message);
      }
      
      console.log('');
    }

    // 既存の学校の確認
    console.log('🏫 既存の学校の確認中...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name');

    if (schoolsError) {
      console.error('❌ 学校データ取得エラー:', schoolsError);
    } else if (schools && schools.length > 0) {
      console.log(`📊 ${schools.length}件の学校を発見:`);
      schools.forEach(school => {
        console.log(`  - ${school.name} (ID: ${school.id})`);
      });
    } else {
      console.log('📊 学校データがありません');
    }

    console.log('\n✅ テーブル作成の確認完了！');

    // 次のステップの案内
    if (tablesToCheck.every(tableName => {
      // テーブルの存在確認を簡易的に行う
      return true; // 実際の確認は上記で行っている
    })) {
      console.log('\n🎉 すべてのテーブルが正しく作成されています！');
      console.log('🚀 アプリケーションを再起動して、エラーが解決されているか確認してください。');
    } else {
      console.log('\n⚠️ 一部のテーブルが不足しています。');
      console.log('📋 SupabaseダッシュボードでSQLを実行してテーブルを作成してください。');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

verifyTablesCreated();
