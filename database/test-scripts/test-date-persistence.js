// 日付保存の修正をテストするスクリプト
const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatePersistence() {
  console.log('🧪 日付保存の修正をテストします...\n');
  
  try {
    // 1. データベース接続テスト
    console.log('1️⃣ データベース接続テスト...');
    const { data: testData, error: testError } = await supabase
      .from('schools')
      .select('id, current_year, current_month, current_day')
      .limit(1);
    
    if (testError) {
      throw new Error(`接続テスト失敗: ${testError.message}`);
    }
    
    console.log('✅ データベース接続成功');
    
    if (testData.length === 0) {
      console.log('⚠️ テスト用の学校データがありません');
      return;
    }
    
    const testSchool = testData[0];
    console.log('📊 テスト対象学校:', {
      id: testSchool.id,
      current_date: `${testSchool.current_year}/${testSchool.current_month}/${testSchool.current_day}`
    });
    
    // 2. 日付更新テスト
    console.log('\n2️⃣ 日付更新テスト...');
    const newDate = {
      year: testSchool.current_year,
      month: testSchool.current_month,
      day: Math.min(testSchool.current_day + 1, 31) // 1日進める（月の最終日を考慮）
    };
    
    const { error: updateError } = await supabase
      .from('schools')
      .update({
        current_year: newDate.year,
        current_month: newDate.month,
        current_day: newDate.day,
        updated_at: new Date().toISOString()
      })
      .eq('id', testSchool.id);
    
    if (updateError) {
      throw new Error(`日付更新失敗: ${updateError.message}`);
    }
    
    console.log('✅ 日付更新成功:', newDate);
    
    // 3. 更新結果の確認
    console.log('\n3️⃣ 更新結果の確認...');
    const { data: updatedData, error: fetchError } = await supabase
      .from('schools')
      .select('current_year, current_month, current_day, updated_at')
      .eq('id', testSchool.id)
      .single();
    
    if (fetchError) {
      throw new Error(`更新結果の取得失敗: ${fetchError.message}`);
    }
    
    console.log('✅ 更新結果確認成功:', {
      new_date: `${updatedData.current_year}/${updatedData.current_month}/${updatedData.current_day}`,
      updated_at: updatedData.updated_at
    });
    
    // 4. 元の日付に戻す
    console.log('\n4️⃣ 元の日付に戻す...');
    const { error: rollbackError } = await supabase
      .from('schools')
      .update({
        current_year: testSchool.current_year,
        current_month: testSchool.current_month,
        current_day: testSchool.current_day,
        updated_at: new Date().toISOString()
      })
      .eq('id', testSchool.id);
    
    if (rollbackError) {
      console.warn('⚠️ ロールバックに失敗:', rollbackError.message);
    } else {
      console.log('✅ 元の日付に戻しました');
    }
    
    // 5. 最終確認
    console.log('\n5️⃣ 最終確認...');
    const { data: finalData, error: finalError } = await supabase
      .from('schools')
      .select('current_year, current_month, current_day')
      .eq('id', testSchool.id)
      .single();
    
    if (finalError) {
      throw new Error(`最終確認失敗: ${finalError.message}`);
    }
    
    const isOriginalDate = 
      finalData.current_year === testSchool.current_year &&
      finalData.current_month === testSchool.current_month &&
      finalData.current_day === testSchool.current_day;
    
    if (isOriginalDate) {
      console.log('✅ 最終確認成功: 元の日付に戻っています');
    } else {
      console.warn('⚠️ 最終確認: 日付が元に戻っていません');
      console.log('元の日付:', `${testSchool.current_year}/${testSchool.current_month}/${testSchool.current_day}`);
      console.log('現在の日付:', `${finalData.current_year}/${finalData.current_month}/${finalData.current_day}`);
    }
    
    console.log('\n🎉 日付保存の修正テストが完了しました！');
    
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生:', error.message);
    process.exit(1);
  }
}

// テスト実行
testDatePersistence();
