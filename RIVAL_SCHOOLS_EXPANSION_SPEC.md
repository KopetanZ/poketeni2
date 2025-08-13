# ライバル校システム大幅拡張仕様書

**作成日**: 2025-08-13  
**目的**: ライバル校の多様性拡大と地域特色システム実装  
**対象**: 全47都道府県×複数校による総合的なライバル校生態系構築

---

## 🎯 プロジェクト概要

### 拡張目標
1. **ライバル校数拡大**: 現在の基本システム → 全都道府県対応・200校以上
2. **地域特色システム**: 各都道府県固有の戦術・ポケモン編成・文化
3. **階層制大会システム**: 地区→県→地方→全国の段階的競技システム
4. **動的ライバル関係**: プレイヤーの成長に応じてライバル校も成長
5. **リアルタイム評価**: 他校の成績変動とランキング変化

---

## 📊 現状システム分析

### 既存の実装状況
- **対戦システム**: 高度な試合エンジン（特殊能力・戦術・環境要因対応）
- **CPU生成**: 難易度別のライバル選手生成機能
- **トーナメント**: 基本的な大会システム（地区・県・全国）
- **戦術システム**: 6種類の戦術（aggressive, defensive, balanced, technical, power, counter）

### 拡張が必要な領域
1. **ライバル校のバリエーション不足**
2. **地域性の欠如**
3. **成長・変化システムの未実装**
4. **ストーリー性の欠如**

---

## 🏫 ライバル校システム設計

### 1. 学校分類システム

```typescript
type SchoolType = 
  | 'traditional' // 伝統校（歴史ある強豪）
  | 'emerging'    // 新興校（急成長校）
  | 'technical'   // 技術校（戦術特化）
  | 'power'       // パワー校（物理特化）
  | 'balanced'    // バランス校（総合力）
  | 'specialized' // 特殊校（独特な戦略）
  | 'academy';    // アカデミー校（育成重視）

type SchoolRank = 
  | 'S++'  // 全国トップクラス（3-5校）
  | 'S+'   // 全国上位（10-15校）
  | 'S'    // 全国レベル（20-30校）
  | 'A+'   // 地方レベル（40-50校）
  | 'A'    // 県レベル（60-80校）
  | 'B+'   // 地区レベル（80-100校）
  | 'B'    // 一般校（残り全て）;

interface RivalSchool {
  id: string;
  name: string;
  prefecture: string;        // 都道府県
  region: string;           // 地方（関東・関西など）
  type: SchoolType;
  rank: SchoolRank;
  
  // 学校特色
  philosophy: string;        // 校風・理念
  specialty: string[];       // 得意分野
  weaknesses: string[];      // 苦手分野
  signature_tactics: TacticType[];
  
  // 戦力構成
  ace_pokemon: string;       // エースポケモン
  preferred_types: string[];  // 好むタイプ
  team_composition: TeamComposition;
  average_level: number;
  
  // 実績・評価
  current_rating: number;    // 現在レーティング
  historical_achievements: Achievement[];
  rivalry_relationships: RivalryRelationship[];
  
  // 動的要素
  growth_trajectory: 'ascending' | 'stable' | 'declining';
  season_form: number;       // 今シーズンの調子
  injury_situation: InjurySituation;
  
  // 地域特色
  regional_modifiers: RegionalModifier;
  local_culture: CultureModifier;
  
  // UI/表示用
  school_colors: [string, string];
  mascot: string;
  motto: string;
  founded_year: number;
}
```

### 2. 都道府県別地域特性システム

```typescript
interface RegionalCharacteristics {
  prefecture: string;
  region: string;
  
  // 気候・環境要因
  climate: {
    primary_weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
    court_preference: 'hard' | 'clay' | 'grass' | 'indoor';
    temperature_modifier: number;  // -20 ~ +20
  };
  
  // 文化的特色
  culture: {
    preferred_pokemon_types: string[];     // 地域で人気のタイプ
    traditional_tactics: TacticType[];     // 伝統戦術
    training_philosophy: 'power' | 'technique' | 'mental' | 'balanced';
    competitive_spirit: number;            // 競争精神レベル 1-10
  };
  
  // 経済・施設レベル
  infrastructure: {
    facility_quality: number;             // 1-10（設備レベル）
    coaching_level: number;               // 1-10（指導レベル）
    funding_level: number;                // 1-10（資金力）
    population_density: 'high' | 'medium' | 'low';
  };
  
  // 特産・名物ポケモン
  signature_pokemon: {
    legendary_ace: string;                // 地域の象徴的エース
    common_choices: string[];             // よく見かけるポケモン
    rare_appearances: string[];           // 稀に現れる強豪
  };
}

// 実際の都道府県データサンプル
const REGIONAL_DATA: Record<string, RegionalCharacteristics> = {
  '東京都': {
    prefecture: '東京都',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 5
    },
    culture: {
      preferred_pokemon_types: ['electric', 'psychic', 'steel'],
      traditional_tactics: ['technical', 'balanced'],
      training_philosophy: 'technique',
      competitive_spirit: 9
    },
    infrastructure: {
      facility_quality: 10,
      coaching_level: 9,
      funding_level: 10,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'サンダース',
      common_choices: ['ピカチュウ', 'コイル', 'ケーシィ'],
      rare_appearances: ['フーディン', 'サンダー']
    }
  },
  
  '沖縄県': {
    prefecture: '沖縄県',
    region: '九州',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 15
    },
    culture: {
      preferred_pokemon_types: ['water', 'fire', 'flying'],
      traditional_tactics: ['power', 'aggressive'],
      training_philosophy: 'power',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'リザードン',
      common_choices: ['コダック', 'ヒトカゲ', 'ポッポ'],
      rare_appearances: ['ラプラス', 'ファイヤー']
    }
  },
  
  '北海道': {
    prefecture: '北海道',
    region: '北海道',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -15
    },
    culture: {
      preferred_pokemon_types: ['ice', 'normal', 'ground'],
      traditional_tactics: ['defensive', 'counter'],
      training_philosophy: 'mental',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 8,
      funding_level: 7,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ロコン', 'ユキワラシ', 'タマザラシ'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  }
  // 全47都道府県分のデータを定義...
};
```

### 3. ライバル校生成システム

```typescript
class RivalSchoolGenerator {
  // 都道府県別学校生成
  static generateSchoolsForPrefecture(prefecture: string, schoolCount: number): RivalSchool[] {
    const regional = REGIONAL_DATA[prefecture];
    const schools: RivalSchool[] = [];
    
    for (let i = 0; i < schoolCount; i++) {
      const school = this.createSchool(prefecture, regional, i);
      schools.push(school);
    }
    
    return schools;
  }
  
  private static createSchool(prefecture: string, regional: RegionalCharacteristics, index: number): RivalSchool {
    // 学校タイプ決定（地域特性を考慮）
    const schoolType = this.determineSchoolType(regional, index);
    
    // ランク決定（人口密度・インフラを考慮）
    const rank = this.determineSchoolRank(prefecture, regional, index);
    
    // 戦術決定（地域文化を反映）
    const tactics = this.selectSchoolTactics(regional, schoolType);
    
    // ポケモン編成決定
    const composition = this.generateTeamComposition(regional, schoolType, rank);
    
    return {
      id: `${prefecture}_school_${index}`,
      name: this.generateSchoolName(prefecture, schoolType, index),
      prefecture,
      region: regional.region,
      type: schoolType,
      rank,
      philosophy: this.generatePhilosophy(schoolType, regional),
      specialty: this.determineSpecialties(schoolType, regional),
      weaknesses: this.determineWeaknesses(schoolType),
      signature_tactics: tactics,
      ace_pokemon: this.selectAcePokemon(regional, rank),
      preferred_types: regional.culture.preferred_pokemon_types,
      team_composition: composition,
      average_level: this.calculateAverageLevel(rank),
      current_rating: this.calculateInitialRating(rank, regional),
      historical_achievements: [],
      rivalry_relationships: [],
      growth_trajectory: this.determineGrowthTrajectory(),
      season_form: 0.8 + Math.random() * 0.4, // 0.8-1.2
      injury_situation: this.generateInjurySituation(),
      regional_modifiers: this.createRegionalModifiers(regional),
      local_culture: this.createCultureModifiers(regional),
      school_colors: this.generateSchoolColors(),
      mascot: this.selectMascot(regional),
      motto: this.generateMotto(schoolType),
      founded_year: 1950 + Math.floor(Math.random() * 70)
    };
  }
  
  // 学校名生成（地域特色を反映）
  private static generateSchoolName(prefecture: string, type: SchoolType, index: number): string {
    const prefectureShort = prefecture.replace(/[都道府県]/g, '');
    
    const typeNames = {
      traditional: ['第一', '中央', '県立'],
      emerging: ['新星', '未来', '希望'],
      technical: ['工業', '技術', '科学'],
      power: ['体育', 'スポーツ', '競技'],
      balanced: ['総合', '学園', '高等'],
      specialized: ['特進', '実験', '研究'],
      academy: ['アカデミー', '学院', '学舎']
    };
    
    const suffixes = ['高校', '高等学校', '学園', '学院'];
    const typeName = typeNames[type][index % typeNames[type].length];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefectureShort}${typeName}${suffix}`;
  }
}
```

### 4. 動的ライバル成長システム

```typescript
interface RivalGrowthSystem {
  // ライバル校の成長・変化処理
  static updateSchoolStatus(school: RivalSchool, playerPerformance: PlayerPerformance): RivalSchool {
    const updated = { ...school };
    
    // プレイヤーの成績に応じてライバル校も成長
    if (playerPerformance.recent_wins > 0.7) {
      updated.current_rating = Math.min(updated.current_rating + 5, 1000);
      updated.average_level = Math.min(updated.average_level + 1, 50);
    }
    
    // シーズン調子の変動
    updated.season_form = this.updateSeasonForm(updated.season_form);
    
    // 成長軌道の変化
    updated.growth_trajectory = this.updateGrowthTrajectory(updated);
    
    return updated;
  }
  
  // ライバル関係の生成・発展
  static developRivalries(playerSchool: School, rivalSchools: RivalSchool[]): RivalryRelationship[] {
    const rivalries: RivalryRelationship[] = [];
    
    rivalSchools.forEach(rival => {
      const relationship = this.calculateRivalryStrength(playerSchool, rival);
      if (relationship.strength > 0.3) {
        rivalries.push(relationship);
      }
    });
    
    return rivalries;
  }
}

interface RivalryRelationship {
  rival_school_id: string;
  rivalry_type: 'traditional' | 'regional' | 'competitive' | 'historical';
  strength: number;           // 0-1（ライバル関係の強さ）
  match_history: MatchRecord[];
  special_events: string[];   // 因縁イベント
  next_encounter: Date;
}
```

---

## 🗾 地域特色システム詳細

### 1. 地方別戦術傾向

```typescript
const REGIONAL_TACTICS: Record<string, TacticsProfile> = {
  '関東': {
    preferred: ['technical', 'balanced'],
    philosophy: '技術と戦術の洗練',
    special_modifier: { volley_skill: +5, mental: +3 }
  },
  
  '関西': {
    preferred: ['aggressive', 'power'],
    philosophy: '情熱的で攻撃的なテニス',
    special_modifier: { serve_skill: +5, stroke_skill: +3 }
  },
  
  '九州': {
    preferred: ['power', 'aggressive'],
    philosophy: '豪快で力強いプレースタイル',
    special_modifier: { serve_skill: +8, stamina: +5 }
  },
  
  '東北': {
    preferred: ['defensive', 'counter'],
    philosophy: '粘り強く我慢強い戦い方',
    special_modifier: { return_skill: +6, mental: +8 }
  },
  
  '中部': {
    preferred: ['balanced', 'technical'],
    philosophy: 'バランス重視の堅実なテニス',
    special_modifier: { stroke_skill: +4, mental: +4, stamina: +4 }
  }
};
```

### 2. 都道府県別名門校システム

```typescript
const PRESTIGIOUS_SCHOOLS: Record<string, PrestigiousSchool[]> = {
  '東京都': [
    {
      name: '帝都学園高等学校',
      rank: 'S++',
      specialty: '全国制覇常連の超名門',
      ace_pokemon: 'フーディン',
      historical_titles: 15,
      famous_alumni: ['全国王者○○', 'プロ選手△△']
    },
    {
      name: '東京工業高校',
      rank: 'S+',
      specialty: '技術特化の理系強豪',
      ace_pokemon: 'メタグロス',
      historical_titles: 8,
      famous_alumni: ['技術革新者□□']
    }
  ],
  
  '大阪府': [
    {
      name: '大阪商業高校',
      rank: 'S++',
      specialty: '関西最強の商業系',
      ace_pokemon: 'カイリキー',
      historical_titles: 12,
      famous_alumni: ['関西王者●●']
    }
  ]
  
  // 全都道府県の名門校定義...
};
```

---

## 🏆 階層制大会システム

### 1. 大会構造の詳細設計

```typescript
interface CompetitionHierarchy {
  level: 'district' | 'prefectural' | 'regional' | 'national' | 'international';
  name: string;
  participants: number;
  duration_days: number;
  entry_requirements: EntryRequirement;
  rewards: CompetitionReward;
  qualification_path: string; // 次レベルへの進出条件
}

const COMPETITION_SYSTEM: CompetitionHierarchy[] = [
  {
    level: 'district',
    name: '地区大会',
    participants: 16,
    duration_days: 3,
    entry_requirements: { min_level: 5, min_players: 3 },
    rewards: { funds: 1000, reputation: 10, items: ['basic_trophy'] },
    qualification_path: 'Top 4 advance to Prefectural'
  },
  
  {
    level: 'prefectural',
    name: '県大会',
    participants: 32,
    duration_days: 5,
    entry_requirements: { min_level: 12, district_qualification: true },
    rewards: { funds: 5000, reputation: 30, items: ['silver_trophy'] },
    qualification_path: 'Top 2 advance to Regional'
  },
  
  {
    level: 'regional',
    name: '地方大会',
    participants: 16,
    duration_days: 7,
    entry_requirements: { prefectural_qualification: true },
    rewards: { funds: 15000, reputation: 75, items: ['gold_trophy'] },
    qualification_path: 'Winner advances to National'
  },
  
  {
    level: 'national',
    name: '全国大会',
    participants: 8,
    duration_days: 10,
    entry_requirements: { regional_qualification: true },
    rewards: { funds: 50000, reputation: 200, items: ['national_championship'] },
    qualification_path: 'Top 2 advance to International'
  },
  
  {
    level: 'international',
    name: '国際大会',
    participants: 4,
    duration_days: 14,
    entry_requirements: { national_qualification: true, rank: 'S+' },
    rewards: { funds: 200000, reputation: 500, items: ['world_championship'] },
    qualification_path: 'Ultimate Achievement'
  }
];
```

### 2. シーズン制大会システム

```typescript
interface SeasonSchedule {
  spring_season: {
    months: [3, 4, 5];
    competitions: ['district', 'prefectural'];
    special_events: ['new_student_tournament', 'spring_training_camp'];
  };
  
  summer_season: {
    months: [6, 7, 8];
    competitions: ['regional', 'national'];
    special_events: ['summer_intensive', 'training_camp'];
  };
  
  autumn_season: {
    months: [9, 10, 11];
    competitions: ['autumn_cup', 'veterans_tournament'];
    special_events: ['cultural_festival', 'alumni_match'];
  };
  
  winter_season: {
    months: [12, 1, 2];
    competitions: ['indoor_championship', 'new_year_cup'];
    special_events: ['winter_training', 'year_end_rankings'];
  };
}
```

---

## 🎯 マッチメイキング・対戦システム

### 1. 智的対戦相手選択

```typescript
class IntelligentMatchmaking {
  // プレイヤーレベルに応じた適切な対戦相手選択
  static selectOptimalOpponent(
    playerSchool: School, 
    availableSchools: RivalSchool[],
    context: MatchContext
  ): RivalSchool {
    
    const candidates = availableSchools.filter(school => {
      // レーティング差が適切な範囲内
      const ratingDiff = Math.abs(school.current_rating - playerSchool.rating);
      return ratingDiff <= 100 + (playerSchool.level * 5);
    });
    
    // 戦術相性・地域特色・ライバル関係を考慮
    const scored = candidates.map(school => ({
      school,
      score: this.calculateMatchInterest(playerSchool, school, context)
    }));
    
    // 最もバランスの取れた対戦相手を選択
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.school || availableSchools[0];
  }
  
  private static calculateMatchInterest(
    player: School, 
    rival: RivalSchool, 
    context: MatchContext
  ): number {
    let score = 0;
    
    // レーティング近似度
    const ratingDiff = Math.abs(rival.current_rating - player.rating);
    score += Math.max(0, 100 - ratingDiff);
    
    // 戦術相性
    const tacticCompatibility = this.calculateTacticCompatibility(player.preferred_tactic, rival.signature_tactics);
    score += tacticCompatibility * 50;
    
    // ライバル関係
    const rivalryBonus = player.rivalries.find(r => r.rival_school_id === rival.id)?.strength || 0;
    score += rivalryBonus * 100;
    
    // 地域要因
    if (player.prefecture === rival.prefecture) score += 25; // 県内対決
    if (player.region === rival.region) score += 10;        // 地方内対決
    
    return score;
  }
}
```

### 2. 適応型AI戦術システム

```typescript
class AdaptiveRivalAI {
  // プレイヤーの戦術に学習・適応するAI
  static adaptToPlayerStyle(
    rivalSchool: RivalSchool, 
    playerMatchHistory: MatchRecord[]
  ): TacticalAdjustment {
    
    const playerPatterns = this.analyzePlayerPatterns(playerMatchHistory);
    const counterStrategy = this.generateCounterStrategy(playerPatterns);
    
    return {
      adjusted_tactics: counterStrategy.tactics,
      pokemon_changes: counterStrategy.pokemon_adjustments,
      special_preparations: counterStrategy.special_preparations,
      confidence_level: counterStrategy.confidence
    };
  }
  
  private static analyzePlayerPatterns(history: MatchRecord[]): PlayerPattern {
    // プレイヤーの戦術傾向を分析
    const tacticUsage = history.reduce((acc, match) => {
      acc[match.player_tactic] = (acc[match.player_tactic] || 0) + 1;
      return acc;
    }, {} as Record<TacticType, number>);
    
    const skillEmphasis = this.calculateSkillEmphasis(history);
    const weaknesses = this.identifyWeaknesses(history);
    
    return { tacticUsage, skillEmphasis, weaknesses };
  }
}
```

---

## 📈 バランシング・難易度システム

### 1. 動的難易度調整

```typescript
class DynamicDifficultyAdjustment {
  // プレイヤーの戦績に応じてライバル校の強さを調整
  static adjustRivalStrength(
    playerWinRate: number,
    rivalSchool: RivalSchool
  ): RivalSchool {
    const adjusted = { ...rivalSchool };
    
    // 勝率が高すぎる場合、ライバルを強化
    if (playerWinRate > 0.8) {
      adjusted.average_level += 2;
      adjusted.current_rating += 20;
      adjusted.season_form = Math.min(adjusted.season_form + 0.1, 1.2);
    }
    
    // 勝率が低すぎる場合、ライバルを弱体化
    else if (playerWinRate < 0.3) {
      adjusted.average_level = Math.max(adjusted.average_level - 1, 1);
      adjusted.current_rating -= 10;
      adjusted.season_form = Math.max(adjusted.season_form - 0.05, 0.8);
    }
    
    return adjusted;
  }
  
  // 大会レベル別の適切な相手校レーティング
  static getAppropriateRating(
    competitionLevel: string,
    playerRating: number
  ): { min: number; max: number; average: number } {
    const adjustments = {
      'district': { min: -50, max: +30, avg: -10 },
      'prefectural': { min: -30, max: +50, avg: +10 },
      'regional': { min: +0, max: +80, avg: +30 },
      'national': { min: +30, max: +120, avg: +60 },
      'international': { min: +60, max: +150, avg: +90 }
    };
    
    const adj = adjustments[competitionLevel] || adjustments['district'];
    
    return {
      min: playerRating + adj.min,
      max: playerRating + adj.max,
      average: playerRating + adj.avg
    };
  }
}
```

### 2. 季節・時期による変動

```typescript
interface SeasonalVariation {
  // 季節による学校の調子変動
  getSeasonModifier(school: RivalSchool, currentMonth: number): number {
    let modifier = 1.0;
    
    // 夏季：体力系学校が有利
    if ([6, 7, 8].includes(currentMonth) && school.type === 'power') {
      modifier += 0.1;
    }
    
    // 冬季：技術系学校が有利（屋内練習充実）
    if ([12, 1, 2].includes(currentMonth) && school.type === 'technical') {
      modifier += 0.1;
    }
    
    // 地域の気候要因
    if (school.regional_modifiers.climate_adjustment) {
      modifier += school.regional_modifiers.climate_adjustment[currentMonth] || 0;
    }
    
    return modifier;
  }
}
```

---

## 💾 データベース設計

### 1. ライバル校テーブル

```sql
-- ライバル校マスターテーブル
CREATE TABLE rival_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  region TEXT NOT NULL,
  school_type TEXT NOT NULL,
  school_rank TEXT NOT NULL,
  
  -- 学校特色
  philosophy TEXT,
  specialties TEXT[],
  weaknesses TEXT[],
  signature_tactics TEXT[],
  
  -- 戦力データ
  ace_pokemon TEXT,
  preferred_types TEXT[],
  team_composition JSONB,
  average_level INTEGER DEFAULT 10,
  
  -- 評価・実績
  current_rating INTEGER DEFAULT 500,
  historical_achievements JSONB DEFAULT '[]',
  season_form DECIMAL(3,2) DEFAULT 1.0,
  growth_trajectory TEXT DEFAULT 'stable',
  
  -- 地域特色
  regional_modifiers JSONB,
  local_culture JSONB,
  
  -- 表示・UI
  school_colors TEXT[],
  mascot TEXT,
  motto TEXT,
  founded_year INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ライバル関係テーブル
CREATE TABLE rivalry_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_school_id UUID REFERENCES schools(id),
  rival_school_id UUID REFERENCES rival_schools(id),
  rivalry_type TEXT NOT NULL,
  strength DECIMAL(3,2) DEFAULT 0.0,
  match_history JSONB DEFAULT '[]',
  special_events TEXT[] DEFAULT '{}',
  next_encounter DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 大会参加履歴テーブル
CREATE TABLE competition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID, -- player or rival school
  school_type TEXT, -- 'player' or 'rival'
  competition_name TEXT NOT NULL,
  competition_level TEXT NOT NULL,
  year INTEGER NOT NULL,
  final_rank INTEGER,
  participants_count INTEGER,
  matches_played JSONB,
  rewards_earned JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 地域特性マスターテーブル
CREATE TABLE regional_characteristics (
  prefecture TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  climate_data JSONB NOT NULL,
  culture_data JSONB NOT NULL,
  infrastructure_data JSONB NOT NULL,
  signature_pokemon JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. インデックス・パフォーマンス最適化

```sql
-- 検索・フィルタリング用インデックス
CREATE INDEX idx_rival_schools_prefecture ON rival_schools(prefecture);
CREATE INDEX idx_rival_schools_region ON rival_schools(region);
CREATE INDEX idx_rival_schools_rank ON rival_schools(school_rank);
CREATE INDEX idx_rival_schools_rating ON rival_schools(current_rating);
CREATE INDEX idx_rivalry_relationships_player ON rivalry_relationships(player_school_id);
CREATE INDEX idx_competition_history_school ON competition_history(school_id, school_type);
CREATE INDEX idx_competition_history_level ON competition_history(competition_level, year);
```

---

## 🎮 ユーザー体験設計

### 1. ライバル校発見・情報システム

```typescript
interface SchoolDiscoverySystem {
  // 段階的な情報開示
  getSchoolInformation(school: RivalSchool, playerRelationship: number): SchoolInfo {
    const baseInfo = {
      name: school.name,
      prefecture: school.prefecture,
      rank: school.school_rank
    };
    
    // 関係性に応じて情報を段階的に開示
    if (playerRelationship > 0.2) {
      return {
        ...baseInfo,
        philosophy: school.philosophy,
        specialties: school.specialties,
        ace_pokemon: school.ace_pokemon
      };
    }
    
    if (playerRelationship > 0.5) {
      return {
        ...baseInfo,
        team_composition: school.team_composition,
        current_rating: school.current_rating,
        signature_tactics: school.signature_tactics
      };
    }
    
    if (playerRelationship > 0.8) {
      return school; // 全情報開示
    }
    
    return baseInfo;
  }
}
```

### 2. ライバル校マップ・可視化

```typescript
interface SchoolMapSystem {
  // 日本地図上でのライバル校表示
  displaySchoolsOnMap(schools: RivalSchool[]): MapData {
    return {
      prefectures: JAPAN_PREFECTURES.map(pref => ({
        name: pref,
        schools: schools.filter(s => s.prefecture === pref),
        regional_strength: this.calculateRegionalStrength(pref, schools),
        local_characteristics: REGIONAL_DATA[pref]
      })),
      connections: this.calculateRivalryConnections(schools),
      player_position: this.getPlayerPosition()
    };
  }
}
```

---

## 📋 実装フェーズ計画

### Phase 1: 基盤システム構築 (2-3週間)
1. **データベース設計・実装**
   - ライバル校テーブル群作成
   - 地域特性データ投入
   - 基本的なCRUD操作

2. **地域特性システム**
   - 47都道府県データ定義
   - 地域別修正システム
   - 気候・文化影響システム

### Phase 2: ライバル校生成システム (2週間)
1. **学校生成エンジン**
   - 都道府県別自動生成
   - 特色・戦術決定ロジック
   - バランス調整機能

2. **名門校システム**
   - 特別な強豪校定義
   - 歴史・実績システム
   - 特別イベント・因縁

### Phase 3: 動的システム実装 (2週間)
1. **成長・変化システム**
   - ライバル校の季節変動
   - プレイヤー対応型成長
   - AI学習・適応システム

2. **ライバル関係システム**
   - 因縁・関係性構築
   - 特別イベント生成
   - ストーリー展開

### Phase 4: UI/UX・統合 (1-2週間)
1. **管理・表示インターフェース**
   - ライバル校一覧・詳細
   - 地域マップ表示
   - 競争状況ダッシュボード

2. **大会・マッチメイキング統合**
   - 既存システムとの統合
   - バランス調整・テスト
   - パフォーマンス最適化

---

## 🎯 期待される効果

### ゲーム体験の向上
1. **地域への愛着**: 出身地や好きな都道府県の特色を楽しめる
2. **長期目標設定**: 地区→県→地方→全国の段階的成長
3. **戦略性向上**: 地域特色を活かした戦術選択
4. **リプレイ価値**: 異なる地域での新規プレイ体験

### システムの持続性
1. **動的バランス**: プレイヤーに合わせたAI調整
2. **コンテンツ拡張性**: 新地域・新学校の追加容易性
3. **データ活用**: プレイヤー行動データによる改善
4. **コミュニティ形成**: 地域対抗・交流イベント

このライバル校システムにより、既存の栄冠ナイン風育成システムと組み合わせた、日本全国を舞台にした壮大なテニス部育成体験が実現されます。