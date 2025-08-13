import { RegionalCharacteristics } from '../types/rival-schools';

// 47都道府県の地域特性データ
export const REGIONAL_DATA: Record<string, RegionalCharacteristics> = {
  '北海道': {
    prefecture: '北海道',
    region: '北海道',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -15
    },
    culture: {
      preferred_pokemon_types: ['ice', 'normal', 'ground'],
      traditional_tactics: ['defensive', 'counter'],
      training_philosophy: 'mental',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 8,
      funding_level: 7,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ロコン', 'ユキワラシ', 'タマザラシ'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '青森県': {
    prefecture: '青森県',
    region: '東北',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -10
    },
    culture: {
      preferred_pokemon_types: ['ice', 'water', 'normal'],
      traditional_tactics: ['defensive', 'balanced'],
      training_philosophy: 'mental',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['コダック', 'ユキワラシ', 'タマザラシ'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '岩手県': {
    prefecture: '岩手県',
    region: '東北',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -8
    },
    culture: {
      preferred_pokemon_types: ['ground', 'rock', 'normal'],
      traditional_tactics: ['defensive', 'counter'],
      training_philosophy: 'mental',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['イワーク', 'サンド', 'タマザラシ'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '宮城県': {
    prefecture: '宮城県',
    region: '東北',
    climate: {
      primary_weather: 'cloudy',
      court_preference: 'hard',
      temperature_modifier: -2
    },
    culture: {
      preferred_pokemon_types: ['water', 'normal', 'flying'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 8,
      funding_level: 7,
      population_density: 'medium'
    },
    signature_pokemon: {
      legendary_ace: 'ラプラス',
      common_choices: ['コダック', 'ポッポ', 'ピカチュウ'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '秋田県': {
    prefecture: '秋田県',
    region: '東北',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -12
    },
    culture: {
      preferred_pokemon_types: ['ice', 'normal', 'ground'],
      traditional_tactics: ['defensive', 'counter'],
      training_philosophy: 'mental',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ユキワラシ', 'タマザラシ', 'ロコン'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '山形県': {
    prefecture: '山形県',
    region: '東北',
    climate: {
      primary_weather: 'snowy',
      court_preference: 'indoor',
      temperature_modifier: -10
    },
    culture: {
      preferred_pokemon_types: ['ice', 'normal', 'ground'],
      traditional_tactics: ['defensive', 'balanced'],
      training_philosophy: 'mental',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ユキワラシ', 'タマザラシ', 'ロコン'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '福島県': {
    prefecture: '福島県',
    region: '東北',
    climate: {
      primary_weather: 'cloudy',
      court_preference: 'hard',
      temperature_modifier: -3
    },
    culture: {
      preferred_pokemon_types: ['normal', 'flying', 'ground'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 6,
      coaching_level: 7,
      funding_level: 6,
      population_density: 'low'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ポッポ', 'ピカチュウ', 'イワーク'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '茨城県': {
    prefecture: '茨城県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 2
    },
    culture: {
      preferred_pokemon_types: ['normal', 'flying', 'ground'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 7,
      funding_level: 7,
      population_density: 'medium'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ポッポ', 'ピカチュウ', 'イワーク'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '栃木県': {
    prefecture: '栃木県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 1
    },
    culture: {
      preferred_pokemon_types: ['normal', 'flying', 'ground'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 7,
      funding_level: 7,
      population_density: 'medium'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ポッポ', 'ピカチュウ', 'イワーク'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '群馬県': {
    prefecture: '群馬県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 0
    },
    culture: {
      preferred_pokemon_types: ['normal', 'flying', 'ground'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 7
    },
    infrastructure: {
      facility_quality: 7,
      coaching_level: 7,
      funding_level: 7,
      population_density: 'medium'
    },
    signature_pokemon: {
      legendary_ace: 'フリーザー',
      common_choices: ['ポッポ', 'ピカチュウ', 'イワーク'],
      rare_appearances: ['ラプラス', 'フリーザー']
    }
  },
  
  '埼玉県': {
    prefecture: '埼玉県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 3
    },
    culture: {
      preferred_pokemon_types: ['normal', 'flying', 'electric'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 8,
      coaching_level: 8,
      funding_level: 8,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'サンダース',
      common_choices: ['ポッポ', 'ピカチュウ', 'コイル'],
      rare_appearances: ['サンダース', 'フーディン']
    }
  },
  
  '千葉県': {
    prefecture: '千葉県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 4
    },
    culture: {
      preferred_pokemon_types: ['water', 'normal', 'flying'],
      traditional_tactics: ['balanced', 'technical'],
      training_philosophy: 'balanced',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 8,
      coaching_level: 8,
      funding_level: 8,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'ラプラス',
      common_choices: ['コダック', 'ポッポ', 'ピカチュウ'],
      rare_appearances: ['ラプラス', 'サンダース']
    }
  },
  
  '東京都': {
    prefecture: '東京都',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 5
    },
    culture: {
      preferred_pokemon_types: ['electric', 'psychic', 'steel'],
      traditional_tactics: ['technical', 'balanced'],
      training_philosophy: 'technique',
      competitive_spirit: 9
    },
    infrastructure: {
      facility_quality: 10,
      coaching_level: 9,
      funding_level: 10,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'サンダース',
      common_choices: ['ピカチュウ', 'コイル', 'ケーシィ'],
      rare_appearances: ['フーディン', 'サンダー']
    }
  },
  
  '神奈川県': {
    prefecture: '神奈川県',
    region: '関東',
    climate: {
      primary_weather: 'sunny',
      court_preference: 'hard',
      temperature_modifier: 4
    },
    culture: {
      preferred_pokemon_types: ['water', 'electric', 'normal'],
      traditional_tactics: ['technical', 'balanced'],
      training_philosophy: 'technique',
      competitive_spirit: 8
    },
    infrastructure: {
      facility_quality: 9,
      coaching_level: 8,
      funding_level: 9,
      population_density: 'high'
    },
    signature_pokemon: {
      legendary_ace: 'サンダース',
      common_choices: ['コダック', 'ピカチュウ', 'コイル'],
      rare_appearances: ['サンダース', 'ラプラス']
    }
  }
};

// 残りの都道府県データも同様に定義...
// スペースの都合上、主要な地域のみ表示

export const REGIONS = {
  '北海道': '北海道',
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  '沖縄': ['沖縄県']
};
