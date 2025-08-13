import { RivalSchool, SchoolRank, TacticType, RegionalCharacteristics } from '../types/rival-schools';
import { RivalSchoolGenerator } from './rival-school-generator';
import { REGIONAL_DATA } from './regional-characteristics';

export class RivalSchoolManager {
  private rivalSchools: RivalSchool[] = [];
  private initialized = false;

  // 初期化
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 既存データがあれば読み込み、なければ新規生成
      const existingSchools = await this.loadExistingSchools();
      if (existingSchools.length > 0) {
        this.rivalSchools = existingSchools;
      } else {
        this.rivalSchools = RivalSchoolGenerator.generateAllRivalSchools();
        await this.saveSchools();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('ライバル校システムの初期化に失敗:', error);
      // フォールバック: 新規生成
      this.rivalSchools = RivalSchoolGenerator.generateAllRivalSchools();
      this.initialized = true;
    }
  }

  // 全ライバル校取得
  getAllSchools(): RivalSchool[] {
    return [...this.rivalSchools];
  }

  // 都道府県別ライバル校取得
  getSchoolsByPrefecture(prefecture: string): RivalSchool[] {
    return this.rivalSchools.filter(school => school.prefecture === prefecture);
  }

  // 地方別ライバル校取得
  getSchoolsByRegion(region: string): RivalSchool[] {
    return this.rivalSchools.filter(school => school.region === region);
  }

  // ランク別ライバル校取得
  getSchoolsByRank(rank: SchoolRank): RivalSchool[] {
    return this.rivalSchools.filter(school => school.rank === rank);
  }

  // 戦術別ライバル校取得
  getSchoolsByTactic(tactic: TacticType): RivalSchool[] {
    return this.rivalSchools.filter(school => 
      school.signature_tactics.includes(tactic)
    );
  }

  // 特定のライバル校取得
  getSchoolById(id: string): RivalSchool | undefined {
    return this.rivalSchools.find(school => school.id === id);
  }

  // レーティング範囲でのライバル校検索
  getSchoolsByRatingRange(minRating: number, maxRating: number): RivalSchool[] {
    return this.rivalSchools.filter(school => 
      school.current_rating >= minRating && school.current_rating <= maxRating
    );
  }

  // 地域特色を考慮したライバル校検索
  getSchoolsByRegionalCharacteristics(criteria: Partial<RegionalCharacteristics>): RivalSchool[] {
    return this.rivalSchools.filter(school => {
      const regional = REGIONAL_DATA[school.prefecture];
      if (!regional) return false;

      // 気候条件
      if (criteria.climate?.primary_weather && 
          criteria.climate.primary_weather !== regional.climate.primary_weather) {
        return false;
      }

      // 文化条件
      if (criteria.culture?.training_philosophy && 
          criteria.culture.training_philosophy !== regional.culture.training_philosophy) {
        return false;
      }

      // インフラ条件
      if (criteria.infrastructure?.population_density && 
          criteria.infrastructure.population_density !== regional.infrastructure.population_density) {
        return false;
      }

      return true;
    });
  }

  // ライバル校の動的更新
  updateSchoolStatus(schoolId: string, updates: Partial<RivalSchool>): boolean {
    const schoolIndex = this.rivalSchools.findIndex(school => school.id === schoolId);
    if (schoolIndex === -1) return false;

    this.rivalSchools[schoolIndex] = { ...this.rivalSchools[schoolIndex], ...updates };
    return true;
  }

  // 複数校の一括更新
  updateMultipleSchools(updates: Array<{ id: string; updates: Partial<RivalSchool> }>): number {
    let updatedCount = 0;
    
    updates.forEach(({ id, updates: schoolUpdates }) => {
      if (this.updateSchoolStatus(id, schoolUpdates)) {
        updatedCount++;
      }
    });

    return updatedCount;
  }

  // ライバル校の成長・変化処理
  processSchoolGrowth(schoolId: string, playerPerformance: any): boolean {
    const school = this.getSchoolById(schoolId);
    if (!school) return false;

    const updatedSchool = { ...school };

    // プレイヤーの成績に応じてライバル校も成長
    if (playerPerformance.recent_wins > 0.7) {
      updatedSchool.current_rating = Math.min(updatedSchool.current_rating + 5, 1000);
      updatedSchool.average_level = Math.min(updatedSchool.average_level + 1, 50);
    }

    // シーズン調子の変動
    updatedSchool.season_form = this.updateSeasonForm(updatedSchool.season_form);

    // 成長軌道の変化
    updatedSchool.growth_trajectory = this.updateGrowthTrajectory(updatedSchool);

    // 怪我状況の更新
    updatedSchool.injury_situation = this.updateInjurySituation(updatedSchool.injury_situation);

    return this.updateSchoolStatus(schoolId, updatedSchool);
  }

  // シーズン調子の更新
  private updateSeasonForm(currentForm: number): number {
    const variation = (Math.random() - 0.5) * 0.2; // ±0.1の変動
    return Math.max(0.6, Math.min(1.4, currentForm + variation));
  }

  // 成長軌道の更新
  private updateGrowthTrajectory(school: RivalSchool): 'ascending' | 'stable' | 'declining' {
    const rand = Math.random();
    
    if (school.growth_trajectory === 'ascending') {
      if (rand < 0.7) return 'ascending';
      if (rand < 0.9) return 'stable';
      return 'declining';
    } else if (school.growth_trajectory === 'stable') {
      if (rand < 0.6) return 'stable';
      if (rand < 0.8) return 'ascending';
      return 'declining';
    } else {
      if (rand < 0.6) return 'declining';
      if (rand < 0.8) return 'stable';
      return 'ascending';
    }
  }

  // 怪我状況の更新
  private updateInjurySituation(injury: any): any {
    const updated = { ...injury };

    // 怪我の回復処理
    if (updated.injured_players > 0 && updated.recovery_weeks > 0) {
      updated.recovery_weeks--;
      if (updated.recovery_weeks === 0) {
        updated.injured_players = Math.max(0, updated.injured_players - 1);
        updated.impact_level = updated.injured_players === 0 ? 'low' : 
                               updated.injured_players === 1 ? 'medium' : 'high';
      }
    }

    // 新たな怪我の発生（低確率）
    if (Math.random() < 0.05 && updated.injured_players < 3) {
      updated.injured_players++;
      updated.recovery_weeks = Math.max(updated.recovery_weeks, Math.floor(Math.random() * 4) + 1);
      updated.impact_level = updated.injured_players === 1 ? 'medium' : 'high';
    }

    return updated;
  }

  // 地域別統計情報取得
  getRegionalStatistics(): Record<string, any> {
    const stats: Record<string, any> = {};

    Object.keys(REGIONAL_DATA).forEach(prefecture => {
      const schools = this.getSchoolsByPrefecture(prefecture);
      
      stats[prefecture] = {
        total_schools: schools.length,
        average_rating: schools.length > 0 ? 
          schools.reduce((sum, school) => sum + school.current_rating, 0) / schools.length : 0,
        rank_distribution: this.getRankDistribution(schools),
        type_distribution: this.getTypeDistribution(schools),
        total_members: schools.reduce((sum, school) => sum + school.team_composition.total_members, 0)
      };
    });

    return stats;
  }

  // ランク分布取得
  private getRankDistribution(schools: RivalSchool[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    schools.forEach(school => {
      distribution[school.rank] = (distribution[school.rank] || 0) + 1;
    });
    return distribution;
  }

  // タイプ分布取得
  private getTypeDistribution(schools: RivalSchool[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    schools.forEach(school => {
      distribution[school.type] = (distribution[school.type] || 0) + 1;
    });
    return distribution;
  }

  // 検索・フィルタリング
  searchSchools(query: string): RivalSchool[] {
    const lowerQuery = query.toLowerCase();
    
    return this.rivalSchools.filter(school => 
      school.name.toLowerCase().includes(lowerQuery) ||
      school.prefecture.toLowerCase().includes(lowerQuery) ||
      school.philosophy.toLowerCase().includes(lowerQuery) ||
      school.specialty.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }

  // 高度なフィルタリング
  filterSchools(filters: {
    prefecture?: string;
    region?: string;
    rank?: SchoolRank[];
    type?: string[];
    minRating?: number;
    maxRating?: number;
    tactics?: TacticType[];
  }): RivalSchool[] {
    return this.rivalSchools.filter(school => {
      if (filters.prefecture && school.prefecture !== filters.prefecture) return false;
      if (filters.region && school.region !== filters.region) return false;
      if (filters.rank && !filters.rank.includes(school.rank)) return false;
      if (filters.type && !filters.type.includes(school.type)) return false;
      if (filters.minRating && school.current_rating < filters.minRating) return false;
      if (filters.maxRating && school.current_rating > filters.maxRating) return false;
      if (filters.tactics && !filters.tactics.some(t => school.signature_tactics.includes(t))) return false;
      
      return true;
    });
  }

  // データの永続化
  private async saveSchools(): Promise<void> {
    try {
      // ローカルストレージまたはデータベースに保存
      localStorage.setItem('rival_schools', JSON.stringify(this.rivalSchools));
    } catch (error) {
      console.error('ライバル校データの保存に失敗:', error);
    }
  }

  // 既存データの読み込み
  private async loadExistingSchools(): Promise<RivalSchool[]> {
    try {
      const saved = localStorage.getItem('rival_schools');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('ライバル校データの読み込みに失敗:', error);
      return [];
    }
  }

  // データのリセット
  async resetData(): Promise<void> {
    this.rivalSchools = RivalSchoolGenerator.generateAllRivalSchools();
    await this.saveSchools();
  }

  // 特定地域の学校を再生成
  async regenerateSchoolsForPrefecture(prefecture: string): Promise<void> {
    const schoolCount = this.determineSchoolCountForPrefecture(prefecture);
    const newSchools = RivalSchoolGenerator.generateSchoolsForPrefecture(prefecture, schoolCount);
    
    // 既存の学校を削除
    this.rivalSchools = this.rivalSchools.filter(school => school.prefecture !== prefecture);
    
    // 新しい学校を追加
    this.rivalSchools.push(...newSchools);
    
    await this.saveSchools();
  }

  // 都道府県別の学校数を決定
  private determineSchoolCountForPrefecture(prefecture: string): number {
    const regional = REGIONAL_DATA[prefecture];
    if (!regional) return 3;
    
    const baseCount = 3;
    const populationBonus = regional.infrastructure.population_density === 'high' ? 2 : 
                           regional.infrastructure.population_density === 'medium' ? 1 : 0;
    const infrastructureBonus = Math.floor(regional.infrastructure.facility_quality / 3);
    
    return Math.min(baseCount + populationBonus + infrastructureBonus, 8);
  }
}
