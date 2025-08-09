// パワプロ風キャラクター生成アルゴリズム - テニス版

import { Player } from '@/types/game';
import { SpecialAbility, TENNIS_SPECIAL_ABILITIES } from '@/types/special-abilities';
import { GameBalanceManager } from './game-balance-manager';

// 査定値計算システム
export interface AssessmentValues {
  base_stats: number;      // 基礎能力査定値
  special_abilities: number; // 特殊能力査定値
  total: number;          // 総合査定値
  star_rating: number;    // 星数（☆1-5）
  rank: PlayerRank;       // ランク（S~G）
}

export type PlayerRank = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'E' | 'F' | 'G';

interface PlayerStats {
  serve_skill: number;
  return_skill: number;
  volley_skill: number;
  stroke_skill: number;
  mental: number;
  stamina: number;
}

export interface EnhancedSpecialAbility extends SpecialAbility {
  virtual_stats: {
    serve_skill?: number;
    return_skill?: number;
    volley_skill?: number;
    stroke_skill?: number;
    mental?: number;
    stamina?: number;
  };
  assessment_value: number; // 査定値
}

// テニス専用特殊能力データベース（査定値付き）
export const ENHANCED_TENNIS_ABILITIES: EnhancedSpecialAbility[] = [
  // 金特級（最高査定）
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'lightning_serve')!,
    virtual_stats: { serve_skill: 25, mental: 10 },
    assessment_value: 120
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'perfect_return')!,
    virtual_stats: { return_skill: 25, mental: 10 },
    assessment_value: 120
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'miracle_volley')!,
    virtual_stats: { volley_skill: 25, mental: 8 },
    assessment_value: 115
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'flame_shot')!,
    virtual_stats: { stroke_skill: 30, stamina: -5 },
    assessment_value: 110
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'ice_control')!,
    virtual_stats: { stroke_skill: 20, mental: 15 },
    assessment_value: 115
  },
  
  // 青特級（中査定）
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'power_serve')!,
    virtual_stats: { serve_skill: 15 },
    assessment_value: 80
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'quick_return')!,
    virtual_stats: { return_skill: 12, stamina: 5 },
    assessment_value: 75
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'net_master')!,
    virtual_stats: { volley_skill: 15 },
    assessment_value: 80
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'baseline_king')!,
    virtual_stats: { stroke_skill: 15, stamina: 5 },
    assessment_value: 85
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'focus_master')!,
    virtual_stats: { mental: 20 },
    assessment_value: 70
  },
  
  // 緑特級（行動特性）
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'rally_fighter')!,
    virtual_stats: { stamina: 10, mental: 8 },
    assessment_value: 60
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'clutch_player')!,
    virtual_stats: { mental: 15, serve_skill: 5 },
    assessment_value: 65
  },
  
  // 赤特級（マイナス査定）
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'glass_heart')!,
    virtual_stats: { mental: -15 },
    assessment_value: -50
  },
  {
    ...TENNIS_SPECIAL_ABILITIES.find(a => a.id === 'stamina_drain')!,
    virtual_stats: { stamina: -20 },
    assessment_value: -60
  }
];

export class CharacterGenerationSystem {
  // 基礎能力値の査定値計算（パワプロ準拠の非線形カーブ）
  static calculateBaseStatAssessment(statValue: number): number {
    if (statValue <= 0) return 0;
    
    // パワプロ風の査定カーブ（高い値ほど効率低下）
    if (statValue <= 50) {
      return statValue * 2.0;       // 低い値は効率良好
    } else if (statValue <= 80) {
      return 100 + (statValue - 50) * 1.5;  // 中間値
    } else if (statValue <= 100) {
      return 145 + (statValue - 80) * 1.0;  // 高値は効率悪化
    } else {
      return 165 + (statValue - 100) * 0.5; // 極値は大幅効率低下
    }
  }
  
  // 全基礎能力の総査定値計算
  static calculateTotalBaseAssessment(player: Player): number {
    const serve = this.calculateBaseStatAssessment(player.serve_skill || 0);
    const returnStat = this.calculateBaseStatAssessment(player.return_skill || 0);
    const volley = this.calculateBaseStatAssessment(player.volley_skill || 0);
    const stroke = this.calculateBaseStatAssessment(player.stroke_skill || 0);
    const mental = this.calculateBaseStatAssessment(player.mental || 0);
    const stamina = this.calculateBaseStatAssessment(player.stamina || 0);
    
    return serve + returnStat + volley + stroke + mental + stamina;
  }
  
  // 特殊能力の総査定値計算
  static calculateSpecialAbilitiesAssessment(abilities: SpecialAbility[]): number {
    if (!abilities || abilities.length === 0) return 0;
    
    return abilities.reduce((total, ability) => {
      const enhanced = ENHANCED_TENNIS_ABILITIES.find(ea => ea.id === ability.id);
      return total + (enhanced?.assessment_value || 0);
    }, 0);
  }
  
  // 総合査定値から星数に変換
  static calculateStarRating(totalAssessment: number): number {
    if (totalAssessment < 200) return 1;      // ☆1
    if (totalAssessment < 400) return 2;      // ☆2
    if (totalAssessment < 600) return 3;      // ☆3
    if (totalAssessment < 800) return 4;      // ☆4
    return 5;                                 // ☆5
  }
  
  // 総合査定値からランク判定
  static calculatePlayerRank(totalAssessment: number): PlayerRank {
    if (totalAssessment >= 900) return 'S+';
    if (totalAssessment >= 800) return 'S';
    if (totalAssessment >= 750) return 'A+';
    if (totalAssessment >= 700) return 'A';
    if (totalAssessment >= 650) return 'B+';
    if (totalAssessment >= 600) return 'B';
    if (totalAssessment >= 550) return 'C+';
    if (totalAssessment >= 500) return 'C';
    if (totalAssessment >= 450) return 'D+';
    if (totalAssessment >= 400) return 'D';
    if (totalAssessment >= 300) return 'E';
    if (totalAssessment >= 200) return 'F';
    return 'G';
  }
  
  // プレイヤーの総合査定計算
  static assessPlayer(player: Player): AssessmentValues {
    const baseStats = this.calculateTotalBaseAssessment(player);
    const specialAbilities = this.calculateSpecialAbilitiesAssessment(player.special_abilities || []);
    const total = baseStats + specialAbilities;
    
    return {
      base_stats: baseStats,
      special_abilities: specialAbilities,
      total: total,
      star_rating: this.calculateStarRating(total),
      rank: this.calculatePlayerRank(total)
    };
  }
  
  // 特殊能力をランダム生成（査定を考慮）
  static generateRandomSpecialAbilities(
    level: number,
    position: Player['position'],
    targetAssessment?: number
  ): SpecialAbility[] {
    const abilities: SpecialAbility[] = [];
    
    // ポジションによる基本確率
    const baseChance = {
      'captain': 0.9,       // キャプテンは90%
      'vice_captain': 0.7,  // 副キャプテンは70%
      'regular': 0.5,       // レギュラーは50%
      'member': 0.3         // 部員は30%
    }[position];
    
    // レベル補正
    const levelBonus = Math.min(level * 0.03, 0.4);
    let finalChance = Math.min(baseChance + levelBonus, 0.95);
    
    // 金特の確率（レベルとポジション依存）
    const goldChance = Math.max(0, (level - 10) * 0.02 + (position === 'captain' ? 0.2 : 0.1));
    
    // 最大3つまで特殊能力を付与
    const maxAbilities = Math.min(3, Math.floor(level / 5) + 1);
    
    for (let i = 0; i < maxAbilities && Math.random() < finalChance; i++) {
      let candidateAbilities = [...ENHANCED_TENNIS_ABILITIES];
      
      // 既に持っている能力は除外
      candidateAbilities = candidateAbilities.filter(ability => 
        !abilities.some(existing => existing.id === ability.id)
      );
      
      if (candidateAbilities.length === 0) break;
      
      // 査定レベルによる絞り込み
      if (Math.random() < goldChance && level >= 15) {
        // 金特級を狙う
        const goldAbilities = candidateAbilities.filter(a => a.assessment_value >= 100);
        if (goldAbilities.length > 0) {
          candidateAbilities = goldAbilities;
        }
      } else if (Math.random() < 0.8) {
        // 青特級を優先
        const blueAbilities = candidateAbilities.filter(a => 
          a.assessment_value >= 60 && a.assessment_value < 100
        );
        if (blueAbilities.length > 0) {
          candidateAbilities = blueAbilities;
        }
      }
      
      // 赤特（ネガティブ）の確率制限
      const negativeChance = Math.max(0.02, 0.15 - level * 0.005);
      if (Math.random() > negativeChance) {
        candidateAbilities = candidateAbilities.filter(a => a.assessment_value >= 0);
      }
      
      // ランダム選択
      const selectedAbility = candidateAbilities[Math.floor(Math.random() * candidateAbilities.length)];
      abilities.push({
        ...selectedAbility,
        isActive: true
      });
      
      // 次の能力の確率を下げる
      finalChance *= 0.6;
    }
    
    return abilities;
  }
  
  // バランス調整済みキャラクター生成
  static generateBalancedCharacter(
    pokemonName: string,
    pokemonId: number,
    level: number,
    position: Player['position'],
    targetRank?: PlayerRank
  ): Player {
    // 基本ステータス生成
    const roleMapping = {
      'captain': 'ace' as const,
      'vice_captain': 'ace' as const,  
      'regular': 'regular' as const,
      'member': 'member' as const
    };
    
    const role = roleMapping[position];
    const baseStats = GameBalanceManager.generateBalancedInitialStats(role);
    
    // レベル補正
    const levelMultiplier = 1 + (level - 1) * 0.1;
    let adjustedStats = {
      serve_skill: Math.floor(baseStats.serve_skill * levelMultiplier),
      return_skill: Math.floor(baseStats.return_skill * levelMultiplier),
      volley_skill: Math.floor(baseStats.volley_skill * levelMultiplier),
      stroke_skill: Math.floor(baseStats.stroke_skill * levelMultiplier),
      mental: Math.floor(baseStats.mental * levelMultiplier),
      stamina: Math.floor(baseStats.stamina * levelMultiplier)
    };
    
    // 目標ランクがある場合は調整
    if (targetRank) {
      const targetAssessment = this.getTargetAssessmentForRank(targetRank);
      adjustedStats = this.adjustStatsForTargetAssessment(adjustedStats, targetAssessment);
    }
    
    // 特殊能力生成
    const specialAbilities = this.generateRandomSpecialAbilities(level, position);
    
    // プレイヤー作成
    const player: any = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemonName,
      pokemon_id: pokemonId,
      level: level,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position: position,
      
      ...adjustedStats,
      
      condition: level >= 20 ? 'excellent' : level >= 10 ? 'good' : 'normal',
      motivation: Math.floor(Math.random() * 20) + 80,
      experience: level * 100,
      
      matches_played: 0,
      matches_won: 0,
      sets_won: 0,
      sets_lost: 0,
      
      types: ['normal'],
      special_abilities: specialAbilities
    };
    
    return player;
  }
  
  // ランク別目標査定値
  private static getTargetAssessmentForRank(rank: PlayerRank): number {
    const rankValues = {
      'S+': 900, 'S': 800, 'A+': 750, 'A': 700,
      'B+': 650, 'B': 600, 'C+': 550, 'C': 500,
      'D+': 450, 'D': 400, 'E': 300, 'F': 200, 'G': 100
    };
    return rankValues[rank];
  }
  
  // 目標査定値に向けた能力調整
  private static adjustStatsForTargetAssessment(
    stats: PlayerStats,
    targetAssessment: number
  ): PlayerStats {
    const currentAssessment = this.calculateTotalBaseAssessment({ ...stats } as Player);
    const difference = targetAssessment - currentAssessment;
    
    if (Math.abs(difference) > 50) {
      const adjustment = difference / 6; // 6つの能力値に分散
      
      stats.serve_skill = Math.max(1, stats.serve_skill + Math.floor(adjustment * 0.8));
      stats.return_skill = Math.max(1, stats.return_skill + Math.floor(adjustment * 0.8));
      stats.volley_skill = Math.max(1, stats.volley_skill + Math.floor(adjustment * 0.7));
      stats.stroke_skill = Math.max(1, stats.stroke_skill + Math.floor(adjustment * 0.8));
      stats.mental = Math.max(1, stats.mental + Math.floor(adjustment * 0.6));
      stats.stamina = Math.max(1, stats.stamina + Math.floor(adjustment * 0.5));
    }
    
    return stats;
  }
  
  // 特殊能力の仮想能力値を基本能力値に反映
  static applyVirtualStats(player: Player): Player {
    if (!player.special_abilities || player.special_abilities.length === 0) {
      return player;
    }
    
    const virtualBonus = {
      serve_skill: 0,
      return_skill: 0,
      volley_skill: 0,
      stroke_skill: 0,
      mental: 0,
      stamina: 0
    };
    
    player.special_abilities.forEach(ability => {
      const enhanced = ENHANCED_TENNIS_ABILITIES.find(ea => ea.id === ability.id);
      if (enhanced?.virtual_stats) {
        Object.entries(enhanced.virtual_stats).forEach(([stat, value]) => {
          if (value) {
            virtualBonus[stat as keyof typeof virtualBonus] += value;
          }
        });
      }
    });
    
    return {
      ...player,
      serve_skill: (player.serve_skill || 0) + virtualBonus.serve_skill,
      return_skill: (player.return_skill || 0) + virtualBonus.return_skill,
      volley_skill: (player.volley_skill || 0) + virtualBonus.volley_skill,
      stroke_skill: (player.stroke_skill || 0) + virtualBonus.stroke_skill,
      mental: (player.mental || 0) + virtualBonus.mental,
      stamina: (player.stamina || 0) + virtualBonus.stamina
    };
  }
}

// 使いやすいヘルパー関数
export const CharacterGenerationHelpers = {
  // S+ランク選手生成
  createSPlusPlayer: (pokemonName: string, pokemonId: number, level: number = 50) => 
    CharacterGenerationSystem.generateBalancedCharacter(pokemonName, pokemonId, level, 'captain', 'S+'),
  
  // 新人選手生成  
  createRookiePlayer: (pokemonName: string, pokemonId: number) =>
    CharacterGenerationSystem.generateBalancedCharacter(pokemonName, pokemonId, 1, 'member'),
  
  // ランダム選手生成
  createRandomPlayer: (pokemonName: string, pokemonId: number) => {
    const level = Math.floor(Math.random() * 20) + 1;
    const positions: Player['position'][] = ['captain', 'regular', 'member'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    return CharacterGenerationSystem.generateBalancedCharacter(pokemonName, pokemonId, level, position);
  },
  
  // 査定情報表示
  displayAssessment: (player: Player): string => {
    const assessment = CharacterGenerationSystem.assessPlayer(player);
    return `${assessment.rank} (☆${assessment.star_rating}) - 査定値: ${assessment.total}`;
  }
};