# テニス版栄冠ナイン試合シミュレーション完全仕様書

**作成日**: 2025-08-13  
**目的**: 栄冠ナインの面白さを継承したテニス試合システム実装  
**参考**: 栄冠ナイン試合システム分析結果（SHIAI_SPEC.md）

---

## 🎯 システム設計概要

### 基本コンセプト
- **栄冠ナイン継承**: 要所指示・経験値システム・固有戦術を完全踏襲
- **テニス特化**: サーブ・リターン・ネットプレー・ラリーの独特な攻防
- **戦略性重視**: 限られた指示機会での選択肢と駆け引き
- **成長実感**: 試合を通じた選手の着実な成長システム

---

## 🏆 試合形式・構造設計

### 1. 団体戦形式

```typescript
interface TeamMatchFormat {
  format: 'school_championship'; // 全国高等学校テニス大会準拠
  matches: [
    { type: 'singles', position: 1, order: 1 },  // 1番シングルス
    { type: 'singles', position: 2, order: 2 },  // 2番シングルス  
    { type: 'doubles', position: 1, order: 3 },  // 1番ダブルス
    { type: 'singles', position: 3, order: 4 },  // 3番シングルス
    { type: 'doubles', position: 2, order: 5 }   // 2番ダブルス
  ];
  winCondition: 3; // 5試合中3勝で団体戦勝利
  setFormat: 'best_of_3_with_final_tiebreak'; // 2セット先取、3セット目はタイブレーク
}
```

### 2. 個別試合構造

```typescript
interface MatchStructure {
  // セット構造
  setsToWin: 2;           // 2セット先取
  gamesPerSet: 6;         // 6ゲーム先取（5-5時は7ゲーム）
  tiebreakAt: [6, 6];     // 6-6でタイブレーク
  finalSetTiebreak: 10;   // 3セット目は10ポイント先取タイブレーク
  
  // ゲーム構造
  pointsPerGame: 4;       // 4ポイント先取（15-30-40-Game）
  deuceSystem: true;      // デュース・アドバンテージあり
  
  // ポイント構造（最小単位）
  serve: {
    firstServe: true,      // ファーストサーブ権
    secondServe: true,     // セカンドサーブ権
    doubleFault: false     // ダブルフォルトで失点
  };
}
```

---

## 🎮 監督操作システム

### 1. 操作タイミング設計

```typescript
interface DirectorOperation {
  // 基本進行
  autoProgress: true;           // 基本は完全自動進行
  
  // 必須操作タイミング（栄冠ナイン準拠）
  mandatoryOperations: [
    {
      timing: 'match_start',
      description: '試合開始前の選手・戦術選択',
      timeLimit: 30000 // 30秒
    },
    {
      timing: 'featured_player_serve',
      description: '注目選手のサーブゲーム全て',
      frequency: 'every_serve_game'
    },
    {
      timing: 'critical_points',
      description: '重要局面での指示',
      conditions: [
        'break_point',      // ブレークポイント
        'set_point',        // セットポイント
        'match_point',      // マッチポイント
        'deuce_point',      // デュースポイント
        'tiebreak_all'      // タイブレークは全ポイント
      ]
    },
    {
      timing: 'final_set_all',
      description: 'ファイナルセットは全ゲーム操作可能',
      condition: 'set_score_1_1'
    }
  ];
  
  // 任意操作タイミング
  optionalOperations: [
    {
      timing: 'changeover',
      description: 'チェンジコート時の選手交代・戦術変更',
      frequency: 'every_odd_game'
    },
    {
      timing: 'timeout',
      description: 'タイムアウト（1セットに1回）',
      limit: 1,
      duration: 90000 // 90秒
    }
  ];
}
```

### 2. 注目選手制度

```typescript
interface FeaturedPlayerSystem {
  selectionTiming: 'pre_match';
  maxFeaturedPlayers: 2; // シングルス1名、ダブルス1ペア
  
  benefits: {
    operationFrequency: 'all_serve_games',    // 全サーブゲームで操作可能
    experienceMultiplier: 1.5,               // 経験値1.5倍
    detailedStatistics: true,                // 詳細統計表示
    specialTacticAvailable: true             // 固有戦術使用可能
  };
  
  // 注目選手選択基準
  recommendations: [
    { type: 'ace_player', description: 'チームエース' },
    { type: 'captain', description: 'キャプテン' },
    { type: 'rookie', description: '新人（成長重視）' },
    { type: 'clutch_player', description: '勝負強い選手' }
  ];
}
```

---

## 🃏 戦術カードシステム

### 1. 基本戦術カード（1-7レベル）

```typescript
interface TacticCard {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  successRate: number;
  riskLevel: number;
  effects: TacticEffects;
}

const TACTIC_CARDS: TacticCard[] = [
  {
    level: 1,
    name: '安全第一',
    successRate: 95,
    riskLevel: 5,
    effects: {
      serveBonus: -10,
      returnBonus: +15,
      errorReduction: +20,
      description: 'ミスを避けて確実にコートに入れる'
    }
  },
  {
    level: 2,
    name: '安定志向',
    successRate: 88,
    riskLevel: 10,
    effects: {
      serveBonus: -5,
      returnBonus: +10,
      errorReduction: +10,
      description: '堅実に相手コートを狙う'
    }
  },
  {
    level: 3,
    name: '標準戦術',
    successRate: 80,
    riskLevel: 15,
    effects: {
      serveBonus: 0,
      returnBonus: 0,
      errorReduction: 0,
      description: '通常の積極性でプレー'
    }
  },
  {
    level: 4,
    name: '攻撃志向',
    successRate: 70,
    riskLevel: 25,
    effects: {
      serveBonus: +10,
      strokeBonus: +8,
      errorReduction: -5,
      description: '積極的に攻めてポイントを狙う'
    }
  },
  {
    level: 5,
    name: '強攻策',
    successRate: 60,
    riskLevel: 35,
    effects: {
      serveBonus: +15,
      strokeBonus: +12,
      volleyBonus: +10,
      errorReduction: -10,
      description: '強力なショットで一気に決める'
    }
  },
  {
    level: 6,
    name: '全力攻撃',
    successRate: 45,
    riskLevel: 50,
    effects: {
      serveBonus: +25,
      strokeBonus: +20,
      volleyBonus: +15,
      errorReduction: -20,
      criticalHitRate: +15,
      description: 'ほぼ全力で攻撃、リスク覚悟'
    }
  },
  {
    level: 7,
    name: '必殺の一撃',
    successRate: 30,
    riskLevel: 70,
    effects: {
      serveBonus: +40,
      strokeBonus: +35,
      volleyBonus: +25,
      errorReduction: -30,
      criticalHitRate: +25,
      description: '最大威力、成功すれば確実にポイント'
    }
  }
];
```

### 2. 特殊戦術カード

```typescript
interface SpecialTacticCards {
  // おまかせカード（栄冠ナイン準拠）
  auto: {
    name: 'おまかせ',
    description: 'AIに完全委任、選手信頼度+15',
    successRate: 75, // 平均的な成功率
    trustBonus: 15,
    experienceBonus: 1.2
  };
  
  // スタイル指定カード
  styleCards: [
    {
      name: 'ネットラッシュ',
      description: '積極的にネットに出る',
      effects: { volleyBonus: +20, approachShotBonus: +15 },
      condition: 'volley_skill >= 40'
    },
    {
      name: 'ベースライン',
      description: 'ベースラインから粘り強く',
      effects: { strokeBonus: +15, staminaConsumption: -10 },
      condition: 'stroke_skill >= 40'
    },
    {
      name: 'サーブ&ボレー',
      description: 'サーブ後すぐネットへ',
      effects: { serveBonus: +10, volleyBonus: +15 },
      condition: 'serve_skill >= 50 && volley_skill >= 40'
    },
    {
      name: 'ドロップショット',
      description: '相手を前に呼び出す戦術',
      effects: { dropShotSuccess: +25, surpriseEffect: +10 },
      condition: 'stroke_skill >= 45'
    },
    {
      name: 'パワープレー',
      description: '強打で相手を圧倒',
      effects: { strokeBonus: +20, intimidationEffect: +10 },
      condition: 'serve_skill >= 60 || stroke_skill >= 60'
    }
  ];
  
  // チーム戦術カード
  teamCards: [
    {
      name: '大声援',
      description: '次の戦術カードレベル+1',
      effect: 'next_card_level_plus_1',
      cooldown: 3, // 3ゲームに1回使用可能
      teamMoraleBonus: +10
    },
    {
      name: 'タイムアウト',
      description: '選手の疲労回復・戦術会議',
      effects: { staminaRecovery: +20, mentalReset: +15 },
      limit: 1, // 1セットに1回
      duration: 90000 // 90秒
    }
  ];
}
```

### 3. カードレベル判定システム

```typescript
interface CardLevelDetermination {
  // 基本レベル上限
  baseLevelCap: 5;
  
  // レベル6出現条件
  level6Conditions: {
    serve: 'serve_skill >= 70 || hasSpecialAbility("power_serve")',
    return: 'return_skill >= 70 || hasSpecialAbility("return_ace")',
    volley: 'volley_skill >= 70 || hasSpecialAbility("net_dominator")',
    stroke: 'stroke_skill >= 70 || hasSpecialAbility("power_stroke")',
    mental: 'mental >= 70 || hasSpecialAbility("clutch_performer")'
  };
  
  // レベル7出現条件（超難条件）
  level7Conditions: {
    serve: 'serve_skill >= 85 && hasSpecialAbility("ace_master")',
    return: 'return_skill >= 85 && hasSpecialAbility("return_emperor")',
    volley: 'volley_skill >= 85 && hasSpecialAbility("net_phantom")',
    stroke: 'stroke_skill >= 85 && hasSpecialAbility("baseline_emperor")',
    mental: 'mental >= 85 && hasSpecialAbility("mental_titan")'
  };
  
  // 条件修正要因
  modifiers: {
    teamMorale: 'high_morale_adds_plus_1',
    oppositionStrength: 'vs_weaker_opponent_minus_1',
    fatigue: 'high_fatigue_minus_1',
    pressure: 'high_pressure_situation_plus_1',
    court_advantage: 'home_court_plus_1'
  };
}
```

---

## ⚡ 固有戦術システム

### 1. 性格別固有戦術

```typescript
interface PersonalityTactics {
  // 攻撃型性格
  aggressive: {
    name: 'フレッシュサーブ',
    description: 'サーブ力爆発、1ゲーム無敵状態',
    effects: {
      duration: '1_game',
      serveBonus: +35,
      firstServeSuccessRate: +40,
      aceRate: +25
    },
    cooldown: 'once_per_match',
    animation: 'red_aura_effect'
  };
  
  // 守備型性格
  defensive: {
    name: '鉄壁の粘り',
    description: '相手のショット成功率を大幅減少',
    effects: {
      duration: '1_game',
      opponentErrorRate: +30,
      returnSuccessRate: +25,
      staminaConsumption: -50
    },
    cooldown: 'once_per_match',
    animation: 'blue_shield_effect'
  };
  
  // クール型性格
  cool: {
    name: '究極の冷静',
    description: '全戦術カードレベル+1、判断力向上',
    effects: {
      duration: '2_games',
      allTacticLevelBonus: +1,
      errorReduction: +20,
      pressureResistance: +30
    },
    cooldown: 'once_per_match',
    animation: 'white_glow_effect'
  };
  
  // 熱血型性格
  hotblooded: {
    name: '魂の一撃',
    description: 'ストローク・サーブ威力大幅UP',
    effects: {
      duration: '1_game',
      serveBonus: +25,
      strokeBonus: +25,
      intimidationEffect: +20,
      teamMoraleBonus: +15
    },
    cooldown: 'once_per_match',
    animation: 'fire_burst_effect'
  };
  
  // チーム型性格
  team_player: {
    name: '全員集合',
    description: 'チーム全体のメンタル・能力向上',
    effects: {
      duration: '2_games',
      teamWideBonus: +10,
      allPlayerMental: +20,
      trustIncreaseRate: +50
    },
    cooldown: 'once_per_match',
    animation: 'golden_team_aura'
  };
  
  // 天才型性格
  genius: {
    name: '天才の閃き',
    description: 'ランダムで超強力効果発動',
    effects: {
      duration: '1_rally',
      randomEffects: [
        { effect: 'perfect_shot', probability: 40 },
        { effect: 'opponent_confusion', probability: 30 },
        { effect: 'miracle_return', probability: 20 },
        { effect: 'time_stop', probability: 10 }
      ]
    },
    cooldown: 'once_per_match',
    animation: 'rainbow_sparkle_effect'
  };
}
```

### 2. 固有戦術発動条件

```typescript
interface TacticActivationConditions {
  // 基本発動条件
  baseConditions: {
    playerLevel: 10,        // レベル10以上
    matchImportance: 'important', // 重要な試合のみ
    playerCondition: 'good_or_better' // 体調良好
  };
  
  // 発動推奨タイミング
  recommendedTimings: [
    {
      timing: 'behind_in_score',
      description: 'スコアで劣勢時',
      bonusEffect: +10
    },
    {
      timing: 'crucial_game',
      description: '重要なゲーム（5-4など）',
      bonusEffect: +15
    },
    {
      timing: 'opponent_momentum',
      description: '相手が連続ポイント中',
      bonusEffect: +20
    },
    {
      timing: 'final_set',
      description: 'ファイナルセット',
      bonusEffect: +25
    }
  ];
  
  // 発動制限
  restrictions: {
    maxPerMatch: 1,         // 1試合に1回のみ
    cooldownBetweenMatches: 0, // 試合間クールダウンなし
    fatigueRestriction: 'cannot_use_if_exhausted'
  };
}
```

---

## 💯 経験値・成長システム

### 1. 出場経験値システム

```typescript
interface ParticipationExperience {
  // 基本出場経験値（栄冠ナイン準拠の比率）
  baseExperience: {
    singles_starter: 100,      // シングルス先発
    doubles_starter: 80,       // ダブルス先発
    substitute_play: 60,       // 途中出場
    bench_member: 40,          // ベンチ入り
    reserve_member: 20         // 控え選手
  };
  
  // 勝敗ボーナス
  resultBonus: {
    match_win: +50,            // 個人試合勝利
    team_win: +30,             // 団体戦勝利
    match_loss: +0,            // 敗戦（参加分のみ）
    team_loss: -10             // 団体戦敗戦
  };
  
  // 試合重要度ボーナス
  importanceMultiplier: {
    practice_match: 1.0,       // 練習試合
    district_tournament: 1.5,  // 地区大会
    prefectural: 2.0,          // 県大会
    regional: 3.0,             // 地方大会
    national: 5.0              // 全国大会
  };
}
```

### 2. 行動経験値システム

```typescript
interface ActionExperience {
  // ポイント単位の行動経験値
  pointActions: {
    service_ace: 120,          // サービスエース
    return_winner: 100,        // リターンウィナー
    volley_winner: 110,        // ボレーウィナー
    stroke_winner: 90,         // ストロークウィナー
    rally_win_short: 60,       // 短いラリー勝利（1-3打）
    rally_win_medium: 80,      // 中程度ラリー勝利（4-8打）
    rally_win_long: 120,       // 長いラリー勝利（9打以上）
    break_point_save: 150,     // ブレークポイント阻止
    break_point_convert: 180,  // ブレークポイント成功
    double_fault_avoid: 40,    // ダブルフォルト回避
    difficult_return: 70,      // 困難なリターン成功
    net_approach: 50,          // ネットアプローチ成功
    passing_shot: 90,          // パッシングショット成功
    drop_shot: 80,             // ドロップショット成功
    lob_success: 70            // ロブ成功
  };
  
  // ゲーム単位の行動経験値
  gameActions: {
    service_game_hold: 200,    // サービスゲームキープ
    service_game_break: 300,   // サービスゲームブレーク
    love_game: 250,            // ラブゲーム
    deuce_game_win: 180,       // デュースゲーム勝利
    save_multiple_break: 350   // 複数ブレークポイント阻止
  };
  
  // セット単位の行動経験値
  setActions: {
    set_win: 500,              // セット勝利
    set_win_tiebreak: 600,     // タイブレークセット勝利
    comeback_set: 800,         // 逆転セット勝利（2ブレークダウンから）
    bagel_set: 700,            // 6-0セット勝利
    breadstick_set: 600        // 6-1セット勝利
  };
  
  // 行動経験値制限（バランス調整）
  limits: {
    maxPerPoint: 300,          // 1ポイントあたり最大300
    maxPerGame: 800,           // 1ゲームあたり最大800
    maxPerSet: 2000,           // 1セットあたり最大2000
    maxPerMatch: 5000          // 1試合あたり最大5000
  };
}
```

### 3. 指示経験値システム

```typescript
interface InstructionExperience {
  // 指示成功時経験値
  successBonus: {
    level_1_card: 20,          // レベル1カード成功
    level_2_card: 30,
    level_3_card: 40,
    level_4_card: 60,
    level_5_card: 80,
    level_6_card: 120,         // 高レベルカード成功で大きなボーナス
    level_7_card: 180,
    special_tactic: 200        // 固有戦術成功
  };
  
  // 指示失敗時経験値（縁の下戦術）
  failureBonus: {
    level_4_plus_failure: 40,  // レベル4以上失敗でも経験値
    underdog_challenge: 60,     // 格上相手への挑戦
    pressure_situation: 80     // プレッシャー場面での挑戦
  };
  
  // 指示回数ボーナス
  frequencyBonus: {
    base_per_instruction: 10,   // 指示1回につき基本10
    cumulative_bonus: 5,        // 累積指示回数×5
    attention_player_bonus: 15  // 注目選手への指示は追加+15
  };
  
  // 戦略的指示ボーナス
  strategicBonus: {
    situation_appropriate: 50,  // 状況に適した指示
    risk_taking: 30,           // リスクを取った指示
    conservative_when_needed: 40, // 必要な場面での保守的指示
    momentum_change: 80        // 流れを変える指示
  };
}
```

---

## 🏅 特殊能力獲得システム

### 1. 試合中特殊能力獲得

```typescript
interface MatchAbilityAcquisition {
  // 基本獲得確率
  baseRates: {
    practice_match: 0.5,       // 練習試合 0.5%
    district_tournament: 1.0,  // 地区大会 1%
    prefectural: 2.0,          // 県大会 2%
    regional: 3.5,             // 地方大会 3.5%
    national: 5.0              // 全国大会 5%
  };
  
  // 行動別獲得条件
  acquisitionTriggers: {
    // サーブ系特殊能力
    serve_abilities: [
      {
        ability: 'power_serve',
        trigger: '5_aces_in_match',
        probability: 15
      },
      {
        ability: 'precision_serve',
        trigger: '80_percent_first_serve',
        probability: 12
      },
      {
        ability: 'clutch_server',
        trigger: 'save_3_break_points',
        probability: 18
      }
    ],
    
    // リターン系特殊能力
    return_abilities: [
      {
        ability: 'return_ace',
        trigger: '5_return_winners',
        probability: 15
      },
      {
        ability: 'break_master',
        trigger: 'break_3_service_games',
        probability: 20
      }
    ],
    
    // メンタル系特殊能力
    mental_abilities: [
      {
        ability: 'clutch_performer',
        trigger: 'win_3_tiebreaks',
        probability: 25
      },
      {
        ability: 'comeback_king',
        trigger: 'comeback_from_2_sets_down',
        probability: 30
      }
    ]
  };
  
  // 相手強度による修正
  opponentStrengthModifier: {
    much_weaker: 0.3,          // 格下相手は獲得率30%
    weaker: 0.6,               // やや格下は60%
    equal: 1.0,                // 同格は100%
    stronger: 1.5,             // 格上は150%
    much_stronger: 2.0         // 格上大は200%
  };
}
```

### 2. 試合後成長判定

```typescript
interface PostMatchGrowth {
  // 基本能力値成長
  statGrowth: {
    // 試合活躍度による成長ポイント
    excellentPerformance: 8,   // 8ポイント成長
    goodPerformance: 5,        // 5ポイント成長
    averagePerformance: 3,     // 3ポイント成長
    poorPerformance: 1,        // 1ポイント成長
    
    // 成長ポイント配分ルール
    distributionRules: {
      // 多用したスキルの成長率UP
      mostUsedSkill: 1.5,      // 1.5倍
      secondMostUsed: 1.2,     // 1.2倍
      
      // 決定打となったスキルの成長率UP
      winningShot: 2.0,        // 2倍
      
      // 失敗が多かったスキルの成長率UP（改善）
      mostErrors: 1.3          // 1.3倍
    }
  };
  
  // 信頼度成長
  trustGrowth: {
    // 指示成功による信頼度上昇
    instruction_success: 2,     // 成功1回につき+2
    instruction_failure: -1,    // 失敗1回につき-1
    
    // おまかせによる信頼度上昇
    auto_instruction: 3,        // おまかせ1回につき+3
    
    // 試合結果による信頼度変動
    match_win: 10,              // 勝利+10
    great_performance: 15,      // 素晴らしいプレー+15
    clutch_performance: 20,     // クラッチプレー+20
    
    // 信頼度上限・効果
    maxTrust: 100,
    benefits: {
      high_trust_card_bonus: 1,  // 信頼度80以上で全カード+1
      super_trust_special: true  // 信頼度95以上で特別効果
    }
  };
}
```

---

## 🎲 確率計算・勝敗決定システム

### 1. ポイント勝敗計算

```typescript
interface PointCalculation {
  // 基本勝率計算式
  baseWinRate: {
    // サーブ時の計算
    serve: '(serve_skill - opponent_return_skill + 50 + card_bonus + situation_bonus)',
    
    // リターン時の計算
    return: '(return_skill - opponent_serve_skill + 50 + card_bonus + situation_bonus)',
    
    // ラリー時の計算
    rally: '(stroke_skill - opponent_stroke_skill + 50 + card_bonus + fatigue_modifier)',
    
    // ネットプレー時の計算
    volley: '(volley_skill - opponent_stroke_skill + 30 + card_bonus + position_bonus)'
  };
  
  // 各種ボーナス値
  bonusValues: {
    // 戦術カードボーナス
    card_level_1: 5,
    card_level_2: 8,
    card_level_3: 12,
    card_level_4: 18,
    card_level_5: 25,
    card_level_6: 35,
    card_level_7: 50,
    
    // 状況ボーナス
    home_court: 5,
    important_point: 10,
    momentum: 15,
    crowd_support: 8,
    
    // 疲労ペナルティ
    slight_fatigue: -5,
    moderate_fatigue: -12,
    heavy_fatigue: -25,
    exhausted: -40
  };
  
  // 特殊状況の計算修正
  specialSituations: {
    // プレッシャー状況
    break_point: {
      mental_bonus: 'mental_skill * 0.3',
      pressure_penalty: '(100 - mental_skill) * 0.2'
    },
    
    // タイブレーク
    tiebreak: {
      mental_multiplier: 1.5,
      serve_advantage: 10,
      pressure_multiplier: 2.0
    },
    
    // 天候・コート影響
    weather_effects: {
      sunny: { serve_bonus: 5 },
      windy: { serve_penalty: -8, volley_penalty: -5 },
      rainy: { stroke_penalty: -10, mental_penalty: -5 }
    }
  };
}
```

### 2. 試合展開システム

```typescript
interface MatchProgression {
  // ゲーム進行ルール
  gameProgression: {
    points: ['0', '15', '30', '40', 'Game'],
    deuce: {
      activated_at: 'both_40',
      advantage_needed: true,
      win_condition: 'advantage_then_point'
    }
  };
  
  // セット進行ルール
  setProgression: {
    games_to_win: 6,
    minimum_lead: 2,
    tiebreak_at: [6, 6],
    tiebreak_points: 7,
    tiebreak_minimum_lead: 2
  };
  
  // 体力・疲労システム
  staminaSystem: {
    initial_stamina: 100,
    consumption_per_point: {
      easy_point: 1,
      normal_point: 2,
      difficult_point: 4,
      long_rally: 6
    },
    
    recovery_during_match: {
      changeover: 5,           // チェンジコート時+5
      set_break: 15,           // セット間+15
      timeout: 20              // タイムアウト時+20
    },
    
    stamina_effects: {
      80_plus: 'no_penalty',
      60_to_79: 'slight_penalty_5',
      40_to_59: 'moderate_penalty_15',
      20_to_39: 'heavy_penalty_30',
      under_20: 'severe_penalty_50'
    }
  };
}
```

---

## 🎨 UI・演出システム

### 1. 試合画面レイアウト

```typescript
interface MatchScreenLayout {
  // 基本レイアウト構成
  layout: {
    court_view: {
      position: 'center_main',
      type: 'overhead_view',
      size: '60%_screen',
      elements: ['court_lines', 'player_positions', 'ball_position']
    },
    
    score_board: {
      position: 'top_center',
      type: 'horizontal_layout',
      elements: [
        'team_names',
        'set_scores',
        'game_scores', 
        'point_scores',
        'serve_indicator'
      ]
    },
    
    player_info: {
      home_team: {
        position: 'left_side',
        elements: ['player_portrait', 'stamina_bar', 'status_icons']
      },
      away_team: {
        position: 'right_side',
        elements: ['player_portrait', 'stamina_bar', 'status_icons']
      }
    },
    
    tactic_cards: {
      position: 'bottom_center',
      visibility: 'instruction_phase_only',
      layout: 'horizontal_card_deck'
    },
    
    commentary: {
      position: 'bottom_area',
      type: 'scrolling_text',
      background: 'semi_transparent'
    }
  };
  
  // レスポンシブ対応
  responsive: {
    mobile: 'vertical_stack_layout',
    tablet: 'compact_horizontal',
    desktop: 'full_layout'
  };
}
```

### 2. アニメーション・演出

```typescript
interface MatchAnimations {
  // ポイント決定時演出
  pointAnimations: {
    service_ace: {
      duration: 2000,
      effects: ['ball_trail', 'speed_indicator', 'ace_text_explosion'],
      sound: 'ace_sound'
    },
    
    winner_shot: {
      duration: 1500,
      effects: ['shot_trail', 'impact_flash', 'winner_text'],
      sound: 'winner_sound'
    },
    
    rally_point: {
      duration: 1000,
      effects: ['rally_highlight', 'point_text'],
      sound: 'point_sound'
    },
    
    error: {
      duration: 1200,
      effects: ['error_indication', 'sad_player_reaction'],
      sound: 'error_sound'
    }
  };
  
  // ゲーム・セット決定時演出
  majorEventAnimations: {
    game_win: {
      duration: 3000,
      effects: ['scoreboard_update', 'celebration_animation'],
      sound: 'game_win_fanfare'
    },
    
    break_point: {
      duration: 2500,
      effects: ['tension_buildup', 'crowd_reaction', 'pressure_visual'],
      sound: 'tension_music'
    },
    
    set_win: {
      duration: 4000,
      effects: ['big_celebration', 'fireworks', 'team_huddle'],
      sound: 'set_win_celebration'
    },
    
    match_win: {
      duration: 6000,
      effects: ['victory_celebration', 'confetti', 'team_photo'],
      sound: 'victory_anthem'
    }
  };
  
  // 戦術カード演出
  cardAnimations: {
    card_selection: {
      duration: 800,
      effects: ['card_highlight', 'hover_glow'],
      sound: 'card_select'
    },
    
    card_activation: {
      duration: 1500,
      effects: ['card_flip', 'energy_burst', 'screen_flash'],
      sound: 'activation_sound'
    },
    
    special_tactic: {
      duration: 3000,
      effects: ['special_aura', 'screen_transform', 'power_up_visual'],
      sound: 'special_activation'
    }
  };
}
```

### 3. 状態表示システム

```typescript
interface StatusDisplaySystem {
  // 選手状態表示
  playerStatus: {
    stamina_bar: {
      type: 'horizontal_bar',
      colors: {
        high: '#4CAF50',      // 緑（80-100%）
        medium: '#FF9800',    // オレンジ（50-79%）
        low: '#F44336',       // 赤（30-49%）
        critical: '#8B0000'   // 暗赤（0-29%）
      },
      animation: 'smooth_decrease'
    },
    
    condition_icons: {
      excellent: '😤',        // 絶好調
      good: '😊',             // 好調
      normal: '😐',           // 普通
      poor: '😟',             // 不調
      terrible: '😫'          // 絶不調
    },
    
    buff_debuff_icons: {
      power_up: '💪',         // 能力UP
      mental_boost: '🧠',     // メンタルUP
      fatigue: '😴',          // 疲労
      pressure: '😰',         // プレッシャー
      injury: '🤕'            // 怪我
    }
  };
  
  // スコア表示詳細
  scoreDisplay: {
    set_score: {
      format: '6-4 3-6 6-2',
      highlight_current: true,
      color_coding: {
        won_set: '#4CAF50',
        lost_set: '#F44336',
        current_set: '#2196F3'
      }
    },
    
    game_score: {
      format: '5-4',
      serve_indicator: '●',
      break_point_highlight: '!',
      set_point_highlight: '★'
    },
    
    point_score: {
      format: '40-30',
      advantage_display: 'AD',
      deuce_display: 'DEUCE'
    }
  };
}
```

---

## ⚡ パフォーマンス最適化

### 1. 計算処理最適化

```typescript
interface PerformanceOptimization {
  // 確率計算最適化
  probabilityCalculation: {
    caching: true,                    // 計算結果キャッシュ
    precalculation: 'common_scenarios', // よくある状況の事前計算
    batching: 'multiple_points'       // 複数ポイント一括計算
  };
  
  // アニメーション最適化
  animationOptimization: {
    frame_rate_limit: 60,            // 60fps上限
    low_end_device_mode: true,       // 低スペック端末用モード
    animation_quality_settings: ['high', 'medium', 'low']
  };
  
  // データ管理最適化
  dataManagement: {
    match_data_compression: true,     // 試合データ圧縮
    statistics_aggregation: 'real_time', // リアルタイム統計集計
    memory_cleanup: 'after_each_set'  // セット終了後メモリ開放
  };
}
```

### 2. ユーザー体験最適化

```typescript
interface UserExperienceOptimization {
  // 試合進行速度制御
  paceControl: {
    auto_progress_speed: {
      normal: 1000,        // 通常1秒間隔
      fast: 500,           // 高速0.5秒間隔
      instant: 100         // 瞬間0.1秒間隔
    },
    
    skip_conditions: {
      large_lead: '3_set_difference',  // 大差時スキップ可能
      one_sided_match: '6_0_6_0',     // 一方的試合
      user_request: 'manual_skip'      // ユーザー手動スキップ
    }
  };
  
  // 重要場面の強調
  importantMomentHighlight: {
    auto_slow_down: ['break_point', 'set_point', 'match_point'],
    dramatic_pause: ['tiebreak', 'final_set'],
    zoom_in_effect: ['decisive_moments']
  };
}
```

---

## 📊 統計・データ分析

### 1. 試合統計システム

```typescript
interface MatchStatistics {
  // 基本統計
  basicStats: {
    aces: number;
    double_faults: number;
    first_serve_percentage: number;
    first_serve_points_won: number;
    second_serve_points_won: number;
    break_points_saved: number;
    break_points_converted: number;
    winners: number;
    unforced_errors: number;
    net_points_won: number;
    total_points_won: number;
  };
  
  // 詳細統計
  detailedStats: {
    serve_speeds: number[];
    rally_lengths: number[];
    shot_distribution: {
      forehand: number;
      backhand: number;
      volley: number;
      smash: number;
      drop_shot: number;
    };
    
    court_positioning: {
      baseline_points: number;
      net_points: number;
      mid_court_points: number;
    };
    
    pressure_performance: {
      break_point_performance: number;
      tie_break_performance: number;
      deciding_set_performance: number;
    };
  };
  
  // 比較統計
  comparisonStats: {
    vs_previous_matches: StatComparison;
    vs_opponent_averages: StatComparison;
    vs_team_averages: StatComparison;
  };
}
```

### 2. 成長追跡システム

```typescript
interface GrowthTrackingSystem {
  // 選手成長データ
  playerGrowth: {
    skill_progression: {
      serve: SkillProgressData;
      return: SkillProgressData;
      volley: SkillProgressData;
      stroke: SkillProgressData;
      mental: SkillProgressData;
      stamina: SkillProgressData;
    };
    
    match_performance_trends: {
      win_rate_progression: number[];
      pressure_performance_trend: number[];
      stamina_endurance_trend: number[];
    };
    
    special_ability_acquisition: {
      date_acquired: Date;
      acquisition_method: string;
      impact_on_performance: number;
    }[];
  };
  
  // チーム成長データ
  teamGrowth: {
    overall_strength_progression: number[];
    team_chemistry_development: number;
    tournament_performance_history: TournamentResult[];
    rival_school_comparison: RivalComparison[];
  };
}
```

---

## 🎯 バランス調整パラメータ

### 1. 難易度調整値

```typescript
interface DifficultyBalancing {
  // AI強度設定
  aiStrength: {
    beginner: {
      skill_multiplier: 0.7,
      error_rate_increase: 1.5,
      pressure_penalty: 2.0
    },
    
    normal: {
      skill_multiplier: 1.0,
      error_rate_increase: 1.0,
      pressure_penalty: 1.0
    },
    
    hard: {
      skill_multiplier: 1.3,
      error_rate_increase: 0.7,
      pressure_penalty: 0.5
    },
    
    expert: {
      skill_multiplier: 1.6,
      error_rate_increase: 0.4,
      pressure_penalty: 0.2
    }
  };
  
  // 成長速度調整
  growthRateModifier: {
    very_slow: 0.5,
    slow: 0.7,
    normal: 1.0,
    fast: 1.5,
    very_fast: 2.0
  };
  
  // 特殊能力出現率調整
  abilityAppearanceRate: {
    rare: 0.5,
    normal: 1.0,
    common: 2.0
  };
}
```

### 2. ゲームバランス微調整

```typescript
interface GameBalanceTuning {
  // 戦術カード効果調整
  tacticCardTuning: {
    high_level_risk_adjustment: 1.2,     // 高レベルカードのリスク増加
    low_level_safety_adjustment: 1.1,    // 低レベルカードの安全性向上
    special_tactic_cooldown: 'per_match' // 固有戦術クールダウン
  };
  
  // 疲労システム調整
  fatigueSystemTuning: {
    stamina_consumption_rate: 1.0,       // 疲労蓄積速度
    recovery_rate: 1.0,                  // 回復速度
    performance_impact: 1.0              // パフォーマンスへの影響度
  };
  
  // 経験値獲得調整
  experienceGainTuning: {
    base_experience_multiplier: 1.0,     // 基本経験値倍率
    action_experience_cap: 5000,         // 行動経験値上限
    instruction_bonus_multiplier: 1.0    // 指示ボーナス倍率
  };
}
```

---

この仕様書に基づいて実装することで、栄冠ナインの戦略性と面白さを完全に継承しつつ、テニス特有の魅力を活かした本格的な試合シミュレーションシステムが完成します。特に、要所での監督指示、固有戦術の存在、経験値を通じた成長実感、そして適度な運要素が組み合わさることで、プレイヤーが長時間楽しめる奥深いゲーム体験を提供できます。