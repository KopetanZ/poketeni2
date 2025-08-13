#!/usr/bin/env node

/**
 * 現在のデータベーススキーマと制約の詳細確認スクリプト
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

    // 1. テーブル一覧確認
    console.log('📋 テーブル一覧:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ テーブル一覧取得エラー:', tablesError.message);
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // 2. pokemon_master_dataテーブルの詳細確認
    console.log('\n📊 pokemon_master_dataテーブルの詳細:');
    const { data: pokemonColumns, error: pokemonError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'pokemon_master_data')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (pokemonError) {
      console.error('❌ pokemon_master_data列情報取得エラー:', pokemonError.message);
    } else {
      pokemonColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 3. 制約の確認
    console.log('\n🔒 制約の確認:');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type, table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['pokemon_master_data', 'pokemon_evolution_chains', 'players'])
      .order('table_name, constraint_name');

    if (constraintsError) {
      console.error('❌ 制約情報取得エラー:', constraintsError.message);
    } else {
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.table_name}.${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // 4. データ数の確認
    console.log('\n📈 データ数の確認:');
    
    try {
      const { count: pokemonCount } = await supabase
        .from('pokemon_master_data')
        .select('*', { count: 'exact', head: true });
      console.log(`  - pokemon_master_data: ${pokemonCount}件`);
    } catch (error) {
      console.log(`  - pokemon_master_data: テーブルが存在しません`);
    }

    try {
      const { count: evolutionCount } = await supabase
        .from('pokemon_evolution_chains')
        .select('*', { count: 'exact', head: true });
      console.log(`  - pokemon_evolution_chains: ${evolutionCount}件`);
    } catch (error) {
      console.log(`  - pokemon_evolution_chains: テーブルが存在しません`);
    }

    // 5. インデックスの確認
    console.log('\n🔍 インデックスの確認:');
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('tablename, indexname, indexdef')
      .in('tablename', ['pokemon_master_data', 'pokemon_evolution_chains', 'players'])
      .order('tablename, indexname');

    if (indexesError) {
      console.error('❌ インデックス情報取得エラー:', indexesError.message);
    } else {
      indexes.forEach(index => {
        console.log(`  - ${index.tablename}.${index.indexname}`);
      });
    }

    console.log('\n✅ スキーマ確認完了');

  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error.message);
  }
}

// スクリプト実行
if (require.main === module) {
  checkCurrentSchema();
}

module.exports = { checkCurrentSchema };
