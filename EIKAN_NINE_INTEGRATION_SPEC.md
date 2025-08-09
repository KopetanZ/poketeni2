# ポケテニマスター - 栄冠ナイン統合仕様書
## 〜中毒性の高い無限育成ループシステム〜

## 1. システム概要
栄冠ナインの核となる「やめ時がない中毒性」「ギャンブル的緊張感」「戦略的確率システム」をテニス部管理ゲームに統合し、世代交代による無限育成ループと、カード戦術による試合の駆け引きを実現する。

### 1.1 中毒性設計の核心要素
- **無限世代交代**: 3年生の卒業と新入部員のスカウトによる永続的な育成サイクル  
- **ギャンブル的緊張感**: 戦術カードの成功確率による試合の駆け引き
- **戦略的確率管理**: プレイヤーの知識と判断で成功率を高められるシステム
- **ドラマ創出**: 弱小チームの逆転劇や天才新入部員の発掘

## 2. カレンダー・マス目システム

### 2.1 マス目の種類とテニス部への適用

#### 基本マス
- **青マス（良いイベント）**: 
  - 部員の調子向上
  - 練習効率アップ
  - 資金獲得
  - 評判向上

- **赤マス（悪いイベント）**:
  - 部員の怪我・調子悪化
  - 練習効率低下
  - 資金減少
  - 評判低下

- **白マス（ランダムイベント）**:
  - 50%の確率で青または赤イベント
  - 新部員加入チャンス
  - ランダムなアイテム獲得

- **緑マス（体力回復）**:
  - 全部員のスタミナ回復
  - 調子改善
  - やる気向上

- **黄マス（練習効率）**:
  - 練習カードが乗った場合: 経験値1.5倍
  - そうでない場合: 白マスと同様

#### 特殊マス
- **分岐マス**: 3つのルートから選択
  - 安全ルート（緑・青マス中心）
  - リスクルート（赤マス多いが報酬大）
  - バランスルート

- **特訓マス**: 
  - 3人の部員からランダム選択
  - 特殊能力習得チャレンジ
  - 成功確率は部員のレベルと調子に依存

- **イベントマス**:
  - 入学式、テスト期間、文化祭等
  - 固定イベントで特別な効果

### 2.2 実装仕様

```typescript
interface CalendarSquare {
  id: string;
  type: 'blue' | 'red' | 'white' | 'green' | 'yellow' | 'branch' | 'training' | 'event';
  date: Date;
  effects: SquareEffect[];
  specialConditions?: SpecialCondition[];
}

interface SquareEffect {
  type: 'stat_change' | 'item_gain' | 'event_trigger';
  target: 'player' | 'team' | 'school';
  value: number;
  description: string;
}
```

## 3. 戦術カードシステム（中毒性の核心）

### 3.1 戦術カードの基本設計
栄冠ナインの「カード指示による確率的成否判定」をテニス版に実装。プレイヤーの戦略的判断で成功率を高められる仕組みにより、ギャンブル的緊張感と戦略性を両立。

### 3.2 練習カード詳細仕様

#### 基礎練習カード（経験値倍率システム）
**サーブ強化練習**
- 基礎経験値: +25
- 体力影響: 満タン時100%, 体力0で82%
- 天候影響: 晴れ100%, 雨天60%
- コート影響: オムニコート+20%, 土コート-10%
- 黄マス効果: +50%ボーナス
- 成功演出: エースサーブアニメーション

**ボレー技術練習**
- 基礎経験値: +30
- 前衛適性選手: 経験値+40%
- パートナー相性: 好相性+25%
- 連続成功: 2回目以降+15%（最大3連鎖）
- 失敗時: 次回練習でやる気-10

**ストローク基礎練習**
- 基礎経験値: +35
- ベースライン適性: +30%
- 左利き選手: クロスコート練習+20%
- 集中力状態: 絶好調時+50%, 不調時-30%

**メンタル強化合宿**
- 基礎経験値: +20（全員対象）
- プレッシャー耐性: +15ポイント
- 大会前実施: 試合時緊張度-20%
- 合宿成功率: 75%（失敗時は疲労蓄積）

#### 特殊練習カード  
**プロコーチ指導**
- 基礎経験値: +50（選択した1人）
- コスト: 5000円
- 成功率: 80%（失敗時も経験値+15）
- 副次効果: 特殊能力習得チャンス+20%

**ライバル校との合同練習**
- 全員経験値: +20
- チーム結束力: +10
- 成功率: 70%（失敗時は相手校との関係悪化）
- 解禁条件: 評判「中堅」以上

**科学的トレーニング分析**  
- 選択した能力値: +30（データ分析に基づく効率化）
- 使用制限: 月1回
- 成功率: 95%
- 副次効果: 練習効率が2週間+15%向上

#### 回復・管理カード
**アイシング・マッサージ**
- 即座に体力100%回復（1人選択）
- 翌日の練習効率+20%
- 使用回数制限: 週2回まで
- コスト: 500円/回

**チーム懇親会**
- 全員やる気+15, 相性値+5
- 資金コスト: 3000円
- 成功率90%（10%で食中毒イベント）
- 効果持続: 2週間

### 3.3 カード希少度と入手システム

#### 希少度別効果倍率
- **ノーマル（白）**: 基本効果 × 1.0
- **レア（青）**: 基本効果 × 1.4 + 副次効果1つ
- **エピック（紫）**: 基本効果 × 1.8 + 副次効果2つ + 特殊演出  
- **レジェンダリー（金）**: 基本効果 × 2.5 + 副次効果3つ + チーム全体効果

#### 入手確率システム
```
ノーマル: 65%
レア: 25%  
エピック: 8%
レジェンダリー: 2%

※評判レベルによる補正
名門校: レジェンダリー確率+3%
強豪校: エピック確率+5%
```

### 3.2 カード希少度システム
- **ノーマル（白）**: 基本効果
- **レア（青）**: 効果1.5倍
- **エピック（紫）**: 効果2倍 + 追加効果
- **レジェンダリー（金）**: 効果3倍 + 複数追加効果

### 3.3 実装仕様

```typescript
interface PracticeCard {
  id: string;
  name: string;
  rarity: 'normal' | 'rare' | 'epic' | 'legendary';
  category: 'practice' | 'recovery' | 'tactical' | 'special';
  effects: CardEffect[];
  cost?: number;
  duration?: number;
  conditions?: UseCondition[];
}
```

## 4. 無限育成ループシステム（中毒性の核心）

### 4.1 世代交代システム
栄冠ナインの「やめ時がない」設計を完全再現。毎年3月に3年生が卒業し、4月に新入部員が加入する永続サイクル。

#### 卒業・進路システム
**3年生の進路決定（3月）**
- プロテニス選手: S+ランク選手のみ、10%の確率
- 大学推薦: A+以上で70%、B+以上で40%
- 就職・引退: その他全選手
- OB/OG登録: 卒業生は「OBコーチ」として再登場する可能性

**引退イベントの演出**
- 個別メッセージ（3年間の成長履歴表示）  
- 後輩へのアドバイス（+やる気効果）
- 部の歴史への記録（殿堂入り機能）
- 記念写真撮影（アルバム機能）

#### 新入生スカウトシステム（4月）
**スカウト対象の生成**
```typescript
// 新入生生成アルゴリズム
interface NewStudentPool {
  totalCandidates: number; // 評判レベル × 3-7人
  talentDistribution: {
    genius: 2%, // 天才肌（S+成長可能）
    talented: 8%, // 才能型（A+成長可能）  
    normal: 70%, // 普通型（B+成長可能）
    underdog: 20% // 大器晩成（覚醒システム対象）
  };
  specialAbilityChance: number; // 入学時点で特殊能力保持率
}
```

**スカウト戦略システム**
- 視察回数制限: 月4回まで（資金500円/回）
- 情報収集: 選手の潜在能力・性格・出身地
- 競合校との獲得競争（成功率60-90%）
- ランダム転校生イベント（年1回、超高確率で天才級）

### 4.2 覚醒システム（ドラマ創出）
弱かった選手が突然開花する栄冠ナインの「覚醒」を実装。

#### 覚醒条件
- 対象: 入学時能力値平均40以下の選手
- 発動条件: レギュラー出場50試合以上 + 評判「強豪」以上
- 確率: 3年生時に20%、2年生時に10%
- 効果: 全能力値+20-40のランダム上昇

#### 覚醒演出
- 専用カットシーン（「俺、変わったんだ！」）
- 能力値の劇的上昇アニメーション  
- チーム全体のやる気+20効果
- 地元新聞での特集記事イベント

### 4.3 永続的成長要素

#### 監督レベルシステム
```typescript
interface CoachLevel {
  currentLevel: number; // 1-20
  experience: number; // 試合勝利・大会成績で蓄積
  bonusEffects: {
    practiceEfficiency: number; // +2%/レベル
    scoutingAccuracy: number; // +3%/レベル  
    specialAbilityChance: number; // +1%/レベル
    teamMoraleBonus: number; // +1ポイント/レベル
  };
}
```

#### 学校歴史システム
- **伝説の先輩録**: 過去の名選手が記録される
- **栄光の記録**: 大会成績・連勝記録・個人記録
- **OBネットワーク**: 卒業生による支援イベント
- **ライバル校関係**: 対戦成績による因縁・友好関係

### 4.4 合宿システム（特殊能力習得イベント）

#### 夏季合宿（7-8月）
**プロコーチ招待合宿**
- 費用: 50,000円
- 効果: 全員の経験値+40, 特殊能力習得確率3倍
- 成功率: 85%（15%で雨天中止）

**海外遠征合宿**  
- 費用: 150,000円（評判「名門」以上で解禁）
- 効果: 全員+60経験値, 金特殊能力習得確率5倍
- 副次効果: 語学力向上（海外選手との交流イベント）

**地獄の特訓合宿**
- 費用: 20,000円  
- 効果: 体力系能力+50, 精神力+30
- リスク: 30%で怪我発生、10%で退部者発生
- 成功時: チーム結束+20, 「不屈の精神」取得

## 5. 隠しマス（年間特殊イベント）

### 5.1 テニス部版隠しイベント

#### 春季（4-6月）
- **4/15**: 新入部員歓迎会（新部員のやる気+20）
- **5/20**: 中間テスト期間（全部員の練習効率-20%, 3ターン）
- **6/10**: インターハイ予選（勝利で評判+5、資金+5000円）

#### 夏季（7-9月）
- **7/15**: 夏休み開始（練習効率+30%, 2週間）
- **8/10**: 技術指導会（赤特殊能力除去チャンス）
- **8/20**: 特別強化合宿（特殊能力習得確率2倍）
- **9/1**: 新学期開始（全部員のやる気リセット）

#### 秋季（10-12月）
- **10/15**: 文化祭（資金+3000円、評判+2）
- **11/20**: 期末テスト（練習効率-25%, 2ターン）
- **12/24**: クリスマス（ランダム好イベント確定）

#### 冬季（1-3月）
- **1/10**: 新年初練習（やる気+15、全員）
- **2/14**: バレンタイン（女子部員からの差し入れで回復）
- **3/15**: 卒業式（3年生部員の引退処理）

### 5.2 実装仕様

```typescript
interface HiddenEvent {
  id: string;
  date: string; // MM-DD format
  name: string;
  description: string;
  triggerCondition?: EventCondition;
  effects: EventEffect[];
  isRepeating: boolean;
}
```

## 6. 学校設備・評判システム

### 6.1 コートレベルシステム
栄冠ナインのグランドレベルをテニスコートに適用

#### コートレベル
1. **レベル1（土コート）**: 練習効率+0%
2. **レベル2（改良土コート）**: 練習効率+15%
3. **レベル3（クレーコート）**: 練習効率+30%
4. **レベル4（ハードコート）**: 練習効率+50%
5. **レベル5（オムニコート）**: 練習効率+75%

#### 設備追加
- **ボールマシン**: サーブ・リターン練習効率+20%
- **ビデオ分析システム**: 戦術理解度向上
- **フィットネス機器**: 体力トレーニング効果+25%
- **シャワー設備**: 練習後の体力回復率向上
- **ナイター設備**: 夜間練習可能（練習回数+1）

### 6.2 学校評判システム

#### 評判レベル
1. **弱小校**: 進行選択肢4個、新入部員3人/年
2. **中堅校**: 進行選択肢5個、新入部員4人/年
3. **有力校**: 進行選択肢6個、新入部員5人/年
4. **強豪校**: 進行選択肢7個、新入部員6人/年
5. **名門校**: 進行選択肢8個、新入部員7人/年

#### 評判による効果
- **スカウト範囲拡大**: 地域→全国へ
- **転校生確率向上**: より強い選手の加入
- **初期能力向上**: 新入部員の基本能力値上昇
- **資金援助**: 後援会からの寄付増加

### 6.3 実装仕様

```typescript
interface SchoolFacilities {
  courtLevel: number;
  equipment: Equipment[];
  reputation: number;
  reputationLevel: 'weak' | 'average' | 'strong' | 'elite' | 'legendary';
}

interface Equipment {
  id: string;
  name: string;
  effect: FacilityEffect;
  maintenanceCost: number;
  durability: number;
}
```

## 7. 性格・個性システム（戦略性向上）

### 7.1 選手性格システム
栄冠ナインの8種類の性格システムをテニス向けにカスタマイズ。それぞれの性格に固有の成長ボーナスと試合時特性を設定。

#### テニス版性格分類

**アグレッシブ型**
- 成長ボーナス: サーブ+20%, ストローク+15%
- 固有戦術: 「強気のプレー」（攻撃時成功率+15%）
- デメリット: 体力消費+10%, エラー率+5%
- 適性: 前衛・オールラウンダー

**テクニカル型**  
- 成長ボーナス: ボレー+20%, 戦術理解+25%
- 固有戦術: 「完璧なコース」（精密性+20%）
- デメリット: パワー-10%, プレッシャー時-5%
- 適性: 前衛・戦術家

**スタミナ型**
- 成長ボーナス: 体力+30%, メンタル+15%
- 固有戦術: 「粘りのテニス」（長期戦時能力+20%）
- デメリット: 瞬発力-10%
- 適性: 後衛・ベースライナー

**天才肌**
- 成長ボーナス: 全能力+10%（バランス型）
- 固有戦術: 「ひらめき」（ランダムで神プレー発動）
- デメリット: 練習態度ムラあり（-10%の確率で練習効果半減）
- 適性: 全ポジション

**努力家**
- 成長ボーナス: 経験値獲得+25%
- 固有戦術: 「執念のプレー」（劣勢時能力+15%）
- デメリット: 疲労蓄積+15%
- 適性: 全ポジション

**お調子者**
- 成長ボーナス: 調子が良い時+30%, 悪い時-20%
- 固有戦術: 「ノリノリプレー」（連続成功で効果倍増）
- デメリット: 調子の波が激しい
- 適性: ダブルスパートナー

**内気**
- 成長ボーナス: 基礎練習効果+20%
- 固有戦術: 「集中力」（重要な場面で冷静さ発揮）
- デメリット: 大舞台で-10%のペナルティ
- 適性: 後衛・サポート役

**リーダー**
- 成長ボーナス: チーム全体の練習効率+10%
- 固有戦術: 「チームワーク」（ダブルスで+20%効果）
- デメリット: 個人練習時-5%
- 適性: 部長・キャプテン

### 7.2 性格変更システム
- **占い師イベント**: 年2回（夏祭り・文化祭）で性格変更チャンス
- **メンタルコーチング**: 資金10,000円で性格調整可能
- **成功率**: 70%（失敗時は現状維持）
- **制限**: 同一選手は年1回まで

### 7.3 相性システム
**ダブルスペア相性**
- 同じ性格: 相性度+0（安定型）
- 補完関係: 相性度+20（アグレッシブ×テクニカルなど）
- 対立関係: 相性度-10（お調子者×内気など）
- 最高相性: +30%のダブルス戦績ボーナス

### 7.4 特殊能力習得システム

#### 習得確率調整（性格による補正込み）
```
基本確率:
★: 60% → 超やる気時 80%
★★: 50% → 超やる気時 70%  
★★★: 40% → 超やる気時 60%
★★★★: 30% → 超やる気時 50%
★★★★★: 20% → 超やる気時 40%

性格補正:
天才肌: 全特殊能力+15%
努力家: 基礎特殊能力+10%、上級特殊能力+5%
アグレッシブ: 攻撃系+20%、守備系-5%
テクニカル: 技術系+20%、パワー系-5%
```

#### テニス特殊能力詳細
**金特（★★★★★）**
- **雷光サーブ**: 仮想サーブ力+25, エース率+30%
- **完璧リターン**: 仮想リターン力+25, カウンター率+25%
- **奇跡ボレー**: 仮想ボレー力+25, 決定率+30%
- **氷帝の眼力**: 仮想メンタル+20, 相手の弱点看破

**青特（★★★★）**  
- **パワーサーブ**: 仮想サーブ力+15
- **クイックリターン**: 仮想リターン力+12, 反応+15%
- **ネットマスター**: 仮想ボレー力+15
- **鉄壁ガード**: 仮想守備力+18

**緑特（★★★）**
- **ラリーファイター**: 長期戦+15%効果
- **クラッチプレイヤー**: 重要場面+12%効果  
- **チームワーカー**: ダブルス+20%効果

**赤特（マイナス効果）**
- **ガラスのハート**: 仮想メンタル-15
- **スタミナドレイン**: 仮想体力-20
- **エラー癖**: 精密性-10%

## 8. 中毒性向上のための実装戦略

### 8.1 最優先実装要素（中毒性直結）

#### Phase 1A: 世代交代システム（最優先）
1. **3年生卒業システム**: 毎年3月の感動的な卒業イベント
2. **新入生スカウトシステム**: 4月の新戦力獲得のワクワク感
3. **OB/OG名簿システム**: 過去選手の記録保持
4. **覚醒システム**: 弱選手の突然の開花ドラマ

実装理由: 栄冠ナインの「やめ時がない」核心要素

#### Phase 1B: 性格・個性システム
1. **8種類の性格実装**: 戦略的な育成差別化
2. **性格別成長ボーナス**: 育成方針の多様化
3. **固有戦術システム**: 試合時の個性演出
4. **相性システム**: ダブルス組み合わせの戦略性

実装理由: プレイヤーの戦略的思考を刺激し、愛着形成を促進

### 8.2 第二優先実装要素

#### Phase 2A: カレンダー・マス目システム
1. **5色マス基本システム**: 青（良）・赤（悪）・白（ランダム）・緑（回復）・黄（効率）
2. **季節イベント**: 入学式・夏祭り・文化祭・卒業式
3. **隠しイベント**: 8月特訓・12月クリスマス等
4. **分岐選択システム**: 3ルート選択による戦略性

実装理由: ゲーム進行の骨格となるシステム

#### Phase 2B: 進行カードシステム  
1. **練習カード**: 4種希少度別の効果差別化
2. **体力・天候・コート補正**: 戦略的タイミング選択
3. **成功・失敗アニメーション**: ギャンブル感の演出
4. **カード入手システム**: 評判による希少度変動

実装理由: プレイヤーの毎回の選択に緊張感を付与

### 8.3 第三優先実装要素

#### Phase 3A: 学校評判・設備システム
1. **評判5段階システム**: 弱小→名門への成長実感
2. **コートレベル**: 練習効率の視覚的向上
3. **設備投資**: 長期的な成長戦略要素
4. **スカウト範囲拡大**: 評判向上の実利

#### Phase 3B: 合宿・特殊能力システム
1. **夏季合宿**: 3種類の特殊強化イベント
2. **特殊能力習得**: 確率システムの実装
3. **能力効果**: 仮想能力値による査定影響
4. **成功演出**: 習得時の派手なエフェクト

### 8.4 ユーザー体験設計（UX戦略）

#### 中毒性を高める演出設計
**小さな成功の積み重ね**
- 毎回の練習で+5～+15の細かい成長実感
- レベルアップ時の能力値上昇アニメーション
- 特殊能力習得時の専用カットシーン

**大きなドラマの創出**
- 弱小校→名門校への3年間サクセスストーリー
- 無名選手の覚醒による一発逆転劇
- 卒業時の感動的なメッセージとアルバム機能

**選択の重要感**
- カード選択による確率的成否の緊張感
- スカウト対象選択による将来への期待感  
- 進路選択による長期戦略の構築感

#### データ保存・継続設計
```typescript
interface GameSaveData {
  // 永続データ（引き継がれる要素）
  schoolHistory: SchoolRecord[]; // 歴代成績
  graduatedPlayers: Player[]; // 卒業生名簿
  coachLevel: number; // 監督レベル（永続）
  totalPlayTime: number; // 累計プレイ時間
  
  // 年度データ（リセット対象）
  currentPlayers: Player[]; // 現在の部員
  schoolReputation: number; // 学校評判
  facilities: Facility[]; // 設備状況
  calendar: CalendarState; // カレンダー進行
}
```

## 9. 実装のための具体的データ設計

### 9.1 中毒性システムのデータ構造

```typescript
// 世代交代システム
interface GenerationSystem {
  currentYear: number;
  academicCalendar: {
    graduationDate: Date; // 3月15日固定
    enrollmentDate: Date; // 4月10日固定
    scoutingPeriod: {start: Date, end: Date}; // 4月1-30日
  };
  
  graduationCandidates: Player[]; // 3年生リスト
  scoutingPool: NewStudent[]; // スカウト対象
  schoolHistory: SchoolRecord[]; // 歴代成績（永続保存）
}

// スカウトシステム  
interface NewStudent {
  id: string;
  name: string;
  potential: 'genius' | 'talented' | 'normal' | 'underdog';
  baseStats: PlayerStats;
  personality: PersonalityType;
  specialAbilities: SpecialAbility[];
  scoutingCost: number; // 500円/回
  competitorSchools: string[]; // 競合校リスト
  acquisitionChance: number; // 60-90%
}

// 覚醒システム
interface AwakeningSystem {
  eligiblePlayers: Player[]; // 覚醒候補（入学時平均40以下）
  awakeningConditions: {
    matchesPlayed: number; // 50試合以上
    schoolReputation: number; // 強豪以上
    timeInSchool: number; // 在籍期間
  };
  awakeningChance: {
    thirdYear: 0.20, // 3年生20%
    secondYear: 0.10, // 2年生10%
    firstYear: 0.05   // 1年生5%
  };
}
```

### 9.2 性格・個性システムデータ

```typescript
// 性格システム
interface PersonalitySystem {
  personalityTypes: {
    aggressive: PersonalityTraits;
    technical: PersonalityTraits;
    stamina: PersonalityTraits;
    genius: PersonalityTraits;
    hardworker: PersonalityTraits;
    cheerful: PersonalityTraits;
    shy: PersonalityTraits;
    leader: PersonalityTraits;
  };
}

interface PersonalityTraits {
  name: string;
  growthBonus: {[skill: string]: number}; // スキル別成長倍率
  specialTactic: SpecialTactic; // 固有戦術
  drawback: Drawback; // デメリット効果
  adaptability: PositionType[]; // 適性ポジション
}

// 相性システム
interface CompatibilityMatrix {
  [personality1: string]: {
    [personality2: string]: number; // -10 ~ +20の相性値
  };
}
```

### 9.3 進行カードシステムデータ

```typescript
// カードシステム
interface CardSystem {
  availableCards: PracticeCard[];
  cardInventory: {[rarity: string]: number}; // 希少度別保持数
  dailyCardGeneration: CardGenerationConfig;
}

interface PracticeCard {
  id: string;
  name: string;
  rarity: 'normal' | 'rare' | 'epic' | 'legendary';
  category: 'practice' | 'recovery' | 'special';
  effects: CardEffect[];
  
  // 栄冠ナイン風倍率システム
  baseExperience: number;
  multipliers: {
    stamina: {[level: number]: number}; // 体力0: 0.82, 満タン: 1.0
    weather: {[condition: string]: number}; // 晴れ: 1.0, 雨: 0.6
    court: {[type: string]: number}; // オムニ: 1.2, 土: 0.9
    yellowSquareBonus: number; // 1.5倍
  };
  
  successRate: number; // 成功確率
  failurePenalty?: EffectPenalty; // 失敗時のペナルティ
}

interface CardEffect {
  type: 'experience' | 'stamina' | 'morale' | 'special_ability_chance';
  target: 'individual' | 'team' | 'selected';
  value: number;
  duration?: number; // ターン数
  conditions?: string[]; // 発動条件
}
```

### 9.4 カレンダー・マス目システムデータ

```typescript
// カレンダーシステム
interface CalendarSystem {
  currentDate: Date;
  academicYear: number; // 1年目、2年目...
  currentSquare: CalendarSquare;
  movementHistory: CalendarSquare[]; // 移動履歴
  
  seasonalEvents: SeasonalEvent[];
  hiddenEvents: HiddenEvent[]; // 8/21特訓など
}

interface CalendarSquare {
  id: string;
  type: 'blue' | 'red' | 'white' | 'green' | 'yellow' | 'branch' | 'training' | 'event';
  date: Date;
  
  // 栄冠ナイン風効果システム
  effects: {
    positive: SquareEffect[]; // 青マス効果
    negative: SquareEffect[]; // 赤マス効果
    random: SquareEffect[]; // 白マス効果（50%ずつ）
    recovery: SquareEffect[]; // 緑マス効果
    efficiency: SquareEffect[]; // 黄マス効果
  };
  
  branchOptions?: BranchOption[]; // 分岐マス用
  specialConditions?: SpecialCondition[]; // 特殊発動条件
}

interface BranchOption {
  id: string;
  name: string;
  description: string;
  route: CalendarSquare[]; // 次の3-5マス
  risk: 'safe' | 'balanced' | 'risky';
  estimatedReward: number;
}
```

### 9.5 永続データ管理

```typescript
// セーブデータ構造
interface SaveData {
  // 永続要素（引き継がれる）
  persistent: {
    schoolHistory: SchoolRecord[];
    graduatedPlayers: Player[];
    coachLevel: number;
    totalPlayTime: number;
    achievementUnlocks: string[];
    facilityUpgrades: FacilityUpgrade[];
  };
  
  // 年度リセット要素
  current: {
    players: Player[];
    schoolStatus: SchoolStatus;
    calendar: CalendarSystem;
    cardSystem: CardSystem;
    events: EventSystem;
  };
}

// 学校記録（永続）
interface SchoolRecord {
  year: number;
  finalReputation: number;
  tournamentResults: TournamentResult[];
  graduatedPlayers: Player[];
  specialAchievements: string[]; // 「初の全国優勝」等
}
```

## 10. まとめ：中毒性最大化のポイント

### 10.1 実装必須要素（中毒性直結）
1. **世代交代の感動演出**: 卒業式→新入生スカウトのサイクル
2. **覚醒システム**: 弱選手の突然の開花ドラマ  
3. **性格による戦略差別化**: 8種類の育成方針
4. **確率システム**: カード選択による緊張感
5. **永続記録**: 学校の歴史蓄積

### 10.2 栄冠ナイン超えのオリジナル要素
1. **ポケモン要素**: 進化システムとの連携
2. **テニス特有のダブルス戦略**: 相性システム
3. **現代的UI/UX**: モバイル対応とアクセシビリティ
4. **SNS連携**: 卒業アルバムの共有機能

この仕様実装により、「気づけば何時間もプレイしてしまう」栄冠ナイン級の中毒性を持つテニス部管理ゲームが実現できます。