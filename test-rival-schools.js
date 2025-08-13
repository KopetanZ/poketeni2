// ライバル校システムのテスト用スクリプト
// Node.js環境で実行してください

// モックデータ（実際のブラウザ環境では不要）
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

// テスト用の地域データ
const REGIONAL_DATA = {
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
  '大阪府': {
    prefecture: '大阪府',
    region: '近畿',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 3
    },
    culture: {
      preferred_pokemon_types: ['fire', 'fighting', 'normal'],
      traditional_tactics: ['aggressive', 'power'],
      training_philosophy: 'power',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 8,
      coaching_level: 8,
      funding_level: 8,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'カイリキー',
      common_choices: ['ヒトカゲ', 'ワニノコ', 'カラカラ'],
      rare_appearances: ['リザードン', 'フーディン']
    }
  }
};

// テスト用の型定義
const SchoolType = {
  traditional: 'traditional',
  emerging: 'emerging',
  technical: 'technical',
  power: 'power',
  balanced: 'balanced',
  specialized: 'specialized',
  academy: 'academy'
};

const SchoolRank = {
  'S++': 'S++',
  'S+': 'S+',
  'S': 'S',
  'A+': 'A+',
  'A': 'A',
  'B+': 'B+',
  'B': 'B'
};

// ライバル校生成クラス（簡略版）
class RivalSchoolGenerator {
  static generateSchoolsForPrefecture(prefecture, schoolCount) {
    const regional = REGIONAL_DATA[prefecture];
    if (!regional) {
      throw new Error(`地域データが見つかりません: ${prefecture}`);
    }
    
    const schools = [];
    
    for (let i = 0; i < schoolCount; i++) {
      const school = this.createSchool(prefecture, regional, i);
      schools.push(school);
    }
    
    return schools;
  }
  
  static generateAllRivalSchools() {
    const allSchools = [];
    
    Object.keys(REGIONAL_DATA).forEach(prefecture => {
      const schoolCount = this.determineSchoolCountForPrefecture(prefecture);
      const schools = this.generateSchoolsForPrefecture(prefecture, schoolCount);
      allSchools.push(...schools);
    });
    
    return allSchools;
  }
  
  static createSchool(prefecture, regional, index) {
    const schoolType = this.determineSchoolType(regional, index);
    const rank = this.determineSchoolRank(prefecture, regional, index);
    const tactics = this.selectSchoolTactics(regional, schoolType);
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
      season_form: 0.8 + Math.random() * 0.4,
      injury_situation: this.generateInjurySituation(),
      regional_modifiers: this.createRegionalModifiers(regional),
      local_culture: this.createCultureModifiers(regional),
      school_colors: this.generateSchoolColors(),
      mascot: this.selectMascot(regional),
      motto: this.generateMotto(schoolType),
      founded_year: 1950 + Math.floor(Math.random() * 70)
    };
  }
  
  static determineSchoolCountForPrefecture(prefecture) {
    const regional = REGIONAL_DATA[prefecture];
    if (!regional) return 3;
    
    const baseCount = 3;
    const populationBonus = regional.infrastructure.population_density === 'high' ? 2 : 
                           regional.infrastructure.population_density === 'medium' ? 1 : 0;
    const infrastructureBonus = Math.floor(regional.infrastructure.facility_quality / 3);
    
    return Math.min(baseCount + populationBonus + infrastructureBonus, 8);
  }
  
  static determineSchoolType(regional, index) {
    const types = Object.values(SchoolType);
    
    if (regional.culture.training_philosophy === 'power') {
      types.unshift('power');
    } else if (regional.culture.training_philosophy === 'technique') {
      types.unshift('technical');
    } else if (regional.culture.training_philosophy === 'mental') {
      types.unshift('traditional');
    }
    
    return types[index % types.length];
  }
  
  static determineSchoolRank(prefecture, regional, index) {
    const ranks = Object.values(SchoolRank);
    
    let rankIndex = Math.floor(regional.infrastructure.facility_quality / 2) + 
                   Math.floor(regional.culture.competitive_spirit / 2) - 3;
    
    rankIndex += Math.floor(index / 2);
    rankIndex = Math.max(0, Math.min(rankIndex, ranks.length - 1));
    
    return ranks[rankIndex];
  }
  
  static selectSchoolTactics(regional, schoolType) {
    const baseTactics = [...regional.culture.traditional_tactics];
    
    switch (schoolType) {
      case 'power':
        baseTactics.push('aggressive', 'power');
        break;
      case 'technical':
        baseTactics.push('technical', 'balanced');
        break;
      case 'traditional':
        baseTactics.push('defensive', 'counter');
        break;
    }
    
    return [...new Set(baseTactics)].slice(0, 3);
  }
  
  static generateTeamComposition(regional, schoolType, rank) {
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
  
  static generateSchoolName(prefecture, type, index) {
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
  
  static generatePhilosophy(schoolType, regional) {
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
  
  static determineSpecialties(schoolType, regional) {
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
  
  static determineWeaknesses(schoolType) {
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
  
  static selectAcePokemon(regional, rank) {
    const pokemonPool = [...regional.signature_pokemon.common_choices];
    
    if (rank === 'S' || rank === 'S+' || rank === 'S++') {
      pokemonPool.push(...regional.signature_pokemon.rare_appearances);
    }
    
    if (rank === 'S++') {
      pokemonPool.push(regional.signature_pokemon.legendary_ace);
    }
    
    return pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  }
  
  static calculateAverageLevel(rank) {
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
    return baseLevel + Math.floor(Math.random() * 5) - 2;
  }
  
  static calculateInitialRating(rank, regional) {
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
  
  static determineGrowthTrajectory() {
    const rand = Math.random();
    if (rand < 0.3) return 'ascending';
    if (rand < 0.7) return 'stable';
    return 'declining';
  }
  
  static generateInjurySituation() {
    const injuredCount = Math.floor(Math.random() * 3);
    const recoveryWeeks = injuredCount > 0 ? Math.floor(Math.random() * 4) + 1 : 0;
    
    return {
      injured_players: injuredCount,
      recovery_weeks: recoveryWeeks,
      impact_level: injuredCount === 0 ? 'low' : injuredCount === 1 ? 'medium' : 'high'
    };
  }
  
  static createRegionalModifiers(regional) {
    return {
      climate_adjustment: this.generateClimateAdjustment(regional),
      facility_bonus: regional.infrastructure.facility_quality - 5,
      coaching_bonus: regional.infrastructure.coaching_level - 5,
      funding_bonus: regional.infrastructure.funding_level - 5
    };
  }
  
  static createCultureModifiers(regional) {
    return {
      training_efficiency: regional.culture.competitive_spirit - 5,
      team_morale: regional.infrastructure.coaching_level - 5,
      competitive_spirit: regional.culture.competitive_spirit - 5,
      regional_pride: regional.infrastructure.facility_quality - 5
    };
  }
  
  static generateSchoolColors() {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2 = colors[Math.floor(Math.random() * colors.length)];
    
    while (color2 === color1) {
      color2 = colors[Math.floor(Math.random() * colors.length)];
    }
    
    return [color1, color2];
  }
  
  static selectMascot(regional) {
    const mascots = ['鷹', '獅子', '竜', '鳳凰', '虎', '狼', '熊', '鶴'];
    return mascots[Math.floor(Math.random() * mascots.length)];
  }
  
  static generateMotto(schoolType) {
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
  
  static getRegionalSpecialties(regional) {
    const specialties = [];
    if (regional.culture.competitive_spirit >= 8) specialties.push('競争心');
    if (regional.infrastructure.facility_quality >= 8) specialties.push('設備活用');
    if (regional.infrastructure.coaching_level >= 8) specialties.push('指導力');
    return specialties;
  }
  
  static generateClimateAdjustment(regional) {
    const adjustments = {};
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
  
  static getBaseMemberCount(rank) {
    const baseCounts = { 'B': 12, 'B+': 15, 'A': 18, 'A+': 20, 'S': 22, 'S+': 25, 'S++': 28 };
    return baseCounts[rank] || 15;
  }
  
  static getTypeMultiplier(schoolType) {
    const multipliers = {
      'traditional': 1.0, 'emerging': 0.9, 'technical': 0.95,
      'power': 1.1, 'balanced': 1.0, 'specialized': 0.9, 'academy': 0.95
    };
    return multipliers[schoolType] || 1.0;
  }
  
  static calculateAverageExperience(rank) {
    const baseExperience = { 'B': 2, 'B+': 3, 'A': 4, 'A+': 5, 'S': 6, 'S+': 7, 'S++': 8 };
    return baseExperience[rank] || 3;
  }
}

// テスト実行
console.log('🏫 ライバル校システム テスト開始\n');

try {
  // 1. 都道府県別学校生成テスト
  console.log('1. 都道府県別学校生成テスト');
  const tokyoSchools = RivalSchoolGenerator.generateSchoolsForPrefecture('東京都', 3);
  console.log(`東京都: ${tokyoSchools.length}校生成`);
  console.log('サンプル校:', tokyoSchools[0].name, tokyoSchools[0].rank, tokyoSchools[0].type);
  
  const osakaSchools = RivalSchoolGenerator.generateSchoolsForPrefecture('大阪府', 2);
  console.log(`大阪府: ${osakaSchools.length}校生成`);
  console.log('サンプル校:', osakaSchools[0].name, osakaSchools[0].rank, osakaSchools[0].type);
  
  // 2. 全ライバル校生成テスト
  console.log('\n2. 全ライバル校生成テスト');
  const allSchools = RivalSchoolGenerator.generateAllRivalSchools();
  console.log(`総ライバル校数: ${allSchools.length}校`);
  
  // 3. 統計情報
  console.log('\n3. 統計情報');
  const rankDistribution = {};
  const typeDistribution = {};
  const regionDistribution = {};
  
  allSchools.forEach(school => {
    rankDistribution[school.rank] = (rankDistribution[school.rank] || 0) + 1;
    typeDistribution[school.type] = (typeDistribution[school.type] || 0) + 1;
    regionDistribution[school.region] = (regionDistribution[school.region] || 0) + 1;
  });
  
  console.log('ランク分布:', rankDistribution);
  console.log('タイプ分布:', typeDistribution);
  console.log('地方分布:', regionDistribution);
  
  // 4. サンプル校の詳細表示
  console.log('\n4. サンプル校詳細');
  const sampleSchool = allSchools[0];
  console.log('学校名:', sampleSchool.name);
  console.log('都道府県:', sampleSchool.prefecture);
  console.log('ランク:', sampleSchool.rank);
  console.log('タイプ:', sampleSchool.type);
  console.log('校風:', sampleSchool.philosophy);
  console.log('得意分野:', sampleSchool.specialty.join(', '));
  console.log('苦手分野:', sampleSchool.weaknesses.join(', '));
  console.log('戦術:', sampleSchool.signature_tactics.join(', '));
  console.log('エースポケモン:', sampleSchool.ace_pokemon);
  console.log('レーティング:', sampleSchool.current_rating);
  console.log('平均レベル:', sampleSchool.average_level);
  console.log('部員数:', sampleSchool.team_composition.total_members);
  console.log('成長軌道:', sampleSchool.growth_trajectory);
  console.log('シーズン調子:', Math.round(sampleSchool.season_form * 100) + '%');
  
  console.log('\n✅ ライバル校システム テスト完了');
  
} catch (error) {
  console.error('❌ テストエラー:', error);
}
