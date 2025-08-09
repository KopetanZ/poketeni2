'use client';

import { useState } from 'react';
import { TrainingCard } from '@/types/game';

interface SugorokuTrainingBoardProps {
  cards: TrainingCard[];
  onCardUse: (cardId: string) => void;
  isLoading?: boolean;
  currentProgress?: number; // 現在の進行度（日数）
  specialEvents?: SpecialEvent[];
}

interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  position: number;
  type: 'bonus' | 'challenge' | 'shop' | 'evolution';
  reward?: {
    skill_boosts?: Record<string, number>;
    items?: string[];
    experience?: number;
  };
}

export default function SugorokuTrainingBoard({ 
  cards, 
  onCardUse, 
  isLoading = false,
  currentProgress = 0,
  specialEvents = []
}: SugorokuTrainingBoardProps) {
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [hoverCard, setHoverCard] = useState<TrainingCard | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<SpecialEvent | null>(null);

  // すごろく盤のマス目（24マス、4x6グリッド）
  const boardSpaces = Array.from({ length: 24 }, (_, i) => i + 1);

  // デフォルトの特別イベント生成
  const defaultEvents: SpecialEvent[] = [
    {
      id: 'shop_6',
      name: '🏪 ポケテニショップ',
      description: 'アイテムを購入して能力アップ！',
      position: 6,
      type: 'shop',
      reward: { items: ['energy_drink', 'protein'] }
    },
    {
      id: 'bonus_12',
      name: '🎾 特別練習',
      description: '集中トレーニングで大幅成長！',
      position: 12,
      type: 'bonus',
      reward: { skill_boosts: { serve_skill: 5, mental: 3 }, experience: 50 }
    },
    {
      id: 'evolution_18',
      name: '✨ 進化チャンス',
      description: 'ポケモンが進化できるかも？',
      position: 18,
      type: 'evolution',
      reward: { experience: 100 }
    },
    {
      id: 'challenge_24',
      name: '⚔️ 強化試合',
      description: 'ライバル校との練習試合！',
      position: 0, // 24 -> 0 (一周回った位置)
      type: 'challenge',
      reward: { skill_boosts: { return_skill: 4, volley_skill: 4 }, experience: 80 }
    }
  ];

  const allEvents = [...specialEvents, ...defaultEvents];

  // 特定位置のイベント取得
  const getEventAtPosition = (position: number): SpecialEvent | null => {
    return allEvents.find(event => event.position === position) || null;
  };

  // カードの希少度による色設定
  const getCardColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'uncommon':
        return 'from-green-400 to-green-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'legendary':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // 現在位置の計算（進行度に基づく）
  const currentPosition = currentProgress % 24;

  return (
    <div className="h-full flex flex-col">
      {/* タイトルバー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          🎲 練習すごろく
          <span className="ml-4 text-lg text-slate-300">
            現在: {currentProgress + 1}日目
          </span>
        </h2>
        <div className="text-sm text-slate-400">
          練習カード: {cards.length}枚保有
        </div>
      </div>

      <div className="flex-1 flex space-x-6">
        {/* 左側：すごろく盤 */}
        <div className="flex-1 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">🏫 練習フィールド</h3>
              <div className="text-sm text-slate-300">カードを使って前進しよう！</div>
            </div>

            {/* すごろく盤（6x4グリッド） */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-6 gap-3 max-w-3xl mx-auto">
                {boardSpaces.map((space, index) => {
                  const isCurrentPosition = index === currentPosition;
                  const isNextPosition = selectedCard && (index === (currentPosition + selectedCard.number) % 24);
                  const specialEvent = getEventAtPosition(index);
                  
                  return (
                    <div
                      key={space}
                      className={`
                        relative aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer
                        ${isCurrentPosition 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg shadow-yellow-500/50 animate-pulse' 
                          : isNextPosition
                          ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 shadow-lg shadow-blue-500/50'
                          : specialEvent
                          ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-300 hover:scale-105'
                          : 'bg-slate-600/50 border-slate-500 hover:bg-slate-500/50'
                        }
                      `}
                      onClick={() => specialEvent && setShowEventDetails(specialEvent)}
                    >
                      <span className={`text-xs ${isCurrentPosition ? 'text-white' : isNextPosition ? 'text-white' : specialEvent ? 'text-white' : 'text-slate-300'}`}>
                        {space}
                      </span>
                      
                      {/* 現在位置のマーカー */}
                      {isCurrentPosition && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🎾</span>
                        </div>
                      )}
                      
                      {/* 予測位置のマーカー */}
                      {isNextPosition && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">?</span>
                        </div>
                      )}
                      
                      {/* 特殊イベントマス */}
                      {specialEvent && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-lg">
                            {specialEvent.type === 'shop' ? '🏪' :
                             specialEvent.type === 'bonus' ? '🎾' :
                             specialEvent.type === 'evolution' ? '✨' :
                             specialEvent.type === 'challenge' ? '⚔️' : '🎲'}
                          </div>
                        </div>
                      )}
                      
                      {/* レガシー：6の倍数マス */}
                      {!specialEvent && space % 6 === 0 && (
                        <div className="absolute -bottom-1 left-0 right-0 text-center">
                          <div className="bg-purple-500 text-white text-xs px-1 rounded">
                            イベント
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 進行予測表示 */}
              {selectedCard && (
                <div className="mt-4 text-center">
                  <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3 inline-block">
                    <span className="text-blue-300 text-sm">
                      📍 {selectedCard.name}使用で {selectedCard.number}マス進みます
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：カード手札 */}
        <div className="w-80 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              🃏 練習カード手札
            </h3>
            
            {/* カード一覧（固定高さ、スクロールなし） */}
            <div className="flex-1 space-y-3 overflow-hidden">
              {cards.slice(0, 4).map((card, index) => (
                <div
                  key={card.id}
                  className={`
                    relative bg-gradient-to-br ${getCardColor(card.rarity)} rounded-xl p-4 cursor-pointer
                    transform transition-all duration-200 border-2
                    ${selectedCard?.id === card.id 
                      ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-500/25' 
                      : 'border-transparent hover:scale-102 hover:shadow-lg'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !isLoading && setSelectedCard(selectedCard?.id === card.id ? null : card)}
                  onMouseEnter={() => setHoverCard(card)}
                  onMouseLeave={() => setHoverCard(null)}
                >
                  {/* カード名とレアリティ */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm leading-tight">{card.name}</h4>
                    <div className="bg-white/20 rounded px-2 py-1">
                      <span className="text-xs text-white font-semibold uppercase">
                        {card.rarity}
                      </span>
                    </div>
                  </div>

                  {/* 進行日数 */}
                  <div className="flex justify-center mb-2">
                    <div className="bg-white/20 rounded-full px-3 py-1">
                      <span className="text-white font-bold text-lg">
                        {card.number}日
                      </span>
                    </div>
                  </div>

                  {/* カード効果 */}
                  <div className="text-xs text-white/90 mb-2 line-clamp-2">
                    {card.description}
                  </div>

                  {/* 訓練効果 */}
                  {Object.keys(card.trainingEffects).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(card.trainingEffects).slice(0, 3).map(([skill, value]) => (
                        <span key={skill} className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                          {skill}+{value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 選択中のオーバーレイ */}
                  {selectedCard?.id === card.id && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <span className="text-yellow-300 font-bold">選択中</span>
                    </div>
                  )}
                </div>
              ))}

              {/* 残りカード表示 */}
              {cards.length > 4 && (
                <div className="bg-slate-600/50 rounded-xl p-4 text-center">
                  <span className="text-slate-400 text-sm">
                    他 {cards.length - 4}枚のカードがあります
                  </span>
                </div>
              )}
            </div>

            {/* 使用ボタン */}
            <div className="mt-4 pt-4 border-t border-slate-600/50">
              <button
                onClick={() => selectedCard && onCardUse(selectedCard.id)}
                disabled={!selectedCard || isLoading}
                className={`
                  w-full py-3 rounded-xl font-bold text-lg transition-all duration-200
                  ${!selectedCard || isLoading
                    ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:scale-105'
                  }
                `}
              >
                {isLoading ? '進行中...' : selectedCard ? `${selectedCard.name}を使用` : 'カードを選択してください'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* カード詳細ポップアップ */}
      {hoverCard && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-600/50 p-4 z-50 shadow-2xl min-w-80">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-lg">{hoverCard.name}</h4>
              <span className={`px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${getCardColor(hoverCard.rarity)}`}>
                {hoverCard.rarity}
              </span>
            </div>
            <div className="text-slate-300 text-sm">{hoverCard.description}</div>
            <div className="text-center">
              <span className="text-yellow-400 font-bold text-xl">📅 {hoverCard.number}日進行</span>
            </div>
            {Object.keys(hoverCard.trainingEffects).length > 0 && (
              <div>
                <div className="text-slate-400 text-sm mb-2">訓練効果:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(hoverCard.trainingEffects).map(([skill, value]) => (
                    <span key={skill} className="bg-blue-600/20 text-blue-300 text-sm px-3 py-1 rounded-full">
                      {skill}: +{value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* イベント詳細モーダル */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {showEventDetails.type === 'shop' ? '🏪' :
                     showEventDetails.type === 'bonus' ? '🎾' :
                     showEventDetails.type === 'evolution' ? '✨' :
                     showEventDetails.type === 'challenge' ? '⚔️' : '🎲'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{showEventDetails.name}</h3>
                    <div className="text-sm text-slate-400">位置: {showEventDetails.position + 1}番目のマス</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="text-slate-300 mb-4">
                {showEventDetails.description}
              </div>

              {showEventDetails.reward && (
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div className="text-yellow-400 font-semibold">🎁 イベント報酬</div>
                  
                  {showEventDetails.reward.skill_boosts && (
                    <div>
                      <div className="text-sm text-slate-400 mb-2">能力アップ:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(showEventDetails.reward.skill_boosts).map(([skill, boost]) => (
                          <span key={skill} className="bg-green-600/20 text-green-300 text-xs px-2 py-1 rounded-full">
                            {skill}: +{boost}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showEventDetails.reward.experience && (
                    <div className="text-blue-300 text-sm">
                      📈 経験値: +{showEventDetails.reward.experience}
                    </div>
                  )}
                  
                  {showEventDetails.reward.items && (
                    <div>
                      <div className="text-sm text-slate-400 mb-2">アイテム:</div>
                      <div className="flex flex-wrap gap-2">
                        {showEventDetails.reward.items.map((item, index) => (
                          <span key={index} className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  理解しました
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}