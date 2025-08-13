// 栄冠ナイン風世代交代システム - 中毒性の核心要素

import { Player, NewStudentCandidate, GraduatedPlayer, SchoolHistory, GameDate, PersonalityType, CareerPath } from '@/types/game';
import { CharacterGenerationSystem } from './character-generation-system';
import { SpecialAbility, EnhancedSpecialAbility } from '@/types/special-abilities';
import { getAbilitiesByRank, getAbilitiesByColor, calculateAcquisitionProbability } from './enhanced-special-abilities-database';

export class GenerationSystem {
  // 卒業判定と進路決定
  static processGraduation(players: Player[], currentDate: GameDate, schoolReputation: number): {
    graduatedPlayers: GraduatedPlayer[];
    remainingPlayers: Player[];
  } {
    const graduationDate = { year: currentDate.year, month: 3, day: 15 };
    
    // 3年生を抽出
    const thirdYearStudents = players.filter(player => player.grade === 3);
    const remainingPlayers = players.filter(player => player.grade !== 3);
    
    const graduatedPlayers: GraduatedPlayer[] = thirdYearStudents.map(player => {
      const careerPath = this.determineCareerPath(player, schoolReputation);
      const achievements = this.generateAchievements(player);
      
      return {
        player: {
          ...player,
          isGraduated: true,
          careerPath
        },
        graduationDate,
        finalStats: {
          serve_skill: player.serve_skill,
          return_skill: player.return_skill,
          volley_skill: player.volley_skill,
          stroke_skill: player.stroke_skill,
          mental: player.mental,
          stamina: player.stamina
        },
        achievements,
        careerPath,
        schoolReputation
      };
    });
    
    // 残った選手の学年を進級
    const promotedPlayers = remainingPlayers.map(player => ({
      ...player,
      grade: (player.grade + 1) as 1 | 2 | 3
    }));
    
    return {
      graduatedPlayers,
      remainingPlayers: promotedPlayers
    };
  }
  
  // 進路決定ロジック（栄冠ナイン準拠）
  private static determineCareerPath(player: Player, schoolReputation: number): CareerPath {
    const assessment = CharacterGenerationSystem.assessPlayer(player);
    
    // プロテニス選手（S+ランクのみ、10%の確率）
    if (assessment.rank === 'S+') {
      if (Math.random() < 0.10) {
        return 'professional';
      }
    }
    
    // 大学推薦
    if (assessment.rank === 'A+' || assessment.rank === 'A') {
      const baseChance = assessment.rank === 'A+' ? 0.70 : 0.40;
      const reputationBonus = Math.min(schoolReputation / 100 * 0.2, 0.3);
      
      if (Math.random() < baseChance + reputationBonus) {
        return 'university';
      }
    }
    
    if ((assessment.rank === 'B+' || assessment.rank === 'B') && schoolReputation >= 70) {
      if (Math.random() < 0.25) {
        return 'university';
      }
    }
    
    // その他は就職・引退
    return Math.random() < 0.8 ? 'employment' : 'retired';
  }
  
  // 卒業生の実績生成
  private static generateAchievements(player: Player): string[] {
    const achievements: string[] = [];
    const assessment = CharacterGenerationSystem.assessPlayer(player);
    
    // 部長経験
    if (player.position === 'captain') {
      achievements.push('テニス部部長');
    }
    
    // ランク別実績
    if (assessment.rank === 'S+' || assessment.rank === 'S') {
      achievements.push('エース級選手');
    }
    
    if (assessment.star_rating >= 4) {
      achievements.push('実力者');
    }
    
    // 試合成績
    if (player.matches_won && player.matches_played) {
      const winRate = player.matches_won / player.matches_played;
      if (winRate >= 0.8) {
        achievements.push('勝利の立役者');
      }
    }
    
    // 特殊能力関連
    if (player.special_abilities && player.special_abilities.length > 0) {
      const goldAbilities = player.special_abilities.filter(ability => 
        ['lightning_serve', 'perfect_return', 'miracle_volley', 'flame_shot', 'ice_control'].includes(ability.id)
      );
      
      if (goldAbilities.length > 0) {
        achievements.push('特殊技術の使い手');
      }
    }
    
    // 覚醒経験
    if (player.awakening?.hasAwakened) {
      achievements.push('大器晩成型');
    }
    
    return achievements;
  }
  
  // 新入生候補プール生成
  static generateScoutingPool(schoolReputation: number, currentYear: number): NewStudentCandidate[] {
    const poolSize = this.calculatePoolSize(schoolReputation);
    const candidates: NewStudentCandidate[] = [];
    
    for (let i = 0; i < poolSize; i++) {
      candidates.push(this.generateNewStudentCandidate(schoolReputation, currentYear, i));
    }
    
    return candidates;
  }
  
  // スカウト対象プール数計算
  private static calculatePoolSize(schoolReputation: number): number {
    if (schoolReputation >= 90) return 7; // 名門校
    if (schoolReputation >= 70) return 6; // 強豪校
    if (schoolReputation >= 50) return 5; // 中堅校
    if (schoolReputation >= 30) return 4; // そこそこ校
    return 3; // 弱小校
  }
  
  // 新入生候補生成
  private static generateNewStudentCandidate(
    schoolReputation: number, 
    currentYear: number, 
    index: number
  ): NewStudentCandidate {
    // 才能分布（栄冠ナイン準拠）
    const random = Math.random();
    let potential: 'genius' | 'talented' | 'normal' | 'underdog';
    
    if (random < 0.02) {
      potential = 'genius'; // 2%
    } else if (random < 0.10) {
      potential = 'talented'; // 8%
    } else if (random < 0.80) {
      potential = 'normal'; // 70%
    } else {
      potential = 'underdog'; // 20%
    }
    
    // 学校評判による才能補正
    if (schoolReputation >= 80 && Math.random() < 0.1) {
      potential = 'genius';
    }
    
    // ポケモン選択（ランダム）
    const pokemonId = Math.floor(Math.random() * 1010) + 1;
    const pokemonName = `新入生${index + 1}号`; // 実際のポケモン名はAPIから取得
    
    // 性格ランダム選択
    const personalities: PersonalityType[] = ['aggressive', 'technical', 'stamina', 'genius', 'hardworker', 'cheerful', 'shy', 'leader'];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    
    // 基礎能力値生成（才能に応じて）
    const baseStats = this.generateBaseStatsByPotential(potential);
    
    // 特殊能力生成
    const specialAbilities = this.generateInitialSpecialAbilities(potential, personality);
    
    // スカウト競争設定
    const competitorCount = Math.max(1, Math.floor(Math.random() * 4));
    const competitorSchools: string[] = [];
    for (let j = 0; j < competitorCount; j++) {
      competitorSchools.push(`ライバル校${j + 1}`);
    }
    
    // 獲得確率（評判と競争によって変動）
    const baseChance = 0.75;
    const reputationBonus = Math.min(schoolReputation / 100 * 0.2, 0.25);
    const competitionPenalty = competitorCount * 0.05;
    const acquisitionChance = Math.max(0.60, Math.min(0.95, baseChance + reputationBonus - competitionPenalty));
    
    return {
      id: `candidate_${currentYear}_${index}`,
      pokemon_name: pokemonName,
      pokemon_id: pokemonId,
      potential,
      personality,
      baseStats,
      specialAbilities,
      scoutingCost: 500, // 固定費用
      competitorSchools,
      acquisitionChance
    };
  }
  
  // 才能別基礎能力値生成
  private static generateBaseStatsByPotential(potential: 'genius' | 'talented' | 'normal' | 'underdog'): {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  } {
    let baseRange: [number, number];
    
    switch (potential) {
      case 'genius':
        baseRange = [60, 80];
        break;
      case 'talented':
        baseRange = [50, 70];
        break;
      case 'normal':
        baseRange = [30, 50];
        break;
      case 'underdog':
        baseRange = [20, 40];
        break;
    }
    
    return {
      serve_skill: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0],
      return_skill: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0],
      volley_skill: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0],
      stroke_skill: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0],
      mental: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0],
      stamina: Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0]
    };
  }
  
  // 初期特殊能力生成
  private static generateInitialSpecialAbilities(
    potential: 'genius' | 'talented' | 'normal' | 'underdog',
    personality: PersonalityType
  ): EnhancedSpecialAbility[] {
    const abilities: EnhancedSpecialAbility[] = [];
    
    // 才能による初期特殊能力確率
    let abilityChance: number;
    let maxAbilities: number;
    
    switch (potential) {
      case 'genius':
        abilityChance = 0.9;
        maxAbilities = 3;
        break;
      case 'talented':
        abilityChance = 0.6;
        maxAbilities = 2;
        break;
      case 'normal':
        abilityChance = 0.3;
        maxAbilities = 1;
        break;
      case 'underdog':
        abilityChance = 0.15;
        maxAbilities = 1;
        break;
    }
    
    // 天才肌の性格はさらに確率アップ
    if (personality === 'genius') {
      abilityChance += 0.1;
      maxAbilities += 1;
    }
    
    if (Math.random() < abilityChance) {
      // 新しく拡充した特殊能力から選択
      const numAbilities = Math.min(
        Math.floor(Math.random() * maxAbilities) + 1,
        maxAbilities
      );
      
      // ランク別の特殊能力を取得
      const availableAbilities = this.getAvailableAbilitiesForPotential(potential);
      
      // 重複を避けて特殊能力を選択
      const selectedAbilities = this.selectRandomAbilities(availableAbilities, numAbilities);
      
      abilities.push(...selectedAbilities);
    }
    
    return abilities;
  }
  
  // 才能レベルに応じて利用可能な特殊能力を取得
  private static getAvailableAbilitiesForPotential(potential: 'genius' | 'talented' | 'normal' | 'underdog'): EnhancedSpecialAbility[] {
    const availableAbilities: EnhancedSpecialAbility[] = [];
    
    switch (potential) {
      case 'genius':
        // 天才はSS+からBランクまで
        availableAbilities.push(...getAbilitiesByRank('SS+'));
        availableAbilities.push(...getAbilitiesByRank('SS'));
        availableAbilities.push(...getAbilitiesByRank('S+'));
        availableAbilities.push(...getAbilitiesByRank('S'));
        availableAbilities.push(...getAbilitiesByRank('A+'));
        availableAbilities.push(...getAbilitiesByRank('A'));
        availableAbilities.push(...getAbilitiesByRank('B+'));
        availableAbilities.push(...getAbilitiesByRank('B'));
        break;
        
      case 'talented':
        // 才能ある子はS+からCランクまで
        availableAbilities.push(...getAbilitiesByRank('S+'));
        availableAbilities.push(...getAbilitiesByRank('S'));
        availableAbilities.push(...getAbilitiesByRank('A+'));
        availableAbilities.push(...getAbilitiesByRank('A'));
        availableAbilities.push(...getAbilitiesByRank('B+'));
        availableAbilities.push(...getAbilitiesByRank('B'));
        availableAbilities.push(...getAbilitiesByRank('C'));
        break;
        
      case 'normal':
        // 普通の子はAからDランクまで
        availableAbilities.push(...getAbilitiesByRank('A'));
        availableAbilities.push(...getAbilitiesByRank('B+'));
        availableAbilities.push(...getAbilitiesByRank('B'));
        availableAbilities.push(...getAbilitiesByRank('C'));
        availableAbilities.push(...getAbilitiesByRank('D'));
        break;
        
      case 'underdog':
        // 下剋上はBからDランクまで
        availableAbilities.push(...getAbilitiesByRank('B'));
        availableAbilities.push(...getAbilitiesByRank('C'));
        availableAbilities.push(...getAbilitiesByRank('D'));
        break;
    }
    
    return availableAbilities;
  }
  
  // 重複を避けてランダムに特殊能力を選択
  private static selectRandomAbilities(availableAbilities: EnhancedSpecialAbility[], numAbilities: number): EnhancedSpecialAbility[] {
    const selected: EnhancedSpecialAbility[] = [];
    const shuffled = [...availableAbilities].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numAbilities, shuffled.length); i++) {
      selected.push(shuffled[i]);
    }
    
    return selected;
  }
  
  // スカウト実行
  static attemptScouting(
    candidate: NewStudentCandidate,
    schoolFunds: number
  ): { success: boolean; newPlayer?: Player; cost: number } {
    if (schoolFunds < candidate.scoutingCost) {
      return { success: false, cost: 0 };
    }
    
    const success = Math.random() < candidate.acquisitionChance;
    
    if (success) {
      const newPlayer = this.convertCandidateToPlayer(candidate);
      return { success: true, newPlayer, cost: candidate.scoutingCost };
    }
    
    return { success: false, cost: candidate.scoutingCost };
  }
  
  // 候補から正式な選手へ変換
  private static convertCandidateToPlayer(candidate: NewStudentCandidate): Player {
    const currentYear = new Date().getFullYear(); // 実際のゲーム年度に置き換え
    
    // 初期能力値の平均を計算（覚醒判定用）
    const stats = candidate.baseStats;
    const average = (stats.serve_skill + stats.return_skill + stats.volley_skill + 
                     stats.stroke_skill + stats.mental + stats.stamina) / 6;
    
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: candidate.pokemon_name,
      pokemon_id: candidate.pokemon_id,
      level: 1,
      grade: 1,
      position: 'member',
      
      serve_skill: stats.serve_skill,
      return_skill: stats.return_skill,
      volley_skill: stats.volley_skill,
      stroke_skill: stats.stroke_skill,
      mental: stats.mental,
      stamina: stats.stamina,
      
      condition: 'normal',
      motivation: 80 + Math.floor(Math.random() * 20), // 80-100
      experience: 0,
      
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,
      
      types: ['normal'], // デフォルト
      special_abilities: candidate.specialAbilities,
      
      // 世代交代システム用データ
      enrollmentYear: currentYear,
      personality: candidate.personality,
      initialStats: {
        ...stats,
        average
      },
      
      // ステータスゲージシステム初期化
      stat_gages: {
        serve_skill_gage: 0,
        return_skill_gage: 0,
        volley_skill_gage: 0,
        stroke_skill_gage: 0,
        mental_gage: 0,
        stamina_gage: 0
      },
      
      // 成長効率係数初期化
      growth_efficiency: {
        serve_skill_efficiency: 1.0,
        return_skill_efficiency: 1.0,
        volley_skill_efficiency: 1.0,
        stroke_skill_efficiency: 1.0,
        mental_efficiency: 1.0,
        stamina_efficiency: 1.0
      },
      
      // 覚醒システム初期化
      awakening: {
        isEligible: average <= 40, // 平均40以下なら覚醒対象
        hasAwakened: false,
        awakeningChance: 0,
        matchesPlayed: 0
      },
      
      graduationYear: currentYear + 3,
      isGraduated: false
    };
  }
  
  // 覚醒チェックと実行
  static checkAndProcessAwakening(
    player: Player, 
    schoolReputation: number
  ): { hasAwakened: boolean; player: Player } {
    if (!player.awakening?.isEligible || 
        player.awakening?.hasAwakened ||
        player.awakening?.matchesPlayed < 50 ||
        schoolReputation < 70) {
      return { hasAwakened: false, player };
    }
    
    // 覚醒確率計算
    let awakeningChance = 0;
    switch (player.grade) {
      case 3:
        awakeningChance = 0.20; // 3年生20%
        break;
      case 2:
        awakeningChance = 0.10; // 2年生10%
        break;
      case 1:
        awakeningChance = 0.05; // 1年生5%
        break;
    }
    
    // 努力家性格はボーナス
    if (player.personality === 'hardworker') {
      awakeningChance += 0.05;
    }
    
    if (Math.random() < awakeningChance) {
      // 覚醒実行！
      const awakening = this.executeAwakening(player);
      return { hasAwakened: true, player: awakening };
    }
    
    return { hasAwakened: false, player };
  }
  
  // 覚醒実行
  private static executeAwakening(player: Player): Player {
    // 能力値の劇的上昇（+20-40ランダム）
    const bonusRange = [20, 40];
    const bonus = Math.floor(Math.random() * (bonusRange[1] - bonusRange[0] + 1)) + bonusRange[0];
    
    return {
      ...player,
      serve_skill: Math.min(100, player.serve_skill + bonus),
      return_skill: Math.min(100, player.return_skill + bonus),
      volley_skill: Math.min(100, player.volley_skill + bonus),
      stroke_skill: Math.min(100, player.stroke_skill + bonus),
      mental: Math.min(100, player.mental + bonus),
      stamina: Math.min(100, player.stamina + bonus),
      
      motivation: Math.min(100, player.motivation + 20), // やる気も上昇
      
      awakening: {
        ...player.awakening!,
        hasAwakened: true,
        awakeningChance: 1.0 // 覚醒済み
      }
    };
  }
  
  // 学校歴史記録更新
  static updateSchoolHistory(
    history: SchoolHistory[],
    year: number,
    reputation: number,
    graduatedPlayers: GraduatedPlayer[]
  ): SchoolHistory[] {
    const existingRecord = history.find(record => record.year === year);
    
    if (existingRecord) {
      return history.map(record => 
        record.year === year
          ? { ...record, finalReputation: reputation, graduatedPlayers }
          : record
      );
    } else {
      return [...history, {
        year,
        finalReputation: reputation,
        tournamentResults: [], // 実際の大会結果で更新
        graduatedPlayers,
        specialAchievements: [] // 特別な功績があれば追加
      }];
    }
  }
}