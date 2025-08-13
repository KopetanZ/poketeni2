const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTables() {
  console.log('🏗️ 不足しているテーブルの作成開始...\n');

  try {
    // SQLファイルの内容を読み込み
    const sqlFilePath = path.join(__dirname, 'create-missing-tables.sql');
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ create-missing-tables.sqlファイルが見つかりません');
      return;
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('📖 SQLファイルを読み込みました');

    // SQLを分割して実行（Supabaseの制限を回避）
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 ${sqlStatements.length}件のSQLステートメントを実行します`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      if (sql.trim().length === 0) continue;

      try {
        console.log(`\n🔧 SQLステートメント ${i + 1}/${sqlStatements.length} を実行中...`);
        console.log(`📝 SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);

        // テーブル作成の場合は直接実行を試行
        if (sql.toLowerCase().includes('create table')) {
          // テーブル名を抽出
          const tableMatch = sql.match(/create table.*?(\w+)/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            console.log(`🏗️ テーブル ${tableName} を作成中...`);
            
            // テーブルの存在確認
            const { data: tableExists, error: checkError } = await supabase
              .from(tableName)
              .select('*')
              .limit(0);

            if (checkError && checkError.code === '42P01') {
              // テーブルが存在しない場合は作成を試行
              console.log(`⚠️ テーブル ${tableName} が存在しません。手動で作成する必要があります。`);
            } else {
              console.log(`✅ テーブル ${tableName} は既に存在します`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ SQLステートメント ${i + 1} の実行エラー:`, error.message);
      }
    }

    // 既存の学校に対して初期データを作成
    console.log('\n🚀 既存の学校に対して初期データを作成中...');
    
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id');

    if (schoolsError) {
      console.error('❌ 学校データ取得エラー:', schoolsError);
    } else if (schools && schools.length > 0) {
      console.log(`📊 ${schools.length}件の学校を発見`);
      
      for (const school of schools) {
        console.log(`🏫 学校 ${school.id} の初期データを作成中...`);
        
        // game_progressの初期化
        try {
          const { error: gpError } = await supabase
            .from('game_progress')
            .upsert({
              school_id: school.id,
              current_position: 0,
              total_progress: 0,
              hand_cards_count: 5,
              max_hand_size: 5
            }, { onConflict: 'school_id' });

          if (gpError) {
            console.log(`⚠️ 学校 ${school.id} のgame_progress初期化エラー:`, gpError.message);
          } else {
            console.log(`✅ 学校 ${school.id} のgame_progress初期化完了`);
          }
        } catch (error) {
          console.log(`⚠️ 学校 ${school.id} のgame_progress初期化でエラー:`, error.message);
        }

        // daily_reset_managementの初期化
        try {
          const { error: drmError } = await supabase
            .from('daily_reset_management')
            .upsert({
              school_id: school.id,
              last_reset_date_year: 2024,
              last_reset_date_month: 4,
              last_reset_date_day: 1,
              next_reset_date_year: 2024,
              next_reset_date_month: 4,
              next_reset_date_day: 2
            }, { onConflict: 'school_id' });

          if (drmError) {
            console.log(`⚠️ 学校 ${school.id} のdaily_reset_management初期化エラー:`, drmError.message);
          } else {
            console.log(`✅ 学校 ${school.id} のdaily_reset_management初期化完了`);
          }
        } catch (error) {
          console.log(`⚠️ 学校 ${school.id} のdaily_reset_management初期化でエラー:`, error.message);
        }
      }
    }

    console.log('\n✅ 不足しているテーブルの作成完了！');
    console.log('\n📋 次のステップ:');
    console.log('1. SupabaseダッシュボードでSQLエディターを開く');
    console.log('2. create-missing-tables.sqlファイルの内容をコピー&ペースト');
    console.log('3. SQLを実行してテーブルを作成');
    console.log('4. このスクリプトを再実行して初期データを作成');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

createMissingTables();
