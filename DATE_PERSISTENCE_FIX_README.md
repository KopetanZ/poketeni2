# 日付保存問題の修正

## 概要

日付が保存されなくなる問題を修正し、より堅牢な日付管理システムを実装しました。

## 修正された問題点

### 1. 非同期処理の完了を待たない問題
- **問題**: `syncGameState()`内で`persistCalendarStateSync`の完了を待たずに処理が続行
- **修正**: 同期的な永続化処理を実装し、完了を確実に待つように変更

### 2. エラー時の状態復旧機能の不足
- **問題**: データベース更新エラーが発生しても、UI状態は更新されたまま
- **修正**: エラー時の状態復旧機能とロールバック機能を実装

### 3. 重複更新の防止が不十分
- **問題**: 同じ日付での重複更新を防ぐ仕組みが不完全
- **修正**: より厳密な重複更新防止と状態追跡を実装

## 実装された機能

### 1. 改善された永続化関数 (`persistCalendarStateSync`)

```typescript
// 戻り値: boolean (成功/失敗)
const persistCalendarStateSync = async (currentDate: CalendarDay): Promise<boolean>
```

**特徴:**
- 前回と異なる日付の場合のみ永続化
- ロールバック用の状態保存
- **重要**: `schoolId`ではなく`user_id`を使用してデータベースを更新
- エラー時の自動復旧
- 更新日時の記録

### 0. 根本的な問題の修正

**データベース更新の問題:**
- **問題**: `schoolId`を使用して`schools`テーブルを更新していた
- **原因**: `schools`テーブルの`id`フィールドは`text`型、`user_id`フィールドは`uuid`型
- **解決**: `user_id`を使用してデータベースを更新するように修正
- **影響**: カード使用後の日付が戻る問題が解決される

### 2. 強化された状態同期 (`syncGameState`)

```typescript
// 戻り値: boolean (成功/失敗)
const syncGameState = async (): Promise<boolean>
```

**特徴:**
- 永続化の成功/失敗を確実に追跡
- エラー時の自動状態復旧
- データベースとゲーム状態の整合性チェック
- **重要**: `user_id`を使用してデータベースから日付を取得

### 3. 改善された日付進行処理

**`handleAdvanceDay`:**
- 進行前の状態保存（ロールバック用）
- 同期的な状態同期
- 失敗時の自動ロールバック

**`handleCardUse`:**
- カード使用前後の状態追跡
- 同期的な永続化処理
- エラー時の状態復旧

### 4. 強化されたDateManager

**新機能:**
- `isValidDate()`: 日付の妥当性チェック
- `validateDateConsistency()`: データベースとゲーム状態の整合性チェック
- `forceDateSync()`: 日付の強制同期

## 使用方法

### 基本的な日付進行

```typescript
// 日付を進める
const handleAdvanceDay = async () => {
  try {
    const result = await gameFlow.advanceDay();
    const syncSuccess = await syncGameState(); // 永続化の完了を待つ
    
    if (!syncSuccess) {
      // 失敗時の処理
      console.warn('状態同期に失敗しました');
    }
  } catch (error) {
    // エラー処理
  }
};
```

### カード使用時の日付進行

```typescript
// カード使用
const handleCardUse = async (cardId: string) => {
  try {
    const result = gameFlow.useTrainingCard(card);
    const syncSuccess = await syncGameState(); // 永続化の完了を待つ
    
    if (!syncSuccess) {
      // ロールバック処理
      await rollbackToPreviousState();
    }
  } catch (error) {
    // エラー処理
  }
};
```

### 日付の整合性チェック

```typescript
// DateManagerを使用した整合性チェック
const consistency = await DateManager.validateDateConsistency(userId, gameDate);

if (!consistency.isConsistent) {
  console.log('日付の不一致を検出:', consistency.differences);
  
  // 強制同期
  await DateManager.forceDateSync(userId, consistency.databaseDate);
}
```

## エラーハンドリング

### 1. 永続化失敗時の処理

```typescript
try {
  const syncSuccess = await syncGameState();
  if (!syncSuccess) {
    // 自動ロールバック
    await rollbackToPreviousState();
  }
} catch (error) {
  // エラー後の状態復旧
  await attemptStateRecovery();
}
```

### 2. 状態復旧の流れ

1. **エラー検出**: 永続化処理でエラーが発生
2. **ロールバック試行**: 前回の状態に戻す
3. **データベース確認**: 現在のデータベース状態を取得
4. **整合性チェック**: ゲーム状態とデータベース状態を比較
5. **状態復旧**: 必要に応じてゲーム状態を修正

## ログとデバッグ

### ログレベル

- **✅ 成功**: 処理が正常に完了
- **⚠️ 警告**: 注意が必要だが処理は継続
- **❌ エラー**: 処理が失敗
- **🔄 復旧**: 状態復旧処理の実行
- **📅 日付**: 日付関連の処理
- **📊 データ**: データ比較・統計情報

### デバッグ情報

```typescript
// 詳細なログ出力
console.log('📊 日付比較:', { 
  database: dbDate, 
  game: gameDate 
});

console.log('🔄 エラー後の状態復旧を試行します');
console.log('✅ 状態復旧に成功しました');
```

## テスト

### テストスクリプトの実行

```bash
# 日付保存の修正をテスト
node test-date-persistence.js
```

**テスト内容:**
1. データベース接続テスト
2. 日付更新テスト
3. 更新結果の確認
4. ロールバックテスト
5. 最終確認

## 注意事項

### 1. 非同期処理の扱い
- すべての永続化処理は`await`で完了を待つ
- エラー処理は同期的に実行

### 2. 状態の整合性
- ゲーム状態とデータベース状態の不一致を自動検出
- 必要に応じて自動復旧を実行

### 3. パフォーマンス
- 重複更新の防止により、不要なデータベースアクセスを削減
- 状態追跡による効率的な処理

## 今後の改善点

### 1. 監視とアラート
- 日付の不一致をリアルタイムで監視
- 管理者への自動通知

### 2. バッチ処理
- 複数の日付更新を一括処理
- トランザクション管理の強化

### 3. メトリクス収集
- 日付更新の成功率
- エラー発生頻度
- 状態復旧の効果測定

## トラブルシューティング

### よくある問題

**Q: 日付が進まない**
A: データベース接続を確認し、`syncGameState()`の戻り値をチェック

**Q: エラーが発生する**
A: コンソールログでエラーの詳細を確認し、状態復旧が実行されているかチェック

**Q: 状態が不整合になる**
A: `DateManager.validateDateConsistency()`で整合性をチェックし、必要に応じて強制同期を実行

## サポート

問題が発生した場合は、以下の情報を確認してください：

1. ブラウザのコンソールログ
2. データベースの接続状態
3. ゲーム状態とデータベース状態の整合性
4. エラーメッセージの詳細

修正されたシステムにより、日付の保存・更新がより確実になり、エラー時の状態復旧も自動的に実行されるようになりました。
