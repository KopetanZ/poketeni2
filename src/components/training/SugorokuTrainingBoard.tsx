'use client';

import { useMemo, useState } from 'react';
import { CardRarity } from '@/types/training-cards';
import { MANAGER_IMAGE_PATHS, MANAGER_TIPS } from '@/lib/manager-assets';
import { SQUARE_EFFECTS } from '@/lib/calendar-system';
import { CalendarDay } from '@/types/calendar';

interface BoardCard {
  id: string;
  name: string;
  number: number;
  rarity: CardRarity;
  description: string;
  trainingEffects: Record<string, number>;
}

interface SugorokuTrainingBoardProps {
  cards: BoardCard[];
  onCardUse: (cardId: string) => void;
  isLoading?: boolean;
  currentProgress?: number; // 現在の進行度（日数）
  specialEvents?: SpecialEvent[];
  peekDays: CalendarDay[]; // 現在からの先読み日付（左から現在日）
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
  specialEvents = [],
  peekDays
}: SugorokuTrainingBoardProps) {
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [hoverCard, setHoverCard] = useState<BoardCard | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<SpecialEvent | null>(null);

  // 上部に横カレンダートラック（2週間=14日ぶん表示）
  const visibleTrackCount = 14;
  const baseCycle = 24; // カレンダー上の1周=24（内部ロジック用）
  const boardSpaces = Array.from({ length: visibleTrackCount }, (_, i) => i);

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
  const currentPosition = currentProgress % baseCycle;

  // マネージャー表示（画像・Tipsをランダム）
  const manager = useMemo(() => {
    const idx = Math.floor(Math.random() * MANAGER_IMAGE_PATHS.length);
    const tipIdx = Math.floor(Math.random() * MANAGER_TIPS.length);
    return { img: MANAGER_IMAGE_PATHS[idx], tip: MANAGER_TIPS[tipIdx] };
  }, [currentProgress]);

  return (
    <div className="h-full flex flex-col">
      {/* タイトルバー */}
      <div className="flex justify-between items-center mb-4">
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

      {/* 本体レイアウト */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* 上部：横カレンダートラック（2週表示、マスを大きく） */}
        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-4 border border-slate-600/50">
          <div className="overflow-hidden">
            <div className="flex gap-3">
              {boardSpaces.map((offset) => {
                const day = peekDays[offset];
                const index = (currentPosition + offset) % baseCycle;
                const spaceNumber = day ? day.day : (index + 1);
                const isCurrent = offset === 0;
                const isNext = selectedCard && offset === selectedCard.number;
                const specialEvent = getEventAtPosition(index);

                // マス色を SQUARE_EFFECTS に合わせる
                const squareType = day?.square || 'white';
                const squareStyle = {
                  blue: 'from-blue-400 to-blue-600 border-blue-300',
                  red: 'from-red-400 to-red-600 border-red-300',
                  white: 'from-slate-500 to-slate-600 border-slate-400',
                  green: 'from-emerald-400 to-emerald-600 border-emerald-300',
                  yellow: 'from-amber-400 to-amber-500 border-amber-300'
                } as const;
                const baseClass = `bg-gradient-to-br ${squareStyle[squareType as keyof typeof squareStyle] || 'from-slate-600 to-slate-700 border-slate-500'}`;

                return (
                  <div
                    key={`${currentPosition}-${offset}`}
                    className={`relative w-14 h-14 min-w-14 rounded-md border-2 flex items-center justify-center text-sm font-bold transition-all ${baseClass}
                    ${isCurrent ? 'ring-2 ring-yellow-300 shadow-yellow-500/40 shadow-lg animate-pulse' : ''}
                    ${isNext ? 'ring-2 ring-purple-300 shadow-purple-500/40 shadow-lg' : ''}`}
                    onClick={() => specialEvent && setShowEventDetails(specialEvent)}
                    title={specialEvent ? specialEvent.name : ''}
                  >
                    <span className={`text-white drop-shadow`}>{spaceNumber}</span>
                    {specialEvent && (
                      <div className="absolute -top-2 -right-2 text-base">{specialEvent.type === 'shop' ? '🏪' : specialEvent.type === 'bonus' ? '🎾' : specialEvent.type === 'evolution' ? '✨' : '⚔️'}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {selectedCard && (
            <div className="mt-3 text-center">
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg px-3 py-2 inline-block text-blue-300 text-sm">
                📍 {selectedCard.name}使用で {selectedCard.number}マス進みます
              </div>
            </div>
          )}
        </div>

        {/* 中段：左に練習コートの簡易アニメ、右にマネージャー */}
        <div className="flex gap-4">
          {/* 左：テニスコート背景にラリー風アニメ（プレースホルダ画像と部員アイコン） */}
          <div className="flex-1 bg-[url('/img/window.svg')] bg-cover bg-center rounded-2xl border border-slate-600/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-900/40" />
            {/* コート線の簡易表現 */}
            <div className="absolute inset-6 border-2 border-white/30 rounded-xl" />
            {/* 部員（簡易）：左右にアバター（丸+画像） */}
            <div className="absolute left-8 bottom-8 w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/60 shadow-xl bg-white/20">
              <img src="/img/mgr/ChatGPT Image 202587 12_34_08.png" alt="player-left" className="w-full h-full object-cover" />
            </div>
            <div className="absolute right-8 top-8 w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/60 shadow-xl bg-white/20">
              <img src="/img/mgr/ChatGPT Image 202587 12_40_09.png" alt="player-right" className="w-full h-full object-cover" />
            </div>
            {/* ボールの軌道（バウンド） */}
            <div className="absolute inset-0">
              <div className="absolute left-14 top-1/2 -mt-1 w-3 h-3 bg-yellow-300 rounded-full shadow animate-[teniball_1.6s_ease-in-out_infinite]" />
            </div>
            <style jsx>{`
              @keyframes teniball {
                0%   { transform: translate(0, 0) scale(1); }
                25%  { transform: translate(45%, -55%) scale(0.9); }
                30%  { transform: translate(50%, -60%) scale(0.9); }
                50%  { transform: translate(160%, -10%) scale(1.05); }
                55%  { transform: translate(165%, 0) scale(0.9); } /* バウンド */
                75%  { transform: translate(240%, 50%) scale(1.05); }
                100% { transform: translate(0, 0) scale(1); }
              }
            `}</style>
            <div className="p-3 absolute bottom-2 left-2 text-xs text-white/80">演出ダミー（後で差し替え可）</div>
          </div>
          <div className="w-72 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-4 border border-slate-600/50">
            <div className="flex flex-col items-center text-center gap-3">
              <img src={manager.img} alt="manager" className="w-40 h-40 object-contain rounded-xl shadow" />
              <div className="text-slate-200 text-sm">{manager.tip}</div>
            </div>
          </div>
        </div>

        {/* 下部：横並び手札 */}
        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-4 border border-slate-600/50">
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🃏 練習を選択</h3>
            <button
              onClick={() => selectedCard && onCardUse(selectedCard.id)}
              disabled={!selectedCard || isLoading}
              className={`${!selectedCard || isLoading ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:scale-105'}
                px-4 py-2 rounded-lg font-bold transition-all`}
            >
              {isLoading ? '進行中...' : selectedCard ? `${selectedCard.name} を実行` : 'カードを選択' }
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600/60 pb-1">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`relative min-w-[220px] w-[220px] bg-gradient-to-br ${getCardColor(card.rarity)} rounded-xl p-4 cursor-pointer border-2 transform transition-all duration-200
                  ${selectedCard?.id === card.id ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-500/25' : 'border-transparent hover:scale-102 hover:shadow-lg'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isLoading) return;
                  setSelectedCard(selectedCard?.id === card.id ? null : card);
                }}
                onMouseEnter={() => setHoverCard(card)}
                onMouseLeave={() => setHoverCard(null)}
                title={card.description}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">{card.name}</h4>
                  <div className="bg-white/20 rounded px-2 py-1">
                    <span className="text-xs text-white font-semibold uppercase">{card.rarity}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="bg-white/20 rounded-full px-3 py-1">
                    <span className="text-white font-bold text-lg">{card.number}日</span>
                  </div>
                  <div className="text-xs text-white/90 line-clamp-1 ml-2">{card.description}</div>
                </div>
                {Object.keys(card.trainingEffects).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(card.trainingEffects).slice(0, 3).map(([skill, value]) => (
                      <span key={skill} className="bg-white/20 text-white text-xs px-2 py-1 rounded">{skill}+{value}</span>
                    ))}
                  </div>
                )}
                {selectedCard?.id === card.id && (
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-300 font-bold">選択中</span>
                  </div>
                )}
              </div>
            ))}
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