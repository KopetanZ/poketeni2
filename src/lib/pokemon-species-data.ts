// ポケモンの種族値データベース

import { SpeciesBaseStats } from '@/types/pokemon-stats';

// 種族値データ（ポケモン原作準拠）
export const POKEMON_SPECIES_DATA: Record<number, SpeciesBaseStats & { name: string; evolution?: { level: number; evolve_to: number; evolve_name: string } }> = {
  // フシギダネ系統
  1: {
    name: 'フシギダネ',
    hp: 45,
    attack: 49,
    defense: 49,
    sp_attack: 65,
    sp_defense: 65,
    speed: 45,
    total: 318,
    evolution: { level: 16, evolve_to: 2, evolve_name: 'フシギソウ' }
  },
  2: {
    name: 'フシギソウ', 
    hp: 60,
    attack: 62,
    defense: 63,
    sp_attack: 80,
    sp_defense: 80,
    speed: 60,
    total: 405,
    evolution: { level: 32, evolve_to: 3, evolve_name: 'フシギバナ' }
  },
  3: {
    name: 'フシギバナ',
    hp: 80,
    attack: 82,
    defense: 83,
    sp_attack: 100,
    sp_defense: 100,
    speed: 80,
    total: 525
  },

  // ヒトカゲ系統
  4: {
    name: 'ヒトカゲ',
    hp: 39,
    attack: 52,
    defense: 43,
    sp_attack: 60,
    sp_defense: 50,
    speed: 65,
    total: 309,
    evolution: { level: 16, evolve_to: 5, evolve_name: 'リザード' }
  },
  5: {
    name: 'リザード',
    hp: 58,
    attack: 64,
    defense: 58,
    sp_attack: 80,
    sp_defense: 65,
    speed: 80,
    total: 405,
    evolution: { level: 36, evolve_to: 6, evolve_name: 'リザードン' }
  },
  6: {
    name: 'リザードン',
    hp: 78,
    attack: 84,
    defense: 78,
    sp_attack: 109,
    sp_defense: 85,
    speed: 100,
    total: 534
  },

  // ゼニガメ系統
  7: {
    name: 'ゼニガメ',
    hp: 44,
    attack: 48,
    defense: 65,
    sp_attack: 50,
    sp_defense: 64,
    speed: 43,
    total: 314,
    evolution: { level: 16, evolve_to: 8, evolve_name: 'カメール' }
  },
  8: {
    name: 'カメール',
    hp: 59,
    attack: 63,
    defense: 80,
    sp_attack: 65,
    sp_defense: 80,
    speed: 58,
    total: 405,
    evolution: { level: 36, evolve_to: 9, evolve_name: 'カメックス' }
  },
  9: {
    name: 'カメックス',
    hp: 79,
    attack: 83,
    defense: 100,
    sp_attack: 85,
    sp_defense: 105,
    speed: 78,
    total: 530
  },

  // 人気ポケモン
  25: {
    name: 'ピカチュウ',
    hp: 35,
    attack: 55,
    defense: 40,
    sp_attack: 50,
    sp_defense: 50,
    speed: 90,
    total: 320,
    evolution: { level: 22, evolve_to: 26, evolve_name: 'ライチュウ' }
  },
  26: {
    name: 'ライチュウ',
    hp: 60,
    attack: 90,
    defense: 55,
    sp_attack: 90,
    sp_defense: 80,
    speed: 110,
    total: 485
  },

  133: {
    name: 'イーブイ',
    hp: 55,
    attack: 55,
    defense: 50,
    sp_attack: 45,
    sp_defense: 65,
    speed: 55,
    total: 325
  },

  // 強力なポケモン
  448: {
    name: 'ルカリオ',
    hp: 70,
    attack: 110,
    defense: 70,
    sp_attack: 115,
    sp_defense: 70,
    speed: 90,
    total: 525
  },

  115: {
    name: 'ガルーラ',
    hp: 105,
    attack: 95,
    defense: 80,
    sp_attack: 40,
    sp_defense: 80,
    speed: 90,
    total: 490
  },

  143: {
    name: 'カビゴン',
    hp: 160,
    attack: 110,
    defense: 65,
    sp_attack: 65,
    sp_defense: 110,
    speed: 30,
    total: 540
  },

  // 準伝説
  144: {
    name: 'フリーザー',
    hp: 90,
    attack: 85,
    defense: 100,
    sp_attack: 95,
    sp_defense: 125,
    speed: 85,
    total: 580
  },

  145: {
    name: 'サンダー',
    hp: 90,
    attack: 90,
    defense: 85,
    sp_attack: 125,
    sp_defense: 90,
    speed: 100,
    total: 580
  },

  146: {
    name: 'ファイヤー',
    hp: 90,
    attack: 100,
    defense: 90,
    sp_attack: 125,
    sp_defense: 85,
    speed: 90,
    total: 580
  }
};

// ポケモンの種族値を取得
export function getPokemonSpeciesData(pokemonId: number): (SpeciesBaseStats & { name: string; evolution?: any }) | null {
  return POKEMON_SPECIES_DATA[pokemonId] || null;
}

// 進化可能かチェック
export function canEvolve(pokemonId: number, currentLevel: number): boolean {
  const species = getPokemonSpeciesData(pokemonId);
  return species?.evolution ? currentLevel >= species.evolution.level : false;
}

// 進化先の情報を取得
export function getEvolutionInfo(pokemonId: number) {
  const species = getPokemonSpeciesData(pokemonId);
  return species?.evolution || null;
}

// レアリティランクを種族値合計で判定
export function getSpeciesRarity(pokemonId: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  const species = getPokemonSpeciesData(pokemonId);
  if (!species) return 'common';
  
  if (species.total >= 600) return 'legendary';
  if (species.total >= 530) return 'epic';
  if (species.total >= 480) return 'rare';
  if (species.total >= 400) return 'uncommon';
  return 'common';
}

// ランダムなポケモンを取得（レアリティ考慮）
export function getRandomPokemon(): number {
  const pokemonIds = Object.keys(POKEMON_SPECIES_DATA).map(Number);
  
  // レアリティによる重み付け
  const weightedIds: number[] = [];
  
  pokemonIds.forEach(id => {
    const rarity = getSpeciesRarity(id);
    let weight = 1;
    
    switch (rarity) {
      case 'common': weight = 50; break;
      case 'uncommon': weight = 25; break;  
      case 'rare': weight = 10; break;
      case 'epic': weight = 3; break;
      case 'legendary': weight = 1; break;
    }
    
    for (let i = 0; i < weight; i++) {
      weightedIds.push(id);
    }
  });
  
  return weightedIds[Math.floor(Math.random() * weightedIds.length)];
}