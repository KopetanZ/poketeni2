#!/usr/bin/env node

/**
 * Supabase対応 現在のデータベーススキーマ確認スクリプト
 * 作成日: 2025-01-13
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentSchema() {
  try {
    console.log('🔍 現在のデータベーススキーマを確認中...\n');

    // 1. テーブルの存在確認（実際のデータアクセスで確認）
    console.log('📋 テーブルの存在確認:');
    
    // pokemon_master_dataテーブルの確認
    try {
      const { data: pokemonSample, error: pokemonError } = await supabase
        .from('pokemon_master_data')
        .select('*')
        .limit(1);
      
      if (pokemonError) {
        console.log('  - pokemon_master_data: ❌ テーブルが存在しません');
      } else {
        console.log('  - pokemon_master_data: ✅ テーブルが存在します');
        
        // 列の構造を推測（サンプルデータから）
        if (pokemonSample && pokemonSample.length > 0) {
          const sample = pokemonSample[0];
          console.log('    列の構造:');
          Object.keys(sample).forEach(key => {
            const value = sample[key];
            const type = Array.isArray(value) ? 'ARRAY' : 
                        typeof value === 'object' && value !== null ? 'JSONB' :
                        typeof value;
            console.log(`      - ${key}: ${type}`);
          });
        }
      }
    } catch (error) {
      console.log('  - pokemon_master_data: ❌ アクセスエラー');
    }

    // pokemon_evolution_chainsテーブルの確認
    try {
      const { data: evolutionSample, error: evolutionError } = await supabase
        .from('pokemon_evolution_chains')
        .select('*')
        .limit(1);
      
      if (evolutionError) {
        console.log('  - pokemon_evolution_chains: ❌ テーブルが存在しません');
      } else {
        console.log('  - pokemon_evolution_chains: ✅ テーブルが存在します');
        
        // 列の構造を推測
        if (evolutionSample && evolutionSample.length > 0) {
          const sample = evolutionSample[0];
          console.log('    列の構造:');
          Object.keys(sample).forEach(key => {
            const value = sample[key];
            const type = Array.isArray(value) ? 'ARRAY' : 
                        typeof value === 'object' && value !== null ? 'JSONB' :
                        typeof value;
            console.log(`      - ${key}: ${type}`);
          });
        }
      }
    } catch (error) {
      console.log('  - pokemon_evolution_chains: ❌ アクセスエラー');
    }

    // playersテーブルの確認
    try {
      const { data: playersSample, error: playersError } = await supabase
        .from('players')
        .select('*')
        .limit(1);
      
      if (playersError) {
        console.log('  - players: ❌ テーブルが存在しません');
      } else {
        console.log('  - players: ✅ テーブルが存在します');
        
        // 列の構造を推測
        if (playersSample && playersSample.length > 0) {
          const sample = playersSample[0];
          console.log('    列の構造:');
          Object.keys(sample).forEach(key => {
            const value = sample[key];
            const type = Array.isArray(value) ? 'ARRAY' : 
                        typeof value === 'object' && value !== null ? 'JSONB' :
                        typeof value;
            console.log(`      - ${key}: ${type}`);
          });
        }
      }
    } catch (error) {
      console.log('  - players: ❌ アクセスエラー');
    }

    // 2. データ数の詳細確認
    console.log('\n📈 データ数の詳細確認:');
    
    try {
      const { count: pokemonCount } = await supabase
        .from('pokemon_master_data')
        .select('*', { count: 'exact', head: true });
      console.log(`  - pokemon_master_data: ${pokemonCount}件`);
      
      // レアリティ別の分布
      const { data: rarityStats } = await supabase
        .from('pokemon_master_data')
        .select('rarity_level');
      
      if (rarityStats) {
        const rarityCounts = rarityStats.reduce((acc, item) => {
          acc[item.rarity_level] = (acc[item.rarity_level] || 0) + 1;
          return acc;
        }, {});
        
        console.log('    レアリティ別分布:');
        Object.entries(rarityCounts).forEach(([rarity, count]) => {
          const percentage = Math.round((count / pokemonCount) * 100);
          console.log(`      ${rarity}: ${count}件 (${percentage}%)`);
        });
      }
    } catch (error) {
      console.log('  - pokemon_master_data: データ数確認エラー');
    }

    try {
      const { count: evolutionCount } = await supabase
        .from('pokemon_evolution_chains')
        .select('*', { count: 'exact', head: true });
      console.log(`  - pokemon_evolution_chains: ${evolutionCount}件`);
      
      // 進化ステージ別の分布
      const { data: stageStats } = await supabase
        .from('pokemon_evolution_chains')
        .select('evolution_stage');
      
      if (stageStats) {
        const stageCounts = stageStats.reduce((acc, item) => {
          acc[item.evolution_stage] = (acc[item.evolution_stage] || 0) + 1;
          return acc;
        }, {});
        
        console.log('    進化ステージ別分布:');
        Object.entries(stageCounts).forEach(([stage, count]) => {
          const percentage = Math.round((count / evolutionCount) * 100);
          console.log(`      ステージ${stage}: ${count}件 (${percentage}%)`);
        });
      }
    } catch (error) {
      console.log('  - pokemon_evolution_chains: データ数確認エラー');
    }

    // 3. 配属可能ポケモンの確認
    console.log('\n🎯 配属可能ポケモンの確認:');
    
    try {
      const { count: recruitableCount } = await supabase
        .from('pokemon_master_data')
        .select('*', { count: 'exact', head: true })
        .eq('is_recruitable', true);
      
      console.log(`  - 配属可能ポケモン: ${recruitableCount}件`);
      
      // 配属可能ポケモンの詳細
      const { data: recruitablePokemon } = await supabase
        .from('pokemon_master_data')
        .select('pokemon_id, japanese_name, english_name, rarity_level')
        .eq('is_recruitable', true)
        .order('pokemon_id');
      
      if (recruitablePokemon) {
        console.log('    配属可能ポケモン一覧:');
        recruitablePokemon.forEach(pokemon => {
          console.log(`      ${pokemon.pokemon_id}: ${pokemon.japanese_name} (${pokemon.english_name}) - ${pokemon.rarity_level}`);
        });
      }
    } catch (error) {
      console.log('  - 配属可能ポケモン確認エラー');
    }

    // 4. ビューの確認
    console.log('\n👁️ ビューの確認:');
    
    try {
      // recruitable_pokemonビューの確認
      const { data: recruitableView, error: viewError } = await supabase
        .from('recruitable_pokemon')
        .select('*')
        .limit(1);
      
      if (viewError) {
        console.log('  - recruitable_pokemonビュー: ❌ 存在しません');
      } else {
        console.log('  - recruitable_pokemonビュー: ✅ 存在します');
      }
    } catch (error) {
      console.log('  - ビュー確認エラー');
    }

    console.log('\n✅ スキーマ確認完了');
    console.log('\n💡 次のステップ:');
    console.log('  1. 必要に応じて pokeapi-database-setup.sql を実行');
    console.log('  2. node pokeapi-full-sync.js で全ポケモンデータを同期');

  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error.message);
  }
}

// スクリプト実行
if (require.main === module) {
  checkCurrentSchema();
}

module.exports = { checkCurrentSchema };
