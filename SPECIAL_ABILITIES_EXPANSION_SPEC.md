# 特殊能力システム大幅拡充仕様書

**作成日**: 2025-08-13  
**目的**: 本家パワプロ・栄冠ナイン並みの特殊能力システム実装  
**目標**: 現在20種 → 200種以上の特殊能力体系構築

---

## 📊 現状分析と目標設定

### 現在の実装状況
- **現在の特殊能力数**: 20種
- **分類**: 金特（ゴールド）、青特（ブルー）、赤特（レッド）の3色
- **対象**: テニス特化（サーブ・リターン・ボレー・ストローク・メンタル・フィジカル）

### 本家栄冠ナインの規模
- **総特殊能力数**: 約230種
- **金特**: 65種（投手29 + 野手32 + 捕手3 + 共通1）
- **青特**: 97種（投手35 + 野手45 + 捕手3 + 共通14）
- **赤特**: 38種（投手16 + 野手16 + 捕手2 + 共通4）
- **その他**: 薄青・緑・青赤など特殊カテゴリ

### 拡張目標
- **目標特殊能力数**: 250種（本家を上回る）
- **テニス特化分類**: 7カテゴリ × 各30-40種
- **レベル階層**: 各能力に上位・下位版を設定
- **状況特化**: 試合状況・環境・相性特化能力

---

## 🎯 テニス版特殊能力分類システム

### 1. 基本分類（7カテゴリ）

```typescript
export type TennisAbilityCategory = 
  | 'serve'        // サーブ系（40種）
  | 'return'       // リターン系（35種）
  | 'volley'       // ボレー・ネット系（35種）
  | 'stroke'       // ストローク・ベースライン系（40種）
  | 'mental'       // メンタル・戦術系（45種）
  | 'physical'     // フィジカル・体力系（25種）
  | 'situational'; // 状況・環境系（30種）

export type TennisAbilityColor = 
  | 'diamond'      // ◇ダイヤ（超レア金特）5種
  | 'gold'         // ★金特（強力な正効果）65種
  | 'blue'         // ●青特（正効果）80種
  | 'green'        // ▲緑特（成長・練習系）35種
  | 'purple'       // ■紫特（特殊・変則系）25種
  | 'orange'       // ◆橙特（チーム・リーダー系）20種
  | 'gray'         // ◎灰特（条件付き効果）20種
  | 'red';         // ×赤特（負効果・欠点）15種

export type TennisAbilityRank = 
  | 'SS+' // 伝説級（ダイヤ特殊能力）
  | 'SS'  // 超一流（最上位金特）
  | 'S+'  // 一流上位（上位金特）
  | 'S'   // 一流（金特）
  | 'A+'  // 準一流（上位青特）
  | 'A'   // 上級（青特）
  | 'B+'  // 中級上位（特殊系）
  | 'B'   // 中級（基本青特）
  | 'C'   // 初級（緑特）
  | 'D'   // 欠点（赤特）;
```

### 2. 特殊能力効果システム拡張

```typescript
interface EnhancedSpecialAbilityEffects {
  // 基本能力値への影響（既存）
  serveBoost?: number;
  returnBoost?: number;
  volleyBoost?: number;
  strokeBoost?: number;
  mentalBoost?: number;
  staminaBoost?: number;

  // 詳細状況別効果（大幅拡張）
  situationalEffects?: {
    // 試合状況
    firstServeBonus?: number;        // ファーストサーブ時
    secondServeBonus?: number;       // セカンドサーブ時
    breakPointBonus?: number;        // ブレークポイント時
    serviceGameBonus?: number;       // サービスゲーム時
    returnGameBonus?: number;        // リターンゲーム時
    tiebreakBonus?: number;          // タイブレーク時
    matchPointBonus?: number;        // マッチポイント時
    setPointBonus?: number;          // セットポイント時
    behindBonus?: number;            // 劣勢時（セット・ゲーム遅れ）
    leadBonus?: number;              // 優勢時（セット・ゲーム先行）
    evenBonus?: number;              // 拮抗時（イーブン状態）
    
    // ラリー・ショット状況
    shortRallyBonus?: number;        // 短いラリー（1-3打）
    longRallyBonus?: number;         // 長いラリー（10打以上）
    approachShotBonus?: number;      // アプローチショット時
    passingshotBonus?: number;      // パッシングショット時
    dropShotBonus?: number;          // ドロップショット時
    lobBonus?: number;               // ロブ時
    counterAttackBonus?: number;     // カウンターアタック時
    
    // 疲労・体力状況
    freshBonus?: number;             // 疲労なし（試合序盤）
    tiredPenaltyReduction?: number;  // 疲労時のペナルティ軽減
    overtimeBonus?: number;          // 延長戦時
    finalSetBonus?: number;          // ファイナルセット時
    
    // 相手タイプ別
    vsLeftHandedBonus?: number;      // 左利き相手
    vsRightHandedBonus?: number;     // 右利き相手
    vsAggressiveBonus?: number;      // アグレッシブ相手
    vsDefensiveBonus?: number;       // 守備的相手
    vsTechnicalBonus?: number;       // 技術的相手
    vsPowerBonus?: number;           // パワー相手
    vsBalancedBonus?: number;        // バランス相手
    vsCounterBonus?: number;         // カウンター相手
    
    // ランク・レベル差
    vsHigherRankBonus?: number;      // 格上相手
    vsLowerRankPenalty?: number;     // 格下相手への慢心
    vsSameRankBonus?: number;        // 同格相手
    
    // 環境・コート
    hardCourtBonus?: number;         // ハードコート
    clayCourtBonus?: number;         // クレーコート
    grassCourtBonus?: number;        // グラスコート
    indoorCourtBonus?: number;       // インドアコート
    sunnyWeatherBonus?: number;      // 晴天時
    windyWeatherBonus?: number;      // 風強時
    rainWeatherBonus?: number;       // 雨天時（屋根下）
    hotWeatherBonus?: number;        // 暑い日
    coldWeatherBonus?: number;       // 寒い日
    
    // 時間・大会
    morningBonus?: number;           // 午前の試合
    afternoonBonus?: number;         // 午後の試合
    eveningBonus?: number;           // 夕方の試合
    prefecturalTournamentBonus?: number; // 県大会
    regionalTournamentBonus?: number;    // 地方大会
    nationalTournamentBonus?: number;    // 全国大会
    practiceMatchBonus?: number;         // 練習試合
  };

  // 特殊効果（拡張）
  specialEffects?: {
    criticalHitRate?: number;        // クリティカル率
    errorReduction?: number;         // エラー率軽減
    staminaConsumptionReduction?: number; // スタミナ消費軽減
    injuryResistance?: number;       // 怪我耐性
    consistencyBoost?: number;       // 安定性向上
    concentrationBoost?: number;     // 集中力向上
    intimidationEffect?: number;     // 威圧効果（相手能力低下）
    courageBoost?: number;          // 勇気（プレッシャー耐性）
    adaptabilityBoost?: number;     // 適応力（環境変化対応）
    experienceGainMultiplier?: number; // 経験値獲得倍率
    
    // 確率発動系
    miracleReturnChance?: number;    // 奇跡のリターン確率
    perfectServeChance?: number;     // 完璧なサーブ確率
    brilliantVolleyChance?: number;  // 華麗なボレー確率
    unstoppableStrokeChance?: number; // 止められないストローク確率
    mentalBreakthroughChance?: number; // メンタル突破確率
    comebackChance?: number;         // 逆転チャンス向上
    
    // 持続効果
    momentumBuilding?: number;       // 勢い構築効果
    rhythmMaintenance?: number;      // リズム維持効果
    confidenceBuilding?: number;     // 自信構築効果
    teamSpiritBoost?: number;       // チーム士気向上
    opponentPressure?: number;       // 相手へのプレッシャー
    crowdInfluence?: number;         // 観客への影響力
  };

  // 成長・練習効果
  growthEffects?: {
    practiceEfficiencyBoost?: number;    // 練習効率向上
    skillGrowthMultiplier?: number;      // スキル成長倍率
    specialAbilityLearningBonus?: number; // 特殊能力習得ボーナス
    injuryPreventionBoost?: number;      // 怪我予防効果
    fatigueRecoveryBoost?: number;       // 疲労回復促進
    mentalTrainingBonus?: number;        // メンタル練習ボーナス
    physicalTrainingBonus?: number;      // フィジカル練習ボーナス
    technicalTrainingBonus?: number;     // 技術練習ボーナス
    teamworkTrainingBonus?: number;      // チームワーク練習ボーナス
    leadershipDevelopment?: number;      // リーダーシップ育成
  };

  // チーム・リーダーシップ効果
  teamEffects?: {
    teamMoraleBoost?: number;           // チーム士気向上
    teammateSkillBoost?: number;        // チームメイトスキル向上
    coachingAbility?: number;           // 指導能力
    strategicInfluence?: number;        // 戦術影響力
    newbieEducation?: number;           // 新人教育効果
    teamUnityBoost?: number;            // チーム団結力向上
    practiceMotivation?: number;        // 練習意欲向上
    matchPreparation?: number;          // 試合準備効果
  };
}
```

---

## 🌟 具体的特殊能力一覧（分類別）

### 1. サーブ系特殊能力（40種）

#### ダイヤ級（SS+）
```typescript
{
  id: 'legendary_serve_god',
  name: '伝説のサーブ神',
  englishName: 'Legendary Serve God',
  category: 'serve',
  color: 'diamond',
  rank: 'SS+',
  description: 'サーブゲームを支配する絶対的な力',
  effects: {
    serveBoost: 35,
    situationalEffects: {
      firstServeBonus: 25,
      serviceGameBonus: 30,
      matchPointBonus: 20
    },
    specialEffects: {
      perfectServeChance: 30,
      criticalHitRate: 25,
      intimidationEffect: 15
    }
  }
}
```

#### 金特級（SS・S+・S）
```typescript
// 超一流レベル
{
  id: 'ace_master_supreme',
  name: '超人エースマスター',
  englishName: 'Supreme Ace Master',
  category: 'serve',
  color: 'gold',
  rank: 'SS',
  description: 'エースを量産する超絶サーブ技術',
  effects: {
    serveBoost: 25,
    situationalEffects: {
      firstServeBonus: 20,
      serviceGameBonus: 15,
      tiebreakBonus: 20
    },
    specialEffects: {
      perfectServeChance: 25,
      criticalHitRate: 20
    }
  }
},

// 一流上位レベル
{
  id: 'power_serve_elite',
  name: 'エリートパワーサーブ',
  englishName: 'Elite Power Serve',
  category: 'serve',
  color: 'gold',
  rank: 'S+',
  description: '圧倒的パワーで相手を制圧',
  effects: {
    serveBoost: 20,
    situationalEffects: {
      firstServeBonus: 15,
      vsDefensiveBonus: 12
    },
    specialEffects: {
      criticalHitRate: 15,
      intimidationEffect: 8
    }
  }
},

// 一流レベル
{
  id: 'precision_serve_master',
  name: '精密サーブ職人',
  englishName: 'Precision Serve Master',
  category: 'serve',
  color: 'gold',
  rank: 'S',
  description: 'ミリ単位の精度でコーナーを突く',
  effects: {
    serveBoost: 15,
    situationalEffects: {
      firstServeBonus: 12,
      secondServeBonus: 8
    },
    specialEffects: {
      errorReduction: 15,
      consistencyBoost: 12
    }
  }
},

{
  id: 'clutch_server',
  name: 'クラッチサーバー', 
  englishName: 'Clutch Server',
  category: 'serve',
  color: 'gold',
  rank: 'S',
  description: '重要な場面でこそ真価を発揮するサーブ',
  effects: {
    serveBoost: 12,
    situationalEffects: {
      breakPointBonus: 20,
      matchPointBonus: 18,
      setPointBonus: 15,
      behindBonus: 10
    }
  }
}
```

#### 青特級（A+・A・B+・B）
```typescript
{
  id: 'spin_serve_artist',
  name: 'スピンサーブ芸術家',
  englishName: 'Spin Serve Artist',
  category: 'serve',
  color: 'blue',
  rank: 'A+',
  description: '多彩なスピンで相手を翻弄',
  effects: {
    serveBoost: 10,
    situationalEffects: {
      secondServeBonus: 12,
      vsAggressiveBonus: 8
    },
    specialEffects: {
      consistencyBoost: 10
    }
  }
},

{
  id: 'quick_serve',
  name: 'クイックサーブ',
  englishName: 'Quick Serve',
  category: 'serve',
  color: 'blue',
  rank: 'A',
  description: '素早いサーブでリズムを作る',
  effects: {
    serveBoost: 8,
    situationalEffects: {
      serviceGameBonus: 10
    },
    specialEffects: {
      momentumBuilding: 8
    }
  }
},

{
  id: 'wide_serve',
  name: 'ワイドサーブ',
  englishName: 'Wide Serve',
  category: 'serve',
  color: 'blue',
  rank: 'B+',
  description: 'サイドラインぎりぎりを狙う技術',
  effects: {
    serveBoost: 6,
    situationalEffects: {
      vsDefensiveBonus: 8
    }
  }
},

{
  id: 'body_serve',
  name: 'ボディサーブ',
  englishName: 'Body Serve',
  category: 'serve',
  color: 'blue',
  rank: 'B',
  description: '相手の体勢を崩すサーブ',
  effects: {
    serveBoost: 5,
    situationalEffects: {
      firstServeBonus: 6
    }
  }
}
```

#### その他カラー特殊能力
```typescript
// 緑特（成長系）
{
  id: 'serve_training_genius',
  name: 'サーブ練習の天才',
  englishName: 'Serve Training Genius',
  category: 'serve',
  color: 'green',
  rank: 'C',
  description: 'サーブ練習での成長が早い',
  effects: {
    growthEffects: {
      practiceEfficiencyBoost: 20, // サーブ練習のみ
      skillGrowthMultiplier: 1.5
    }
  }
},

// 紫特（特殊系）
{
  id: 'mystery_serve',
  name: '怪奇サーブ',
  englishName: 'Mystery Serve',
  category: 'serve',
  color: 'purple',
  rank: 'B+',
  description: '相手が読めない不可思議なサーブ',
  effects: {
    serveBoost: 5,
    specialEffects: {
      miracleReturnChance: -10, // 相手のミラクルリターン確率減少
      opponentPressure: 8
    }
  }
},

// 橙特（チーム系）
{
  id: 'serve_coach',
  name: 'サーブコーチ',
  englishName: 'Serve Coach',
  category: 'serve',
  color: 'orange',
  rank: 'B',
  description: 'チームメイトのサーブを指導',
  effects: {
    serveBoost: 3,
    teamEffects: {
      teammateSkillBoost: 5, // サーブのみ
      coachingAbility: 8
    }
  }
},

// 灰特（条件付き）
{
  id: 'sunny_day_server',
  name: '晴天サーバー',
  englishName: 'Sunny Day Server',
  category: 'serve',
  color: 'gray',
  rank: 'B',
  description: '晴れた日のサーブが格別',
  effects: {
    situationalEffects: {
      sunnyWeatherBonus: 15
    }
  }
},

// 赤特（負効果）
{
  id: 'double_fault_prone',
  name: 'ダブルフォルト癖',
  englishName: 'Double Fault Prone',
  category: 'serve',
  color: 'red',
  rank: 'D',
  description: '緊張するとダブルフォルトしやすい',
  effects: {
    situationalEffects: {
      secondServeBonus: -10,
      matchPointBonus: -15,
      behindBonus: -8
    }
  }
}
```

### 2. リターン系特殊能力（35種）

#### ダイヤ級
```typescript
{
  id: 'return_emperor',
  name: 'リターン皇帝',
  englishName: 'Return Emperor',
  category: 'return',
  color: 'diamond',
  rank: 'SS+',
  description: 'どんなサーブも完璧に返す絶対的技術',
  effects: {
    returnBoost: 35,
    situationalEffects: {
      returnGameBonus: 30,
      vsLeftHandedBonus: 15,
      vsRightHandedBonus: 15,
      breakPointBonus: 25
    },
    specialEffects: {
      miracleReturnChance: 25,
      criticalHitRate: 20,
      adaptabilityBoost: 20
    }
  }
}
```

#### 金特級サンプル
```typescript
{
  id: 'break_master',
  name: 'ブレークマスター',
  englishName: 'Break Master',
  category: 'return',
  color: 'gold',
  rank: 'SS',
  description: 'ブレークチャンスを確実に決める',
  effects: {
    returnBoost: 20,
    situationalEffects: {
      breakPointBonus: 25,
      returnGameBonus: 20,
      behindBonus: 15
    }
  }
},

{
  id: 'defensive_wall_supreme',
  name: '究極鉄壁ディフェンス',
  englishName: 'Supreme Defensive Wall',
  category: 'return',
  color: 'gold',
  rank: 'S+',
  description: '絶対に破られない守備',
  effects: {
    returnBoost: 18,
    staminaBoost: 10,
    situationalEffects: {
      longRallyBonus: 20,
      vsAggressiveBonus: 15,
      overtimeBonus: 12
    },
    specialEffects: {
      errorReduction: 25,
      staminaConsumptionReduction: 15
    }
  }
},

{
  id: 'counter_attack_king',
  name: 'カウンターアタック王',
  englishName: 'Counter Attack King',
  category: 'return',
  color: 'gold',
  rank: 'S',
  description: '守備から一転、鋭い反撃を仕掛ける',
  effects: {
    returnBoost: 15,
    situationalEffects: {
      counterAttackBonus: 25,
      behindBonus: 18,
      passingshotBonus: 15
    }
  }
}
```

### 3. ボレー・ネット系特殊能力（35種）

#### ダイヤ級
```typescript
{
  id: 'net_phantom',
  name: 'ネットの幻影',
  englishName: 'Net Phantom',
  category: 'volley',
  color: 'diamond',
  rank: 'SS+',
  description: 'ネットを支配する神速のボレー技術',
  effects: {
    volleyBoost: 35,
    situationalEffects: {
      approachShotBonus: 25,
      shortRallyBonus: 30,
      vsDefensiveBonus: 20
    },
    specialEffects: {
      brilliantVolleyChance: 30,
      criticalHitRate: 25
    }
  }
}
```

#### 金特級サンプル
```typescript
{
  id: 'net_dominator_supreme',
  name: '絶対ネット支配者',
  englishName: 'Supreme Net Dominator',
  category: 'volley',
  color: 'gold',
  rank: 'SS',
  description: 'ネット前を完全制圧',
  effects: {
    volleyBoost: 25,
    situationalEffects: {
      approachShotBonus: 20,
      leadBonus: 15
    },
    specialEffects: {
      brilliantVolleyChance: 20,
      intimidationEffect: 10
    }
  }
},

{
  id: 'angle_volley_master',
  name: 'アングルボレー職人',
  englishName: 'Angle Volley Master',
  category: 'volley',
  color: 'gold',
  rank: 'S+',
  description: '鋭角なボレーで相手を翻弄',
  effects: {
    volleyBoost: 18,
    situationalEffects: {
      approachShotBonus: 15,
      vsDefensiveBonus: 12
    },
    specialEffects: {
      criticalHitRate: 15
    }
  }
},

{
  id: 'drop_volley_genius',
  name: 'ドロップボレーの天才',
  englishName: 'Drop Volley Genius', 
  category: 'volley',
  color: 'gold',
  rank: 'S',
  description: '絶妙なタッチでドロップボレーを決める',
  effects: {
    volleyBoost: 15,
    situationalEffects: {
      dropShotBonus: 20
    },
    specialEffects: {
      consistencyBoost: 12
    }
  }
}
```

### 4. ストローク・ベースライン系特殊能力（40種）

#### ダイヤ級
```typescript
{
  id: 'baseline_emperor',
  name: 'ベースライン皇帝',
  englishName: 'Baseline Emperor',
  category: 'stroke',
  color: 'diamond',
  rank: 'SS+',
  description: 'ベースラインからの絶対的支配力',
  effects: {
    strokeBoost: 35,
    situationalEffects: {
      longRallyBonus: 25,
      behindBonus: 20,
      clayCourtBonus: 15,
      passingshotBonus: 25
    },
    specialEffects: {
      unstoppableStrokeChance: 25,
      consistencyBoost: 20
    }
  }
}
```

### 5. メンタル・戦術系特殊能力（45種）

#### ダイヤ級
```typescript
{
  id: 'mental_titan',
  name: 'メンタルの巨人',
  englishName: 'Mental Titan',
  category: 'mental',
  color: 'diamond',
  rank: 'SS+',
  description: '絶対に折れない精神力と戦術眼',
  effects: {
    mentalBoost: 35,
    situationalEffects: {
      matchPointBonus: 30,
      tiebreakBonus: 25,
      behindBonus: 25,
      finalSetBonus: 20
    },
    specialEffects: {
      mentalBreakthroughChance: 30,
      courageBoost: 25,
      comebackChance: 20
    }
  }
}
```

#### 金特級サンプル
```typescript
{
  id: 'tactical_mastermind',
  name: '戦術の鬼才',
  englishName: 'Tactical Mastermind',
  category: 'mental',
  color: 'gold',
  rank: 'SS',
  description: '試合を読み切る戦術的天才',
  effects: {
    mentalBoost: 20,
    situationalEffects: {
      vsAggressiveBonus: 15,
      vsDefensiveBonus: 15,
      vsTechnicalBonus: 15,
      adaptabilityBoost: 20
    }
  }
},

{
  id: 'pressure_crusher',
  name: 'プレッシャークラッシャー',
  englishName: 'Pressure Crusher',
  category: 'mental',
  color: 'gold',
  rank: 'S+',
  description: 'プレッシャーを力に変える',
  effects: {
    mentalBoost: 18,
    situationalEffects: {
      nationalTournamentBonus: 20,
      matchPointBonus: 15,
      vsHigherRankBonus: 12
    },
    specialEffects: {
      courageBoost: 15
    }
  }
}
```

---

## 🎮 特殊能力取得システム

### 1. 取得方法の多様化

```typescript
interface AbilityAcquisitionMethod {
  method: 'training' | 'match' | 'event' | 'evolution' | 'item' | 'coach' | 'combination';
  probability: number;
  requirements: AbilityRequirement;
}

interface AbilityRequirement {
  // 基本要件
  minLevel?: number;
  minStats?: Partial<TennisSkills>;
  requiredAbilities?: string[];
  forbiddenAbilities?: string[];
  
  // 実績要件
  matchWins?: number;
  tournamentWins?: number;
  specificOpponentDefeats?: string[];
  
  // 練習要件
  practiceHours?: number;
  specificTraining?: string[];
  mentalTraining?: number;
  
  // 特殊条件
  pokemonType?: string[];
  region?: string[];
  season?: string[];
  weatherConditions?: string[];
  
  // 確率調整
  rarityModifier?: number;
  luckFactor?: number;
}

// 取得確率システム
const ABILITY_ACQUISITION_RATES = {
  diamond: {
    training: 0.1,      // 0.1%（超レア）
    match: 0.2,         // 特別な勝利で
    event: 0.5,         // 特殊イベントで
    evolution: 1.0,     // 進化時に確率UP
    item: 2.0,          // 専用アイテム使用時
    combination: 0.3    // 特定能力組み合わせ
  },
  
  gold: {
    training: 0.5,      // 0.5%
    match: 1.0,         // 重要な勝利で
    event: 2.0,         // 特殊イベントで
    evolution: 3.0,     // 進化時
    item: 5.0,          // 金特書使用時
    combination: 1.0
  },
  
  blue: {
    training: 2.0,      // 2%
    match: 3.0,         // 通常勝利で
    event: 5.0,         // イベントで
    evolution: 8.0,     // 進化時
    item: 15.0,         // 青特書使用時
    combination: 3.0
  },
  
  green: {
    training: 5.0,      // 5%
    match: 2.0,         // 練習試合でも
    event: 8.0,         // 練習イベントで
    item: 25.0,         // 練習アイテム使用時
  }
};
```

### 2. 特殊能力の組み合わせシステム

```typescript
interface AbilityCombination {
  requiredAbilities: string[];
  resultAbility: string;
  combinationName: string;
  description: string;
  successRate: number;
}

const ABILITY_COMBINATIONS: AbilityCombination[] = [
  {
    requiredAbilities: ['power_serve', 'precision_serve'],
    resultAbility: 'perfect_serve_master',
    combinationName: 'パワー＋精密→完璧',
    description: 'パワーと精密性を併せ持つ究極のサーブ',
    successRate: 15
  },
  
  {
    requiredAbilities: ['defensive_wall', 'counter_attack_king'],
    resultAbility: 'absolute_defense_counter',
    combinationName: '鉄壁＋カウンター→絶対',
    description: '守備から反撃への完璧な流れ',
    successRate: 12
  },
  
  {
    requiredAbilities: ['clutch_performer', 'pressure_crusher', 'comeback_king'],
    resultAbility: 'mental_titan',
    combinationName: '3大メンタル→巨人',
    description: '3つのメンタル能力が融合した究極の精神力',
    successRate: 5
  }
];
```

---

## 📊 バランシング・調整システム

### 1. 能力値計算の詳細化

```typescript
class EnhancedAbilityCalculator {
  // 複数特殊能力の相互作用計算
  static calculateCombinedEffects(
    abilities: SpecialAbility[],
    situation: MatchSituation,
    environment: EnvironmentFactors
  ): CombinedAbilityEffect {
    
    let totalEffect = {
      skillBoosts: {} as Record<string, number>,
      specialEffects: {} as Record<string, number>,
      situationalModifiers: {} as Record<string, number>
    };
    
    // 基本効果の積算
    abilities.forEach(ability => {
      const baseEffect = this.calculateBaseEffect(ability, situation);
      this.mergeEffects(totalEffect, baseEffect);
    });
    
    // 相乗効果の計算
    const synergyEffects = this.calculateSynergyEffects(abilities);
    this.applySynergyEffects(totalEffect, synergyEffects);
    
    // 上限・下限の適用
    this.applyEffectLimits(totalEffect);
    
    // 環境要因の適用
    this.applyEnvironmentalFactors(totalEffect, environment);
    
    return totalEffect;
  }
  
  // 特殊能力間の相乗効果
  private static calculateSynergyEffects(abilities: SpecialAbility[]): SynergyEffect[] {
    const synergies: SynergyEffect[] = [];
    
    // 同系統能力の相乗効果
    const serveAbilities = abilities.filter(a => a.category === 'serve');
    if (serveAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'serve',
        multiplier: 1.1 + (serveAbilities.length - 2) * 0.05,
        description: 'サーブ系能力の相乗効果'
      });
    }
    
    // 特定組み合わせの相乗効果
    const hasClutch = abilities.some(a => a.id === 'clutch_performer');
    const hasPressure = abilities.some(a => a.id === 'pressure_relief');
    if (hasClutch && hasPressure) {
      synergies.push({
        type: 'specific_combination',
        abilities: ['clutch_performer', 'pressure_relief'],
        effect: { mentalBoost: 5 },
        description: 'クラッチ＋プレッシャー無効の相乗効果'
      });
    }
    
    return synergies;
  }
}
```

### 2. 動的難易度調整

```typescript
class DynamicAbilityBalance {
  // プレイヤーの特殊能力レベルに応じてAIも調整
  static adjustAIAbilities(
    playerAbilities: SpecialAbility[],
    aiDifficultyLevel: number
  ): SpecialAbility[] {
    
    const playerStrength = this.calculateAbilityStrength(playerAbilities);
    const targetAIStrength = playerStrength * (0.8 + aiDifficultyLevel * 0.4);
    
    return this.generateBalancedAIAbilities(targetAIStrength);
  }
  
  // 特殊能力の希少性動的調整
  static adjustAbilityRarity(
    ability: SpecialAbility,
    playerProgress: PlayerProgress
  ): number {
    let baseRarity = ABILITY_BASE_RARITY[ability.color];
    
    // プレイヤーの進行度に応じて調整
    if (playerProgress.schoolLevel > 20) {
      baseRarity *= 1.5; // 上級者には希少能力が出やすく
    }
    
    // 既に持っている能力は出にくく
    if (playerProgress.ownedAbilities.includes(ability.id)) {
      baseRarity *= 0.1;
    }
    
    return baseRarity;
  }
}
```

---

## 💾 データベース設計

### 1. 特殊能力マスターテーブル

```sql
-- 特殊能力マスターテーブル（大幅拡張）
CREATE TABLE special_abilities_master (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  category TEXT NOT NULL, -- serve, return, volley, stroke, mental, physical, situational
  color TEXT NOT NULL,    -- diamond, gold, blue, green, purple, orange, gray, red
  rank TEXT NOT NULL,     -- SS+, SS, S+, S, A+, A, B+, B, C, D
  description TEXT NOT NULL,
  
  -- 効果データ（JSONB）
  effects JSONB NOT NULL,
  
  -- 取得条件
  acquisition_requirements JSONB,
  acquisition_methods JSONB,
  
  -- バランス調整用
  power_level INTEGER DEFAULT 100,
  rarity_weight DECIMAL(5,3) DEFAULT 1.000,
  
  -- UI表示用
  icon_path TEXT,
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- メタデータ
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 特殊能力組み合わせテーブル
CREATE TABLE ability_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combination_name TEXT NOT NULL,
  required_abilities TEXT[] NOT NULL,
  result_ability_id TEXT REFERENCES special_abilities_master(id),
  success_rate DECIMAL(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレイヤー特殊能力テーブル（拡張）
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_abilities_detailed JSONB DEFAULT '{}';

-- 特殊能力習得履歴テーブル
CREATE TABLE ability_acquisition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  ability_id TEXT REFERENCES special_abilities_master(id),
  acquisition_method TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  success_rate_used DECIMAL(5,2),
  was_combination BOOLEAN DEFAULT false,
  combination_id UUID REFERENCES ability_combinations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. インデックス・パフォーマンス最適化

```sql
-- 検索用インデックス
CREATE INDEX idx_special_abilities_category ON special_abilities_master(category);
CREATE INDEX idx_special_abilities_color ON special_abilities_master(color);
CREATE INDEX idx_special_abilities_rank ON special_abilities_master(rank);
CREATE INDEX idx_special_abilities_active ON special_abilities_master(is_active);

-- 複合インデックス
CREATE INDEX idx_special_abilities_category_color ON special_abilities_master(category, color);
CREATE INDEX idx_special_abilities_rank_rarity ON special_abilities_master(rank, rarity_weight);

-- JSONB用インデックス
CREATE INDEX idx_players_special_abilities_gin ON players USING GIN (special_abilities_detailed);
CREATE INDEX idx_ability_effects_gin ON special_abilities_master USING GIN (effects);
```

---

## 📋 実装フェーズ計画

### Phase 1: 基盤拡張 (2-3週間)
1. **データベース設計・拡張**
   - 新テーブル作成・既存テーブル拡張
   - 250種の特殊能力データ投入
   - インデックス最適化

2. **効果計算システム拡張**
   - 複雑な効果計算エンジン実装
   - 相乗効果システム構築
   - バランス調整機能

### Phase 2: 特殊能力システム実装 (2週間)
1. **取得システム実装**
   - 多様な取得方法実装
   - 確率計算システム
   - 組み合わせシステム

2. **表示・管理UI実装**
   - 特殊能力一覧・詳細表示
   - 効果予測システム
   - 組み合わせ提案機能

### Phase 3: バランス調整・統合 (1-2週間)
1. **ゲームバランス調整**
   - 特殊能力効果の微調整
   - 取得確率の最適化
   - AI対戦相手の能力調整

2. **既存システムとの統合**
   - 試合エンジンとの統合
   - 成長システムとの連携
   - ライバル校システムとの統合

---

## 🎯 期待される効果

### ゲーム体験の向上
1. **戦略性の大幅向上**: 250種の特殊能力による多様な戦術選択
2. **長期目標の充実**: レア能力取得への長期的な目標設定
3. **個性の表現**: プレイヤーごとの独自の能力構成
4. **コレクション要素**: 特殊能力コンプリートの楽しみ

### システムの持続性
1. **バランス調整容易性**: 効果値・確率の動的調整
2. **拡張性**: 新特殊能力の追加容易性
3. **データ活用**: プレイヤー行動による自動調整
4. **メタゲーム形成**: 特殊能力組み合わせの研究・発見

現在の20種から250種への大幅拡張により、本家パワプロ・栄冠ナインを上回る特殊能力システムが実現されます。各特殊能力が試合の様々な局面で意味を持ち、プレイヤーの戦略選択を大きく広げる、奥深いゲーム体験を提供できます。