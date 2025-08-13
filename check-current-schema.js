// 現在のデータベーススキーマ確認スクリプト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentSchema() {
  console.log('🔍 現在のデータベーススキーマ確認開始...');
  
  try {
    // 1. playersテーブルの構造確認
    console.log('\n📊 playersテーブルの構造確認中...');
    
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (playersError) {
      console.log('❌ playersテーブルアクセスエラー:', playersError.message);
      return;
    }
    
    let hasStatGages = false;
    let hasGrowthEfficiency = false;
    
    if (players && players.length > 0) {
      const player = players[0];
      console.log('✅ playersテーブルにアクセス可能');
      console.log('現在のカラム:', Object.keys(player));
      
      // ステータスゲージ関連のカラムを確認
      hasStatGages = 'stat_gages' in player;
      hasGrowthEfficiency = 'growth_efficiency' in player;
      
      console.log('\n📋 ステータスゲージシステム関連カラム:');
      console.log(`- stat_gages: ${hasStatGages ? '✅ 存在' : '❌ 未存在'}`);
      console.log(`- growth_efficiency: ${hasGrowthEfficiency ? '✅ 存在' : '❌ 未存在'}`);
      
      if (hasStatGages) {
        console.log('  stat_gagesの内容:', player.stat_gages);
      }
      
      if (hasGrowthEfficiency) {
        console.log('  growth_efficiencyの内容:', player.growth_efficiency);
      }
      
      // 既存のスキル関連カラムを確認
      const skillColumns = ['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental', 'stamina'];
      console.log('\n🎯 既存のスキル関連カラム:');
      skillColumns.forEach(column => {
        const exists = column in player;
        const value = player[column];
        console.log(`- ${column}: ${exists ? '✅' : '❌'} (値: ${value})`);
      });
      
    } else {
      console.log('⚠️ playersテーブルにデータがありません');
      console.log('テーブルは存在しますが、データが挿入されていない可能性があります');
      
      // テーブル構造を推測
      console.log('\n📋 テーブル構造の推測:');
      console.log('基本的なテーブル構造は存在するが、データがない状態です');
      console.log('ステータスゲージシステムのカラム追加が必要です');
    }
    
    // 2. テーブル一覧の確認（可能であれば）
    console.log('\n📋 利用可能なテーブル確認中...');
    
    try {
      // 既知のテーブルを確認
      const knownTables = ['schools', 'players', 'hand_cards', 'event_history', 'items'];
      const tableStatus = {};
      
      for (const tableName of knownTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('count')
            .limit(1);
          
          tableStatus[tableName] = error ? '❌ エラー' : '✅ アクセス可能';
        } catch (err) {
          tableStatus[tableName] = '❌ 例外';
        }
      }
      
      console.log('テーブル状況:');
      Object.entries(tableStatus).forEach(([table, status]) => {
        console.log(`- ${table}: ${status}`);
      });
      
    } catch (err) {
      console.log('⚠️ テーブル一覧確認でエラー:', err.message);
    }
    
    // 3. 次のステップの提案
    console.log('\n🚀 次のステップ:');
    
    if (!hasStatGages || !hasGrowthEfficiency) {
      console.log('1. ステータスゲージシステムのカラム追加が必要です');
      console.log('2. Supabaseダッシュボードから直接SQLを実行するか、');
      console.log('3. service role keyを使用してスクリプトを実行してください');
      
      console.log('\n📝 実行が必要なSQL:');
      console.log(`
-- ステータスゲージカラム追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS stat_gages JSONB DEFAULT '{
  "serve_skill_gage": 0,
  "return_skill_gage": 0,
  "volley_skill_gage": 0,
  "stroke_skill_gage": 0,
  "mental_gage": 0,
  "stamina_gage": 0
}'::jsonb;

-- 成長効率カラム追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS growth_efficiency JSONB DEFAULT '{
  "serve_skill_efficiency": 0.1,
  "return_skill_efficiency": 0.1,
  "volley_skill_efficiency": 0.05,
  "stroke_skill_efficiency": 0.15,
  "mental_efficiency": 0.2,
  "stamina_efficiency": 0.25
}'::jsonb;
      `);
      
      console.log('\n🌐 Supabaseダッシュボードでの実行方法:');
      console.log('1. https://supabase.com/dashboard にアクセス');
      console.log('2. プロジェクトを選択');
      console.log('3. SQL Editor → New Query');
      console.log('4. 上記のSQLをコピー&ペーストして実行');
      
    } else {
      console.log('✅ ステータスゲージシステムは既に適用されています');
      console.log('アプリケーションを起動して動作確認ができます');
    }
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

checkCurrentSchema();
