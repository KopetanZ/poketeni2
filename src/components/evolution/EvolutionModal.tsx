'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import { EvolutionSystem } from '@/lib/evolution-system';
import { EvolutionResult } from '@/types/evolution';
import { PokemonCard } from '@/components/PokemonCard';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface EvolutionModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onEvolutionComplete: (evolvedPlayer: Player) => void;
}

export function EvolutionModal({ player, isOpen, onClose, onEvolutionComplete }: EvolutionModalProps) {
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);

  if (!isOpen) return null;

  const evaluation = EvolutionSystem.canEvolve(player);

  const handleEvolve = async () => {
    if (!evaluation.canEvolve) return;

    setIsEvolving(true);
    
    // 進化アニメーション用の遅延
    setTimeout(async () => {
      const result = await EvolutionSystem.evolvePlayer(player);
      setEvolutionResult(result);
      
      if (result.success && result.newPokemon) {
        // さらに遅延してから完了処理
        setTimeout(() => {
          onEvolutionComplete(result.newPokemon!);
          onClose();
          setIsEvolving(false);
          setEvolutionResult(null);
        }, 2000);
      } else {
        setIsEvolving(false);
      }
    }, 1000);
  };

  const evolutionPlan = EvolutionSystem.getEvolutionPlan(player);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-yellow-500" />
            ポケモン進化
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isEvolving}
          >
            <X size={24} />
          </button>
        </div>

        {/* 進化中アニメーション */}
        {isEvolving && (
          <div className="p-8 text-center">
            <div className="animate-pulse">
              <Sparkles size={64} className="text-yellow-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {player.pokemon_name}が進化しています...
              </h3>
              <div className="flex justify-center items-center space-x-4 mt-6">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        )}

        {/* 進化結果表示 */}
        {evolutionResult && (
          <div className="p-8 text-center">
            {evolutionResult.success ? (
              <div className="space-y-4">
                <Sparkles size={48} className="text-yellow-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-bold text-green-600">
                  進化成功！
                </h3>
                <p className="text-gray-700 text-lg">
                  {evolutionResult.message}
                </p>
                {evolutionResult.newPokemon && (
                  <div className="flex justify-center mt-6">
                    <PokemonCard 
                      player={evolutionResult.newPokemon} 
                      showStats={true}
                      size="large"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-red-500 text-xl font-bold">
                  進化に失敗しました
                </div>
                <p className="text-gray-700">
                  {evolutionResult.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 通常の進化画面 */}
        {!isEvolving && !evolutionResult && (
          <div className="p-6 space-y-6">
            {/* 現在のポケモン情報 */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                現在のポケモン
              </h3>
              <div className="flex justify-center">
                <PokemonCard 
                  player={player} 
                  showStats={true}
                  size="medium"
                />
              </div>
            </div>

            {/* 進化可能性チェック */}
            {evaluation.canEvolve ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-4 mb-4">
                    <div className="text-lg font-medium text-gray-800">
                      {player.pokemon_name}
                    </div>
                    <ArrowRight className="text-green-500" size={24} />
                    <div className="text-lg font-medium text-green-600">
                      {evaluation.paths[0]?.to}
                    </div>
                  </div>
                </div>

                {/* 進化条件 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">進化条件</h4>
                  <ul className="space-y-1">
                    {evaluation.paths[0]?.requirements.map((req, index) => (
                      <li key={index} className="text-green-700 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {req.description}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 進化ボタン */}
                <div className="text-center">
                  <button
                    onClick={handleEvolve}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <Sparkles size={20} />
                    進化させる
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">進化できない理由</h4>
                  <ul className="space-y-1">
                    {evaluation.blockers.map((blocker, index) => (
                      <li key={index} className="text-red-700 flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 進化予定表 */}
            {evolutionPlan.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">進化予定</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {evolutionPlan.map((evolution, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="font-medium text-gray-800">
                          第{evolution.stage}形態: {evolution.pokemon}
                        </div>
                        <div className="text-sm text-gray-600">
                          レベル{evolution.level}で進化
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}