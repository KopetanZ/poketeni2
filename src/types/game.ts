// ゲーム基本型定義

import { PokemonStats } from './pokemon-stats';
import { SpecialAbility } from './special-abilities';

// PokeAPI関連型定義
export interface PokemonDetails {
  id: number;
  name: string;
  englishName: string;
  types: string[];
  sprites: {
    default: string;
    shiny: string;
    official: string;
    home: string;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  height: number;
  weight: number;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  names: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
}

// 日付管理 - 単一の真実の情報源
export interface GameDate {
  year: number;
  month: number;
  day: number;
}

// 性格システム（栄冠ナイン風）
export type PersonalityType = 'aggressive' | 'technical' | 'stamina' | 'genius' | 'hardworker' | 'cheerful' | 'shy' | 'leader';

// 世代交代システムのための進路
export type CareerPath = 'professional' | 'university' | 'employment' | 'retired';

// 覚醒システム
export interface AwakeningData {
  isEligible: boolean; // 覚醒対象かどうか（入学時平均40以下）
  hasAwakened: boolean; // 既に覚醒済みか
  awakeningChance: number; // 現在の覚醒確率
  matchesPlayed: number; // レギュラー出場試合数
}

// ポケモンテニス選手
export interface Player {
  id: string;
  pokemon_name: string;
  pokemon_id: number;
  level: number;
  grade: 1 | 2 | 3;
  position: 'captain' | 'vice_captain' | 'regular' | 'member';
  
  // テニススキル（個体値システムから計算）
  serve_skill: number;
  return_skill: number;
  volley_skill: number;
  stroke_skill: number;
  mental: number;
  stamina: number;
  
  // 状態
  condition: 'excellent' | 'good' | 'normal' | 'poor' | 'terrible';
  motivation: number;
  experience: number;
  
  // 戦績（オプション）
  matches_played?: number;
  matches_won?: number;
  sets_won?: number;
  sets_lost?: number;
  
  // ポケモン固有
  types?: string[];

  // 新しい個体値システム統合
  pokemon_stats?: PokemonStats;
  
  // 特殊能力システム
  special_abilities?: SpecialAbility[];

  // 世代交代システム追加要素
  enrollmentYear: number; // 入学年度（1年生の時の年度）
  personality: PersonalityType; // 性格
  initialStats: { // 入学時の初期能力値（覚醒判定用）
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
    average: number; // 平均値
  };
  
  // 覚醒システム
  awakening?: AwakeningData;
  
  // 卒業・進路関連
  graduationYear?: number; // 卒業予定年度
  careerPath?: CareerPath; // 卒業後の進路
  isGraduated?: boolean; // 卒業済みフラグ
}

// 学校
export interface School {
  id: string;
  user_id: string;
  name: string;
  reputation: number;
  funds: number;
  
  // 単一の日付管理
  current_year: number;
  current_month: number;
  current_day: number;
}

// カードシステム
export interface TrainingCard {
  id: string;
  name: string;
  type: 'training' | 'special' | 'event';
  number: number; // 進行日数
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  
  // 効果
  trainingEffects: {
    serve?: number;
    return?: number;
    volley?: number;
    stroke?: number;
    mental?: number;
    stamina?: number;
  };
  
  specialEffects?: {
    conditionRecovery?: number;
    trustIncrease?: number;
    practiceEfficiencyBoost?: number;
    teamMoraleBoost?: boolean;
  };
}

// 新入生候補（スカウト対象）
export interface NewStudentCandidate {
  id: string;
  pokemon_name: string;
  pokemon_id: number;
  potential: 'genius' | 'talented' | 'normal' | 'underdog';
  personality: PersonalityType;
  baseStats: {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  };
  specialAbilities: SpecialAbility[];
  scoutingCost: number;
  competitorSchools: string[];
  acquisitionChance: number;
}

// 卒業生記録（永続データ）
export interface GraduatedPlayer {
  player: Player;
  graduationDate: GameDate;
  finalStats: {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  };
  achievements: string[];
  careerPath: CareerPath;
  schoolReputation: number; // 卒業時の学校評判
}

// 学校歴史記録（永続データ）
export interface SchoolHistory {
  year: number;
  finalReputation: number;
  tournamentResults: {
    tournament: string;
    result: 'champion' | 'finalist' | 'semifinal' | 'quarterfinal' | 'eliminated';
    date: GameDate;
  }[];
  graduatedPlayers: GraduatedPlayer[];
  specialAchievements: string[];
}

// 世代交代システム
export interface GenerationSystem {
  currentYear: number;
  academicCalendar: {
    graduationDate: GameDate; // 3月15日固定
    enrollmentDate: GameDate; // 4月10日固定
    scoutingPeriod: {
      start: GameDate;
      end: GameDate;
    };
  };
  graduationCandidates: Player[];
  scoutingPool: NewStudentCandidate[];
  schoolHistory: SchoolHistory[]; // 永続記録
}

// ゲーム進行状態
export interface GameState {
  school: School;
  players: Player[];
  hand_cards: TrainingCard[];
  current_date: GameDate;
  generation: GenerationSystem; // 世代交代システム追加
}