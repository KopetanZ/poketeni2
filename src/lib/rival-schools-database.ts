import { supabase } from './supabase';
import { REGIONAL_DATA } from './regional-characteristics';
import { RivalSchoolGenerator } from './rival-school-generator';
import type { RivalSchool, RegionalCharacteristics } from '../types/rival-schools';

/**
 * ライバル校システムのデータベース操作ライブラリ
 * データ移行、CRUD操作、クエリ機能を提供
 */

export class RivalSchoolsDatabase {
  /**
   * 地域特性データをデータベースに移行
   */
  static async migrateRegionalData(): Promise<void> {
    try {
      console.log('地域特性データの移行を開始...');
      
      for (const [prefecture, data] of Object.entries(REGIONAL_DATA)) {
        const { error } = await supabase
          .from('regional_characteristics')
          .upsert({
            prefecture,
            region: data.region,
            climate_data: data.climate,
            culture_data: data.culture,
            infrastructure_data: data.infrastructure,
            signature_pokemon: data.signature_pokemon
          }, {
            onConflict: 'prefecture'
          });
        
        if (error) {
          console.error(`地域特性データの移行エラー (${prefecture}):`, error);
          throw error;
        }
        
        console.log(`地域特性データ移行完了: ${prefecture}`);
      }
      
      console.log('地域特性データの移行が完了しました');
    } catch (error) {
      console.error('地域特性データの移行に失敗しました:', error);
      throw error;
    }
  }

  /**
   * ライバル校を一括生成してデータベースに保存
   */
  static async generateAndSaveAllSchools(): Promise<void> {
    try {
      console.log('ライバル校の一括生成を開始...');
      
      const allSchools = RivalSchoolGenerator.generateAllRivalSchools();
      
      console.log(`${allSchools.length}校のライバル校を生成しました`);
      
      // バッチ処理でデータベースに保存
      const batchSize = 50;
      for (let i = 0; i < allSchools.length; i += batchSize) {
        const batch = allSchools.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('rival_schools')
          .insert(batch.map(school => this.convertSchoolToDatabaseFormat(school)));
        
        if (error) {
          console.error(`バッチ${Math.floor(i / batchSize) + 1}の保存エラー:`, error);
          throw error;
        }
        
        console.log(`バッチ${Math.floor(i / batchSize) + 1}の保存完了: ${batch.length}校`);
      }
      
      console.log('ライバル校の一括保存が完了しました');
    } catch (error) {
      console.error('ライバル校の一括保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 既存のライバル校データを読み込み
   */
  static async loadExistingSchools(): Promise<RivalSchool[]> {
    try {
      const { data, error } = await supabase
        .from('rival_schools')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) {
        console.error('ライバル校データの読み込みエラー:', error);
        throw error;
      }
      
      return data.map(this.convertDatabaseToSchoolFormat);
    } catch (error) {
      console.error('ライバル校データの読み込みに失敗しました:', error);
      throw error;
    }
  }

  /**
   * 地域別のライバル校を取得
   */
  static async getSchoolsByRegion(region: string): Promise<RivalSchool[]> {
    try {
      const { data, error } = await supabase
        .from('rival_schools')
        .select('*')
        .eq('region', region)
        .order('rating', { ascending: false });
      
      if (error) {
        console.error(`地域別ライバル校取得エラー (${region}):`, error);
        throw error;
      }
      
      return data.map(this.convertDatabaseToSchoolFormat);
    } catch (error) {
      console.error(`地域別ライバル校取得に失敗しました (${region}):`, error);
      throw error;
    }
  }

  /**
   * 都道府県別のライバル校を取得
   */
  static async getSchoolsByPrefecture(prefecture: string): Promise<RivalSchool[]> {
    try {
      const { data, error } = await supabase
        .from('rival_schools')
        .select('*')
        .eq('prefecture', prefecture)
        .order('rating', { ascending: false });
      
      if (error) {
        console.error(`都道府県別ライバル校取得エラー (${prefecture}):`, error);
        throw error;
      }
      
      return data.map(this.convertDatabaseToSchoolFormat);
    } catch (error) {
      console.error(`都道府県別ライバル校取得に失敗しました (${prefecture}):`, error);
      throw error;
    }
  }

  /**
   * ランク別のライバル校を取得
   */
  static async getSchoolsByRank(rank: string): Promise<RivalSchool[]> {
    try {
      const { data, error } = await supabase
        .from('rival_schools')
        .select('*')
        .eq('school_rank', rank)
        .order('rating', { ascending: false });
      
      if (error) {
        console.error(`ランク別ライバル校取得エラー (${rank}):`, error);
        throw error;
      }
      
      return data.map(this.convertDatabaseToSchoolFormat);
    } catch (error) {
      console.error(`ランク別ライバル校取得に失敗しました (${rank}):`, error);
      throw error;
    }
  }

  /**
   * 地域特性データを取得
   */
  static async getRegionalCharacteristics(prefecture: string): Promise<RegionalCharacteristics | null> {
    try {
      const { data, error } = await supabase
        .from('regional_characteristics')
        .select('*')
        .eq('prefecture', prefecture)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // データが見つからない場合
          return null;
        }
        console.error(`地域特性取得エラー (${prefecture}):`, error);
        throw error;
      }
      
      return this.convertDatabaseToRegionalCharacteristics(data);
    } catch (error) {
      console.error(`地域特性取得に失敗しました (${prefecture}):`, error);
      throw error;
    }
  }

  /**
   * ライバル校の更新
   */
  static async updateSchool(schoolId: string, updates: Partial<RivalSchool>): Promise<void> {
    try {
      const { error } = await supabase
        .from('rival_schools')
        .update(this.convertSchoolToDatabaseFormat(updates as RivalSchool))
        .eq('id', schoolId);
      
      if (error) {
        console.error('ライバル校更新エラー:', error);
        throw error;
      }
      
      console.log(`ライバル校の更新が完了しました: ${schoolId}`);
    } catch (error) {
      console.error('ライバル校の更新に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 成長履歴の記録
   */
  static async recordGrowthHistory(
    schoolId: string,
    previousRating: number,
    newRating: number,
    growthFactors: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('school_growth_history')
        .insert({
          school_id: schoolId,
          date: new Date().toISOString().split('T')[0],
          previous_rating: previousRating,
          new_rating: newRating,
          rating_change: newRating - previousRating,
          growth_factors: growthFactors
        });
      
      if (error) {
        console.error('成長履歴記録エラー:', error);
        throw error;
      }
      
      console.log(`成長履歴の記録が完了しました: ${schoolId}`);
    } catch (error) {
      console.error('成長履歴の記録に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 対戦記録の保存
   */
  static async saveMatchRecord(
    schoolId1: string,
    schoolId2: string,
    winnerId: string | null,
    score: Record<string, any>,
    matchType: string,
    tacticsUsed: Record<string, any>,
    playerPerformance: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('match_records')
        .insert({
          school_id_1: schoolId1,
          school_id_2: schoolId2,
          winner_id: winnerId,
          score,
          match_date: new Date().toISOString().split('T')[0],
          match_type: matchType,
          tactics_used: tacticsUsed,
          player_performance: playerPerformance
        });
      
      if (error) {
        console.error('対戦記録保存エラー:', error);
        throw error;
      }
      
      console.log('対戦記録の保存が完了しました');
    } catch (error) {
      console.error('対戦記録の保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * データベース形式からRivalSchool形式への変換
   */
  private static convertDatabaseToSchoolFormat(dbData: any): RivalSchool {
    return {
      id: dbData.id,
      name: dbData.name,
      prefecture: dbData.prefecture,
      region: dbData.region,
      type: dbData.school_type,
      rank: dbData.school_rank,
      current_rating: dbData.rating,
      average_level: dbData.level,
      philosophy: dbData.philosophy,
      specialty: dbData.specialties || [],
      weaknesses: dbData.weaknesses || [],
      signature_tactics: dbData.tactics_profile || [],
      team_composition: dbData.team_composition || {},
      ace_pokemon: dbData.ace_pokemon || '',
      growth_trajectory: dbData.growth_trajectory || 'stable',
      injury_situation: dbData.injury_situation || {},
      regional_modifiers: dbData.regional_modifiers || {},
      local_culture: dbData.culture_modifiers || {},
      preferred_types: dbData.preferred_types || [],
      historical_achievements: dbData.historical_achievements || [],
      rivalry_relationships: dbData.rivalry_relationships || [],
      season_form: dbData.season_form || 1.0,
      school_colors: dbData.school_colors || ['#3B82F6', '#1E40AF'],
      mascot: dbData.mascot || 'テニスボール',
      motto: dbData.motto || '努力と成長',
      founded_year: dbData.founded_year || 1950
    };
  }

  /**
   * RivalSchool形式からデータベース形式への変換
   */
  private static convertSchoolToDatabaseFormat(school: RivalSchool): any {
    return {
      name: school.name,
      prefecture: school.prefecture,
      region: school.region,
      school_type: school.type,
      school_rank: school.rank,
      rating: school.current_rating,
      level: school.average_level,
      philosophy: school.philosophy,
      specialties: school.specialty,
      weaknesses: school.weaknesses,
      tactics_profile: school.signature_tactics,
      team_composition: school.team_composition,
      ace_pokemon: school.ace_pokemon,
      growth_trajectory: school.growth_trajectory,
      injury_situation: school.injury_situation,
      regional_modifiers: school.regional_modifiers,
      culture_modifiers: school.local_culture
    };
  }

  /**
   * データベース形式からRegionalCharacteristics形式への変換
   */
  private static convertDatabaseToRegionalCharacteristics(dbData: any): RegionalCharacteristics {
    return {
      prefecture: dbData.prefecture,
      region: dbData.region,
      climate: dbData.climate_data,
      culture: dbData.culture_data,
      infrastructure: dbData.infrastructure_data,
      signature_pokemon: dbData.signature_pokemon
    };
  }

  /**
   * データベースの初期化とデータ移行を実行
   */
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('ライバル校システムデータベースの初期化を開始...');
      
      // 1. 地域特性データの移行
      await this.migrateRegionalData();
      
      // 2. ライバル校の一括生成と保存
      await this.generateAndSaveAllSchools();
      
      console.log('ライバル校システムデータベースの初期化が完了しました');
    } catch (error) {
      console.error('ライバル校システムデータベースの初期化に失敗しました:', error);
      throw error;
    }
  }

  /**
   * データベースの状態を確認
   */
  static async checkDatabaseStatus(): Promise<{
    regionalCharacteristicsCount: number;
    rivalSchoolsCount: number;
    growthHistoryCount: number;
    matchRecordsCount: number;
  }> {
    try {
      const [
        { count: regionalCount },
        { count: schoolsCount },
        { count: growthCount },
        { count: matchCount }
      ] = await Promise.all([
        supabase.from('regional_characteristics').select('*', { count: 'exact', head: true }),
        supabase.from('rival_schools').select('*', { count: 'exact', head: true }),
        supabase.from('school_growth_history').select('*', { count: 'exact', head: true }),
        supabase.from('match_records').select('*', { count: 'exact', head: true })
      ]);
      
      return {
        regionalCharacteristicsCount: regionalCount || 0,
        rivalSchoolsCount: schoolsCount || 0,
        growthHistoryCount: growthCount || 0,
        matchRecordsCount: matchCount || 0
      };
    } catch (error) {
      console.error('データベース状態の確認に失敗しました:', error);
      throw error;
    }
  }
}
