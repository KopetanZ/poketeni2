const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createGameProgressTable() {
  console.log('🔍 game_progressテーブル作成開始...');
  
  try {
    // テーブルが存在するかチェック
    const { data: existingTable, error: checkError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ game_progressテーブルは既に存在します');
      return;
    }
    
    if (checkError.code === '42P01') {
      console.log('📋 game_progressテーブルが存在しないため、手動で作成してください');
      console.log('🌐 Supabaseダッシュボードで以下のSQLを実行してください:');
      
      const fs = require('fs');
      const sqlScript = fs.readFileSync('create-game-progress-table.sql', 'utf8');
      console.log('\n' + sqlScript);
      
      console.log('\n💡 または、以下の手順で作成してください:');
      console.log('1. https://supabase.com/dashboard にアクセス');
      console.log('2. プロジェクトを選択');
      console.log('3. SQL Editor → New Query');
      console.log('4. 上記のSQLをコピー&ペーストして実行');
    } else {
      console.error('❌ テーブル確認エラー:', checkError);
    }
    
  } catch (error) {
    console.error('❌ game_progressテーブル確認エラー:', error);
    
    if (error.message.includes('relation "game_progress" does not exist')) {
      console.log('📋 game_progressテーブルが存在しないため、手動で作成してください');
      console.log('🌐 Supabaseダッシュボードで以下のSQLを実行してください:');
      
      const fs = require('fs');
      const sqlScript = fs.readFileSync('create-game-progress-table.sql', 'utf8');
      console.log('\n' + sqlScript);
    }
  }
}

// スクリプト実行
createGameProgressTable()
  .then(() => {
    console.log('🎉 スクリプト実行完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  });
