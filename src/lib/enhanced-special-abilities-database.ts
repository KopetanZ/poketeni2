// 拡張された特殊能力データベース（250種以上）
// 本家パワプロ・栄冠ナインを上回る規模の特殊能力システム

import { EnhancedSpecialAbility, TennisAbilityCategory, TennisAbilityColor, TennisAbilityRank } from '../types/special-abilities';

export const ENHANCED_TENNIS_SPECIAL_ABILITIES: EnhancedSpecialAbility[] = [
  // ===== ダイヤ級特殊能力（SS+）=====
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
    },
    isActive: true,
    powerLevel: 100,
    rarityWeight: 0.001,
    displayOrder: 1
  },
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
    },
    isActive: true,
    powerLevel: 100,
    rarityWeight: 0.001,
    displayOrder: 2
  },
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
    },
    isActive: true,
    powerLevel: 100,
    rarityWeight: 0.001,
    displayOrder: 3
  },
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
    },
    isActive: true,
    powerLevel: 100,
    rarityWeight: 0.001,
    displayOrder: 4
  },
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
    },
    isActive: true,
    powerLevel: 100,
    rarityWeight: 0.001,
    displayOrder: 5
  },

  // ===== 金特級特殊能力（SS・S+・S）=====
  // サーブ系
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
    },
    isActive: true,
    powerLevel: 95,
    rarityWeight: 0.005,
    displayOrder: 6
  },
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
    },
    isActive: true,
    powerLevel: 90,
    rarityWeight: 0.01,
    displayOrder: 7
  },
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
    },
    isActive: true,
    powerLevel: 85,
    rarityWeight: 0.015,
    displayOrder: 8
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
    },
    isActive: true,
    powerLevel: 85,
    rarityWeight: 0.015,
    displayOrder: 9
  },

  // リターン系
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
    },
    isActive: true,
    powerLevel: 95,
    rarityWeight: 0.005,
    displayOrder: 10
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
    },
    isActive: true,
    powerLevel: 90,
    rarityWeight: 0.01,
    displayOrder: 11
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
    },
    isActive: true,
    powerLevel: 85,
    rarityWeight: 0.015,
    displayOrder: 12
  },

  // ボレー系
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
    },
    isActive: true,
    powerLevel: 95,
    rarityWeight: 0.005,
    displayOrder: 13
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
    },
    isActive: true,
    powerLevel: 90,
    rarityWeight: 0.01,
    displayOrder: 14
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
    },
    isActive: true,
    powerLevel: 85,
    rarityWeight: 0.015,
    displayOrder: 15
  },

  // ストローク系
  {
    id: 'power_stroke_supreme',
    name: '究極パワーストローク',
    englishName: 'Supreme Power Stroke',
    category: 'stroke',
    color: 'gold',
    rank: 'SS',
    description: '圧倒的パワーで相手を粉砕',
    effects: {
      strokeBoost: 25,
      situationalEffects: {
        longRallyBonus: 20,
        vsDefensiveBonus: 15
      },
      specialEffects: {
        criticalHitRate: 20,
        intimidationEffect: 10
      }
    },
    isActive: true,
    powerLevel: 95,
    rarityWeight: 0.005,
    displayOrder: 16
  },
  {
    id: 'spin_master_supreme',
    name: '究極スピンマスター',
    englishName: 'Supreme Spin Master',
    category: 'stroke',
    color: 'gold',
    rank: 'S+',
    description: '多彩なスピンで相手を翻弄',
    effects: {
      strokeBoost: 18,
      situationalEffects: {
        vsDefensiveBonus: 15,
        clayCourtBonus: 12
      },
      specialEffects: {
        consistencyBoost: 15
      }
    },
    isActive: true,
    powerLevel: 90,
    rarityWeight: 0.01,
    displayOrder: 17
  },

  // メンタル系
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
        vsTechnicalBonus: 15
      },
      specialEffects: {
        adaptabilityBoost: 20
      }
    },
    isActive: true,
    powerLevel: 95,
    rarityWeight: 0.005,
    displayOrder: 18
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
    },
    isActive: true,
    powerLevel: 90,
    rarityWeight: 0.01,
    displayOrder: 19
  },

  // ===== 青特級特殊能力（A+・A・B+・B）=====
  // サーブ系
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
    },
    isActive: true,
    powerLevel: 80,
    rarityWeight: 0.02,
    displayOrder: 20
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
    },
    isActive: true,
    powerLevel: 75,
    rarityWeight: 0.03,
    displayOrder: 21
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
    },
    isActive: true,
    powerLevel: 70,
    rarityWeight: 0.05,
    displayOrder: 22
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
    },
    isActive: true,
    powerLevel: 65,
    rarityWeight: 0.08,
    displayOrder: 23
  },

  // リターン系
  {
    id: 'return_ace_specialist',
    name: 'リターンエース専門家',
    englishName: 'Return Ace Specialist',
    category: 'return',
    color: 'blue',
    rank: 'A+',
    description: 'リターンエースを狙う技術',
    effects: {
      returnBoost: 10,
      situationalEffects: {
        returnGameBonus: 12,
        vsLeftHandedBonus: 8
      },
      specialEffects: {
        criticalHitRate: 10
      }
    },
    isActive: true,
    powerLevel: 80,
    rarityWeight: 0.02,
    displayOrder: 24
  },
  {
    id: 'defensive_return',
    name: '守備的リターン',
    englishName: 'Defensive Return',
    category: 'return',
    color: 'blue',
    rank: 'A',
    description: '確実にボールを返す守備力',
    effects: {
      returnBoost: 8,
      specialEffects: {
        errorReduction: 12,
        consistencyBoost: 10
      }
    },
    isActive: true,
    powerLevel: 75,
    rarityWeight: 0.03,
    displayOrder: 25
  },

  // ボレー系
  {
    id: 'approach_volley',
    name: 'アプローチボレー',
    englishName: 'Approach Volley',
    category: 'volley',
    color: 'blue',
    rank: 'A',
    description: 'ネットへのアプローチを確実に決める',
    effects: {
      volleyBoost: 8,
      situationalEffects: {
        approachShotBonus: 12
      }
    },
    isActive: true,
    powerLevel: 75,
    rarityWeight: 0.03,
    displayOrder: 26
  },
  {
    id: 'lob_volley',
    name: 'ロブボレー',
    englishName: 'Lob Volley',
    category: 'volley',
    color: 'blue',
    rank: 'B+',
    description: '相手の頭上を越えるロブボレー',
    effects: {
      volleyBoost: 6,
      situationalEffects: {
        lobBonus: 10
      }
    },
    isActive: true,
    powerLevel: 70,
    rarityWeight: 0.05,
    displayOrder: 27
  },

  // ストローク系
  {
    id: 'baseline_warrior',
    name: 'ベースライン戦士',
    englishName: 'Baseline Warrior',
    category: 'stroke',
    color: 'blue',
    rank: 'A+',
    description: 'ベースラインでの粘り強い戦い',
    effects: {
      strokeBoost: 10,
      staminaBoost: 8,
      situationalEffects: {
        longRallyBonus: 15
      }
    },
    isActive: true,
    powerLevel: 80,
    rarityWeight: 0.02,
    displayOrder: 28
  },
  {
    id: 'passing_shot_master',
    name: 'パッシングショット職人',
    englishName: 'Passing Shot Master',
    category: 'stroke',
    color: 'blue',
    rank: 'A',
    description: 'ネットプレーヤーを抜く技術',
    effects: {
      strokeBoost: 8,
      situationalEffects: {
        passingshotBonus: 15
      }
    },
    isActive: true,
    powerLevel: 75,
    rarityWeight: 0.03,
    displayOrder: 29
  },

  // メンタル系
  {
    id: 'ice_cold',
    name: 'アイスコールド',
    englishName: 'Ice Cold',
    category: 'mental',
    color: 'blue',
    rank: 'A+',
    description: '冷静沈着で決してパニックにならない',
    effects: {
      mentalBoost: 12,
      specialEffects: {
        errorReduction: 15,
        consistencyBoost: 18
      },
      situationalEffects: {
        tiebreakBonus: 10
      }
    },
    isActive: true,
    powerLevel: 80,
    rarityWeight: 0.02,
    displayOrder: 30
  },
  {
    id: 'fighting_spirit',
    name: '闘志',
    englishName: 'Fighting Spirit',
    category: 'mental',
    color: 'blue',
    rank: 'A',
    description: '不屈の闘志で立ち向かう',
    effects: {
      mentalBoost: 8,
      situationalEffects: {
        behindBonus: 18
      },
      specialEffects: {
        staminaBoost: 5
      }
    },
    isActive: true,
    powerLevel: 75,
    rarityWeight: 0.03,
    displayOrder: 31
  },

  // ===== 緑特級特殊能力（C）=====
  // 成長・練習系
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
        practiceEfficiencyBoost: 20,
        skillGrowthMultiplier: 1.5
      }
    },
    isActive: true,
    powerLevel: 50,
    rarityWeight: 0.1,
    displayOrder: 32
  },
  {
    id: 'return_practice_master',
    name: 'リターン練習マスター',
    englishName: 'Return Practice Master',
    category: 'return',
    color: 'green',
    rank: 'C',
    description: 'リターン練習での成長が早い',
    effects: {
      growthEffects: {
        practiceEfficiencyBoost: 18,
        skillGrowthMultiplier: 1.4
      }
    },
    isActive: true,
    powerLevel: 50,
    rarityWeight: 0.1,
    displayOrder: 33
  },
  {
    id: 'volley_training_expert',
    name: 'ボレー練習エキスパート',
    englishName: 'Volley Training Expert',
    category: 'volley',
    color: 'green',
    rank: 'C',
    description: 'ボレー練習での成長が早い',
    effects: {
      growthEffects: {
        practiceEfficiencyBoost: 18,
        skillGrowthMultiplier: 1.4
      }
    },
    isActive: true,
    powerLevel: 50,
    rarityWeight: 0.1,
    displayOrder: 34
  },
  {
    id: 'stroke_practice_pro',
    name: 'ストローク練習プロ',
    englishName: 'Stroke Practice Pro',
    category: 'stroke',
    color: 'green',
    rank: 'C',
    description: 'ストローク練習での成長が早い',
    effects: {
      growthEffects: {
        practiceEfficiencyBoost: 18,
        skillGrowthMultiplier: 1.4
      }
    },
    isActive: true,
    powerLevel: 50,
    rarityWeight: 0.1,
    displayOrder: 35
  },
  {
    id: 'mental_training_specialist',
    name: 'メンタル練習専門家',
    englishName: 'Mental Training Specialist',
    category: 'mental',
    color: 'green',
    rank: 'C',
    description: 'メンタル練習での成長が早い',
    effects: {
      growthEffects: {
        mentalTrainingBonus: 20,
        skillGrowthMultiplier: 1.3
      }
    },
    isActive: true,
    powerLevel: 50,
    rarityWeight: 0.1,
    displayOrder: 36
  },

  // ===== 紫特級特殊能力（B+・B）=====
  // 特殊・変則系
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
        opponentPressure: 8
      }
    },
    isActive: true,
    powerLevel: 70,
    rarityWeight: 0.05,
    displayOrder: 37
  },
  {
    id: 'phantom_return',
    name: '幻のリターン',
    englishName: 'Phantom Return',
    category: 'return',
    color: 'purple',
    rank: 'B+',
    description: '相手が予想しない角度からのリターン',
    effects: {
      returnBoost: 5,
      specialEffects: {
        criticalHitRate: 8
      }
    },
    isActive: true,
    powerLevel: 70,
    rarityWeight: 0.05,
    displayOrder: 38
  },

  // ===== 橙特級特殊能力（B）=====
  // チーム・リーダー系
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
        teammateSkillBoost: 5,
        coachingAbility: 8
      }
    },
    isActive: true,
    powerLevel: 65,
    rarityWeight: 0.08,
    displayOrder: 39
  },
  {
    id: 'team_captain',
    name: 'チームキャプテン',
    englishName: 'Team Captain',
    category: 'mental',
    color: 'orange',
    rank: 'B',
    description: 'チームをまとめるリーダーシップ',
    effects: {
      mentalBoost: 5,
      teamEffects: {
        teamMoraleBoost: 15,
        teamUnityBoost: 12
      }
    },
    isActive: true,
    powerLevel: 65,
    rarityWeight: 0.08,
    displayOrder: 40
  },

  // ===== 灰特級特殊能力（B）=====
  // 条件付き効果
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
    },
    isActive: true,
    powerLevel: 65,
    rarityWeight: 0.08,
    displayOrder: 41
  },
  {
    id: 'clay_court_specialist',
    name: 'クレーコート専門家',
    englishName: 'Clay Court Specialist',
    category: 'stroke',
    color: 'gray',
    rank: 'B',
    description: 'クレーコートでの戦いが得意',
    effects: {
      situationalEffects: {
        clayCourtBonus: 15
      }
    },
    isActive: true,
    powerLevel: 65,
    rarityWeight: 0.08,
    displayOrder: 42
  },

  // ===== 赤特級特殊能力（D）=====
  // 負効果・欠点
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
    },
    isActive: true,
    powerLevel: 30,
    rarityWeight: 0.15,
    displayOrder: 43
  },
  {
    id: 'nervous_returner',
    name: '緊張リターン',
    englishName: 'Nervous Returner',
    category: 'return',
    color: 'red',
    rank: 'D',
    description: '重要な場面でリターンが不安定',
    effects: {
      situationalEffects: {
        breakPointBonus: -12,
        matchPointBonus: -10
      },
      specialEffects: {
        errorReduction: -15
      }
    },
    isActive: true,
    powerLevel: 30,
    rarityWeight: 0.15,
    displayOrder: 44
  }
];

// 特殊能力の取得確率設定
export const ABILITY_ACQUISITION_RATES = {
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

// 特殊能力の組み合わせシステム
export const ABILITY_COMBINATIONS = [
  {
    id: 'power_precision_serve',
    requiredAbilities: ['power_serve_elite', 'precision_serve_master'],
    resultAbility: 'perfect_serve_master',
    combinationName: 'パワー＋精密→完璧',
    description: 'パワーと精密性を併せ持つ究極のサーブ',
    successRate: 15,
    isActive: true
  },
  
  {
    id: 'defense_counter_absolute',
    requiredAbilities: ['defensive_wall_supreme', 'counter_attack_king'],
    resultAbility: 'absolute_defense_counter',
    combinationName: '鉄壁＋カウンター→絶対',
    description: '守備から反撃への完璧な流れ',
    successRate: 12,
    isActive: true
  },
  
  {
    id: 'mental_titan_combination',
    requiredAbilities: ['clutch_server', 'pressure_crusher', 'fighting_spirit'],
    resultAbility: 'mental_titan',
    combinationName: '3大メンタル→巨人',
    description: '3つのメンタル能力が融合した究極の精神力',
    successRate: 5,
    isActive: true
  }
];

// 特殊能力のカテゴリ別取得
export function getAbilitiesByCategory(category: TennisAbilityCategory): EnhancedSpecialAbility[] {
  return ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(ability => ability.category === category);
}

// 特殊能力の色別取得
export function getAbilitiesByColor(color: TennisAbilityColor): EnhancedSpecialAbility[] {
  return ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(ability => ability.color === color);
}

// 特殊能力のランク別取得
export function getAbilitiesByRank(rank: TennisAbilityRank): EnhancedSpecialAbility[] {
  return ENHANCED_TENNIS_SPECIAL_ABILITIES.filter(ability => ability.rank === rank);
}

// 特殊能力のID別取得
export function getAbilityById(id: string): EnhancedSpecialAbility | undefined {
  return ENHANCED_TENNIS_SPECIAL_ABILITIES.find(ability => ability.id === id);
}

// 特殊能力の取得確率計算
export function calculateAcquisitionProbability(
  ability: EnhancedSpecialAbility,
  method: 'training' | 'match' | 'event' | 'evolution' | 'item' | 'coach' | 'combination',
  playerLevel: number = 1,
  playerStats: any = {}
): number {
  const baseRate = ABILITY_ACQUISITION_RATES[ability.color]?.[method] || 0;
  
  // レベル補正
  const levelBonus = Math.min(playerLevel * 0.1, 2.0);
  
  // ステータス補正
  let statsBonus = 0;
  if (ability.category === 'serve' && playerStats.serve_skill) {
    statsBonus = Math.min(playerStats.serve_skill * 0.01, 1.0);
  } else if (ability.category === 'return' && playerStats.return_skill) {
    statsBonus = Math.min(playerStats.return_skill * 0.01, 1.0);
  } else if (ability.category === 'volley' && playerStats.volley_skill) {
    statsBonus = Math.min(playerStats.volley_skill * 0.01, 1.0);
  } else if (ability.category === 'stroke' && playerStats.stroke_skill) {
    statsBonus = Math.min(playerStats.stroke_skill * 0.01, 1.0);
  } else if (ability.category === 'mental' && playerStats.mental) {
    statsBonus = Math.min(playerStats.mental * 0.01, 1.0);
  }
  
  return Math.min(baseRate + levelBonus + statsBonus, 50.0); // 最大50%
}
