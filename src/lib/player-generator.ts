// ポケモン選手生成システム（日本語名対応）
import { PokemonAPI } from './pokemon-api';
import { Player } from '@/types/game';
import { PokemonStatsCalculator } from './pokemon-stats-calculator';
import { PokemonStats } from '@/types/pokemon-stats';
import { TENNIS_SPECIAL_ABILITIES, SpecialAbility, SpecialAbilityCalculator } from '@/types/special-abilities';
import { GameBalanceManager } from './game-balance-manager';
import { CharacterGenerationSystem, CharacterGenerationHelpers, AssessmentValues } from './character-generation-system';

export class PlayerGenerator {
  // 御三家ポケモンの名前（拡張版 - 全世代対応）
  private static readonly STARTER_POKEMON_NAMES = [
    // 第1世代（カントー）
    'フシギダネ', 'ヒトカゲ', 'ゼニガメ',
    // 第2世代（ジョウト） 
    'チコリータ', 'ヒノアラシ', 'ワニノコ',
    // 第3世代（ホウエン）
    'キモリ', 'アチャモ', 'ミズゴロウ'
  ];

  // 低種族値ポケモン（成長を楽しめるポケモン） - レア度システム対応版
  private static readonly LOW_STAT_POKEMON = [
    // 第1世代 - Common
    { name: 'コラッタ', id: 19, description: '小さくても頑張り屋', generation: 1 },
    { name: 'ポッポ', id: 16, description: '空を舞うスピードスター', generation: 1 },
    { name: 'キャタピー', id: 10, description: '進化への期待大', generation: 1 },
    { name: 'ビードル', id: 13, description: '毒針で勝負', generation: 1 },
    { name: 'コイキング', id: 129, description: '伝説の跳ね上がり', generation: 1 },
    { name: 'ズバット', id: 41, description: '洞窟育ちの頑張り屋', generation: 1 },
    { name: 'ナゾノクサ', id: 43, description: '草むらの小さな戦士', generation: 1 },
    { name: 'ヤドン', id: 79, description: 'マイペースな天才肌', generation: 1 },
    { name: 'コダック', id: 54, description: '頭痛持ちのエスパー', generation: 1 },
    { name: 'ニャース', id: 52, description: '小判を集める商売上手', generation: 1 },
    { name: 'オニスズメ', id: 21, description: 'くちばしが鋭い小鳥', generation: 1 },
    { name: 'アーボ', id: 23, description: 'とぐろを巻く蛇', generation: 1 },
    { name: 'トランセル', id: 11, description: '進化を待つ蛹', generation: 1 },
    { name: 'コクーン', id: 14, description: '毒を宿す蛹', generation: 1 },
    
    // 第2世代 - Common
    { name: 'オタチ', id: 161, description: '見張りが得意な小動物', generation: 2 },
    { name: 'ホーホー', id: 163, description: '夜行性のフクロウ', generation: 2 },
    { name: 'レディバ', id: 165, description: '空を舞うテントウムシ', generation: 2 },
    { name: 'イトマル', id: 167, description: '糸を張るクモ', generation: 2 },
    
    // 第3世代 - Common  
    { name: 'ポチエナ', id: 261, description: 'やんちゃな子犬', generation: 3 },
    { name: 'ジグザグマ', id: 263, description: 'ジグザグ走るアライグマ', generation: 3 },
    { name: 'ケムッソ', id: 265, description: '進化の可能性を秘める', generation: 3 },
    { name: 'カラサリス', id: 266, description: '白い繭の中で成長', generation: 3 },
    { name: 'マユルド', id: 268, description: '紫の繭で進化準備', generation: 3 },
    { name: 'スバメ', id: 276, description: '勇敢な小さなツバメ', generation: 3 },
    { name: 'キャモメ', id: 278, description: '海を愛するカモメ', generation: 3 },
    { name: 'ゴニョニョ', id: 293, description: '大きな声の持ち主', generation: 3 }
  ];

  // 追加：レア度別ポケモン取得メソッド
  private static getCommonPokemon(): Array<{name: string, id: number, description: string, generation: number}> {
    // PokemonAPIから全てのcommonレア度ポケモンを動的に取得
    const allPokemonNames = PokemonAPI.getAllPokemons();
    const commonPokemon: Array<{name: string, id: number, description: string, generation: number}> = [];
    
    // 静的に定義されたcommonポケモンをフィルタリング
    // PokemonAPIの内部データにアクセスできないため、既知のcommonポケモンを拡張
    const knownCommonPokemon = [
      // 第1世代
      { name: 'コラッタ', id: 19, description: '小さくても頑張り屋', generation: 1 },
      { name: 'ポッポ', id: 16, description: '空を舞うスピードスター', generation: 1 },
      { name: 'キャタピー', id: 10, description: '進化への期待大', generation: 1 },
      { name: 'ビードル', id: 13, description: '毒針で勝負', generation: 1 },
      { name: 'コイキング', id: 129, description: '伝説の跳ね上がり', generation: 1 },
      { name: 'ズバット', id: 41, description: '洞窟育ちの頑張り屋', generation: 1 },
      { name: 'ナゾノクサ', id: 43, description: '草むらの小さな戦士', generation: 1 },
      { name: 'ヤドン', id: 79, description: 'マイペースな天才肌', generation: 1 },
      { name: 'コダック', id: 54, description: '頭痛持ちのエスパー', generation: 1 },
      { name: 'ニャース', id: 52, description: '小判を集める商売上手', generation: 1 },
      { name: 'オニスズメ', id: 21, description: 'くちばしが鋭い小鳥', generation: 1 },
      { name: 'アーボ', id: 23, description: 'とぐろを巻く蛇', generation: 1 },
      { name: 'トランセル', id: 11, description: '進化を待つ蛹', generation: 1 },
      { name: 'コクーン', id: 14, description: '毒を宿す蛹', generation: 1 },
      
      // 第2世代
      { name: 'オタチ', id: 161, description: '見張りが得意な小動物', generation: 2 },
      { name: 'ホーホー', id: 163, description: '夜行性のフクロウ', generation: 2 },
      { name: 'レディバ', id: 165, description: '空を舞うテントウムシ', generation: 2 },
      { name: 'イトマル', id: 167, description: '糸を張るクモ', generation: 2 },
      
      // 第3世代
      { name: 'ポチエナ', id: 261, description: 'やんちゃな子犬', generation: 3 },
      { name: 'ジグザグマ', id: 263, description: 'ジグザグ走るアライグマ', generation: 3 },
      { name: 'ケムッソ', id: 265, description: '進化の可能性を秘める', generation: 3 },
      { name: 'カラサリス', id: 266, description: '白い繭の中で成長', generation: 3 },
      { name: 'マユルド', id: 268, description: '紫の繭で進化準備', generation: 3 },
      { name: 'スバメ', id: 276, description: '勇敢な小さなツバメ', generation: 3 },
      { name: 'キャモメ', id: 278, description: '海を愛するカモメ', generation: 3 },
      { name: 'ゴニョニョ', id: 293, description: '大きな声の持ち主', generation: 3 }
    ];
    
    return knownCommonPokemon;
  }

  // 新しい初期チーム生成（御三家1匹 + 低種族値5匹）
  static async generateCustomStarterTeam(selectedStarter: string): Promise<Player[]> {
    try {
      const players: Player[] = [];

      // 1. 選択された御三家をキャプテンとして追加
      const starterDetail = await PokemonAPI.getPokemonDetails(selectedStarter);
      const captainPlayer = this.createPlayerFromPokemonDetail(starterDetail, 'captain');
      captainPlayer.grade = 1;
      captainPlayer.level = 5; // 御三家は少し高レベル
      
      // 新バランスシステムで御三家の初期能力を設定
      const aceStats = GameBalanceManager.generateBalancedInitialStats('ace');
      captainPlayer.serve_skill = aceStats.serve_skill;
      captainPlayer.return_skill = aceStats.return_skill;
      captainPlayer.volley_skill = aceStats.volley_skill;
      captainPlayer.stroke_skill = aceStats.stroke_skill;
      captainPlayer.mental = aceStats.mental;
      captainPlayer.stamina = aceStats.stamina;
      captainPlayer.condition = 'excellent';
      captainPlayer.motivation = 100;
      
      // 御三家には確実に1つ以上の特殊能力を付与
      const captainAbilities = this.generateSpecialAbilities(captainPlayer.level, 'captain');
      captainPlayer.special_abilities = captainAbilities;
      console.log(`Captain ${captainPlayer.pokemon_name} generated with ${captainAbilities.length} special abilities:`, 
        captainAbilities.map(a => a.name));
      
      players.push(captainPlayer);

      // 2. 低種族値ポケモンから5匹をランダム選択（レア度システム対応）
      const availableLowStat = this.getCommonPokemon();
      const shuffledLowStat = [...availableLowStat].sort(() => Math.random() - 0.5);
      const selectedLowStat = shuffledLowStat.slice(0, 5);

      for (let i = 0; i < selectedLowStat.length; i++) {
        const pokemon = selectedLowStat[i];
        
        try {
          const pokemonDetail = await PokemonAPI.getPokemonDetails(pokemon.name);
          const position: Player['position'] = i < 2 ? 'regular' : 'member'; // 2匹をレギュラー、3匹を部員に
          const player = this.createPlayerFromPokemonDetail(pokemonDetail, position);
          
          player.grade = 1;
          player.level = 1; // 低種族値は初期レベル1
          
          // 新バランスシステムで低種族値ポケモンの能力を設定
          const memberRole = position === 'regular' ? 'regular' : 'member';
          const balancedStats = GameBalanceManager.generateBalancedInitialStats(memberRole);
          player.serve_skill = balancedStats.serve_skill;
          player.return_skill = balancedStats.return_skill;
          player.volley_skill = balancedStats.volley_skill;
          player.stroke_skill = balancedStats.stroke_skill;
          player.mental = balancedStats.mental;
          player.stamina = balancedStats.stamina;
          
          // ランダムでコンディションを設定
          const conditions: Array<Player['condition']> = ['good', 'normal', 'excellent'];
          player.condition = conditions[Math.floor(Math.random() * conditions.length)];
          
          // 低種族値ポケモンにも低確率で特殊能力を付与
          const memberAbilities = this.generateSpecialAbilities(player.level, player.position);
          player.special_abilities = memberAbilities;
          console.log(`Member ${player.pokemon_name} (${player.position}) generated with ${memberAbilities.length} special abilities:`,
            memberAbilities.map(a => a.name));
          
          players.push(player);
        } catch (error) {
          console.error(`Failed to create player for ${pokemon.name}:`, error);
          // エラー時はフォールバックプレイヤーを作成
          const fallbackPlayer = this.createFallbackPlayer(pokemon.name, pokemon.id, i < 2 ? 'regular' : 'member');
          fallbackPlayer.grade = 1;
          fallbackPlayer.level = 1;
          players.push(fallbackPlayer);
        }
      }

      return players;
    } catch (error) {
      console.error('Failed to generate custom starter team:', error);
      // 完全フォールバック: 旧システムを使用
      return this.createFallbackTeam();
    }
  }

  // 旧システム（後方互換性のため残存）
  static async generateStarterTeam(): Promise<Player[]> {
    // デフォルトでフシギダネを選択した場合のチームを生成
    return this.generateCustomStarterTeam('フシギダネ');
  }

  // PokemonDetailからPlayer作成（新しいシステム用）
  static createPlayerFromPokemonDetail(
    pokemonDetail: any, 
    position: Player['position'] = 'member'
  ): Player {
    const pokemonId = pokemonDetail.id || 0;
    const pokemonName = pokemonDetail.name; // 既に日本語名
    
    // 新しい個体値システムでポケモンステータスを生成
    const pokemonStats = PokemonStatsCalculator.generateNewPokemon(pokemonId, 1);
    
    if (!pokemonStats) {
      // フォールバック: 旧システム
      return this.createFallbackPlayer(pokemonName, pokemonId, position);
    }

    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemonName,
      pokemon_id: pokemonId,
      level: pokemonStats.level,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position,
      
      // テニススキル（個体値システムから計算）
      serve_skill: pokemonStats.final_stats.serve_skill,
      return_skill: pokemonStats.final_stats.return_skill,
      volley_skill: pokemonStats.final_stats.volley_skill,
      stroke_skill: pokemonStats.final_stats.stroke_skill,
      mental: pokemonStats.final_stats.mental,
      stamina: pokemonStats.final_stats.stamina,
      
      // 状態
      condition: 'good',
      motivation: Math.floor(Math.random() * 30) + 70, // 70-100
      experience: pokemonStats.experience,
      
      // 戦績
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,
      
      // PokeAPIから取得したタイプ情報
      types: pokemonDetail.types || ['normal'],
      
      // 新しい個体値システム
      pokemon_stats: pokemonStats,
      
      // 特殊能力（レベルと基本能力に応じて生成）
      special_abilities: [],

      // 新規追加必須フィールド（デフォルト初期化）
      enrollmentYear: new Date().getFullYear(),
      personality: 'hardworker',
      initialStats: {
        serve_skill: pokemonStats.final_stats.serve_skill,
        return_skill: pokemonStats.final_stats.return_skill,
        volley_skill: pokemonStats.final_stats.volley_skill,
        stroke_skill: pokemonStats.final_stats.stroke_skill,
        mental: pokemonStats.final_stats.mental,
        stamina: pokemonStats.final_stats.stamina,
        average: Math.round(
          (
            pokemonStats.final_stats.serve_skill +
            pokemonStats.final_stats.return_skill +
            pokemonStats.final_stats.volley_skill +
            pokemonStats.final_stats.stroke_skill +
            pokemonStats.final_stats.mental +
            pokemonStats.final_stats.stamina
          ) / 6
        )
      }
    };
  }

  // レガシー用：ポケモンデータからPlayer作成（後方互換性）
  private static createPlayerFromPokemon(
    pokemon: any, 
    position: Player['position'] = 'member'
  ): Player {
    const pokemonId = pokemon.id || 0;
    const pokemonName = this.capitalizeFirst(pokemon.name || 'Unknown');
    
    // 新しい個体値システムでポケモンステータスを生成
    const pokemonStats = PokemonStatsCalculator.generateNewPokemon(pokemonId, 1);
    
    if (!pokemonStats) {
      // フォールバック: 旧システム
      return this.createFallbackPlayer(pokemonName, pokemonId, position);
    }

    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemonName,
      pokemon_id: pokemonId,
      level: pokemonStats.level,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position,
      
      // テニススキル（個体値システムから計算）
      serve_skill: pokemonStats.final_stats.serve_skill,
      return_skill: pokemonStats.final_stats.return_skill,
      volley_skill: pokemonStats.final_stats.volley_skill,
      stroke_skill: pokemonStats.final_stats.stroke_skill,
      mental: pokemonStats.final_stats.mental,
      stamina: pokemonStats.final_stats.stamina,
      
      // 状態
      condition: 'good',
      motivation: Math.floor(Math.random() * 30) + 70, // 70-100
      experience: pokemonStats.experience,
      
      // 戦績
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,
      
      // ポケモン固有
      types: pokemon.types || ['normal'],
      
      // 新しい個体値システム
      pokemon_stats: pokemonStats,

      // 新規追加必須フィールド
      enrollmentYear: new Date().getFullYear(),
      personality: 'hardworker',
      initialStats: {
        serve_skill: pokemonStats.final_stats.serve_skill,
        return_skill: pokemonStats.final_stats.return_skill,
        volley_skill: pokemonStats.final_stats.volley_skill,
        stroke_skill: pokemonStats.final_stats.stroke_skill,
        mental: pokemonStats.final_stats.mental,
        stamina: pokemonStats.final_stats.stamina,
        average: Math.round(
          (
            pokemonStats.final_stats.serve_skill +
            pokemonStats.final_stats.return_skill +
            pokemonStats.final_stats.volley_skill +
            pokemonStats.final_stats.stroke_skill +
            pokemonStats.final_stats.mental +
            pokemonStats.final_stats.stamina
          ) / 6
        )
      }
    };
  }

  // フォールバック用プレイヤー作成（新バランスシステム適用）
  static createFallbackPlayer(
    pokemonName: string,
    pokemonId: number,
    position: Player['position']
  ): Player {
    // ポジションに応じた役割マッピング
    const roleMapping = {
      'captain': 'ace' as const,
      'vice_captain': 'ace' as const,
      'regular': 'regular' as const,
      'member': 'member' as const
    };
    
    const role = roleMapping[position];
    const balancedStats = GameBalanceManager.generateBalancedInitialStats(role);
    
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemonName,
      pokemon_id: pokemonId,
      level: 1,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position,
      
      // 新バランスシステムによる能力値
      serve_skill: balancedStats.serve_skill,
      return_skill: balancedStats.return_skill,
      volley_skill: balancedStats.volley_skill,
      stroke_skill: balancedStats.stroke_skill,
      mental: balancedStats.mental,
      stamina: balancedStats.stamina,
      
      condition: 'good',
      motivation: Math.floor(Math.random() * 30) + 70,
      experience: 0,
      
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,
      
      types: ['normal'],
      
      special_abilities: [],

      // 新規追加必須フィールド
      enrollmentYear: new Date().getFullYear(),
      personality: 'hardworker',
      initialStats: {
        serve_skill: balancedStats.serve_skill,
        return_skill: balancedStats.return_skill,
        volley_skill: balancedStats.volley_skill,
        stroke_skill: balancedStats.stroke_skill,
        mental: balancedStats.mental,
        stamina: balancedStats.stamina,
        average: Math.round(
          (
            balancedStats.serve_skill +
            balancedStats.return_skill +
            balancedStats.volley_skill +
            balancedStats.stroke_skill +
            balancedStats.mental +
            balancedStats.stamina
          ) / 6
        )
      }
    };
  }

  // 特殊能力生成システム
  static generateSpecialAbilities(level: number, position: Player['position']): SpecialAbility[] {
    const abilities: SpecialAbility[] = [];
    
    // ポジションによる基本確率
    const baseChance = {
      'captain': 0.8,       // キャプテンは80%
      'vice_captain': 0.6,  // 副キャプテンは60%
      'regular': 0.4,       // レギュラーは40%
      'member': 0.2         // 部員は20%
    }[position];

    // レベルによる追加確率（高レベルほど特殊能力を覚えやすい）
    const levelBonus = Math.min(level * 0.05, 0.3); // 最大30%のボーナス
    const finalChance = Math.min(baseChance + levelBonus, 0.95); // 最大95%

    // 最初の特殊能力
    if (Math.random() < finalChance) {
      const ability = this.selectRandomAbility(level, 'primary');
      if (ability) abilities.push(ability);
    }

    // 2つ目の特殊能力（高レベル・高ポジションのみ）
    if (level >= 10 && (position === 'captain' || position === 'vice_captain')) {
      const secondChance = (level - 10) * 0.03 + (position === 'captain' ? 0.2 : 0.1);
      if (Math.random() < secondChance) {
        const ability = this.selectRandomAbility(level, 'secondary');
        if (ability && !abilities.some(a => a.id === ability.id)) {
          abilities.push(ability);
        }
      }
    }

    // 3つ目の特殊能力（非常に高レベルのキャプテンのみ）
    if (level >= 20 && position === 'captain') {
      const thirdChance = (level - 20) * 0.02;
      if (Math.random() < thirdChance) {
        const ability = this.selectRandomAbility(level, 'tertiary');
        if (ability && !abilities.some(a => a.id === ability.id)) {
          abilities.push(ability);
        }
      }
    }

    return abilities;
  }

  // 特殊能力選択（レベルと用途に応じて）
  private static selectRandomAbility(level: number, slot: 'primary' | 'secondary' | 'tertiary'): SpecialAbility | null {
    let candidateAbilities = [...TENNIS_SPECIAL_ABILITIES];

    // 赤特殊能力（ネガティブ）の確率調整
    const negativeChance = Math.max(0.05, 0.2 - (level * 0.01)); // レベルが高いほど低確率
    if (Math.random() > negativeChance) {
      candidateAbilities = candidateAbilities.filter(a => a.color !== 'red');
    }

    // スロット別フィルタリング
    switch (slot) {
      case 'primary':
        // 最初は基本的な能力を優先
        candidateAbilities = candidateAbilities.filter(a => 
          ['blue', 'green', 'changeable'].includes(a.color) || 
          (a.color === 'gold' && level >= 5)
        );
        break;
        
      case 'secondary':
        // 2番目はゴールド級も含む
        candidateAbilities = candidateAbilities.filter(a => 
          a.color !== 'red' || Math.random() < 0.1
        );
        break;
        
      case 'tertiary':
        // 3番目は最強クラスも可能
        break;
    }

    // レベルに応じた制限
    if (level < 5) {
      candidateAbilities = candidateAbilities.filter(a => a.color === 'blue' || a.color === 'green');
    } else if (level < 10) {
      candidateAbilities = candidateAbilities.filter(a => a.color !== 'gold' || a.rank <= 'B');
    }

    if (candidateAbilities.length === 0) return null;

    // 重み付き抽選（レア度による）
    const weights: { [key: string]: number } = {
      'gold': 1,
      'blue': 3,
      'green': 2,
      'red': 1,
      'changeable': 2
    };

    const totalWeight = candidateAbilities.reduce((sum, ability) => 
      sum + weights[ability.color], 0
    );

    let random = Math.random() * totalWeight;
    for (const ability of candidateAbilities) {
      random -= weights[ability.color];
      if (random <= 0) {
        // 選択された特殊能力のクローンを作成（個別の isActive 状態を持つため）
        return {
          ...ability,
          isActive: true
        };
      }
    }

    return candidateAbilities[0] || null;
  }

  // フォールバック用ダミーチーム（6人）
  private static createFallbackTeam(): Player[] {
    const fallbackData = [
      { name: 'フシギダネ', id: 1, position: 'captain' as const },
      { name: 'ヒトカゲ', id: 4, position: 'regular' as const },
      { name: 'ゼニガメ', id: 7, position: 'regular' as const },
      { name: 'チコリータ', id: 152, position: 'member' as const },
      { name: 'ヒノアラシ', id: 155, position: 'member' as const },
      { name: 'ワニノコ', id: 158, position: 'member' as const }
    ];

    return fallbackData.map(data => {
      const player = this.createFallbackPlayer(data.name, data.id, data.position);
      player.grade = 1; // 全員1年生
      return player;
    });
  }

  // ランダムポケモン選手生成
  static async generateRandomPlayer(): Promise<Player> {
    try {
      const randomPokemon = await PokemonAPI.fetchRandomPokemon(1);
      return this.createPlayerFromPokemon(randomPokemon[0]);
    } catch (error) {
      console.error('Failed to generate random player:', error);
      return this.createFallbackTeam()[0]; // フォールバックの1匹目を返す
    }
  }

  // 文字列の最初を大文字に
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 利用可能な御三家ポケモン取得（オンボーディング用）
  static getAvailableStarters(): string[] {
    return [...this.STARTER_POKEMON_NAMES];
  }

  // 世代別御三家取得
  static getStartersByGeneration(): { [key: number]: string[] } {
    return {
      1: ['フシギダネ', 'ヒトカゲ', 'ゼニガメ'],
      2: ['チコリータ', 'ヒノアラシ', 'ワニノコ'],
      3: ['キモリ', 'アチャモ', 'ミズゴロウ']
    };
  }

  // 選手の能力値を向上させる（新バランスシステム対応）
  static improvePlayerStats(player: Player, improvements: Partial<Player>): Player {
    const improved = { ...player };
    
    // 各能力値を向上（動的な上限値を考慮）
    const statCap = GameBalanceManager.getStatCapForLevel(player.level);
    
    Object.keys(improvements).forEach(key => {
      if (typeof improvements[key as keyof Player] === 'number') {
        const currentValue = improved[key as keyof Player] as number;
        const improvement = improvements[key as keyof Player] as number;
        // 新バランスシステムの上限値を適用
        (improved[key as keyof Player] as number) = Math.min(currentValue + improvement, statCap);
      }
    });
    
    // 経験値を増加
    improved.experience += 10;
    
    return improved;
  }

  // バランス調整済みレベルアップ処理
  static levelUpPlayer(player: Player): Player {
    if (player.experience < GameBalanceManager.getExperienceRequired(player.level)) {
      return player; // 経験値不足
    }
    
    const levelUpGains = GameBalanceManager.calculateLevelUpGains(player);
    const leveledUpPlayer = {
      ...player,
      ...levelUpGains,
      level: player.level + 1,
      experience: 0 // 次のレベルに向けてリセット
    };
    
    return leveledUpPlayer;
  }

  // 厳選されたポケモンからプレイヤーを作成
  static createPlayerFromBreedResult(pokemonStats: PokemonStats): Player {
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemonStats.pokemon_name,
      pokemon_id: pokemonStats.pokemon_id,
      level: pokemonStats.level,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position: 'member', // 新加入は通常メンバーから

      // テニススキル（個体値システムから計算済み）
      serve_skill: pokemonStats.final_stats.serve_skill,
      return_skill: pokemonStats.final_stats.return_skill,
      volley_skill: pokemonStats.final_stats.volley_skill,
      stroke_skill: pokemonStats.final_stats.stroke_skill,
      mental: pokemonStats.final_stats.mental,
      stamina: pokemonStats.final_stats.stamina,

      // 状態
      condition: 'excellent', // 厳選された個体は初期状態良好
      motivation: Math.floor(Math.random() * 10) + 90, // 高モチベーション
      experience: pokemonStats.experience,

      // 戦績
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,

      // ポケモン固有
      types: ['normal'], // デフォルト、実際には種族データから取得すべき

      // 個体値システム
      pokemon_stats: pokemonStats,

      // 新規追加必須フィールド
      enrollmentYear: new Date().getFullYear(),
      personality: 'hardworker',
      initialStats: {
        serve_skill: pokemonStats.final_stats.serve_skill,
        return_skill: pokemonStats.final_stats.return_skill,
        volley_skill: pokemonStats.final_stats.volley_skill,
        stroke_skill: pokemonStats.final_stats.stroke_skill,
        mental: pokemonStats.final_stats.mental,
        stamina: pokemonStats.final_stats.stamina,
        average: Math.round(
          (
            pokemonStats.final_stats.serve_skill +
            pokemonStats.final_stats.return_skill +
            pokemonStats.final_stats.volley_skill +
            pokemonStats.final_stats.stroke_skill +
            pokemonStats.final_stats.mental +
            pokemonStats.final_stats.stamina
          ) / 6
        )
      }
    };
  }

  // 既存プレイヤーを新バランスシステムに移行
  static migratePlayerToNewBalance(player: Player): Player {
    // 現在のレベルに応じた新しい基準能力値を取得
    const roleMapping = {
      'captain': 'ace' as const,
      'vice_captain': 'ace' as const,
      'regular': 'regular' as const,
      'member': 'member' as const
    };
    
    const role = roleMapping[player.position];
    const baseStats = GameBalanceManager.generateBalancedInitialStats(role);
    const growthMultiplier = GameBalanceManager.getGrowthRateForLevel(player.level);
    
    // レベルに応じた成長を反映した新能力値を計算
    const migratedStats = {
      serve_skill: Math.floor(baseStats.serve_skill + (player.level - 1) * 2 * growthMultiplier),
      return_skill: Math.floor(baseStats.return_skill + (player.level - 1) * 2 * growthMultiplier),
      volley_skill: Math.floor(baseStats.volley_skill + (player.level - 1) * 2 * growthMultiplier),
      stroke_skill: Math.floor(baseStats.stroke_skill + (player.level - 1) * 2 * growthMultiplier),
      mental: Math.floor(baseStats.mental + (player.level - 1) * 1.5 * growthMultiplier),
      stamina: Math.floor(baseStats.stamina + (player.level - 1) * 1.5 * growthMultiplier)
    };
    
    // 現在の値と新基準値の較大を取る（プレイヤーが損をしないように）
    const statCap = GameBalanceManager.getStatCapForLevel(player.level);
    
    return {
      ...player,
      serve_skill: Math.min(Math.max(player.serve_skill || 0, migratedStats.serve_skill), statCap),
      return_skill: Math.min(Math.max(player.return_skill || 0, migratedStats.return_skill), statCap),
      volley_skill: Math.min(Math.max(player.volley_skill || 0, migratedStats.volley_skill), statCap),
      stroke_skill: Math.min(Math.max(player.stroke_skill || 0, migratedStats.stroke_skill), statCap),
      mental: Math.min(Math.max(player.mental || 0, migratedStats.mental), statCap),
      stamina: Math.min(Math.max(player.stamina || 0, migratedStats.stamina), statCap)
    };
  }

  // チーム全体を新バランスシステムに移行
  static migrateTeamToNewBalance(players: Player[]): Player[] {
    return players.map(player => this.migratePlayerToNewBalance(player));
  }

  // 新バランスシステムでの推奨初期チーム生成
  static generateBalancedInitialTeam(): Player[] {
    const teamMembers = [
      { role: 'ace', position: 'captain', pokemon: 'フシギダネ' },
      { role: 'regular', position: 'regular', pokemon: 'コラッタ' },
      { role: 'regular', position: 'regular', pokemon: 'ポッポ' },
      { role: 'member', position: 'member', pokemon: 'キャタピー' },
      { role: 'member', position: 'member', pokemon: 'ビードル' },
      { role: 'rookie', position: 'member', pokemon: 'コイキング' }
    ];

    return teamMembers.map((member, index) => {
      const balancedStats = GameBalanceManager.generateBalancedInitialStats(
        member.role as 'ace' | 'regular' | 'member' | 'rookie'
      );
      
      return {
        id: `balanced_player_${index}`,
        pokemon_name: member.pokemon,
        pokemon_id: index + 1,
        level: member.role === 'ace' ? 3 : 1,
        grade: 1,
        position: member.position as Player['position'],
        
        // バランス調整済み初期能力値
        serve_skill: balancedStats.serve_skill,
        return_skill: balancedStats.return_skill,
        volley_skill: balancedStats.volley_skill,
        stroke_skill: balancedStats.stroke_skill,
        mental: balancedStats.mental,
        stamina: balancedStats.stamina,
        
        condition: 'good',
        motivation: member.role === 'ace' ? 90 : Math.floor(Math.random() * 20) + 70,
        experience: 0,
        
        matches_played: 0,
        matches_won: 0,
        sets_won: 0,
        sets_lost: 0,
        
        types: ['normal'],
        special_abilities: [],

        // 新規追加必須フィールド
        enrollmentYear: new Date().getFullYear(),
        personality: 'hardworker',
        initialStats: {
          serve_skill: balancedStats.serve_skill,
          return_skill: balancedStats.return_skill,
          volley_skill: balancedStats.volley_skill,
          stroke_skill: balancedStats.stroke_skill,
          mental: balancedStats.mental,
          stamina: balancedStats.stamina,
          average: Math.round(
            (
              balancedStats.serve_skill +
              balancedStats.return_skill +
              balancedStats.volley_skill +
              balancedStats.stroke_skill +
              balancedStats.mental +
              balancedStats.stamina
            ) / 6
          )
        }
      };
    });
  }
  
  // === 新しいパワプロ風キャラクター生成システム ===
  
  // パワプロ風バランス調整済みキャラクター生成
  static generateEnhancedCharacter(
    pokemonName: string,
    pokemonId: number,
    level: number = 1,
    position: Player['position'] = 'member',
    targetRank?: string
  ): Player {
    const player = CharacterGenerationSystem.generateBalancedCharacter(
      pokemonName, 
      pokemonId, 
      level, 
      position, 
      targetRank as any
    );
    
    // 特殊能力の仮想ステータスを適用
    return CharacterGenerationSystem.applyVirtualStats(player);
  }
  
  // 査定値付きプレイヤー情報取得
  static getPlayerAssessment(player: Player): AssessmentValues {
    return CharacterGenerationSystem.assessPlayer(player);
  }
  
  // 高ランク選手生成（スカウトシステム用）
  static generateHighRankPlayer(pokemonName: string, pokemonId: number): Player {
    const level = Math.floor(Math.random() * 30) + 20; // レベル20-50
    const position = Math.random() < 0.3 ? 'captain' : 'regular';
    return this.generateEnhancedCharacter(pokemonName, pokemonId, level, position, 'A');
  }
  
  // S+ランク選手生成（特別イベント用）
  static generateSPlusPlayer(pokemonName: string, pokemonId: number): Player {
    return CharacterGenerationHelpers.createSPlusPlayer(pokemonName, pokemonId);
  }
  
  // 新人選手生成（通常加入用）
  static generateRookiePlayer(pokemonName: string, pokemonId: number): Player {
    return CharacterGenerationHelpers.createRookiePlayer(pokemonName, pokemonId);
  }
  
  // ランダム能力選手生成
  static generateRandomCharacter(pokemonName: string, pokemonId: number): Player {
    return CharacterGenerationHelpers.createRandomPlayer(pokemonName, pokemonId);
  }
  
  // パワプロ風初期チーム生成（特殊能力付き）
  static generateEnhancedStarterTeam(selectedStarter: string): Player[] {
    const team: Player[] = [];
    
    // キャプテン（御三家、高能力）
    const captain = this.generateEnhancedCharacter(selectedStarter, 1, 15, 'captain', 'B+');
    team.push(captain);
    
    // レギュラー2名（中堅）
    const regulars = [
      { name: 'コラッタ', id: 19 },
      { name: 'ポッポ', id: 16 }
    ];
    regulars.forEach((pokemon, index) => {
      const regular = this.generateEnhancedCharacter(pokemon.name, pokemon.id, 10, 'regular', 'C+');
      team.push(regular);
    });
    
    // 部員3名（新人〜中堅）
    const members = [
      { name: 'キャタピー', id: 10 },
      { name: 'ビードル', id: 13 },
      { name: 'コイキング', id: 129 }
    ];
    members.forEach((pokemon, index) => {
      const level = Math.floor(Math.random() * 8) + 3; // レベル3-10
      const member = this.generateEnhancedCharacter(pokemon.name, pokemon.id, level, 'member');
      team.push(member);
    });
    
    return team;
  }
  
  // プレイヤーの査定情報を表示用文字列として取得
  static getPlayerAssessmentDisplay(player: Player): string {
    return CharacterGenerationHelpers.displayAssessment(player);
  }
  
  // 特殊能力の効果を含む総合能力値取得
  static getEnhancedPlayerStats(player: Player): Player {
    return CharacterGenerationSystem.applyVirtualStats(player);
  }
}