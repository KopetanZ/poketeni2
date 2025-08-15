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

### 4. 5分間隔の自動保存機能の未実装
- **問題**: 定期的な自動保存機能が存在しない
- **修正**: 5分間隔での自動保存機能を実装

### 5. タブ切り替え時の日付巻き戻り問題
- **問題**: 他のタブに移動後、学校タブに戻ると日付が戻ってしまう
- **修正**: ページ可視性変更時の状態同期機能を実装

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

### 2. 5分間隔の自動保存機能

```typescript
// 自動保存の間隔（5分 = 300,000ミリ秒）
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

// 自動保存機能を開始
const startAutoSave = useCallback(() => {
  autoSaveTimerRef.current = setInterval(async () => {
    console.log('🔄 5分間隔の自動保存を実行中...');
    const success = await syncGameState();
    // 結果をログ出力
  }, AUTO_SAVE_INTERVAL);
}, []);
```

**特徴:**
- 5分間隔での自動実行
- ゲームデータ利用可能時に自動開始
- コンポーネントアンマウント時に自動停止
- エラーハンドリング付き

### 3. タブ切り替え時の状態同期

```typescript
// ページの可視性変更時の状態同期（タブ切り替え対応）
useEffect(() => {
  const handleVisibilityChange = async () => {
    if (!document.hidden && allPlayers && allPlayers.length > 0 && schoolId) {
      // データベースから最新の状態を取得して同期
      // 日付の不一致がある場合のみ復旧
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [allPlayers, schoolId, gameFlow]);
```

**特徴:**
- `visibilitychange`イベントでタブ切り替えを検知
- データベースから最新の日付状態を取得
- 不一致がある場合のみ自動復旧
- ユーザーに通知

### 4. ゲーム状態の強制保存機能

```typescript
// ゲーム状態の強制保存関数（カード使用後などに使用）
const forceSaveGameState = async (): Promise<boolean> => {
  // カレンダー状態、プレイヤー情報、学校統計を強制保存
}
```

**特徴:**
- カード使用後の確実な保存
- 全ゲーム要素の包括的保存
- エラー時の詳細ログ出力

### 5. コンポーネントマウント時の状態復元

```typescript
// コンポーネントマウント時にデータベースから最新の日付を取得して同期
const restoreDateFromDatabase = async () => {
  // データベースから最新の日付を取得
  // ゲーム状態と比較して不一致があれば復旧
};
```

**特徴:**
- マウント時の自動状態復元
- データベースとの整合性チェック
- 必要に応じた自動復旧

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
    
    // カレンダー進行完了を確認してから状態同期
    await new Promise(resolve => setTimeout(resolve, 500));
    const syncSuccess = await syncGameState(); // 永続化の完了を待つ
    
    if (!syncSuccess) {
      // ロールバック処理
      await rollbackToPreviousState();
    }
    
    // カード使用後の強制保存
    const forceSaveSuccess = await forceSaveGameState();
    if (forceSaveSuccess) {
      console.log('✅ カード使用後の強制保存が完了しました');
    }
  } catch (error) {
    // エラー処理
  }
};
```

### 自動保存の管理

```typescript
// 自動保存は自動的に開始・停止されます
// 手動で制御したい場合：

// 自動保存を開始
startAutoSave();

// 自動保存を停止
stopAutoSave();
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

### 3. タブ切り替え時の復旧

1. **可視性変更検知**: `visibilitychange`イベントでタブ切り替えを検知
2. **データベース確認**: 最新の日付状態を取得
3. **状態比較**: ゲーム状態とデータベース状態を比較
4. **自動復旧**: 不一致があれば自動的に復旧

## ログとデバッグ

### ログレベル

- **✅ 成功**: 処理が正常に完了
- **⚠️ 警告**: 注意が必要だが処理は継続
- **❌ エラー**: 処理が失敗
- **🔄 復旧**: 状態復旧処理の実行
- **📅 日付**: 日付関連の処理
- **📊 データ**: データ比較・統計情報
- **💾 保存**: データベース保存処理
- **🚀 自動保存**: 自動保存機能の開始

### デバッグ情報

```typescript
// 詳細なログ出力
console.log('📊 日付比較:', { 
  database: dbDate, 
  game: gameDate 
});

console.log('🔄 エラー後の状態復旧を試行します');
console.log('✅ 状態復旧に成功しました');

console.log('🔄 5分間隔の自動保存を実行中...');
console.log('✅ 自動保存が完了しました');

console.log('🔄 ページが可視になったため、状態同期を実行します...');
console.log('✅ タブ切り替え時に日付状態を復旧しました');
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
5. 自動保存機能テスト
6. タブ切り替え時の状態復旧テスト
7. 最終確認

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
- 5分間隔の自動保存で適切な頻度を維持

### 4. 自動保存の動作
- ゲームデータ利用可能時に自動開始
- コンポーネントアンマウント時に自動停止
- エラーが発生しても継続実行

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
- 自動保存の実行頻度と成功率

### 4. ユーザー設定
- 自動保存間隔のカスタマイズ
- 保存タイミングの手動制御

## トラブルシューティング

### よくある問題

**Q: 日付が進まない**
A: データベース接続を確認し、`syncGameState()`の戻り値をチェック

**Q: エラーが発生する**
A: コンソールログでエラーの詳細を確認し、状態復旧が実行されているかチェック

**Q: 状態が不整合になる**
A: `DateManager.validateDateConsistency()`で整合性をチェックし、必要に応じて強制同期を実行

**Q: タブ切り替え時に日付が戻る**
A: `visibilitychange`イベントリスナーが正常に動作しているかチェック

**Q: 自動保存が動作しない**
A: ゲームデータが利用可能になっているか、`startAutoSave()`が呼ばれているかチェック

## サポート

問題が発生した場合は、以下の情報を確認してください：

1. ブラウザのコンソールログ
2. データベースの接続状態
3. ゲーム状態とデータベース状態の整合性
4. エラーメッセージの詳細
5. 自動保存の実行ログ
6. タブ切り替え時の状態同期ログ

修正されたシステムにより、日付の保存・更新がより確実になり、エラー時の状態復旧も自動的に実行されるようになりました。また、5分間隔の自動保存とタブ切り替え時の状態同期により、ユーザーエクスペリエンスが大幅に向上しています。
