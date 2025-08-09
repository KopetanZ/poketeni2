'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import { EvolutionSystem } from '@/lib/evolution-system';
import { EvolutionModal } from './EvolutionModal';
import { Sparkles, TrendingUp, Award, ArrowUp } from 'lucide-react';

interface EvolutionOverviewProps {
  players: Player[];
  onPlayerUpdate: (updatedPlayer: Player) => void;
}

export function EvolutionOverview({ players, onPlayerUpdate }: EvolutionOverviewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);

  const evolvablePlayers = EvolutionSystem.getEvolvablePlayers(players);
  const statistics = EvolutionSystem.getEvolutionStatistics(players);

  const handleEvolutionClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowEvolutionModal(true);
  };

  const handleEvolutionComplete = (evolvedPlayer: Player) => {
    onPlayerUpdate(evolvedPlayer);
    setShowEvolutionModal(false);
    setSelectedPlayer(null);
  };

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">総選手数</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <Award className="text-blue-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">進化可能</p>
              <p className="text-2xl font-bold">{statistics.canEvolve}</p>
            </div>
            <Sparkles className="text-green-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">最高レベル</p>
              <p className="text-2xl font-bold">{statistics.maxLevel}</p>
            </div>
            <TrendingUp className="text-purple-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">平均レベル</p>
              <p className="text-2xl font-bold">{statistics.averageLevel}</p>
            </div>
            <ArrowUp className="text-orange-200" size={32} />
          </div>
        </div>
      </div>

      {/* 進化可能なポケモン一覧 */}
      {evolvablePlayers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-500" />
            進化可能なポケモン ({evolvablePlayers.length}匹)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evolvablePlayers.map((player) => {
              const evaluation = EvolutionSystem.canEvolve(player);
              const evolutionPath = evaluation.paths[0];
              
              return (
                <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{player.pokemon_name}</h4>
                      <p className="text-sm text-gray-600">
                        レベル {player.level} • {player.position === 'captain' ? 'キャプテン' : 
                                                   player.position === 'vice_captain' ? '副キャプテン' :
                                                   player.position === 'regular' ? 'レギュラー' : '部員'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">進化後</div>
                      <div className="font-medium text-green-600">{evolutionPath?.to}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">サーブ</span>
                      <span className="font-medium">{player.serve_skill}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">リターン</span>
                      <span className="font-medium">{player.return_skill}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ボレー</span>
                      <span className="font-medium">{player.volley_skill}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEvolutionClick(player)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    進化させる
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 進化履歴・全選手一覧 */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          全選手進化状況
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ポケモン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レベル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ポジション
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進化状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => {
                  const evaluation = EvolutionSystem.canEvolve(player);
                  const evolutionPlan = EvolutionSystem.getEvolutionPlan(player);
                  
                  return (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {player.pokemon_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {player.types?.join('・') || 'なし'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.position === 'captain' ? 'キャプテン' : 
                         player.position === 'vice_captain' ? '副キャプテン' :
                         player.position === 'regular' ? 'レギュラー' : '部員'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.canEvolve ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Sparkles size={12} className="mr-1" />
                            進化可能
                          </span>
                        ) : evolutionPlan.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            進化可能性あり
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            最終形態
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {evaluation.canEvolve ? (
                          <button
                            onClick={() => handleEvolutionClick(player)}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
                          >
                            <Sparkles size={14} />
                            進化
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 進化モーダル */}
      {selectedPlayer && (
        <EvolutionModal
          player={selectedPlayer}
          isOpen={showEvolutionModal}
          onClose={() => {
            setShowEvolutionModal(false);
            setSelectedPlayer(null);
          }}
          onEvolutionComplete={handleEvolutionComplete}
        />
      )}
    </div>
  );
}