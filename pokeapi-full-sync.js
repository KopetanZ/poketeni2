// PokeAPI統合 全1,302種ポケモンデータ同期スクリプト
// 作成日: 2025-01-13
// 目的: PokeAPIから全ポケモンデータを取得・データベース化

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PokeAPI設定
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1302; // 全世代・全フォーム含む
const BATCH_SIZE = 20; // バッチ処理サイズ
const DELAY_BETWEEN_BATCHES = 1000; // バッチ間の遅延（ミリ秒）

// レアリティ判定ロジック
function determineRarity(baseStats, types) {
  const totalStats = Object.values(baseStats).reduce((sum, stat) => sum + stat, 0);
  
  // 伝説・幻のポケモン判定（IDベース）
  const legendaryIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 1124, 1125, 1126, 1127, 1128, 1129, 1130, 1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 1158, 1159, 1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179, 1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189, 1190, 1191, 1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215, 1216, 1217, 1218, 1219, 1220, 1221, 1222, 1223, 1224, 1225, 1226, 1227, 1228, 1229, 1230, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239, 1240, 1241, 1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259, 1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1300, 1301, 1302];
  
  if (legendaryIds.includes(baseStats.id)) {
    return 'legendary';
  }
  
  // 総合ステータスによる判定
  if (totalStats >= 600) {
    return 'epic';
  } else if (totalStats >= 500) {
    return 'rare';
  } else if (totalStats >= 400) {
    return 'uncommon';
  } else {
    return 'common';
  }
}

// 進化ステージ判定
function determineEvolutionStage(evolutionChain) {
  if (!evolutionChain || !evolutionChain.chain) {
    return 1;
  }
  
  // 進化チェーンの深さを計算
  let maxDepth = 1;
  let current = evolutionChain.chain;
  
  while (current.evolves_to && current.evolves_to.length > 0) {
    maxDepth++;
    current = current.evolves_to[0]; // 最初の進化先を追跡
  }
  
  return maxDepth;
}

// 配属可能判定
function isRecruitable(evolutionStage, rarity) {
  // 基本形（1進化）のみ配属可能
  if (evolutionStage === 1) {
    return true;
  }
  
  // 進化しないポケモンも配属可能
  if (evolutionStage === 1) {
    return true;
  }
  
  // 伝説級は進化後でも配属可能（特別扱い）
  if (rarity === 'legendary') {
    return true;
  }
  
  return false;
}

// 遅延関数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 単一ポケモンデータ取得
async function fetchPokemonData(pokemonId) {
  try {
    console.log(`🔍 ポケモンID ${pokemonId} のデータ取得中...`);
    
    // 1. ポケモン基本データ取得
    const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
    if (!pokemonResponse.ok) {
      throw new Error(`ポケモンデータ取得失敗: ${pokemonResponse.status}`);
    }
    const pokemonData = await pokemonResponse.json();
    
    // 2. 種族データ取得
    const speciesResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${pokemonId}`);
    if (!speciesResponse.ok) {
      throw new Error(`種族データ取得失敗: ${speciesResponse.status}`);
    }
    const speciesData = await speciesResponse.json();
    
    // 3. 進化チェーンデータ取得
    let evolutionChain = null;
    if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      if (evolutionResponse.ok) {
        evolutionChain = await evolutionResponse.json();
      }
    }
    
    // 4. 日本語名取得
    const japaneseName = speciesData.names.find(name => name.language.name === 'ja-Hrkt')?.name || 
                         speciesData.names.find(name => name.language.name === 'ja')?.name || 
                         pokemonData.name;
    
    // 5. 基本ステータス抽出
    const baseStats = {
      id: pokemonId,
      hp: pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
      attack: pokemonData.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
      defense: pokemonData.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
      sp_attack: pokemonData.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
      sp_defense: pokemonData.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
      speed: pokemonData.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
    };
    
    // 6. レアリティ判定
    const rarity = determineRarity(baseStats, pokemonData.types, evolutionChain);
    
    // 7. 進化ステージ判定
    const evolutionStage = determineEvolutionStage(evolutionChain);
    
    // 8. 配属可能判定
    const recruitable = isRecruitable(evolutionStage, rarity);
    
    // 9. 世代判定（安全な処理）
    let generation = 1; // デフォルト値
    
    try {
      if (speciesData.generation && speciesData.generation.name) {
        const generationMatch = speciesData.generation.name.match(/generation-(\d+)/);
        if (generationMatch) {
          generation = parseInt(generationMatch[1]);
        } else {
          // 世代名が予期しない形式の場合、IDから推定
          if (pokemonId <= 151) generation = 1;
          else if (pokemonId <= 251) generation = 2;
          else if (pokemonId <= 386) generation = 3;
          else if (pokemonId <= 493) generation = 4;
          else if (pokemonId <= 649) generation = 5;
          else if (pokemonId <= 721) generation = 6;
          else if (pokemonId <= 809) generation = 7;
          else if (pokemonId <= 905) generation = 8;
          else generation = 9;
        }
      } else {
        // 世代情報が存在しない場合、IDから推定
        if (pokemonId <= 151) generation = 1;
        else if (pokemonId <= 251) generation = 2;
        else if (pokemonId <= 386) generation = 3;
        else if (pokemonId <= 493) generation = 4;
        else if (pokemonId <= 649) generation = 5;
        else if (pokemonId <= 721) generation = 6;
        else if (pokemonId <= 809) generation = 7;
        else if (pokemonId <= 905) generation = 8;
        else generation = 9;
      }
    } catch (error) {
      console.warn(`⚠️ ポケモンID ${pokemonId} の世代判定でエラー: ${error.message}`);
      // エラーが発生した場合もIDから推定
      if (pokemonId <= 151) generation = 1;
      else if (pokemonId <= 251) generation = 2;
      else if (pokemonId <= 386) generation = 3;
      else if (pokemonId <= 493) generation = 4;
      else if (pokemonId <= 649) generation = 5;
      else if (pokemonId <= 721) generation = 6;
      else if (pokemonId <= 809) generation = 7;
      else if (pokemonId <= 905) generation = 8;
      else generation = 9;
    }
    
    // 世代値の検証
    if (isNaN(generation) || generation < 1 || generation > 9) {
      console.warn(`⚠️ ポケモンID ${pokemonId} の世代値が不正: ${generation}, デフォルト値1を使用`);
      generation = 1;
    }
    
    // 10. スプライトURL取得
    const spriteUrls = {
      default: pokemonData.sprites.front_default,
      official: pokemonData.sprites.other['official-artwork']?.front_default || pokemonData.sprites.front_default
    };
    
    // データの最終検証
    const pokemonRecord = {
      pokemon_id: pokemonId,
      japanese_name: japaneseName || `Pokemon_${pokemonId}`,
      english_name: pokemonData.name || `pokemon_${pokemonId}`,
      types: pokemonData.types.map(t => t.type.name) || ['normal'],
      base_stats: baseStats,
      sprite_urls: spriteUrls,
      rarity_level: rarity || 'common',
      generation: generation,
      is_recruitable: recruitable !== undefined ? recruitable : true,
    };
    
    // 必須フィールドの検証
    if (!pokemonRecord.japanese_name || !pokemonRecord.english_name || 
        !pokemonRecord.types || pokemonRecord.types.length === 0 ||
        !pokemonRecord.base_stats || !pokemonRecord.sprite_urls ||
        !pokemonRecord.rarity_level || !pokemonRecord.generation ||
        pokemonRecord.is_recruitable === undefined) {
      console.warn(`⚠️ ポケモンID ${pokemonId} のデータが不完全:`, pokemonRecord);
      return null;
    }
    
    return pokemonRecord;
    
  } catch (error) {
    console.error(`❌ ポケモンID ${pokemonId} のデータ取得エラー:`, error.message);
    return null;
  }
}

// バッチ処理でポケモンデータをデータベースに挿入
async function insertPokemonBatch(pokemonDataArray) {
  try {
    const { data, error } = await supabase
      .from('pokemon_master_data')
      .upsert(pokemonDataArray, { 
        onConflict: 'pokemon_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ バッチ挿入完了: ${pokemonDataArray.length}件`);
    return data;
    
  } catch (error) {
    console.error('❌ バッチ挿入エラー:', error.message);
    throw error;
  }
}

// 進化チェーンデータをデータベースに挿入
async function insertEvolutionChains(pokemonDataArray) {
  try {
    const evolutionData = [];
    
    for (const pokemon of pokemonDataArray) {
      // evolution_chainは別途取得したデータを使用
      if (pokemon.evolutionChain && pokemon.evolutionChain.chain) {
        const chain = pokemon.evolutionChain.chain;
        
        // 進化チェーンの解析
        let stage = 1;
        let evolvesFrom = null;
        let evolvesTo = [];
        let conditions = null;
        
        // 進化先のIDを抽出
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          evolvesTo = chain.evolves_to.map(evo => {
            const evoId = parseInt(evo.species.url.split('/').slice(-2, -1)[0]);
            return evoId;
          });
          
          // 進化条件を抽出
          if (chain.evolves_to[0].evolution_details && chain.evolves_to[0].evolution_details.length > 0) {
            const detail = chain.evolves_to[0].evolution_details[0];
            conditions = {
              level: detail.min_level,
              item: detail.item?.name,
              method: detail.trigger?.name
            };
          }
        }
        
        evolutionData.push({
          pokemon_id: pokemon.pokemon_id,
          evolution_stage: stage,
          evolves_from: evolvesFrom,
          evolves_to: evolvesTo,
          evolution_conditions: conditions
        });
      }
    }
    
    if (evolutionData.length > 0) {
      const { data, error } = await supabase
        .from('pokemon_evolution_chains')
        .upsert(evolutionData, { 
          onConflict: 'pokemon_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ 進化チェーン挿入完了: ${evolutionData.length}件`);
      return data;
    }
    
  } catch (error) {
    console.error('❌ 進化チェーン挿入エラー:', error.message);
    throw error;
  }
}

// メイン同期処理
async function syncAllPokemon() {
  console.log('🚀 PokeAPI統合 全ポケモンデータ同期開始');
  console.log(`📊 対象ポケモン数: ${TOTAL_POKEMON}種`);
  console.log(`⚡ バッチサイズ: ${BATCH_SIZE}件`);
  console.log(`⏱️ バッチ間遅延: ${DELAY_BETWEEN_BATCHES}ms`);
  
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  let processedCount = 0;
  
  try {
    // バッチ処理で全ポケモンデータを取得・挿入
    for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
      const batchStart = i;
      const batchEnd = Math.min(i + BATCH_SIZE - 1, TOTAL_POKEMON);
      
      console.log(`\n📦 バッチ処理中: ${batchStart}-${batchEnd} / ${TOTAL_POKEMON}`);
      
      const batchPromises = [];
      for (let j = batchStart; j <= batchEnd; j++) {
        batchPromises.push(fetchPokemonData(j));
      }
      
      // バッチ内の全ポケモンデータを並行取得
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      
      // データの検証
      if (validResults.length === 0) {
        console.warn(`⚠️ バッチ ${batchStart}-${batchEnd}: 有効なデータがありません`);
        continue;
      }
      
      // 必須フィールドの最終チェック
      const validatedResults = validResults.filter(result => {
        if (!result.generation || isNaN(result.generation)) {
          console.warn(`⚠️ ポケモンID ${result.pokemon_id}: 世代値が不正: ${result.generation}`);
          return false;
        }
        if (!result.rarity_level) {
          console.warn(`⚠️ ポケモンID ${result.pokemon_id}: レアリティが不正: ${result.rarity_level}`);
          return false;
        }
        return true;
      });
      
      if (validatedResults.length === 0) {
        console.warn(`⚠️ バッチ ${batchStart}-${batchEnd}: 検証済みデータがありません`);
        continue;
      }
      
              try {
          // ポケモンデータをデータベースに挿入
          await insertPokemonBatch(validatedResults);
          
          // 進化チェーンデータを挿入
          await insertEvolutionChains(validatedResults);
          
          successCount += validatedResults.length;
          processedCount += validatedResults.length;
          
          console.log(`✅ バッチ ${batchStart}-${batchEnd} 完了: ${validatedResults.length}件成功`);
          
        } catch (error) {
          console.error(`❌ バッチ ${batchStart}-${batchEnd} エラー:`, error.message);
          errorCount += validatedResults.length;
        }
      
      // 進捗表示
      const progress = Math.round((processedCount / TOTAL_POKEMON) * 100);
      console.log(`📈 進捗: ${processedCount}/${TOTAL_POKEMON} (${progress}%)`);
      
      // 最後のバッチでなければ遅延
      if (batchEnd < TOTAL_POKEMON) {
        console.log(`⏳ ${DELAY_BETWEEN_BATCHES}ms 待機中...`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 全ポケモンデータ同期完了!');
    console.log(`📊 処理結果:`);
    console.log(`  - 成功: ${successCount}件`);
    console.log(`  - エラー: ${errorCount}件`);
    console.log(`  - 総処理時間: ${totalTime}秒`);
    console.log(`  - 平均処理速度: ${Math.round(successCount / totalTime)}件/秒`);
    
    // 統計情報表示
    await displayStatistics();
    
  } catch (error) {
    console.error('💥 同期処理で致命的エラー:', error.message);
  }
}

// 統計情報表示
async function displayStatistics() {
  try {
    console.log('\n📊 データベース統計情報:');
    
    // 総ポケモン数
    const { count: totalCount } = await supabase
      .from('pokemon_master_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`  - 登録済みポケモン数: ${totalCount}種`);
    
    // レアリティ別統計
    const { data: rarityStats } = await supabase
      .from('pokemon_master_data')
      .select('rarity_level')
      .order('rarity_level');
    
    if (rarityStats) {
      const rarityCounts = rarityStats.reduce((acc, item) => {
        acc[item.rarity_level] = (acc[item.rarity_level] || 0) + 1;
        return acc;
      }, {});
      
      console.log('  - レアリティ別分布:');
      Object.entries(rarityCounts).forEach(([rarity, count]) => {
        const percentage = Math.round((count / totalCount) * 100);
        console.log(`    ${rarity}: ${count}種 (${percentage}%)`);
      });
    }
    
    // 配属可能ポケモン数
    const { count: recruitableCount } = await supabase
      .from('pokemon_master_data')
      .select('*', { count: 'exact', head: true })
      .eq('is_recruitable', true);
    
    console.log(`  - 配属可能ポケモン数: ${recruitableCount}種`);
    
  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error.message);
  }
}

// スクリプト実行
if (require.main === module) {
  syncAllPokemon().catch(console.error);
}

module.exports = {
  syncAllPokemon,
  fetchPokemonData,
  determineRarity,
  determineEvolutionStage
};
