import { 
  RivalSchool, 
  SchoolType, 
  SchoolRank, 
  TacticType, 
  RegionalCharacteristics,
  TeamComposition,
  RegionalModifier,
  CultureModifier,
  InjurySituation,
  GrowthTrajectory
} from '../types/rival-schools';
import { REGIONAL_DATA } from './regional-characteristics';

export class RivalSchoolGenerator {
  // 都道府県別学校生成
  static generateSchoolsForPrefecture(prefecture: string, schoolCount: number): RivalSchool[] {
    const regional = REGIONAL_DATA[prefecture];
    if (!regional) {
      throw new Error(`地域データが見つかりません: ${prefecture}`);
    }
    
    const schools: RivalSchool[] = [];
    
    for (let i = 0; i < schoolCount; i++) {
      const school = this.createSchool(prefecture, regional, i);
      schools.push(school);
    }
    
    return schools;
  }
  
  // 全国のライバル校を一括生成
  static generateAllRivalSchools(): RivalSchool[] {
    const allSchools: RivalSchool[] = [];
    
    Object.keys(REGIONAL_DATA).forEach(prefecture => {
      const schoolCount = this.determineSchoolCountForPrefecture(prefecture);
      const schools = this.generateSchoolsForPrefecture(prefecture, schoolCount);
      allSchools.push(...schools);
    });
    
    return allSchools;
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
  
  // 都道府県別の学校数を決定
  private static determineSchoolCountForPrefecture(prefecture: string): number {
    const regional = REGIONAL_DATA[prefecture];
    if (!regional) return 3;
    
    // 人口密度とインフラレベルに基づいて学校数を決定
    const baseCount = 3;
    const populationBonus = regional.infrastructure.population_density === 'high' ? 2 : 
                           regional.infrastructure.population_density === 'medium' ? 1 : 0;
    const infrastructureBonus = Math.floor(regional.infrastructure.facility_quality / 3);
    
    return Math.min(baseCount + populationBonus + infrastructureBonus, 8);
  }
  
  // 学校タイプ決定
  private static determineSchoolType(regional: RegionalCharacteristics, index: number): SchoolType {
    const types: SchoolType[] = ['traditional', 'emerging', 'technical', 'power', 'balanced', 'specialized', 'academy'];
    
    // 地域の文化に基づいてタイプを調整
    if (regional.culture.training_philosophy === 'power') {
      types.unshift('power');
    } else if (regional.culture.training_philosophy === 'technique') {
      types.unshift('technical');
    } else if (regional.culture.training_philosophy === 'mental') {
      types.unshift('traditional');
    }
    
    // インデックスに基づいてタイプを選択
    return types[index % types.length];
  }
  
  // 学校ランク決定
  private static determineSchoolRank(prefecture: string, regional: RegionalCharacteristics, index: number): SchoolRank {
    const ranks: SchoolRank[] = ['B', 'B+', 'A', 'A+', 'S', 'S+', 'S++'];
    
    // インフラレベルと競争精神に基づいてランクを調整
    let rankIndex = Math.floor(regional.infrastructure.facility_quality / 2) + 
                   Math.floor(regional.culture.competitive_spirit / 2) - 3;
    
    // インデックスによる微調整
    rankIndex += Math.floor(index / 2);
    
    // 範囲内に収める
    rankIndex = Math.max(0, Math.min(rankIndex, ranks.length - 1));
    
    return ranks[rankIndex];
  }
  
  // 戦術選択
  private static selectSchoolTactics(regional: RegionalCharacteristics, schoolType: SchoolType): TacticType[] {
    const baseTactics = [...regional.culture.traditional_tactics];
    
    // 学校タイプに基づいて戦術を追加
    switch (schoolType) {
      case 'aggressive':
        baseTactics.push('aggressive', 'power');
        break;
      case 'technical':
        baseTactics.push('technical', 'balanced');
        break;
      case 'power':
        baseTactics.push('power', 'aggressive');
        break;
      case 'defensive':
        baseTactics.push('defensive', 'counter');
        break;
      case 'balanced':
        baseTactics.push('balanced', 'technical');
        break;
    }
    
    // 重複を除去して最大3つまで
    return [...new Set(baseTactics)].slice(0, 3);
  }
  
  // チーム編成生成
  private static generateTeamComposition(regional: RegionalCharacteristics, schoolType: SchoolType, rank: SchoolRank): TeamComposition {
    const baseMembers = this.getBaseMemberCount(rank);
    const typeMultiplier = this.getTypeMultiplier(schoolType);
    
    const totalMembers = Math.floor(baseMembers * typeMultiplier);
    const singlesPlayers = Math.floor(totalMembers * 0.6);
    const doublesTeams = Math.floor((totalMembers - singlesPlayers) / 2);
    const reservePlayers = Math.max(2, Math.floor(totalMembers * 0.1));
    
    return {
      total_members: totalMembers,
      singles_players: singlesPlayers,
      doubles_teams: doublesTeams,
      mixed_doubles: Math.floor(doublesTeams * 0.3),
      reserve_players: reservePlayers,
      average_experience: this.calculateAverageExperience(rank)
    };
  }
  
  // 学校名生成（地域特色を反映）
  private static generateSchoolName(prefecture: string, type: SchoolType, index: number): string {
    const prefectureShort = prefecture.replace(/[都道府県]/g, '');
    
    const typeNames = {
      traditional: ['第一', '中央', '県立', '公立'],
      emerging: ['新星', '未来', '希望', '進取'],
      technical: ['工業', '技術', '科学', '理工'],
      power: ['体育', 'スポーツ', '競技', '武道'],
      balanced: ['総合', '学園', '高等', '普通'],
      specialized: ['特進', '実験', '研究', '専門'],
      academy: ['アカデミー', '学院', '学舎', '塾']
    };
    
    const suffixes = ['高校', '高等学校', '学園', '学院'];
    const typeName = typeNames[type][index % typeNames[type].length];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefectureShort}${typeName}${suffix}`;
  }
  
  // 校風・理念生成
  private static generatePhilosophy(schoolType: SchoolType, regional: RegionalCharacteristics): string {
    const philosophies = {
      traditional: [
        '伝統を重んじ、精神力を鍛える',
        '歴史ある校風を継承し、品格を磨く',
        '伝統的な価値観を大切にした教育'
      ],
      emerging: [
        '新しいことに挑戦し、未来を切り開く',
        '革新的なアプローチで成長を目指す',
        '変化を恐れず、進歩を追求する'
      ],
      technical: [
        '技術の習得と理論的な思考を重視',
        '科学的アプローチでテニスを学ぶ',
        '戦術と技術の両立を目指す'
      ],
      power: [
        '体力と精神力の両方を鍛える',
        '強靭な意志と身体能力を養う',
        'パワーとスピードを武器にする'
      ],
      balanced: [
        'バランスの取れた総合力を目指す',
        '様々な能力を均等に伸ばす',
        'オールラウンドな選手を育てる'
      ],
      specialized: [
        '独自の戦略と特技を磨く',
        '個性を活かした専門性を追求',
        'ユニークなプレースタイルを確立'
      ],
      academy: [
        '個人の才能を最大限に引き出す',
        '個別指導による確実な成長',
        '一人ひとりの可能性を開花させる'
      ]
    };
    
    const schoolPhilosophies = philosophies[schoolType];
    return schoolPhilosophies[Math.floor(Math.random() * schoolPhilosophies.length)];
  }
  
  // 得意分野決定
  private static determineSpecialties(schoolType: SchoolType, regional: RegionalCharacteristics): string[] {
    const specialties = {
      traditional: ['精神力', '持久力', '戦略性'],
      emerging: ['スピード', '柔軟性', '適応力'],
      technical: ['技術力', '戦術理解', '分析力'],
      power: ['パワー', 'スピード', '攻撃力'],
      balanced: ['総合力', 'バランス', '安定性'],
      specialized: ['特技', '個性', '独創性'],
      academy: ['個人指導', '成長支援', '才能開発']
    };
    
    const baseSpecialties = specialties[schoolType];
    const regionalSpecialties = this.getRegionalSpecialties(regional);
    
    return [...baseSpecialties, ...regionalSpecialties].slice(0, 4);
  }
  
  // 苦手分野決定
  private static determineWeaknesses(schoolType: SchoolType): string[] {
    const weaknesses = {
      traditional: ['柔軟性', 'スピード'],
      emerging: ['経験', '安定性'],
      technical: ['パワー', '持久力'],
      power: ['技術', '戦術'],
      balanced: ['特化', '突出'],
      specialized: ['バランス', '安定性'],
      academy: ['チームワーク', '競争心']
    };
    
    return weaknesses[schoolType] || ['経験不足'];
  }
  
  // エースポケモン選択
  private static selectAcePokemon(regional: RegionalCharacteristics, rank: SchoolRank): string {
    const pokemonPool = [...regional.signature_pokemon.common_choices];
    
    // 高ランク校はレアポケモンも選択可能
    if (rank === 'S' || rank === 'S+' || rank === 'S++') {
      pokemonPool.push(...regional.signature_pokemon.rare_appearances);
    }
    
    // 伝説級はS++校のみ
    if (rank === 'S++') {
      pokemonPool.push(regional.signature_pokemon.legendary_ace);
    }
    
    return pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  }
  
  // 平均レベル計算
  private static calculateAverageLevel(rank: SchoolRank): number {
    const baseLevels = {
      'B': 8,
      'B+': 12,
      'A': 16,
      'A+': 20,
      'S': 25,
      'S+': 30,
      'S++': 35
    };
    
    const baseLevel = baseLevels[rank];
    return baseLevel + Math.floor(Math.random() * 5) - 2; // ±2の変動
  }
  
  // 初期レーティング計算
  private static calculateInitialRating(rank: SchoolRank, regional: RegionalCharacteristics): number {
    const baseRatings = {
      'B': 300,
      'B+': 400,
      'A': 500,
      'A+': 600,
      'S': 700,
      'S+': 800,
      'S++': 900
    };
    
    const baseRating = baseRatings[rank];
    const regionalBonus = regional.infrastructure.facility_quality * 10;
    
    return baseRating + regionalBonus + Math.floor(Math.random() * 50);
  }
  
  // 成長軌道決定
  private static determineGrowthTrajectory(): GrowthTrajectory {
    const rand = Math.random();
    if (rand < 0.3) return 'ascending';
    if (rand < 0.7) return 'stable';
    return 'declining';
  }
  
  // 怪我状況生成
  private static generateInjurySituation(): InjurySituation {
    const injuredCount = Math.floor(Math.random() * 3);
    const recoveryWeeks = injuredCount > 0 ? Math.floor(Math.random() * 4) + 1 : 0;
    
    return {
      injured_players: injuredCount,
      recovery_weeks: recoveryWeeks,
      impact_level: injuredCount === 0 ? 'low' : injuredCount === 1 ? 'medium' : 'high'
    };
  }
  
  // 地域修正値作成
  private static createRegionalModifiers(regional: RegionalCharacteristics): RegionalModifier {
    return {
      climate_adjustment: this.generateClimateAdjustment(regional),
      facility_bonus: regional.infrastructure.facility_quality - 5,
      coaching_bonus: regional.infrastructure.coaching_level - 5,
      funding_bonus: regional.infrastructure.funding_level - 5
    };
  }
  
  // 文化修正値作成
  private static createCultureModifiers(regional: RegionalCharacteristics): CultureModifier {
    return {
      training_efficiency: regional.culture.competitive_spirit - 5,
      team_morale: regional.infrastructure.coaching_level - 5,
      competitive_spirit: regional.culture.competitive_spirit - 5,
      regional_pride: regional.infrastructure.facility_quality - 5
    };
  }
  
  // 学校カラー生成
  private static generateSchoolColors(): [string, string] {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2 = colors[Math.floor(Math.random() * colors.length)];
    
    // 同じ色にならないように調整
    while (color2 === color1) {
      color2 = colors[Math.floor(Math.random() * colors.length)];
    }
    
    return [color1, color2];
  }
  
  // マスコット選択
  private static selectMascot(regional: RegionalCharacteristics): string {
    const mascots = ['鷹', '獅子', '竜', '鳳凰', '虎', '狼', '熊', '鶴'];
    return mascots[Math.floor(Math.random() * mascots.length)];
  }
  
  // 校訓生成
  private static generateMotto(schoolType: SchoolType): string {
    const mottos = {
      traditional: '文武両道',
      emerging: '未来への挑戦',
      technical: '技術の追求',
      power: '不屈の精神',
      balanced: '調和と成長',
      specialized: '個性の開花',
      academy: '才能の育成'
    };
    
    return mottos[schoolType] || '努力と成長';
  }
  
  // ヘルパーメソッド
  private static getBaseMemberCount(rank: SchoolRank): number {
    const baseCounts = { 'B': 12, 'B+': 15, 'A': 18, 'A+': 20, 'S': 22, 'S+': 25, 'S++': 28 };
    return baseCounts[rank] || 15;
  }
  
  private static getTypeMultiplier(schoolType: SchoolType): number {
    const multipliers = {
      traditional: 1.0, emerging: 0.9, technical: 0.95,
      power: 1.1, balanced: 1.0, specialized: 0.9, academy: 0.95
    };
    return multipliers[schoolType] || 1.0;
  }
  
  private static calculateAverageExperience(rank: SchoolRank): number {
    const baseExperience = { 'B': 2, 'B+': 3, 'A': 4, 'A+': 5, 'S': 6, 'S+': 7, 'S++': 8 };
    return baseExperience[rank] || 3;
  }
  
  private static getRegionalSpecialties(regional: RegionalCharacteristics): string[] {
    const specialties = [];
    if (regional.culture.competitive_spirit >= 8) specialties.push('競争心');
    if (regional.infrastructure.facility_quality >= 8) specialties.push('設備活用');
    if (regional.infrastructure.coaching_level >= 8) specialties.push('指導力');
    return specialties;
  }
  
  private static generateClimateAdjustment(regional: RegionalCharacteristics): Record<number, number> {
    const adjustments: Record<number, number> = {};
    for (let month = 1; month <= 12; month++) {
      if (month >= 12 || month <= 2) {
        adjustments[month] = regional.climate.temperature_modifier / 10;
      } else if (month >= 6 && month <= 8) {
        adjustments[month] = -regional.climate.temperature_modifier / 10;
      } else {
        adjustments[month] = 0;
      }
    }
    return adjustments;
  }
}
