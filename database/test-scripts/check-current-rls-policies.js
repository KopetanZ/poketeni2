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

async function checkCurrentRLSPolicies() {
  console.log('🔍 現在のRLSポリシーの状況を確認中...');
  
  try {
    // 1. game_progressテーブルのRLS設定確認
    console.log('\n📋 game_progressテーブルのRLS設定:');
    
    const { data: gameProgressRLS, error: gameProgressError } = await supabase
      .from('game_progress')
      .select('*')
      .limit(1);
    
    if (gameProgressError) {
      if (gameProgressError.code === '42501') {
        console.log('🔒 RLSによりアクセスが拒否されています（ポリシーが正しく設定されていない可能性）');
      } else {
        console.log('❌ エラー:', gameProgressError);
      }
    } else {
      console.log('✅ RLSポリシーが正しく設定されており、アクセス可能です');
    }
    
    // 2. schoolsテーブルのRLS設定確認
    console.log('\n📋 schoolsテーブルのRLS設定:');
    
    const { data: schoolsRLS, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .limit(1);
    
    if (schoolsError) {
      if (schoolsError.code === '42501') {
        console.log('🔒 RLSによりアクセスが拒否されています');
      } else {
        console.log('❌ エラー:', schoolsError);
      }
    } else {
      console.log('✅ RLSポリシーが正しく設定されており、アクセス可能です');
    }
    
    // 3. 手動でRLSポリシーを確認するためのSQL文を表示
    console.log('\n🔧 RLSポリシー修正のためのSQL文:');
    console.log('以下のSQLをSupabaseダッシュボードのSQL Editorで実行してください:');
    console.log('\n--- SQL開始 ---');
    console.log(`
-- 1. 既存のポリシーを削除
DROP POLICY IF EXISTS "game_progress_own_all" ON public.game_progress;
DROP POLICY IF EXISTS "Users can manage their own game progress" ON public.game_progress;

-- 2. 正しいRLSポリシーを作成
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

-- 3. RLSが有効になっていることを確認
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- 4. ポリシーの確認
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
    `);
    console.log('--- SQL終了 ---');
    
    console.log('\n💡 手順:');
    console.log('1. https://supabase.com/dashboard にアクセス');
    console.log('2. プロジェクトを選択');
    console.log('3. SQL Editor → New Query');
    console.log('4. 上記のSQLをコピー&ペーストして実行');
    
  } catch (error) {
    console.error('❌ RLSポリシー確認エラー:', error);
  }
}

// スクリプト実行
checkCurrentRLSPolicies();
