// スカウトシステム（新ポケモン発見・獲得機能）

import { ScoutingLocation, ScoutingResult, DiscoveredPokemon, RecruitmentAttempt, ActiveScouting, ScoutingReport } from '@/types/scouting';
import { PokemonAPI } from './pokemon-api';
import { PlayerGenerator } from './player-generator';
import { DateManager } from './date-manager';

export class ScoutingSystem {
  // スカウト可能な場所の定義
  private static readonly SCOUTING_LOCATIONS: ScoutingLocation[] = [
    {
      id: 'local_park',
      name: '近所の公園',
      description: '気軽にテニスを楽しんでいるポケモンがいるかも',
      icon: '🏞️',
      rarity_weights: {
        common: 0.6,
        uncommon: 0.3,
        rare: 0.1,
        epic: 0.0,
        legendary: 0.0
      },
      cost: 1000,
      time_required: 1,
      max_encounters: 3,
      level_range: { min: 1, max: 10 }
    },
    {
      id: 'tennis_club',
      name: '他校のテニス部',
      description: '転校を考えているポケモンがいるかもしれません',
      icon: '🎾',
      rarity_weights: {
        common: 0.4,
        uncommon: 0.4,
        rare: 0.15,
        epic: 0.05,
        legendary: 0.0
      },
      cost: 3000,
      time_required: 3,
      max_encounters: 2,
      level_range: { min: 5, max: 20 }
    },
    {
      id: 'sports_academy',
      name: 'スポーツアカデミー',
      description: '才能豊かなポケモンが練習しています',
      icon: '🏫',
      rarity_weights: {
        common: 0.2,
        uncommon: 0.4,
        rare: 0.3,
        epic: 0.09,
        legendary: 0.01
      },
      cost: 8000,
      time_required: 5,
      max_encounters: 4,
      level_range: { min: 10, max: 30 }
    },
    {
      id: 'professional_courts',
      name: 'プロテニスコート',
      description: '一流のポケモン選手を目指すポケモンがいます',
      icon: '🏆',
      rarity_weights: {
        common: 0.1,
        uncommon: 0.2,
        rare: 0.4,
        epic: 0.25,
        legendary: 0.05
      },
      cost: 15000,
      time_required: 7,
      max_encounters: 2,
      level_range: { min: 20, max: 50 },
      special_pokemon: ['ピカチュウ', 'イーブイ', 'リザードン', 'ミュウツー']
    },
    {
      id: 'mountain_retreat',
      name: '山間の隠れ里',
      description: '伝説的な実力を持つポケモンの噂が...',
      icon: '⛰️',
      rarity_weights: {
        common: 0.05,
        uncommon: 0.15,
        rare: 0.3,
        epic: 0.4,
        legendary: 0.1
      },
      cost: 25000,
      time_required: 10,
      max_encounters: 1,
      level_range: { min: 30, max: 60 },
      special_pokemon: ['カイリュー', 'ハクリュー', 'ミニリュウ', 'カビゴン']
    }
  ];

  // スカウト実行
  static async executeScouting(
    location: ScoutingLocation, 
    scoutQuality: 'basic' | 'advanced' | 'expert' = 'basic'
  ): Promise<ScoutingResult> {
    const baseCost = location.cost;
    const qualityMultiplier = scoutQuality === 'expert' ? 2.0 : scoutQuality === 'advanced' ? 1.5 : 1.0;
    const actualCost = Math.floor(baseCost * qualityMultiplier);

    try {
      const discoveredPokemon: DiscoveredPokemon[] = [];
      const encounterCount = Math.min(
        Math.floor(Math.random() * location.max_encounters) + 1,
        location.max_encounters
      );

      for (let i = 0; i < encounterCount; i++) {
        const pokemon = await this.generateScoutedPokemon(location, scoutQuality);
        if (pokemon) {
          discoveredPokemon.push(pokemon);
        }
      }

      const successMessage = discoveredPokemon.length > 0
        ? `${location.name}で${discoveredPokemon.length}匹のポケモンを発見しました！`
        : `${location.name}を探索しましたが、ポケモンは見つかりませんでした...`;

      return {
        success: discoveredPokemon.length > 0,
        pokemon_found: discoveredPokemon,
        message: successMessage,
        cost_spent: actualCost,
        time_spent: location.time_required
      };
    } catch (error) {
      console.error('Scouting failed:', error);
      return {
        success: false,
        message: 'スカウト中にエラーが発生しました',
        cost_spent: actualCost,
        time_spent: location.time_required
      };
    }
  }

  // スカウトされたポケモン生成
  private static async generateScoutedPokemon(
    location: ScoutingLocation,
    scoutQuality: 'basic' | 'advanced' | 'expert'
  ): Promise<DiscoveredPokemon | null> {
    // レア度抽選
    const rarity = this.selectRarity(location.rarity_weights, scoutQuality);
    
    // ポケモン選択（特別ポケモンも考慮）
    let pokemonName: string;
    if (location.special_pokemon && Math.random() < 0.3) {
      // 30%の確率で特別ポケモン
      pokemonName = location.special_pokemon[
        Math.floor(Math.random() * location.special_pokemon.length)
      ];
    } else {
      // 通常のレア度ベース選択
      pokemonName = await this.selectPokemonByRarity(rarity);
    }

    if (!pokemonName) return null;

    try {
      const pokemonDetail = await PokemonAPI.getPokemonDetails(pokemonName);
      
      // レベル決定
      const level = Math.floor(
        Math.random() * (location.level_range.max - location.level_range.min + 1)
      ) + location.level_range.min;

      // ステータス生成（レベルとレア度に応じて）
      const stats = this.generateScoutedStats(level, rarity, scoutQuality);

      // 特殊能力生成（確率的）
      const specialAbilities = this.generateScoutedSpecialAbilities(level, rarity);

      // 勧誘関連パラメータ
      const recruitmentCost = this.calculateRecruitmentCost(level, rarity, stats);
      const recruitmentDifficulty = this.calculateRecruitmentDifficulty(rarity, stats);

      return {
        pokemon_name: pokemonName,
        pokemon_id: pokemonDetail.id,
        level,
        rarity,
        stats,
        special_abilities: specialAbilities,
        recruitment_cost: recruitmentCost,
        recruitment_difficulty: recruitmentDifficulty,
        discovered_at: location.name
      };
    } catch (error) {
      console.error(`Failed to generate scouted pokemon ${pokemonName}:`, error);
      return null;
    }
  }

  // レア度選択（スカウト品質による補正）
  private static selectRarity(
    weights: ScoutingLocation['rarity_weights'],
    scoutQuality: 'basic' | 'advanced' | 'expert'
  ): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    let adjustedWeights = { ...weights };
    
    // スカウト品質による補正
    if (scoutQuality === 'advanced') {
      adjustedWeights.rare *= 1.5;
      adjustedWeights.epic *= 1.2;
      adjustedWeights.common *= 0.8;
    } else if (scoutQuality === 'expert') {
      adjustedWeights.rare *= 2.0;
      adjustedWeights.epic *= 1.8;
      adjustedWeights.legendary *= 3.0;
      adjustedWeights.common *= 0.5;
      adjustedWeights.uncommon *= 0.7;
    }

    const total = Object.values(adjustedWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * total;

    for (const [rarity, weight] of Object.entries(adjustedWeights)) {
      random -= weight;
      if (random <= 0) {
        return rarity as any;
      }
    }

    return 'common';
  }

  // レア度に基づくポケモン選択
  private static async selectPokemonByRarity(rarity: string): Promise<string | null> {
    const allPokemon = PokemonAPI.getAllPokemons();
    // TODO: ここでレア度フィルタリングを実装（PokemonAPIから取得）
    // 現在は簡単なランダム選択
    if (allPokemon.length === 0) return null;
    return allPokemon[Math.floor(Math.random() * allPokemon.length)];
  }

  // スカウトされたポケモンのステータス生成
  private static generateScoutedStats(
    level: number,
    rarity: string,
    scoutQuality: 'basic' | 'advanced' | 'expert'
  ) {
    const rarityMultiplier = {
      common: 0.8,
      uncommon: 1.0,
      rare: 1.3,
      epic: 1.6,
      legendary: 2.0
    }[rarity] || 1.0;

    const qualityBonus = {
      basic: 0,
      advanced: 5,
      expert: 12
    }[scoutQuality];

    const baseValue = 20 + level * 2;

    return {
      serve_skill: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 10 + qualityBonus)),
      return_skill: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 10 + qualityBonus)),
      volley_skill: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 10 + qualityBonus)),
      stroke_skill: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 10 + qualityBonus)),
      mental: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 10 + qualityBonus)),
      stamina: Math.min(100, Math.floor(baseValue * rarityMultiplier + Math.random() * 15 + qualityBonus))
    };
  }

  // 特殊能力生成（スカウト用）
  private static generateScoutedSpecialAbilities(level: number, rarity: string) {
    const abilityChance = {
      common: 0.1,
      uncommon: 0.25,
      rare: 0.4,
      epic: 0.7,
      legendary: 0.95
    }[rarity] || 0.1;

    if (Math.random() < abilityChance) {
      return PlayerGenerator.generateSpecialAbilities(level, 'member');
    }
    return [];
  }

  // 勧誘費用計算
  private static calculateRecruitmentCost(level: number, rarity: string, stats: any): number {
    const rarityMultiplier = {
      common: 1.0,
      uncommon: 2.0,
      rare: 4.0,
      epic: 8.0,
      legendary: 15.0
    }[rarity] || 1.0;

    const averageStats = Object.values(stats).reduce((sum: number, stat: any) => sum + stat, 0) / 6;
    const baseCost = 5000 + level * 500 + averageStats * 100;

    return Math.floor(baseCost * rarityMultiplier);
  }

  // 勧誘成功確率計算
  private static calculateRecruitmentDifficulty(rarity: string, stats: any): number {
    const rarityPenalty = {
      common: 0.8,
      uncommon: 0.65,
      rare: 0.45,
      epic: 0.25,
      legendary: 0.1
    }[rarity] || 0.8;

    const averageStats = Object.values(stats).reduce((sum: number, stat: any) => sum + stat, 0) / 6;
    const statsPenalty = Math.max(0.1, 1 - (averageStats - 40) * 0.01);

    return Math.max(0.05, rarityPenalty * statsPenalty);
  }

  // ポケモン勧誘実行
  static async attemptRecruitment(
    discoveredPokemon: DiscoveredPokemon,
    schoolReputation: number = 50
  ): Promise<RecruitmentAttempt> {
    const reputationBonus = Math.max(0, (schoolReputation - 50) * 0.002); // レピュテーション効果
    const finalSuccessRate = Math.min(0.95, discoveredPokemon.recruitment_difficulty + reputationBonus);
    
    const isSuccess = Math.random() < finalSuccessRate;

    if (isSuccess) {
      try {
        // 新しいプレイヤーを作成
        const pokemonDetail = await PokemonAPI.getPokemonDetails(discoveredPokemon.pokemon_name);
        const newPlayer = PlayerGenerator.createPlayerFromPokemonDetail(pokemonDetail, 'member');
        
        // スカウト結果のステータスを適用
        newPlayer.level = discoveredPokemon.level;
        newPlayer.serve_skill = discoveredPokemon.stats.serve_skill;
        newPlayer.return_skill = discoveredPokemon.stats.return_skill;
        newPlayer.volley_skill = discoveredPokemon.stats.volley_skill;
        newPlayer.stroke_skill = discoveredPokemon.stats.stroke_skill;
        newPlayer.mental = discoveredPokemon.stats.mental;
        newPlayer.stamina = discoveredPokemon.stats.stamina;
        
        // 特殊能力を適用
        if (discoveredPokemon.special_abilities) {
          newPlayer.special_abilities = discoveredPokemon.special_abilities;
        }

        return {
          pokemon: discoveredPokemon,
          success: true,
          cost_spent: discoveredPokemon.recruitment_cost,
          message: `${discoveredPokemon.pokemon_name}の勧誘に成功しました！部活に入部してくれます！`,
          new_player: newPlayer
        };
      } catch (error) {
        console.error('Failed to create recruited player:', error);
        return {
          pokemon: discoveredPokemon,
          success: false,
          cost_spent: discoveredPokemon.recruitment_cost,
          message: '勧誘処理中にエラーが発生しました'
        };
      }
    } else {
      return {
        pokemon: discoveredPokemon,
        success: false,
        cost_spent: Math.floor(discoveredPokemon.recruitment_cost * 0.3), // 失敗時は30%の費用
        message: `${discoveredPokemon.pokemon_name}は勧誘を断りました...他の学校に興味があるようです。`
      };
    }
  }

  // 利用可能なスカウト場所取得
  static getAvailableLocations(): ScoutingLocation[] {
    return [...this.SCOUTING_LOCATIONS];
  }

  // 場所をIDで取得
  static getLocationById(locationId: string): ScoutingLocation | null {
    return this.SCOUTING_LOCATIONS.find(loc => loc.id === locationId) || null;
  }

  // スカウト報告書生成
  static generateScoutingReport(
    location: ScoutingLocation,
    result: ScoutingResult
  ): ScoutingReport {
    const notes: string[] = [];
    
    if (result.pokemon_found && result.pokemon_found.length > 0) {
      notes.push(`${result.pokemon_found.length}匹のポケモンを発見`);
      
      const rareCounts = result.pokemon_found.reduce((acc, pokemon) => {
        acc[pokemon.rarity] = (acc[pokemon.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(rareCounts).forEach(([rarity, count]) => {
        notes.push(`${rarity}: ${count}匹`);
      });
    } else {
      notes.push('ポケモンは発見されませんでした');
    }

    return {
      location: location.name,
      date: DateManager.getCurrentDateString(),
      pokemon_sighted: result.pokemon_found?.length || 0,
      pokemon_contacted: result.pokemon_found?.length || 0,
      successful_approaches: result.pokemon_found?.filter(p => p.recruitment_difficulty > 0.3).length || 0,
      rare_encounters: result.pokemon_found?.filter(p => ['rare', 'epic', 'legendary'].includes(p.rarity)).length || 0,
      notes
    };
  }
}