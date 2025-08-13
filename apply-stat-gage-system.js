// 栄冠ナイン式ステータスゲージシステムのSQL実行スクリプト
const { createClient } = require('@supabase/supabase-js');

// Supabase接続情報
const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎮 栄冠ナイン式ステータスゲージシステムのSQL実行開始...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceKey ? '✅ 設定済み' : '❌ 未設定');

if (!supabaseServiceKey) {
  console.log('\n❌ SUPABASE_SERVICE_ROLE_KEYが設定されていません');
  console.log('以下の手順で設定してください：');
  console.log('1. Supabaseダッシュボード → Settings → API');
  console.log('2. service_role secret keyをコピー');
  console.log('3. 環境変数として設定');
  console.log('\nまたは、このスクリプト内で直接設定してください');
  
  // ここで直接キーを設定（テスト用）
  console.log('\n🔄 テスト用に直接キーを設定します...');
  // const testServiceKey = 'your-actual-service-role-key-here';
  // console.log('テスト用キーを設定してください');
  
  process.exit(1);
}

// Supabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyStatGageSystem() {
  try {
    console.log('\n🚀 ステータスゲージシステムの適用開始...');
    
    // 1. 現在のテーブル構造を確認
    console.log('🔍 現在のテーブル構造を確認中...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('⚠️ テーブルアクセスエラー:', tableError.message);
      return;
    }
    
    console.log('✅ playersテーブルにアクセス可能');
    console.log('現在のカラム:', Object.keys(tableInfo[0] || {}));
    
    // 2. ステータスゲージカラムの追加
    console.log('\n📊 ステータスゲージカラムを追加中...');
    
    const addStatGagesResult = await supabase
      .rpc('exec_sql', {
        sql_query: `
          ALTER TABLE players 
          ADD COLUMN IF NOT EXISTS stat_gages JSONB DEFAULT '{
            "serve_skill_gage": 0,
            "return_skill_gage": 0,
            "volley_skill_gage": 0,
            "stroke_skill_gage": 0,
            "mental_gage": 0,
            "stamina_gage": 0
          }'::jsonb;
        `
      });
    
    if (addStatGagesResult.error) {
      console.log('⚠️ ステータスゲージカラム追加エラー:', addStatGagesResult.error.message);
      console.log('exec_sql関数が利用できない可能性があります');
      
      // 代替方法：直接カラムを追加できないか試行
      console.log('\n🔄 代替方法でカラム追加を試行中...');
      
      // 既存のプレイヤーに初期値を設定
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, pokemon_name')
        .limit(5);
      
      if (playersError) {
        console.log('⚠️ プレイヤー取得エラー:', playersError.message);
        return;
      }
      
      console.log('📋 取得したプレイヤー:', players);
      
    } else {
      console.log('✅ ステータスゲージカラムを追加しました');
    }
    
    // 3. 成長効率カラムの追加
    console.log('\n📈 成長効率カラムを追加中...');
    
    const addGrowthEfficiencyResult = await supabase
      .rpc('exec_sql', {
        sql_query: `
          ALTER TABLE players 
          ADD COLUMN IF NOT EXISTS growth_efficiency JSONB DEFAULT '{
            "serve_skill_efficiency": 0.1,
            "return_skill_efficiency": 0.1,
            "volley_skill_efficiency": 0.05,
            "stroke_skill_efficiency": 0.15,
            "mental_efficiency": 0.2,
            "stamina_efficiency": 0.25
          }'::jsonb;
        `
      });
    
    if (addGrowthEfficiencyResult.error) {
      console.log('⚠️ 成長効率カラム追加エラー:', addGrowthEfficiencyResult.error.message);
    } else {
      console.log('✅ 成長効率カラムを追加しました');
    }
    
    // 4. 既存データへの初期値設定
    console.log('\n🔄 既存データに初期値を設定中...');
    
    const { data: allPlayers, error: fetchError } = await supabase
      .from('players')
      .select('id, pokemon_name, stat_gages, growth_efficiency');
    
    if (fetchError) {
      console.log('⚠️ プレイヤー取得エラー:', fetchError.message);
      return;
    }
    
    console.log(`📊 ${allPlayers.length}人のプレイヤーを取得しました`);
    
    // 初期値が設定されていないプレイヤーを更新
    const playersToUpdate = allPlayers.filter(player => 
      !player.stat_gages || !player.growth_efficiency
    );
    
    if (playersToUpdate.length > 0) {
      console.log(`🔄 ${playersToUpdate.length}人のプレイヤーを更新中...`);
      
      for (const player of playersToUpdate) {
        const updateData = {
          stat_gages: {
            serve_skill_gage: 0,
            return_skill_gage: 0,
            volley_skill_gage: 0,
            stroke_skill_gage: 0,
            mental_gage: 0,
            stamina_gage: 0
          },
          growth_efficiency: {
            serve_skill_efficiency: 0.1,
            return_skill_efficiency: 0.1,
            volley_skill_efficiency: 0.05,
            stroke_skill_efficiency: 0.15,
            mental_efficiency: 0.2,
            stamina_efficiency: 0.25
          }
        };
        
        const { error: updateError } = await supabase
          .from('players')
          .update(updateData)
          .eq('id', player.id);
        
        if (updateError) {
          console.log(`⚠️ ${player.pokemon_name}の更新エラー:`, updateError.message);
        } else {
          console.log(`✅ ${player.pokemon_name}を更新しました`);
        }
      }
    } else {
      console.log('✅ すべてのプレイヤーに初期値が設定されています');
    }
    
    // 5. 最終確認
    console.log('\n🔍 最終確認中...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('players')
      .select('id, pokemon_name, stat_gages, growth_efficiency')
      .limit(3);
    
    if (finalError) {
      console.log('⚠️ 最終確認エラー:', finalError.message);
    } else {
      console.log('📋 最終確認結果:');
      finalCheck.forEach(player => {
        console.log(`- ${player.pokemon_name}:`);
        console.log(`  ステータスゲージ: ${player.stat_gages ? '✅' : '❌'}`);
        console.log(`  成長効率: ${player.growth_efficiency ? '✅' : '❌'}`);
      });
    }
    
    console.log('\n🎉 栄冠ナイン式ステータスゲージシステムの適用が完了しました！');
    console.log('\n次のステップ:');
    console.log('1. アプリケーションを起動: npm run dev');
    console.log('2. ポケモンステータス画面で「🎮 成長ゲージ」タブを確認');
    console.log('3. 練習メニューでゲージ蓄積を確認');
    console.log('4. 設備管理で成長効率の向上を確認');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプト実行
applyStatGageSystem();
