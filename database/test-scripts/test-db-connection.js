// Supabase接続とテーブル確認テスト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Supabase接続テスト開始...');
  
  try {
    // 1. 基本的な接続テスト
    const { data, error } = await supabase
      .from('schools')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 接続エラー:', error.message);
      return;
    }
    
    console.log('✅ Supabase接続成功');

    // 2. テーブル構造確認
    console.log('\n📊 テーブル確認中...');
    
    // schoolsテーブル
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .limit(1);
    
    if (!schoolsError) {
      console.log('✅ schools テーブル存在確認');
    } else {
      console.log('❌ schools テーブルエラー:', schoolsError.message);
    }

    // playersテーブル
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (!playersError) {
      console.log('✅ players テーブル存在確認');
    } else {
      console.log('❌ players テーブルエラー:', playersError.message);
    }

    // hand_cardsテーブル
    const { data: cards, error: cardsError } = await supabase
      .from('hand_cards')
      .select('*')
      .limit(1);
    
    if (!cardsError) {
      console.log('✅ hand_cards テーブル存在確認');
    } else {
      console.log('❌ hand_cards テーブルエラー:', cardsError.message);
    }

    console.log('\n🎉 データベース準備完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

testConnection();