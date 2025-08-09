// ポケモン進化システム（テニス部管理ゲーム用）

import { Player } from '@/types/game';
import { EvolutionChain, EvolutionPath, EvolutionRequirement, EvolutionResult, EvolutionEvaluation } from '@/types/evolution';
import { PokemonAPI } from './pokemon-api';
import { PlayerGenerator } from './player-generator';

export class EvolutionSystem {
  // 進化チェーンデータ（主要なポケモンの進化パス）
  private static readonly EVOLUTION_CHAINS: EvolutionChain[] = [
    // 第1世代御三家
    {
      species: 'フシギダネ系',
      stages: [
        { stage: 1, pokemon: 'フシギダネ', level_requirement: 1 },
        { stage: 2, pokemon: 'フシギソウ', level_requirement: 16 },
        { stage: 3, pokemon: 'フシギバナ', level_requirement: 32 }
      ]
    },
    {
      species: 'ヒトカゲ系', 
      stages: [
        { stage: 1, pokemon: 'ヒトカゲ', level_requirement: 1 },
        { stage: 2, pokemon: 'リザード', level_requirement: 16 },
        { stage: 3, pokemon: 'リザードン', level_requirement: 36 }
      ]
    },
    {
      species: 'ゼニガメ系',
      stages: [
        { stage: 1, pokemon: 'ゼニガメ', level_requirement: 1 },
        { stage: 2, pokemon: 'カメール', level_requirement: 16 },
        { stage: 3, pokemon: 'カメックス', level_requirement: 36 }
      ]
    },

    // 序盤ポケモン進化
    {
      species: 'ポッポ系',
      stages: [
        { stage: 1, pokemon: 'ポッポ', level_requirement: 1 },
        { stage: 2, pokemon: 'ピジョン', level_requirement: 18 },
        { stage: 3, pokemon: 'ピジョット', level_requirement: 36 }
      ]
    },
    {
      species: 'コラッタ系',
      stages: [
        { stage: 1, pokemon: 'コラッタ', level_requirement: 1 },
        { stage: 2, pokemon: 'ラッタ', level_requirement: 20 }
      ]
    },
    {
      species: 'キャタピー系',
      stages: [
        { stage: 1, pokemon: 'キャタピー', level_requirement: 1 },
        { stage: 2, pokemon: 'トランセル', level_requirement: 7 },
        { stage: 3, pokemon: 'バタフリー', level_requirement: 10 }
      ]
    },
    {
      species: 'ビードル系',
      stages: [
        { stage: 1, pokemon: 'ビードル', level_requirement: 1 },
        { stage: 2, pokemon: 'コクーン', level_requirement: 7 },
        { stage: 3, pokemon: 'スピアー', level_requirement: 10 }
      ]
    },
    {
      species: 'コイキング系',
      stages: [
        { stage: 1, pokemon: 'コイキング', level_requirement: 1 },
        { stage: 2, pokemon: 'ギャラドス', level_requirement: 20 }
      ]
    },

    // 第2世代御三家
    {
      species: 'チコリータ系',
      stages: [
        { stage: 1, pokemon: 'チコリータ', level_requirement: 1 },
        { stage: 2, pokemon: 'ベイリーフ', level_requirement: 16 },
        { stage: 3, pokemon: 'メガニウム', level_requirement: 32 }
      ]
    },
    {
      species: 'ヒノアラシ系',
      stages: [
        { stage: 1, pokemon: 'ヒノアラシ', level_requirement: 1 },
        { stage: 2, pokemon: 'マグマラシ', level_requirement: 14 },
        { stage: 3, pokemon: 'バクフーン', level_requirement: 36 }
      ]
    },
    {
      species: 'ワニノコ系',
      stages: [
        { stage: 1, pokemon: 'ワニノコ', level_requirement: 1 },
        { stage: 2, pokemon: 'アリゲイツ', level_requirement: 18 },
        { stage: 3, pokemon: 'オーダイル', level_requirement: 30 }
      ]
    },

    // 第3世代御三家
    {
      species: 'キモリ系',
      stages: [
        { stage: 1, pokemon: 'キモリ', level_requirement: 1 },
        { stage: 2, pokemon: 'ジュプトル', level_requirement: 16 },
        { stage: 3, pokemon: 'ジュカイン', level_requirement: 36 }
      ]
    },
    {
      species: 'アチャモ系',
      stages: [
        { stage: 1, pokemon: 'アチャモ', level_requirement: 1 },
        { stage: 2, pokemon: 'ワカシャモ', level_requirement: 16 },
        { stage: 3, pokemon: 'バシャーモ', level_requirement: 36 }
      ]
    },
    {
      species: 'ミズゴロウ系',
      stages: [
        { stage: 1, pokemon: 'ミズゴロウ', level_requirement: 1 },
        { stage: 2, pokemon: 'ヌマクロー', level_requirement: 16 },
        { stage: 3, pokemon: 'ラグラージ', level_requirement: 36 }
      ]
    },

    // その他人気ポケモン
    {
      species: 'ズバット系',
      stages: [
        { stage: 1, pokemon: 'ズバット', level_requirement: 1 },
        { stage: 2, pokemon: 'ゴルバット', level_requirement: 22 },
        { stage: 3, pokemon: 'クロバット', level_requirement: 25 } // 第2世代で追加、なつき度必要
      ]
    },
    {
      species: 'ナゾノクサ系',
      stages: [
        { stage: 1, pokemon: 'ナゾノクサ', level_requirement: 1 },
        { stage: 2, pokemon: 'クサイハナ', level_requirement: 21 },
        { stage: 3, pokemon: 'ラフレシア', level_requirement: 1 } // リーフのいし使用
      ]
    }
  ];

  // ポケモンの進化可能性をチェック
  static canEvolve(player: Player): EvolutionEvaluation {
    const evolutionChain = this.findEvolutionChain(player.pokemon_name);
    
    if (!evolutionChain) {
      return {
        canEvolve: false,
        paths: [],
        blockers: ['このポケモンは進化しません']
      };
    }

    const currentStage = this.getCurrentStage(evolutionChain, player.pokemon_name);
    if (!currentStage || currentStage.stage >= evolutionChain.stages.length) {
      return {
        canEvolve: false,
        paths: [],
        blockers: ['既に最終進化です']
      };
    }

    const nextStage = evolutionChain.stages[currentStage.stage]; // 0-indexedなので+1しない
    if (!nextStage) {
      return {
        canEvolve: false,
        paths: [],
        blockers: ['次の進化段階が見つかりません']
      };
    }

    const blockers: string[] = [];
    const paths: EvolutionPath[] = [];

    // レベル条件チェック
    if (nextStage.level_requirement && player.level < nextStage.level_requirement) {
      blockers.push(`レベル${nextStage.level_requirement}が必要です（現在: ${player.level}）`);
    }

    // 進化可能な場合のパスを作成
    if (blockers.length === 0) {
      paths.push({
        from: player.pokemon_name,
        to: nextStage.pokemon,
        requirements: [
          {
            type: 'level',
            value: nextStage.level_requirement,
            description: `レベル${nextStage.level_requirement}に到達`
          }
        ],
        canEvolve: true
      });
    }

    return {
      canEvolve: blockers.length === 0,
      paths,
      blockers
    };
  }

  // ポケモンを進化させる
  static async evolvePlayer(player: Player): Promise<EvolutionResult> {
    const evaluation = this.canEvolve(player);
    
    if (!evaluation.canEvolve) {
      return {
        success: false,
        message: evaluation.blockers.join('、')
      };
    }

    const evolutionPath = evaluation.paths[0];
    if (!evolutionPath) {
      return {
        success: false,
        message: '進化パスが見つかりません'
      };
    }

    try {
      // 進化後のポケモン詳細を取得
      const evolvedPokemonDetail = await PokemonAPI.getPokemonDetails(evolutionPath.to);
      
      // 進化後のプレイヤーを作成
      const evolvedPlayer = PlayerGenerator.createPlayerFromPokemonDetail(
        evolvedPokemonDetail, 
        player.position
      );

      // 元のプレイヤーのデータを継承
      evolvedPlayer.id = player.id;
      evolvedPlayer.level = player.level;
      evolvedPlayer.grade = player.grade;
      evolvedPlayer.experience = player.experience;
      evolvedPlayer.matches_played = player.matches_played;
      evolvedPlayer.matches_won = player.matches_won;
      evolvedPlayer.sets_won = player.sets_won;
      evolvedPlayer.sets_lost = player.sets_lost;
      
      // 進化ボーナス（能力値上昇）
      const evolutionBonus = this.calculateEvolutionBonus(player, evolvedPlayer);
      evolvedPlayer.serve_skill = Math.min(100, evolvedPlayer.serve_skill + evolutionBonus.serve);
      evolvedPlayer.return_skill = Math.min(100, evolvedPlayer.return_skill + evolutionBonus.return);
      evolvedPlayer.volley_skill = Math.min(100, evolvedPlayer.volley_skill + evolutionBonus.volley);
      evolvedPlayer.stroke_skill = Math.min(100, evolvedPlayer.stroke_skill + evolutionBonus.stroke);
      evolvedPlayer.mental = Math.min(100, evolvedPlayer.mental + evolutionBonus.mental);
      evolvedPlayer.stamina = Math.min(100, evolvedPlayer.stamina + evolutionBonus.stamina);

      // 特殊能力継承 + 進化による新規習得チャンス
      evolvedPlayer.special_abilities = [
        ...(player.special_abilities || []),
        ...PlayerGenerator.generateSpecialAbilities(evolvedPlayer.level, evolvedPlayer.position)
      ];

      // コンディション向上
      if (player.condition !== 'excellent') {
        const conditionUpgrade = ['terrible', 'poor', 'normal', 'good', 'excellent'];
        const currentIndex = conditionUpgrade.indexOf(player.condition);
        const newIndex = Math.min(currentIndex + 1, conditionUpgrade.length - 1);
        evolvedPlayer.condition = conditionUpgrade[newIndex] as Player['condition'];
      }

      return {
        success: true,
        newPokemon: evolvedPlayer,
        message: `${player.pokemon_name}が${evolutionPath.to}に進化しました！`,
        animation: 'default'
      };

    } catch (error) {
      console.error('Evolution failed:', error);
      return {
        success: false,
        message: '進化中にエラーが発生しました'
      };
    }
  }

  // 進化チェーンを検索
  private static findEvolutionChain(pokemonName: string): EvolutionChain | null {
    return this.EVOLUTION_CHAINS.find(chain => 
      chain.stages.some(stage => stage.pokemon === pokemonName)
    ) || null;
  }

  // 現在の進化段階を取得
  private static getCurrentStage(chain: EvolutionChain, pokemonName: string) {
    return chain.stages.find(stage => stage.pokemon === pokemonName) || null;
  }

  // 進化ボーナス計算
  private static calculateEvolutionBonus(
    originalPlayer: Player, 
    evolvedPlayer: Player
  ): { [key: string]: number } {
    // 基本ボーナス（進化段階による）
    const baseBonus = 10;
    
    // ランダム要素（5-15の範囲）
    const randomBonus = () => Math.floor(Math.random() * 11) + 5;

    return {
      serve: baseBonus + randomBonus(),
      return: baseBonus + randomBonus(), 
      volley: baseBonus + randomBonus(),
      stroke: baseBonus + randomBonus(),
      mental: baseBonus + randomBonus(),
      stamina: baseBonus + randomBonus()
    };
  }

  // 進化可能なプレイヤーを取得
  static getEvolvablePlayers(players: Player[]): Player[] {
    return players.filter(player => this.canEvolve(player).canEvolve);
  }

  // 進化予定表を取得（育成計画用）
  static getEvolutionPlan(player: Player): { stage: number; pokemon: string; level: number }[] {
    const chain = this.findEvolutionChain(player.pokemon_name);
    if (!chain) return [];

    const currentStage = this.getCurrentStage(chain, player.pokemon_name);
    if (!currentStage) return [];

    return chain.stages
      .filter(stage => stage.stage > currentStage.stage)
      .map(stage => ({
        stage: stage.stage,
        pokemon: stage.pokemon,
        level: stage.level_requirement || 1
      }));
  }

  // 全体統計
  static getEvolutionStatistics(players: Player[]): {
    total: number;
    canEvolve: number;
    maxLevel: number;
    averageLevel: number;
  } {
    const evolvable = this.getEvolvablePlayers(players);
    const levels = players.map(p => p.level);

    return {
      total: players.length,
      canEvolve: evolvable.length,
      maxLevel: Math.max(...levels),
      averageLevel: Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length)
    };
  }
}