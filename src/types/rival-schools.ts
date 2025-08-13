// ライバル校システムの型定義

export type SchoolType = 
  | 'traditional' // 伝統校（歴史ある強豪）
  | 'emerging'    // 新興校（急成長校）
  | 'technical'   // 技術校（戦術特化）
  | 'power'       // パワー校（物理特化）
  | 'balanced'    // バランス校（総合力）
  | 'specialized' // 特殊校（独特な戦略）
  | 'academy';    // アカデミー校（育成重視）

export type SchoolRank = 
  | 'S++'  // 全国トップクラス（3-5校）
  | 'S+'   // 全国上位（10-15校）
  | 'S'    // 全国レベル（20-30校）
  | 'A+'   // 地方レベル（40-50校）
  | 'A'    // 県レベル（60-80校）
  | 'B+'   // 地区レベル（80-100校）
  | 'B';   // 一般校（残り全て）

export type TacticType = 
  | 'aggressive' 
  | 'defensive' 
  | 'balanced' 
  | 'technical' 
  | 'power' 
  | 'counter';

export type GrowthTrajectory = 'ascending' | 'stable' | 'declining';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
export type CourtType = 'hard' | 'clay' | 'grass' | 'indoor';
export type PopulationDensity = 'high' | 'medium' | 'low';
export type TrainingPhilosophy = 'power' | 'technique' | 'mental' | 'balanced';
export type RivalryType = 'traditional' | 'regional' | 'competitive' | 'historical';

export interface TeamComposition {
  total_members: number;
  singles_players: number;
  doubles_teams: number;
  mixed_doubles: number;
  reserve_players: number;
  average_experience: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  year: number;
  competition_level: string;
  significance: 'major' | 'minor' | 'regional';
}

export interface InjurySituation {
  injured_players: number;
  recovery_weeks: number;
  impact_level: 'low' | 'medium' | 'high';
}

export interface RegionalModifier {
  climate_adjustment: Record<number, number>;
  facility_bonus: number;
  coaching_bonus: number;
  funding_bonus: number;
}

export interface CultureModifier {
  training_efficiency: number;
  team_morale: number;
  competitive_spirit: number;
  regional_pride: number;
}

export interface RivalryRelationship {
  rival_school_id: string;
  rivalry_type: RivalryType;
  strength: number;
  match_history: MatchRecord[];
  special_events: string[];
  next_encounter: Date;
}

export interface MatchRecord {
  match_id: string;
  date: Date;
  result: 'win' | 'loss' | 'draw';
  score: string;
  opponent_tactic: TacticType;
  player_tactic: TacticType;
  special_events: string[];
}

export interface RegionalCharacteristics {
  prefecture: string;
  region: string;
  climate: {
    primary_weather: WeatherType;
    court_preference: CourtType;
    temperature_modifier: number;
  };
  culture: {
    preferred_pokemon_types: string[];
    traditional_tactics: TacticType[];
    training_philosophy: TrainingPhilosophy;
    competitive_spirit: number;
  };
  infrastructure: {
    facility_quality: number;
    coaching_level: number;
    funding_level: number;
    population_density: PopulationDensity;
  };
  signature_pokemon: {
    legendary_ace: string;
    common_choices: string[];
    rare_appearances: string[];
  };
}

export interface RivalSchool {
  id: string;
  name: string;
  prefecture: string;
  region: string;
  type: SchoolType;
  rank: SchoolRank;
  philosophy: string;
  specialty: string[];
  weaknesses: string[];
  signature_tactics: TacticType[];
  ace_pokemon: string;
  preferred_types: string[];
  team_composition: TeamComposition;
  average_level: number;
  current_rating: number;
  historical_achievements: Achievement[];
  rivalry_relationships: RivalryRelationship[];
  growth_trajectory: GrowthTrajectory;
  season_form: number;
  injury_situation: InjurySituation;
  regional_modifiers: RegionalModifier;
  local_culture: CultureModifier;
  school_colors: [string, string];
  mascot: string;
  motto: string;
  founded_year: number;
}
