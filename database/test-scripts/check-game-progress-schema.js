require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkGameProgressSchema() {
  console.log('🔍 game_progressテーブルのスキーマとデータを確認中...');
  
  try {
    // 1. テーブルの構造確認
    console.log('\n📋 テーブル構造の確認:');
    
    const { data: structure, error: structureError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(0);
    
    if (structureError) {
      console.error('❌ テーブル構造確認エラー:', structureError);
      return;
    }
    
    // 2. 実際のデータを取得してスキーマを推測
    console.log('\n📋 実際のデータからスキーマを推測:');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ サンプルデータ取得エラー:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ サンプルデータを取得:', sampleData.length, '件');
      
      // 最初のレコードの構造を表示
      const firstRecord = sampleData[0];
      console.log('\n📊 最初のレコードの構造:');
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const type = typeof value;
        const isNull = value === null;
        console.log(`  - ${key}: ${type}${isNull ? ' (NULL)' : ''} = ${JSON.stringify(value)}`);
      });
      
      // 日付関連のカラムを確認
      const dateColumns = Object.keys(firstRecord).filter(key => 
        key.includes('date') || key.includes('year') || key.includes('month') || key.includes('day')
      );
      
      if (dateColumns.length > 0) {
        console.log('\n📅 日付関連のカラム:');
        dateColumns.forEach(col => {
          console.log(`  - ${col}: ${firstRecord[col]}`);
        });
      }
      
    } else {
      console.log('ℹ️ game_progressテーブルにデータがありません');
    }
    
    // 3. レコード数の確認
    console.log('\n📊 レコード数の確認:');
    
    const { count, error: countError } = await supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ レコード数確認エラー:', countError);
    } else {
      console.log(`✅ 総レコード数: ${count}件`);
    }
    
    // 4. 特定のschool_idのデータを確認
    console.log('\n🔍 特定のschool_idのデータ確認:');
    
    // まずschoolsテーブルからschool_idを取得
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, user_id')
      .limit(3);
    
    if (schoolsError) {
      console.error('❌ schoolsテーブル取得エラー:', schoolsError);
    } else if (schools && schools.length > 0) {
      console.log('📋 利用可能なschool_id:');
      schools.forEach(school => {
        console.log(`  - ${school.id}: ${school.name} (user_id: ${school.user_id})`);
      });
      
      // 最初のschool_idでgame_progressを確認
      const firstSchoolId = schools[0].id;
      console.log(`\n🔍 school_id "${firstSchoolId}" のgame_progressデータ:`);
      
      const { data: schoolProgress, error: progressError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('school_id', firstSchoolId);
      
      if (progressError) {
        console.error('❌ 特定school_idのデータ取得エラー:', progressError);
      } else if (schoolProgress && schoolProgress.length > 0) {
        console.log('✅ データを取得:', schoolProgress.length, '件');
        schoolProgress.forEach((progress, index) => {
          console.log(`\n  📊 レコード ${index + 1}:`);
          Object.keys(progress).forEach(key => {
            const value = progress[key];
            console.log(`    - ${key}: ${JSON.stringify(value)}`);
          });
        });
      } else {
        console.log('ℹ️ このschool_idのgame_progressデータはありません');
      }
    }
    
  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error);
  }
}

// スクリプト実行
checkGameProgressSchema();
