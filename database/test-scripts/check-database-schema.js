// 現在のデータベーススキーマを確認
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  console.log('🔍 データベーススキーマ確認開始...');
  
  try {
    // 1. 認証テスト用のユーザーを作成
    console.log('\n👤 認証テスト用ユーザー作成...');
    
    const testEmail = `test-schema-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log('❌ 認証テストユーザー作成エラー:', authError.message);
      return;
    }
    
    console.log('✅ 認証テストユーザー作成成功:', authData.user?.id);
    
    // 2. 学校データを作成
    console.log('\n🏫 学校データ作成...');
    
    const schoolId = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        id: schoolId,
        user_id: authData.user.id,
        name: 'スキーマテスト高校',
        reputation: 0,
        funds: 1000,
        current_year: 2024,
        current_month: 4,
        current_day: 1
      })
      .select()
      .single();
    
    if (schoolError) {
      console.log('❌ 学校データ作成エラー:', schoolError.message);
      return;
    }
    
    console.log('✅ 学校データ作成成功:', schoolData);
    
    // 3. playersテーブルの構造を確認（最小限のデータで挿入テスト）
    console.log('\n🎾 playersテーブルの構造確認...');
    
    const testPlayerData = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      school_id: schoolId,
      pokemon_name: 'テストポケモン',
      pokemon_id: 1,
      level: 1,
      grade: 1,
      position: 'member',
      serve_skill: 30,
      return_skill: 30,
      volley_skill: 30,
      stroke_skill: 30,
      mental: 30,
      stamina: 30,
      condition: 'normal',
      motivation: 50,
      experience: 0
    };
    
    console.log('挿入しようとしているデータ:', testPlayerData);
    
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert(testPlayerData)
      .select()
      .single();
    
    if (playerError) {
      console.log('❌ プレイヤーデータ挿入エラー:', playerError.message);
      console.log('エラーコード:', playerError.code);
      console.log('エラー詳細:', playerError);
      
      if (playerError.code === 'PGRST204') {
        console.log('\n🔍 カラムが見つからないエラーが発生しています');
        console.log('データベーススキーマとアプリケーションコードの間に不一致があります');
      }
    } else {
      console.log('✅ プレイヤーデータ挿入成功:', playerData);
      
      // 成功した場合は、テストデータを削除
      await supabase.from('players').delete().eq('id', playerData.id);
      console.log('🧹 プレイヤーテストデータを削除しました');
    }
    
    // 4. テストデータを削除
    await supabase.from('schools').delete().eq('id', schoolId);
    console.log('🧹 学校テストデータを削除しました');
    
    // 5. テストユーザーを削除
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('テストユーザーを削除しました');
    
    console.log('\n🎉 データベーススキーマ確認完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

checkDatabaseSchema();
