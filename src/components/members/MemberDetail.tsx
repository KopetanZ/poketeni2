'use client';

import React from 'react';
import { Player } from '@/types/game';
import PokemonCard from '@/components/PokemonCard';
import SpecialAbilityDisplay from '@/components/SpecialAbilityDisplay';

interface MemberDetailProps {
  player: Player;
  onClose: () => void;
}

export const MemberDetail: React.FC<MemberDetailProps> = ({ player, onClose }) => {
  // 能力値の色分け取得
  const getStatColor = (value: number): string => {
    if (value >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (value >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (value >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (value >= 20) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // 能力値の評価取得
  const getStatRating = (value: number): string => {
    if (value >= 80) return 'S';
    if (value >= 60) return 'A';
    if (value >= 40) return 'B';
    if (value >= 20) return 'C';
    return 'D';
  };

  // ポジション表示
  const getPositionInfo = (position: string) => {
    const positions = {
      'captain': { name: '部長', icon: '👑', color: 'bg-yellow-100 text-yellow-800' },
      'vice_captain': { name: '副部長', icon: '⭐', color: 'bg-purple-100 text-purple-800' },
      'regular': { name: 'レギュラー', icon: '🎾', color: 'bg-green-100 text-green-800' },
      'member': { name: '部員', icon: '📝', color: 'bg-gray-100 text-gray-800' }
    };
    return positions[position as keyof typeof positions] || positions.member;
  };

  const positionInfo = getPositionInfo(player.position);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16">
                <PokemonCard 
                  player={player} 
                  size="small"
                  showStats={false}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{player.pokemon_name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${positionInfo.color}`}>
                    {positionInfo.icon} {positionInfo.name}
                  </span>
                  <span className="text-blue-100">
                    {player.grade}年生 | Lv.{player.level}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* 左側：基礎能力 */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              📊 基礎能力
            </h2>
            
            <div className="space-y-4">
              {/* テニス技術 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">テニス技術</h3>
                <div className="space-y-3">
                  {[
                    { name: 'サーブ', value: player.serve_skill, icon: '🎾' },
                    { name: 'リターン', value: player.return_skill, icon: '↩️' },
                    { name: 'ボレー', value: player.volley_skill, icon: '🏐' },
                    { name: 'ストローク', value: player.stroke_skill, icon: '🎯' }
                  ].map((stat) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{stat.icon}</span>
                        <span className="font-medium w-20">{stat.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(stat.value / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-1 rounded border text-sm font-bold min-w-[3rem] text-center ${getStatColor(stat.value)}`}>
                          {stat.value}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatColor(stat.value)}`}>
                          {getStatRating(stat.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* フィジカル・メンタル */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">フィジカル・メンタル</h3>
                <div className="space-y-3">
                  {[
                    { name: 'メンタル', value: player.mental, icon: '🧠' },
                    { name: 'スタミナ', value: player.stamina, icon: '💪' }
                  ].map((stat) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{stat.icon}</span>
                        <span className="font-medium w-20">{stat.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(stat.value / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-1 rounded border text-sm font-bold min-w-[3rem] text-center ${getStatColor(stat.value)}`}>
                          {stat.value}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatColor(stat.value)}`}>
                          {getStatRating(stat.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* その他の情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">状態・経験</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-700 font-medium text-sm">コンディション</div>
                    <div className="text-blue-900 font-bold">{player.condition}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-700 font-medium text-sm">やる気</div>
                    <div className="text-green-900 font-bold">{player.motivation}%</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-700 font-medium text-sm">経験値</div>
                    <div className="text-purple-900 font-bold">{player.experience}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-yellow-700 font-medium text-sm">試合出場</div>
                    <div className="text-yellow-900 font-bold">{player.matches_played || 0}回</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：特殊能力 */}
          <div className="w-1/2 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">⭐ 特殊能力</h2>
            <div className="space-y-4">
              {player.special_abilities && player.special_abilities.length > 0 ? (
                <div className="bg-white p-4 rounded-lg border">
                  <SpecialAbilityDisplay 
                    abilities={player.special_abilities}
                    showDescription={true}
                    size="medium"
                    layout="vertical"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                  <div className="text-3xl mb-2">🌟</div>
                  <p className="font-medium mb-1">まだ特殊能力はありません</p>
                  <p className="text-xs">イベントや成長で新しい能力を習得できます</p>
                </div>
              )}

              {/* ポケモン固有情報 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">ポケモン情報</h3>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-purple-800">タイプ</span>
                    <div className="flex space-x-2">
                      {player.types?.map(type => (
                        <span 
                          key={type}
                          className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-sm font-bold uppercase"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  {player.pokemon_stats && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">性格:</span>
                        <span className="font-medium text-purple-900">{player.pokemon_stats.nature}</span>
                      </div>
                      {player.pokemon_stats.is_shiny && (
                        <div className="flex justify-between">
                          <span className="text-purple-700">特別:</span>
                          <span className="font-medium text-yellow-600">✨ 色違い</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;