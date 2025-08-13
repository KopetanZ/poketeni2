'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { PokemonStats, PokemonNature } from '@/types/pokemon-stats';
import { PokemonStatsCalculator } from '@/lib/pokemon-stats-calculator';
import { canEvolve, getEvolutionInfo } from '@/lib/pokemon-species-data';
import { getAbilityData } from '@/lib/pokemon-abilities-data';
import EffortValueTrainer from './EffortValueTrainer';

interface PokemonStatsViewerProps {
  player: Player;
  onClose: () => void;
  onLevelUp?: (player: Player) => void;
  onEvolve?: (player: Player) => void;
}

export default function PokemonStatsViewer({ player, onClose, onLevelUp, onEvolve }: PokemonStatsViewerProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'growth' | 'judge' | 'ability' | 'gage'>('stats');
  const [showEvolutionConfirm, setShowEvolutionConfirm] = useState(false);
  const [showEVTrainer, setShowEVTrainer] = useState(false);
  const pokemonStats = player.pokemon_stats;

  if (!pokemonStats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ データなし</h2>
          <p className="text-gray-600 mb-4">
            このポケモンは旧システムで作成されているため、詳細な個体値情報がありません。
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const handleLevelUp = () => {
    if (!onLevelUp || !pokemonStats) return;
    
    // 経験値を追加してレベルアップ
    const growthResult = PokemonStatsCalculator.addExperience(pokemonStats, pokemonStats.experience_to_next);
    
    // プレイヤーのスキル値を更新
    player.level = pokemonStats.level;
    player.serve_skill = pokemonStats.final_stats.serve_skill;
    player.return_skill = pokemonStats.final_stats.return_skill;
    player.volley_skill = pokemonStats.final_stats.volley_skill;
    player.stroke_skill = pokemonStats.final_stats.stroke_skill;
    player.mental = pokemonStats.final_stats.mental;
    player.stamina = pokemonStats.final_stats.stamina;
    player.experience = pokemonStats.experience;
    
    onLevelUp(player);
  };

  const handleEvolve = () => {
    if (!onEvolve || !pokemonStats) return;
    
    const success = PokemonStatsCalculator.evolvePokemon(pokemonStats);
    if (success) {
      // プレイヤー情報を更新
      player.pokemon_id = pokemonStats.pokemon_id;
      player.pokemon_name = pokemonStats.pokemon_name;
      player.serve_skill = pokemonStats.final_stats.serve_skill;
      player.return_skill = pokemonStats.final_stats.return_skill;
      player.volley_skill = pokemonStats.final_stats.volley_skill;
      player.stroke_skill = pokemonStats.final_stats.stroke_skill;
      player.mental = pokemonStats.final_stats.mental;
      player.stamina = pokemonStats.final_stats.stamina;
      
      onEvolve(player);
    }
  };

  const unlockAllIVs = () => {
    if (pokemonStats) {
      PokemonStatsCalculator.unlockAllIVs(pokemonStats);
    }
  };

  const handleEVUpdate = (newEVs: typeof pokemonStats.effort_values) => {
    if (!pokemonStats) return;
    
    // 努力値を更新
    pokemonStats.effort_values = newEVs;
    pokemonStats.effort_total = Object.values(newEVs).reduce((sum, val) => sum + val, 0);
    
    // 能力値を再計算
    pokemonStats.final_stats = PokemonStatsCalculator.calculateFinalStats(pokemonStats);
    
    // プレイヤーのスキル値も更新
    if (onLevelUp) {
      player.serve_skill = pokemonStats.final_stats.serve_skill;
      player.return_skill = pokemonStats.final_stats.return_skill;
      player.volley_skill = pokemonStats.final_stats.volley_skill;
      player.stroke_skill = pokemonStats.final_stats.stroke_skill;
      player.mental = pokemonStats.final_stats.mental;
      player.stamina = pokemonStats.final_stats.stamina;
      
      onLevelUp(player);
    }
    
    setShowEVTrainer(false);
  };

  const getNatureColor = (nature: PokemonNature): string => {
    // 攻撃系は赤、防御系は青、特攻系は紫、特防系は緑、素早さ系は黄、補正なしはグレー
    if (['いじっぱり', 'やんちゃ', 'ゆうかん', 'さみしがり'].includes(nature)) return 'text-red-600';
    if (['ずぶとい', 'わんぱく', 'のうてんき', 'のんき'].includes(nature)) return 'text-blue-600';
    if (['ひかえめ', 'おっとり', 'うっかりや', 'れいせい'].includes(nature)) return 'text-purple-600';
    if (['おだやか', 'おとなしい', 'しんちょう', 'なまいき'].includes(nature)) return 'text-green-600';
    if (['ようき', 'むじゃき', 'せっかち', 'おくびょう'].includes(nature)) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case 'S': return 'bg-yellow-100 text-yellow-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-green-100 text-green-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderIVValue = (value: number, isVisible: boolean): string => {
    if (!isVisible && !pokemonStats.iv_judge_unlocked) return '??';
    return value.toString();
  };

  const getIVRank = () => {
    return PokemonStatsCalculator.calculateIVRank(pokemonStats.individual_values);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 ${pokemonStats.is_shiny ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-3xl font-bold">
                {pokemonStats.is_shiny && '✨'} {pokemonStats.pokemon_name}
              </h2>
              <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getRankColor(pokemonStats.potential_rank)}`}>
                ランク {pokemonStats.potential_rank}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              ✕ 閉じる
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>レベル: <span className="font-bold">{pokemonStats.level}</span></div>
            <div>経験値: <span className="font-bold">{pokemonStats.experience}</span></div>
            <div>次まで: <span className="font-bold">{pokemonStats.experience_to_next}</span></div>
            <div className={`font-semibold ${getNatureColor(pokemonStats.nature)}`}>
              性格: {pokemonStats.nature}
            </div>
            <div className="text-cyan-200">
              特性: {(() => {
                if (!pokemonStats.ability) return '---';
                const abilityData = getAbilityData(pokemonStats.ability);
                return abilityData ? abilityData.name : pokemonStats.ability;
              })()}
            </div>
          </div>
        </div>

        {/* タブメニュー */}
        <div className="bg-gray-50 border-b flex">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'stats' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 能力値
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'growth' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📈 成長
          </button>
          <button
            onClick={() => setActiveTab('judge')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'judge' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔍 個体値ジャッジ
          </button>
          <button
            onClick={() => setActiveTab('ability')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'ability' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ✨ 特性・性格
          </button>
          <button
            onClick={() => setActiveTab('gage')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'gage' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎮 成長ゲージ
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* 能力値タブ */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 最終能力値 */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🎾 テニス能力値</h3>
                  <div className="space-y-3">
                    {Object.entries({
                      'サーブ': pokemonStats.final_stats.serve_skill,
                      'リターン': pokemonStats.final_stats.return_skill,
                      'ボレー': pokemonStats.final_stats.volley_skill,
                      'ストローク': pokemonStats.final_stats.stroke_skill,
                      'メンタル': pokemonStats.final_stats.mental,
                      'スタミナ': pokemonStats.final_stats.stamina
                    }).map(([name, value]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="font-semibold">{name}:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(value / 100 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-blue-600 w-12">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 努力値 */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">💪 努力値 ({pokemonStats.effort_total}/510)</h3>
                    <button
                      onClick={() => setShowEVTrainer(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🎚️ 配分調整
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Object.entries({
                      'HP': pokemonStats.effort_values.hp,
                      '攻撃': pokemonStats.effort_values.attack,
                      '防御': pokemonStats.effort_values.defense,
                      '特攻': pokemonStats.effort_values.sp_attack,
                      '特防': pokemonStats.effort_values.sp_defense,
                      '素早': pokemonStats.effort_values.speed
                    }).map(([name, value]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="font-semibold">{name}:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${value / 255 * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-green-600 w-12">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 成長タブ */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📈 レベルアップ</h3>
                  <p className="text-gray-600 mb-4">
                    現在レベル {pokemonStats.level} → レベル {pokemonStats.level + 1}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>経験値</span>
                      <span>{pokemonStats.experience}/{pokemonStats.experience + pokemonStats.experience_to_next}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${pokemonStats.experience / (pokemonStats.experience + pokemonStats.experience_to_next) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={handleLevelUp}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    🆙 レベルアップ！
                  </button>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 進化チェック</h3>
                  <p className="text-gray-600 mb-4">
                    進化条件を満たしているかチェックします
                  </p>
                  <button
                    onClick={() => setShowEvolutionConfirm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    🔍 進化条件チェック
                  </button>
                </div>
              </div>

              {/* 栄冠ナイン式ステータスゲージシステム */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎮 栄冠ナイン式成長システム</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 成長効率表示 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">📊 成長効率</h4>
                    {player.growth_efficiency && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">サーブ練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.serve_skill_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">リターン練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.return_skill_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ボレー練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.volley_skill_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ストローク練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.stroke_skill_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">メンタル練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.mental_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">スタミナ練習:</span>
                          <span className="text-sm font-medium">
                            {(player.growth_efficiency.stamina_efficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ステータスゲージ表示 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">⚡ 成長ゲージ</h4>
                    {player.stat_gages && (
                      <div className="space-y-3">
                        {Object.entries(player.stat_gages).map(([gageKey, gageValue]) => {
                          const skillName = gageKey.replace('_gage', '').replace(/_/g, ' ');
                          const skillDisplayName = skillName.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
                          
                          return (
                            <div key={gageKey} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{skillDisplayName}:</span>
                                <span className="text-sm font-medium">{gageValue}/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${gageValue}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>栄冠ナイン式システム:</strong> 練習でゲージが蓄積され、ゲージが満タンになるとステータスが1上昇します。
                    初期状態では成長効率が非常に低く、設備投資により徐々に向上していきます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 個体値ジャッジタブ */}
          {activeTab === 'judge' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">🔍 個体値ジャッジ</h3>
                  {!pokemonStats.iv_judge_unlocked && (
                    <button
                      onClick={unlockAllIVs}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      🔓 すべて解放（デバッグ）
                    </button>
                  )}
                </div>

                {pokemonStats.iv_judge_unlocked ? (
                  <div>
                    <div className="mb-6 text-center">
                      <div className="text-lg font-semibold mb-2">
                        {getIVRank().judge_comment}
                      </div>
                      <div className="flex justify-center space-x-4 text-sm">
                        <span>合計個体値: <span className="font-bold">{getIVRank().total_ivs}/186</span></span>
                        <span>完璧な能力: <span className="font-bold">{getIVRank().perfect_ivs}個</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries({
                        'HP': pokemonStats.individual_values.hp,
                        '攻撃': pokemonStats.individual_values.attack,
                        '防御': pokemonStats.individual_values.defense,
                        '特攻': pokemonStats.individual_values.sp_attack,
                        '特防': pokemonStats.individual_values.sp_defense,
                        '素早': pokemonStats.individual_values.speed
                      }).map(([name, value]) => (
                        <div key={name} className={`p-3 rounded-lg text-center ${value === 31 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white border border-gray-200'}`}>
                          <div className="font-semibold text-gray-700">{name}</div>
                          <div className={`text-2xl font-bold ${value === 31 ? 'text-yellow-600' : value >= 25 ? 'text-blue-600' : value >= 15 ? 'text-green-600' : 'text-gray-600'}`}>
                            {value}
                          </div>
                          {value === 31 && <div className="text-xs text-yellow-600">★ 完璧</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">個体値の詳細を確認するには、特定の条件を満たす必要があります。</p>
                    <div className="text-sm text-gray-500">
                      <p>• レベル20以上で一部解放</p>
                      <p>• 10試合以上で追加解放</p>
                      <p>• 個体値ジャッジャーに相談（未実装）</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 特性・性格タブ */}
          {activeTab === 'ability' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 特性情報 */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">✨ ポケモン特性</h3>
                  {(() => {
                    if (!pokemonStats.ability) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">特性データがありません</p>
                          <p className="text-sm text-gray-500">旧システムで生成された可能性があります</p>
                        </div>
                      );
                    }
                    
                    const abilityData = getAbilityData(pokemonStats.ability);
                    if (!abilityData) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">不明な特性: {pokemonStats.ability}</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div>
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-cyan-700 mb-2">
                            {abilityData.name}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {abilityData.description}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-700 mb-3">🎾 テニス効果</h4>
                          <div className="space-y-2 text-sm">
                            {abilityData.tennis_effect.serve_boost && (
                              <div className="flex justify-between">
                                <span>サーブ力:</span>
                                <span className="text-red-600 font-semibold">+{abilityData.tennis_effect.serve_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.return_boost && (
                              <div className="flex justify-between">
                                <span>リターン力:</span>
                                <span className="text-blue-600 font-semibold">+{abilityData.tennis_effect.return_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.volley_boost && (
                              <div className="flex justify-between">
                                <span>ボレー力:</span>
                                <span className="text-green-600 font-semibold">+{abilityData.tennis_effect.volley_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.stroke_boost && (
                              <div className="flex justify-between">
                                <span>ストローク力:</span>
                                <span className="text-purple-600 font-semibold">+{abilityData.tennis_effect.stroke_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.mental_boost && (
                              <div className="flex justify-between">
                                <span>メンタル力:</span>
                                <span className="text-orange-600 font-semibold">+{abilityData.tennis_effect.mental_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.stamina_boost && (
                              <div className="flex justify-between">
                                <span>スタミナ:</span>
                                <span className="text-indigo-600 font-semibold">+{abilityData.tennis_effect.stamina_boost}</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.critical_rate && (
                              <div className="flex justify-between">
                                <span>クリティカル率:</span>
                                <span className="text-yellow-600 font-semibold">+{(abilityData.tennis_effect.critical_rate * 100).toFixed(1)}%</span>
                              </div>
                            )}
                            {abilityData.tennis_effect.condition_immunity && abilityData.tennis_effect.condition_immunity.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-xs text-gray-500">状態異常耐性:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {abilityData.tennis_effect.condition_immunity.map(condition => (
                                    <span key={condition} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {abilityData.tennis_effect.special_trigger && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-xs text-gray-500">発動タイミング: </span>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  {abilityData.tennis_effect.special_trigger === 'passive' ? 'パッシブ' :
                                   abilityData.tennis_effect.special_trigger === 'on_serve' ? 'サーブ時' :
                                   abilityData.tennis_effect.special_trigger === 'on_return' ? 'リターン時' :
                                   abilityData.tennis_effect.special_trigger === 'on_critical' ? 'ピンチ時' : 
                                   abilityData.tennis_effect.special_trigger}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 性格詳細情報 */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🎭 性格・補正</h3>
                  <div className="mb-4">
                    <div className={`text-2xl font-bold mb-2 ${getNatureColor(pokemonStats.nature)}`}>
                      {pokemonStats.nature}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      性格により特定の能力値に補正がかかります
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">📊 能力補正</h4>
                    {(() => {
                      const natureEffects = {
                        // 攻撃系
                        'いじっぱり': { up: 'サーブ力', down: 'ボレー力' },
                        'やんちゃ': { up: 'サーブ力', down: 'ストローク力' },
                        'ゆうかん': { up: 'サーブ力', down: 'スタミナ' },
                        'さみしがり': { up: 'サーブ力', down: 'リターン力' },
                        // 防御系
                        'ずぶとい': { up: 'リターン力', down: 'サーブ力' },
                        'わんぱく': { up: 'リターン力', down: 'ボレー力' },
                        'のうてんき': { up: 'リターン力', down: 'ストローク力' },
                        'のんき': { up: 'リターン力', down: 'スタミナ' },
                        // 特攻系
                        'ひかえめ': { up: 'ボレー力', down: 'サーブ力' },
                        'おっとり': { up: 'ボレー力', down: 'リターン力' },
                        'うっかりや': { up: 'ボレー力', down: 'ストローク力' },
                        'れいせい': { up: 'ボレー力', down: 'スタミナ' },
                        // 特防系
                        'おだやか': { up: 'ストローク力', down: 'サーブ力' },
                        'おとなしい': { up: 'ストローク力', down: 'リターン力' },
                        'しんちょう': { up: 'ストローク力', down: 'ボレー力' },
                        'なまいき': { up: 'ストローク力', down: 'スタミナ' },
                        // 素早さ系
                        'ようき': { up: 'スタミナ', down: 'ボレー力' },
                        'むじゃき': { up: 'スタミナ', down: 'ストローク力' },
                        'せっかち': { up: 'スタミナ', down: 'リターン力' },
                        'おくびょう': { up: 'スタミナ', down: 'サーブ力' },
                      };
                      
                      const effect = natureEffects[pokemonStats.nature as keyof typeof natureEffects];
                      
                      if (!effect) {
                        return (
                          <div className="text-center py-4">
                            <div className="text-gray-600 mb-2">📊 バランス型</div>
                            <p className="text-sm text-gray-500">すべての能力値が等しく成長します</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">🔺 {effect.up}:</span>
                            <span className="text-green-600 font-bold">+10% (×1.1)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">🔻 {effect.down}:</span>
                            <span className="text-red-600 font-bold">-10% (×0.9)</span>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">
                              💡 性格補正は最終能力値に適用され、レベルアップ時の成長にも影響します
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステータスゲージ専用タブ */}
          {activeTab === 'gage' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🎮 栄冠ナイン式成長システム</h3>
                
                {/* 成長効率サマリー */}
                <div className="bg-white rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">📊 現在の成長効率</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {player.growth_efficiency && Object.entries(player.growth_efficiency).map(([key, value]) => {
                      const skillName = key.replace('_efficiency', '').replace(/_/g, ' ');
                      const displayName = skillName.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      
                      let efficiencyColor = 'text-gray-500';
                      if (value >= 1.5) efficiencyColor = 'text-green-600';
                      else if (value >= 1.0) efficiencyColor = 'text-blue-600';
                      else if (value >= 0.6) efficiencyColor = 'text-yellow-600';
                      else if (value >= 0.3) efficiencyColor = 'text-orange-600';
                      else efficiencyColor = 'text-red-600';
                      
                      return (
                        <div key={key} className="text-center">
                          <div className={`text-lg font-bold ${efficiencyColor}`}>
                            {(value * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">{displayName}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ステータスゲージ詳細 */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">⚡ 各スキルの成長ゲージ</h4>
                  <div className="space-y-4">
                    {player.stat_gages && Object.entries(player.stat_gages).map(([gageKey, gageValue]) => {
                      const skillName = gageKey.replace('_gage', '').replace(/_/g, ' ');
                      const skillDisplayName = skillName.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      
                      const currentStat = player[skillName.replace(/_/g, '') as keyof Pick<Player, 'serve_skill' | 'return_skill' | 'volley_skill' | 'stroke_skill' | 'mental' | 'stamina'>] || 0;
                      
                      return (
                        <div key={gageKey} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">{skillDisplayName}</span>
                            <span className="text-sm text-gray-500">
                              現在: {currentStat} | ゲージ: {gageValue}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${gageValue}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {gageValue >= 100 ? '🎉 ゲージ満タン！ステータス上昇可能' : '練習を続けてゲージをためよう'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 進化確認モーダル */}
      {showEvolutionConfirm && (() => {
        const evolutionInfo = getEvolutionInfo(pokemonStats.pokemon_id);
        if (!evolutionInfo) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  進化確認
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-center items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700">
                        {pokemonStats.pokemon_name}
                      </div>
                      <div className="text-sm text-gray-500">Lv.{pokemonStats.level}</div>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-700">
                        {evolutionInfo.evolve_name}
                      </div>
                      <div className="text-sm text-gray-500">Lv.{pokemonStats.level}</div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ 注意:</strong> 進化は取り消せません。<br/>
                      種族値が向上し、より強力になります！
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEvolutionConfirm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      setShowEvolutionConfirm(false);
                      handleEvolve();
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    🌟 進化させる！
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 努力値トレーナーモーダル */}
      {showEVTrainer && (
        <EffortValueTrainer
          pokemonStats={pokemonStats}
          onClose={() => setShowEVTrainer(false)}
          onApply={handleEVUpdate}
        />
      )}
    </div>
  );
}