#!/usr/bin/env node

/**
 * ライバル校システムデータベース初期化スクリプト
 * このスクリプトを実行して、ライバル校システムのデータベースを初期化してください
 * 
 * 使用方法:
 * node initialize-rival-schools-db.js
 */

const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み（開発環境と本番環境の両方に対応）
if (process.env.NODE_ENV !== 'production') {
  // 開発環境の場合のみdotenvを使用
  require('dotenv').config({ path: '.env.local' });
}

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 地域特性データ（サンプル）
const REGIONAL_DATA = {
  '北海道': {
    region: '北海道',
    climate: { temperature: 'cold', humidity: 'low', seasonal_changes: 'extreme' },
    culture: { preferred_types: ['ice', 'steel'], traditional_tactics: 'defensive', training_philosophy: 'endurance', competitive_spirit: 'high' },
    infrastructure: { facility_quality: 'excellent', coaching_level: 'high', funding: 'generous', population_density: 'low' },
    signaturePokemon: { primary: 'Froslass', secondary: ['Mamoswine', 'Weavile'] }
  },
  '東京都': {
    region: '関東',
    climate: { temperature: 'moderate', humidity: 'high', seasonal_changes: 'moderate' },
    culture: { preferred_types: ['normal', 'psychic'], traditional_tactics: 'balanced', training_philosophy: 'innovation', competitive_spirit: 'very_high' },
    infrastructure: { facility_quality: 'excellent', coaching_level: 'very_high', funding: 'very_generous', population_density: 'very_high' },
    signaturePokemon: { primary: 'Lucario', secondary: ['Garchomp', 'Metagross'] }
  },
  '大阪府': {
    region: '近畿',
    climate: { temperature: 'warm', humidity: 'high', seasonal_changes: 'moderate' },
    culture: { preferred_types: ['fighting', 'fire'], traditional_tactics: 'aggressive', training_philosophy: 'passion', competitive_spirit: 'high' },
    infrastructure: { facility_quality: 'good', coaching_level: 'high', funding: 'generous', population_density: 'high' },
    signaturePokemon: { primary: 'Infernape', secondary: ['Machamp', 'Blaziken'] }
  },
  '福岡県': {
    region: '九州',
    climate: { temperature: 'warm', humidity: 'high', seasonal_changes: 'moderate' },
    culture: { preferred_types: ['fire', 'dragon'], traditional_tactics: 'aggressive', training_philosophy: 'passion', competitive_spirit: 'high' },
    infrastructure: { facility_quality: 'good', coaching_level: 'high', funding: 'generous', population_density: 'high' },
    signaturePokemon: { primary: 'Charizard', secondary: ['Salamence', 'Garchomp'] }
  },
  '愛知県': {
    region: '中部',
    climate: { temperature: 'moderate', humidity: 'moderate', seasonal_changes: 'moderate' },
    culture: { preferred_types: ['steel', 'electric'], traditional_tactics: 'technical', training_philosophy: 'precision', competitive_spirit: 'high' },
    infrastructure: { facility_quality: 'excellent', coaching_level: 'high', funding: 'generous', population_density: 'high' },
    signaturePokemon: { primary: 'Metagross', secondary: ['Magnezone', 'Aggron'] }
  }
};

// ライバル校生成関数（簡易版）
function generateRivalSchools() {
  const schools = [];
  const schoolTypes = ['traditional', 'emerging', 'technical', 'power', 'balanced', 'specialized', 'academy'];
  const schoolRanks = ['S++', 'S+', 'S', 'A+', 'A', 'B+', 'B'];
  
  for (const [prefecture, data] of Object.entries(REGIONAL_DATA)) {
    const schoolCount = Math.floor(Math.random() * 3) + 2; // 2-4校
    
    for (let i = 0; i < schoolCount; i++) {
      const school = {
        name: `${prefecture}${['学院', '高校', '専門学校', 'アカデミー'][i % 4]}`,
        prefecture,
        region: data.region,
        school_type: schoolTypes[Math.floor(Math.random() * schoolTypes.length)],
        school_rank: schoolRanks[Math.floor(Math.random() * schoolRanks.length)],
        rating: Math.floor(Math.random() * 500) + 800, // 800-1300
        level: Math.floor(Math.random() * 5) + 1, // 1-5
        philosophy: `${prefecture}の伝統を重んじる教育方針`,
        specialties: [data.culture.preferred_types[0]],
        weaknesses: ['speed'],
        tactics_profile: { style: 'balanced', focus: 'teamwork' },
        team_composition: { formation: 'balanced', strategy: 'adaptive' },
        ace_pokemon: { species: data.signaturePokemon.primary, level: 45, moves: ['Tackle', 'Quick Attack'] },
        current_form: 'normal',
        growth_trajectory: 'stable',
        injury_situation: {},
        regional_modifiers: {},
        culture_modifiers: {}
      };
      
      schools.push(school);
    }
  }
  
  return schools;
}

// データベース初期化関数
async function initializeDatabase() {
  try {
    console.log('🚀 ライバル校システムデータベースの初期化を開始...\n');
    
    // 0. RLSポリシーの一時的な無効化（初期化用）
    console.log('🔒 RLSポリシーの一時的な無効化...');
    try {
      await supabase.rpc('disable_rls_for_initialization');
      console.log('✅ RLSポリシーを無効化しました');
    } catch (error) {
      console.log('⚠️ RLS無効化関数が存在しません。手動でテーブルを作成してください。');
      console.log('Supabaseダッシュボードでrival-schools-schema.sqlを実行してください。');
      return;
    }
    
    // 1. 地域特性データの移行
    console.log('📊 地域特性データの移行を開始...');
    for (const [prefecture, data] of Object.entries(REGIONAL_DATA)) {
      const { error } = await supabase
        .from('regional_characteristics')
        .upsert({
          prefecture,
          region: data.region,
          climate_data: data.climate,
          culture_data: data.culture,
          infrastructure_data: data.infrastructure,
          signature_pokemon: data.signaturePokemon
        }, {
          onConflict: 'prefecture'
        });
      
      if (error) {
        console.error(`❌ 地域特性データの移行エラー (${prefecture}):`, error);
        throw error;
      }
      
      console.log(`✅ 地域特性データ移行完了: ${prefecture}`);
    }
    console.log('✅ 地域特性データの移行が完了しました\n');
    
    // 2. ライバル校の一括生成と保存
    console.log('🏫 ライバル校の一括生成を開始...');
    const allSchools = generateRivalSchools();
    console.log(`${allSchools.length}校のライバル校を生成しました`);
    
    // バッチ処理でデータベースに保存
    const batchSize = 10;
    for (let i = 0; i < allSchools.length; i += batchSize) {
      const batch = allSchools.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('rival_schools')
        .insert(batch.map(school => ({
          name: school.name,
          prefecture: school.prefecture,
          region: school.region,
          school_type: school.school_type,
          school_rank: school.school_rank,
          rating: school.rating,
          level: school.level,
          philosophy: school.philosophy,
          specialties: school.specialties,
          weaknesses: school.weaknesses,
          tactics_profile: school.tactics_profile,
          team_composition: school.team_composition,
          ace_pokemon: school.ace_pokemon,
          current_form: school.current_form,
          growth_trajectory: school.growth_trajectory,
          injury_situation: school.injury_situation,
          regional_modifiers: school.regional_modifiers,
          culture_modifiers: school.culture_modifiers
        })));
      
      if (error) {
        console.error(`❌ バッチ${Math.floor(i / batchSize) + 1}の保存エラー:`, error);
        throw error;
      }
      
      console.log(`✅ バッチ${Math.floor(i / batchSize) + 1}の保存完了: ${batch.length}校`);
    }
    
    console.log('✅ ライバル校の一括保存が完了しました\n');
    
    // 3. データベース状態の確認
    console.log('📋 データベース状態を確認中...');
    const [regionalCount, schoolsCount] = await Promise.all([
      supabase.from('regional_characteristics').select('*', { count: 'exact', head: true }),
      supabase.from('rival_schools').select('*', { count: 'exact', head: true })
    ]);
    
    console.log('📊 データベース状態:');
    console.log(`  - 地域特性: ${regionalCount.count || 0}件`);
    console.log(`  - ライバル校: ${schoolsCount.count || 0}件`);
    
    console.log('\n🎉 ライバル校システムデータベースの初期化が完了しました！');
    
  } catch (error) {
    console.error('\n❌ ライバル校システムデータベースの初期化に失敗しました:', error);
    process.exit(1);
  }
}

// メイン実行
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
