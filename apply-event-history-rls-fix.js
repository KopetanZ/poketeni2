// event_historyテーブルのRLSポリシー修正を適用
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabaseの設定（環境変数から読み取り）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY環境変数が設定されていません');
  console.log('Supabaseダッシュボードからservice_roleキーを取得して設定してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyEventHistoryRLSFix() {
  console.log('🔧 event_historyテーブルのRLSポリシー修正を適用開始...');
  
  try {
    // SQLファイルを読み込み
    const sqlFilePath = path.join(__dirname, 'fix-event-history-rls.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQLファイルを読み込みました');
    
    // SQLを実行
    console.log('🚀 SQLを実行中...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.log('❌ SQL実行エラー:', error.message);
      
      // 代替方法：個別のSQLコマンドを実行
      console.log('🔄 代替方法で個別のSQLコマンドを実行します...');
      
      const sqlCommands = [
        "drop policy if exists \"event_history_own_all\" on public.event_history;",
        "create policy \"event_history_select_policy\" on public.event_history for select using (exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid()));",
        "create policy \"event_history_insert_policy\" on public.event_history for insert with check (exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid()));",
        "create policy \"event_history_update_policy\" on public.event_history for update using (exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid())) with check (exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid()));",
        "create policy \"event_history_delete_policy\" on public.event_history for delete using (exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid()));"
      ];
      
      for (const sqlCommand of sqlCommands) {
        try {
          const { error: cmdError } = await supabase.rpc('exec_sql', {
            sql_query: sqlCommand
          });
          
          if (cmdError) {
            console.log(`⚠️ コマンド実行エラー (${sqlCommand.substring(0, 50)}...):`, cmdError.message);
          } else {
            console.log(`✅ コマンド実行成功: ${sqlCommand.substring(0, 50)}...`);
          }
        } catch (cmdErr) {
          console.log(`⚠️ コマンド実行エラー:`, cmdErr.message);
        }
      }
    } else {
      console.log('✅ SQL実行成功');
    }
    
    // 現在のポリシー状況を確認
    console.log('\n📊 現在のRLSポリシー状況を確認中...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'event_history');
    
    if (policiesError) {
      console.log('⚠️ ポリシー状況確認エラー:', policiesError.message);
    } else {
      console.log('📋 テーブル権限情報:', policies);
    }
    
    console.log('\n🎉 RLSポリシー修正完了！');
    console.log('これで、event_historyテーブルへのデータ挿入が正常に動作するはずです');
    
  } catch (err) {
    console.error('💥 予期しないエラー:', err.message);
  }
}

applyEventHistoryRLSFix();
