// 修正されたID生成ロジックのテスト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFixedInsertion() {
  console.log('🔍 修正されたID生成ロジックのテスト開始...');
  
  try {
    // 1. テスト用ユーザーを作成
    console.log('\n👤 テスト用ユーザー作成...');
    
    const testEmail = `test-fixed-${Date.now()}@example.com`;
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
    
    // 2. 学校データ作成テスト（修正されたID生成）
    console.log('\n🏫 学校データ作成テスト（修正版）...');
    
    const schoolId = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('生成された学校ID:', schoolId);
    
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        id: schoolId,
        user_id: authData.user.id,
        name: 'テスト高校（修正版）',
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
      console.log('エラー詳細:', schoolError);
    } else {
      console.log('✅ 学校データ作成成功:', schoolData);
      
      // 3. プレイヤーデータ作成テスト
      console.log('\n🎾 プレイヤーデータ作成テスト...');
      
      const playerId = `player_${Date.now()}_0_${Math.random().toString(36).substr(2, 9)}`;
      console.log('生成されたプレイヤーID:', playerId);
      
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          school_id: schoolId,
          pokemon_name: 'ピカチュウ',
          pokemon_id: 25,
          level: 1,
          grade: 1,
          position: 'captain',
          serve_skill: 30,
          return_skill: 30,
          volley_skill: 30,
          stroke_skill: 30,
          mental: 30,
          stamina: 30,
          condition: 'normal',
          motivation: 50,
          experience: 0,
          types: ['electric'],
          special_abilities: []
        })
        .select()
        .single();
      
      if (playerError) {
        console.log('❌ プレイヤーデータ作成エラー:', playerError.message);
        console.log('エラー詳細:', playerError);
      } else {
        console.log('✅ プレイヤーデータ作成成功:', playerData);
        
        // 4. カードデータ作成テスト
        console.log('\n🃏 カードデータ作成テスト...');
        
        const cardId = `card_${Date.now()}_0_${Math.random().toString(36).substr(2, 9)}`;
        console.log('生成されたカードID:', cardId);
        
        const { data: cardData, error: cardError } = await supabase
          .from('hand_cards')
          .insert({
            id: cardId,
            school_id: schoolId,
            card_data: {
              id: 'test_card',
              name: 'テストカード',
              description: 'テスト用のカードです',
              type: 'training'
            }
          })
          .select()
          .single();
        
        if (cardError) {
          console.log('❌ カードデータ作成エラー:', cardError.message);
          console.log('エラー詳細:', cardError);
        } else {
          console.log('✅ カードデータ作成成功:', cardData);
        }
      }
      
      // 5. テストデータを削除
      console.log('\n🧹 テストデータの削除...');
      
      // プレイヤーを削除
      if (playerData) {
        await supabase.from('players').delete().eq('id', playerData.id);
        console.log('プレイヤーデータを削除しました');
      }
      
      // カードを削除
      if (cardData) {
        await supabase.from('hand_cards').delete().eq('id', cardData.id);
        console.log('カードデータを削除しました');
      }
      
      // 学校を削除
      await supabase.from('schools').delete().eq('id', schoolId);
      console.log('学校データを削除しました');
    }
    
    // 6. テストユーザーを削除
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('テストユーザーを削除しました');
    
    console.log('\n🎉 修正されたID生成ロジックのテスト完了！');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

testFixedInsertion();
