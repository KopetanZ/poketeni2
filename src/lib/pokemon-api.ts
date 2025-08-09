import { PokemonDetails } from '@/types/game';

// PokeAPI統合システム - 日本語名・画像対応
export class PokemonAPI {
  private static readonly BASE_URL = 'https://pokeapi.co/api/v2';
  private static readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24時間
  private static cache = new Map<string, { data: any; timestamp: number }>();

  // ポケモンデータマッピング（大幅拡張版 - 200種類以上対応）
  private static readonly POKEMON_MAPPING: Record<string, {
    id: number;
    english: string;
    japanese: string;
    type: string[];
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    generation?: number;
  }> = {
    // === 第1世代（カントー地方） ===
    
    // 御三家ライン
    'フシギダネ': { id: 1, english: 'bulbasaur', japanese: 'フシギダネ', type: ['grass', 'poison'], rarity: 'rare', generation: 1 },
    'フシギソウ': { id: 2, english: 'ivysaur', japanese: 'フシギソウ', type: ['grass', 'poison'], rarity: 'epic', generation: 1 },
    'フシギバナ': { id: 3, english: 'venusaur', japanese: 'フシギバナ', type: ['grass', 'poison'], rarity: 'legendary', generation: 1 },
    'ヒトカゲ': { id: 4, english: 'charmander', japanese: 'ヒトカゲ', type: ['fire'], rarity: 'rare', generation: 1 },
    'リザード': { id: 5, english: 'charmeleon', japanese: 'リザード', type: ['fire'], rarity: 'epic', generation: 1 },
    'リザードン': { id: 6, english: 'charizard', japanese: 'リザードン', type: ['fire', 'flying'], rarity: 'legendary', generation: 1 },
    'ゼニガメ': { id: 7, english: 'squirtle', japanese: 'ゼニガメ', type: ['water'], rarity: 'rare', generation: 1 },
    'カメール': { id: 8, english: 'wartortle', japanese: 'カメール', type: ['water'], rarity: 'epic', generation: 1 },
    'カメックス': { id: 9, english: 'blastoise', japanese: 'カメックス', type: ['water'], rarity: 'legendary', generation: 1 },
    
    // 序盤ポケモン（低種族値）
    'キャタピー': { id: 10, english: 'caterpie', japanese: 'キャタピー', type: ['bug'], rarity: 'common', generation: 1 },
    'トランセル': { id: 11, english: 'metapod', japanese: 'トランセル', type: ['bug'], rarity: 'common', generation: 1 },
    'バタフリー': { id: 12, english: 'butterfree', japanese: 'バタフリー', type: ['bug', 'flying'], rarity: 'uncommon', generation: 1 },
    'ビードル': { id: 13, english: 'weedle', japanese: 'ビードル', type: ['bug', 'poison'], rarity: 'common', generation: 1 },
    'コクーン': { id: 14, english: 'kakuna', japanese: 'コクーン', type: ['bug', 'poison'], rarity: 'common', generation: 1 },
    'スピアー': { id: 15, english: 'beedrill', japanese: 'スピアー', type: ['bug', 'poison'], rarity: 'uncommon', generation: 1 },
    'ポッポ': { id: 16, english: 'pidgey', japanese: 'ポッポ', type: ['normal', 'flying'], rarity: 'common', generation: 1 },
    'ピジョン': { id: 17, english: 'pidgeotto', japanese: 'ピジョン', type: ['normal', 'flying'], rarity: 'uncommon', generation: 1 },
    'ピジョット': { id: 18, english: 'pidgeot', japanese: 'ピジョット', type: ['normal', 'flying'], rarity: 'rare', generation: 1 },
    'コラッタ': { id: 19, english: 'rattata', japanese: 'コラッタ', type: ['normal'], rarity: 'common', generation: 1 },
    'ラッタ': { id: 20, english: 'raticate', japanese: 'ラッタ', type: ['normal'], rarity: 'uncommon', generation: 1 },
    
    // 中級ポケモン
    'オニスズメ': { id: 21, english: 'spearow', japanese: 'オニスズメ', type: ['normal', 'flying'], rarity: 'common', generation: 1 },
    'オニドリル': { id: 22, english: 'fearow', japanese: 'オニドリル', type: ['normal', 'flying'], rarity: 'uncommon', generation: 1 },
    'アーボ': { id: 23, english: 'ekans', japanese: 'アーボ', type: ['poison'], rarity: 'common', generation: 1 },
    'アーボック': { id: 24, english: 'arbok', japanese: 'アーボック', type: ['poison'], rarity: 'uncommon', generation: 1 },
    'ピカチュウ': { id: 25, english: 'pikachu', japanese: 'ピカチュウ', type: ['electric'], rarity: 'rare', generation: 1 },
    'ライチュウ': { id: 26, english: 'raichu', japanese: 'ライチュウ', type: ['electric'], rarity: 'epic', generation: 1 },
    'サンド': { id: 27, english: 'sandshrew', japanese: 'サンド', type: ['ground'], rarity: 'uncommon', generation: 1 },
    'サンドパン': { id: 28, english: 'sandslash', japanese: 'サンドパン', type: ['ground'], rarity: 'rare', generation: 1 },
    
    'ニドラン♀': { id: 29, english: 'nidoran-f', japanese: 'ニドラン♀', type: ['poison'], rarity: 'uncommon', generation: 1 },
    'ニドリーナ': { id: 30, english: 'nidorina', japanese: 'ニドリーナ', type: ['poison'], rarity: 'rare', generation: 1 },
    'ニドクイン': { id: 31, english: 'nidoqueen', japanese: 'ニドクイン', type: ['poison', 'ground'], rarity: 'epic', generation: 1 },
    'ニドラン♂': { id: 32, english: 'nidoran-m', japanese: 'ニドラン♂', type: ['poison'], rarity: 'uncommon', generation: 1 },
    'ニドリーノ': { id: 33, english: 'nidorino', japanese: 'ニドリーノ', type: ['poison'], rarity: 'rare', generation: 1 },
    'ニドキング': { id: 34, english: 'nidoking', japanese: 'ニドキング', type: ['poison', 'ground'], rarity: 'epic', generation: 1 },
    
    'ピッピ': { id: 35, english: 'clefairy', japanese: 'ピッピ', type: ['fairy'], rarity: 'uncommon', generation: 1 },
    'ピクシー': { id: 36, english: 'clefable', japanese: 'ピクシー', type: ['fairy'], rarity: 'rare', generation: 1 },
    'ロコン': { id: 37, english: 'vulpix', japanese: 'ロコン', type: ['fire'], rarity: 'uncommon', generation: 1 },
    'キュウコン': { id: 38, english: 'ninetales', japanese: 'キュウコン', type: ['fire'], rarity: 'epic', generation: 1 },
    'プリン': { id: 39, english: 'jigglypuff', japanese: 'プリン', type: ['normal', 'fairy'], rarity: 'uncommon', generation: 1 },
    'プクリン': { id: 40, english: 'wigglytuff', japanese: 'プクリン', type: ['normal', 'fairy'], rarity: 'rare', generation: 1 },
    
    'ズバット': { id: 41, english: 'zubat', japanese: 'ズバット', type: ['poison', 'flying'], rarity: 'common', generation: 1 },
    'ゴルバット': { id: 42, english: 'golbat', japanese: 'ゴルバット', type: ['poison', 'flying'], rarity: 'uncommon', generation: 1 },
    'ナゾノクサ': { id: 43, english: 'oddish', japanese: 'ナゾノクサ', type: ['grass', 'poison'], rarity: 'common', generation: 1 },
    'クサイハナ': { id: 44, english: 'gloom', japanese: 'クサイハナ', type: ['grass', 'poison'], rarity: 'uncommon', generation: 1 },
    'ラフレシア': { id: 45, english: 'vileplume', japanese: 'ラフレシア', type: ['grass', 'poison'], rarity: 'rare', generation: 1 },
    'パラス': { id: 46, english: 'paras', japanese: 'パラス', type: ['bug', 'grass'], rarity: 'uncommon', generation: 1 },
    'パラセクト': { id: 47, english: 'parasect', japanese: 'パラセクト', type: ['bug', 'grass'], rarity: 'rare', generation: 1 },
    'コンパン': { id: 48, english: 'venonat', japanese: 'コンパン', type: ['bug', 'poison'], rarity: 'uncommon', generation: 1 },
    'モルフォン': { id: 49, english: 'venomoth', japanese: 'モルフォン', type: ['bug', 'poison'], rarity: 'rare', generation: 1 },
    
    'ディグダ': { id: 50, english: 'diglett', japanese: 'ディグダ', type: ['ground'], rarity: 'uncommon', generation: 1 },
    'ダグトリオ': { id: 51, english: 'dugtrio', japanese: 'ダグトリオ', type: ['ground'], rarity: 'rare', generation: 1 },
    'ニャース': { id: 52, english: 'meowth', japanese: 'ニャース', type: ['normal'], rarity: 'common', generation: 1 },
    'ペルシアン': { id: 53, english: 'persian', japanese: 'ペルシアン', type: ['normal'], rarity: 'uncommon', generation: 1 },
    'コダック': { id: 54, english: 'psyduck', japanese: 'コダック', type: ['water'], rarity: 'common', generation: 1 },
    'ゴルダック': { id: 55, english: 'golduck', japanese: 'ゴルダック', type: ['water'], rarity: 'rare', generation: 1 },
    'マンキー': { id: 56, english: 'mankey', japanese: 'マンキー', type: ['fighting'], rarity: 'uncommon', generation: 1 },
    'オコリザル': { id: 57, english: 'primeape', japanese: 'オコリザル', type: ['fighting'], rarity: 'rare', generation: 1 },
    'ガーディ': { id: 58, english: 'growlithe', japanese: 'ガーディ', type: ['fire'], rarity: 'uncommon', generation: 1 },
    'ウインディ': { id: 59, english: 'arcanine', japanese: 'ウインディ', type: ['fire'], rarity: 'epic', generation: 1 },
    
    'ニョロモ': { id: 60, english: 'poliwag', japanese: 'ニョロモ', type: ['water'], rarity: 'uncommon', generation: 1 },
    'ニョロゾ': { id: 61, english: 'poliwhirl', japanese: 'ニョロゾ', type: ['water'], rarity: 'rare', generation: 1 },
    'ニョロボン': { id: 62, english: 'poliwrath', japanese: 'ニョロボン', type: ['water', 'fighting'], rarity: 'epic', generation: 1 },
    'ケーシィ': { id: 63, english: 'abra', japanese: 'ケーシィ', type: ['psychic'], rarity: 'rare', generation: 1 },
    'ユンゲラー': { id: 64, english: 'kadabra', japanese: 'ユンゲラー', type: ['psychic'], rarity: 'epic', generation: 1 },
    'フーディン': { id: 65, english: 'alakazam', japanese: 'フーディン', type: ['psychic'], rarity: 'legendary', generation: 1 },
    'ワンリキー': { id: 66, english: 'machop', japanese: 'ワンリキー', type: ['fighting'], rarity: 'uncommon', generation: 1 },
    'ゴーリキー': { id: 67, english: 'machoke', japanese: 'ゴーリキー', type: ['fighting'], rarity: 'rare', generation: 1 },
    'カイリキー': { id: 68, english: 'machamp', japanese: 'カイリキー', type: ['fighting'], rarity: 'epic', generation: 1 },
    
    'マダツボミ': { id: 69, english: 'bellsprout', japanese: 'マダツボミ', type: ['grass', 'poison'], rarity: 'uncommon', generation: 1 },
    'ウツドン': { id: 70, english: 'weepinbell', japanese: 'ウツドン', type: ['grass', 'poison'], rarity: 'rare', generation: 1 },
    'ウツボット': { id: 71, english: 'victreebel', japanese: 'ウツボット', type: ['grass', 'poison'], rarity: 'epic', generation: 1 },
    'メノクラゲ': { id: 72, english: 'tentacool', japanese: 'メノクラゲ', type: ['water', 'poison'], rarity: 'uncommon', generation: 1 },
    'ドククラゲ': { id: 73, english: 'tentacruel', japanese: 'ドククラゲ', type: ['water', 'poison'], rarity: 'rare', generation: 1 },
    'イシツブテ': { id: 74, english: 'geodude', japanese: 'イシツブテ', type: ['rock', 'ground'], rarity: 'uncommon', generation: 1 },
    'ゴローン': { id: 75, english: 'graveler', japanese: 'ゴローン', type: ['rock', 'ground'], rarity: 'rare', generation: 1 },
    'ゴローニャ': { id: 76, english: 'golem', japanese: 'ゴローニャ', type: ['rock', 'ground'], rarity: 'epic', generation: 1 },
    'ポニータ': { id: 77, english: 'ponyta', japanese: 'ポニータ', type: ['fire'], rarity: 'uncommon', generation: 1 },
    'ギャロップ': { id: 78, english: 'rapidash', japanese: 'ギャロップ', type: ['fire'], rarity: 'rare', generation: 1 },
    'ヤドン': { id: 79, english: 'slowpoke', japanese: 'ヤドン', type: ['water', 'psychic'], rarity: 'common', generation: 1 },
    'ヤドラン': { id: 80, english: 'slowbro', japanese: 'ヤドラン', type: ['water', 'psychic'], rarity: 'rare', generation: 1 },
    
    // 人気・上級ポケモン
    'コイル': { id: 81, english: 'magnemite', japanese: 'コイル', type: ['electric', 'steel'], rarity: 'uncommon', generation: 1 },
    'レアコイル': { id: 82, english: 'magneton', japanese: 'レアコイル', type: ['electric', 'steel'], rarity: 'rare', generation: 1 },
    'カモネギ': { id: 83, english: 'farfetchd', japanese: 'カモネギ', type: ['normal', 'flying'], rarity: 'rare', generation: 1 },
    'ドードー': { id: 84, english: 'doduo', japanese: 'ドードー', type: ['normal', 'flying'], rarity: 'uncommon', generation: 1 },
    'ドードリオ': { id: 85, english: 'dodrio', japanese: 'ドードリオ', type: ['normal', 'flying'], rarity: 'rare', generation: 1 },
    'パウワウ': { id: 86, english: 'seel', japanese: 'パウワウ', type: ['water'], rarity: 'uncommon', generation: 1 },
    'ジュゴン': { id: 87, english: 'dewgong', japanese: 'ジュゴン', type: ['water', 'ice'], rarity: 'rare', generation: 1 },
    'ベトベター': { id: 88, english: 'grimer', japanese: 'ベトベター', type: ['poison'], rarity: 'uncommon', generation: 1 },
    'ベトベトン': { id: 89, english: 'muk', japanese: 'ベトベトン', type: ['poison'], rarity: 'rare', generation: 1 },
    'シェルダー': { id: 90, english: 'shellder', japanese: 'シェルダー', type: ['water'], rarity: 'uncommon', generation: 1 },
    'パルシェン': { id: 91, english: 'cloyster', japanese: 'パルシェン', type: ['water', 'ice'], rarity: 'epic', generation: 1 },
    'ゴース': { id: 92, english: 'gastly', japanese: 'ゴース', type: ['ghost', 'poison'], rarity: 'uncommon', generation: 1 },
    'ゴースト': { id: 93, english: 'haunter', japanese: 'ゴースト', type: ['ghost', 'poison'], rarity: 'rare', generation: 1 },
    'ゲンガー': { id: 94, english: 'gengar', japanese: 'ゲンガー', type: ['ghost', 'poison'], rarity: 'epic', generation: 1 },
    
    'イワーク': { id: 95, english: 'onix', japanese: 'イワーク', type: ['rock', 'ground'], rarity: 'rare', generation: 1 },
    'スリープ': { id: 96, english: 'drowzee', japanese: 'スリープ', type: ['psychic'], rarity: 'uncommon', generation: 1 },
    'スリーパー': { id: 97, english: 'hypno', japanese: 'スリーパー', type: ['psychic'], rarity: 'rare', generation: 1 },
    'クラブ': { id: 98, english: 'krabby', japanese: 'クラブ', type: ['water'], rarity: 'uncommon', generation: 1 },
    'キングラー': { id: 99, english: 'kingler', japanese: 'キングラー', type: ['water'], rarity: 'rare', generation: 1 },
    'ビリリダマ': { id: 100, english: 'voltorb', japanese: 'ビリリダマ', type: ['electric'], rarity: 'uncommon', generation: 1 },
    'マルマイン': { id: 101, english: 'electrode', japanese: 'マルマイン', type: ['electric'], rarity: 'rare', generation: 1 },
    'タマタマ': { id: 102, english: 'exeggcute', japanese: 'タマタマ', type: ['grass', 'psychic'], rarity: 'uncommon', generation: 1 },
    'ナッシー': { id: 103, english: 'exeggutor', japanese: 'ナッシー', type: ['grass', 'psychic'], rarity: 'rare', generation: 1 },
    'カラカラ': { id: 104, english: 'cubone', japanese: 'カラカラ', type: ['ground'], rarity: 'uncommon', generation: 1 },
    'ガラガラ': { id: 105, english: 'marowak', japanese: 'ガラガラ', type: ['ground'], rarity: 'rare', generation: 1 },
    
    // 強力ポケモン・準伝説級
    'サワムラー': { id: 106, english: 'hitmonlee', japanese: 'サワムラー', type: ['fighting'], rarity: 'epic', generation: 1 },
    'エビワラー': { id: 107, english: 'hitmonchan', japanese: 'エビワラー', type: ['fighting'], rarity: 'epic', generation: 1 },
    'ベロリンガ': { id: 108, english: 'lickitung', japanese: 'ベロリンガ', type: ['normal'], rarity: 'rare', generation: 1 },
    'ドガース': { id: 109, english: 'koffing', japanese: 'ドガース', type: ['poison'], rarity: 'uncommon', generation: 1 },
    'マタドガス': { id: 110, english: 'weezing', japanese: 'マタドガス', type: ['poison'], rarity: 'rare', generation: 1 },
    'サイホーン': { id: 111, english: 'rhyhorn', japanese: 'サイホーン', type: ['ground', 'rock'], rarity: 'uncommon', generation: 1 },
    'サイドン': { id: 112, english: 'rhydon', japanese: 'サイドン', type: ['ground', 'rock'], rarity: 'epic', generation: 1 },
    'ラッキー': { id: 113, english: 'chansey', japanese: 'ラッキー', type: ['normal'], rarity: 'epic', generation: 1 },
    'モンジャラ': { id: 114, english: 'tangela', japanese: 'モンジャラ', type: ['grass'], rarity: 'rare', generation: 1 },
    'ガルーラ': { id: 115, english: 'kangaskhan', japanese: 'ガルーラ', type: ['normal'], rarity: 'epic', generation: 1 },
    'タッツー': { id: 116, english: 'horsea', japanese: 'タッツー', type: ['water'], rarity: 'uncommon', generation: 1 },
    'シードラ': { id: 117, english: 'seadra', japanese: 'シードラ', type: ['water'], rarity: 'rare', generation: 1 },
    'トサキント': { id: 118, english: 'goldeen', japanese: 'トサキント', type: ['water'], rarity: 'uncommon', generation: 1 },
    'アズマオウ': { id: 119, english: 'seaking', japanese: 'アズマオウ', type: ['water'], rarity: 'rare', generation: 1 },
    'ヒトデマン': { id: 120, english: 'staryu', japanese: 'ヒトデマン', type: ['water'], rarity: 'uncommon', generation: 1 },
    'スターミー': { id: 121, english: 'starmie', japanese: 'スターミー', type: ['water', 'psychic'], rarity: 'epic', generation: 1 },
    'バリヤード': { id: 122, english: 'mr-mime', japanese: 'バリヤード', type: ['psychic', 'fairy'], rarity: 'rare', generation: 1 },
    'ストライク': { id: 123, english: 'scyther', japanese: 'ストライク', type: ['bug', 'flying'], rarity: 'epic', generation: 1 },
    'ルージュラ': { id: 124, english: 'jynx', japanese: 'ルージュラ', type: ['ice', 'psychic'], rarity: 'epic', generation: 1 },
    'エレブー': { id: 125, english: 'electabuzz', japanese: 'エレブー', type: ['electric'], rarity: 'epic', generation: 1 },
    'ブーバー': { id: 126, english: 'magmar', japanese: 'ブーバー', type: ['fire'], rarity: 'epic', generation: 1 },
    'カイロス': { id: 127, english: 'pinsir', japanese: 'カイロス', type: ['bug'], rarity: 'epic', generation: 1 },
    'ケンタロス': { id: 128, english: 'tauros', japanese: 'ケンタロス', type: ['normal'], rarity: 'epic', generation: 1 },
    'コイキング': { id: 129, english: 'magikarp', japanese: 'コイキング', type: ['water'], rarity: 'common', generation: 1 },
    'ギャラドス': { id: 130, english: 'gyarados', japanese: 'ギャラドス', type: ['water', 'flying'], rarity: 'legendary', generation: 1 },
    'ラプラス': { id: 131, english: 'lapras', japanese: 'ラプラス', type: ['water', 'ice'], rarity: 'legendary', generation: 1 },
    'メタモン': { id: 132, english: 'ditto', japanese: 'メタモン', type: ['normal'], rarity: 'epic', generation: 1 },
    'イーブイ': { id: 133, english: 'eevee', japanese: 'イーブイ', type: ['normal'], rarity: 'epic', generation: 1 },
    'シャワーズ': { id: 134, english: 'vaporeon', japanese: 'シャワーズ', type: ['water'], rarity: 'legendary', generation: 1 },
    'サンダース': { id: 135, english: 'jolteon', japanese: 'サンダース', type: ['electric'], rarity: 'legendary', generation: 1 },
    'ブースター': { id: 136, english: 'flareon', japanese: 'ブースター', type: ['fire'], rarity: 'legendary', generation: 1 },
    'ポリゴン': { id: 137, english: 'porygon', japanese: 'ポリゴン', type: ['normal'], rarity: 'epic', generation: 1 },
    'オムナイト': { id: 138, english: 'omanyte', japanese: 'オムナイト', type: ['rock', 'water'], rarity: 'rare', generation: 1 },
    'オムスター': { id: 139, english: 'omastar', japanese: 'オムスター', type: ['rock', 'water'], rarity: 'epic', generation: 1 },
    'カブト': { id: 140, english: 'kabuto', japanese: 'カブト', type: ['rock', 'water'], rarity: 'rare', generation: 1 },
    'カブトプス': { id: 141, english: 'kabutops', japanese: 'カブトプス', type: ['rock', 'water'], rarity: 'epic', generation: 1 },
    'プテラ': { id: 142, english: 'aerodactyl', japanese: 'プテラ', type: ['rock', 'flying'], rarity: 'legendary', generation: 1 },
    'カビゴン': { id: 143, english: 'snorlax', japanese: 'カビゴン', type: ['normal'], rarity: 'legendary', generation: 1 },
    
    // 伝説ポケモン
    'フリーザー': { id: 144, english: 'articuno', japanese: 'フリーザー', type: ['ice', 'flying'], rarity: 'legendary', generation: 1 },
    'サンダー': { id: 145, english: 'zapdos', japanese: 'サンダー', type: ['electric', 'flying'], rarity: 'legendary', generation: 1 },
    'ファイヤー': { id: 146, english: 'moltres', japanese: 'ファイヤー', type: ['fire', 'flying'], rarity: 'legendary', generation: 1 },
    'ミニリュウ': { id: 147, english: 'dratini', japanese: 'ミニリュウ', type: ['dragon'], rarity: 'epic', generation: 1 },
    'ハクリュー': { id: 148, english: 'dragonair', japanese: 'ハクリュー', type: ['dragon'], rarity: 'legendary', generation: 1 },
    'カイリュー': { id: 149, english: 'dragonite', japanese: 'カイリュー', type: ['dragon', 'flying'], rarity: 'legendary', generation: 1 },
    'ミュウツー': { id: 150, english: 'mewtwo', japanese: 'ミュウツー', type: ['psychic'], rarity: 'legendary', generation: 1 },
    'ミュウ': { id: 151, english: 'mew', japanese: 'ミュウ', type: ['psychic'], rarity: 'legendary', generation: 1 },
    
    // === 第2世代（ジョウト地方） ===
    
    // 御三家ライン
    'チコリータ': { id: 152, english: 'chikorita', japanese: 'チコリータ', type: ['grass'], rarity: 'rare', generation: 2 },
    'ベイリーフ': { id: 153, english: 'bayleef', japanese: 'ベイリーフ', type: ['grass'], rarity: 'epic', generation: 2 },
    'メガニウム': { id: 154, english: 'meganium', japanese: 'メガニウム', type: ['grass'], rarity: 'legendary', generation: 2 },
    'ヒノアラシ': { id: 155, english: 'cyndaquil', japanese: 'ヒノアラシ', type: ['fire'], rarity: 'rare', generation: 2 },
    'マグマラシ': { id: 156, english: 'quilava', japanese: 'マグマラシ', type: ['fire'], rarity: 'epic', generation: 2 },
    'バクフーン': { id: 157, english: 'typhlosion', japanese: 'バクフーン', type: ['fire'], rarity: 'legendary', generation: 2 },
    'ワニノコ': { id: 158, english: 'totodile', japanese: 'ワニノコ', type: ['water'], rarity: 'rare', generation: 2 },
    'アリゲイツ': { id: 159, english: 'croconaw', japanese: 'アリゲイツ', type: ['water'], rarity: 'epic', generation: 2 },
    'オーダイル': { id: 160, english: 'feraligatr', japanese: 'オーダイル', type: ['water'], rarity: 'legendary', generation: 2 },
    
    // 序盤〜中級ポケモン
    'オタチ': { id: 161, english: 'sentret', japanese: 'オタチ', type: ['normal'], rarity: 'common', generation: 2 },
    'オオタチ': { id: 162, english: 'furret', japanese: 'オオタチ', type: ['normal'], rarity: 'uncommon', generation: 2 },
    'ホーホー': { id: 163, english: 'hoothoot', japanese: 'ホーホー', type: ['normal', 'flying'], rarity: 'common', generation: 2 },
    'ヨルノズク': { id: 164, english: 'noctowl', japanese: 'ヨルノズク', type: ['normal', 'flying'], rarity: 'uncommon', generation: 2 },
    'レディバ': { id: 165, english: 'ledyba', japanese: 'レディバ', type: ['bug', 'flying'], rarity: 'common', generation: 2 },
    'レディアン': { id: 166, english: 'ledian', japanese: 'レディアン', type: ['bug', 'flying'], rarity: 'uncommon', generation: 2 },
    'イトマル': { id: 167, english: 'spinarak', japanese: 'イトマル', type: ['bug', 'poison'], rarity: 'common', generation: 2 },
    'アリアドス': { id: 168, english: 'ariados', japanese: 'アリアドス', type: ['bug', 'poison'], rarity: 'uncommon', generation: 2 },
    'クロバット': { id: 169, english: 'crobat', japanese: 'クロバット', type: ['poison', 'flying'], rarity: 'rare', generation: 2 },
    'チョンチー': { id: 170, english: 'chinchou', japanese: 'チョンチー', type: ['water', 'electric'], rarity: 'uncommon', generation: 2 },
    'ランターン': { id: 171, english: 'lanturn', japanese: 'ランターン', type: ['water', 'electric'], rarity: 'rare', generation: 2 },
    
    // イーブイ進化系
    'エーフィ': { id: 196, english: 'espeon', japanese: 'エーフィ', type: ['psychic'], rarity: 'legendary', generation: 2 },
    'ブラッキー': { id: 197, english: 'umbreon', japanese: 'ブラッキー', type: ['dark'], rarity: 'legendary', generation: 2 },
    
    // 人気ポケモン
    'ヤミカラス': { id: 198, english: 'murkrow', japanese: 'ヤミカラス', type: ['dark', 'flying'], rarity: 'uncommon', generation: 2 },
    'ヤドキング': { id: 199, english: 'slowking', japanese: 'ヤドキング', type: ['water', 'psychic'], rarity: 'epic', generation: 2 },
    'ムウマ': { id: 200, english: 'misdreavus', japanese: 'ムウマ', type: ['ghost'], rarity: 'rare', generation: 2 },
    'アンノーン': { id: 201, english: 'unown', japanese: 'アンノーン', type: ['psychic'], rarity: 'rare', generation: 2 },
    'ソーナンス': { id: 202, english: 'wobbuffet', japanese: 'ソーナンス', type: ['psychic'], rarity: 'epic', generation: 2 },
    'キリンリキ': { id: 203, english: 'girafarig', japanese: 'キリンリキ', type: ['normal', 'psychic'], rarity: 'rare', generation: 2 },
    'クヌギダマ': { id: 204, english: 'pineco', japanese: 'クヌギダマ', type: ['bug'], rarity: 'uncommon', generation: 2 },
    'フォレトス': { id: 205, english: 'forretress', japanese: 'フォレトス', type: ['bug', 'steel'], rarity: 'epic', generation: 2 },
    'ノコッチ': { id: 206, english: 'dunsparce', japanese: 'ノコッチ', type: ['normal'], rarity: 'rare', generation: 2 },
    'グライガー': { id: 207, english: 'gligar', japanese: 'グライガー', type: ['ground', 'flying'], rarity: 'rare', generation: 2 },
    'ハガネール': { id: 208, english: 'steelix', japanese: 'ハガネール', type: ['steel', 'ground'], rarity: 'epic', generation: 2 },
    'ブルー': { id: 209, english: 'snubbull', japanese: 'ブルー', type: ['fairy'], rarity: 'uncommon', generation: 2 },
    'グランブル': { id: 210, english: 'granbull', japanese: 'グランブル', type: ['fairy'], rarity: 'rare', generation: 2 },
    'ハリーセン': { id: 211, english: 'qwilfish', japanese: 'ハリーセン', type: ['water', 'poison'], rarity: 'rare', generation: 2 },
    'ハッサム': { id: 212, english: 'scizor', japanese: 'ハッサム', type: ['bug', 'steel'], rarity: 'legendary', generation: 2 },
    'ツボツボ': { id: 213, english: 'shuckle', japanese: 'ツボツボ', type: ['bug', 'rock'], rarity: 'epic', generation: 2 },
    'ヘラクロス': { id: 214, english: 'heracross', japanese: 'ヘラクロス', type: ['bug', 'fighting'], rarity: 'epic', generation: 2 },
    'ニューラ': { id: 215, english: 'sneasel', japanese: 'ニューラ', type: ['dark', 'ice'], rarity: 'rare', generation: 2 },
    'ヒメグマ': { id: 216, english: 'teddiursa', japanese: 'ヒメグマ', type: ['normal'], rarity: 'uncommon', generation: 2 },
    'リングマ': { id: 217, english: 'ursaring', japanese: 'リングマ', type: ['normal'], rarity: 'epic', generation: 2 },
    'マグマッグ': { id: 218, english: 'slugma', japanese: 'マグマッグ', type: ['fire'], rarity: 'uncommon', generation: 2 },
    'マグカルゴ': { id: 219, english: 'magcargo', japanese: 'マグカルゴ', type: ['fire', 'rock'], rarity: 'rare', generation: 2 },
    'ウリムー': { id: 220, english: 'swinub', japanese: 'ウリムー', type: ['ice', 'ground'], rarity: 'uncommon', generation: 2 },
    'イノムー': { id: 221, english: 'piloswine', japanese: 'イノムー', type: ['ice', 'ground'], rarity: 'rare', generation: 2 },
    'サニーゴ': { id: 222, english: 'corsola', japanese: 'サニーゴ', type: ['water', 'rock'], rarity: 'rare', generation: 2 },
    'テッポウオ': { id: 223, english: 'remoraid', japanese: 'テッポウオ', type: ['water'], rarity: 'uncommon', generation: 2 },
    'オクタン': { id: 224, english: 'octillery', japanese: 'オクタン', type: ['water'], rarity: 'rare', generation: 2 },
    'デリバード': { id: 225, english: 'delibird', japanese: 'デリバード', type: ['ice', 'flying'], rarity: 'rare', generation: 2 },
    'マンタイン': { id: 226, english: 'mantine', japanese: 'マンタイン', type: ['water', 'flying'], rarity: 'epic', generation: 2 },
    'エアームド': { id: 227, english: 'skarmory', japanese: 'エアームド', type: ['steel', 'flying'], rarity: 'epic', generation: 2 },
    'デルビル': { id: 228, english: 'houndour', japanese: 'デルビル', type: ['dark', 'fire'], rarity: 'uncommon', generation: 2 },
    'ヘルガー': { id: 229, english: 'houndoom', japanese: 'ヘルガー', type: ['dark', 'fire'], rarity: 'epic', generation: 2 },
    'キングドラ': { id: 230, english: 'kingdra', japanese: 'キングドラ', type: ['water', 'dragon'], rarity: 'legendary', generation: 2 },
    'ゴマゾウ': { id: 231, english: 'phanpy', japanese: 'ゴマゾウ', type: ['ground'], rarity: 'uncommon', generation: 2 },
    'ドンファン': { id: 232, english: 'donphan', japanese: 'ドンファン', type: ['ground'], rarity: 'epic', generation: 2 },
    'ポリゴン2': { id: 233, english: 'porygon2', japanese: 'ポリゴン2', type: ['normal'], rarity: 'legendary', generation: 2 },
    'オドシシ': { id: 234, english: 'stantler', japanese: 'オドシシ', type: ['normal'], rarity: 'rare', generation: 2 },
    'ドーブル': { id: 235, english: 'smeargle', japanese: 'ドーブル', type: ['normal'], rarity: 'epic', generation: 2 },
    'バルキー': { id: 236, english: 'tyrogue', japanese: 'バルキー', type: ['fighting'], rarity: 'rare', generation: 2 },
    'カポエラー': { id: 237, english: 'hitmontop', japanese: 'カポエラー', type: ['fighting'], rarity: 'epic', generation: 2 },
    'ムチュール': { id: 238, english: 'smoochum', japanese: 'ムチュール', type: ['ice', 'psychic'], rarity: 'rare', generation: 2 },
    'エレキッド': { id: 239, english: 'elekid', japanese: 'エレキッド', type: ['electric'], rarity: 'rare', generation: 2 },
    'ブビィ': { id: 240, english: 'magby', japanese: 'ブビィ', type: ['fire'], rarity: 'rare', generation: 2 },
    'ミルタンク': { id: 241, english: 'miltank', japanese: 'ミルタンク', type: ['normal'], rarity: 'epic', generation: 2 },
    'ハピナス': { id: 242, english: 'blissey', japanese: 'ハピナス', type: ['normal'], rarity: 'legendary', generation: 2 },
    
    // 伝説ポケモン
    'ライコウ': { id: 243, english: 'raikou', japanese: 'ライコウ', type: ['electric'], rarity: 'legendary', generation: 2 },
    'エンテイ': { id: 244, english: 'entei', japanese: 'エンテイ', type: ['fire'], rarity: 'legendary', generation: 2 },
    'スイクン': { id: 245, english: 'suicune', japanese: 'スイクン', type: ['water'], rarity: 'legendary', generation: 2 },
    'ヨーギラス': { id: 246, english: 'larvitar', japanese: 'ヨーギラス', type: ['rock', 'ground'], rarity: 'epic', generation: 2 },
    'サナギラス': { id: 247, english: 'pupitar', japanese: 'サナギラス', type: ['rock', 'ground'], rarity: 'legendary', generation: 2 },
    'バンギラス': { id: 248, english: 'tyranitar', japanese: 'バンギラス', type: ['rock', 'dark'], rarity: 'legendary', generation: 2 },
    'ルギア': { id: 249, english: 'lugia', japanese: 'ルギア', type: ['psychic', 'flying'], rarity: 'legendary', generation: 2 },
    'ホウオウ': { id: 250, english: 'ho-oh', japanese: 'ホウオウ', type: ['fire', 'flying'], rarity: 'legendary', generation: 2 },
    'セレビィ': { id: 251, english: 'celebi', japanese: 'セレビィ', type: ['psychic', 'grass'], rarity: 'legendary', generation: 2 },
    
    // === 第3世代（ホウエン地方） ===
    
    // 御三家ライン
    'キモリ': { id: 252, english: 'treecko', japanese: 'キモリ', type: ['grass'], rarity: 'rare', generation: 3 },
    'ジュプトル': { id: 253, english: 'grovyle', japanese: 'ジュプトル', type: ['grass'], rarity: 'epic', generation: 3 },
    'ジュカイン': { id: 254, english: 'sceptile', japanese: 'ジュカイン', type: ['grass'], rarity: 'legendary', generation: 3 },
    'アチャモ': { id: 255, english: 'torchic', japanese: 'アチャモ', type: ['fire'], rarity: 'rare', generation: 3 },
    'ワカシャモ': { id: 256, english: 'combusken', japanese: 'ワカシャモ', type: ['fire', 'fighting'], rarity: 'epic', generation: 3 },
    'バシャーモ': { id: 257, english: 'blaziken', japanese: 'バシャーモ', type: ['fire', 'fighting'], rarity: 'legendary', generation: 3 },
    'ミズゴロウ': { id: 258, english: 'mudkip', japanese: 'ミズゴロウ', type: ['water'], rarity: 'rare', generation: 3 },
    'ヌマクロー': { id: 259, english: 'marshtomp', japanese: 'ヌマクロー', type: ['water', 'ground'], rarity: 'epic', generation: 3 },
    'ラグラージ': { id: 260, english: 'swampert', japanese: 'ラグラージ', type: ['water', 'ground'], rarity: 'legendary', generation: 3 },
    
    // 序盤〜中級ポケモン
    'ポチエナ': { id: 261, english: 'poochyena', japanese: 'ポチエナ', type: ['dark'], rarity: 'common', generation: 3 },
    'グラエナ': { id: 262, english: 'mightyena', japanese: 'グラエナ', type: ['dark'], rarity: 'uncommon', generation: 3 },
    'ジグザグマ': { id: 263, english: 'zigzagoon', japanese: 'ジグザグマ', type: ['normal'], rarity: 'common', generation: 3 },
    'マッスグマ': { id: 264, english: 'linoone', japanese: 'マッスグマ', type: ['normal'], rarity: 'uncommon', generation: 3 },
    'ケムッソ': { id: 265, english: 'wurmple', japanese: 'ケムッソ', type: ['bug'], rarity: 'common', generation: 3 },
    'カラサリス': { id: 266, english: 'silcoon', japanese: 'カラサリス', type: ['bug'], rarity: 'common', generation: 3 },
    'アゲハント': { id: 267, english: 'beautifly', japanese: 'アゲハント', type: ['bug', 'flying'], rarity: 'uncommon', generation: 3 },
    'マユルド': { id: 268, english: 'cascoon', japanese: 'マユルド', type: ['bug'], rarity: 'common', generation: 3 },
    'ドクケイル': { id: 269, english: 'dustox', japanese: 'ドクケイル', type: ['bug', 'poison'], rarity: 'uncommon', generation: 3 },
    
    'ハスボー': { id: 270, english: 'lotad', japanese: 'ハスボー', type: ['water', 'grass'], rarity: 'uncommon', generation: 3 },
    'ハスブレロ': { id: 271, english: 'lombre', japanese: 'ハスブレロ', type: ['water', 'grass'], rarity: 'uncommon', generation: 3 },
    'ルンパッパ': { id: 272, english: 'ludicolo', japanese: 'ルンパッパ', type: ['water', 'grass'], rarity: 'rare', generation: 3 },
    'タネボー': { id: 273, english: 'seedot', japanese: 'タネボー', type: ['grass'], rarity: 'uncommon', generation: 3 },
    'コノハナ': { id: 274, english: 'nuzleaf', japanese: 'コノハナ', type: ['grass', 'dark'], rarity: 'uncommon', generation: 3 },
    'ダーテング': { id: 275, english: 'shiftry', japanese: 'ダーテング', type: ['grass', 'dark'], rarity: 'rare', generation: 3 },
    
    'スバメ': { id: 276, english: 'taillow', japanese: 'スバメ', type: ['normal', 'flying'], rarity: 'common', generation: 3 },
    'オオスバメ': { id: 277, english: 'swellow', japanese: 'オオスバメ', type: ['normal', 'flying'], rarity: 'uncommon', generation: 3 },
    'キャモメ': { id: 278, english: 'wingull', japanese: 'キャモメ', type: ['water', 'flying'], rarity: 'common', generation: 3 },
    'ペリッパー': { id: 279, english: 'pelipper', japanese: 'ペリッパー', type: ['water', 'flying'], rarity: 'uncommon', generation: 3 },
    
    // 人気・中級ポケモン
    'ラルトス': { id: 280, english: 'ralts', japanese: 'ラルトス', type: ['psychic', 'fairy'], rarity: 'rare', generation: 3 },
    'キルリア': { id: 281, english: 'kirlia', japanese: 'キルリア', type: ['psychic', 'fairy'], rarity: 'epic', generation: 3 },
    'サーナイト': { id: 282, english: 'gardevoir', japanese: 'サーナイト', type: ['psychic', 'fairy'], rarity: 'legendary', generation: 3 },
    'アメタマ': { id: 283, english: 'surskit', japanese: 'アメタマ', type: ['bug', 'water'], rarity: 'uncommon', generation: 3 },
    'アメモース': { id: 284, english: 'masquerain', japanese: 'アメモース', type: ['bug', 'flying'], rarity: 'rare', generation: 3 },
    'キノココ': { id: 285, english: 'shroomish', japanese: 'キノココ', type: ['grass'], rarity: 'uncommon', generation: 3 },
    'キノガッサ': { id: 286, english: 'breloom', japanese: 'キノガッサ', type: ['grass', 'fighting'], rarity: 'epic', generation: 3 },
    'ナマケロ': { id: 287, english: 'slakoth', japanese: 'ナマケロ', type: ['normal'], rarity: 'uncommon', generation: 3 },
    'ヤルキモノ': { id: 288, english: 'vigoroth', japanese: 'ヤルキモノ', type: ['normal'], rarity: 'rare', generation: 3 },
    'ケッキング': { id: 289, english: 'slaking', japanese: 'ケッキング', type: ['normal'], rarity: 'legendary', generation: 3 },
    
    'ツチニン': { id: 290, english: 'nincada', japanese: 'ツチニン', type: ['bug', 'ground'], rarity: 'uncommon', generation: 3 },
    'テッカニン': { id: 291, english: 'ninjask', japanese: 'テッカニン', type: ['bug', 'flying'], rarity: 'epic', generation: 3 },
    'ヌケニン': { id: 292, english: 'shedinja', japanese: 'ヌケニン', type: ['bug', 'ghost'], rarity: 'epic', generation: 3 },
    
    'ゴニョニョ': { id: 293, english: 'whismur', japanese: 'ゴニョニョ', type: ['normal'], rarity: 'common', generation: 3 },
    'ドゴーム': { id: 294, english: 'loudred', japanese: 'ドゴーム', type: ['normal'], rarity: 'uncommon', generation: 3 },
    'バクオング': { id: 295, english: 'exploud', japanese: 'バクオング', type: ['normal'], rarity: 'rare', generation: 3 },
    'マクノシタ': { id: 296, english: 'makuhita', japanese: 'マクノシタ', type: ['fighting'], rarity: 'uncommon', generation: 3 },
    'ハリテヤマ': { id: 297, english: 'hariyama', japanese: 'ハリテヤマ', type: ['fighting'], rarity: 'epic', generation: 3 },
    
    'ルリリ': { id: 298, english: 'azurill', japanese: 'ルリリ', type: ['normal', 'fairy'], rarity: 'uncommon', generation: 3 },
    'ノズパス': { id: 299, english: 'nosepass', japanese: 'ノズパス', type: ['rock'], rarity: 'rare', generation: 3 },
    'エネコ': { id: 300, english: 'skitty', japanese: 'エネコ', type: ['normal'], rarity: 'uncommon', generation: 3 },
    'エネコロロ': { id: 301, english: 'delcatty', japanese: 'エネコロロ', type: ['normal'], rarity: 'rare', generation: 3 },
    
    // 上級・人気ポケモン
    'ヤミラミ': { id: 302, english: 'sableye', japanese: 'ヤミラミ', type: ['dark', 'ghost'], rarity: 'epic', generation: 3 },
    'クチート': { id: 303, english: 'mawile', japanese: 'クチート', type: ['steel', 'fairy'], rarity: 'epic', generation: 3 },
    'ココドラ': { id: 304, english: 'aron', japanese: 'ココドラ', type: ['steel', 'rock'], rarity: 'uncommon', generation: 3 },
    'コドラ': { id: 305, english: 'lairon', japanese: 'コドラ', type: ['steel', 'rock'], rarity: 'rare', generation: 3 },
    'ボスゴドラ': { id: 306, english: 'aggron', japanese: 'ボスゴドラ', type: ['steel', 'rock'], rarity: 'legendary', generation: 3 },
    
    'アサナン': { id: 307, english: 'meditite', japanese: 'アサナン', type: ['fighting', 'psychic'], rarity: 'uncommon', generation: 3 },
    'チャーレム': { id: 308, english: 'medicham', japanese: 'チャーレム', type: ['fighting', 'psychic'], rarity: 'epic', generation: 3 },
    'ラクライ': { id: 309, english: 'electrike', japanese: 'ラクライ', type: ['electric'], rarity: 'uncommon', generation: 3 },
    'ライボルト': { id: 310, english: 'manectric', japanese: 'ライボルト', type: ['electric'], rarity: 'epic', generation: 3 },
    'プラスル': { id: 311, english: 'plusle', japanese: 'プラスル', type: ['electric'], rarity: 'rare', generation: 3 },
    'マイナン': { id: 312, english: 'minun', japanese: 'マイナン', type: ['electric'], rarity: 'rare', generation: 3 },
    
    'バルビート': { id: 313, english: 'volbeat', japanese: 'バルビート', type: ['bug'], rarity: 'rare', generation: 3 },
    'イルミーゼ': { id: 314, english: 'illumise', japanese: 'イルミーゼ', type: ['bug'], rarity: 'rare', generation: 3 },
    'ロゼリア': { id: 315, english: 'roselia', japanese: 'ロゼリア', type: ['grass', 'poison'], rarity: 'rare', generation: 3 },
    'ゴクリン': { id: 316, english: 'gulpin', japanese: 'ゴクリン', type: ['poison'], rarity: 'uncommon', generation: 3 },
    'マルノーム': { id: 317, english: 'swalot', japanese: 'マルノーム', type: ['poison'], rarity: 'rare', generation: 3 },
    'キバニア': { id: 318, english: 'carvanha', japanese: 'キバニア', type: ['water', 'dark'], rarity: 'uncommon', generation: 3 },
    'サメハダー': { id: 319, english: 'sharpedo', japanese: 'サメハダー', type: ['water', 'dark'], rarity: 'epic', generation: 3 },
    'ホエルコ': { id: 320, english: 'wailmer', japanese: 'ホエルコ', type: ['water'], rarity: 'uncommon', generation: 3 },
    'ホエルオー': { id: 321, english: 'wailord', japanese: 'ホエルオー', type: ['water'], rarity: 'epic', generation: 3 },
    'ドンメル': { id: 322, english: 'numel', japanese: 'ドンメル', type: ['fire', 'ground'], rarity: 'uncommon', generation: 3 },
    'バクーダ': { id: 323, english: 'camerupt', japanese: 'バクーダ', type: ['fire', 'ground'], rarity: 'epic', generation: 3 },
    // 修正: 324 はコータス（Torkoal）。第2世代のマグマッグ(218)とは重複しないように別名にしない
    'コータス': { id: 324, english: 'torkoal', japanese: 'コータス', type: ['fire'], rarity: 'epic', generation: 3 },
    
    'バネブー': { id: 325, english: 'spoink', japanese: 'バネブー', type: ['psychic'], rarity: 'uncommon', generation: 3 },
    'ブーピッグ': { id: 326, english: 'grumpig', japanese: 'ブーピッグ', type: ['psychic'], rarity: 'rare', generation: 3 },
    'パッチール': { id: 327, english: 'spinda', japanese: 'パッチール', type: ['normal'], rarity: 'rare', generation: 3 },
    'ナックラー': { id: 328, english: 'trapinch', japanese: 'ナックラー', type: ['ground'], rarity: 'uncommon', generation: 3 },
    'ビブラーバ': { id: 329, english: 'vibrava', japanese: 'ビブラーバ', type: ['ground', 'dragon'], rarity: 'rare', generation: 3 },
    'フライゴン': { id: 330, english: 'flygon', japanese: 'フライゴン', type: ['ground', 'dragon'], rarity: 'legendary', generation: 3 },
    
    'サボネア': { id: 331, english: 'cacnea', japanese: 'サボネア', type: ['grass'], rarity: 'uncommon', generation: 3 },
    'ノクタス': { id: 332, english: 'cacturne', japanese: 'ノクタス', type: ['grass', 'dark'], rarity: 'rare', generation: 3 },
    'チルット': { id: 333, english: 'swablu', japanese: 'チルット', type: ['normal', 'flying'], rarity: 'uncommon', generation: 3 },
    'チルタリス': { id: 334, english: 'altaria', japanese: 'チルタリス', type: ['dragon', 'flying'], rarity: 'epic', generation: 3 },
    'ザングース': { id: 335, english: 'zangoose', japanese: 'ザングース', type: ['normal'], rarity: 'epic', generation: 3 },
    'ハブネーク': { id: 336, english: 'seviper', japanese: 'ハブネーク', type: ['poison'], rarity: 'epic', generation: 3 },
    'ルナトーン': { id: 337, english: 'lunatone', japanese: 'ルナトーン', type: ['rock', 'psychic'], rarity: 'epic', generation: 3 },
    'ソルロック': { id: 338, english: 'solrock', japanese: 'ソルロック', type: ['rock', 'psychic'], rarity: 'epic', generation: 3 },
    
    'ドジョッチ': { id: 339, english: 'barboach', japanese: 'ドジョッチ', type: ['water', 'ground'], rarity: 'uncommon', generation: 3 },
    'ナマズン': { id: 340, english: 'whiscash', japanese: 'ナマズン', type: ['water', 'ground'], rarity: 'epic', generation: 3 },
    'ヘイガニ': { id: 341, english: 'corphish', japanese: 'ヘイガニ', type: ['water'], rarity: 'uncommon', generation: 3 },
    'シザリガー': { id: 342, english: 'crawdaunt', japanese: 'シザリガー', type: ['water', 'dark'], rarity: 'epic', generation: 3 },
    'ヤジロン': { id: 343, english: 'baltoy', japanese: 'ヤジロン', type: ['ground', 'psychic'], rarity: 'uncommon', generation: 3 },
    'ネンドール': { id: 344, english: 'claydol', japanese: 'ネンドール', type: ['ground', 'psychic'], rarity: 'epic', generation: 3 },
    'リリーラ': { id: 345, english: 'lileep', japanese: 'リリーラ', type: ['rock', 'grass'], rarity: 'rare', generation: 3 },
    'ユレイドル': { id: 346, english: 'cradily', japanese: 'ユレイドル', type: ['rock', 'grass'], rarity: 'epic', generation: 3 },
    'アノプス': { id: 347, english: 'anorith', japanese: 'アノプス', type: ['rock', 'bug'], rarity: 'rare', generation: 3 },
    'アーマルド': { id: 348, english: 'armaldo', japanese: 'アーマルド', type: ['rock', 'bug'], rarity: 'epic', generation: 3 },
    'ヒンバス': { id: 349, english: 'feebas', japanese: 'ヒンバス', type: ['water'], rarity: 'rare', generation: 3 },
    'ミロカロス': { id: 350, english: 'milotic', japanese: 'ミロカロス', type: ['water'], rarity: 'legendary', generation: 3 },
    'ポワルン': { id: 351, english: 'castform', japanese: 'ポワルン', type: ['normal'], rarity: 'epic', generation: 3 },
    'カクレオン': { id: 352, english: 'kecleon', japanese: 'カクレオン', type: ['normal'], rarity: 'rare', generation: 3 },
    'カゲボウズ': { id: 353, english: 'shuppet', japanese: 'カゲボウズ', type: ['ghost'], rarity: 'uncommon', generation: 3 },
    'ジュペッタ': { id: 354, english: 'banette', japanese: 'ジュペッタ', type: ['ghost'], rarity: 'epic', generation: 3 },
    'ヨマワル': { id: 355, english: 'duskull', japanese: 'ヨマワル', type: ['ghost'], rarity: 'uncommon', generation: 3 },
    'サマヨール': { id: 356, english: 'dusclops', japanese: 'サマヨール', type: ['ghost'], rarity: 'epic', generation: 3 },
    'トロピウス': { id: 357, english: 'tropius', japanese: 'トロピウス', type: ['grass', 'flying'], rarity: 'epic', generation: 3 },
    'チリーン': { id: 358, english: 'chimecho', japanese: 'チリーン', type: ['psychic'], rarity: 'rare', generation: 3 },
    'アブソル': { id: 359, english: 'absol', japanese: 'アブソル', type: ['dark'], rarity: 'epic', generation: 3 },
    
    'ソーナノ': { id: 360, english: 'wynaut', japanese: 'ソーナノ', type: ['psychic'], rarity: 'rare', generation: 3 },
    'ユキワラシ': { id: 361, english: 'snorunt', japanese: 'ユキワラシ', type: ['ice'], rarity: 'uncommon', generation: 3 },
    'オニゴーリ': { id: 362, english: 'glalie', japanese: 'オニゴーリ', type: ['ice'], rarity: 'epic', generation: 3 },
    'タマザラシ': { id: 363, english: 'spheal', japanese: 'タマザラシ', type: ['ice', 'water'], rarity: 'uncommon', generation: 3 },
    'トドグラー': { id: 364, english: 'sealeo', japanese: 'トドグラー', type: ['ice', 'water'], rarity: 'rare', generation: 3 },
    'トドゼルガ': { id: 365, english: 'walrein', japanese: 'トドゼルガ', type: ['ice', 'water'], rarity: 'epic', generation: 3 },
    'パールル': { id: 366, english: 'clamperl', japanese: 'パールル', type: ['water'], rarity: 'uncommon', generation: 3 },
    'ハンテール': { id: 367, english: 'huntail', japanese: 'ハンテール', type: ['water'], rarity: 'rare', generation: 3 },
    'サクラビス': { id: 368, english: 'gorebyss', japanese: 'サクラビス', type: ['water'], rarity: 'rare', generation: 3 },
    'ジーランス': { id: 369, english: 'relicanth', japanese: 'ジーランス', type: ['water', 'rock'], rarity: 'epic', generation: 3 },
    'ラブカス': { id: 370, english: 'luvdisc', japanese: 'ラブカス', type: ['water'], rarity: 'rare', generation: 3 },
    'タツベイ': { id: 371, english: 'bagon', japanese: 'タツベイ', type: ['dragon'], rarity: 'epic', generation: 3 },
    'コモルー': { id: 372, english: 'shelgon', japanese: 'コモルー', type: ['dragon'], rarity: 'legendary', generation: 3 },
    'ボーマンダ': { id: 373, english: 'salamence', japanese: 'ボーマンダ', type: ['dragon', 'flying'], rarity: 'legendary', generation: 3 },
    'ダンバル': { id: 374, english: 'beldum', japanese: 'ダンバル', type: ['steel', 'psychic'], rarity: 'epic', generation: 3 },
    'メタング': { id: 375, english: 'metang', japanese: 'メタング', type: ['steel', 'psychic'], rarity: 'legendary', generation: 3 },
    'メタグロス': { id: 376, english: 'metagross', japanese: 'メタグロス', type: ['steel', 'psychic'], rarity: 'legendary', generation: 3 },
    
    // 伝説ポケモン
    'レジロック': { id: 377, english: 'regirock', japanese: 'レジロック', type: ['rock'], rarity: 'legendary', generation: 3 },
    'レジアイス': { id: 378, english: 'regice', japanese: 'レジアイス', type: ['ice'], rarity: 'legendary', generation: 3 },
    'レジスチル': { id: 379, english: 'registeel', japanese: 'レジスチル', type: ['steel'], rarity: 'legendary', generation: 3 },
    'ラティアス': { id: 380, english: 'latias', japanese: 'ラティアス', type: ['dragon', 'psychic'], rarity: 'legendary', generation: 3 },
    'ラティオス': { id: 381, english: 'latios', japanese: 'ラティオス', type: ['dragon', 'psychic'], rarity: 'legendary', generation: 3 },
    'カイオーガ': { id: 382, english: 'kyogre', japanese: 'カイオーガ', type: ['water'], rarity: 'legendary', generation: 3 },
    'グラードン': { id: 383, english: 'groudon', japanese: 'グラードン', type: ['ground'], rarity: 'legendary', generation: 3 },
    'レックウザ': { id: 384, english: 'rayquaza', japanese: 'レックウザ', type: ['dragon', 'flying'], rarity: 'legendary', generation: 3 },
    'ジラーチ': { id: 385, english: 'jirachi', japanese: 'ジラーチ', type: ['steel', 'psychic'], rarity: 'legendary', generation: 3 },
    'デオキシス': { id: 386, english: 'deoxys', japanese: 'デオキシス', type: ['psychic'], rarity: 'legendary', generation: 3 },
  };

  // 下位互換性のための御三家マッピング
  private static readonly STARTER_MAPPING = this.POKEMON_MAPPING;

  // キャッシュ機能付きAPI呼び出し
  private static async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`PokeAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('PokeAPI fetch failed:', error);
      throw error;
    }
  }

  // ポケモンの基本情報を取得
  static async getPokemonDetails(pokemonName: string): Promise<PokemonDetails> {
    try {
      // 日本語名から英語名とIDを取得、または英語名から日本語名を逆引き
      let mapping = this.POKEMON_MAPPING[pokemonName];
      
      // 日本語名で見つからない場合、英語名での逆引きを試行
      if (!mapping) {
        // 動的に逆引きマッピングを生成（全ポケモン対応）
        const englishToJapanese: Record<string, string> = {};
        Object.values(this.POKEMON_MAPPING).forEach(pokemon => {
          englishToJapanese[pokemon.english.toLowerCase()] = pokemon.japanese;
        });
        
        const japaneseName = englishToJapanese[pokemonName.toLowerCase()];
        if (japaneseName) {
          mapping = this.POKEMON_MAPPING[japaneseName];
        }
      }
      
      if (!mapping) {
        throw new Error(`Unknown pokemon: ${pokemonName}. Available: ${Object.keys(this.POKEMON_MAPPING).join(', ')}`);
      }

      // ポケモンの基本データを取得
      const pokemonData = await this.fetchWithCache(
        `${this.BASE_URL}/pokemon/${mapping.id}`
      );

      // 種族データを取得（日本語名のため）
      const speciesData = await this.fetchWithCache(
        `${this.BASE_URL}/pokemon-species/${mapping.id}`
      );

      // 日本語名を抽出
      const japaneseName = speciesData.names.find(
        (name: any) => name.language.name === 'ja'
      )?.name || mapping.japanese;

      return {
        id: pokemonData.id,
        name: japaneseName,
        englishName: mapping.english,
        types: mapping.type,
        sprites: {
          default: pokemonData.sprites.front_default,
          shiny: pokemonData.sprites.front_shiny,
          official: pokemonData.sprites.other['official-artwork'].front_default,
          home: pokemonData.sprites.other.home.front_default,
        },
        stats: {
          hp: pokemonData.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 45,
          attack: pokemonData.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 49,
          defense: pokemonData.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 49,
          speed: pokemonData.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 45,
        },
        height: pokemonData.height,
        weight: pokemonData.weight
      };
    } catch (error) {
      console.error(`Failed to fetch Pokemon details for ${pokemonName}:`, error);
      // フォールバック: 基本データを返す
      const mapping = this.STARTER_MAPPING[pokemonName];
      return {
        id: mapping?.id || 0,
        name: pokemonName,
        englishName: mapping?.english || 'unknown',
        types: mapping?.type || ['normal'],
        sprites: {
          default: '/pokemon-fallback.png',
          shiny: '/pokemon-fallback.png',
          official: '/pokemon-fallback.png',
          home: '/pokemon-fallback.png',
        },
        stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
        height: 0,
        weight: 0
      };
    }
  }

  // 複数ポケモンの情報を並列取得
  static async getBatchPokemonDetails(pokemonNames: string[]): Promise<PokemonDetails[]> {
    const promises = pokemonNames.map(name => this.getPokemonDetails(name));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to fetch ${pokemonNames[index]}:`, result.reason);
        // エラー時のフォールバック
        const name = pokemonNames[index];
        const mapping = this.STARTER_MAPPING[name];
        return {
          id: mapping?.id || 0,
          name,
          englishName: mapping?.english || 'unknown',
          types: mapping?.type || ['normal'],
          sprites: {
            default: '/pokemon-fallback.png',
            shiny: '/pokemon-fallback.png', 
            official: '/pokemon-fallback.png',
            home: '/pokemon-fallback.png',
          },
          stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
          height: 0,
          weight: 0
        };
      }
    });
  }

  // 最適な画像URLを選択
  static getBestImageUrl(sprites: PokemonDetails['sprites'], preferOfficial: boolean = true): string {
    if (preferOfficial && sprites.official) return sprites.official;
    if (sprites.home) return sprites.home;
    if (sprites.default) return sprites.default;
    return '/pokemon-fallback.png';
  }

  // タイプ別カラーマッピング
  static getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type] || typeColors.normal;
  }

  // キャッシュクリア（デバッグ用）
  static clearCache(): void {
    this.cache.clear();
  }

  // すべてのポケモンリスト取得
  static getAllPokemons(): string[] {
    return Object.keys(this.POKEMON_MAPPING);
  }

  // 御三家ポケモンリスト取得
  static getStarterPokemons(): string[] {
    return ['フシギダネ', 'ヒトカゲ', 'ゼニガメ'];
  }

  // ポケモン存在チェック
  static isValidPokemon(pokemonName: string): boolean {
    return pokemonName in this.POKEMON_MAPPING;
  }

  // 下位互換性
  static isValidStarter(pokemonName: string): boolean {
    return this.isValidPokemon(pokemonName);
  }

  // 追加: ランダムポケモン取得（件数指定）
  static async fetchRandomPokemon(count: number = 1): Promise<PokemonDetails[]> {
    const all = this.getAllPokemons();
    const results: PokemonDetails[] = [];
    const picks = [...all].sort(() => Math.random() - 0.5).slice(0, Math.max(1, count));
    for (const name of picks) {
      try {
        const details = await this.getPokemonDetails(name);
        results.push(details);
      } catch {
        // skip on error
      }
    }
    return results;
  }
}

// ユーティリティ関数
export const pokemonUtils = {
  // 日本語名から画像URL取得のショートカット
  async getImageUrl(pokemonName: string, preferOfficial: boolean = true): Promise<string> {
    try {
      const details = await PokemonAPI.getPokemonDetails(pokemonName);
      return PokemonAPI.getBestImageUrl(details.sprites, preferOfficial);
    } catch (error) {
      console.error(`Failed to get image for ${pokemonName}:`, error);
      return '/pokemon-fallback.png';
    }
  },

  // タイプ別背景グラデーション生成
  getTypeGradient(types: string[]): string {
    if (types.length === 1) {
      const color = PokemonAPI.getTypeColor(types[0]);
      return `linear-gradient(135deg, ${color}99, ${color}66)`;
    } else if (types.length === 2) {
      const color1 = PokemonAPI.getTypeColor(types[0]);
      const color2 = PokemonAPI.getTypeColor(types[1]);
      return `linear-gradient(135deg, ${color1}99, ${color2}66)`;
    }
    return `linear-gradient(135deg, #A8A87899, #A8A87866)`;
  }
};