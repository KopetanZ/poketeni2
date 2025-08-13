require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSPolicies() {
  try {
    console.log('🔒 RLSポリシーの確認開始...');
    
    // まず、game_progressテーブルのRLSが有効かどうかを確認
    console.log('📋 game_progressテーブルのRLS確認...');
    
    try {
      // テーブルにアクセスしてみる
      const { data: testData, error: testError } = await supabase
        .from('game_progress')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('📋 アクセス結果:', { testData, testError });
        
        if (testError.code === '42501') {
          console.log('🔒 RLSポリシーによりアクセスが拒否されました');
        }
      } else {
        console.log('✅ テーブルにアクセスできました');
      }
    } catch (error) {
      console.error('❌ テーブルアクセステストエラー:', error);
    }
    
    // 現在のユーザー情報を確認
    console.log('👤 現在のユーザー情報確認...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('👤 ユーザー取得エラー:', userError);
    } else if (user) {
      console.log('👤 認証済みユーザー:', user.id);
      console.log('👤 ユーザー詳細:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('👤 認証されていないユーザー');
    }
    
    // セッション情報を確認
    console.log('🔑 セッション情報確認...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('🔑 セッション取得エラー:', sessionError);
    } else if (session) {
      console.log('🔑 アクティブセッション:', session.access_token ? 'あり' : 'なし');
    } else {
      console.log('🔑 アクティブセッションなし');
    }
    
    // 匿名認証を試行
    console.log('🔑 匿名認証を試行...');
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    
    if (anonError) {
      console.log('🔑 匿名認証エラー:', anonError);
    } else {
      console.log('🔑 匿名認証成功:', anonData.user?.id);
      
      // 匿名認証後に再度テーブルアクセスを試行
      console.log('📋 匿名認証後のテーブルアクセステスト...');
      const { data: anonTestData, error: anonTestError } = await supabase
        .from('game_progress')
        .select('*')
        .limit(1);
      
      console.log('📋 匿名認証後のアクセス結果:', { anonTestData, anonTestError });
      
      if (anonTestError && anonTestError.code === '42501') {
        console.log('🔒 匿名認証後もRLSポリシーによりアクセスが拒否されました');
      }
    }
    
    console.log('✅ RLSポリシー確認完了');
    
  } catch (error) {
    console.error('❌ RLSポリシー確認中にエラーが発生:', error);
  }
}

checkRLSPolicies();
