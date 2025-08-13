#!/usr/bin/env node

/**
 * データベース自動セットアップスクリプト
 * スキーマファイルを順序通りに実行します
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 環境変数の確認
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 必要な環境変数が設定されていません:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * SQLファイルを実行する
 */
async function executeSqlFile(filePath) {
  try {
    console.log(`📄 実行中: ${path.basename(filePath)}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // コメントと空行を除去
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim())
      .join('\n');
    
    if (cleanSql.trim()) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: cleanSql });
      if (error) {
        console.error(`❌ ${path.basename(filePath)} でエラー:`, error);
        return false;
      }
      console.log(`✅ ${path.basename(filePath)} 完了`);
    }
    return true;
  } catch (err) {
    console.error(`❌ ${path.basename(filePath)} でエラー:`, err.message);
    return false;
  }
}

/**
 * スキーマファイルを順番に実行
 */
async function setupSchemas() {
  const schemasDir = path.join(__dirname, 'schemas');
  const schemaFiles = fs.readdirSync(schemasDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // 01-, 02- などの番号順
  
  console.log('🗄️ スキーマファイルの実行を開始...');
  
  for (const file of schemaFiles) {
    const filePath = path.join(schemasDir, file);
    const success = await executeSqlFile(filePath);
    if (!success) {
      console.error('❌ スキーマ作成に失敗しました');
      return false;
    }
  }
  
  return true;
}

/**
 * RLSポリシーを設定
 */
async function setupRLS() {
  console.log('🔒 RLSポリシーの設定を開始...');
  const rlsFile = path.join(__dirname, 'rls-policies', 'fix-rls-policies-correct.sql');
  
  if (fs.existsSync(rlsFile)) {
    return await executeSqlFile(rlsFile);
  } else {
    console.log('⚠️ RLSポリシーファイルが見つかりません');
    return true;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 データベースセットアップを開始します...');
  
  try {
    // 接続テスト
    const { error } = await supabase.from('_test').select('*').limit(1);
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ データベース接続に失敗:', error);
      process.exit(1);
    }
    console.log('✅ データベース接続確認');
    
    // スキーマセットアップ
    const schemaSuccess = await setupSchemas();
    if (!schemaSuccess) {
      process.exit(1);
    }
    
    // RLSセットアップ
    const rlsSuccess = await setupRLS();
    if (!rlsSuccess) {
      console.warn('⚠️ RLS設定に失敗しましたが、処理を継続します');
    }
    
    console.log('🎉 データベースセットアップが完了しました！');
    
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生:', error);
    process.exit(1);
  }
}

// コマンドライン引数の処理
if (require.main === module) {
  main();
}

module.exports = { executeSqlFile, setupSchemas, setupRLS };