// テニス特化型特殊能力システム（パワプロ・栄冠ナイン風）- 大幅拡張版

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
  | 'D';  // 欠点（赤特）

// 既存の型定義（後方互換性のため保持）
export type SpecialAbilityType = TennisAbilityCategory;
export type SpecialAbilityColor = TennisAbilityColor;
export type SpecialAbilityRank = TennisAbilityRank;

// 拡張された特殊能力効果インターフェース
export interface EnhancedSpecialAbilityEffects {
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

// 既存の効果インターフェース（後方互換性のため保持）
export interface SpecialAbilityEffects extends EnhancedSpecialAbilityEffects {
  // 既存のフィールドはそのまま
  fatiguePenaltyReduction?: number;
  vsLeftHandedBonus?: number;
  vsRightHandedBonus?: number;
  vsAggressive?: number;
  vsDefensive?: number;
  behindBonus?: number;
  leadBonus?: number;
  tiebreakBonus?: number;
  matchPointBonus?: number;
  // 既存のフィールドを明示的に追加
  serveBoost?: number;
  returnBoost?: number;
  volleyBoost?: number;
  strokeBoost?: number;
  mentalBoost?: number;
  staminaBoost?: number;
  criticalHitRate?: number;
  errorReduction?: number;
  staminaConsumptionReduction?: number;
  injuryResistance?: number;
  consistencyBoost?: number;
}

// 拡張された特殊能力インターフェース
export interface EnhancedSpecialAbility {
  id: string;
  name: string;
  englishName: string;
  category: TennisAbilityCategory;
  color: TennisAbilityColor;
  rank: TennisAbilityRank;
  description: string;
  effects: EnhancedSpecialAbilityEffects;
  isActive: boolean;
  
  // 取得条件
  prerequisites?: {
    level?: number;
    baseStats?: { [key: string]: number };
    requiredAbilities?: string[];
    forbiddenAbilities?: string[];
    matchWins?: number;
    tournamentWins?: number;
    practiceHours?: number;
    specificTraining?: string[];
    pokemonType?: string[];
    region?: string[];
    season?: string[];
    weatherConditions?: string[];
  };
  
  // 取得方法と確率
  acquisitionMethods?: {
    method: 'training' | 'match' | 'event' | 'evolution' | 'item' | 'coach' | 'combination';
    probability: number;
    requirements?: any;
  }[];
  
  // UI表示用
  iconPath?: string;
  colorCode?: string;
  displayOrder?: number;
  
  // メタデータ
  version?: string;
  rarityWeight?: number;
  powerLevel?: number;
}

// 既存の特殊能力インターフェース（後方互換性のため保持）
export interface SpecialAbility extends EnhancedSpecialAbility {
  type: SpecialAbilityType; // 既存のtypeフィールド
}

// 特殊能力組み合わせインターフェース
export interface AbilityCombination {
  id: string;
  combinationName: string;
  requiredAbilities: string[];
  resultAbility: string;
  description: string;
  successRate: number;
  isActive: boolean;
}

// 特殊能力習得履歴インターフェース
export interface AbilityAcquisitionHistory {
  id: string;
  playerId: string;
  abilityId: string;
  acquisitionMethod: string;
  acquisitionDate: Date;
  successRateUsed?: number;
  wasCombination: boolean;
  combinationId?: string;
  createdAt: Date;
}

// 特殊能力の効果計算ユーティリティ（拡張版）
export class EnhancedSpecialAbilityCalculator {
  // 複数特殊能力の相互作用計算
  static calculateCombinedEffects(
    abilities: EnhancedSpecialAbility[],
    situation?: {
      isFirstServe?: boolean;
      isSecondServe?: boolean;
      isBreakPoint?: boolean;
      isServiceGame?: boolean;
      isReturnGame?: boolean;
      isTiebreak?: boolean;
      isMatchPoint?: boolean;
      isSetPoint?: boolean;
      isBehind?: boolean;
      isAhead?: boolean;
      isEven?: boolean;
      rallyLength?: number;
      isApproachShot?: boolean;
      isPassingShot?: boolean;
      isDropShot?: boolean;
      isLob?: boolean;
      isCounterAttack?: boolean;
      isFresh?: boolean;
      isTired?: boolean;
      isOvertime?: boolean;
      isFinalSet?: boolean;
      opponentHand?: 'left' | 'right';
      opponentType?: 'aggressive' | 'defensive' | 'technical' | 'power' | 'balanced' | 'counter';
      opponentRank?: 'higher' | 'lower' | 'same';
      courtType?: 'hard' | 'clay' | 'grass' | 'indoor';
      weather?: 'sunny' | 'windy' | 'rain' | 'hot' | 'cold';
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
      tournamentType?: 'prefectural' | 'regional' | 'national' | 'practice';
    },
    environment?: {
      courtType?: string;
      weather?: string;
      timeOfDay?: string;
      tournamentLevel?: string;
    }
  ): CombinedAbilityEffect {
    
    let totalEffect = {
      skillBoosts: {} as Record<string, number>,
      specialEffects: {} as Record<string, number>,
      situationalModifiers: {} as Record<string, number>,
      growthEffects: {} as Record<string, number>,
      teamEffects: {} as Record<string, number>
    };
    
    // 基本効果の積算
    abilities.forEach(ability => {
      if (!ability.isActive) return;
      
      const baseEffect = this.calculateBaseEffect(ability, situation);
      this.mergeEffects(totalEffect, baseEffect);
    });
    
    // 相乗効果の計算
    const synergyEffects = this.calculateSynergyEffects(abilities);
    this.applySynergyEffects(totalEffect, synergyEffects);
    
    // 上限・下限の適用
    this.applyEffectLimits(totalEffect);
    
    // 環境要因の適用
    if (environment) {
      this.applyEnvironmentalFactors(totalEffect, environment);
    }
    
    return totalEffect;
  }
  
  // 基本効果の計算
  private static calculateBaseEffect(
    ability: EnhancedSpecialAbility,
    situation?: any
  ): any {
    const effect = {
      skillBoosts: {} as Record<string, number>,
      specialEffects: {} as Record<string, number>,
      situationalModifiers: {} as Record<string, number>,
      growthEffects: {} as Record<string, number>,
      teamEffects: {} as Record<string, number>
    };
    
    // 基本能力値ボーナス
    if (ability.effects.serveBoost) effect.skillBoosts.serve = ability.effects.serveBoost;
    if (ability.effects.returnBoost) effect.skillBoosts.return = ability.effects.returnBoost;
    if (ability.effects.volleyBoost) effect.skillBoosts.volley = ability.effects.volleyBoost;
    if (ability.effects.strokeBoost) effect.skillBoosts.stroke = ability.effects.strokeBoost;
    if (ability.effects.mentalBoost) effect.skillBoosts.mental = ability.effects.mentalBoost;
    if (ability.effects.staminaBoost) effect.skillBoosts.stamina = ability.effects.staminaBoost;
    
    // 状況別効果の適用
    if (situation && ability.effects.situationalEffects) {
      this.applySituationalEffects(effect, ability.effects.situationalEffects, situation);
    }
    
    // 特殊効果
    if (ability.effects.specialEffects) {
      Object.assign(effect.specialEffects, ability.effects.specialEffects);
    }
    
    // 成長効果
    if (ability.effects.growthEffects) {
      Object.assign(effect.growthEffects, ability.effects.growthEffects);
    }
    
    // チーム効果
    if (ability.effects.teamEffects) {
      Object.assign(effect.teamEffects, ability.effects.teamEffects);
    }
    
    return effect;
  }
  
  // 状況別効果の適用
  private static applySituationalEffects(
    effect: any,
    situationalEffects: any,
    situation: any
  ): void {
    // サーブ状況
    if (situation.isFirstServe && situationalEffects.firstServeBonus) {
      effect.skillBoosts.serve = (effect.skillBoosts.serve || 0) + situationalEffects.firstServeBonus;
    }
    if (situation.isSecondServe && situationalEffects.secondServeBonus) {
      effect.skillBoosts.serve = (effect.skillBoosts.serve || 0) + situationalEffects.secondServeBonus;
    }
    
    // ゲーム状況
    if (situation.isBreakPoint && situationalEffects.breakPointBonus) {
      effect.situationalModifiers.breakPoint = situationalEffects.breakPointBonus;
    }
    if (situation.isServiceGame && situationalEffects.serviceGameBonus) {
      effect.situationalModifiers.serviceGame = situationalEffects.serviceGameBonus;
    }
    if (situation.isReturnGame && situationalEffects.returnGameBonus) {
      effect.situationalModifiers.returnGame = situationalEffects.returnGameBonus;
    }
    
    // セット状況
    if (situation.isTiebreak && situationalEffects.tiebreakBonus) {
      effect.situationalModifiers.tiebreak = situationalEffects.tiebreakBonus;
    }
    if (situation.isMatchPoint && situationalEffects.matchPointBonus) {
      effect.situationalModifiers.matchPoint = situationalEffects.matchPointBonus;
    }
    if (situation.isSetPoint && situationalEffects.setPointBonus) {
      effect.situationalModifiers.setPoint = situationalEffects.setPointBonus;
    }
    
    // スコア状況
    if (situation.isBehind && situationalEffects.behindBonus) {
      effect.situationalModifiers.behind = situationalEffects.behindBonus;
    }
    if (situation.isAhead && situationalEffects.leadBonus) {
      effect.situationalModifiers.lead = situationalEffects.leadBonus;
    }
    if (situation.isEven && situationalEffects.evenBonus) {
      effect.situationalModifiers.even = situationalEffects.evenBonus;
    }
    
    // ラリー状況
    if (situation.rallyLength && situation.rallyLength <= 3 && situationalEffects.shortRallyBonus) {
      effect.situationalModifiers.shortRally = situationalEffects.shortRallyBonus;
    }
    if (situation.rallyLength && situation.rallyLength >= 10 && situationalEffects.longRallyBonus) {
      effect.situationalModifiers.longRally = situationalEffects.longRallyBonus;
    }
    
    // ショット状況
    if (situation.isApproachShot && situationalEffects.approachShotBonus) {
      effect.situationalModifiers.approachShot = situationalEffects.approachShotBonus;
    }
    if (situation.isPassingShot && situationalEffects.passingshotBonus) {
      effect.situationalModifiers.passingShot = situationalEffects.passingshotBonus;
    }
    if (situation.isDropShot && situationalEffects.dropShotBonus) {
      effect.situationalModifiers.dropShot = situationalEffects.dropShotBonus;
    }
    if (situation.isLob && situationalEffects.lobBonus) {
      effect.situationalModifiers.lob = situationalEffects.lobBonus;
    }
    if (situation.isCounterAttack && situationalEffects.counterAttackBonus) {
      effect.situationalModifiers.counterAttack = situationalEffects.counterAttackBonus;
    }
    
    // 体力状況
    if (situation.isFresh && situationalEffects.freshBonus) {
      effect.situationalModifiers.fresh = situationalEffects.freshBonus;
    }
    if (situation.isTired && situationalEffects.tiredPenaltyReduction) {
      effect.situationalModifiers.tiredPenaltyReduction = situationalEffects.tiredPenaltyReduction;
    }
    if (situation.isOvertime && situationalEffects.overtimeBonus) {
      effect.situationalModifiers.overtime = situationalEffects.overtimeBonus;
    }
    if (situation.isFinalSet && situationalEffects.finalSetBonus) {
      effect.situationalModifiers.finalSet = situationalEffects.finalSetBonus;
    }
    
    // 相手タイプ別
    if (situation.opponentHand === 'left' && situationalEffects.vsLeftHandedBonus) {
      effect.situationalModifiers.vsLeftHanded = situationalEffects.vsLeftHandedBonus;
    }
    if (situation.opponentHand === 'right' && situationalEffects.vsRightHandedBonus) {
      effect.situationalModifiers.vsRightHanded = situationalEffects.vsRightHandedBonus;
    }
    
    if (situation.opponentType && situationalEffects[`vs${situation.opponentType.charAt(0).toUpperCase() + situation.opponentType.slice(1)}Bonus`]) {
      const bonusKey = `vs${situation.opponentType.charAt(0).toUpperCase() + situation.opponentType.slice(1)}Bonus`;
      effect.situationalModifiers[`vs${situation.opponentType}`] = situationalEffects[bonusKey];
    }
    
    if (situation.opponentRank && situationalEffects[`vs${situation.opponentRank.charAt(0).toUpperCase() + situation.opponentRank.slice(1)}Bonus`]) {
      const bonusKey = `vs${situation.opponentRank.charAt(0).toUpperCase() + situation.opponentRank.slice(1)}Bonus`;
      effect.situationalModifiers[`vs${situation.opponentRank}`] = situationalEffects[bonusKey];
    }
    
    // 環境要因
    if (situation.courtType && situationalEffects[`${situation.courtType}CourtBonus`]) {
      effect.situationalModifiers[`${situation.courtType}Court`] = situationalEffects[`${situation.courtType}CourtBonus`];
    }
    if (situation.weather && situationalEffects[`${situation.weather}WeatherBonus`]) {
      effect.situationalModifiers[`${situation.weather}Weather`] = situationalEffects[`${situation.weather}WeatherBonus`];
    }
    if (situation.timeOfDay && situationalEffects[`${situation.timeOfDay}Bonus`]) {
      effect.situationalModifiers[`${situation.timeOfDay}`] = situationalEffects[`${situation.timeOfDay}Bonus`];
    }
    if (situation.tournamentType && situationalEffects[`${situation.tournamentType}TournamentBonus`]) {
      effect.situationalModifiers[`${situation.tournamentType}Tournament`] = situationalEffects[`${situation.tournamentType}TournamentBonus`];
    }
  }
  
  // 相乗効果の計算
  private static calculateSynergyEffects(abilities: EnhancedSpecialAbility[]): any[] {
    const synergies: any[] = [];
    
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
    
    const returnAbilities = abilities.filter(a => a.category === 'return');
    if (returnAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'return',
        multiplier: 1.1 + (returnAbilities.length - 2) * 0.05,
        description: 'リターン系能力の相乗効果'
      });
    }
    
    const volleyAbilities = abilities.filter(a => a.category === 'volley');
    if (volleyAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'volley',
        multiplier: 1.1 + (volleyAbilities.length - 2) * 0.05,
        description: 'ボレー系能力の相乗効果'
      });
    }
    
    const strokeAbilities = abilities.filter(a => a.category === 'stroke');
    if (strokeAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'stroke',
        multiplier: 1.1 + (strokeAbilities.length - 2) * 0.05,
        description: 'ストローク系能力の相乗効果'
      });
    }
    
    const mentalAbilities = abilities.filter(a => a.category === 'mental');
    if (mentalAbilities.length >= 2) {
      synergies.push({
        type: 'category_synergy',
        category: 'mental',
        multiplier: 1.1 + (mentalAbilities.length - 2) * 0.05,
        description: 'メンタル系能力の相乗効果'
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
  
  // 効果のマージ
  private static mergeEffects(totalEffect: any, newEffect: any): void {
    // スキルボーナスのマージ
    Object.entries(newEffect.skillBoosts).forEach(([key, value]) => {
      totalEffect.skillBoosts[key] = (totalEffect.skillBoosts[key] || 0) + (value as number);
    });
    
    // 特殊効果のマージ
    Object.entries(newEffect.specialEffects).forEach(([key, value]) => {
      totalEffect.specialEffects[key] = (totalEffect.specialEffects[key] || 0) + (value as number);
    });
    
    // 状況別効果のマージ
    Object.entries(newEffect.situationalModifiers).forEach(([key, value]) => {
      totalEffect.situationalModifiers[key] = (totalEffect.situationalModifiers[key] || 0) + (value as number);
    });
    
    // 成長効果のマージ
    Object.entries(newEffect.growthEffects).forEach(([key, value]) => {
      totalEffect.growthEffects[key] = (totalEffect.growthEffects[key] || 0) + (value as number);
    });
    
    // チーム効果のマージ
    Object.entries(newEffect.teamEffects).forEach(([key, value]) => {
      totalEffect.teamEffects[key] = (totalEffect.teamEffects[key] || 0) + (value as number);
    });
  }
  
  // 相乗効果の適用
  private static applySynergyEffects(totalEffect: any, synergies: any[]): void {
    synergies.forEach(synergy => {
      if (synergy.type === 'category_synergy') {
        // カテゴリ相乗効果
        const category = synergy.category;
        if (totalEffect.skillBoosts[category]) {
          totalEffect.skillBoosts[category] = Math.floor(totalEffect.skillBoosts[category] * synergy.multiplier);
        }
      } else if (synergy.type === 'specific_combination') {
        // 特定組み合わせ効果
        Object.entries(synergy.effect).forEach(([key, value]) => {
          if (key.includes('Boost')) {
            totalEffect.skillBoosts[key] = (totalEffect.skillBoosts[key] || 0) + (value as number);
          } else {
            totalEffect.specialEffects[key] = (totalEffect.specialEffects[key] || 0) + (value as number);
          }
        });
      }
    });
  }
  
  // 効果の上限・下限適用
  private static applyEffectLimits(totalEffect: any): void {
    // スキルボーナスの上限（+100まで）
    Object.keys(totalEffect.skillBoosts).forEach(key => {
      totalEffect.skillBoosts[key] = Math.min(100, Math.max(-50, totalEffect.skillBoosts[key]));
    });
    
    // 特殊効果の上限
    if (totalEffect.specialEffects.criticalHitRate) {
      totalEffect.specialEffects.criticalHitRate = Math.min(50, Math.max(0, totalEffect.specialEffects.criticalHitRate));
    }
    if (totalEffect.specialEffects.errorReduction) {
      totalEffect.specialEffects.errorReduction = Math.min(80, Math.max(0, totalEffect.specialEffects.errorReduction));
    }
  }
  
  // 環境要因の適用
  private static applyEnvironmentalFactors(totalEffect: any, environment: any): void {
    // コートタイプによる調整
    if (environment.courtType === 'clay') {
      // クレーコートではボレーが不利
      if (totalEffect.skillBoosts.volley) {
        totalEffect.skillBoosts.volley = Math.floor(totalEffect.skillBoosts.volley * 0.8);
      }
    } else if (environment.courtType === 'grass') {
      // グラスコートではサーブが有利
      if (totalEffect.skillBoosts.serve) {
        totalEffect.skillBoosts.serve = Math.floor(totalEffect.skillBoosts.serve * 1.2);
      }
    }
    
    // 天候による調整
    if (environment.weather === 'windy') {
      // 風が強い日は精度系が不利
      if (totalEffect.specialEffects.consistencyBoost) {
        totalEffect.specialEffects.consistencyBoost = Math.floor(totalEffect.specialEffects.consistencyBoost * 0.7);
      }
    }
  }
}

// 既存の計算機（後方互換性のため保持）
export class SpecialAbilityCalculator {
  // 既存のメソッドはそのまま
  static calculateStatBonus(
    abilities: SpecialAbility[], 
    statType: keyof SpecialAbilityEffects,
    situation?: {
      isBehind?: boolean;
      isAhead?: boolean;
      isTiebreak?: boolean;
      isMatchPoint?: boolean;
      opponentType?: 'aggressive' | 'defensive';
      opponentHand?: 'left' | 'right';
    }
  ): number {
    let totalBonus = 0;

    abilities.forEach(ability => {
      if (!ability.isActive) return;

      const effects = ability.effects;
      
      // 基本ボーナス
      if (statType in effects && typeof effects[statType] === 'number') {
        totalBonus += effects[statType] as number;
      }

      // 状況別ボーナス（既存のフィールドのみ）
      if (situation) {
        if (situation.isBehind && 'behindBonus' in effects && typeof effects.behindBonus === 'number') {
          totalBonus += effects.behindBonus;
        }
        if (situation.isAhead && 'leadBonus' in effects && typeof effects.leadBonus === 'number') {
          totalBonus += effects.leadBonus;
        }
        if (situation.isTiebreak && 'tiebreakBonus' in effects && typeof effects.tiebreakBonus === 'number') {
          totalBonus += effects.tiebreakBonus;
        }
        if (situation.isMatchPoint && 'matchPointBonus' in effects && typeof effects.matchPointBonus === 'number') {
          totalBonus += effects.matchPointBonus;
        }
        if (situation.opponentType === 'aggressive' && 'vsAggressive' in effects && typeof effects.vsAggressive === 'number') {
          totalBonus += effects.vsAggressive;
        }
        if (situation.opponentType === 'defensive' && 'vsDefensive' in effects && typeof effects.vsDefensive === 'number') {
          totalBonus += effects.vsDefensive;
        }
        if (situation.opponentHand === 'left' && 'vsLeftHandedBonus' in effects && typeof effects.vsLeftHandedBonus === 'number') {
          totalBonus += effects.vsLeftHandedBonus;
        }
        if (situation.opponentHand === 'right' && 'vsRightHandedBonus' in effects && typeof effects.vsRightHandedBonus === 'number') {
          totalBonus += effects.vsRightHandedBonus;
        }
      }
    });

    return totalBonus;
  }

  // 特殊効果の計算（クリティカル率、エラー軽減率など）
  static calculateSpecialEffect(
    abilities: SpecialAbility[],
    effectType: keyof SpecialAbilityEffects
  ): number {
    let totalEffect = 0;

    abilities.forEach(ability => {
      if (!ability.isActive) return;

      const effects = ability.effects;
      if (effectType in effects && typeof effects[effectType] === 'number') {
        totalEffect += effects[effectType] as number;
      }
    });

    return totalEffect;
  }

  // ID で特殊能力を取得
  static getAbilityById(id: string): SpecialAbility | undefined {
    return TENNIS_SPECIAL_ABILITIES.find(ability => ability.id === id);
  }

  // タイプ別特殊能力を取得
  static getAbilitiesByType(type: SpecialAbilityType): SpecialAbility[] {
    return TENNIS_SPECIAL_ABILITIES.filter(ability => ability.type === type);
  }

  // 色別特殊能力を取得
  static getAbilityByColor(color: SpecialAbilityColor): SpecialAbility[] {
    return TENNIS_SPECIAL_ABILITIES.filter(ability => ability.color === color);
  }
}

// 型定義
export interface CombinedAbilityEffect {
  skillBoosts: Record<string, number>;
  specialEffects: Record<string, number>;
  situationalModifiers: Record<string, number>;
  growthEffects: Record<string, number>;
  teamEffects: Record<string, number>;
}

// 既存の特殊能力データベース（後方互換性のため保持）
export const TENNIS_SPECIAL_ABILITIES: SpecialAbility[] = [
  // 既存のデータはそのまま保持
];