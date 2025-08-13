// 戦術カードシステム - 栄冠ナイン風戦術カードの実装
// 仕様書(TENNIS_MATCH_SIMULATION_SPEC.md)に基づく本格的なカードシステム

export type TacticCardLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TacticCardType = 
  | 'serve_tactic'      // サーブ戦術
  | 'return_tactic'     // リターン戦術
  | 'net_tactic'        // ネット戦術
  | 'baseline_tactic'   // ベースライン戦術
  | 'mental_tactic'     // メンタル戦術
  | 'team_tactic'       // チーム戦術
  | 'special_tactic';   // 特殊戦術

export type TacticCardRarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'legendary';

export interface TacticCard {
  id: string;
  name: string;
  description: string;
  type: TacticCardType;
  level: TacticCardLevel;
  rarity: TacticCardRarity;
  
  // 使用条件
  usageConditions: {
    situations: string[];          // 使用可能状況
    playerTypes?: string[];        // 対象選手タイプ
    minimumTrust?: number;         // 最低信頼度
    cooldown?: number;             // クールダウン（ポイント数）
    usesPerMatch?: number;         // 試合中使用回数制限
    energyCost?: number;           // エネルギーコスト（新システム）
    comboRequirement?: string[];   // 連携要求カード（新システム）
  };
  
  // カード効果
  effects: {
    immediate: TacticCardEffect;     // 即時効果
    duration?: number;               // 持続時間（ポイント数）
    delayed?: TacticCardEffect;      // 遅延効果
  };
  
  // メタデータ
  cost?: number;                     // 消費ポイント
  successRate: number;               // 基本成功率
  riskLevel: 'low' | 'medium' | 'high';
  animation?: string;                // 演出アニメーション
  soundEffect?: string;              // 効果音
}

export interface TacticCardEffect {
  // 能力値修正
  skillModifiers?: {
    serve?: number;
    return?: number;
    volley?: number;
    stroke?: number;
    mental?: number;
    stamina?: number;
  };
  
  // 特殊効果
  specialEffects?: {
    criticalRate?: number;           // クリティカル率変更
    errorRate?: number;              // エラー率変更
    momentumChange?: number;         // 勢い変化
    pressureResistance?: number;     // プレッシャー耐性
    fatigueRecovery?: number;        // 疲労回復
    concentrationBoost?: number;     // 集中力向上
  };
  
  // 戦術的効果
  tacticalEffects?: {
    suppressOpponent?: number;       // 相手能力抑制
    teamMorale?: number;             // チーム士気変化
    courtControl?: number;           // コート支配力
    adaptability?: number;           // 適応力向上
  };
  
  // 状況的効果
  situationalEffects?: {
    breakPointBonus?: number;        // ブレークポイント時ボーナス
    setPointBonus?: number;          // セットポイント時ボーナス
    comebackBonus?: number;          // 劣勢時ボーナス
    pressurePointBonus?: number;     // プレッシャー場面ボーナス
  };
  
  description: string;
}

// 戦術カードデータベース
export const TACTIC_CARDS_DATABASE: TacticCard[] = [
  // ===== レベル1 戦術カード（基本） =====
  {
    id: 'basic_serve_power',
    name: '🔥 パワーサーブ戦術',
    description: '3ポイント間、サーブの威力を計画的に上げて相手を圧倒する長期戦略',
    type: 'serve_tactic',
    level: 1,
    rarity: 'common',
    usageConditions: {
      situations: ['serve', 'any'],
      cooldown: 5,
      usesPerMatch: 3,
      energyCost: 2 // エネルギーコスト
    },
    effects: {
      immediate: {
        skillModifiers: { serve: 12 },
        specialEffects: { criticalRate: 0.15, momentumChange: 5 },
        description: 'サーブ力+12、クリティカル率+15%、勢い向上'
      },
      duration: 5 // より長期間の効果
    },
    successRate: 0.9,
    riskLevel: 'low'
  },
  
  {
    id: 'basic_return_focus',
    name: '🎯 集中リターン戦術',
    description: '4ポイント間、集中力を戦略的に高めてリターンの精度を上げる',
    type: 'return_tactic',
    level: 1,
    rarity: 'common',
    usageConditions: {
      situations: ['return', 'break_point', 'any'],
      usesPerMatch: 3,
      energyCost: 2,
      cooldown: 4
    },
    effects: {
      immediate: {
        skillModifiers: { return: 10 },
        specialEffects: { errorRate: -0.2, concentrationBoost: 15 },
        description: 'リターン力+10、エラー率-20%、集中力大幅向上'
      },
      duration: 4
    },
    successRate: 0.9,
    riskLevel: 'low'
  },

  // ===== 連携戦術カード（コンボシステム） =====
  {
    id: 'serve_return_combo',
    name: '🔥🎯 サーブ＆リターン連携',
    description: 'パワーサーブ戦術と集中リターン戦術の連携で相乗効果を発揮！',
    type: 'special_tactic',
    level: 3,
    rarity: 'rare',
    usageConditions: {
      situations: ['any'],
      usesPerMatch: 1,
      energyCost: 5,
      cooldown: 10,
      comboRequirement: ['basic_serve_power', 'basic_return_focus'] // 両方使用済みが必要
    },
    effects: {
      immediate: {
        skillModifiers: { serve: 20, return: 20, mental: 10 },
        specialEffects: { criticalRate: 0.3, errorRate: -0.25, momentumChange: 25 },
        description: '全能力大幅向上、超攻守バランス'
      },
      duration: 6
    },
    successRate: 0.95,
    riskLevel: 'low'
  },

  // ===== レベル2 戦術カード =====
  {
    id: 'net_rush_tactic',
    name: 'ネットラッシュ',
    description: '積極的に前に出てネットプレーで主導権を握る',
    type: 'net_tactic',
    level: 2,
    rarity: 'uncommon',
    usageConditions: {
      situations: ['serve', 'rally'],
      minimumTrust: 30,
      cooldown: 4,
      usesPerMatch: 3
    },
    effects: {
      immediate: {
        skillModifiers: { volley: 12, serve: 5 },
        specialEffects: { momentumChange: 8 },
        tacticalEffects: { courtControl: 15 },
        description: 'ボレー力+12、サーブ力+5、勢い+8、コート支配力向上'
      },
      duration: 4
    },
    successRate: 0.7,
    riskLevel: 'medium'
  },

  // ===== レベル3 戦術カード =====
  {
    id: 'counter_attack',
    name: 'カウンターアタック',
    description: '相手の攻撃を利用して逆襲する高度な戦術',
    type: 'baseline_tactic',
    level: 3,
    rarity: 'rare',
    usageConditions: {
      situations: ['return', 'rally', 'behind'],
      minimumTrust: 50,
      cooldown: 5,
      usesPerMatch: 2
    },
    effects: {
      immediate: {
        skillModifiers: { return: 15, stroke: 10 },
        specialEffects: { criticalRate: 0.2, momentumChange: 12 },
        situationalEffects: { comebackBonus: 20 },
        description: 'リターン+15、ストローク+10、クリティカル率+20%、劣勢時大幅ボーナス'
      },
      duration: 3
    },
    successRate: 0.6,
    riskLevel: 'high'
  },

  // ===== レベル4 戦術カード =====
  {
    id: 'mental_fortress',
    name: 'メンタル要塞',
    description: '鋼の精神力で重要な場面を乗り切る',
    type: 'mental_tactic',
    level: 4,
    rarity: 'rare',
    usageConditions: {
      situations: ['break_point', 'set_point', 'match_point', 'pressure'],
      minimumTrust: 70,
      usesPerMatch: 1
    },
    effects: {
      immediate: {
        skillModifiers: { mental: 20 },
        specialEffects: { 
          pressureResistance: 25, 
          errorRate: -0.3,
          concentrationBoost: 20
        },
        situationalEffects: {
          breakPointBonus: 15,
          setPointBonus: 15,
          pressurePointBonus: 20
        },
        description: 'メンタル+20、プレッシャー大幅軽減、重要局面で真価発揮'
      },
      duration: 5
    },
    successRate: 0.9,
    riskLevel: 'low'
  },

  // ===== レベル5 戦術カード（チーム戦術） =====
  {
    id: 'team_synergy',
    name: 'チームシナジー',
    description: 'チーム全体の連携で個人の力を底上げする',
    type: 'team_tactic',
    level: 5,
    rarity: 'super_rare',
    usageConditions: {
      situations: ['any'],
      minimumTrust: 80,
      cooldown: 10,
      usesPerMatch: 1
    },
    effects: {
      immediate: {
        skillModifiers: { 
          serve: 10, 
          return: 10, 
          volley: 10, 
          stroke: 10, 
          mental: 15 
        },
        tacticalEffects: { teamMorale: 25 },
        specialEffects: { momentumChange: 15 },
        description: '全能力値向上、チーム士気大幅アップ、勢い向上'
      },
      duration: 8
    },
    successRate: 0.95,
    riskLevel: 'low'
  },

  // ===== レベル6 戦術カード（上級） =====
  {
    id: 'perfect_game_zone',
    name: 'パーフェクトゲームゾーン',
    description: '完璧な試合運びで相手を圧倒する究極の集中状態',
    type: 'special_tactic',
    level: 6,
    rarity: 'super_rare',
    usageConditions: {
      situations: ['serve', 'leading'],
      minimumTrust: 90,
      cooldown: 15,
      usesPerMatch: 1
    },
    effects: {
      immediate: {
        skillModifiers: { 
          serve: 25, 
          return: 20, 
          volley: 20, 
          stroke: 20, 
          mental: 25 
        },
        specialEffects: { 
          criticalRate: 0.4, 
          errorRate: -0.5,
          concentrationBoost: 30
        },
        tacticalEffects: { suppressOpponent: 15 },
        description: '全能力大幅向上、クリティカル率40%、エラー率半減'
      },
      duration: 4
    },
    successRate: 0.8,
    riskLevel: 'medium'
  },

  // ===== レベル7 戦術カード（伝説級） =====
  {
    id: 'miracle_comeback',
    name: '奇跡の大逆転',
    description: '絶体絶命の状況から奇跡的な逆転を生み出す伝説の戦術',
    type: 'special_tactic',
    level: 7,
    rarity: 'legendary',
    usageConditions: {
      situations: ['match_point_against', 'desperate'],
      minimumTrust: 95,
      usesPerMatch: 1
    },
    effects: {
      immediate: {
        skillModifiers: { 
          serve: 30, 
          return: 30, 
          volley: 25, 
          stroke: 25, 
          mental: 35 
        },
        specialEffects: { 
          criticalRate: 0.6, 
          momentumChange: 50,
          fatigueRecovery: 50
        },
        situationalEffects: { comebackBonus: 40 },
        tacticalEffects: { 
          teamMorale: 50, 
          suppressOpponent: 25 
        },
        description: '全能力最大向上、クリティカル率60%、勢い大転換、チーム覚醒'
      },
      duration: 6
    },
    successRate: 0.5,
    riskLevel: 'high'
  },

  // 特殊戦術カード（性格・タイプ固有）
  {
    id: 'aggressive_blitz',
    name: 'アグレッシブブリッツ',
    description: '攻撃的な性格の選手専用の超攻撃戦術',
    type: 'special_tactic',
    level: 4,
    rarity: 'rare',
    usageConditions: {
      situations: ['serve', 'rally'],
      playerTypes: ['aggressive'],
      minimumTrust: 60,
      usesPerMatch: 2
    },
    effects: {
      immediate: {
        skillModifiers: { serve: 20, volley: 15 },
        specialEffects: { 
          criticalRate: 0.3, 
          momentumChange: 20,
          errorRate: 0.1
        },
        description: '超攻撃型戦術、ハイリスクハイリターン'
      },
      duration: 3
    },
    successRate: 0.65,
    riskLevel: 'high'
  },

  {
    id: 'defensive_wall',
    name: '鉄壁の守備',
    description: '守備的な選手の粘り強さを最大化する戦術',
    type: 'baseline_tactic',
    level: 3,
    rarity: 'uncommon',
    usageConditions: {
      situations: ['return', 'rally', 'pressure'],
      playerTypes: ['defensive'],
      minimumTrust: 40,
      usesPerMatch: 3
    },
    effects: {
      immediate: {
        skillModifiers: { return: 18, stroke: 12 },
        specialEffects: { 
          errorRate: -0.25, 
          pressureResistance: 20,
          fatigueRecovery: 10
        },
        description: '完璧な守備、相手のミス誘発、持久力向上'
      },
      duration: 6
    },
    successRate: 0.9,
    riskLevel: 'low'
  }
];

// 戦術カード管理クラス
export class TacticCardManager {
  private availableCards: TacticCard[] = [];
  private usedCards: Map<string, number> = new Map(); // カードID -> 使用回数
  private cooldowns: Map<string, number> = new Map();  // カードID -> 残りクールダウン
  private currentEnergy: number = 10; // 初期エネルギー
  private maxEnergy: number = 10;     // 最大エネルギー
  private usedCardsHistory: string[] = []; // 使用履歴（連携用）

  constructor(initialCards: TacticCard[] = []) {
    this.availableCards = [...initialCards];
  }

  // 使用可能なカードを取得
  getUsableCards(
    situation: string, 
    playerType?: string, 
    trust?: number,
    currentPoint: number = 0
  ): TacticCard[] {
    return this.availableCards.filter(card => {
      // 状況チェック
      if (!card.usageConditions.situations.includes(situation) && 
          !card.usageConditions.situations.includes('any')) {
        return false;
      }
      
      // 選手タイプチェック
      if (card.usageConditions.playerTypes && playerType) {
        if (!card.usageConditions.playerTypes.includes(playerType)) {
          return false;
        }
      }
      
      // 信頼度チェック
      if (card.usageConditions.minimumTrust && trust !== undefined) {
        if (trust < card.usageConditions.minimumTrust) {
          return false;
        }
      }
      
      // 使用回数制限チェック
      if (card.usageConditions.usesPerMatch) {
        const used = this.usedCards.get(card.id) || 0;
        if (used >= card.usageConditions.usesPerMatch) {
          return false;
        }
      }
      
      // クールダウンチェック
      const cooldown = this.cooldowns.get(card.id) || 0;
      if (cooldown > 0) {
        return false;
      }
      
      // エネルギーコストチェック（新システム）
      if (card.usageConditions.energyCost) {
        if (this.currentEnergy < card.usageConditions.energyCost) {
          return false;
        }
      }
      
      // 連携要求チェック（新システム）
      if (card.usageConditions.comboRequirement) {
        const hasAllRequiredCards = card.usageConditions.comboRequirement.every(
          requiredId => this.usedCardsHistory.includes(requiredId)
        );
        if (!hasAllRequiredCards) {
          return false;
        }
      }
      
      return true;
    });
  }

  // カードを使用
  useCard(cardId: string, currentPoint: number = 0): {
    success: boolean;
    card?: TacticCard;
    error?: string;
  } {
    const card = this.availableCards.find(c => c.id === cardId);
    if (!card) {
      return { success: false, error: 'カードが見つかりません' };
    }

    // 使用可能性チェック（簡易版）
    if (card.usageConditions.usesPerMatch) {
      const used = this.usedCards.get(cardId) || 0;
      if (used >= card.usageConditions.usesPerMatch) {
        return { success: false, error: '使用回数上限に達しています' };
      }
    }

    const cooldown = this.cooldowns.get(cardId) || 0;
    if (cooldown > 0) {
      return { success: false, error: `クールダウン中です（残り${cooldown}ポイント）` };
    }

    // エネルギーコストチェック
    if (card.usageConditions.energyCost) {
      if (this.currentEnergy < card.usageConditions.energyCost) {
        return { success: false, error: `エネルギー不足です（必要: ${card.usageConditions.energyCost}, 現在: ${this.currentEnergy}）` };
      }
    }

    // 連携要求チェック
    if (card.usageConditions.comboRequirement) {
      const missingCards = card.usageConditions.comboRequirement.filter(
        requiredId => !this.usedCardsHistory.includes(requiredId)
      );
      if (missingCards.length > 0) {
        return { success: false, error: `連携カードが不足です: ${missingCards.join(', ')}` };
      }
    }

    // カード使用処理
    this.usedCards.set(cardId, (this.usedCards.get(cardId) || 0) + 1);
    this.usedCardsHistory.push(cardId);
    
    if (card.usageConditions.cooldown) {
      this.cooldowns.set(cardId, card.usageConditions.cooldown);
    }

    // エネルギー消費
    if (card.usageConditions.energyCost) {
      this.currentEnergy -= card.usageConditions.energyCost;
    }

    return { success: true, card };
  }

  // クールダウンを進める
  advanceCooldowns(): void {
    for (const [cardId, cooldown] of this.cooldowns.entries()) {
      if (cooldown > 0) {
        this.cooldowns.set(cardId, cooldown - 1);
      }
    }
    
    // エネルギー自然回復（1ポイントごとに1回復）
    if (this.currentEnergy < this.maxEnergy) {
      this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + 1);
    }
  }
  
  // エネルギー情報取得
  getEnergyInfo(): { current: number; max: number; percentage: number } {
    return {
      current: this.currentEnergy,
      max: this.maxEnergy,
      percentage: Math.round((this.currentEnergy / this.maxEnergy) * 100)
    };
  }
  
  // 使用履歴取得
  getUsageHistory(): string[] {
    return [...this.usedCardsHistory];
  }
  
  // 連携可能な組み合わせを取得
  getAvailableCombos(): { cardId: string; name: string; requirements: string[] }[] {
    return this.availableCards
      .filter(card => card.usageConditions.comboRequirement)
      .map(card => ({
        cardId: card.id,
        name: card.name,
        requirements: card.usageConditions.comboRequirement || []
      }));
  }

  // 使用統計取得
  getUsageStats(): { cardId: string; uses: number; }[] {
    return Array.from(this.usedCards.entries()).map(([cardId, uses]) => ({
      cardId,
      uses
    }));
  }

  // リセット（試合開始時）
  reset(): void {
    this.usedCards.clear();
    this.cooldowns.clear();
  }

  // カード追加
  addCard(card: TacticCard): void {
    this.availableCards.push(card);
  }

  // カード削除
  removeCard(cardId: string): void {
    this.availableCards = this.availableCards.filter(card => card.id !== cardId);
  }

  // 全カード取得
  getAllCards(): TacticCard[] {
    return [...this.availableCards];
  }

  // レベル別カード取得
  getCardsByLevel(level: TacticCardLevel): TacticCard[] {
    return this.availableCards.filter(card => card.level === level);
  }

  // タイプ別カード取得
  getCardsByType(type: TacticCardType): TacticCard[] {
    return this.availableCards.filter(card => card.type === type);
  }

  // レアリティ別カード取得
  getCardsByRarity(rarity: TacticCardRarity): TacticCard[] {
    return this.availableCards.filter(card => card.rarity === rarity);
  }
}

// デフォルト戦術カードセット
export function getDefaultTacticCards(level: number = 1): TacticCard[] {
  const maxLevel = Math.min(level, 7);
  return TACTIC_CARDS_DATABASE.filter(card => 
    card.level <= maxLevel && 
    (card.rarity !== 'legendary' || level >= 5) // 伝説級は高レベルのみ
  );
}

// カード効果を計算
export function calculateCardEffect(
  card: TacticCard,
  baseStats: { [key: string]: number },
  situation: string,
  isOpponentSuppressed: boolean = false
): { [key: string]: number } {
  const effect = card.effects.immediate;
  let modifiedStats = { ...baseStats };

  // 基本能力値修正
  if (effect.skillModifiers) {
    Object.entries(effect.skillModifiers).forEach(([skill, modifier]) => {
      if (modifiedStats[skill] !== undefined && modifier !== undefined) {
        modifiedStats[skill] += modifier;
      }
    });
  }

  // 状況別ボーナス適用
  if (effect.situationalEffects) {
    const situationMap: { [key: string]: keyof typeof effect.situationalEffects } = {
      'break_point': 'breakPointBonus',
      'set_point': 'setPointBonus', 
      'behind': 'comebackBonus',
      'pressure': 'pressurePointBonus'
    };

    const bonusKey = situationMap[situation];
    if (bonusKey && effect.situationalEffects[bonusKey]) {
      const bonus = effect.situationalEffects[bonusKey]!;
      Object.keys(modifiedStats).forEach(skill => {
        modifiedStats[skill] += Math.floor(bonus * 0.1); // ボーナスの10%を各能力値に
      });
    }
  }

  // 相手抑制効果
  if (isOpponentSuppressed && effect.tacticalEffects?.suppressOpponent) {
    const suppression = effect.tacticalEffects.suppressOpponent;
    Object.keys(modifiedStats).forEach(skill => {
      modifiedStats[skill] += Math.floor(suppression * 0.2); // 抑制効果の20%を自分のボーナスに
    });
  }

  return modifiedStats;
}