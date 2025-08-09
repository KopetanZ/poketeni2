// ポケモン特性システム

export interface PokemonAbility {
  id: string;
  name: string;
  description: string;
  tennis_effect: {
    serve_boost?: number;
    return_boost?: number;
    volley_boost?: number;
    stroke_boost?: number;
    mental_boost?: number;
    stamina_boost?: number;
    critical_rate?: number;
    condition_immunity?: string[];
    special_trigger?: 'on_serve' | 'on_return' | 'on_critical' | 'passive';
  };
}

// ポケモン特性データベース
export const POKEMON_ABILITIES_DATA: Record<string, PokemonAbility> = {
  // 一般特性
  'static': {
    id: 'static',
    name: 'せいでんき',
    description: '接触されると30％の確率で相手をまひ状態にする',
    tennis_effect: {
      serve_boost: 5,
      special_trigger: 'on_serve'
    }
  },
  
  'blaze': {
    id: 'blaze',
    name: 'もうか',
    description: 'HPが1/3以下になると炎技の威力が1.5倍',
    tennis_effect: {
      serve_boost: 10,
      volley_boost: 10,
      special_trigger: 'on_critical'
    }
  },
  
  'torrent': {
    id: 'torrent',
    name: 'げきりゅう',
    description: 'HPが1/3以下になると水技の威力が1.5倍',
    tennis_effect: {
      return_boost: 10,
      stroke_boost: 10,
      special_trigger: 'on_critical'
    }
  },
  
  'overgrow': {
    id: 'overgrow',
    name: 'しんりょく',
    description: 'HPが1/3以下になると草技の威力が1.5倍',
    tennis_effect: {
      mental_boost: 10,
      stamina_boost: 5,
      special_trigger: 'passive'
    }
  },
  
  'keen_eye': {
    id: 'keen_eye',
    name: 'するどいめ',
    description: '命中率を下げられない',
    tennis_effect: {
      volley_boost: 8,
      critical_rate: 0.1
    }
  },
  
  'guts': {
    id: 'guts',
    name: 'こんじょう',
    description: '状態異常のとき攻撃が1.5倍',
    tennis_effect: {
      serve_boost: 15,
      mental_boost: 10,
      condition_immunity: ['terrible']
    }
  },
  
  'speed_boost': {
    id: 'speed_boost',
    name: 'かそく',
    description: '毎ターン素早さが1段階上がる',
    tennis_effect: {
      stamina_boost: 12,
      special_trigger: 'passive'
    }
  },
  
  'sturdy': {
    id: 'sturdy',
    name: 'がんじょう',
    description: 'HPが満タンのとき一撃では倒れない',
    tennis_effect: {
      return_boost: 15,
      mental_boost: 8
    }
  },
  
  'technician': {
    id: 'technician',
    name: 'テクニシャン',
    description: '威力60以下の技の威力が1.5倍',
    tennis_effect: {
      volley_boost: 12,
      stroke_boost: 8,
      critical_rate: 0.15
    }
  },
  
  'natural_cure': {
    id: 'natural_cure',
    name: 'しぜんかいふく',
    description: '手持ちに戻ると状態異常が治る',
    tennis_effect: {
      mental_boost: 10,
      condition_immunity: ['poor', 'terrible']
    }
  },
  
  'intimidate': {
    id: 'intimidate',
    name: 'いかく',
    description: '場に出ると相手の攻撃を1段階下げる',
    tennis_effect: {
      serve_boost: 8,
      mental_boost: 12
    }
  },
  
  'pressure': {
    id: 'pressure',
    name: 'プレッシャー',
    description: '相手の技のPPを多く減らす',
    tennis_effect: {
      mental_boost: 15,
      special_trigger: 'passive'
    }
  },
  
  'adaptability': {
    id: 'adaptability',
    name: 'てきおうりょく',
    description: 'タイプ一致技の威力が2倍になる',
    tennis_effect: {
      serve_boost: 5,
      return_boost: 5,
      volley_boost: 5,
      stroke_boost: 5
    }
  },
  
  'chlorophyll': {
    id: 'chlorophyll',
    name: 'ようりょくそ',
    description: '晴れのとき素早さが2倍',
    tennis_effect: {
      stamina_boost: 20,
      volley_boost: 8
    }
  },
  
  'swift_swim': {
    id: 'swift_swim',
    name: 'すいすい',
    description: '雨のとき素早さが2倍',
    tennis_effect: {
      stamina_boost: 20,
      stroke_boost: 8
    }
  },
  
  'sand_rush': {
    id: 'sand_rush',
    name: 'すなかき',
    description: '砂嵐のとき素早さが2倍',
    tennis_effect: {
      stamina_boost: 20,
      serve_boost: 8
    }
  },
  
  'marvel_scale': {
    id: 'marvel_scale',
    name: 'ふしぎなうろこ',
    description: '状態異常のとき防御が1.5倍',
    tennis_effect: {
      return_boost: 20,
      mental_boost: 10,
      condition_immunity: ['poor']
    }
  },
  
  'huge_power': {
    id: 'huge_power',
    name: 'ちからもち',
    description: '物理攻撃力が2倍',
    tennis_effect: {
      serve_boost: 25,
      special_trigger: 'on_serve'
    }
  },
  
  'pure_power': {
    id: 'pure_power',
    name: 'ヨガパワー',
    description: '物理攻撃力が2倍',
    tennis_effect: {
      serve_boost: 25,
      mental_boost: 5
    }
  },
  
  'magic_guard': {
    id: 'magic_guard',
    name: 'マジックガード',
    description: '攻撃以外のダメージを受けない',
    tennis_effect: {
      mental_boost: 20,
      condition_immunity: ['terrible', 'poor']
    }
  }
};

// 種族別特性セット
export const POKEMON_SPECIES_ABILITIES: Record<number, string[]> = {
  // フシギダネ系統
  1: ['overgrow'], // フシギダネ
  2: ['overgrow'], // フシギソウ  
  3: ['overgrow', 'chlorophyll'], // フシギバナ
  
  // ヒトカゲ系統
  4: ['blaze'], // ヒトカゲ
  5: ['blaze'], // リザード
  6: ['blaze'], // リザードン
  
  // ゼニガメ系統
  7: ['torrent'], // ゼニガメ
  8: ['torrent'], // カメール
  9: ['torrent'], // カメックス
  
  // ポッポ系統
  16: ['keen_eye', 'tangled_feet'], // ポッポ
  17: ['keen_eye', 'tangled_feet'], // ピジョン
  18: ['keen_eye', 'tangled_feet'], // ピジョット
  
  // イーブイ系統
  133: ['adaptability'], // イーブイ
  134: ['water_absorb'], // シャワーズ
  135: ['volt_absorb'], // サンダース
  136: ['flash_fire'], // ブースター
  
  // ピカチュウ系統
  25: ['static'], // ピカチュウ
  26: ['static'], // ライチュウ
  
  // その他人気ポケモン
  39: ['cute_charm'], // プリン
  40: ['cute_charm'], // プクリン
  54: ['damp', 'cloud_nine'], // コダック
  55: ['damp', 'cloud_nine'], // ゴルダック
  104: ['rock_head', 'lightning_rod'], // カラカラ
  105: ['rock_head', 'lightning_rod'], // ガラガラ
  129: ['swift_swim'], // コイキング
  130: ['intimidate'], // ギャラドス
  131: ['water_absorb', 'shell_armor'], // ラプラス
  132: ['limber'], // メタモン
  143: ['immunity', 'thick_fat'], // カビゴン
  144: ['pressure'], // フリーザー
  145: ['pressure'], // サンダー
  146: ['pressure'], // ファイヤー
  150: ['pressure'], // ミュウツー
  151: ['synchronize'] // ミュウ
};

// 特性をランダムに選択
export function getRandomAbility(pokemonId: number): string | null {
  const abilities = POKEMON_SPECIES_ABILITIES[pokemonId];
  if (!abilities || abilities.length === 0) return null;
  
  return abilities[Math.floor(Math.random() * abilities.length)];
}

// 特性情報を取得
export function getAbilityData(abilityId: string): PokemonAbility | null {
  return POKEMON_ABILITIES_DATA[abilityId] || null;
}

// 特性による能力値ボーナスを計算
export function calculateAbilityBonus(
  abilityId: string | undefined,
  baseStats: {
    serve_skill: number;
    return_skill: number;
    volley_skill: number;
    stroke_skill: number;
    mental: number;
    stamina: number;
  },
  condition?: string,
  isCritical?: boolean
): typeof baseStats {
  if (!abilityId) return baseStats;
  
  const ability = getAbilityData(abilityId);
  if (!ability) return baseStats;
  
  const effect = ability.tennis_effect;
  const boostedStats = { ...baseStats };
  
  // パッシブ効果 or 特定条件での発動チェック
  let shouldApply = effect.special_trigger === 'passive';
  
  if (effect.special_trigger === 'on_critical' && isCritical) {
    shouldApply = true;
  }
  
  if (condition === 'terrible' || condition === 'poor') {
    // ピンチ時の特性発動
    if (['blaze', 'torrent', 'overgrow', 'guts', 'marvel_scale'].includes(abilityId)) {
      shouldApply = true;
    }
  }
  
  if (shouldApply || !effect.special_trigger) {
    if (effect.serve_boost) boostedStats.serve_skill += effect.serve_boost;
    if (effect.return_boost) boostedStats.return_skill += effect.return_boost;
    if (effect.volley_boost) boostedStats.volley_skill += effect.volley_boost;
    if (effect.stroke_boost) boostedStats.stroke_skill += effect.stroke_boost;
    if (effect.mental_boost) boostedStats.mental += effect.mental_boost;
    if (effect.stamina_boost) boostedStats.stamina += effect.stamina_boost;
  }
  
  return boostedStats;
}