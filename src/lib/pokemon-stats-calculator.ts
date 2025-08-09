// ポケモンステータス計算システム

import { 
  PokemonStats, 
  IndividualValues, 
  EffortValues, 
  PokemonNature, 
  NatureModifier, 
  PokemonBaseStats,
  IVRankJudgment,
  GrowthResult
} from '@/types/pokemon-stats';
import { getPokemonSpeciesData, canEvolve, getEvolutionInfo } from './pokemon-species-data';
import { getRandomAbility, calculateAbilityBonus } from './pokemon-abilities-data';

// 性格による能力補正データ
const NATURE_MODIFIERS: Record<PokemonNature, NatureModifier> = {
  // 攻撃系
  'いじっぱり': { increased: 'attack', decreased: 'sp_attack' },
  'やんちゃ': { increased: 'attack', decreased: 'sp_defense' },
  'ゆうかん': { increased: 'attack', decreased: 'speed' },
  'さみしがり': { increased: 'attack', decreased: 'defense' },
  
  // 防御系
  'ずぶとい': { increased: 'defense', decreased: 'attack' },
  'わんぱく': { increased: 'defense', decreased: 'sp_attack' },
  'のうてんき': { increased: 'defense', decreased: 'sp_defense' },
  'のんき': { increased: 'defense', decreased: 'speed' },
  
  // 特攻系
  'ひかえめ': { increased: 'sp_attack', decreased: 'attack' },
  'おっとり': { increased: 'sp_attack', decreased: 'defense' },
  'うっかりや': { increased: 'sp_attack', decreased: 'sp_defense' },
  'れいせい': { increased: 'sp_attack', decreased: 'speed' },
  
  // 特防系
  'おだやか': { increased: 'sp_defense', decreased: 'attack' },
  'おとなしい': { increased: 'sp_defense', decreased: 'defense' },
  'しんちょう': { increased: 'sp_defense', decreased: 'sp_attack' },
  'なまいき': { increased: 'sp_defense', decreased: 'speed' },
  
  // 素早さ系
  'ようき': { increased: 'speed', decreased: 'sp_attack' },
  'むじゃき': { increased: 'speed', decreased: 'sp_defense' },
  'せっかち': { increased: 'speed', decreased: 'defense' },
  'おくびょう': { increased: 'speed', decreased: 'attack' },
  
  // 補正なし
  'がんばりや': { increased: null, decreased: null },
  'すなお': { increased: null, decreased: null },
  'てれや': { increased: null, decreased: null },
  'きまぐれ': { increased: null, decreased: null },
  'まじめ': { increased: null, decreased: null }
};

// 全性格のリスト
const ALL_NATURES: PokemonNature[] = Object.keys(NATURE_MODIFIERS) as PokemonNature[];

export class PokemonStatsCalculator {
  // ランダムな個体値を生成（0-31）
  static generateRandomIVs(): IndividualValues {
    return {
      hp: Math.floor(Math.random() * 32),
      attack: Math.floor(Math.random() * 32),
      defense: Math.floor(Math.random() * 32),
      sp_attack: Math.floor(Math.random() * 32),
      sp_defense: Math.floor(Math.random() * 32),
      speed: Math.floor(Math.random() * 32)
    };
  }

  // 理想個体値を生成（31固定、デバッグ用）
  static generatePerfectIVs(): IndividualValues {
    return {
      hp: 31,
      attack: 31,
      defense: 31,
      sp_attack: 31,
      sp_defense: 31,
      speed: 31
    };
  }

  // ランダムな性格を決定
  static generateRandomNature(): PokemonNature {
    return ALL_NATURES[Math.floor(Math.random() * ALL_NATURES.length)];
  }

  // 色違い判定（1/4096）
  static isShiny(): boolean {
    return Math.random() < (1 / 4096);
  }

  // 初期努力値（すべて0）
  static generateInitialEVs(): EffortValues {
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      sp_attack: 0,
      sp_defense: 0,
      speed: 0
    };
  }

  // 新しいポケモンを完全生成
  static generateNewPokemon(pokemonId: number, level: number = 1): PokemonStats | null {
    const speciesData = getPokemonSpeciesData(pokemonId);
    if (!speciesData) return null;

    const ivs = this.generateRandomIVs();
    const evs = this.generateInitialEVs();
    const nature = this.generateRandomNature();
    const ability = getRandomAbility(pokemonId);
    const isShiny = this.isShiny();
    
    const pokemonStats: PokemonStats = {
      pokemon_id: pokemonId,
      pokemon_name: speciesData.name,
      level: level,
      experience: 0,
      experience_to_next: this.getExperienceToNext(level),
      
      individual_values: ivs,
      iv_visibility: {
        hp: false,
        attack: false, 
        defense: false,
        sp_attack: false,
        sp_defense: false,
        speed: false
      },
      
      effort_values: evs,
      effort_total: 0,
      
      nature: nature,
      ability: ability || undefined,
      
      final_stats: {
        serve_skill: 0,
        return_skill: 0,
        volley_skill: 0,
        stroke_skill: 0,
        mental: 0,
        stamina: 0
      },
      
      is_shiny: isShiny,
      iv_judge_unlocked: false,
      potential_rank: this.calculateIVRank(ivs).overall_rank
    };

    // 最終能力値を計算
    pokemonStats.final_stats = this.calculateFinalStats(pokemonStats);

    return pokemonStats;
  }

  // 最終能力値を計算（テニスゲーム用調整式）
  static calculateFinalStats(pokemon: PokemonStats): PokemonStats['final_stats'] {
    const speciesData = getPokemonSpeciesData(pokemon.pokemon_id);
    if (!speciesData) {
      return {
        serve_skill: 10,
        return_skill: 10,
        volley_skill: 10,
        stroke_skill: 10,
        mental: 10,
        stamina: 10
      };
    }

    const level = pokemon.level;
    const ivs = pokemon.individual_values;
    const evs = pokemon.effort_values;
    const natureModifier = NATURE_MODIFIERS[pokemon.nature];

    // 基本計算式: ((種族値 × 2 + 個体値 + 努力値÷4) × レベル ÷ 50 + 10)
    const calculateStat = (
      baseStat: number, 
      iv: number, 
      ev: number, 
      statType: keyof PokemonBaseStats,
      isHP: boolean = false
    ): number => {
      const baseValue = Math.floor(((baseStat * 2 + iv + Math.floor(ev / 4)) * level) / 50);
      const finalValue = isHP ? baseValue + level + 15 : baseValue + 10;
      
      // 性格補正
      let modifier = 1.0;
      if (natureModifier.increased === statType) modifier = 1.1;
      if (natureModifier.decreased === statType) modifier = 0.9;
      
      return Math.floor(finalValue * modifier);
    };

    const baseStats = {
      // サーブ ← 攻撃
      serve_skill: calculateStat(speciesData.attack, ivs.attack, evs.attack, 'attack'),
      
      // リターン ← 防御
      return_skill: calculateStat(speciesData.defense, ivs.defense, evs.defense, 'defense'),
      
      // ボレー ← 特攻
      volley_skill: calculateStat(speciesData.sp_attack, ivs.sp_attack, evs.sp_attack, 'sp_attack'),
      
      // ストローク ← 特防
      stroke_skill: calculateStat(speciesData.sp_defense, ivs.sp_defense, evs.sp_defense, 'sp_defense'),
      
      // メンタル ← HP
      mental: calculateStat(speciesData.hp, ivs.hp, evs.hp, 'hp', true),
      
      // スタミナ ← 素早さ
      stamina: calculateStat(speciesData.speed, ivs.speed, evs.speed, 'speed')
    };
    
    // 特性ボーナス適用
    return calculateAbilityBonus(pokemon.ability, baseStats);
  }

  // 個体値ランク判定
  static calculateIVRank(ivs: IndividualValues): IVRankJudgment {
    const total = ivs.hp + ivs.attack + ivs.defense + ivs.sp_attack + ivs.sp_defense + ivs.speed;
    const values = Object.values(ivs);
    const perfectCount = values.filter(v => v === 31).length;
    const bestValue = Math.max(...values);
    const worstValue = Math.min(...values);

    // 最高・最低の能力を特定
    const statNames: (keyof IndividualValues)[] = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
    const bestStats = statNames.filter(stat => ivs[stat] === bestValue);
    const worstStats = statNames.filter(stat => ivs[stat] === worstValue);

    // 総合ランク判定
    let rank: 'S' | 'A' | 'B' | 'C' | 'D';
    let comment: string;

    if (total >= 180) {
      rank = 'S';
      comment = '素晴らしい能力を持っている！';
    } else if (total >= 151) {
      rank = 'A'; 
      comment = 'かなり優秀な能力だ';
    } else if (total >= 121) {
      rank = 'B';
      comment = '平均以上の能力を持っている';
    } else if (total >= 91) {
      rank = 'C';
      comment = '普通の能力といったところ';
    } else {
      rank = 'D';
      comment = 'まずまずの能力かな';
    }

    return {
      overall_rank: rank,
      total_ivs: total,
      best_stats: bestStats,
      worst_stats: worstStats,
      judge_comment: comment,
      perfect_ivs: perfectCount
    };
  }

  // レベルアップに必要な経験値を計算
  static getExperienceToNext(currentLevel: number): number {
    // 簡単な経験値式：レベル² × 10
    const currentLevelExp = currentLevel * currentLevel * 10;
    const nextLevelExp = (currentLevel + 1) * (currentLevel + 1) * 10;
    return nextLevelExp - currentLevelExp;
  }

  // 経験値を追加してレベルアップ処理
  static addExperience(pokemon: PokemonStats, expGain: number): GrowthResult {
    const oldLevel = pokemon.level;
    const oldStats = { ...pokemon.final_stats };
    
    pokemon.experience += expGain;
    
    // レベルアップチェック
    while (pokemon.experience >= pokemon.experience_to_next && pokemon.level < 100) {
      pokemon.experience -= pokemon.experience_to_next;
      pokemon.level++;
      pokemon.experience_to_next = this.getExperienceToNext(pokemon.level);
    }

    // 能力値再計算
    pokemon.final_stats = this.calculateFinalStats(pokemon);

    const levelGained = pokemon.level - oldLevel;
    const statsIncrease = {
      serve_skill: pokemon.final_stats.serve_skill - oldStats.serve_skill,
      return_skill: pokemon.final_stats.return_skill - oldStats.return_skill,
      volley_skill: pokemon.final_stats.volley_skill - oldStats.volley_skill,
      stroke_skill: pokemon.final_stats.stroke_skill - oldStats.stroke_skill,
      mental: pokemon.final_stats.mental - oldStats.mental,
      stamina: pokemon.final_stats.stamina - oldStats.stamina
    };

    const totalIncrease = Object.values(statsIncrease).reduce((sum, val) => sum + val, 0);

    // 進化チェック
    let evolutionInfo = undefined;
    if (canEvolve(pokemon.pokemon_id, pokemon.level)) {
      const evoInfo = getEvolutionInfo(pokemon.pokemon_id);
      if (evoInfo) {
        evolutionInfo = {
          evolve_to: evoInfo.evolve_to,
          evolve_name: evoInfo.evolve_name,
          requirements_met: true
        };
      }
    }

    return {
      level_gained: levelGained,
      stats_increased: statsIncrease,
      total_increase: totalIncrease,
      evolution_available: evolutionInfo
    };
  }

  // 進化処理
  static evolvePokemon(pokemon: PokemonStats): boolean {
    const evolutionInfo = getEvolutionInfo(pokemon.pokemon_id);
    if (!evolutionInfo || pokemon.level < evolutionInfo.level) {
      return false;
    }

    const newSpecies = getPokemonSpeciesData(evolutionInfo.evolve_to);
    if (!newSpecies) return false;

    // 進化実行
    pokemon.pokemon_id = evolutionInfo.evolve_to;
    pokemon.pokemon_name = newSpecies.name;
    
    // 能力値再計算
    pokemon.final_stats = this.calculateFinalStats(pokemon);
    
    return true;
  }

  // 努力値を追加
  static addEffortValues(pokemon: PokemonStats, evGains: Partial<EffortValues>): boolean {
    let totalEVs = pokemon.effort_total;
    const newEVs = { ...pokemon.effort_values };

    // 各努力値を追加（上限チェック）
    for (const [stat, gain] of Object.entries(evGains)) {
      if (typeof gain === 'number') {
        const currentEV = newEVs[stat as keyof EffortValues];
        const newEV = Math.min(currentEV + gain, 255); // 各能力最大255
        const actualGain = newEV - currentEV;
        
        if (totalEVs + actualGain <= 510) { // 総合最大510
          newEVs[stat as keyof EffortValues] = newEV;
          totalEVs += actualGain;
        }
      }
    }

    pokemon.effort_values = newEVs;
    pokemon.effort_total = totalEVs;
    
    // 能力値再計算
    pokemon.final_stats = this.calculateFinalStats(pokemon);
    
    return true;
  }

  // 個体値の可視化を解放
  static unlockIVVisibility(pokemon: PokemonStats, stat: keyof IndividualValues): void {
    pokemon.iv_visibility[stat] = true;
  }

  // すべての個体値を表示解放
  static unlockAllIVs(pokemon: PokemonStats): void {
    pokemon.iv_judge_unlocked = true;
    Object.keys(pokemon.iv_visibility).forEach(stat => {
      pokemon.iv_visibility[stat as keyof typeof pokemon.iv_visibility] = true;
    });
  }
}