// ポケモン進化システムの型定義

export interface EvolutionRequirement {
  type: 'level' | 'stone' | 'trade' | 'friendship' | 'time' | 'stats' | 'special';
  value?: number | string;
  description: string;
}

export interface EvolutionPath {
  from: string;           // 進化前ポケモン名
  to: string;             // 進化後ポケモン名
  requirements: EvolutionRequirement[];
  canEvolve: boolean;     // 現在進化可能かどうか
}

export interface EvolutionChain {
  species: string;        // 基本種族名
  stages: {
    stage: number;        // 進化段階（1, 2, 3）
    pokemon: string;      // ポケモン名
    level_requirement?: number;
    evolution_paths?: EvolutionPath[];
  }[];
}

export interface EvolutionResult {
  success: boolean;
  newPokemon?: import('./game').Player;
  message: string;
  animation?: 'default' | 'stone' | 'trade' | 'special';
}

// 進化条件の評価結果
export interface EvolutionEvaluation {
  canEvolve: boolean;
  paths: EvolutionPath[];
  blockers: string[];     // 進化できない理由
}