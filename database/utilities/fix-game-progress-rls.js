const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixGameProgressRLS() {
  console.log('🔧 game_progressテーブルのRLSポリシー修正を開始...');
  
  try {
    // 1. 既存のポリシーを削除
    console.log('🗑️ 既存のポリシーを削除中...');
    
    const { error: dropError1 } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "game_progress_own_all" ON public.game_progress;'
    });
    
    if (dropError1) {
      console.log('ℹ️ 既存ポリシー削除エラー（存在しない可能性）:', dropError1.message);
    }
    
    const { error: dropError2 } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can manage their own game progress" ON public.game_progress;'
    });
    
    if (dropError2) {
      console.log('ℹ️ 既存ポリシー削除エラー（存在しない可能性）:', dropError2.message);
    }
    
    console.log('✅ 既存ポリシーの削除完了');
    
    // 2. 正しいRLSポリシーを作成
    console.log('📝 新しいRLSポリシーを作成中...');
    
    const createPolicySQL = `
      CREATE POLICY "game_progress_own_all" ON public.game_progress
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = game_progress.school_id 
          AND s.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = game_progress.school_id 
          AND s.user_id = auth.uid()
        )
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createPolicySQL
    });
    
    if (createError) {
      console.error('❌ ポリシー作成エラー:', createError);
      throw createError;
    }
    
    console.log('✅ 新しいRLSポリシーを作成しました');
    
    // 3. RLSが有効になっていることを確認
    console.log('🔒 RLS設定を確認中...');
    
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.log('ℹ️ RLS有効化エラー（既に有効の可能性）:', enableError.message);
    } else {
      console.log('✅ RLSを有効化しました');
    }
    
    // 4. ポリシーの確認
    console.log('🔍 作成されたポリシーを確認中...');
    
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname, 
          tablename, 
          policyname, 
          permissive, 
          roles, 
          cmd, 
          qual, 
          with_check
        FROM pg_policies 
        WHERE tablename = 'game_progress';
      `
    });
    
    if (policyError) {
      console.error('❌ ポリシー確認エラー:', policyError);
    } else {
      console.log('📋 現在のポリシー:', policies);
    }
    
    // 5. 現在のRLS設定確認
    console.log('🔍 RLS設定を確認中...');
    
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'game_progress';
      `
    });
    
    if (rlsError) {
      console.error('❌ RLS設定確認エラー:', rlsError);
    } else {
      console.log('📋 RLS設定:', rlsStatus);
    }
    
    console.log('✅ game_progressテーブルのRLSポリシー修正が完了しました');
    
  } catch (error) {
    console.error('❌ RLSポリシー修正エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
fixGameProgressRLS();
