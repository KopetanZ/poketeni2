/**
 * 統合マッチシステム - 型定義
 * 全マッチエンジンで使用される共通型とインターフェース
 */

import { Player } from '@/types/game';
import { PokemonStats } from '@/types/pokemon-stats';
import { SpecialAbility } from '@/types/special-abilities';
import { PlayerEquipment } from '@/types/items';

// ===== 基本型定義 =====

export type MatchMode = 
  | 'basic'       // 基本システム（高速・シンプル）
  | 'advanced'    // 高度システム（詳細・自動）
  | 'interactive' // インタラクティブ（栄冠ナイン風）
  | 'debug';      // デバッグモード

export type MatchFormat = 
  | 'single_set'     // 1セットマッチ
  | 'best_of_3'      // 3セットマッチ（2セット先取）
  | 'team_match';    // 団体戦（5試合）

export type TacticType = 
  | 'aggressive' // アグレッシブ: サーブ・ボレー重視
  | 'defensive' // 守備的: リターン・ストローク重視  
  | 'balanced' // バランス: 全能力均等
  | 'technical' // 技巧的: ボレー・メンタル重視
  | 'power' // パワー型: サーブ・ストローク重視
  | 'counter'; // カウンター: リターン・メンタル重視

// ===== プレイヤー関連 =====

export interface EnhancedPlayer extends Player {
  // 装備効果
  equipment?: PlayerEquipment;
  equipment_effects?: EquipmentEffects;
  
  // 試合中の状態
  current_stamina?: number;
  current_mental?: number;
  tactic?: TacticType;
  
  // AI設定（CPU用）
  ai_personality?: 'aggressive' | 'defensive' | 'balanced' | 'unpredictable';
}

export interface EquipmentEffects {
  serve_skill_bonus: number;
  return_skill_bonus: number;
  volley_skill_bonus: number;
  stroke_skill_bonus: number;
  mental_bonus: number;
  stamina_bonus: number;
  experience_boost: number;
  special_abilities: string[];
}

// ===== 試合環境・コンテキスト =====

export interface MatchEnvironment {
  weather: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  court_surface: 'hard' | 'clay' | 'grass' | 'indoor';
  pressure_level: number; // 0-100
  tournament_level: 'practice' | 'prefectural' | 'regional' | 'national';
}

export interface MatchContext extends MatchEnvironment {
  rally_count: number;
  set_score: { home: number; away: number };
  game_score: { home: number; away: number };
  
  // 緊急指示システム
  emergency_instruction?: EmergencyInstruction;
  
  // インタラクティブ要素
  momentum?: number; // -100 ~ +100
  home_stamina_percentage?: number; // 0-100
  away_stamina_percentage?: number; // 0-100
}

export interface EmergencyInstruction {
  type: TacticType;
  effect_duration: number;
  remaining_effects: number;
  bonus_multiplier: number;
  critical_bonus: number;
  pressure_reduction: number;
}

// ===== ポイント・試合結果 =====

export interface MatchPoint {
  type: 'serve' | 'return' | 'volley' | 'stroke' | 'mental';
  
  // 基本計算
  home_skill: number;
  away_skill: number;
  home_roll: number;
  away_roll: number;
  
  // 詳細計算（advanced用）
  home_base_skill?: number;
  away_base_skill?: number;
  home_ability_bonus?: number;
  away_ability_bonus?: number;
  home_special_ability_bonus?: number;
  away_special_ability_bonus?: number;
  home_tactic_bonus?: number;
  away_tactic_bonus?: number;
  home_condition_modifier?: number;
  away_condition_modifier?: number;
  
  winner: 'home' | 'away';
  description: string;
  is_critical?: boolean;
  is_error?: boolean;
}

export interface GameResult {
  home_score: number;
  away_score: number;
  winner: 'home' | 'away';
  points: MatchPoint[];
  duration_minutes?: number;
}

export interface SetResult extends GameResult {
  games: GameResult[];
  home_performance: PerformanceStats;
  away_performance: PerformanceStats;
}

export interface MatchResult {
  winner: 'home' | 'away';
  sets: SetResult[];
  final_score: { home: number; away: number };
  match_duration_minutes: number;
  mvp?: 'home' | 'away';
  total_home_performance: PerformanceStats;
  total_away_performance: PerformanceStats;
}

export interface PerformanceStats {
  serve_success: number;
  return_success: number;
  volley_success: number;
  stroke_success: number;
  mental_success: number;
  total_points: number;
  critical_hits?: number;
  errors?: number;
  winner_shots?: number;
}

// ===== インタラクティブシステム =====

export type MatchSituation = 
  | 'serve'           // サーブ権を持つ
  | 'return'          // リターンする
  | 'rally'           // ラリー中
  | 'break_point'     // ブレークポイント
  | 'set_point'       // セットポイント 
  | 'match_point'     // マッチポイント
  | 'pressure'        // プレッシャー場面
  | 'injury_concern'  // 怪我の心配
  | 'momentum_shift'  // 流れが変わった
  | 'timeout_needed'  // タイムアウト推奨
  | 'behind'          // 劣勢
  | 'leading'         // 優勢
  | 'any';            // いつでも使用可能

export type UserChoice = 
  | 'aggressive'      // 積極的に行け
  | 'defensive'       // 守備的に行け
  | 'maintain'        // 現状維持
  | 'mental'          // メンタル重視
  | 'special_move'    // 特殊作戦
  | 'change_tactic'   // 戦術変更
  | 'timeout'         // タイムアウト
  | 'substitution'    // 選手交代
  | 'encourage'       // 激励する
  | 'calm_down'       // 冷静にさせる
  | 'pressure_on';    // プレッシャーをかける

export interface MatchChoice {
  id: string;
  label: string;
  description: string;
  choice: UserChoice;
  available_situations: MatchSituation[];
  effect: InstructionEffect;
  stamina_cost?: number;
  cooldown?: number;
}

export interface InstructionEffect {
  skillModifier: number;        // 能力値修正 (-20 ~ +20)
  mentalEffect: number;         // 精神状態修正 (-10 ~ +15)
  staminaEffect: number;        // スタミナ効果 (-5 ~ +5)
  criticalRate: number;         // クリティカル率修正 (0 ~ 0.3)
  errorRate: number;            // エラー率修正 (-0.2 ~ 0.2)
  momentumEffect: number;       // 勢い効果 (-10 ~ +15)
  duration: number;             // 効果持続ポイント数 (1~5)
  description: string;          // 効果説明
}

// ===== 設定・構成 =====

export interface MatchConfig {
  mode: MatchMode;
  format: MatchFormat;
  
  // プレイヤー
  homePlayer: EnhancedPlayer;
  awayPlayer: EnhancedPlayer;
  
  // 戦術
  homeTactic?: TacticType;
  awayTactic?: TacticType;
  
  // 環境
  environment?: MatchEnvironment;
  
  // インタラクティブ設定
  interactiveConfig?: InteractiveConfig;
  
  // デバッグ設定
  debugConfig?: DebugConfig;
}

export interface InteractiveConfig {
  enableUserChoices: boolean;
  enableRealTimeUpdates: boolean;
  choiceTimeoutMs?: number;
  enableMomentumSystem: boolean;
  enableStaminaSystem: boolean;
}

export interface DebugConfig {
  enableDetailedLogging: boolean;
  enableStepByStep: boolean;
  logLevel: 'minimal' | 'normal' | 'verbose';
}

// ===== イベント・ステート =====

export interface MatchEvent {
  id: string;
  type: 'point_won' | 'game_won' | 'set_won' | 'match_won' | 
        'special_ability' | 'critical_hit' | 'error' | 'momentum_shift' |
        'user_choice' | 'tactic_change' | 'injury' | 'weather_change';
  player: 'home' | 'away';
  description: string;
  timestamp: number;
  data?: any;
}

export interface InteractiveMatchState {
  // 基本状態
  homeScore: number;
  awayScore: number;
  currentServer: 'home' | 'away';
  
  // インタラクティブ要素
  momentum: number; // -100 (away有利) ~ +100 (home有利)
  pressure: number; // 0-100
  situation: MatchSituation;
  
  // 選択肢
  availableChoices: MatchChoice[];
  lastChoice?: UserChoice;
  lastChoiceEffect?: InstructionEffect;
  
  // 統計
  ralliesWon: { home: number; away: number };
  timeouts: { home: number; away: number };
}

// ===== 統計・分析 =====

export interface MatchStatistics {
  totalPoints: { home: number; away: number };
  skillBreakdown: {
    serve: { home: number; away: number };
    return: { home: number; away: number };
    volley: { home: number; away: number };
    stroke: { home: number; away: number };
    mental: { home: number; away: number };
  };
  specialEvents: {
    criticalHits: { home: number; away: number };
    errors: { home: number; away: number };
    specialAbilities: { home: number; away: number };
  };
  momentum: {
    shifts: number;
    maxMomentum: { home: number; away: number };
  };
}