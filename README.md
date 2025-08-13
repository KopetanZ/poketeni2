# ⚡ ポケテニマスター - PokeTeni Master

栄冠ナイン風のポケモンテニス部管理シミュレーションゲーム

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)

## 🎮 ゲーム概要

**ポケテニマスター**は、ポケモンとテニスを融合した栄冠ナイン式の部活動管理ゲームです。テニス部の監督として、ポケモン選手たちを育成し、全国大会を目指します。

### 🌟 主な特徴

- **🎯 栄冠ナイン風システム**: カードベースの練習進行と確率的成長
- **⚡ 大幅拡張された特殊能力システム**: 44種から250種以上への拡張基盤
- **🐾 約1000種のポケモン**: 第1-3世代を中心とした大幅拡充データベース
- **🏫 47都道府県対応ライバル校**: 200校以上の多様な対戦相手
- **📅 カレンダーシステム**: 5色マス（青・赤・白・緑・黄）による戦略的進行
- **💎 希少度システム**: 4段階のカード希少度（ノーマル・レア・エピック・レジェンダリー）
- **🏆 階層制大会システム**: 地区→県→地方→全国→国際の段階的競技
- **🎾 本格的な対戦システム**: 栄冠ナイン風の監督指示・戦術カード・固有戦術
- **📊 詳細データ分析**: 戦績・成長追跡・ランキング機能
- **🎲 個体値システム**: ポケモン本家準拠のIV/EV/特性システム

## 🚀 技術スタック

### フロントエンド
- **Next.js 15.4.5** (App Router)
- **React 18** (Server Components + Client Components)  
- **TypeScript** (厳格な型チェック)
- **Tailwind CSS** + shadcn/ui
- **Framer Motion** (アニメーション)

### バックエンド・データベース
- **Supabase** (PostgreSQL + Authentication + RLS)
- **PokeAPI** (ポケモンデータ取得)

### デプロイ・開発
- **Vercel** (デプロイメント)
- **Git** (バージョン管理)
- **ESLint + Prettier** (コード品質)

## 📊 開発状況

### ✅ 完成済み機能
- [x] 栄冠ナイン風UI/UX（EikanNineLayout）
- [x] 初期チーム生成・オンボーディング
- [x] 大幅拡張された特殊能力システム（44種、250種以上への拡張基盤）
- [x] 約1000種のポケモンデータベース（第1-3世代中心）
- [x] 練習カードシステム（4段階希少度）
- [x] 高度試合シミュレーション
- [x] 認証システム（Supabase Auth）
- [x] 個体値システム（IV/EV/特性）
- [x] 47都道府県対応ライバル校システム（200校以上）
- [x] 階層制大会システム（地区→全国→国際）
- [x] 対戦システム仕様書（詳細設計完了）

### 🚧 部分実装・修正が必要
- [⚠️] カレンダー・マス目システム（5色マス基本実装済み、すごろく連携要修正）
- [⚠️] データ分析・統計機能（基本機能のみ、詳細分析要実装）
- [⚠️] 進化システム（基本構造のみ、詳細条件要実装）

### 🔜 今後の実装予定
- [ ] 対戦システムの実装（栄冠ナイン風監督指示・戦術カード・固有戦術）
- [ ] 進化システムの完全実装（段階的進化・条件システム）
- [ ] カレンダーとすごろくの完全連携
- [ ] 世代交代システム（卒業・新入生）
- [ ] 覚醒システム（弱選手の開花）
- [ ] 装備・アイテムシステムの完全統合
- [ ] マルチプレイヤー機能

## 🎮 プレイ方法

### 初回プレイ
1. 学校名を設定
2. 御三家ポケモンから1匹選択
3. 初期チーム（6名）でゲーム開始
4. 練習カードで部員を育成

### 基本の流れ
1. **練習**: カード選択で時間進行・選手育成
2. **試合**: 戦術選択による高度バトル
3. **イベント**: 季節イベントや特殊能力習得
4. **大会**: トーナメントで全国制覇を目指す
5. **ライバル校**: 47都道府県の多様な対戦相手と戦う

## 📱 デプロイ・開発

### 環境構築
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

### 環境変数
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### データベースセットアップ
```sql
-- Supabaseでスキーマを実行
psql -f database-setup.sql
psql -f add-special-abilities-columns.sql
psql -f add-stat-gage-system.sql
```

## 🏗️ アーキテクチャ

### ディレクトリ構成
```
src/
├── app/                    # Next.js App Router
├── components/             # React コンポーネント
│   ├── layout/            # レイアウト系
│   ├── cards/             # カードシステム
│   ├── events/            # イベントシステム
│   ├── rival-schools/     # ライバル校システム
│   └── onboarding/        # オンボーディング
├── lib/                   # ビジネスロジック
│   ├── calendar-system.ts # カレンダー管理
│   ├── training-card-system.ts # カード機能
│   ├── integrated-game-flow.ts # 統合制御
│   ├── rival-school-generator.ts # ライバル校生成
│   └── enhanced-special-abilities-manager.ts # 拡張特殊能力
└── types/                 # TypeScript型定義
```

### 主要機能
- **🎨 EikanNineLayout**: 栄冠ナイン風のUI
- **📅 CalendarSystem**: 5色マス確率分布
- **🃏 TrainingCardSystem**: 4希少度×5成功段階
- **⚡ EnhancedSpecialAbilitySystem**: 44種から250種以上への拡張基盤
- **🏟️ AdvancedMatchEngine**: 高度試合シミュレーション
- **🎾 TennisMatchSystem**: 栄冠ナイン風対戦システム（仕様完了）
- **🏫 RivalSchoolSystem**: 47都道府県対応ライバル校
- **🎯 IndividualValueSystem**: ポケモン本家準拠の個体値

## 🎯 ゲーム設計思想

### 栄冠ナイン要素
- **カードベース進行**: 戦略的な時間管理
- **確率的成長**: 予測不能な楽しさ
- **長期的視点**: 3年間での計画的育成

### パワプロ要素  
- **大幅拡張された特殊能力**: 44種から250種以上への拡張基盤
- **詳細ステータス**: 数値による成長実感
- **クリティカル**: 劇的な試合展開

### ポケモン要素
- **コレクション性**: 約1000種のバリエーション
- **タイプシステム**: 戦術的な深み
- **個体値システム**: 本家準拠の育成要素
- **進化システム**: 段階的成長目標

## 🤝 コントリビューション

プルリクエスト・イシュー報告歓迎！

## 📜 ライセンス

MIT License

---

**🎾 ポケモンでテニス部を全国制覇！栄冠ナイン級の中毒性をお楽しみください！ 🏆**
