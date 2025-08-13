#!/usr/bin/env node

/**
 * Vercelデプロイ用 PokeAPIデータ同期スクリプト
 * 本番環境での安全な実行を考慮して設計
 */

const { createClient } = require('@supabase/supabase-js');

// 環境変数の確認
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

function checkEnvironmentVariables() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ 必要な環境変数が設定されていません:');
    missing.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\nVercelダッシュボードで環境変数を設定してください。');
    process.exit(1);
  }
  
  console.log('✅ 環境変数の確認完了');
}

// Supabaseクライアントの初期化
function initializeSupabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Supabaseクライアント初期化完了');
    return supabase;
  } catch (error) {
    console.error('❌ Supabaseクライアント初期化エラー:', error.message);
    process.exit(1);
  }
}

// データベーススキーマの確認
async function checkDatabaseSchema(supabase) {
  try {
    console.log('🔍 データベーススキーマを確認中...');
    
    // pokemon_master_dataテーブルの存在確認
    const { data: tableCheck, error: tableError } = await supabase
      .from('pokemon_master_data')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('ℹ️ pokemon_master_dataテーブルが存在しません。スキーマセットアップが必要です。');
      return false;
    }
    
    // 既存データ数の確認
    const { count, error: countError } = await supabase
      .from('pokemon_master_data')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ データ数確認エラー:', countError.message);
      return false;
    }
    
    console.log(`✅ データベーススキーマ確認完了 (既存データ: ${count}件)`);
    return count > 0;
  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error.message);
    return false;
  }
}

// 最小限のポケモンデータ同期（本番環境用）
async function syncEssentialPokemon(supabase) {
  try {
    console.log('🔄 最小限のポケモンデータ同期を開始...');
    
    // 代表的なポケモンのみ同期（時間短縮のため）
    const essentialPokemon = [1, 4, 7, 25, 133, 150, 151]; // 御三家、ピカチュウ、イーブイ、ミュウツー、ミュウ
    
    for (const pokemonId of essentialPokemon) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!response.ok) {
          console.warn(`⚠️ ポケモンID ${pokemonId} の取得に失敗: ${response.status}`);
          continue;
        }
        
        const pokemonData = await response.json();
        
        // 基本データの準備
        const pokemonRecord = {
          pokemon_id: pokemonData.id,
          japanese_name: pokemonData.names?.find(n => n.language.name === 'ja-Hrkt')?.name || pokemonData.name,
          english_name: pokemonData.name,
          types: pokemonData.types.map(t => t.type.name),
          base_stats: {
            hp: pokemonData.stats[0].base_stat,
            attack: pokemonData.stats[1].base_stat,
            defense: pokemonData.stats[2].base_stat,
            spAttack: pokemonData.stats[3].base_stat,
            spDefense: pokemonData.stats[4].base_stat,
            speed: pokemonData.stats[5].base_stat
          },
          sprite_urls: {
            front_default: pokemonData.sprites.front_default,
            front_shiny: pokemonData.sprites.front_shiny
          },
          rarity_level: 'common',
          generation: 1,
          is_recruitable: true
        };
        
        // データベースに挿入/更新
        const { error: upsertError } = await supabase
          .from('pokemon_master_data')
          .upsert(pokemonRecord, { onConflict: 'pokemon_id' });
        
        if (upsertError) {
          console.error(`❌ ポケモンID ${pokemonId} の挿入エラー:`, upsertError.message);
        } else {
          console.log(`✅ ポケモンID ${pokemonId} (${pokemonRecord.japanese_name}) 同期完了`);
        }
        
        // API制限を考慮して少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ ポケモンID ${pokemonId} の処理エラー:`, error.message);
      }
    }
    
    console.log('✅ 最小限のポケモンデータ同期完了');
  } catch (error) {
    console.error('❌ データ同期エラー:', error.message);
    throw error;
  }
}

// メイン実行関数
async function main() {
  try {
    console.log('🚀 PokeAPIデータ同期スクリプト開始');
    console.log('環境:', process.env.NODE_ENV || 'development');
    
    // 環境変数チェック
    checkEnvironmentVariables();
    
    // Supabase初期化
    const supabase = initializeSupabase();
    
    // スキーマ確認
    const hasData = await checkDatabaseSchema(supabase);
    
    if (hasData) {
      console.log('ℹ️ 既にポケモンデータが存在します。スキップします。');
      console.log('💡 全データを再同期する場合は、手動で pokeapi-full-sync.js を実行してください。');
    } else {
      console.log('ℹ️ データが存在しないため、最小限の同期を実行します。');
      await syncEssentialPokemon(supabase);
    }
    
    console.log('🎉 スクリプト実行完了');
    
  } catch (error) {
    console.error('❌ スクリプト実行エラー:', error.message);
    console.error('スタックトレース:', error.stack);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { main, checkDatabaseSchema, syncEssentialPokemon };
