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

async function checkCurrentGameProgressSchema() {
  try {
    console.log('🔍 game_progressテーブルの現在の構造確認開始...');
    
    // 1. 実際のデータサンプルを取得して構造を推測
    const { data: sampleData, error: sampleError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('❌ サンプルデータの取得に失敗:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('\n📊 実際のデータサンプル:');
      sampleData.forEach((record, index) => {
        console.log(`\n--- レコード ${index + 1} ---`);
        console.log(JSON.stringify(record, null, 2));
      });
      
      // 最初のレコードから構造を推測
      const firstRecord = sampleData[0];
      console.log('\n🔍 推測されるテーブル構造:');
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const type = value === null ? 'NULL' : 
                   typeof value === 'number' ? 'INTEGER' :
                   typeof value === 'string' ? 'TEXT' :
                   typeof value === 'boolean' ? 'BOOLEAN' :
                   typeof value === 'object' ? 'JSONB' : 'UNKNOWN';
        console.log(`  ${key}: ${type} = ${value}`);
      });
    } else {
      console.log('\n⚠️ game_progressテーブルにデータがありません');
    }
    
    // 2. レコード数を確認
    const { count, error: countError } = await supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ レコード数の確認に失敗:', countError);
    } else {
      console.log(`\n📈 現在のレコード数: ${count || 0}`);
    }
    
    // 3. schoolsテーブルのデータも確認
    console.log('\n🔗 schoolsテーブルのデータ確認...');
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .limit(2);
    
    if (schoolError) {
      console.error('❌ schoolsテーブルのデータ取得に失敗:', schoolError);
    } else if (schoolData && schoolData.length > 0) {
      console.log('📋 schoolsテーブルのデータサンプル:');
      schoolData.forEach((record, index) => {
        console.log(`\n--- 学校レコード ${index + 1} ---`);
        console.log(JSON.stringify(record, null, 2));
      });
    } else {
      console.log('⚠️ schoolsテーブルにデータがありません');
    }
    
    // 4. 特定のフィールドの存在確認
    console.log('\n🔍 特定フィールドの存在確認...');
    const testFields = [
      'total_days_played',
      'current_game_date_year',
      'current_game_date_month', 
      'current_game_date_day',
      'day_of_week'
    ];
    
    for (const field of testFields) {
      try {
        const { data, error } = await supabase
          .from('game_progress')
          .select(field)
          .limit(1);
        
        if (error) {
          console.log(`  ${field}: ❌ 存在しない (${error.message})`);
        } else {
          console.log(`  ${field}: ✅ 存在する`);
        }
      } catch (err) {
        console.log(`  ${field}: ❌ エラー (${err.message})`);
      }
    }
    
  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error);
  }
}

// スクリプト実行
checkCurrentGameProgressSchema()
  .then(() => {
    console.log('\n✅ スキーマ確認完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  });
