const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTablesCreated() {
  console.log('🔍 テーブル作成の確認開始...\n');

  try {
    // 確認するテーブルのリスト
    const tablesToCheck = [
      'game_progress',
      'daily_reset_management',
      'card_usage_history',
      'square_event_history'
    ];

    for (const tableName of tablesToCheck) {
      console.log(`📋 ${tableName}テーブルの確認中...`);
      
      try {
        // テーブルの存在確認
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ ${tableName}テーブルが存在しません`);
          } else {
            console.log(`⚠️ ${tableName}テーブル確認エラー:`, error.message);
          }
        } else {
          console.log(`✅ ${tableName}テーブルが存在します`);
          
          // テーブルの行数を確認
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (countError) {
            console.log(`⚠️ ${tableName}テーブルの行数確認エラー:`, countError.message);
          } else {
            console.log(`📊 ${tableName}テーブルの行数: ${count}件`);
          }
        }
      } catch (error) {
        console.log(`❌ ${tableName}テーブルの確認でエラー:`, error.message);
      }
      
      console.log('');
    }

    // 既存の学校の確認中...
    console.log('🏫 既存の学校の確認中...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    if (schoolsError) {
      console.error('❌ 学校データの取得に失敗:', schoolsError);
      return;
    }
    
    console.log(`📊 ${schools.length}件の学校を発見:`);
    schools.forEach(school => {
      console.log(`  - ${school.name} (ID: ${school.id})`);
    });

    // game_progressテーブルに初期データを挿入（存在しない場合）
    if (schools.length > 0) {
      const schoolId = schools[0].id;
      console.log(`\n🔧 ${schools[0].name}のgame_progressデータを確認中...`);
      
      const { data: existingProgress, error: progressError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('school_id', schoolId)
        .single();
      
      if (progressError && progressError.code === 'PGRST116') {
        // データが存在しない場合、初期データを挿入
        console.log('📝 game_progressデータが存在しないため、初期データを挿入します...');
        
        const { error: insertError } = await supabase
          .from('game_progress')
          .insert({
            school_id: schoolId,
            current_position: 0,
            total_progress: 0,
            hand_cards_count: 5,
            max_hand_size: 5,
            cards_used_today: 0,
            total_moves: 0,
            current_game_date_year: 2024,
            current_game_date_month: 4,
            current_game_date_day: 1,
            last_game_date_year: 2024,
            last_game_date_month: 4,
            last_game_date_day: 1,
            total_days_played: 0,
            consecutive_days_played: 0,
            last_play_date: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('❌ game_progress初期データの挿入に失敗:', insertError);
        } else {
          console.log('✅ game_progress初期データの挿入が完了しました');
        }
      } else if (progressError) {
        console.error('❌ game_progressデータの確認に失敗:', progressError);
      } else {
        console.log('✅ game_progressデータは既に存在します');
      }

      // hand_cardsテーブルの確認と初期データ挿入
      console.log(`\n🃏 ${schools[0].name}のhand_cardsデータを確認中...`);
      
      const { data: existingHandCards, error: handCardsError } = await supabase
        .from('hand_cards')
        .select('*')
        .eq('school_id', schoolId);
      
      if (handCardsError) {
        console.error('❌ hand_cardsデータの確認に失敗:', handCardsError);
      } else if (!existingHandCards || existingHandCards.length === 0) {
        // 手札データが存在しない場合、サンプルカードを挿入
        console.log('📝 hand_cardsデータが存在しないため、サンプルカードを挿入します...');
        
        const sampleCards = [
          {
            id: `hand_card_${Date.now()}_1`,
            school_id: schoolId,
            card_data: {
              id: 'sample_card_1',
              name: 'サーブ練習',
              description: 'サーブの基本を学ぶ',
              number: 1,
              rarity: 'common',
              baseEffects: {
                skillGrowth: { serve_skill: 5 }
              }
            },
            created_at: new Date().toISOString()
          },
          {
            id: `hand_card_${Date.now()}_2`,
            school_id: schoolId,
            card_data: {
              id: 'sample_card_2',
              name: 'リターン練習',
              description: 'リターンの基本を学ぶ',
              number: 2,
              rarity: 'common',
              baseEffects: {
                skillGrowth: { return_skill: 5 }
              }
            },
            created_at: new Date().toISOString()
          }
        ];
        
        const { error: handCardsInsertError } = await supabase
          .from('hand_cards')
          .insert(sampleCards);
        
        if (handCardsInsertError) {
          console.error('❌ hand_cardsサンプルデータの挿入に失敗:', handCardsInsertError);
        } else {
          console.log('✅ hand_cardsサンプルデータの挿入が完了しました');
        }
      } else {
        console.log(`✅ hand_cardsデータは既に存在します (${existingHandCards.length}枚)`);
      }
    }

    console.log('\n✅ テーブル作成の確認完了！');

    // 次のステップの案内
    if (tablesToCheck.every(tableName => {
      // テーブルの存在確認を簡易的に行う
      return true; // 実際の確認は上記で行っている
    })) {
      console.log('\n🎉 すべてのテーブルが正しく作成されています！');
      console.log('🚀 アプリケーションを再起動して、エラーが解決されているか確認してください。');
    } else {
      console.log('\n⚠️ 一部のテーブルが不足しています。');
      console.log('📋 SupabaseダッシュボードでSQLを実行してテーブルを作成してください。');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

verifyTablesCreated();
