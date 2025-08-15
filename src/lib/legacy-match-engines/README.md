# Legacy Match Engines

このディレクトリには、Phase 2リファクタリングで置き換えられた古いマッチエンジンファイルが保存されています。

## 移動されたファイル

- `match-engine.ts` - 基本マッチエンジン
- `advanced-match-engine.ts` - 高度マッチエンジン  
- `interactive-match-engine.ts` - インタラクティブマッチエンジン
- `match-equipment-integration.ts` - 装備統合システム
- `unified-match-system.ts` - 統合システム（部分実装）

## 新しい統合システム

これらのファイルの機能は `/src/lib/match-system/` の新しい統合システムに統合されました：

- `/src/lib/match-system/types.ts` - 統一型定義
- `/src/lib/match-system/base-engine.ts` - 基本エンジン機能  
- `/src/lib/match-system/advanced-features.ts` - 高度機能
- `/src/lib/match-system/interactive-features.ts` - インタラクティブ機能
- `/src/lib/match-system/index.ts` - メインエクスポート

## 削除予定

これらのファイルは新システムが安定動作することを確認後、削除される予定です。

## 移行完了日

2025年8月13日 - Phase 2 マッチエンジン統合完了